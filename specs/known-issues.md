# Known Issues — Tulips

## Taxonomy casing & completeness mismatch

**Priority: High** — actively breaks admin product edits, not just a
cosmetic storefront-filtering inconsistency.

**Affected fields:** `products.colors`, `products.occasions`.

**Root cause:** `scripts/seed-products.ts` seeded every product's `colors`
and `occasions` in lowercase (e.g. `"red"`, `"anniversary"`), while
`COLORS`/`OCCASIONS` in `src/modules/catalog/constants.ts` — the source of
truth used by both the admin form's zod schema (`z.enum(...)`) and the
storefront filter UI — use capitalized values (e.g. `"Red"`,
`"Anniversary"`). Every seeded product was affected. Four seeded values
(`red`, `cream`, `assorted`, `get well`) additionally had no corresponding
entry in the taxonomy under any casing at all.

**Impact:**

- **Admin:** opening the edit form for an affected product and submitting
  (even without changing anything) fails `productFormSchema` validation on
  `colors`/`occasions`. Before the `ProductForm` fix, this failed **silently**
  — `handleSubmit` had no `onInvalid` handler, so nothing was shown to the
  user and nothing was logged.
- **Storefront:** filtering by color/occasion silently excludes affected
  products, since the filter values never match the stored casing.

**Fix applied:**

- `COLORS`/`OCCASIONS` extended with the four previously-missing values
  (`"Red"`, `"Cream"`, `"Assorted"`, `"Get Well"`).
- `src/modules/catalog/lib/normalizeTaxonomyValue.ts` added: case-insensitive
  match against the canonical list, used in `EditProductView.tsx` so the
  admin form always populates/validates against canonical casing.
- `scripts/migrate-taxonomy-casing.ts` added: one-off migration to normalize
  existing Firestore data at rest (dry-run by default, `--apply` to write).
- `ProductForm.tsx`'s `handleSubmit` now has an `onInvalid` handler that logs
  validation failures and shows a visible error, so this class of bug can't
  fail silently again even for taxonomy values not covered by this fix.

## Intermittent bouquet save failure (unreproduced)

**Priority: Low** — reported once during manual QA, not reproduced since
despite deliberate attempts; no known trigger or user-facing workaround
needed beyond retrying.

**Affected area:** Admin bouquet create form (`ProductForm.tsx` /
`ProductComponentsField.tsx`), composite-product save flow.

**Reported symptom:** During manual QA (Claude in Chrome), the first
"Save product" click on an otherwise fully valid bouquet form occasionally
returned the generic `CONTENT.productForm.validationError` banner with no
field actually marked invalid. An immediate retry with identical form state
succeeded.

**Investigation:** Traced RHF 7.85's `useFieldArray.append()` source
directly — it writes synchronously into `_formValues` before any
re-render, which rules out the leading theory (a stale/unsettled
`components` array at submit time due to the debounced product search).
Ran 17 automated Playwright trials covering fast/slow submits, multi-add,
rapid quantity-stepper clicks, and toggling the composite checkbox
off/on before submit — zero reproductions, and `logError`'s
`console.error` output never fired. Confirmed the original QA session
was not running concurrently with active file edits/HMR, ruling out a
dev-server hot-reload artifact too.

**Status:** Open, unreproduced. Left as-is per explicit decision rather
than continuing to chase a fix with no repro path. Revisit if it recurs —
capturing the exact click sequence/timing next time would help.

## Stripe webhook signature verification failed under Bun (fixed)

**Priority: Was Critical** — every real webhook delivery was silently
rejected, meaning no order ever transitioned to `Paid` and no stock was
ever decremented on a real payment, despite the checkout flow itself
(cart, pricing, Stripe redirect, actual payment) working correctly end to
end.

**Root cause:** `app/api/webhooks/stripe/route.ts` called Stripe's
synchronous `stripe.webhooks.constructEvent()`. This project runs via
`bun run dev`/`bun run build` — Bun intercepts Node-shebang binaries like
`next` and runs them under its own runtime, not real Node.js. The
`stripe` npm package's `package.json` declares an explicit `"bun"` export
condition that resolves to its worker/edge build, which only supports Web
Crypto (no synchronous HMAC, since Node's `crypto` module isn't available
there). Calling the sync `constructEvent()` against that build threw
`SubtleCryptoProvider cannot be used in a synchronous context` — caught
by the route's own `try/catch` and turned into a generic 400 "Invalid
signature" response. Firestore was never touched, so every real webhook
delivery failed at the very first step, before order status or stock
were ever updated.

