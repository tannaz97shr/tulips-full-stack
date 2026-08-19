export const CONTENT = {
  shell: {
    heading: "Admin",
    nav: {
      products: "Products",
    },
  },
  productsView: {
    heading: "Products",
    loading: "Loading…",
    productsCount: (count: number) => `${count} products`,
    loadError: "We couldn't load products.",
    emptyState: "No products yet.",
  },
  productsTable: {
    columns: {
      image: "Image",
      name: "Name",
      sku: "SKU",
      category: "Category",
      price: "Price",
      stock: "Stock",
      status: "Status",
    },
    inStock: "In stock",
    outOfStock: "Out of stock",
    composite: "Bouquet",
    featured: "Featured",
  },
} as const;
