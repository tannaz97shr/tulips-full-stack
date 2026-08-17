# Data Model — Tulips (Firestore)

## Collection: `products`
Represents both standalone products (individual flowers, vases, greenery,
gift add-ons) and admin-curated bouquets (composite products built from
other products).

| Field | Type | Notes |
|---|---|---|
| id | string | doc id |
| name | string | |
| slug | string | unique, URL-friendly |
| description | string | |
| sku | string | |
| category | enum | Flowers / Bouquets / Vases & Containers / Greenery & Fillers / Gift Add-ons |
| isComposite | boolean | `true` for admin-curated bouquets |
| components | array<{productId, quantity}> | present only when `isComposite = true` |
| colors | array<string> | filterable |
| occasions | array<string> | filterable — birthday, sympathy, wedding, anniversary, get well, everyday, congratulations |
| species | string | individual flowers; bouquets may roll this up from components |
| size | enum | small / medium / large |
| season | enum | spring / summer / autumn / winter / all-year |
| tags | array<string> | freeform, future-proofing for new filters |
| isFeatured | boolean | homepage highlighting |
| price | number | AUD, store as minor units (cents) |
| stockCount | number | |
| inStock | boolean | derived from `stockCount` |
| images | array<string> | Firebase Storage URLs (gallery) |
| primaryImageIndex | number | default 0 |
| createdAt / updatedAt | timestamp | |

## Collection: `users`

| Field | Type | Notes |
|---|---|---|
| id | string | matches Auth.js user id |
| email | string | |
| name | string | |
| role | enum | `customer` / `admin` |
| createdAt | timestamp | |

## Collection: `orders`

| Field | Type | Notes |
|---|---|---|
| id | string | |
| userId | string | references `users` |
| items | array<{productId, name, price, quantity}> | snapshot at purchase time — not a live reference |
| recipientName | string | |
| deliveryAddress | object | |
| deliveryDate | date | |
| subtotal / tax / total | number | |
| status | enum | Pending / Paid / Processing / Delivered / Cancelled / Failed |
| stripeSessionId | string | |
| stripePaymentIntentId | string | |
| processedStripeEventIds | array<string> | webhook idempotency guard |
| createdAt / updatedAt | timestamp | |

## Relationships & ownership rules
- A bouquet's `components` reference other `products` docs by id. Purchasing
  a bouquet decrements stock on each referenced component product.
- Orders snapshot item name/price at purchase time — never re-derive from
  the live product doc, since prices and names can change later.
- `orders.userId` enforces ownership: a customer may only read their own
  orders; Admin may read all. Enforced server-side, not just in Firestore
  security rules.

## Indexes anticipated
- `products`: category + isFeatured
- `products`: category + price
- `orders`: userId + createdAt
- `orders`: status (for the admin order queue)
