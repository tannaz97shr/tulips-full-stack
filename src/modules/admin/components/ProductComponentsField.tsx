"use client";

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { ConfirmDialog } from "@/shared/components/molecules/ConfirmDialog";
import { ProductImage } from "@/shared/components/molecules/ProductImage";
import { QuantityStepper } from "@/shared/components/molecules/QuantityStepper";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT } from "@/modules/admin/content";
import { fetchProductBySlug, shouldRetryQuery } from "@/modules/catalog/api";
import { useProducts } from "@/modules/catalog/hooks/useProducts";
import type { Product, ProductComponent } from "@/modules/catalog/types";
import type { ProductFormInput, ProductFormValues } from "@/modules/admin/lib/schemas";

interface ProductComponentsFieldProps {
  control: Control<ProductFormValues, unknown, ProductFormInput>;
  error?: string;
  excludeSlug?: string;
  initialComponents?: ProductComponent[];
}

export function ProductComponentsField({
  control,
  error,
  excludeSlug,
  initialComponents,
}: ProductComponentsFieldProps) {
  const { fields, append, remove, update } = useFieldArray({ control, name: "components" });
  const [addedProducts, setAddedProducts] = useState<Record<string, Product>>({});
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  const hydrationQueries = useQueries({
    queries: (initialComponents ?? []).map((component) => ({
      queryKey: ["products", component.productId],
      queryFn: () => fetchProductBySlug(component.productId),
      retry: shouldRetryQuery,
    })),
  });

  const knownProducts = useMemo(() => {
    const hydrated: Record<string, Product> = {};
    for (const query of hydrationQueries) {
      if (query.data) hydrated[query.data.id] = query.data;
    }
    return { ...hydrated, ...addedProducts };
  }, [hydrationQueries, addedProducts]);

  function handleSelect(product: Product) {
    append({ productId: product.id, quantity: 1 });
    setAddedProducts((prev) => ({ ...prev, [product.id]: product }));
  }

  function handleRemoveConfirm() {
    if (pendingRemoveIndex === null) return;
    remove(pendingRemoveIndex);
    setPendingRemoveIndex(null);
  }

  const pendingRemoveProduct =
    pendingRemoveIndex !== null ? knownProducts[fields[pendingRemoveIndex]?.productId] : undefined;

  return (
    <div className="flex flex-col gap-sm">
      <span className="text-xs tracking-wide text-foreground/70 uppercase">
        {CONTENT.productComponentsField.heading}
      </span>

      {fields.length === 0 ? (
        <p className="text-base text-foreground/60">{CONTENT.productComponentsField.empty}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {fields.map((field, index) => {
            const product = knownProducts[field.productId];
            return (
              <li key={field.id} className="flex items-center gap-2 rounded-sm border border-divider p-1.5">
                <ProductImage
                  src={product?.images[product.primaryImageIndex]}
                  alt={product?.name ?? ""}
                  sizes="40px"
                  aspectRatio="1/1"
                  rounded="sm"
                  className="w-10"
                />
                <div className="flex flex-1 flex-col">
                  <span className="text-base">{product?.name ?? CONTENT.productComponentsField.loading}</span>
                  {product ? <span className="text-sm text-foreground/60">{formatPrice(product.price)}</span> : null}
                </div>
                <QuantityStepper
                  value={field.quantity}
                  onChange={(quantity) => update(index, { ...field, quantity })}
                  min={1}
                  max={50}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPendingRemoveIndex(index)}
                >
                  {CONTENT.productComponentsField.remove}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <ProductComponentPicker
        excludeSlug={excludeSlug}
        excludeIds={fields.map((field) => field.productId)}
        onSelect={handleSelect}
      />

      {error ? (
        <p className="text-base text-accent-700" role="alert">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        open={pendingRemoveIndex !== null}
        title={CONTENT.productComponentsField.removeConfirmTitle}
        message={pendingRemoveProduct ? CONTENT.productComponentsField.removeConfirm(pendingRemoveProduct.name) : ""}
        confirmLabel={CONTENT.productComponentsField.remove}
        cancelLabel={CONTENT.productComponentsField.cancel}
        variant="danger"
        onConfirm={handleRemoveConfirm}
        onCancel={() => setPendingRemoveIndex(null)}
      />
    </div>
  );
}

interface ProductComponentPickerProps {
  excludeSlug?: string;
  excludeIds: string[];
  onSelect: (product: Product) => void;
}

function ProductComponentPicker({ excludeSlug, excludeIds, onSelect }: ProductComponentPickerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  const { data, isLoading } = useProducts(
    { search: debouncedSearch || undefined, excludeComposite: true, excludeSlug, pageSize: 8 },
    { enabled: isFocused }
  );

  const candidates = (data?.products ?? []).filter((product) => !excludeIds.includes(product.id));

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={CONTENT.productComponentsField.searchPlaceholder}
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {isFocused ? (
        <ul className="absolute top-full right-0 left-0 z-10 mt-1 max-h-64 overflow-y-auto rounded-sm border border-divider bg-background shadow-md">
          {isLoading ? (
            <li className="p-2 text-base text-foreground/60">{CONTENT.productComponentsField.loading}</li>
          ) : candidates.length === 0 ? (
            <li className="p-2 text-base text-foreground/60">{CONTENT.productComponentsField.searchEmpty}</li>
          ) : (
            candidates.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 p-2 text-left hover:bg-foreground/7"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelect(product);
                    setSearchInput("");
                  }}
                >
                  <ProductImage
                    src={product.images[product.primaryImageIndex]}
                    alt={product.name}
                    sizes="32px"
                    aspectRatio="1/1"
                    rounded="sm"
                    className="w-8"
                  />
                  <span className="flex-1 text-base">{product.name}</span>
                  <span className="text-sm text-foreground/60">{formatPrice(product.price)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
