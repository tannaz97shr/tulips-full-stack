"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag } from "@/shared/components/atoms/Tag";
import { HeartIcon } from "@/shared/components/icons";
import { formatPrice } from "@/shared/utils/formatPrice";
import type { Product } from "@/modules/catalog/types";
import { PlaceholderImage } from "./PlaceholderImage";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-2 rounded-md transition-transform hover:-translate-y-1"
    >
      <div className="relative">
        <PlaceholderImage aspectRatio="4/5" caption={`${product.name} — photo`} />
        <button
          type="button"
          aria-label="Toggle wishlist"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setLiked((current) => !current);
          }}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background transition-transform hover:scale-110"
        >
          <HeartIcon
            width={16}
            height={16}
            className={liked ? "fill-accent stroke-accent" : "fill-none stroke-foreground"}
          />
        </button>
        {!product.inStock ? (
          <Tag variant="neutral" className="absolute bottom-2 left-2">
            Out of stock
          </Tag>
        ) : null}
      </div>
      <div className="text-[10px] tracking-wide text-accent uppercase">{product.category}</div>
      <div className="font-heading text-[17px] leading-tight">{product.name}</div>
      <div className="font-heading text-[15px]">{formatPrice(product.price)}</div>
    </Link>
  );
}
