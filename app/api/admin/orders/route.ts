import { logError } from "@/shared/lib/log-error";
import { requireAdminSession } from "@/modules/admin/lib/requireAdminSession";
import { getUsersByIds } from "@/modules/auth/lib/userRepository";
import { listOrders } from "@/modules/orders/lib/orderRepository";
import type { AdminOrder, OrderStatus } from "@/modules/orders/types";

const ORDER_STATUSES: readonly OrderStatus[] = ["Pending", "Paid", "Processing", "Delivered", "Cancelled", "Failed"];
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export async function GET(request: Request) {
  const { error: authError } = await requireAdminSession();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status =
      statusParam && ORDER_STATUSES.includes(statusParam as OrderStatus) ? (statusParam as OrderStatus) : undefined;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = clamp(Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);

    const orders = await listOrders(status);
    const totalCount = orders.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = (page - 1) * pageSize;
    const pageItems = orders.slice(start, start + pageSize);

    const usersById = await getUsersByIds(pageItems.map((order) => order.userId));
    const ordersWithCustomer: AdminOrder[] = pageItems.map((order) => {
      const user = usersById.get(order.userId);
      return {
        ...order,
        customerName: user?.name ?? "Unknown customer",
        customerEmail: user?.email ?? "—",
      };
    });

    return Response.json({ orders: ordersWithCustomer, page, pageSize, totalCount, totalPages });
  } catch (error) {
    logError(error, "GET /api/admin/orders");
    return Response.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
