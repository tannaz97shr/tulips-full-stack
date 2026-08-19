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
  // no page yet — referenced only by auth.config.ts's protected-route list
  orders: "/orders",
  cart: "/cart",
  checkout: "/checkout",
} as const;
