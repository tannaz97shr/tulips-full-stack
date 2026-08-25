import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "@/modules/admin/api";
import type { OrderStatus } from "@/modules/orders/types";

interface UpdateOrderStatusArgs {
  orderId: string;
  status: OrderStatus;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: UpdateOrderStatusArgs) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}
