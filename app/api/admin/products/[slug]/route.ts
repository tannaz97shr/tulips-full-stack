import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import { toProduct } from "@/modules/catalog/lib/toProduct";
import { productWriteSchema } from "@/modules/admin/lib/schemas";
import { requireAdminSession } from "@/modules/admin/lib/requireAdminSession";

// slug is the Firestore doc ID (see toProduct.ts) and is immutable after
// creation — never accepted in the edit payload.
const productUpdateSchema = productWriteSchema.omit({ slug: true });

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
    if (existing.data()?.isComposite === true) {
      return Response.json({ error: "Bouquets can't be edited through this endpoint yet" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { species, ...rest } = parsed.data;
    await ref.update({
      ...rest,
      species: species ? species : FieldValue.delete(),
      inStock: rest.stockCount > 0,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const doc = await ref.get();
    return Response.json({ product: toProduct(doc) });
  } catch (error) {
    console.error("Failed to update product:", error);
    return Response.json({ error: "Failed to update product" }, { status: 500 });
  }
}
