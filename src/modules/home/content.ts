export const CONTENT = {
  hero: {
    freshWeekly: "Fresh weekly",
    heading: "Flowers that feel like home.",
    subheading: "Hand-tied bouquets, potted greenery and gifts, arranged and delivered the same day.",
    shopCta: "Shop the collection",
    heroCaption: (name: string) => `${name} — hero photo`,
  },
  categories: {
    heading: "Browse by category",
  },
  featured: {
    heading: "Featured this week",
  },
  valueProps: [
    { icon: "truck", label: "Same-day delivery" },
    { icon: "shield", label: "Real secure checkout" },
    { icon: "leaf", label: "Freshness guaranteed" },
  ],
} as const;
