/** Inverse of formatPrice's cents→dollars display; the single dollars→cents conversion point. */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
