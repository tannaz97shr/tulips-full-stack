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
      images: (slug: string) => `/admin/products/${encodeURIComponent(slug)}/images`,
    },
    orders: {
      list: "/admin/orders",
      updateStatus: (orderId: string) => `/admin/orders/${encodeURIComponent(orderId)}`,
    },
  },
  checkout: {
    session: "/checkout/session",
  },
  orders: {
    list: "/orders",
    detail: (orderId: string) => `/orders/${encodeURIComponent(orderId)}`,
  },
} as const;
