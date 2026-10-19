"use client";

import { useRef, type InputHTMLAttributes, type Ref } from "react";
import { Input } from "@/shared/components/atoms/Input";
import { CalendarIcon } from "@/shared/components/icons";
import { formatDisplayDate } from "@/shared/utils/calendarDate";
import { cn } from "@/shared/utils/cn";

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "min"> {
  ref?: Ref<HTMLInputElement>;
  /** Earliest pickable date, "YYYY-MM-DD" (applies to the calendar picker). */
  min?: string;
  /** Called with a "dd/mm/yyyy" string when a date is chosen from the calendar. */
  onPick: (displayDate: string) => void;
  pickerLabel: string;
}

/**
 * Text field that always reads and writes dd/mm/yyyy. A native
 * `<input type="date">` can't do that — Chrome formats it from the
 * browser's UI language, so an en-US browser shows mm/dd/yyyy — but its
 * calendar picker is still the best one available, so a hidden native input
 * is kept purely to open the picker via `showPicker()`.
 */
export function DateInput({ min, onPick, pickerLabel, className, ...inputProps }: DateInputProps) {
  const nativeRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const native = nativeRef.current;
    if (!native) return;
    try {
      native.showPicker();
    } catch {
      // Older browsers without showPicker(): focusing the native input is the best fallback.
      native.focus();
    }
  }

  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/yyyy"
        maxLength={10}
        className={cn("pr-[2.75rem]", className)}
        {...inputProps}
      />
      <button
        type="button"
        onClick={openPicker}
        aria-label={pickerLabel}
        className="absolute inset-y-0 right-0 flex w-[2.75rem] items-center justify-center rounded-r-sm text-foreground/60 hover:text-accent-700"
      >
        <CalendarIcon width={18} height={18} />
      </button>
      <input
        ref={nativeRef}
        type="date"
        min={min}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 h-px w-px opacity-0"
        onChange={(event) => {
          const display = formatDisplayDate(event.target.value);
          if (display) onPick(display);
        }}
      />
    </div>
  );
}
