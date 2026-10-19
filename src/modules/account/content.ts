export const CONTENT = {
  accountView: {
    heading: "Your account",
    greeting: (name: string) => `Hi, ${name}`,
    detailsHeading: "Account details",
    nameLabel: "Name",
    emailLabel: "Email",
    shortcutsHeading: "Shortcuts",
    orders: "Your orders",
    ordersDetail: "Track deliveries and view past receipts.",
    admin: "Admin dashboard",
    adminDetail: "Manage products, bouquets and orders.",
    signOut: "Sign out",
  },
} as const;
