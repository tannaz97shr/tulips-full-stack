import type { Order } from "@/modules/orders/types";

export type OrderTotalsView =
  | { kind: "gst-inclusive"; total: number; gstIncluded: number }
  | { kind: "gst-added"; subtotal: number; gst: number; total: number };

/**
 * Orders created before the GST-inclusive change were genuinely charged
 * subtotal + 10% GST on top. A receipt must reflect what was actually
 * charged, so those orders keep their original breakdown; only orders
 * flagged `gstInclusive` show "Includes GST of $X".
 */
export function orderTotalsView(order: Pick<Order, "subtotal" | "tax" | "total" | "gstInclusive">): OrderTotalsView {
  if (order.gstInclusive) {
    return { kind: "gst-inclusive", total: order.total, gstIncluded: order.tax };
  }
  return { kind: "gst-added", subtotal: order.subtotal, gst: order.tax, total: order.total };
}
