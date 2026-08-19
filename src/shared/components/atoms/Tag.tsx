import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type TagVariant = "accent" | "accent-2" | "neutral" | "outline";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
}

const variantClasses: Record<TagVariant, string> = {
  accent: "bg-accent-100 text-accent-800",
  "accent-2": "bg-accent-2-100 text-accent-2-800",
  neutral: "bg-neutral-100 text-neutral-800",
  outline: "border border-accent text-accent",
};

export function Tag({ variant = "neutral", className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-[3px] text-xs tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
