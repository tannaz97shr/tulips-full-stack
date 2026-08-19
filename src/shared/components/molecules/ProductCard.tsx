"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag } from "@/shared/components/atoms/Tag";
import { HeartIcon } from "@/shared/components/icons";
import { CONTENT } from "@/shared/content";
import { ROUTES } from "@/shared/routes";
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
      href={ROUTES.products.detail(product.slug)}
      className="group flex flex-col gap-2 rounded-md transition-transform hover:-translate-y-1"
    >
      <div className="relative">
        <PlaceholderImage aspectRatio="4/5" caption={CONTENT.productCard.photoCaption(product.name)} />
        <button
          type="button"
          aria-label={CONTENT.productCard.toggleWishlist}
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
            {CONTENT.productCard.outOfStock}
          </Tag>
        ) : null}
      </div>
      <div className="text-2xs tracking-wide text-accent uppercase">{product.category}</div>
      <div className="font-heading text-lg leading-tight">{product.name}</div>
      <div className="font-heading text-lg">{formatPrice(product.price)}</div>
    </Link>
  );
}
