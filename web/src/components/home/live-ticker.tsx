"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useAppState } from "@/components/site/app-state";
import { useWeather } from "@/components/weather/use-weather";
import { formatInt, formatShare } from "@/lib/format";

/** Three live readings from the chain, refreshed every minute, linking to the full weather */
export function LiveTicker() {
  const { offline } = useAppState();
  const state = useWeather("finney", offline);
  const ready = state.status === "ready" ? state.weather : null;
  const cells = [
    { label: "Block", value: ready ? formatInt(ready.to_block) : "·····" },
    { label: "Failing now", value: ready ? formatShare(ready.failure_rate, 1) : "···" },
    { label: "Last 12 min", value: ready ? `${formatInt(ready.extrinsics)} tx` : "···" },
  ];
  return (
    <Link
      href="/weather"
      aria-label={ready ? `Network weather: block ${ready.to_block}, ${formatShare(ready.failure_rate, 1)} of transactions failing` : "Network weather"}
      className="group flex items-stretch gap-px self-start overflow-hidden rounded-2xl bg-white/10 shadow-[0_0_0_1px_rgb(255_255_255/0.1)] backdrop-blur-md transition-colors hover:bg-white/15 lg:self-auto"
    >
      {cells.map((cell) => (
        <span key={cell.label} className="flex min-w-[6.5rem] flex-col bg-[#07080d]/85 px-4 py-2.5">
          <span className="font-mono text-[11px] tracking-[0.12em] text-white/60 uppercase">{cell.label}</span>
          <span className="mt-0.5 font-mono text-sm text-white tnum">{cell.value}</span>
        </span>
      ))}
      <span className="grid place-items-center bg-[#07080d]/85 px-3 text-white/50 transition-colors group-hover:text-white">
        <ArrowUpRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}
