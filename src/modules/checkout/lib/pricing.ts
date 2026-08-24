/** GST — fixed rate, not admin-configurable in MVP (specs/payments.md: "calculated at a fixed rate"). */
export const TAX_RATE = 0.1;

/** AUD, minor units (cents). Shipping is free for MVP (specs/payments.md: "flat/free rate"). */
export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE);
}
