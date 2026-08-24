/** Mirrors the `orders` collection in specs/data-model.md. */

export type OrderStatus = "Pending" | "Paid" | "Processing" | "Delivered" | "Cancelled" | "Failed";

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  suburb: string;
  state: string;
  postcode: string;
  country: "AU";
}

export interface OrderLineItem {
  productId: string;
  name: string;
  /** AUD, minor units (cents) — snapshot at purchase time, never re-derived from the live product doc. */
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderLineItem[];
  recipientName: string;
  deliveryAddress: DeliveryAddress;
  /** Calendar date, YYYY-MM-DD. */
  deliveryDate: string;
  /** AUD, minor units (cents). */
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}
