import { FieldValue } from "firebase-admin/firestore";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import { toOrder } from "@/modules/orders/lib/toOrder";
import type { DeliveryAddress, Order, OrderLineItem, OrderStatus } from "@/modules/orders/types";
import type { ProductComponent } from "@/modules/catalog/types";

interface CreatePendingOrderInput {
  userId: string;
  items: OrderLineItem[];
  recipientName: string;
  deliveryAddress: DeliveryAddress;
  deliveryDate: string;
  subtotal: number;
  tax: number;
  total: number;
}

export async function createPendingOrder(input: CreatePendingOrderInput): Promise<Order> {
  const db = getAdminFirestore();
  const ref = db.collection("orders").doc();
  await ref.create({
    ...input,
    status: "Pending",
    processedStripeEventIds: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const doc = await ref.get();
  return toOrder(doc);
}

export async function attachStripeSessionId(orderId: string, stripeSessionId: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection("orders").doc(orderId).update({
    stripeSessionId,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function markOrderFailed(orderId: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection("orders").doc(orderId).update({
    status: "Failed",
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const db = getAdminFirestore();
  const doc = await db.collection("orders").doc(orderId).get();
  return doc.exists ? toOrder(doc) : null;
}

interface OrderDoc {
  items: OrderLineItem[];
  status: OrderStatus;
  processedStripeEventIds: string[];
}

interface ProductStockDoc {
  isComposite?: boolean;
  components?: ProductComponent[];
  stockCount: number;
}

interface SettleOrderInput {
  orderId: string;
  eventId: string;
  outcome: "paid" | "failed";
  stripePaymentIntentId?: string;
}

interface SettleOrderResult {
  /** False when the event was a no-op — order not found, already processed, or the order was already resolved by an earlier event. */
  settled: boolean;
  finalStatus: OrderStatus | null;
}

/**
 * Applies a Stripe webhook event to an order, idempotently via
 * `processedStripeEventIds`. On a "paid" outcome, decrements stock for
 * every ordered item — since a bouquet purchase doesn't list its
 * components separately in `items` (data-model.md), this also decrements
 * every referenced component's `stockCount` (componentQty × orderedQty).
 * Components are guaranteed non-composite (the admin component picker
 * excludes composite products), so this never needs to recurse.
 *
 * All reads happen before any writes (Firestore's transaction
 * requirement), and every distinct product id is read/written at most
 * once — a product referenced both directly (as an order item) and as a
 * bouquet component has its decrements summed first, since a transaction
 * only keeps the last write per document, not a sum of several.
 *
 * Stock is re-validated here rather than trusted from checkout-session-
 * creation time (time has passed); insufficient stock at this point fails
 * the order without partially decrementing anything.
 */
export async function settleOrder({
  orderId,
  eventId,
  outcome,
  stripePaymentIntentId,
}: SettleOrderInput): Promise<SettleOrderResult> {
  const db = getAdminFirestore();
  const orderRef = db.collection("orders").doc(orderId);
  const productsCol = db.collection("products");

  return db.runTransaction(async (tx): Promise<SettleOrderResult> => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) {
      return { settled: false, finalStatus: null };
    }

    const order = orderSnap.data() as OrderDoc;
    if (order.processedStripeEventIds.includes(eventId)) {
      return { settled: false, finalStatus: order.status };
    }
    if (order.status !== "Pending") {
      // Already resolved by an earlier event (e.g. an out-of-order/duplicate
      // delivery) — record this event id for idempotency without touching
      // status or stock again.
      tx.update(orderRef, {
        processedStripeEventIds: FieldValue.arrayUnion(eventId),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { settled: false, finalStatus: order.status };
    }

    if (outcome === "failed") {
      tx.update(orderRef, {
        status: "Failed",
        processedStripeEventIds: FieldValue.arrayUnion(eventId),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { settled: true, finalStatus: "Failed" };
    }

    const decrementMap = new Map<string, number>();
    const addDecrement = (productId: string, qty: number) => {
      decrementMap.set(productId, (decrementMap.get(productId) ?? 0) + qty);
    };
    order.items.forEach((item) => addDecrement(item.productId, item.quantity));

    const itemRefs = order.items.map((item) => productsCol.doc(item.productId));
    const itemSnaps = await Promise.all(itemRefs.map((ref) => tx.get(ref)));

    itemSnaps.forEach((snap, i) => {
      const data = snap.data() as ProductStockDoc | undefined;
      if (data?.isComposite && Array.isArray(data.components)) {
        for (const component of data.components) {
          addDecrement(component.productId, component.quantity * order.items[i].quantity);
        }
      }
    });

    const itemProductIds = new Set(order.items.map((item) => item.productId));
    const extraProductIds = [...decrementMap.keys()].filter((id) => !itemProductIds.has(id));
    const extraSnaps = await Promise.all(extraProductIds.map((id) => tx.get(productsCol.doc(id))));

    const snapById = new Map<string, DocumentSnapshot>();
    itemSnaps.forEach((snap, i) => snapById.set(order.items[i].productId, snap));
    extraSnaps.forEach((snap, i) => snapById.set(extraProductIds[i], snap));

    const sufficientStock = [...decrementMap.entries()].every(([productId, qty]) => {
      const snap = snapById.get(productId);
      const data = snap?.data() as ProductStockDoc | undefined;
      return snap?.exists && (data?.stockCount ?? 0) >= qty;
    });

    if (!sufficientStock) {
      tx.update(orderRef, {
        status: "Failed",
        processedStripeEventIds: FieldValue.arrayUnion(eventId),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { settled: true, finalStatus: "Failed" };
    }

    decrementMap.forEach((qty, productId) => {
      const snap = snapById.get(productId)!;
      const data = snap.data() as ProductStockDoc;
      const newStockCount = data.stockCount - qty;
      tx.update(snap.ref, {
        stockCount: newStockCount,
        inStock: newStockCount > 0,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    tx.update(orderRef, {
      status: "Paid",
      ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
      processedStripeEventIds: FieldValue.arrayUnion(eventId),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { settled: true, finalStatus: "Paid" };
  });
}
