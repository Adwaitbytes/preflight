"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LocalView pulls in every result view plus the browser API client. Only the Local network renders it,
 * and only in the browser, so hosted pages load none of that code.
 */
export const LocalView = dynamic(() => import("./local-view").then((m) => m.LocalView), {
  ssr: false,
  loading: () => <Skeleton className="mt-10 h-96 rounded-xl" />,
});
