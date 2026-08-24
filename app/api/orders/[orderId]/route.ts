import { logError } from "@/shared/lib/log-error";
import { requireSession } from "@/modules/auth/lib/requireSession";
import { getOrderById } from "@/modules/orders/lib/orderRepository";

export async function GET(_request: Request, { params }: RouteContext<"/api/orders/[orderId]">) {
  const { session, error: authError } = await requireSession();
  if (authError) return authError;

  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    // Order ownership is checked server-side — a customer can never fetch
    // another customer's order.
    if (order.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json({ order });
  } catch (error) {
    logError(error, "GET /api/orders/[orderId]");
    return Response.json({ error: "Failed to load order" }, { status: 500 });
  }
}
