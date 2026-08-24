import type Stripe from "stripe";
import { getStripe } from "@/shared/lib/stripe";
import { logError } from "@/shared/lib/log-error";
import { settleOrder } from "@/modules/orders/lib/orderRepository";

const PAID_EVENT_TYPES = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);
const FAILED_EVENT_TYPES = new Set(["checkout.session.async_payment_failed", "checkout.session.expired"]);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    // Not constructEvent(): this project runs under Bun (bun run dev -> next
    // dev, and Bun intercepts the Node-shebang `next` binary), and Stripe's
    // package.json declares a "bun" export condition that resolves to its
    // worker/edge build (Web Crypto only, no synchronous HMAC). The sync
    // constructEvent() throws under that build; constructEventAsync() is
    // Stripe's documented edge/worker-safe variant.
    event = await getStripe().webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (error) {
    logError(error, "POST /api/webhooks/stripe: signature verification failed");
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const isPaid = PAID_EVENT_TYPES.has(event.type);
  const isFailed = FAILED_EVENT_TYPES.has(event.type);
  if (!isPaid && !isFailed) {
    // Not a checkout-outcome event — acknowledge and ignore.
    return Response.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // checkout.session.completed can fire with payment_status "unpaid" for
  // async payment methods (e.g. some bank transfers) — the real outcome
  // then arrives via async_payment_succeeded/failed. Don't settle early.
  if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
    return Response.json({ received: true });
  }

  const orderId = session.metadata?.orderId ?? session.client_reference_id;
  if (!orderId) {
    logError(new Error("Stripe webhook event missing orderId"), {
      route: "POST /api/webhooks/stripe",
      eventId: event.id,
      eventType: event.type,
    });
    return Response.json({ received: true });
  }

  const result = await settleOrder({
    orderId,
    eventId: event.id,
    outcome: isPaid ? "paid" : "failed",
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
  });

  if (result.finalStatus === "Failed") {
    logError(new Error("Order failed"), {
      route: "POST /api/webhooks/stripe",
      orderId,
      eventId: event.id,
      eventType: event.type,
    });
  } else if (result.finalStatus === null) {
    logError(new Error("Webhook event referenced an unknown order"), {
      route: "POST /api/webhooks/stripe",
      orderId,
      eventId: event.id,
    });
  }

  return Response.json({ received: true });
}
