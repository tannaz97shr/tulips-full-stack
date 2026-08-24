"use client";

import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/routes";
import { CONTENT } from "@/modules/admin/content";
import { useCreateProduct } from "@/modules/admin/hooks/useCreateProduct";
import type { ProductWriteInput } from "@/modules/admin/lib/schemas";
import { ProductForm, ProductFormFieldError } from "./ProductForm";

export function CreateProductView() {
  const router = useRouter();
  const createMutation = useCreateProduct();

  async function handleSubmit(payload: ProductWriteInput) {
    try {
      await createMutation.mutateAsync(payload);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        throw new ProductFormFieldError("slug", CONTENT.productForm.slugTaken);
      }
      throw error;
    }
    router.push(ROUTES.adminProducts);
  }

  return (
    <div className="flex flex-col gap-lg">
      <h1 className="mb-1 text-2xl">{CONTENT.newProductView.heading}</h1>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
