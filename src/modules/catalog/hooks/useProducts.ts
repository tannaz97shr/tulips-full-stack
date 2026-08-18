import { useQuery } from "@tanstack/react-query";
import { fetchProducts, shouldRetryQuery } from "@/modules/catalog/api";
import type { ProductFilters } from "@/modules/catalog/types";

interface UseProductsOptions {
  enabled?: boolean;
}

export function useProducts(filters: ProductFilters, options: UseProductsOptions = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    enabled: options.enabled,
    retry: shouldRetryQuery,
  });
}
