import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "@/modules/admin/api";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => deleteProduct(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
