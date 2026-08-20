"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { ROUTES } from "@/shared/routes";
import { CONTENT } from "@/modules/admin/content";
import { useUpdateProduct } from "@/modules/admin/hooks/useUpdateProduct";
import { useProduct } from "@/modules/catalog/hooks/useProduct";
import type { ProductWriteInput } from "@/modules/admin/lib/schemas";
import { ProductForm } from "./ProductForm";

interface EditProductViewProps {
  slug: string;
}

export function EditProductView({ slug }: EditProductViewProps) {
  const router = useRouter();
  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const updateMutation = useUpdateProduct();

  async function handleSubmit(payload: ProductWriteInput) {
    // slug is immutable; the PUT route validates against a schema that
    // omits it, so a stray `slug` here is silently dropped server-side.
    await updateMutation.mutateAsync({ slug, input: payload });
    router.push(ROUTES.adminProducts);
  }

  if (isLoading) {
    return <LoadingState message={CONTENT.editProductView.loading} />;
  }
  if (isError || !product) {
    return <ErrorState message={CONTENT.editProductView.loadError} onRetry={() => refetch()} />;
  }
  if (product.isComposite) {
    return (
      <div className="flex flex-col gap-lg">
        <h1 className="mb-1 text-2xl">{CONTENT.editProductView.heading}</h1>
        <p className="text-base text-foreground/70">{CONTENT.editProductView.compositeUnsupported}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <h1 className="mb-1 text-2xl">{CONTENT.editProductView.heading}</h1>
      <ProductForm
        slugLocked
        product={product}
        defaultValues={{
          slug: product.slug,
          name: product.name,
          description: product.description,
          sku: product.sku,
          category: product.category,
          colors: product.colors,
          occasions: product.occasions,
          species: product.species ?? "",
          size: product.size,
          season: product.season,
          tags: product.tags,
          isFeatured: product.isFeatured,
          stockCount: product.stockCount,
          priceDollars: product.price / 100,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
