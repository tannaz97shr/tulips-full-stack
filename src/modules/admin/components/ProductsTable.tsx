"use client";

import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { Pagination } from "@/shared/components/molecules/Pagination";
import { PlaceholderImage } from "@/shared/components/molecules/PlaceholderImage";
import { Tag } from "@/shared/components/atoms/Tag";
import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT } from "@/modules/admin/content";
import type { ProductsListResponse } from "@/modules/catalog/types";

interface ProductsTableProps {
  data: ProductsListResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  page: number;
  onPageChange: (page: number) => void;
}

export function ProductsTable({ data, isLoading, isError, onRetry, onPageChange }: ProductsTableProps) {
  if (isLoading) {
    return <LoadingState message={CONTENT.productsView.loading} />;
  }
  if (isError) {
    return <ErrorState message={CONTENT.productsView.loadError} onRetry={onRetry} />;
  }
  if (!data || data.products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-md py-2xl text-center">
        <p className="text-lg text-foreground/70">{CONTENT.productsView.emptyState}</p>
      </div>
    );
  }

  const columns = CONTENT.productsTable.columns;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-168 border-collapse text-left text-base">
          <thead>
            <tr className="border-b border-foreground/15 text-2xs tracking-wide text-foreground/60 uppercase">
              <th className="py-sm pr-sm font-normal">{columns.image}</th>
              <th className="py-sm pr-sm font-normal">{columns.name}</th>
              <th className="py-sm pr-sm font-normal">{columns.sku}</th>
              <th className="py-sm pr-sm font-normal">{columns.category}</th>
              <th className="py-sm pr-sm font-normal">{columns.price}</th>
              <th className="py-sm pr-sm font-normal">{columns.stock}</th>
              <th className="py-sm pr-sm font-normal">{columns.status}</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((product) => (
              <tr key={product.id} className="border-b border-foreground/8">
                <td className="py-sm pr-sm">
                  <PlaceholderImage aspectRatio="1/1" rounded="sm" className="w-10" />
                </td>
                <td className="py-sm pr-sm">{product.name}</td>
                <td className="py-sm pr-sm text-foreground/70">{product.sku}</td>
                <td className="py-sm pr-sm text-foreground/70">{product.category}</td>
                <td className="py-sm pr-sm">{formatPrice(product.price)}</td>
                <td className="py-sm pr-sm">{product.stockCount}</td>
                <td className="py-sm pr-sm">
                  <div className="flex flex-wrap gap-1">
                    <Tag variant={product.inStock ? "accent" : "neutral"}>
                      {product.inStock ? CONTENT.productsTable.inStock : CONTENT.productsTable.outOfStock}
                    </Tag>
                    {product.isComposite ? (
                      <Tag variant="outline">{CONTENT.productsTable.composite}</Tag>
                    ) : null}
                    {product.isFeatured ? (
                      <Tag variant="accent-2">{CONTENT.productsTable.featured}</Tag>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pageCount={data.totalPages} page={data.page} onPageChange={onPageChange} />
    </>
  );
}
