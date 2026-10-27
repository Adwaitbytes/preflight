"use client";

import { RotateCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const REFETCH_EVENT = "preflight:refetch";

/** Re-reads at the current head. Server rendered views refresh; browser fetched local views refetch */
export function RefreshButton({ label = "Run again" }: { label?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => {
        window.dispatchEvent(new Event(REFETCH_EVENT));
        // A new `fresh` value makes the server read the chain again instead of a cached answer.
        const next = new URLSearchParams(searchParams.toString());
        next.set("fresh", String(Date.now()));
        startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }));
      }}
    >
      <RotateCw className={cn("size-3.5", pending && "animate-spin")} aria-hidden />
      {pending ? "Reading chain" : label}
    </Button>
  );
}
