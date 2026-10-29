"use client";

import { ArrowUpRight, RotateCw } from "lucide-react";
import Link from "next/link";
import { KIND_META } from "@/components/live/kinds";
import { RichText } from "@/components/shared/rich-text";
import { useAppState } from "@/components/site/app-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorState } from "@/components/ui/state";
import { formatInt, formatShare } from "@/lib/format";
import { NETWORK_LABEL, type NetworkId } from "@/lib/networks";
import type { Weather } from "@/lib/types";
import { cn } from "@/lib/utils";
import { kindMix, sky, SKY_ICON, SKY_LABEL, SKY_TONE, subnetBars, windowMinutes } from "@/lib/weather";
import { useWeather } from "./use-weather";


const ALERT_TEXT = { clear: "", unsettled: "text-medium", stormy: "text-critical" } as const;
// A clear sky keeps the site's own light; trouble tints the top of the page
const GLOW = { clear: undefined, unsettled: "medium", stormy: "critical" } as const;

function Stat({ label, value, caption, tone = "" }: { label: string; value: string; caption: string; tone?: string }) {
  return (
    <div className="flex min-w-0 flex-col bg-surface px-4 py-3.5 sm:px-5 sm:py-4">
      <dt className="eyebrow truncate">{label}</dt>
      <dd className={cn("mt-1.5 text-xl leading-7 font-semibold tracking-[-0.025em] tnum sm:text-2xl sm:leading-8", tone)}>{value}</dd>
      <dd className="mt-0.5 truncate text-xs text-faint tnum">{caption}</dd>
    </div>
  );
}

function Hero({ weather, network }: { weather: Weather; network: NetworkId }) {
  const level = sky(weather.failure_rate);
  const Icon = SKY_ICON[level];
  const minutes = windowMinutes(weather.blocks);
  return (
    <section aria-label="Conditions" data-glow={GLOW[level]} className="panel overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5 sm:p-6">
        <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl", SKY_TONE[level])}>
          <Icon className="size-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="eyebrow">
            {NETWORK_LABEL[network]} · last {minutes} minutes
          </p>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-3 font-sans text-[2.75rem] leading-none font-light tracking-[-0.05em] tnum sm:text-[4rem]">
            <span className={ALERT_TEXT[level]}>{formatShare(weather.failure_rate)}</span>
            <span className="text-title font-normal tracking-[-0.02em] text-muted-foreground">failing, {SKY_LABEL[level].toLowerCase()}</span>
          </p>
          <h2 className="mt-3 max-w-[64ch] text-[15px] leading-7 text-pretty text-muted-foreground">{weather.headline}</h2>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-px border-t border-line bg-line">
        <Stat label="Transactions" value={formatInt(weather.extrinsics)} caption={`in ${minutes} minutes`} />
        <Stat label="Failed" value={formatInt(weather.failed)} caption="under 2% is ordinary" tone={weather.failed > 0 ? ALERT_TEXT[level] : ""} />
        <Stat label="Window" value={`${formatInt(weather.blocks)} blocks`} caption={`${formatInt(weather.from_block)} to ${formatInt(weather.to_block)}`} />
      </dl>
    </section>
  );
}

