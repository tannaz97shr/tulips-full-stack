"use client";

import { useEffect } from "react";
import { isAxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/atoms/Button";
import { Tag } from "@/shared/components/atoms/Tag";
import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { ROUTES } from "@/shared/routes";
import { CONTENT } from "@/modules/orders/content";
import { useOrder } from "@/modules/orders/hooks/useOrder";
import { useCart } from "@/modules/cart/hooks/useCart";
import { orderStatusTagVariant } from "@/modules/orders/lib/orderStatusTagVariant";
import { OrderReceipt } from "@/modules/orders/components/OrderReceipt";

interface OrderConfirmationViewProps {
  orderId: string;
}

export function OrderConfirmationView({ orderId }: OrderConfirmationViewProps) {
  // Stripe's success_url includes ?session_id=... — its presence is what
  // distinguishes "just landed here from checkout" from "opened this order
  // later from history." Only the former should ever poll or show the
  // actively-confirming-payment UI; a Pending order reached the other way
  // has nothing actively resolving in the background.
  const searchParams = useSearchParams();
  const cameFromCheckout = searchParams.get("session_id") !== null;

  const { data: order, isLoading, isError, error, refetch } = useOrder(orderId, { poll: cameFromCheckout });
  const { clear } = useCart();

  // Cart is cleared only once the webhook-confirmed status actually lands as
  // Paid — not at checkout submission — so a failed/abandoned payment
  // leaves the cart intact for the customer to retry.
  useEffect(() => {
    if (cameFromCheckout && order?.status === "Paid") {
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status, cameFromCheckout]);

  if (isLoading) {
    return <LoadingState message={CONTENT.orderConfirmationView.loading} />;
  }

  if (isError) {
    const notFound = isAxiosError(error) && error.response?.status === 404;
    if (notFound) {
      return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-md px-lg text-center">
          <p className="text-lg text-foreground/70">{CONTENT.orderConfirmationView.notFound}</p>
          <Button href={ROUTES.products.list}>{CONTENT.orderConfirmationView.backToShop}</Button>
        </div>
      );
    }
    return (
      <div className="mx-auto w-full max-w-2xl px-lg py-lg">
        <ErrorState message={CONTENT.orderConfirmationView.loadError} onRetry={() => refetch()} />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  if (order.status === "Pending") {
    if (cameFromCheckout) {
      return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-md px-lg py-2xl text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-accent" />
          <h1 className="text-2xl">{CONTENT.orderConfirmationView.pending}</h1>
          <p className="text-base text-foreground/70">{CONTENT.orderConfirmationView.pendingDetail}</p>
        </div>
      );
    }
    // Reached from history (or a stale/reopened link) rather than a fresh
    // checkout redirect — nothing is actively resolving this in the
    // background, so an indefinite spinner would just strand the customer.
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-md px-lg py-2xl text-center">
        <h1 className="text-2xl">{CONTENT.orderConfirmationView.stillProcessingHeading}</h1>
        <p className="text-base text-foreground/70">{CONTENT.orderConfirmationView.stillProcessingDetail}</p>
        <Button href={ROUTES.orders}>{CONTENT.orderConfirmationView.backToOrders}</Button>
      </div>
    );
  }

  if (order.status === "Failed" && cameFromCheckout) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-md px-lg py-2xl text-center">
        <h1 className="text-2xl">{CONTENT.orderConfirmationView.failedHeading}</h1>
        <p className="text-base text-foreground/70">{CONTENT.orderConfirmationView.failedDetail}</p>
        <Button href={ROUTES.checkout}>{CONTENT.orderConfirmationView.tryAgain}</Button>
      </div>
    );
  }

  // Resolved order — Paid/Processing/Delivered/Cancelled, or a Failed order
  // viewed from history rather than right after checkout. Receipt-style
  // view regardless of how we got here; only the heading differs for the
  // celebratory just-paid moment.
  const justPaid = cameFromCheckout && order.status === "Paid";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-md px-lg py-2xl text-center">
      {justPaid ? (
        <>
          <h1 className="text-2xl">{CONTENT.orderConfirmationView.paidHeading}</h1>
          <p className="text-base text-foreground/70">{CONTENT.orderConfirmationView.paidDetail(order.id)}</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl">{CONTENT.orderConfirmationView.orderHeading(order.id)}</h1>
          <Tag variant={orderStatusTagVariant(order.status)}>{order.status}</Tag>
        </>
      )}

      <OrderReceipt order={order} />

      <div className="flex flex-wrap items-center justify-center gap-sm">
        <Button href={ROUTES.orders}>{CONTENT.orderConfirmationView.backToOrders}</Button>
        {justPaid ? (
          <Button variant="secondary" href={ROUTES.products.list}>
            {CONTENT.orderConfirmationView.backToShop}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
