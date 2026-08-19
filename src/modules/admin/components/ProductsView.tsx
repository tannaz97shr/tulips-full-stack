"use client";

import { useState } from "react";
import { CONTENT } from "@/modules/admin/content";
import { useProducts } from "@/modules/catalog/hooks/useProducts";
import { ProductsTable } from "./ProductsTable";

const ADMIN_PAGE_SIZE = 50;

export function ProductsView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useProducts({ page, pageSize: ADMIN_PAGE_SIZE });

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="mb-1 text-2xl">{CONTENT.productsView.heading}</h1>
        <span className="text-base text-foreground/70">
          {isLoading ? CONTENT.productsView.loading : CONTENT.productsView.productsCount(data?.totalCount ?? 0)}
        </span>
      </div>
      <ProductsTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
