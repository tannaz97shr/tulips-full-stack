import { ProductDetailView } from "@/modules/catalog/components/ProductDetailView";
import { PLACEHOLDER_PRODUCTS } from "@/modules/catalog/data/placeholder-products";
import { notFound } from "next/navigation";

export default async function ProductDetailPage(
  props: PageProps<"/products/[slug]">,
) {
  const { slug } = await props.params;
  const product = PLACEHOLDER_PRODUCTS.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const related = PLACEHOLDER_PRODUCTS.filter(
    (item) => item.id !== product.id && item.category === product.category,
  )
    .concat(
      PLACEHOLDER_PRODUCTS.filter(
        (item) => item.id !== product.id && item.category !== product.category,
      ),
    )
    .slice(0, 4);

  return <ProductDetailView product={product} related={related} />;
}
