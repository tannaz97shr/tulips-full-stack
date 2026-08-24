"use client";

import { Tag } from "@/shared/components/atoms/Tag";

interface ChipMultiSelectProps {
  id?: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function ChipMultiSelect({ id, options, value, onChange }: ChipMultiSelectProps) {
  const selected = new Set(value);

  function toggle(option: string) {
    const next = new Set(selected);
    if (next.has(option)) {
      next.delete(option);
    } else {
      next.add(option);
    }
    onChange(Array.from(next));
  }

  return (
    <div id={id} className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => toggle(option)}>
          <Tag variant={selected.has(option) ? "accent" : "outline"}>{option}</Tag>
        </button>
      ))}
    </div>
  );
}
