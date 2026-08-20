"use client";

import { useCallback, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "tulips-theme";

type Theme = "light" | "dark";

/**
 * Reads the theme that app/layout.tsx's inline bootstrap script already
 * applied to <html>.
 */
function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  // Must match the server's render ("light") so the client's first hydration
  // pass produces markup identical to the SSR HTML — reading the DOM here
  // (which the bootstrap script already mutated pre-hydration) would make
  // ThemeToggle render a different icon than the server did, causing a real
  // hydration mismatch. Sync the actual theme afterwards instead, in a
  // layout effect: it runs after commit but before paint (no visible flash)
  // and also re-applies the class if a remount (e.g. Strict Mode in dev)
  // ever resets <html> to its JSX-only attributes.
  const [theme, setTheme] = useState<Theme>("light");

  useLayoutEffect(() => {
    const resolved = readTheme();
    document.documentElement.classList.toggle("dark", resolved === "dark");
    // Syncing from an external source (the DOM class set by layout.tsx's
    // pre-hydration bootstrap script), which isn't available during SSR/first
    // render and so can't be computed during render without reintroducing
    // the hydration mismatch this hook exists to avoid.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolved);
  }, []);

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
