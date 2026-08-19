"use client";

import { MinusIcon, PlusIcon } from "@/shared/components/icons";
import { CONTENT } from "@/shared/content";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 20 }: QuantityStepperProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-divider">
      <button
        type="button"
        aria-label={CONTENT.quantityStepper.decrease}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-9 w-9 items-center justify-center hover:bg-foreground/7"
      >
        <MinusIcon width={16} height={16} />
      </button>
      <span className="flex h-9 w-9 items-center justify-center border-x border-divider text-sm">
        {value}
      </span>
      <button
        type="button"
        aria-label={CONTENT.quantityStepper.increase}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-9 w-9 items-center justify-center hover:bg-foreground/7"
      >
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
