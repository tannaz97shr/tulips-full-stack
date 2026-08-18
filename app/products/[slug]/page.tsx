import { ProductDetailView } from "@/modules/catalog/components/ProductDetailView";

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;

  return <ProductDetailView slug={slug} />;
}
