import { OrderConfirmationView } from "@/modules/orders/components/OrderConfirmationView";

export default async function OrderConfirmationPage(props: PageProps<"/orders/[orderId]">) {
  const { orderId } = await props.params;

  return <OrderConfirmationView orderId={orderId} />;
}
