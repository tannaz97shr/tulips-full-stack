import type { ProductCategory, ProductSeason, ProductSize } from "./types";

export const CATEGORIES: ProductCategory[] = [
  "Flowers",
  "Bouquets",
  "Vases & Containers",
  "Greenery & Fillers",
  "Gift Add-ons",
];

export const OCCASIONS = [
  "Everyday",
  "Birthday",
  "Anniversary",
  "Wedding",
  "Sympathy",
  "Get Well",
  "Congratulations",
];

export const COLORS = ["Yellow", "Pink", "Red", "White", "Cream", "Green", "Purple", "Mixed", "Assorted", "Natural"];

export const SEASONS: ProductSeason[] = ["spring", "summer", "autumn", "winter", "all-year"];

export const SIZES: ProductSize[] = ["small", "medium", "large"];

export const PRICE_PRESETS = ["Under $25", "$25 - $50", "$50+"] as const;

export const PRICE_PRESET_RANGES: Record<(typeof PRICE_PRESETS)[number], { minPrice?: number; maxPrice?: number }> = {
  "Under $25": { maxPrice: 2500 },
  "$25 - $50": { minPrice: 2500, maxPrice: 5000 },
  "$50+": { minPrice: 5000 },
};
