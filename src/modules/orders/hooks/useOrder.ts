import { useQuery } from "@tanstack/react-query";
import { shouldRetryQuery } from "@/modules/catalog/api";
import { fetchOrderById } from "@/modules/orders/api";

interface UseOrderOptions {
  /**
   * Only poll while genuinely confirming a just-completed checkout — the
   * webhook (not the checkout redirect) is what actually confirms payment,
   * so this is what lets the confirmation page reflect the real, verified
   * status instead of assuming success from the redirect alone. A Pending
   * order viewed later from history has nothing actively resolving, so
   * polling it would just be a wasted background request loop.
   */
  poll?: boolean;
}

export function useOrder(orderId: string, { poll = false }: UseOrderOptions = {}) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrderById(orderId),
    retry: shouldRetryQuery,
    refetchInterval: (query) => (poll && query.state.data?.status === "Pending" ? 2500 : false),
  });
}
