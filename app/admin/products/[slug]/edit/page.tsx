import { EditProductView } from "@/modules/admin/components/EditProductView";

export default async function EditProductPage(props: PageProps<"/admin/products/[slug]/edit">) {
  const { slug } = await props.params;

  return <EditProductView slug={slug} />;
}
