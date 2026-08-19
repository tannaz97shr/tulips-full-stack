export const CONTENT = {
  wordmark: "Tulips",
  header: {
    openMenu: "Open menu",
    home: "Home",
    shop: "Shop",
    search: "Search",
    account: "Account",
    cart: "Cart",
  },
  footer: {
    shopLinks: ["Flowers", "Bouquets", "Vases", "Greenery", "Gift add-ons"],
    companyLinks: ["About", "Careers", "Press"],
    helpLinks: ["Shipping", "Returns", "Contact"],
    tagline: "A portfolio demo of a flower and bouquet shop — real checkout flow, fictional store.",
    shopColumnTitle: "Shop",
    companyColumnTitle: "Company",
    helpColumnTitle: "Help",
    disclaimer: "Tulips is a portfolio project. Not a real store.",
  },
  mobileDrawer: {
    closeMenu: "Close menu",
    home: "Home",
    shopAll: "Shop all",
    categories: "Categories",
  },
  themeToggle: {
    toggleTheme: "Toggle theme",
  },
  errorState: {
    defaultMessage: "Something went wrong.",
    retry: "Try again",
  },
  loadingState: {
    defaultMessage: "Loading…",
  },
  productCard: {
    photoCaption: (name: string) => `${name} — photo`,
    toggleWishlist: "Toggle wishlist",
    outOfStock: "Out of stock",
  },
  quantityStepper: {
    decrease: "Decrease quantity",
    increase: "Increase quantity",
  },
  rootLayout: {
    title: "Tulips — flowers & bouquets",
    description: "A portfolio demo of a flower and bouquet shop.",
  },
  home: {
    freshWeekly: "Fresh weekly",
    heading: "Flowers that feel like home.",
    subheading: "Hand-tied bouquets, potted greenery and gifts, arranged and delivered the same day.",
    shopCta: "Shop the collection",
    heroCaption: "hero photo — bouquet on a table",
    categoriesHeading: "Shop by category",
  },
} as const;
