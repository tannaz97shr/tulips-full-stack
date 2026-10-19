export const CONTENT = {
  cartView: {
    heading: "Cart",
    loading: "Loading…",
    empty: "Your cart is empty.",
    continueShopping: "Continue shopping",
    remove: "Remove",
    total: "Total",
    includesGst: (amount: string) => `Includes GST of ${amount}`,
    checkout: "Checkout",
  },
  addToCart: {
    added: "Added",
  },
} as const;
