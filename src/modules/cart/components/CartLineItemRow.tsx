"use client";

import Link from "next/link";
import { Button } from "@/shared/components/atoms/Button";
import { ProductImage } from "@/shared/components/molecules/ProductImage";
import { QuantityStepper } from "@/shared/components/molecules/QuantityStepper";
import { ROUTES } from "@/shared/routes";
import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT } from "@/modules/cart/content";
import { useCart } from "@/modules/cart/hooks/useCart";
import type { CartLineItem } from "@/modules/cart/types";

interface CartLineItemRowProps {
  item: CartLineItem;
}

export function CartLineItemRow({ item }: CartLineItemRowProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex flex-wrap items-center gap-md border-b border-divider py-md">
      <div className="flex min-w-48 flex-1 items-center gap-md">
        <ProductImage
          src={item.image}
          alt={item.name}
          sizes="80px"
          aspectRatio="1/1"
          rounded="md"
          className="h-20 w-20 flex-none"
        />
        <div className="flex flex-col gap-1">
          <Link href={ROUTES.products.detail(item.productId)} className="text-lg">
            {item.name}
          </Link>
          <span className="text-base text-foreground/70">{formatPrice(item.price)}</span>
        </div>
      </div>
      <div className="flex items-center gap-md">
        <QuantityStepper
          value={item.quantity}
          onChange={(quantity) => updateQuantity(item.productId, quantity)}
          max={item.maxStock}
        />
        <span className="w-20 text-right font-heading text-lg">{formatPrice(item.price * item.quantity)}</span>
        <Button variant="ghost" onClick={() => removeItem(item.productId)}>
          {CONTENT.cartView.remove}
        </Button>
      </div>
    </div>
  );
}
