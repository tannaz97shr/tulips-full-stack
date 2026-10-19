import { ProductDetailView } from "@/modules/catalog/components/ProductDetailView";

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;

  // Keyed by slug so per-product UI state (selected image, quantity) resets
  // when navigating between products, e.g. via "Related products".
  return <ProductDetailView key={slug} slug={slug} />;
}
