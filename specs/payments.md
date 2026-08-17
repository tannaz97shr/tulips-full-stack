# Payments — Tulips

## Model
- One-time purchases only — no subscriptions
- Currency: AUD
- Stripe Checkout, **test mode**, real integration (not mocked)
- Shipping: flat/free rate for MVP — no live courier-rate API
- Tax: shown as a line item, calculated at a fixed rate — no real tax API

## Flow
1. Customer completes cart, then provides recipient name, delivery
   address, and delivery date at checkout.
2. Server creates a Stripe Checkout Session; an order is created with
   status `Pending`.
3. Customer completes (or abandons) payment on Stripe's hosted page.
4. A signature-verified Stripe webhook (using the raw request body)
   confirms the outcome:
   - **Success** → order status → `Paid`; stock is decremented, including
     bouquet component stock.
   - **Failure** → order status → `Failed`, logged — never silently
     dropped.
5. The browser redirect after checkout is never treated as proof of
   payment on its own — status changes are driven only by verified
   webhook events.
6. Webhook processing is idempotent: `processedStripeEventIds` on the
   order prevents the same event being applied twice.

## Post-payment lifecycle (Admin-managed)
`Paid → Processing → Delivered`, or `Cancelled` — advanced manually by
Admin (no live courier integration in MVP).

## Out of scope for MVP
Subscriptions, refund automation, multi-currency, real tax API, real
shipping-rate API, automated transactional emails.
