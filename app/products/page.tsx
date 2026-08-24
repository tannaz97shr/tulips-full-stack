import { Suspense } from "react";
import { ProductsView, ProductsViewSkeleton } from "@/modules/catalog/components/ProductsView";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsViewSkeleton />}>
      <ProductsView />
    </Suspense>
  );
}
