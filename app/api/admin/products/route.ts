import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import { logError } from "@/shared/lib/log-error";
import { toProduct } from "@/modules/catalog/lib/toProduct";
import { productWriteSchema } from "@/modules/admin/lib/schemas";
import { requireAdminSession } from "@/modules/admin/lib/requireAdminSession";

// gRPC status code Firestore's Admin SDK throws from DocumentReference.create()
// when the doc already exists.
const FIRESTORE_ALREADY_EXISTS = 6;

export async function POST(request: Request) {
  const { error: authError } = await requireAdminSession();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = productWriteSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { slug, species, ...rest } = parsed.data;
    const db = getAdminFirestore();
    const ref = db.collection("products").doc(slug);

    try {
      await ref.create({
        ...rest,
        ...(species ? { species } : {}),
        isComposite: false,
        inStock: rest.stockCount > 0,
        images: [],
        primaryImageIndex: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (createError) {
      if ((createError as { code?: number }).code === FIRESTORE_ALREADY_EXISTS) {
        return Response.json({ error: "A product with this slug already exists" }, { status: 409 });
      }
      throw createError;
    }

    const doc = await ref.get();
    return Response.json({ product: toProduct(doc) }, { status: 201 });
  } catch (error) {
    logError(error, "POST /api/admin/products");
    return Response.json({ error: "Failed to create product" }, { status: 500 });
  }
}
