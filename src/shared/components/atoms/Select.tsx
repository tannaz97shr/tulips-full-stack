import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly string[];
  placeholder?: string;
}

export function Select({ className, options, placeholder, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-sm border border-divider bg-background px-md py-sm text-lg text-foreground",
        className
      )}
      {...props}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
