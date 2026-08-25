import { useQuery } from "@tanstack/react-query";
import { shouldRetryQuery } from "@/modules/catalog/api";
import { fetchOrders } from "@/modules/orders/api";
import type { OrdersListParams } from "@/modules/orders/api";

export function useOrders(params: OrdersListParams = {}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => fetchOrders(params),
    retry: shouldRetryQuery,
  });
}
