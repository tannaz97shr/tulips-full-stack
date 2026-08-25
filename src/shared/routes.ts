export const ROUTES = {
  home: "/",
  products: {
    list: "/products",
    detail: (slug: string) => `/products/${slug}`,
  },
  signIn: "/sign-in",
  signInWithCallback: (target: string) => `/sign-in?callbackUrl=${encodeURIComponent(target)}`,
  signUp: "/sign-up",
  account: "/account",
  admin: "/admin",
  adminProducts: "/admin/products",
  adminNewProduct: "/admin/products/new",
  adminEditProduct: (slug: string) => `/admin/products/${encodeURIComponent(slug)}/edit`,
  adminOrders: "/admin/orders",
  orders: "/orders",
  cart: "/cart",
  checkout: "/checkout",
} as const;
