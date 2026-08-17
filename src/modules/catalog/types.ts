/** Mirrors the `products` collection in specs/data-model.md. */

export type ProductCategory =
  | "Flowers"
  | "Bouquets"
  | "Vases & Containers"
  | "Greenery & Fillers"
  | "Gift Add-ons";

export type ProductSize = "small" | "medium" | "large";

export type ProductSeason = "spring" | "summer" | "autumn" | "winter" | "all-year";

export interface ProductComponent {
  productId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  category: ProductCategory;
  isComposite: boolean;
  components?: ProductComponent[];
  colors: string[];
  occasions: string[];
  species?: string;
  size: ProductSize;
  season: ProductSeason;
  tags: string[];
  isFeatured: boolean;
  /** AUD, minor units (cents). */
  price: number;
  stockCount: number;
  inStock: boolean;
  images: string[];
  primaryImageIndex: number;
}
