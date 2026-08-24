import { useQuery } from "@tanstack/react-query";
import { shouldRetryQuery } from "@/modules/catalog/api";
import { fetchOrderById } from "@/modules/orders/api";

/**
 * Polls while the order is still Pending — the webhook (not the checkout
 * redirect) is what actually confirms payment, so this is what lets the
 * confirmation page reflect the real, verified status instead of assuming
 * success from the redirect alone.
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrderById(orderId),
    retry: shouldRetryQuery,
    refetchInterval: (query) => (query.state.data?.status === "Pending" ? 2500 : false),
  });
}
