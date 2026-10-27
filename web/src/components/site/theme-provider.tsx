"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BRAND } from "@/lib/brand";

/** Keeps the browser chrome (theme-color) on the page background when the theme is toggled */
function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  useEffect(() => {
    const color = resolvedTheme === "light" ? BRAND.paper : BRAND.night;
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.setAttribute("content", color);
  }, [resolvedTheme, pathname]);
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
