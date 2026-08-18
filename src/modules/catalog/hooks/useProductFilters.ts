"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PRICE_PRESET_RANGES } from "@/modules/catalog/constants";
import type { ProductCategory, ProductFilters, ProductSeason, ProductSize } from "@/modules/catalog/types";

export interface ProductFilterState {
  categories: string[];
  colors: string[];
  occasions: string[];
  season?: ProductSeason;
  size?: ProductSize;
  pricePreset?: string;
  inStockOnly: boolean;
  page: number;
}

function parseState(searchParams: URLSearchParams): ProductFilterState {
  return {
    categories: searchParams.getAll("category"),
    colors: searchParams.getAll("color"),
    occasions: searchParams.getAll("occasion"),
    season: (searchParams.get("season") as ProductSeason) || undefined,
    size: (searchParams.get("size") as ProductSize) || undefined,
    pricePreset: searchParams.get("price") || undefined,
    inStockOnly: searchParams.get("inStockOnly") === "true",
    page: Math.max(1, Number(searchParams.get("page")) || 1),
  };
}

export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => parseState(searchParams), [searchParams]);

  const filters: ProductFilters = useMemo(() => {
    const range = state.pricePreset ? PRICE_PRESET_RANGES[state.pricePreset as keyof typeof PRICE_PRESET_RANGES] : undefined;
    return {
      category: state.categories.length ? (state.categories as ProductCategory[]) : undefined,
      color: state.colors.length ? state.colors : undefined,
      occasion: state.occasions.length ? state.occasions : undefined,
      season: state.season,
      size: state.size,
      minPrice: range?.minPrice,
      maxPrice: range?.maxPrice,
      inStockOnly: state.inStockOnly || undefined,
      page: state.page,
    };
  }, [state]);

  const push = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const toggleArrayValue = useCallback(
    (key: "category" | "color" | "occasion", value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll(key);
      params.delete(key);
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      next.forEach((v) => params.append(key, v));
      params.delete("page");
      push(params);
    },
    [push, searchParams]
  );

  const setSingleValue = useCallback(
    (key: "season" | "size" | "price", value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(key);
      params.delete(key);
      if (value && current !== value) {
        params.set(key, value);
      }
      params.delete("page");
      push(params);
    },
    [push, searchParams]
  );

  const toggleInStockOnly = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("inStockOnly") === "true") {
      params.delete("inStockOnly");
    } else {
      params.set("inStockOnly", "true");
    }
    params.delete("page");
    push(params);
  }, [push, searchParams]);

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      push(params);
    },
    [push, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters =
    state.categories.length > 0 ||
    state.colors.length > 0 ||
    state.occasions.length > 0 ||
    Boolean(state.season) ||
    Boolean(state.size) ||
    Boolean(state.pricePreset) ||
    state.inStockOnly;

  return {
    state,
    filters,
    hasActiveFilters,
    toggleCategory: (value: string) => toggleArrayValue("category", value),
    toggleColor: (value: string) => toggleArrayValue("color", value),
    toggleOccasion: (value: string) => toggleArrayValue("occasion", value),
    setSeason: (value: string) => setSingleValue("season", value),
    setSize: (value: string) => setSingleValue("size", value),
    setPricePreset: (value: string) => setSingleValue("price", value),
    toggleInStockOnly,
    setPage,
    clearAll,
  };
}
