import type { DocumentSnapshot, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import type { Order } from "@/modules/orders/types";

/**
 * Fields are picked explicitly (never spreading `doc.data()`), same
 * discipline as `toProduct.ts` — so internal-only fields (`updatedAt`, and
 * `processedStripeEventIds`, the webhook idempotency bookkeeping) never
 * leak into the API response. `createdAt` is the one internal timestamp
 * that IS exposed, converted from Firestore's `{ _seconds, _nanoseconds }`
 * shape to an ISO string, since order history/queue views need it to sort
 * and display recency.
 */
export function toOrder(doc: QueryDocumentSnapshot | DocumentSnapshot): Order {
  const data = doc.data() as Omit<Order, "id" | "createdAt"> & { createdAt: Timestamp };
  return {
    id: doc.id,
    userId: data.userId,
    items: data.items,
    recipientName: data.recipientName,
    deliveryAddress: data.deliveryAddress,
    deliveryDate: data.deliveryDate,
    subtotal: data.subtotal,
    tax: data.tax,
    total: data.total,
    status: data.status,
    stripeSessionId: data.stripeSessionId,
    stripePaymentIntentId: data.stripePaymentIntentId,
    createdAt: data.createdAt.toDate().toISOString(),
  };
}
