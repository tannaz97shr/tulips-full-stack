"use client";

import { useState } from "react";
import { Button } from "@/shared/components/atoms/Button";
import { Tag } from "@/shared/components/atoms/Tag";
import { CATEGORIES, COLORS, OCCASIONS, PRICE_PRESETS } from "@/modules/catalog/constants";

function toggleInSet(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

interface ChipGroupProps {
  label: string;
  options: readonly string[];
  active: Set<string>;
  onToggle: (option: string) => void;
}

function ChipGroup({ label, options, active, onToggle }: ChipGroupProps) {
  return (
    <div className="flex flex-col gap-sm">
      <span className="text-[11px] tracking-wide text-foreground/70 uppercase">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onToggle(option)}>
            <Tag variant={active.has(option) ? "accent" : "outline"}>{option}</Tag>
          </button>
        ))}
      </div>
    </div>
  );
}

interface FiltersPanelProps {
  /** Shown as a "Show results" button — only passed by the mobile drawer variant. */
  onDone?: () => void;
}

/**
 * Visual-only for Phase 1: chips toggle their own active state but aren't
 * wired to ProductGrid yet — that lands with real data fetching.
 */
export function FiltersPanel({ onDone }: FiltersPanelProps) {
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [occasions, setOccasions] = useState<Set<string>>(new Set());
  const [colors, setColors] = useState<Set<string>>(new Set());
  const [price, setPrice] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);

  const hasActiveFilters =
    categories.size > 0 || occasions.size > 0 || colors.size > 0 || price.size > 0 || inStockOnly;

  function clearAll() {
    setCategories(new Set());
    setOccasions(new Set());
    setColors(new Set());
    setPrice(new Set());
    setInStockOnly(false);
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between">
        <h4 className="m-0">Filters</h4>
        {hasActiveFilters ? (
          <button type="button" onClick={clearAll} className="text-xs">
            Clear
          </button>
        ) : null}
      </div>
      <ChipGroup
        label="Category"
        options={CATEGORIES}
        active={categories}
        onToggle={(option) => setCategories((current) => toggleInSet(current, option))}
      />
      <ChipGroup
        label="Occasion"
        options={OCCASIONS}
        active={occasions}
        onToggle={(option) => setOccasions((current) => toggleInSet(current, option))}
      />
      <ChipGroup
        label="Color"
        options={COLORS}
        active={colors}
        onToggle={(option) => setColors((current) => toggleInSet(current, option))}
      />
      <ChipGroup
        label="Price"
        options={PRICE_PRESETS}
        active={price}
        onToggle={(option) => setPrice((current) => toggleInSet(current, option))}
      />
      <button type="button" onClick={() => setInStockOnly((current) => !current)} className="self-start">
        <Tag variant={inStockOnly ? "accent" : "outline"}>In stock only</Tag>
      </button>
      {onDone ? (
        <Button variant="primary" block onClick={onDone}>
          Show results
        </Button>
      ) : null}
    </div>
  );
}
