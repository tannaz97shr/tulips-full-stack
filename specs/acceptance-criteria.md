# Acceptance Criteria — Tulips MVP

## Catalog & filtering
- [ ] Shop page lists products with pagination
- [ ] Filters (category, color, occasion, price range, season, size) narrow
      results correctly, individually and in combination
- [ ] Product detail page shows full image gallery, description, price,
      and stock state (in stock / out of stock)

## Cart & checkout
- [ ] Cart persists items with correct quantity and price
- [ ] Checkout requires recipient name, delivery address, and delivery date
- [ ] A Stripe Checkout Session is created server-side with correct line
      items and total
- [ ] A webhook-confirmed successful payment sets the order to `Paid` and
      decrements stock, including bouquet component stock
- [ ] A failed or abandoned payment results in order status `Failed`,
      logged, not silently discarded
- [ ] An order confirmation is shown after successful payment

## Authentication
- [ ] Customer can register/log in via email+password or Google
- [ ] Session persists correctly; protected routes redirect unauthenticated
      users to login
- [ ] Customer can view only their own orders; requesting another
      customer's order is denied server-side

## Admin
- [ ] Admin routes are accessible only to Admin — enforced server-side
- [ ] Admin can create/edit/delete standalone products, including image
      gallery upload
- [ ] Admin can create/edit/delete curated bouquets by selecting component
      products and quantities
- [ ] Admin can view all orders and update status (Processing / Delivered
      / Cancelled)
- [ ] Stock counts update correctly on both standalone and bouquet
      purchases

## Non-functional
- [ ] Responsive, mobile-first layout across all pages
- [ ] Light/dark theme switch works and persists
- [ ] Loading, empty, error, and unauthorized states are handled
      explicitly, not left blank or broken
