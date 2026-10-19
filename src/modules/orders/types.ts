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
  /**
   * AUD, minor units (cents). For `gstInclusive` orders: `subtotal === total`
   * (sum of GST-inclusive item prices) and `tax` is the GST contained in the
   * total (total ÷ 11). Older orders without the flag were charged
   * `subtotal + tax = total`, with GST added on top.
   */
  subtotal: number;
  tax: number;
  total: number;
  /** `true` for orders priced GST-inclusive; absent on orders created before that change. */
  gstInclusive?: boolean;
  status: OrderStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  failureReason?: "payment_failed" | "insufficient_stock";
  refundStatus?: "pending" | "succeeded" | "failed";
  stripeRefundId?: string;
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
