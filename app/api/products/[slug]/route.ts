import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import { toProduct } from "@/modules/catalog/lib/toProduct";

export async function GET(_request: Request, { params }: RouteContext<"/api/products/[slug]">) {
  try {
    const { slug } = await params;
    const db = getAdminFirestore();
    // `slug` is the Firestore doc ID (see scripts/seed-products.ts), not a
    // stored field — a `where("slug", "==", slug)` query would match
    // nothing and 404 every real product. Look up by doc ID directly.
    const doc = await db.collection("products").doc(slug).get();

    if (!doc.exists) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ product: toProduct(doc) });
  } catch (error) {
    console.error("Failed to load product:", error);
    return Response.json({ error: "Failed to load product" }, { status: 500 });
  }
}
