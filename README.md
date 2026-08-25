## Project Status

Tulips is a feature-complete portfolio project demonstrating a real,
end-to-end e-commerce flow — not a mockup. Every acceptance criterion in
`specs/acceptance-criteria.md` has been implemented and verified against
real behavior: real Stripe test-mode payments, real webhook signature
verification, real Firestore transactions, and real cross-account
permission checks — not just typechecked or assumed to work.

**Built and verified:**

- Product catalog with filtering, admin-curated bouquets (composite products)
- Full admin CRUD: products, image galleries, bouquet builder, order queue
- Cart & checkout with real Stripe Checkout Sessions (test mode)
- Signature-verified, idempotent Stripe webhooks; atomic stock decrement
  across standalone products and bouquet components
- Customer order history + admin order management
- Auth (email/password + Google), server-side route and API protection

### Known limitations

- **Firestore composite indexes are declared, not auto-deployed.** A fresh
  clone needs `firebase deploy --only firestore:indexes` (or a one-time
  console click) before order history/queues will work — see
  `firestore.indexes.json`.
- **Password reset is unimplemented** — an open question in
  `specs/authentication.md`, deliberately deferred rather than built for MVP.
- **One intermittent, unreproduced bug** is documented in
  `specs/known-issues.md` (an occasional bouquet-save validation flake) —
  investigated thoroughly (17 automated trials, source-level tracing of
  React Hook Form internals) but never reproduced after the initial report.
- Admin tables aren't optimized for narrow mobile viewports (functional via
  horizontal scroll, no visual affordance hinting at it yet).

See `specs/known-issues.md` for the full history of bugs found and fixed
during development, including a genuinely nasty one: Stripe's webhook
signature verification silently failed under Bun's runtime because of a
sync-vs-async crypto provider mismatch — found and fixed via live
reproduction against real signed Stripe events, not just code review.
