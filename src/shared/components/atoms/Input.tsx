import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-sm border border-divider bg-background px-md py-sm text-[15px] text-foreground placeholder:text-foreground/40",
        className
      )}
      {...props}
    />
  );
}
