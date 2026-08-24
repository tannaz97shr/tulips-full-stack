import type { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { Order } from "@/modules/orders/types";

/**
 * Fields are picked explicitly (never spreading `doc.data()`), same
 * discipline as `toProduct.ts` — so internal-only fields (`createdAt`/
 * `updatedAt`, and `processedStripeEventIds`, the webhook idempotency
 * bookkeeping) never leak into the API response.
 */
export function toOrder(doc: QueryDocumentSnapshot | DocumentSnapshot): Order {
  const data = doc.data() as Omit<Order, "id">;
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
  };
}
