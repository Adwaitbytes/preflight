"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect } from "react";
import { enqueue, flush, setNetwork, trackingAllowed } from "@/lib/analytics";
import { useAppState } from "./app-state";

const VITALS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);

/**
 * Anonymous page analytics: a view per page, the time the page was actually visible, and
 * Core Web Vitals. Renders nothing. Offline mode and opted-out browsers send nothing.
 */
export function Analytics() {
  const pathname = usePathname();
  const { network, offline } = useAppState();

  useReportWebVitals((metric) => {
    if (offline || !VITALS.has(metric.name)) return;
    // CLS is a unitless score; the rest are milliseconds
    enqueue({ type: "vital", name: metric.name, path: window.location.pathname, value: metric.name === "CLS" ? metric.value : Math.round(metric.value) });
  });

  useEffect(() => {
    setNetwork(network);
  }, [network]);

  useEffect(() => {
    if (offline || !trackingAllowed()) return;
    enqueue({ type: "view", name: "page", path: pathname });
    flush();

    // Engaged time counts only while the tab is visible; each hide reports what accrued
    let visibleSince: number | null = document.visibilityState === "visible" ? performance.now() : null;
    const report = (final: boolean) => {
      if (visibleSince === null) return;
      const engaged = performance.now() - visibleSince;
      visibleSince = null;
      if (engaged >= 500) enqueue({ type: "leave", name: "page", path: pathname, value: Math.round(engaged) });
      flush(final);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") report(true);
      else visibleSince = performance.now();
    };
    const onHide = () => report(true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
      report(false);
    };
  }, [pathname, offline]);

  return null;
}
