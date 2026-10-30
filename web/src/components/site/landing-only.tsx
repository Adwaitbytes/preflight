"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Tool pages are work surfaces, so the full site footer only closes the landing */
export function LandingOnly({ children }: { children: ReactNode }) {
  return usePathname() === "/" ? children : null;
}

/** With no footer under them, tool pages keep some room below their last card */
export function ToolPageEnd() {
  return usePathname() === "/" ? null : <div aria-hidden className="h-16 shrink-0 sm:h-24" />;
}
