export const CONTENT = {
  orderConfirmationView: {
    heading: "Order confirmation",
    pending: "Confirming your payment…",
    pendingDetail: "This can take a few seconds — please don't close this page.",
    paidHeading: "Thank you for your order!",
    paidDetail: (orderId: string) => `Order ${orderId} is confirmed.`,
    failedHeading: "We couldn't confirm this payment.",
    failedDetail: "If you were charged, please contact us — otherwise, feel free to try again.",
    backToShop: "Back to shop",
    tryAgain: "Try checkout again",
    loading: "Loading order…",
    loadError: "We couldn't load this order.",
    notFound: "We couldn't find that order.",
  },
} as const;
