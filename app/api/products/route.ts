import type { DocumentData, Query } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import { toProduct } from "@/modules/catalog/lib/toProduct";
import type { Product, ProductCategory } from "@/modules/catalog/types";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function matchesAny(productValues: string[], filterValues: string[]): boolean {
  const lowerProductValues = productValues.map((value) => value.toLowerCase());
  return filterValues.some((value) => lowerProductValues.includes(value.toLowerCase()));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const categories = searchParams.getAll("category") as ProductCategory[];
    const colors = searchParams.getAll("color");
    const occasions = searchParams.getAll("occasion");
    const season = searchParams.get("season");
    const size = searchParams.get("size");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const excludeSlug = searchParams.get("excludeSlug");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    // Public, unauthenticated endpoint — clamp pageSize so a caller can't
    // request the entire collection in one request.
    const pageSize = clamp(Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);

    const db = getAdminFirestore();
    let query: Query<DocumentData> = db.collection("products");
    if (categories.length > 0) {
      query = query.where("category", "in", categories.slice(0, 10));
    }

    const snapshot = await query.get();
    let products: Product[] = snapshot.docs.map(toProduct);

    // Firestore allows at most one array-contains(-any) clause per query, so
    // `colors` and `occasions` can never both be filtered server-side in a
    // single Firestore query. Narrow by `category` above (the one dimension
    // specs/data-model.md anticipates an index for), then filter the rest
    // in-memory — fine at MVP catalog scale.
    if (colors.length > 0) {
      products = products.filter((product) => matchesAny(product.colors, colors));
    }
    if (occasions.length > 0) {
      products = products.filter((product) => matchesAny(product.occasions, occasions));
    }
    if (season) {
      products = products.filter((product) => product.season === season);
    }
    if (size) {
      products = products.filter((product) => product.size === size);
    }
    if (minPrice) {
      products = products.filter((product) => product.price >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter((product) => product.price <= Number(maxPrice));
    }
    if (inStockOnly) {
      products = products.filter((product) => product.inStock);
    }
    if (excludeSlug) {
      products = products.filter((product) => product.slug !== excludeSlug);
    }

    const totalCount = products.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = (page - 1) * pageSize;
    const pageItems = products.slice(start, start + pageSize);

    return Response.json({
      products: pageItems,
      page,
      pageSize,
      totalCount,
      totalPages,
    });
  } catch (error) {
    // Never forward raw Firestore/Admin SDK error details to the client.
    console.error("Failed to list products:", error);
    return Response.json({ error: "Failed to load products" }, { status: 500 });
  }
}
