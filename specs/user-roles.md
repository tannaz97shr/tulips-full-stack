# User Roles — Tulips

## Customer
- Browse and filter the catalog (flowers, bouquets, standalone products)
- View product detail pages
- Register / log in (email+password or Google)
- Manage cart
- Checkout via Stripe (real, test mode)
- View own order history and order status
- Cannot access admin routes or other customers' data

## Admin
Everything a Customer can do, plus:
- Create / edit / delete standalone products (flowers, vases, greenery,
  gift add-ons), including image gallery upload
- Create / edit / delete curated bouquets (select component products +
  quantities)
- View all customer orders
- Update order status: `Processing`, `Delivered`, `Cancelled` (manual).
  `Paid` and `Failed` are set automatically from verified Stripe webhook
  events, not manually.
- Manage stock counts directly; stock also decrements automatically when
  a composite bouquet is purchased (each component's stock is reduced)

## Out of scope for MVP
- A separate staff role distinct from Admin
- Audit log of admin actions

## Authorization principle
Role is not just a UI concern — every admin action must be checked
server-side (session + `role === 'admin'`), never enforced only by
hiding UI elements.
