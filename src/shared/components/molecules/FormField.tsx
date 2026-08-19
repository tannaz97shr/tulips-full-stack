import type { ReactNode } from "react";
import { useId } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: (id: string) => ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] tracking-wide text-foreground/70 uppercase">
        {label}
      </label>
      {children(id)}
      {error ? (
        <span className="text-[12px] text-accent-700" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
