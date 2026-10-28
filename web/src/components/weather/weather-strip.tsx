"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAppState } from "@/components/site/app-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatShare } from "@/lib/format";
import { sky, SKY_ICON, SKY_LABEL, SKY_TONE } from "@/lib/weather";
import { useWeather } from "./use-weather";

/** One line of network weather above the live explorer. Fixed height, so it never shifts the feed */
export function WeatherStrip() {
  const { network, offline } = useAppState();
  const state = useWeather(network, offline);
  if (state.status === "failed") return null;
  return (
    <div className="mb-6 h-12">
      {state.status === "loading" ? (
        <Skeleton className="h-12 w-full rounded-xl" />
      ) : (
        <Link
          href="/weather"
          className="group panel flex h-12 items-center gap-3 px-3 text-sm transition-colors hover:bg-surface-2 sm:px-4"
        >
          {(() => {
            const level = sky(state.weather.failure_rate);
            const Icon = SKY_ICON[level];
            return (
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", SKY_TONE[level])}>
                <Icon className="size-4" aria-hidden />
                <span className="sr-only">{SKY_LABEL[level]}</span>
              </span>
            );
          })()}
          <span className="shrink-0 font-mono text-xs font-medium text-foreground tnum">{formatShare(state.weather.failure_rate)}</span>
          <span className="min-w-0 flex-1 truncate text-muted-foreground group-hover:text-foreground">{state.weather.headline}</span>
          <ArrowRight className="size-4 shrink-0 text-faint sm:hidden" aria-hidden />
          <span className="hidden shrink-0 items-center gap-1 text-xs font-medium text-accent-ink sm:inline-flex">
            Network weather
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </Link>
      )}
    </div>
  );
}
