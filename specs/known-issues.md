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
