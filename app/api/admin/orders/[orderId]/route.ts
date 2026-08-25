import { z } from "zod";
import { logError } from "@/shared/lib/log-error";
import { requireAdminSession } from "@/modules/admin/lib/requireAdminSession";
import { getOrderById, updateOrderStatus } from "@/modules/orders/lib/orderRepository";

// Paid/Failed are set only by the verified Stripe webhook (settleOrder in
// orderRepository.ts) — never accepted here, and never applied while the
// order is still Pending/Failed (see the guard below).
const statusUpdateSchema = z.object({
  status: z.enum(["Processing", "Delivered", "Cancelled"]),
});

export async function PATCH(request: Request, { params }: RouteContext<"/api/admin/orders/[orderId]">) {
  const { error: authError } = await requireAdminSession();
  if (authError) return authError;

  try {
    const { orderId } = await params;
    const existing = await getOrderById(orderId);
    if (!existing) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (existing.status === "Pending" || existing.status === "Failed") {
      return Response.json(
        { error: `Order is ${existing.status} and can't be updated manually yet` },
        { status: 409 }
      );
    }

    const order = await updateOrderStatus(orderId, parsed.data.status);
    return Response.json({ order });
  } catch (error) {
    logError(error, "PATCH /api/admin/orders/[orderId]");
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}
