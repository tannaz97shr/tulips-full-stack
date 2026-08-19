import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export function Textarea({ className, rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full resize-y rounded-sm border border-divider bg-background px-md py-sm text-lg text-foreground placeholder:text-foreground/40",
        className
      )}
      {...props}
    />
  );
}
