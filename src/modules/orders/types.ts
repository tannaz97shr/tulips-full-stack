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
  /** ISO 8601 timestamp. */
  createdAt: string;
}

export interface OrdersListResponse {
  orders: Order[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** An `Order` enriched with customer identity for the admin queue — `Order` itself only stores `userId`. */
export interface AdminOrder extends Order {
  customerName: string;
  customerEmail: string;
}

export interface AdminOrdersListResponse {
  orders: AdminOrder[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
