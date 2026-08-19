import { apiClient } from "@/shared/lib/api-client";
import { API_ROUTES } from "@/shared/lib/api-routes";
import type { Product } from "@/modules/catalog/types";
import type { ProductWriteInput } from "@/modules/admin/lib/schemas";

export async function createProduct(input: ProductWriteInput): Promise<Product> {
  const { data } = await apiClient.post<{ product: Product }>(API_ROUTES.admin.products.create, input);
  return data.product;
}

export async function updateProduct(slug: string, input: Omit<ProductWriteInput, "slug">): Promise<Product> {
  const { data } = await apiClient.put<{ product: Product }>(API_ROUTES.admin.products.update(slug), input);
  return data.product;
}
