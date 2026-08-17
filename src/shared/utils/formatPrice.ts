/** `price` is stored in minor units (cents), per specs/data-model.md. */
export function formatPrice(cents: number, currency = "AUD") {
  const hasFractionalCents = cents % 100 !== 0;

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: hasFractionalCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
