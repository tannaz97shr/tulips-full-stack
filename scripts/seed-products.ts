/**
 * Seeds the `products` Firestore collection with a fixed, representative
 * catalog: 6 standalone products spanning every category/color/occasion/
 * season/size, plus 1 admin-curated bouquet composed from two of them.
 *
 * Run with: bun run scripts/seed-products.ts
 * (Bun auto-loads .env.local; do not run with plain `node`.)
 */
import { FieldValue } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import type { Product } from "@/modules/catalog/types";

type SeedProduct = Omit<Product, "id"> & {
  slug: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

function seedProduct(product: Omit<SeedProduct, "createdAt" | "updatedAt">): SeedProduct {
  return {
    ...product,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

const PRODUCTS: SeedProduct[] = [
  seedProduct({
    slug: "red-rose-stems",
    name: "Red Rose Stems (Dozen)",
    description: "A dozen classic long-stemmed red roses, hand-tied and ready to gift.",
    sku: "SKU-RED-ROSE-STEMS",
    category: "Flowers",
    isComposite: false,
    colors: ["red"],
    occasions: ["anniversary", "wedding", "everyday"],
    species: "Rose",
    size: "medium",
    season: "all-year",
    tags: ["classic", "romantic"],
    isFeatured: true,
    price: 6500,
    stockCount: 40,
    inStock: true,
    images: [],
    primaryImageIndex: 0,
  }),
  seedProduct({
    slug: "white-lily-stems",
    name: "White Lily Stems",
    description: "Elegant white lilies with a soft fragrance, perfect for solemn or formal occasions.",
    sku: "SKU-WHITE-LILY-STEMS",
    category: "Flowers",
    isComposite: false,
    colors: ["white"],
    occasions: ["sympathy", "wedding"],
    species: "Lily",
    size: "large",
    season: "spring",
    tags: ["elegant"],
    isFeatured: false,
    price: 5200,
    stockCount: 15,
    inStock: true,
    images: [],
    primaryImageIndex: 0,
  }),
  seedProduct({
    slug: "sunflower-stems-bunch",
    name: "Sunflower Stems (Bunch of 6)",
    description: "A cheerful bunch of six sunflowers, guaranteed to brighten someone's day.",
    sku: "SKU-SUNFLOWER-STEMS-BUNCH",
    category: "Flowers",
    isComposite: false,
    colors: ["yellow"],
    occasions: ["birthday", "get well", "everyday"],
    species: "Sunflower",
    size: "medium",
    season: "summer",
    tags: ["cheerful"],
    isFeatured: false,
    price: 3800,
    stockCount: 0,
    inStock: false,
    images: [],
    primaryImageIndex: 0,
  }),
  seedProduct({
    slug: "ceramic-bud-vase",
    name: "Ceramic Bud Vase",
    description: "A minimalist ceramic bud vase in cream and white, sized for a single stem or small bunch.",
    sku: "SKU-CERAMIC-BUD-VASE",
    category: "Vases & Containers",
    isComposite: false,
    colors: ["white", "cream"],
    occasions: ["everyday"],
    size: "small",
    season: "all-year",
    tags: ["home decor"],
    isFeatured: false,
    price: 2200,
    stockCount: 25,
    inStock: true,
    images: [],
    primaryImageIndex: 0,
  }),
  seedProduct({
    slug: "eucalyptus-greenery-bunch",
    name: "Eucalyptus Greenery Bunch",
    description: "Fragrant eucalyptus foliage, ideal as a filler for arrangements or on its own.",
    sku: "SKU-EUCALYPTUS-GREENERY-BUNCH",
    category: "Greenery & Fillers",
    isComposite: false,
    colors: ["green"],
    occasions: ["everyday", "wedding"],
    species: "Eucalyptus",
    size: "medium",
    season: "autumn",
    tags: ["filler", "fragrant"],
    isFeatured: false,
    price: 1800,
    stockCount: 30,
    inStock: true,
    images: [],
    primaryImageIndex: 0,
  }),
  seedProduct({
    slug: "card-and-chocolate-box",
    name: "Handwritten Card & Chocolate Box",
    description: "A boxed assortment of chocolates with a handwritten card, a perfect add-on gift.",
    sku: "SKU-CARD-AND-CHOCOLATE-BOX",
    category: "Gift Add-ons",
    isComposite: false,
    colors: ["assorted"],
    occasions: ["birthday", "anniversary", "congratulations"],
    size: "small",
    season: "winter",
    tags: ["add-on", "gift"],
    isFeatured: false,
    price: 1500,
    stockCount: 50,
    inStock: true,
    images: [],
    primaryImageIndex: 0,
  }),
  seedProduct({
    slug: "rose-lily-wedding-bouquet",
    name: "Rose & Lily Wedding Bouquet",
    description: "An admin-curated bouquet pairing red roses with white lilies, built for weddings and anniversaries.",
    sku: "SKU-ROSE-LILY-WEDDING-BOUQUET",
    category: "Bouquets",
    isComposite: true,
    components: [
      { productId: "red-rose-stems", quantity: 12 },
      { productId: "white-lily-stems", quantity: 6 },
    ],
    colors: ["red", "white"],
    occasions: ["wedding", "anniversary"],
    species: "Rose, Lily",
    size: "large",
    season: "all-year",
    tags: ["bestseller", "bouquet"],
    isFeatured: true,
    price: 9800,
    stockCount: 10,
    inStock: true,
    images: [],
    primaryImageIndex: 0,
  }),
];

async function main() {
  const db = getAdminFirestore();
  const batch = db.batch();

  for (const { slug, ...data } of PRODUCTS) {
    batch.set(db.collection("products").doc(slug), data);
  }

  console.log(`Seeding ${PRODUCTS.length} products...`);
  await batch.commit();
  for (const { slug } of PRODUCTS) {
    console.log(`  ✓ ${slug}`);
  }
  console.log("Done.");
}

main().catch((error: unknown) => {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
