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