**Impact:** Confirmed via two real Stripe test-mode payments — both
orders correctly redirected through Stripe, both webhooks were delivered
(confirmed via Stripe CLI logs), but both orders stayed `status: "Pending"`
indefinitely with `processedStripeEventIds: []`, and the order-confirmation
page polled forever without ever showing a resolved state.

**Fix applied:** Swapped the synchronous call for Stripe's documented
edge/worker-safe variant, `stripe.webhooks.constructEventAsync()`.

**Verification:** Reproduced the exact failure by replaying a genuinely
Stripe-signed `checkout.session.completed` event (using the real
`STRIPE_WEBHOOK_SECRET` and real session data from the two stuck orders)
directly against the local route — confirmed the same error occurred
before the fix, and confirmed after the fix both orders correctly
transitioned to `Paid` with accurate stock decrements, including the
edge case of a product referenced both as a direct line item and as a
bouquet component in the same order (decrements merged correctly, not
double-applied). Idempotency was also verified by replaying the same
event twice with no double-decrement.

## `bun run build` failed on /products — missing Suspense boundary (fixed)

**Priority: Was High** — broke `bun run build` entirely for the storefront
route, blocking production builds/deploys.

**Root cause:** `src/modules/catalog/hooks/useProductFilters.ts` calls
`useSearchParams()` (from `next/navigation`) to read the storefront's
category/color/occasion/etc. query-string filters. Both consumers of that
hook — `ProductsView.tsx` (top-level content of `app/products/page.tsx`)
and `FiltersPanel.tsx` (rendered inside `ProductsView`, both in the desktop
`<aside>` and the mobile `<Drawer>`) — sat directly on `/products` with no
`<Suspense>` boundary above them. Per Next.js 16's `useSearchParams` docs
(`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md`),
a statically-prerendered page that calls `useSearchParams` from a Client
Component must be wrapped in `Suspense`, or the production build fails with
"Missing Suspense boundary with useSearchParams" — this doesn't surface in
`bun run dev` (routes are rendered on-demand there) or in `tsc`/lint, only
during `bun run build`'s static generation step, which is why it went
unnoticed.

**Impact:** `bun run build` failed unconditionally on `/products`, for
every change to the repo, unrelated to what was actually being worked on.

**Fix applied:** Wrapped `<ProductsView />` in `<Suspense>` in
`app/products/page.tsx`, since `useProductFilters()` (and therefore
`useSearchParams`) is used by essentially the entire page's content
(heading/count, both filter-panel instances, grid, pagination) — there's no
smaller subtree to isolate it to. Added `ProductsViewSkeleton` (exported
from `ProductsView.tsx`) as the `fallback`, deliberately built to mirror
`ProductsView`'s own `isLoading` layout (same heading, same `"Loading…"`
text, same `LoadingState variant="grid"`) so the fallback-to-hydrated swap
is visually seamless instead of a flash of empty content.

**Verification:** `bun run build` completes successfully, with
`/products` listed as `○ (Static)` in the route summary. Verified in a
real browser (production build via `bun run start`, Playwright, both
1280px and 390px viewports, network throttled to exaggerate any transition)
that: category/color/etc. filtering still correctly updates the URL
(`?category=Flowers`) and the product grid, the mobile filter drawer still
opens correctly, and no flicker/flash was observed between the Suspense
fallback and the hydrated component — the throttled-network frame sequence
showed an identical loading layout throughout the transition.

## Auth.js `UntrustedHost` on every request under `bun run start` (fixed — dev-vs-prod deploy gotcha)

**Priority: Was High locally, but this is really a "you will hit this on
first real deploy" note** — every page 500'd on session lookup under a
production build; `bun run dev` was never affected, which is exactly why
this is worth documenting rather than just fixing quietly.

**Affected area:** all Auth.js/NextAuth request handling — surfaced via
`GET /api/auth/session` (called by `SessionProvider` on every page), but
applies to every Auth.js route.

**Symptom:** in the browser console, `_getSession` failed with a generic
`AuthError`: *"There was a problem with the server configuration. Check
the server logs for more information."* — the client-facing message is
deliberately vague; the real error only appears server-side.

