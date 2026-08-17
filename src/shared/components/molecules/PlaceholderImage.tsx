import { cn } from "@/shared/utils/cn";

interface PlaceholderImageProps {
  aspectRatio?: string;
  caption?: string;
  rounded?: "sm" | "md" | "lg";
  className?: string;
}

const roundedClasses = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg" };

/** Stand-in for a real product photo — swapped for next/image once catalog images exist. */
export function PlaceholderImage({
  aspectRatio = "4/5",
  caption,
  rounded = "md",
  className,
}: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-[repeating-linear-gradient(135deg,var(--color-neutral-200)_0px,var(--color-neutral-200)_10px,var(--color-neutral-300)_10px,var(--color-neutral-300)_20px)]",
        roundedClasses[rounded],
        className
      )}
      style={{ aspectRatio }}
    >
      {caption ? (
        <span className="max-w-[82%] rounded-md bg-background px-2 py-1 text-center font-mono text-[10px] text-neutral-700">
          {caption}
        </span>
      ) : null}
    </div>
  );
}
