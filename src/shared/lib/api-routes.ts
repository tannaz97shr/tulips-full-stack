export const API_ROUTES = {
  auth: {
    register: "/auth/register",
  },
  products: {
    list: "/products",
    detail: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  },
  admin: {
    products: {
      create: "/admin/products",
      update: (slug: string) => `/admin/products/${encodeURIComponent(slug)}`,
    },
  },
} as const;
