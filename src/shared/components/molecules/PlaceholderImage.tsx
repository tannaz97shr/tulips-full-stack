import { cn } from "@/shared/utils/cn";

interface PlaceholderImageProps {
  aspectRatio?: string;
  caption?: string;
  rounded?: "none" | "sm" | "md" | "lg";
  className?: string;
  /** Fill an already-positioned parent (e.g. a full-bleed hero) instead of sizing via `aspectRatio`. */
  fill?: boolean;
}

const roundedClasses = { none: "", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg" };

/** Stand-in for a real product photo — swapped for next/image once catalog images exist. */
export function PlaceholderImage({
  aspectRatio = "4/5",
  caption,
  rounded = "md",
  className,
  fill = false,
}: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-[repeating-linear-gradient(135deg,var(--color-neutral-200)_0px,var(--color-neutral-200)_10px,var(--color-neutral-300)_10px,var(--color-neutral-300)_20px)]",
        roundedClasses[rounded],
        fill && "absolute inset-0",
        className
      )}
      style={fill ? undefined : { aspectRatio }}
    >
      {caption ? (
        <span className="max-w-[82%] rounded-md bg-background px-2 py-1 text-center font-mono text-2xs text-neutral-700">
          {caption}
        </span>
      ) : null}
    </div>
  );
}
