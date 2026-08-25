import { Suspense } from "react";
import { OrderConfirmationView } from "@/modules/orders/components/OrderConfirmationView";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { CONTENT } from "@/modules/orders/content";

export default async function OrderConfirmationPage(props: PageProps<"/orders/[orderId]">) {
  const { orderId } = await props.params;

  return (
    <Suspense fallback={<LoadingState message={CONTENT.orderConfirmationView.loading} />}>
      <OrderConfirmationView orderId={orderId} />
    </Suspense>
  );
}
