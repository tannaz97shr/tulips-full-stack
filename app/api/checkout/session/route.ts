import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import { getStripe } from "@/shared/lib/stripe";
import { logError } from "@/shared/lib/log-error";
import { requireSession } from "@/modules/auth/lib/requireSession";
import { checkoutSchema } from "@/modules/checkout/lib/schemas";
import { gstIncluded, sumLineItems } from "@/modules/checkout/lib/pricing";
import { createPendingOrder, attachStripeSessionId, markOrderFailed } from "@/modules/orders/lib/orderRepository";
import type { OrderLineItem } from "@/modules/orders/types";
import { ROUTES } from "@/shared/routes";
import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT as CHECKOUT_CONTENT } from "@/modules/checkout/content";

interface ProductSnapshotDoc {
  name: string;
  price: number;
  stockCount: number;
  inStock: boolean;
}

export async function POST(request: Request) {
  const { session, error: authError } = await requireSession();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { recipientName, deliveryAddress, deliveryDate, items } = parsed.data;

    // Re-fetch every product server-side — client-submitted price/name/stock
    // is never trusted, only productId + quantity.
    const db = getAdminFirestore();
    const productsCol = db.collection("products");
    const productSnaps = await Promise.all(items.map((item) => productsCol.doc(item.productId).get()));

    const unavailable: { productId: string; name: string; requested: number; available: number }[] = [];
    const orderItems: OrderLineItem[] = [];

    productSnaps.forEach((snap, i) => {
      const requested = items[i].quantity;
      if (!snap.exists) {
        unavailable.push({ productId: items[i].productId, name: "Unknown product", requested, available: 0 });
        return;
      }
      const data = snap.data() as ProductSnapshotDoc;
      if (!data.inStock || data.stockCount < requested) {
        unavailable.push({ productId: snap.id, name: data.name, requested, available: data.stockCount });
        return;
      }
      orderItems.push({ productId: snap.id, name: data.name, price: data.price, quantity: requested });
    });

    if (unavailable.length > 0) {
      return Response.json({ error: "Some items are no longer available", unavailable }, { status: 409 });
    }

    // Prices are GST-inclusive (Australian retail): the total is the sum of
    // the items, and GST is the component already inside it — never added on top.
    const total = sumLineItems(orderItems);
    const gst = gstIncluded(total);

    const order = await createPendingOrder({
      userId: session.user.id,
      items: orderItems,
      recipientName,
      deliveryAddress,
      deliveryDate,
      subtotal: total,
      tax: gst,
      total,
      gstInclusive: true,
    });

    const origin = new URL(request.url).origin;
    const stripe = getStripe();

    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "aud",
        client_reference_id: order.id,
        metadata: { orderId: order.id },
        line_items: orderItems.map((item) => ({
          price_data: {
            currency: "aud",
            product_data: { name: item.name },
            unit_amount: item.price,
          },
          quantity: item.quantity,
        })),
        custom_text: {
          submit: { message: CHECKOUT_CONTENT.stripe.includesGst(formatPrice(gst)) },
        },
        success_url: `${origin}${ROUTES.orders}/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${ROUTES.checkout}`,
      });

      await attachStripeSessionId(order.id, checkoutSession.id);

      return Response.json({ url: checkoutSession.url }, { status: 201 });
    } catch (stripeError) {
      await markOrderFailed(order.id);
      logError(stripeError, "POST /api/checkout/session: Stripe session creation failed");
      return Response.json({ error: "Failed to start checkout" }, { status: 500 });
    }
  } catch (error) {
    logError(error, "POST /api/checkout/session");
    return Response.json({ error: "Failed to start checkout" }, { status: 500 });
  }
}
