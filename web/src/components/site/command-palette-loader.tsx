"use client";

import dynamic from "next/dynamic";

// cmdk and the Radix dialog load after hydration, so the palette never competes with the first paint
export const LazyCommandPalette = dynamic(() => import("./command-palette").then((m) => m.CommandPalette), { ssr: false });
