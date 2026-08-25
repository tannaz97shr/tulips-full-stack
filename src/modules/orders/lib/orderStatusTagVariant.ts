import type { OrderStatus } from "@/modules/orders/types";

type TagVariant = "accent" | "accent-2" | "neutral" | "outline";

// Tag only has 4 variants (no danger/success) — reused here rather than
// extending Tag for a single status-badge use case.
const STATUS_TAG_VARIANTS: Record<OrderStatus, TagVariant> = {
  Pending: "outline",
  Paid: "accent",
  Processing: "accent-2",
  Delivered: "accent",
  Cancelled: "neutral",
  Failed: "neutral",
};

export function orderStatusTagVariant(status: OrderStatus): TagVariant {
  return STATUS_TAG_VARIANTS[status];
}
