import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT } from "@/modules/orders/content";
import type { Order } from "@/modules/orders/types";

interface OrderReceiptProps {
  order: Order;
}

// deliveryDate is a plain "YYYY-MM-DD" calendar date (not a timestamp) —
// reformatted by splitting the string rather than via `Date`, since
// parsing "YYYY-MM-DD" as UTC midnight and rendering in a local timezone
// can shift the displayed date by a day.
function formatDeliveryDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function OrderReceipt({ order }: OrderReceiptProps) {
  const address = order.deliveryAddress;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-lg px-lg py-lg text-left">
      <div>
        <h2 className="mb-sm text-lg">{CONTENT.orderReceipt.items}</h2>
        <div className="flex flex-col">
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-md border-b border-divider py-sm"
            >
              <div className="flex flex-col">
                <span className="text-base">{item.name}</span>
                <span className="text-sm text-foreground/70">
                  {CONTENT.orderReceipt.itemQuantity(item.quantity)} × {formatPrice(item.price)}
                </span>
              </div>
              <span className="font-heading text-base">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-base">
        <span className="text-foreground/70">{CONTENT.orderReceipt.recipient}</span>
        <span>{order.recipientName}</span>
        <span className="mt-sm text-foreground/70">{CONTENT.orderReceipt.deliveryAddress}</span>
        <span>
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}
        </span>
        <span>
          {address.suburb} {address.state} {address.postcode}
        </span>
        <span className="mt-sm text-foreground/70">{CONTENT.orderReceipt.deliveryDate}</span>
        <span>{formatDeliveryDate(order.deliveryDate)}</span>
      </div>

      <div className="flex flex-col gap-1 border-t border-divider pt-md text-base">
        <div className="flex items-center justify-between">
          <span className="text-foreground/70">{CONTENT.orderReceipt.subtotal}</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground/70">{CONTENT.orderReceipt.tax}</span>
          <span>{formatPrice(order.tax)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-heading text-lg">{CONTENT.orderReceipt.total}</span>
          <span className="font-heading text-lg text-accent-700">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
