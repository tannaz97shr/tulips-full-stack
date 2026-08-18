import { isAxiosError } from "axios";
import { apiClient } from "@/shared/lib/api-client";
import type { Product, ProductFilters, ProductsListResponse } from "@/modules/catalog/types";

/**
 * A 404 (e.g. a missing product slug) is not transient — retrying it just
 * leaves the UI stuck on a loading state for several seconds before it
 * eventually gives up. Only retry on network errors / 5xx.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isAxiosError(error) && error.response && error.response.status >= 400 && error.response.status < 500) {
    return false;
  }
  return failureCount < 3;
}

function buildParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  filters.category?.forEach((value) => params.append("category", value));
  filters.color?.forEach((value) => params.append("color", value));
  filters.occasion?.forEach((value) => params.append("occasion", value));
  if (filters.season) params.set("season", filters.season);
  if (filters.size) params.set("size", filters.size);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.inStockOnly) params.set("inStockOnly", "true");
  if (filters.excludeSlug) params.set("excludeSlug", filters.excludeSlug);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  return params;
}

export async function fetchProducts(filters: ProductFilters): Promise<ProductsListResponse> {
  const { data } = await apiClient.get<ProductsListResponse>("/products", {
    params: buildParams(filters),
  });
  return data;
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const { data } = await apiClient.get<{ product: Product }>(`/products/${encodeURIComponent(slug)}`);
  return data.product;
}
