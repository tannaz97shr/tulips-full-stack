import { ProductCard } from "@/shared/components/molecules/ProductCard";
import { cn } from "@/shared/utils/cn";
import type { Product } from "@/modules/catalog/types";

interface FeaturedGridProps {
  products: Product[];
}

/**
 * Caps the grid's column count at the actual item count (up to 4) so a
 * short featured list — e.g. 2 products — doesn't leave empty trailing
 * columns at wider breakpoints. `ProductGrid` (the Shop page's paginated
 * grid) intentionally stays fixed at 2/3/4 columns and isn't reused here.
 */
const GRID_COLS_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
};
const DEFAULT_GRID_COLS = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

export function FeaturedGrid({ products }: FeaturedGridProps) {
  return (
    <div className={cn("grid gap-lg", GRID_COLS_CLASSES[products.length] ?? DEFAULT_GRID_COLS)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
