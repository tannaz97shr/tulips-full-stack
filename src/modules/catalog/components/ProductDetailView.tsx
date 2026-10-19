"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import Link from "next/link";
import { Button } from "@/shared/components/atoms/Button";
import { Tag } from "@/shared/components/atoms/Tag";
import { HeartIcon } from "@/shared/components/icons";
import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { ProductCard } from "@/shared/components/molecules/ProductCard";
import { ProductImage } from "@/shared/components/molecules/ProductImage";
import { QuantityStepper } from "@/shared/components/molecules/QuantityStepper";
import { CONTENT as SHARED_CONTENT } from "@/shared/content";
import { ROUTES } from "@/shared/routes";
import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT as CART_CONTENT } from "@/modules/cart/content";
import { useCart } from "@/modules/cart/hooks/useCart";
import { CONTENT } from "@/modules/catalog/content";
import { useProduct } from "@/modules/catalog/hooks/useProduct";
import { useProducts } from "@/modules/catalog/hooks/useProducts";
import { COLORS } from "@/modules/catalog/constants";
import { normalizeTaxonomyValues } from "@/modules/catalog/lib/normalizeTaxonomyValue";
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
      <h2 className="mb-lg text-xl">{CONTENT.productDetailView.relatedHeading}</h2>
      <div className="grid grid-cols-2 gap-lg md:grid-cols-4">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}

export function ProductDetailView({ slug }: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();

  const { data: product, isLoading, isError, error, refetch } = useProduct(slug);
  const { data: relatedData } = useProducts(
    { category: product ? [product.category] : undefined, excludeSlug: slug, pageSize: 4 },
    { enabled: Boolean(product) }
  );

  if (isLoading) {
    return <LoadingState message={CONTENT.productDetailView.loading} />;
  }

  if (isError) {
    const notFound = isAxiosError(error) && error.response?.status === 404;

    if (notFound) {
      return (
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-md px-lg text-center">
          <p className="text-lg text-foreground/70">{CONTENT.productDetailView.notFound}</p>
          <Button href={ROUTES.products.list}>{CONTENT.productDetailView.backToShop}</Button>
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-7xl px-lg py-lg">
        <ErrorState message={CONTENT.productDetailView.loadError} onRetry={() => refetch()} />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images;
  const primaryIndex = product.primaryImageIndex < images.length ? product.primaryImageIndex : 0;
  // Until the customer picks a thumbnail, show the admin-chosen primary image.
  const activeIndex = selectedImage !== null && selectedImage < images.length ? selectedImage : primaryIndex;
  const hasThumbnails = images.length > 1;
  const colours = normalizeTaxonomyValues(product.colors, COLORS);

  function handleAddToCart() {
    if (!product) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: images[primaryIndex],
        maxStock: product.stockCount,
      },
      quantity
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-lg py-lg">
      <div className="mb-lg text-base text-foreground/70">
        <Link href={ROUTES.home}>{CONTENT.productDetailView.breadcrumbHome}</Link> /{" "}
        <Link href={ROUTES.products.list}>{CONTENT.productDetailView.breadcrumbShop}</Link> / {product.category} /{" "}
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
        <div className={`grid grid-cols-1 gap-md ${hasThumbnails ? "md:grid-cols-[76px_1fr]" : ""}`}>
          {hasThumbnails ? (
            <div className="order-2 flex flex-row flex-wrap gap-sm md:order-1 md:flex-col">
              {images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={CONTENT.productDetailView.showImage(index + 1, images.length)}
                  aria-pressed={activeIndex === index}
                  className={`h-16 w-16 flex-none overflow-hidden rounded-sm border-2 ${
                    activeIndex === index ? "border-accent" : "border-transparent"
                  }`}
                >
                  <ProductImage src={src} alt="" sizes="64px" aspectRatio="1/1" rounded="none" />
                </button>
              ))}
            </div>
          ) : null}
          <ProductImage
            src={images[activeIndex]}
            alt={product.name}
            sizes="(max-width: 768px) 100vw, 50vw"
            aspectRatio="4/5"
            rounded="lg"
            caption={CONTENT.productDetailView.imageCaption(activeIndex + 1, images.length, product.name)}
            className={hasThumbnails ? "order-1 md:order-2" : undefined}
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
              {SHARED_CONTENT.productCard.outOfStock}
            </Tag>
          ) : null}
          <p className="max-w-[52ch] text-lg text-foreground/85">{product.description}</p>
          {colours.length > 0 ? (
            <Tag variant="outline" className="self-start">
              {CONTENT.productDetailView.colours(colours)}
            </Tag>
          ) : null}
          <div className="mt-sm flex items-center gap-md">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Button
              variant="primary"
              disabled={!product.inStock}
              onClick={handleAddToCart}
              className="h-11 flex-1 px-xl"
            >
              {!product.inStock
                ? SHARED_CONTENT.productCard.outOfStock
                : justAdded
                  ? CART_CONTENT.addToCart.added
                  : CONTENT.productDetailView.addToCart}
            </Button>
            <Button
              variant="icon"
              aria-label={CONTENT.productDetailView.toggleWishlist}
              onClick={() => setLiked((current) => !current)}
            >
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
