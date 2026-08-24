export interface CartLineItem {
  productId: string;
  name: string;
  /** AUD, minor units (cents) — a display snapshot only; checkout always re-fetches the live price server-side. */
  price: number;
  image?: string;
  quantity: number;
  /** Snapshot of stockCount at add-to-cart time — clamps the quantity stepper client-side. */
  maxStock: number;
}
