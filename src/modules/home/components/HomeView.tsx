"use client";

import { Button } from "@/shared/components/atoms/Button";
import { Tag } from "@/shared/components/atoms/Tag";
import { LeafIcon, ShieldIcon, TruckIcon } from "@/shared/components/icons";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { ProductImage } from "@/shared/components/molecules/ProductImage";
import { ROUTES } from "@/shared/routes";
import { CATEGORIES } from "@/modules/catalog/constants";
import { useProduct } from "@/modules/catalog/hooks/useProduct";
import { useProducts } from "@/modules/catalog/hooks/useProducts";
import { CategoryTile } from "./CategoryTile";
import { FeaturedGrid } from "./FeaturedGrid";
import { CONTENT } from "../content";

const HERO_PRODUCT_SLUG = "rose-lily-wedding-bouquet";

const VALUE_ICONS = { truck: TruckIcon, shield: ShieldIcon, leaf: LeafIcon };

export function HomeView() {
  const { data: heroProduct } = useProduct(HERO_PRODUCT_SLUG);
  const { data: featured, isLoading: featuredLoading } = useProducts({
    isFeatured: true,
    inStockOnly: true,
    pageSize: 8,
  });
  const featuredProducts = featured?.products ?? [];

  return (
    <div className="flex flex-col gap-2xl pb-2xl">
      <section className="relative flex min-h-105 items-end overflow-hidden sm:min-h-140">
        <ProductImage
          src={heroProduct ? heroProduct.images[heroProduct.primaryImageIndex] : undefined}
          alt={heroProduct?.name ?? CONTENT.hero.heading}
          sizes="100vw"
          rounded="none"
          fill
          caption={CONTENT.hero.heroCaption(heroProduct?.name ?? "bouquet")}
        />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-900/90 via-neutral-900/60 to-neutral-900/10" />
        <div className="relative mx-auto w-full max-w-7xl px-lg py-2xl text-neutral-100">
          <Tag variant="accent-2">{CONTENT.hero.freshWeekly}</Tag>
          <h1 className="my-md max-w-[14ch] text-hero text-neutral-100">{CONTENT.hero.heading}</h1>
          <p className="mb-lg max-w-[44ch] text-base text-neutral-100/85">{CONTENT.hero.subheading}</p>
          <Button href={ROUTES.products.list} variant="primary" className="h-11 px-xl">
            {CONTENT.hero.shopCta}
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-lg">
        <h2 className="mb-lg text-xl">{CONTENT.categories.heading}</h2>
        <div className="grid grid-cols-2 gap-md md:grid-cols-5">
          {CATEGORIES.map((category) => (
            <CategoryTile key={category} category={category} />
          ))}
        </div>
      </section>

      {featuredLoading || featuredProducts.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-lg">
          <h2 className="mb-lg text-xl">{CONTENT.featured.heading}</h2>
          {featuredLoading ? <LoadingState variant="grid" count={4} /> : <FeaturedGrid products={featuredProducts} />}
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-7xl px-lg">
        <div className="grid grid-cols-1 gap-lg border-t border-divider pt-2xl sm:grid-cols-3">
          {CONTENT.valueProps.map((prop) => {
            const Icon = VALUE_ICONS[prop.icon];
            return (
              <div key={prop.label} className="flex items-center gap-md">
                <Icon width={22} height={22} className="stroke-accent" />
                <span className="text-lg">{prop.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
