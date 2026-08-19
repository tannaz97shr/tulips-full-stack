"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import Link from "next/link";
import { Button } from "@/shared/components/atoms/Button";
import { Tag } from "@/shared/components/atoms/Tag";
import { HeartIcon } from "@/shared/components/icons";
import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { PlaceholderImage } from "@/shared/components/molecules/PlaceholderImage";
import { ProductCard } from "@/shared/components/molecules/ProductCard";
import { QuantityStepper } from "@/shared/components/molecules/QuantityStepper";
import { formatPrice } from "@/shared/utils/formatPrice";
import { useProduct } from "@/modules/catalog/hooks/useProduct";
import { useProducts } from "@/modules/catalog/hooks/useProducts";
import type { Product } from "@/modules/catalog/types";

interface ProductDetailViewProps {
  slug: string;
}

function RelatedProducts({ related }: { related: Product[] }) {
  if (related.length === 0) {
    return null;
  }

  return (
    <section className="mt-2xl">
      <h2 className="mb-lg text-xl">You might also like</h2>
      <div className="grid grid-cols-2 gap-lg md:grid-cols-4">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}

export function ProductDetailView({ slug }: ProductDetailViewProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  const { data: product, isLoading, isError, error, refetch } = useProduct(slug);
  const { data: relatedData } = useProducts(
    { category: product ? [product.category] : undefined, excludeSlug: slug, pageSize: 4 },
    { enabled: Boolean(product) }
  );

  if (isLoading) {
    return <LoadingState message="Loading product…" />;
  }

  if (isError) {
    const notFound = isAxiosError(error) && error.response?.status === 404;

    if (notFound) {
      return (
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-md px-lg text-center">
          <p className="text-lg text-foreground/70">
            We couldn&apos;t find that product — it may have been removed.
          </p>
          <Button href="/products">Back to shop</Button>
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-7xl px-lg py-lg">
        <ErrorState message="We couldn't load this product." onRetry={() => refetch()} />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-lg py-lg">
      <div className="mb-lg text-base text-foreground/70">
        <Link href="/">Home</Link> / <Link href="/products">Shop</Link> / {product.category} /{" "}
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
        <div className="grid grid-cols-1 gap-md md:grid-cols-[76px_1fr]">
          <div className="flex flex-row gap-sm md:flex-col">
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`h-16 w-16 flex-none overflow-hidden rounded-sm border-2 ${
                  activeImage === index ? "border-accent" : "border-transparent"
                }`}
              >
                <PlaceholderImage aspectRatio="1/1" rounded="sm" />
              </button>
            ))}
          </div>
          <PlaceholderImage
            aspectRatio="4/5"
            rounded="lg"
            caption={`Image ${activeImage + 1} of 4 — ${product.name}`}
          />
        </div>

        <div className="flex flex-col gap-md">
          <div className="flex flex-wrap gap-1.5">
            <Tag variant="accent">{product.category}</Tag>
            {product.occasions[0] ? <Tag variant="accent-2">{product.occasions[0]}</Tag> : null}
          </div>
          <h1 className="m-0 text-2xl">{product.name}</h1>
          <div className="font-heading text-2xl text-accent-700">{formatPrice(product.price)}</div>
          {!product.inStock ? (
            <Tag variant="neutral" className="self-start">
              Out of stock
            </Tag>
          ) : null}
          <p className="max-w-[52ch] text-lg text-foreground/85">{product.description}</p>
          {product.colors[0] ? (
            <Tag variant="outline" className="self-start">
              Color: {product.colors[0]}
            </Tag>
          ) : null}
          <div className="mt-sm flex items-center gap-md">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Button variant="primary" disabled={!product.inStock} className="h-11 flex-1 px-xl">
              {product.inStock ? "Add to cart" : "Out of stock"}
            </Button>
            <Button variant="icon" aria-label="Toggle wishlist" onClick={() => setLiked((current) => !current)}>
              <HeartIcon
                width={18}
                height={18}
                className={liked ? "fill-accent stroke-accent" : "fill-none stroke-foreground"}
              />
            </Button>
          </div>
        </div>
      </div>

      <RelatedProducts related={relatedData?.products ?? []} />
    </div>
  );
}
