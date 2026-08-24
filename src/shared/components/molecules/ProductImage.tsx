import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import { PlaceholderImage } from "./PlaceholderImage";

interface ProductImageProps {
  src?: string;
  alt: string;
  sizes: string;
  aspectRatio?: string;
  rounded?: "sm" | "md" | "lg";
  caption?: string;
  className?: string;
}

const roundedClasses = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg" };

export function ProductImage({
  src,
  alt,
  sizes,
  aspectRatio = "4/5",
  rounded = "md",
  caption,
  className,
}: ProductImageProps) {
  if (!src) {
    return <PlaceholderImage aspectRatio={aspectRatio} rounded={rounded} caption={caption} className={className} />;
  }

  return (
    <div className={cn("relative overflow-hidden", roundedClasses[rounded], className)} style={{ aspectRatio }}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
