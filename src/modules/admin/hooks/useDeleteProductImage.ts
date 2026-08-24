import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductImage } from "@/modules/admin/api";

interface DeleteProductImageArgs {
  slug: string;
  url: string;
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, url }: DeleteProductImageArgs) => deleteProductImage(slug, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
