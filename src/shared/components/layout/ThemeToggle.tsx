"use client";

import { useTheme } from "@/shared/hooks/useTheme";
import { MoonIcon, SunIcon } from "@/shared/components/icons";
import { CONTENT } from "@/shared/content";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={CONTENT.themeToggle.toggleTheme}
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-foreground/7"
    >
      <span suppressHydrationWarning>
        {theme === "dark" ? <SunIcon width={20} height={20} /> : <MoonIcon width={20} height={20} />}
      </span>
    </button>
  );
}
