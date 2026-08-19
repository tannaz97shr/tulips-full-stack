import { Button } from "@/shared/components/atoms/Button";
import { Tag } from "@/shared/components/atoms/Tag";
import { CategoryTile } from "@/shared/components/molecules/CategoryTile";
import { PlaceholderImage } from "@/shared/components/molecules/PlaceholderImage";
import { CATEGORIES } from "@/modules/catalog/constants";
import { CONTENT } from "@/shared/content";
import { ROUTES } from "@/shared/routes";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <section className="px-lg py-2xl">
        <div className="grid grid-cols-1 items-center gap-xl md:grid-cols-[1.1fr_1fr]">
          <div>
            <Tag variant="accent-2">{CONTENT.home.freshWeekly}</Tag>
            <h1 className="my-md max-w-[14ch] text-hero">{CONTENT.home.heading}</h1>
            <p className="mb-lg max-w-[44ch] text-base text-foreground/85">{CONTENT.home.subheading}</p>
            <Button href={ROUTES.products.list} variant="primary" className="h-11 px-xl">
              {CONTENT.home.shopCta}
            </Button>
          </div>
          <PlaceholderImage aspectRatio="4/3" rounded="lg" caption={CONTENT.home.heroCaption} />
        </div>
      </section>
      <section className="px-lg pb-2xl">
        <h2 className="mb-lg text-xl">{CONTENT.home.categoriesHeading}</h2>
        <div className="grid grid-cols-2 gap-md md:grid-cols-5">
          {CATEGORIES.map((category) => (
            <CategoryTile key={category} label={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
