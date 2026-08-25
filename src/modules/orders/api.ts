import { apiClient } from "@/shared/lib/api-client";
import { API_ROUTES } from "@/shared/lib/api-routes";
import type { Order, OrdersListResponse } from "@/modules/orders/types";

export async function fetchOrderById(orderId: string): Promise<Order> {
  const { data } = await apiClient.get<{ order: Order }>(API_ROUTES.orders.detail(orderId));
  return data.order;
}

export interface OrdersListParams {
  page?: number;
  pageSize?: number;
}

export async function fetchOrders(params: OrdersListParams): Promise<OrdersListResponse> {
  const { data } = await apiClient.get<OrdersListResponse>(API_ROUTES.orders.list, { params });
  return data;
}
