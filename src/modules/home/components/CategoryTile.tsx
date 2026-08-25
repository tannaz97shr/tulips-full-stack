"use client";

import Link from "next/link";
import { ProductImage } from "@/shared/components/molecules/ProductImage";
import { ROUTES } from "@/shared/routes";
import { useProducts } from "@/modules/catalog/hooks/useProducts";
import type { ProductCategory } from "@/modules/catalog/types";

interface CategoryTileProps {
  category: ProductCategory;
}

export function CategoryTile({ category }: CategoryTileProps) {
  const { data } = useProducts({ category: [category], inStockOnly: true, pageSize: 1 });
  const product = data?.products[0];

  return (
    <Link href={ROUTES.products.byCategory(category)} className="group">
      <ProductImage
        src={product?.images[product.primaryImageIndex]}
        alt={product?.name ?? category}
        sizes="(max-width: 768px) 50vw, 20vw"
        aspectRatio="1/1"
        rounded="md"
        caption={`${category} — photo`}
        className="transition-transform group-hover:scale-[1.03]"
      />
      <div className="mt-2 font-heading text-sm">{category}</div>
    </Link>
  );
}
