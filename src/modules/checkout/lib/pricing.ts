/**
 * Australian retail prices are GST-inclusive: listed prices already contain
 * 10% GST, the order total is simply the sum of the items, and the GST
 * component is total ÷ 11 (e.g. $110.00 contains $10.00 GST).
 *
 * Fixed rate, not admin-configurable in MVP (specs/payments.md). Shipping is
 * free for MVP, so it never contributes to the total.
 */
export const GST_DIVISOR = 11;

/** AUD, minor units (cents). Returns the GST already contained in `totalCents`, rounded to whole cents. */
export function gstIncluded(totalCents: number): number {
  return Math.round(totalCents / GST_DIVISOR);
}

/** Sum of line items (each `price` is GST-inclusive, in cents) — this IS the order total. */
export function sumLineItems(items: readonly { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
