import type { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { Product } from "@/modules/catalog/types";

/**
 * Seeded/written docs store `slug` only as the Firestore doc ID (see
 * scripts/seed-products.ts), never as a field in the document data — so
 * both `id` and `slug` are derived from `doc.id` here, not `doc.data()`.
 * Fields are picked explicitly (rather than spreading `doc.data()`) so
 * extra stored fields — e.g. `createdAt`/`updatedAt`, which serialize to
 * Firestore's internal `{ _seconds, _nanoseconds }` shape — never leak into
 * the API response.
 */
export function toProduct(doc: QueryDocumentSnapshot | DocumentSnapshot): Product {
  const data = doc.data() as Omit<Product, "id" | "slug">;
  return {
    id: doc.id,
    slug: doc.id,
    name: data.name,
    description: data.description,
    sku: data.sku,
    category: data.category,
    isComposite: data.isComposite,
    components: data.components,
    colors: data.colors,
    occasions: data.occasions,
    species: data.species,
    size: data.size,
    season: data.season,
    tags: data.tags,
    isFeatured: data.isFeatured,
    price: data.price,
    stockCount: data.stockCount,
    inStock: data.inStock,
    images: data.images,
    primaryImageIndex: data.primaryImageIndex,
  };
}
