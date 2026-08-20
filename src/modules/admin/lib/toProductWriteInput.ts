import type { Product } from "@/modules/catalog/types";
import type { ProductWriteInput } from "@/modules/admin/lib/schemas";

/** Maps a loaded `Product` back to the PUT route's payload shape (cents, no slug/isComposite/inStock/images). */
export function toProductWriteInput(product: Product): Omit<ProductWriteInput, "slug"> {
  return {
    name: product.name,
    description: product.description,
    sku: product.sku,
    category: product.category,
    colors: product.colors,
    occasions: product.occasions,
    species: product.species,
    size: product.size,
    season: product.season,
    tags: product.tags,
    isFeatured: product.isFeatured,
    price: product.price,
    stockCount: product.stockCount,
  };
}
