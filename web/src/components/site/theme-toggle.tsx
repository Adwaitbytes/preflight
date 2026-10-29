"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle light and dark theme"
      className="grid size-9 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {/* Keyed to the page theme on <html>, not the nearest .dark, so a section pinned dark never shows the wrong icon */}
      <Sun className="hidden size-4 [:root.dark_&]:block" aria-hidden />
      <Moon className="size-4 [:root.dark_&]:hidden" aria-hidden />
    </button>
  );
}
