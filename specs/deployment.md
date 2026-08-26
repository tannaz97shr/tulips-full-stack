# Deployment — Tulips (Vercel + Firebase + Stripe)

## Hosting
Deployed on Vercel, connected to `tannaz97shr/tulips-full-stack`, auto-deploying
on every push to `main`. Production domain: `tulips-full-stack.vercel.app`.
Same Firebase project is used for both local dev and production — there is
no separate prod/dev Firebase split in this setup.

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | Differs from local? | Notes |
|---|---|---|
| `FIREBASE_PROJECT_ID` | No | Same Firebase project as dev |
| `FIREBASE_CLIENT_EMAIL` | No | |
| `FIREBASE_PRIVATE_KEY` | No | Paste carefully — must preserve real newlines or `\n` escapes matching how it's stored locally |
| `FIREBASE_STORAGE_BUCKET` | No | |
| `STRIPE_SECRET_KEY` | No | Test mode key, same sandbox as local dev |
| `STRIPE_WEBHOOK_SECRET` | **Yes** | Must be regenerated — see "Stripe webhook" below. The local `stripe listen` secret never applies to a real deployed endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Public by design |
| `AUTH_URL` | **Yes** | Must be the real deployed domain (`https://tulips-full-stack.vercel.app`), not `http://localhost:3000` — see gotcha below |
| `AUTH_SECRET` | Optional | Safe to reuse dev value; regenerating (`openssl rand -base64 32`) is best practice but not required |
| `AUTH_GOOGLE_ID` | No | Same OAuth client reused |
| `AUTH_GOOGLE_SECRET` | No | Same OAuth client reused |

## First-deploy gotchas (all documented in `specs/known-issues.md`, repeated here for deploy-time visibility)

1. **`AUTH_URL` must be set to the real production domain.** Vercel sets its own
   `VERCEL` env var, which makes Auth.js default `trustHost` to `true` — so
   omitting `AUTH_URL` will NOT crash the app the way local `bun run start`
   did, but it leaves OAuth redirect URLs constructed from the request's
   `Host` header rather than a pinned value. Set it explicitly regardless.
2. **Firestore composite index** (`orders`: `userId` + `createdAt`) must exist
   on whatever Firestore project serves production. This repo's
   `firestore.indexes.json`/`firebase.json` make it declarative — run
   `firebase deploy --only firestore:indexes --project <project-id>` against
   a fresh Firebase project, or click through the console link Firestore
   prints in the server log the first time `/orders` 500s with
   `FAILED_PRECONDITION`.
3. **Bun must be used for install/build**, not npm — Vercel auto-detects this
   from `bun.lock`/`bun.lockb`, confirmed via build logs (`bun install
   v1.3.14 ...` appearing right after "Installing dependencies...").

## Stripe production webhook

1. Stripe Dashboard (test mode) → Developers → Webhooks → Add endpoint.
2. URL: `https://tulips-full-stack.vercel.app/api/webhooks/stripe`
3. Events (exactly these four, per `app/api/webhooks/stripe/route.ts`):
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
4. Copy the endpoint's signing secret → Vercel `STRIPE_WEBHOOK_SECRET` →
   redeploy (env var changes require a fresh deploy to take effect).

## Google OAuth redirect URI

Google Cloud Console → APIs & Services → Credentials → the existing OAuth
client → add:
- Authorized redirect URI: `https://tulips-full-stack.vercel.app/api/auth/callback/google`
- Authorized JavaScript origin: `https://tulips-full-stack.vercel.app`

This is additive — the existing `localhost` entries remain for local dev.

## Post-deploy verification checklist

- [ ] Build log confirms `bun install`/`bun run build`, not npm
- [ ] `AUTH_URL` set to production domain, redeployed
- [ ] Stripe webhook created with the four events above, secret updated in Vercel
- [ ] Google OAuth redirect URI added
- [ ] Full smoke test: sign-up, filter/browse, cart persistence, checkout with
      Stripe test card `4242 4242 4242 4242`, order settles to `Paid`, stock
      decrements correctly, admin can view/update order queue
- [ ] Cross-account order access denied server-side (tested with a genuine
      second customer account, not just a differently-named session)

## Known limitation surfaced during this deployment (fixed)

A checkout could be genuinely charged by Stripe while `settleOrder` correctly
failed the order due to insufficient bouquet-component stock — but no refund
was issued and the customer saw a generic, misleading error. Fixed: the
webhook route now automatically refunds the charge when this happens, and
`Order` carries `failureReason`/`refundStatus`/`stripeRefundId` so the
confirmation page shows accurate messaging. See git history for the fix
commit and `specs/known-issues.md` for further detail if it's added there.

## QA scope note

Cross-account order access was verified specifically for `GET /orders/:id`
and `GET /api/orders/:id` (returns 403, no data leakage, empty list
correctly scoped) using a genuine second customer account. Admin-route
protection was separately verified via logged-out and customer-session
access attempts. Not separately tested: authorization on any future
order-adjacent actions (e.g. cancel, receipt export) if added later —
these don't exist in the current MVP scope per `product-overview.md`.