function TopErrors({ weather, network }: { weather: Weather; network: NetworkId }) {
  if (weather.top_errors.length === 0) {
    return (
      <div className="panel px-5 py-4 text-sm text-muted-foreground">
        Nothing failed in this window. Every signed transaction in the last {windowMinutes(weather.blocks)} minutes went through.
      </div>
    );
  }
  return (
    <section aria-labelledby="weather-errors" className="flex flex-col gap-3">
      <h2 id="weather-errors" className="text-sm font-semibold">
        What is failing
      </h2>
      <ol className="grid gap-3 md:grid-cols-2">
        {weather.top_errors.map((e) => (
          <li key={e.error} className="panel flex flex-col gap-3 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-[13px] font-medium text-critical" title={e.error}>
                  {e.error}
                </p>
                <p className="mt-0.5 text-[15px] font-semibold">{e.title}</p>
              </div>
              <span className="shrink-0 rounded-md bg-critical-soft px-2 py-0.5 text-xs font-semibold text-critical tnum">
                {e.count === 1 ? "once" : `${formatInt(e.count)} times`}
              </span>
            </div>
            <p className="text-sm leading-6 text-pretty text-muted-foreground">
              <RichText text={e.meaning} />
            </p>
            {e.fix && <p className="text-sm leading-6 text-pretty">
              <span className="font-medium">Fix: </span>
              <span className="text-muted-foreground">
                <RichText text={e.fix} />
              </span>
            </p>}
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
              {e.subnets.slice(0, 6).map((n) => (
                <Link key={n} href={`/subnets/${n}`} className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted-foreground shadow-[0_0_0_1px_var(--line)] hover:text-foreground">
                  SN{n}
                </Link>
              ))}
              <Link
                href={`/tx/${network}/${e.example_ref}`}
                className="ml-auto inline-flex items-center gap-1 rounded-md text-xs font-medium text-accent-ink hover:underline"
              >
                Open {e.example_ref}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Mix({ weather }: { weather: Weather }) {
  const mix = kindMix(weather.by_kind);
  if (mix.length === 0) return null;
  return (
    <section aria-labelledby="weather-mix" className="panel flex flex-col gap-4 p-4 sm:p-5">
      <h2 id="weather-mix" className="text-sm font-semibold">
        What people are doing
      </h2>
      <div role="img" aria-label={mix.map((m) => `${KIND_META[m.kind].label} ${formatShare(m.share)}`).join(", ")} className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
        {mix.map((m) => (
          <span key={m.kind} className={cn("h-full", KIND_META[m.kind].dot)} style={{ width: `${m.share * 100}%` }} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-2 text-[13px]">
        {mix.map((m) => (
          <li key={m.kind} className="flex min-w-0 items-center gap-2">
            <span aria-hidden className={cn("size-2 shrink-0 rounded-full", KIND_META[m.kind].dot)} />
            <span className="truncate text-muted-foreground">{KIND_META[m.kind].label}</span>
            <span className="ml-auto font-mono text-xs text-faint tnum">{formatInt(m.count)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SubnetList({ title, pairs, tone, unit }: { title: string; pairs: Weather["busiest_subnets"]; tone: "accent" | "critical"; unit: string }) {
  const bars = subnetBars(pairs);
  return (
    <section aria-label={title} className="panel flex flex-col gap-3 p-4 sm:p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {bars.length === 0 ? (
        <p className="text-sm text-faint">None in this window</p>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {bars.map((b) => (
            <li key={b.netuid}>
              <Link href={`/subnets/${b.netuid}`} className="group grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-md text-[13px]">
                <span className="font-mono text-muted-foreground group-hover:text-foreground">SN{b.netuid}</span>
                <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <span className={cn("block h-full rounded-full", tone === "accent" ? "bg-accent" : "bg-critical")} style={{ width: `${Math.max(4, b.width * 100)}%` }} />
                </span>
                <span className="font-mono text-xs text-faint tnum">
                  {formatInt(b.count)} <span className="sr-only">{unit}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function WeatherSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <span className="sr-only" role="status">
        Reading the last 60 blocks
      </span>
      <div className="panel overflow-hidden">
        <div className="flex gap-5 p-6">
          <Skeleton className="size-12 rounded-xl" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-full max-w-2xl" />
          </div>
        </div>
        <Skeleton className="h-[5.5rem] w-full rounded-none" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function WeatherView() {
  const { network, offline } = useAppState();
  const state = useWeather(network, offline);

  if (state.status === "loading") return <WeatherSkeleton />;
  if (state.status === "failed") {
    return (
      <ApiErrorState
        error={state.error}
        action={
          <Button onClick={state.retry}>
            <RotateCw className="size-3.5" aria-hidden />
            Retry
          </Button>
        }
      />
    );
  }
  const { weather } = state;
  return (
    <div className="rise-in flex flex-col gap-6">
      <Hero weather={weather} network={network} />
      <TopErrors weather={weather} network={network} />
      <div className="grid gap-3 lg:grid-cols-3">
        <Mix weather={weather} />
        <SubnetList title="Busiest subnets" pairs={weather.busiest_subnets} tone="accent" unit="transactions" />
        <SubnetList title="Most failures" pairs={weather.failing_subnets} tone="critical" unit="failures" />
      </div>
      <p className="text-xs text-faint">Refreshes every minute while this tab is open. Every block is decoded once and shared with the live explorer.</p>
    </div>
  );
}
