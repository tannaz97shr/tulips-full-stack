"use client";

import { useState } from "react";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Tag } from "@/shared/components/atoms/Tag";
import { ConfirmDialog } from "@/shared/components/molecules/ConfirmDialog";
import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { Pagination } from "@/shared/components/molecules/Pagination";
import { PlaceholderImage } from "@/shared/components/molecules/PlaceholderImage";
import { ROUTES } from "@/shared/routes";
import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT } from "@/modules/admin/content";
import { useDeleteProduct } from "@/modules/admin/hooks/useDeleteProduct";
import { useUpdateProduct } from "@/modules/admin/hooks/useUpdateProduct";
import { toProductWriteInput } from "@/modules/admin/lib/toProductWriteInput";
import type { Product, ProductsListResponse } from "@/modules/catalog/types";

interface ProductsTableProps {
  data: ProductsListResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  page: number;
  onPageChange: (page: number) => void;
}

interface ProductStockCellProps {
  stockCount: number;
  isSaving: boolean;
  onSave: (stockCount: number) => Promise<void>;
}

// Keyed by `${product.id}-${stockCount}` at the call site so a confirmed
// server-side change (a successful save, or a refetch) remounts this with
// a fresh initial value instead of needing an effect to resync it.
function ProductStockCell({ stockCount, isSaving, onSave }: ProductStockCellProps) {
  const [value, setValue] = useState(stockCount);
  const [error, setError] = useState<string | null>(null);

  async function handleBlur() {
    if (value === stockCount || Number.isNaN(value) || value < 0) {
      setValue(stockCount);
      return;
    }
    setError(null);
    try {
      await onSave(value);
    } catch {
      setError(CONTENT.productsTable.stockSaveError);
      setValue(stockCount);
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <Input
        type="number"
        step="1"
        min="0"
        value={value}
        disabled={isSaving}
        className="w-20"
        onChange={(event) => setValue(Number(event.target.value))}
        onBlur={handleBlur}
      />
      {error ? (
        <span className="text-sm text-accent-700" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function ProductsTable({ data, isLoading, isError, onRetry, onPageChange }: ProductsTableProps) {
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const [productPendingDelete, setProductPendingDelete] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  async function handleStockSave(product: Product, stockCount: number) {
    await updateMutation.mutateAsync({
      slug: product.slug,
      input: { ...toProductWriteInput(product), stockCount },
    });
  }

  function handleDeleteRequest(product: Product) {
    setProductPendingDelete(product);
  }

  function handleDeleteCancel() {
    setProductPendingDelete(null);
  }

  function handleDeleteConfirm() {
    if (!productPendingDelete) return;
    const slug = productPendingDelete.slug;
    setProductPendingDelete(null);
    setDeleteError(null);
    deleteMutation.mutate(slug, {
      onError: () => setDeleteError(CONTENT.productsTable.deleteError),
    });
  }

  return (
    <>
      {deleteError ? (
        <p className="mb-sm text-base text-accent-700" role="alert">
          {deleteError}
        </p>
      ) : null}
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
              <th className="py-sm pr-sm font-normal">{columns.actions}</th>
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
                <td className="py-sm pr-sm">
                  {!product.isComposite ? (
                    <ProductStockCell
                      key={`${product.id}-${product.stockCount}`}
                      stockCount={product.stockCount}
                      isSaving={updateMutation.isPending && updateMutation.variables?.slug === product.slug}
                      onSave={(stockCount) => handleStockSave(product, stockCount)}
                    />
                  ) : (
                    product.stockCount
                  )}
                </td>
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
                <td className="py-sm pr-sm">
                  {!product.isComposite ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" href={ROUTES.adminEditProduct(product.slug)}>
                        {CONTENT.productsTable.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleDeleteRequest(product)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === product.slug}
                      >
                        {CONTENT.productsTable.delete}
                      </Button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pageCount={data.totalPages} page={data.page} onPageChange={onPageChange} />
      <ConfirmDialog
        open={productPendingDelete !== null}
        title={CONTENT.productsTable.deleteConfirmTitle}
        message={productPendingDelete ? CONTENT.productsTable.deleteConfirm(productPendingDelete.name) : ""}
        confirmLabel={CONTENT.productsTable.delete}
        cancelLabel={CONTENT.productsTable.cancel}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
