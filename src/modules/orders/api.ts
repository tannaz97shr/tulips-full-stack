import { apiClient } from "@/shared/lib/api-client";
import { API_ROUTES } from "@/shared/lib/api-routes";
import type { Order } from "@/modules/orders/types";

export async function fetchOrderById(orderId: string): Promise<Order> {
  const { data } = await apiClient.get<{ order: Order }>(API_ROUTES.orders.detail(orderId));
  return data.order;
}