**Root cause:** the server log showed the actual error:
`UntrustedHost: Host must be trusted. URL was: http://localhost:3000/api/auth/session`.
Traced through the installed `@auth/core`/`next-auth` source
(`node_modules/@auth/core/lib/utils/env.js`,
`node_modules/@auth/core/lib/utils/assert.js`): every request is gated by
`options.trustHost` — false, and Auth.js refuses the request outright. If
`config.trustHost` isn't set explicitly (it isn't, anywhere in this repo),
Auth.js computes a default: `true` if `AUTH_URL`, `AUTH_TRUST_HOST`,
`VERCEL`, or `CF_PAGES` is set, **or if `NODE_ENV !== "production"`**. That
last clause is why this was invisible in `bun run dev` (`NODE_ENV=development`
auto-trusts) and only appeared under `bun run start`
(`NODE_ENV=production`, not Vercel/CF Pages, and none of `AUTH_URL` /
`AUTH_TRUST_HOST` were set) — not a Bun-specific issue, a genuine
dev-vs-prod config gap that would reproduce identically under plain
`next start` too. `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET`
were all confirmed present and correctly read in both modes — this was
never a missing-secret problem.

**Fix applied:** set `AUTH_URL` (not `trustHost: true` / `AUTH_TRUST_HOST`)
in `.env.local` and `.env.example`. This matters beyond just clearing the
error: per `node_modules/@auth/core/lib/utils/env.js`'s `createActionURL`,
when `AUTH_URL` is unset, Auth.js builds OAuth/callback redirect URLs from
the incoming request's `Host`/`X-Forwarded-Host` header — the exact
attacker-controlled input `trustHost` exists to guard against. Setting
`AUTH_TRUST_HOST=true` (or `trustHost: true` in code) flips the same
boolean gate but leaves that header-driven URL construction in place, i.e.
it silences the check without closing the underlying host-header-injection
vector. `AUTH_URL` pins the origin Auth.js uses to a fixed, developer-
controlled value regardless of what `Host` header a request carries, so the
check stays meaningful. No code changes were needed in `src/auth.ts` or
`src/auth.config.ts` — `NextAuth()` reads `AUTH_URL` from `process.env`
automatically via its internal `setEnvDefaults`.

**Deploy note:** `.env.example`'s `AUTH_URL` is set to
`http://localhost:3000` for local parity with `bun run dev`. **This must be
updated to the real deployed domain when this app is actually deployed** —
left pointing at localhost, production auth would 500 on every request
exactly as reproduced here, just against a real domain instead of a local
one.

**Verification:** reproduced via `curl -i http://localhost:3000/api/auth/session`
against `bun run start` — `500` with the `UntrustedHost` error in the
server log before the fix; `AUTH_URL=http://localhost:3000 bun run start`
then returned `200` with body `null` and no error in the log. Confirmed
`bun run dev` was unaffected before and after (dev's `NODE_ENV` auto-trust
already masked this).

## Missing Firestore composite index for order history/queue (fixed — first-deploy gotcha)

**Priority: Was High locally, but same category as the `AUTH_URL` entry
above** — this is a "you will hit this the first time a fresh Firestore
project runs the order-management feature" note, not a code defect.

**Affected area:** `GET /api/orders` (customer order history) via
`listOrdersByUser` in `src/modules/orders/lib/orderRepository.ts`, which
runs `.where("userId", "==", userId).orderBy("createdAt", "desc")`.

**Symptom:** every request 500'd with `Failed to load orders`; the
server log showed `FAILED_PRECONDITION: The query requires an index`,
with a console link to create it.

**Root cause:** an equality filter on one field (`userId`) combined with
an `orderBy` on a different field (`createdAt`) needs a Firestore
composite index — `specs/data-model.md`'s "Indexes anticipated" section
already called this out (`orders: userId + createdAt`), but the index
itself doesn't exist automatically; it has to be created per Firestore
project, and this repo had no `firestore.indexes.json` for
`firebase deploy --only firestore:indexes` to pick up, so the only way
to create it was the console-link click-through.

**Fix applied:** the index was created via the console link for the
local dev Firestore project. `firestore.indexes.json` (and a minimal
`firebase.json` pointing at it) were added to this repo so the same
index is declarative and reproducible going forward.

**Deploy note:** a **fresh** Firestore project (a new environment, or a
teammate's own project) still needs this index created before
`/orders` or a status-filtered `/admin/orders` query will work — either
run `firebase deploy --only firestore:indexes` (now that
`firestore.indexes.json`/`firebase.json` exist), or click through the
console link Firestore prints in the server log the first time the
query runs. Neither happens automatically on its own.

**Verification:** placed a real order through Stripe test-mode checkout,
confirmed `FAILED_PRECONDITION` before the index existed and a correct
populated `/orders` response after; also confirmed the admin queue's
`GET /api/admin/orders` (unfiltered, and status-filtered) work without
needing this particular index, since that route deliberately sorts by
`createdAt` in memory rather than chaining Firestore's `.orderBy()` onto
a `status` filter, to avoid needing a second `status + createdAt`
composite index beyond what `data-model.md` anticipated.
