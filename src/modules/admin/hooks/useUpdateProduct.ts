import { useMutation } from "@tanstack/react-query";
import { updateProduct } from "@/modules/admin/api";
import type { ProductWriteInput } from "@/modules/admin/lib/schemas";

export function useUpdateProduct(slug: string) {
  return useMutation({
    mutationFn: (input: Omit<ProductWriteInput, "slug">) => updateProduct(slug, input),
  });
}
