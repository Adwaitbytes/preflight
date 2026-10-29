"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The landing ends on its own call to action, so the footer drops its copy of it there */
export function FooterLead({ children }: { children: ReactNode }) {
  return usePathname() === "/" ? null : children;
}
