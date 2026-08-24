"use client";

import { useState } from "react";
import { Button } from "@/shared/components/atoms/Button";
import { FilterIcon } from "@/shared/components/icons";
import { Drawer } from "@/shared/components/molecules/Drawer";
import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { Pagination } from "@/shared/components/molecules/Pagination";
import { CONTENT } from "@/modules/catalog/content";
import { useProductFilters } from "@/modules/catalog/hooks/useProductFilters";
import { useProducts } from "@/modules/catalog/hooks/useProducts";
import { FiltersPanel } from "./FiltersPanel";
import { ProductGrid } from "./ProductGrid";

// Mirrors ProductsView's own isLoading layout so the Suspense fallback in app/products/page.tsx doesn't flash before hydration.
export function ProductsViewSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-lg px-lg py-lg">
      <div className="flex flex-wrap items-baseline justify-between gap-sm">
        <div>
          <h1 className="mb-1 text-2xl">{CONTENT.productsView.heading}</h1>
          <span className="text-base text-foreground/70">{CONTENT.productsView.loading}</span>
        </div>
        <Button variant="secondary" className="md:hidden" disabled>
          <FilterIcon width={16} height={16} />
          {CONTENT.filters.heading}
        </Button>
      </div>
      <div className="flex items-start gap-xl">
        <aside className="hidden w-[220px] flex-none md:block" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <LoadingState variant="grid" />
        </div>
      </div>
    </div>
  );
}

export function ProductsView() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { filters, setPage, clearAll } = useProductFilters();
  const { data, isLoading, isError, refetch } = useProducts(filters);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-lg px-lg py-lg">
      <div className="flex flex-wrap items-baseline justify-between gap-sm">
        <div>
          <h1 className="mb-1 text-2xl">{CONTENT.productsView.heading}</h1>
          <span className="text-base text-foreground/70">
            {isLoading ? CONTENT.productsView.loading : CONTENT.productsView.productsCount(data?.totalCount ?? 0)}
          </span>
        </div>
        <Button variant="secondary" className="md:hidden" onClick={() => setFiltersOpen(true)}>
          <FilterIcon width={16} height={16} />
          {CONTENT.filters.heading}
        </Button>
      </div>
      <div className="flex items-start gap-xl">
        <aside className="hidden w-[220px] flex-none md:block">
          <FiltersPanel />
        </aside>
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <LoadingState variant="grid" />
          ) : isError ? (
            <ErrorState message={CONTENT.productsView.loadError} onRetry={() => refetch()} />
          ) : data && data.products.length > 0 ? (
            <>
              <ProductGrid products={data.products} />
              <Pagination pageCount={data.totalPages} page={data.page} onPageChange={setPage} />
            </>
          ) : (
            <div className="flex flex-col items-center gap-md py-2xl text-center">
              <p className="text-lg text-foreground/70">{CONTENT.productsView.emptyState}</p>
              <Button variant="secondary" onClick={clearAll}>
                {CONTENT.productsView.clearFilters}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <FiltersPanel onDone={() => setFiltersOpen(false)} />
      </Drawer>
    </div>
  );
}
