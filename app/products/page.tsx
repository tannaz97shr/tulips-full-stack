import { ProductsView } from "@/modules/catalog/components/ProductsView";
import { PLACEHOLDER_PRODUCTS } from "@/modules/catalog/data/placeholder-products";

export default function ProductsPage() {
  return <ProductsView products={PLACEHOLDER_PRODUCTS} />;
}
