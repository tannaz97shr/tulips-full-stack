import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import { logError } from "@/shared/lib/log-error";
import { toProduct } from "@/modules/catalog/lib/toProduct";
import { productWriteSchema } from "@/modules/admin/lib/schemas";
import { requireAdminSession } from "@/modules/admin/lib/requireAdminSession";

// slug and isComposite are immutable after creation (slug is the Firestore
// doc ID, see toProduct.ts; a product can't switch between standalone and
// composite) — neither is accepted in the edit payload.
const productUpdateSchema = productWriteSchema.omit({ slug: true, isComposite: true });

export async function PUT(request: Request, { params }: RouteContext<"/api/admin/products/[slug]">) {
  const { error: authError } = await requireAdminSession();
  if (authError) return authError;

  try {
    const { slug } = await params;
    const db = getAdminFirestore();
    const ref = db.collection("products").doc(slug);
    const existing = await ref.get();

    if (!existing.exists) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }
    const isComposite = existing.data()?.isComposite === true;

    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    if (isComposite && (!parsed.data.components || parsed.data.components.length === 0)) {
      return Response.json({ error: "Bouquets need at least one component" }, { status: 400 });
    }

    const { species, components, ...rest } = parsed.data;
    await ref.update({
      ...rest,
      species: species ? species : FieldValue.delete(),
      ...(isComposite ? { components: components ?? [] } : {}),
      inStock: rest.stockCount > 0,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const doc = await ref.get();
    return Response.json({ product: toProduct(doc) });
  } catch (error) {
    logError(error, "PUT /api/admin/products/[slug]");
    return Response.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext<"/api/admin/products/[slug]">) {
  const { error: authError } = await requireAdminSession();
  if (authError) return authError;

  try {
    const { slug } = await params;
    const db = getAdminFirestore();
    const ref = db.collection("products").doc(slug);
    const existing = await ref.get();

    if (!existing.exists) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    await ref.delete();
    return new Response(null, { status: 204 });
  } catch (error) {
    logError(error, "DELETE /api/admin/products/[slug]");
    return Response.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
