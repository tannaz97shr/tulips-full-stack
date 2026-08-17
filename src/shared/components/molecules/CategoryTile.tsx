import Link from "next/link";
import { PlaceholderImage } from "./PlaceholderImage";

interface CategoryTileProps {
  label: string;
}

export function CategoryTile({ label }: CategoryTileProps) {
  return (
    <Link href="/products" className="group">
      <PlaceholderImage
        aspectRatio="1/1"
        rounded="md"
        className="transition-transform group-hover:scale-[1.03]"
      />
      <div className="mt-2 font-heading text-sm">{label}</div>
    </Link>
  );
}
