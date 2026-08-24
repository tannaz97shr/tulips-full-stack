import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "@/modules/admin/api";
import type { ProductWriteInput } from "@/modules/admin/lib/schemas";

interface UpdateProductArgs {
  slug: string;
  input: Omit<ProductWriteInput, "slug" | "isComposite">;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, input }: UpdateProductArgs) => updateProduct(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
