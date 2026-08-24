"use client";

import { Button } from "@/shared/components/atoms/Button";
import { ROUTES } from "@/shared/routes";
import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT } from "@/modules/cart/content";
import { useCart } from "@/modules/cart/hooks/useCart";
import { CartLineItemRow } from "./CartLineItemRow";

export function CartView() {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-md px-lg py-2xl text-center">
        <p className="text-lg text-foreground/70">{CONTENT.cartView.empty}</p>
        <Button href={ROUTES.products.list}>{CONTENT.cartView.continueShopping}</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-lg py-lg">
      <h1 className="mb-lg text-2xl">{CONTENT.cartView.heading}</h1>
      <div className="flex flex-col">
        {items.map((item) => (
          <CartLineItemRow key={item.productId} item={item} />
        ))}
      </div>
      <div className="mt-lg flex items-center justify-between">
        <span className="text-lg text-foreground/70">{CONTENT.cartView.subtotal}</span>
        <span className="font-heading text-2xl text-accent-700">{formatPrice(subtotal)}</span>
      </div>
      <Button href={ROUTES.checkout} variant="primary" block className="mt-lg">
        {CONTENT.cartView.checkout}
      </Button>
    </div>
  );
}
