"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "tulips-theme";

type Theme = "light" | "dark";

/**
 * Reads the theme that app/layout.tsx's inline bootstrap script already
 * applied to <html> before hydration. Using it as the useState initializer
 * (rather than an effect) means the client's first render is already
 * correct — the only mismatch is against the server's theme-less HTML,
 * which ThemeToggle's suppressHydrationWarning covers.
 */
function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
