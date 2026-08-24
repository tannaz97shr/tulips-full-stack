import { apiClient } from "@/shared/lib/api-client";
import { API_ROUTES } from "@/shared/lib/api-routes";
import type { Product } from "@/modules/catalog/types";
import type { ProductWriteInput } from "@/modules/admin/lib/schemas";

export async function createProduct(input: ProductWriteInput): Promise<Product> {
  const { data } = await apiClient.post<{ product: Product }>(API_ROUTES.admin.products.create, input);
  return data.product;
}

export async function updateProduct(slug: string, input: Omit<ProductWriteInput, "slug" | "isComposite">): Promise<Product> {
  const { data } = await apiClient.put<{ product: Product }>(API_ROUTES.admin.products.update(slug), input);
  return data.product;
}

export async function deleteProduct(slug: string): Promise<void> {
  await apiClient.delete(API_ROUTES.admin.products.update(slug));
}

export async function uploadProductImages(slug: string, files: File[]): Promise<Product> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const { data } = await apiClient.post<{ product: Product }>(API_ROUTES.admin.products.images(slug), formData);
  return data.product;
}

export async function deleteProductImage(slug: string, url: string): Promise<Product> {
  const { data } = await apiClient.delete<{ product: Product }>(API_ROUTES.admin.products.images(slug), {
    data: { url },
  });
  return data.product;
}

export async function reorderProductImages(
  slug: string,
  images: string[],
  primaryImageIndex: number
): Promise<Product> {
  const { data } = await apiClient.patch<{ product: Product }>(API_ROUTES.admin.products.images(slug), {
    images,
    primaryImageIndex,
  });
  return data.product;
}
