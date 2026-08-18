import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug, shouldRetryQuery } from "@/modules/catalog/api";

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["products", slug],
    queryFn: () => fetchProductBySlug(slug),
    retry: shouldRetryQuery,
  });
}
