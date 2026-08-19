"use client";

import { Button } from "@/shared/components/atoms/Button";
import { Tag } from "@/shared/components/atoms/Tag";
import { CATEGORIES, COLORS, OCCASIONS, PRICE_PRESETS, SEASONS, SIZES } from "@/modules/catalog/constants";
import { CONTENT } from "@/modules/catalog/content";
import { useProductFilters } from "@/modules/catalog/hooks/useProductFilters";

interface ChipGroupProps {
  label: string;
  options: readonly string[];
  active: Set<string>;
  onToggle: (option: string) => void;
}

function ChipGroup({ label, options, active, onToggle }: ChipGroupProps) {
  return (
    <div className="flex flex-col gap-sm">
      <span className="text-xs tracking-wide text-foreground/70 uppercase">{label}</span>
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

export function FiltersPanel({ onDone }: FiltersPanelProps) {
  const {
    state,
    hasActiveFilters,
    toggleCategory,
    toggleOccasion,
    toggleColor,
    setSeason,
    setSize,
    setPricePreset,
    toggleInStockOnly,
    clearAll,
  } = useProductFilters();

  const categories = new Set(state.categories);
  const occasions = new Set(state.occasions);
  const colors = new Set(state.colors);
  const seasons = new Set(state.season ? [state.season] : []);
  const sizes = new Set(state.size ? [state.size] : []);
  const prices = new Set(state.pricePreset ? [state.pricePreset] : []);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between">
        <h4 className="m-0">{CONTENT.filters.heading}</h4>
        {hasActiveFilters ? (
          <button type="button" onClick={clearAll} className="text-xs">
            {CONTENT.filters.clear}
          </button>
        ) : null}
      </div>
      <ChipGroup
        label={CONTENT.filters.categoryLabel}
        options={CATEGORIES}
        active={categories}
        onToggle={toggleCategory}
      />
      <ChipGroup
        label={CONTENT.filters.occasionLabel}
        options={OCCASIONS}
        active={occasions}
        onToggle={toggleOccasion}
      />
      <ChipGroup label={CONTENT.filters.colorLabel} options={COLORS} active={colors} onToggle={toggleColor} />
      <ChipGroup label={CONTENT.filters.seasonLabel} options={SEASONS} active={seasons} onToggle={setSeason} />
      <ChipGroup label={CONTENT.filters.sizeLabel} options={SIZES} active={sizes} onToggle={setSize} />
      <ChipGroup
        label={CONTENT.filters.priceLabel}
        options={PRICE_PRESETS}
        active={prices}
        onToggle={setPricePreset}
      />
      <button type="button" onClick={toggleInStockOnly} className="self-start">
        <Tag variant={state.inStockOnly ? "accent" : "outline"}>{CONTENT.filters.inStockOnly}</Tag>
      </button>
      {onDone ? (
        <Button variant="primary" block onClick={onDone}>
          {CONTENT.filters.showResults}
        </Button>
      ) : null}
    </div>
  );
}
