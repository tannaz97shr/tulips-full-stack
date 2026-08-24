"use client";

import { useEffect } from "react";
import { isAxiosError } from "axios";
import { Button } from "@/shared/components/atoms/Button";
import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { ROUTES } from "@/shared/routes";
import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT } from "@/modules/orders/content";
import { useOrder } from "@/modules/orders/hooks/useOrder";
import { useCart } from "@/modules/cart/hooks/useCart";

interface OrderConfirmationViewProps {
  orderId: string;
}

export function OrderConfirmationView({ orderId }: OrderConfirmationViewProps) {
  const { data: order, isLoading, isError, error, refetch } = useOrder(orderId);
  const { clear } = useCart();

  // Cart is cleared only once the webhook-confirmed status actually lands as
  // Paid — not at checkout submission — so a failed/abandoned payment
  // leaves the cart intact for the customer to retry.
  useEffect(() => {
    if (order?.status === "Paid") {
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status]);

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
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-md px-lg py-2xl text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-accent" />
        <h1 className="text-2xl">{CONTENT.orderConfirmationView.pending}</h1>
        <p className="text-base text-foreground/70">{CONTENT.orderConfirmationView.pendingDetail}</p>
      </div>
    );
  }

  if (order.status === "Failed") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-md px-lg py-2xl text-center">
        <h1 className="text-2xl">{CONTENT.orderConfirmationView.failedHeading}</h1>
        <p className="text-base text-foreground/70">{CONTENT.orderConfirmationView.failedDetail}</p>
        <Button href={ROUTES.checkout}>{CONTENT.orderConfirmationView.tryAgain}</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-md px-lg py-2xl text-center">
      <h1 className="text-2xl">{CONTENT.orderConfirmationView.paidHeading}</h1>
      <p className="text-base text-foreground/70">{CONTENT.orderConfirmationView.paidDetail(order.id)}</p>
      <p className="font-heading text-2xl text-accent-700">{formatPrice(order.total)}</p>
      <Button href={ROUTES.products.list}>{CONTENT.orderConfirmationView.backToShop}</Button>
    </div>
  );
}
