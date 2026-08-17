"use client";

import { useState } from "react";
import { Button } from "@/shared/components/atoms/Button";
import { FilterIcon } from "@/shared/components/icons";
import { Drawer } from "@/shared/components/molecules/Drawer";
import { Pagination } from "@/shared/components/molecules/Pagination";
import type { Product } from "@/modules/catalog/types";
import { FiltersPanel } from "./FiltersPanel";
import { ProductGrid } from "./ProductGrid";

interface ProductsViewProps {
  products: Product[];
}

export function ProductsView({ products }: ProductsViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-lg px-lg py-lg">
      <div className="flex flex-wrap items-baseline justify-between gap-sm">
        <div>
          <h1 className="mb-1 text-[28px]">Shop</h1>
          <span className="text-[13px] text-foreground/70">{products.length} products</span>
        </div>
        <Button variant="secondary" className="md:hidden" onClick={() => setFiltersOpen(true)}>
          <FilterIcon width={16} height={16} />
          Filters
        </Button>
      </div>
      <div className="flex items-start gap-xl">
        <aside className="hidden w-[220px] flex-none md:block">
          <FiltersPanel />
        </aside>
        <div className="min-w-0 flex-1">
          <ProductGrid products={products} />
          <Pagination pageCount={3} />
        </div>
      </div>
      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <FiltersPanel onDone={() => setFiltersOpen(false)} />
      </Drawer>
    </div>
  );
}
