import { logError } from "@/shared/lib/log-error";
import { requireSession } from "@/modules/auth/lib/requireSession";
import { listOrdersByUser } from "@/modules/orders/lib/orderRepository";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export async function GET(request: Request) {
  const { session, error: authError } = await requireSession();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = clamp(Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);

    // Ownership is enforced by construction here — the query is scoped to
    // the caller's own userId, never a client-supplied one.
    const orders = await listOrdersByUser(session.user.id);
    const totalCount = orders.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = (page - 1) * pageSize;
    const pageItems = orders.slice(start, start + pageSize);

    return Response.json({ orders: pageItems, page, pageSize, totalCount, totalPages });
  } catch (error) {
    logError(error, "GET /api/orders");
    return Response.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
