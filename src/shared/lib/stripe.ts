import Stripe from "stripe";

// Module-level cache, same pattern as getFirebaseAdminApp() in firebase-admin.ts.
let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Missing required env var: STRIPE_SECRET_KEY");
    }
    stripe = new Stripe(secretKey, { apiVersion: "2026-07-29.dahlia" });
  }
  return stripe;
}
