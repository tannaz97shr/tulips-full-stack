import { useMutation } from "@tanstack/react-query";
import { createProduct } from "@/modules/admin/api";

export function useCreateProduct() {
  return useMutation({
    mutationFn: createProduct,
  });
}
