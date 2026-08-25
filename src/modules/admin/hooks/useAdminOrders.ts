import { useQuery } from "@tanstack/react-query";
import { shouldRetryQuery } from "@/modules/catalog/api";
import { fetchAdminOrders } from "@/modules/admin/api";
import type { AdminOrdersParams } from "@/modules/admin/api";

export function useAdminOrders(params: AdminOrdersParams = {}) {
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => fetchAdminOrders(params),
    retry: shouldRetryQuery,
  });
}
