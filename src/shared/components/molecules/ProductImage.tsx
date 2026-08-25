import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import { PlaceholderImage } from "./PlaceholderImage";

interface ProductImageProps {
  src?: string;
  alt: string;
  sizes: string;
  aspectRatio?: string;
  rounded?: "none" | "sm" | "md" | "lg";
  caption?: string;
  className?: string;
  /** Fill an already-positioned parent (e.g. a full-bleed hero) instead of sizing via `aspectRatio`. */
  fill?: boolean;
}

const roundedClasses = { none: "", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg" };

export function ProductImage({
  src,
  alt,
  sizes,
  aspectRatio = "4/5",
  rounded = "md",
  caption,
  className,
  fill = false,
}: ProductImageProps) {
  if (!src) {
    return (
      <PlaceholderImage
        aspectRatio={aspectRatio}
        rounded={rounded}
        caption={caption}
        className={className}
        fill={fill}
      />
    );
  }

  return (
    <div
      className={cn("overflow-hidden", fill ? "absolute inset-0" : "relative", roundedClasses[rounded], className)}
      style={fill ? undefined : { aspectRatio }}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
