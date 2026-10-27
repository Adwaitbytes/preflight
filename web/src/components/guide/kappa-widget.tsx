"use client";

import { CheckCircle2, CircleSlash, RotateCcw, XCircle } from "lucide-react";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatInt, formatShare } from "@/lib/format";
import { clipOutcome, type ClipStatus } from "@/lib/kappa";
import { cn } from "@/lib/utils";

interface Validator {
  uid: number;
  stake: number;
}

// The five largest SN64 validators at finney block 9,376,730, from the PF108 evidence in
// web/src/data/samples/doctor_broken_miner.json. The model treats them as the whole validator set
const VALIDATORS: Validator[] = [
  { uid: 1, stake: 1_385_417 },
  { uid: 252, stake: 907_925 },
  { uid: 59, stake: 765_922 },
  { uid: 46, stake: 336_362 },
  { uid: 61, stake: 205_685 },
];

const TOTAL = VALIDATORS.reduce((sum, v) => sum + v.stake, 0);
const MAX = Math.max(...VALIDATORS.map((v) => v.stake));
const START = new Set([59, 46, 61]);
const DEFAULT_KAPPA = 50;

const PRESETS: { label: string; uids: number[] }[] = [
  { label: "Only the largest", uids: [1] },
  { label: "All but the largest", uids: [252, 59, 46, 61] },
  { label: "The three smallest", uids: [59, 46, 61] },
  { label: "Everyone", uids: VALIDATORS.map((v) => v.uid) },
];

const VERDICT: Record<ClipStatus, { title: string; short: string; tone: string; icon: typeof CheckCircle2 }> = {
  survives: { title: "Weight survives, the miner earns", short: "Survives", tone: "text-healthy", icon: CheckCircle2 },
  clipped: { title: "Clipped to zero, the miner earns nothing", short: "Clipped", tone: "text-critical", icon: XCircle },
  unweighted: { title: "Nobody weighted it, nothing to clip", short: "Unweighted", tone: "text-muted-foreground", icon: CircleSlash },
};

export function KappaWidget() {
  const [weighting, setWeighting] = useState<Set<number>>(() => new Set(START));
  const [kappaPct, setKappaPct] = useState(DEFAULT_KAPPA);
  const sliderId = useId();
  const result = clipOutcome(
    VALIDATORS.map((v) => ({ stake: v.stake, weights: weighting.has(v.uid) })),
    kappaPct / 100,
  );
  const verdict = VERDICT[result.status];
  const changed = kappaPct !== DEFAULT_KAPPA || weighting.size !== START.size || [...START].some((uid) => !weighting.has(uid));

  function toggle(uid: number) {
    setWeighting((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  // Weighting validators first, so the filled part of the stake bar is one run from the left
  const ordered = [...VALIDATORS].sort((a, b) => Number(weighting.has(b.uid)) - Number(weighting.has(a.uid)));

  return (
    <div data-reveal className="panel overflow-clip">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-5 py-3.5 sm:px-6">
        <Badge tone="accent">Simplified model of Yuma Consensus</Badge>
        <span className="order-last w-full text-xs text-faint sm:order-none sm:w-auto">Stakes: the five largest SN64 validators, block 9,376,730</span>
        <button
          type="button"
          onClick={() => {
            setWeighting(new Set(START));
            setKappaPct(DEFAULT_KAPPA);
          }}
          disabled={!changed}
          className="ml-auto inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <fieldset className="min-w-0 border-b border-line px-5 py-5 sm:px-6 lg:border-r lg:border-b-0">
          <legend className="sr-only">Which validators put weight on the miner</legend>
          <p className="text-[13px] font-medium text-foreground" aria-hidden>
            Who weights the miner
          </p>
          <p className="mt-0.5 text-xs text-faint" aria-hidden>
            Tap a validator to switch its weight on or off
          </p>
          <ul className="mt-4 flex flex-col gap-1.5">
            {VALIDATORS.map((v) => {
              const on = weighting.has(v.uid);
              return (
                <li key={v.uid}>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`UID ${v.uid}, ${formatInt(v.stake)} alpha, ${formatShare(v.stake / TOTAL)} of validator stake, weights the miner`}
                    onClick={() => toggle(v.uid)}
                    className={cn(
                      "group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-[background-color,box-shadow] duration-200",
                      on ? "bg-accent-soft shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_30%,transparent)]" : "shadow-[0_0_0_1px_var(--line)] hover:bg-surface-2",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors duration-200",
                        on ? "bg-accent" : "bg-surface-3 shadow-[inset_0_0_0_1px_var(--line-strong)]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-[3px] left-[3px] size-3 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.3)] transition-transform duration-200 ease-(--ease-out-quart)",
                          on && "translate-x-3",
                        )}
                      />
                    </span>
                    <span className="w-16 shrink-0 font-mono text-[13px] font-medium text-foreground">UID {v.uid}</span>
                    <span aria-hidden className="relative hidden h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-3 sm:block">
                      <span
                        className={cn("absolute inset-y-0 left-0 rounded-full transition-colors duration-200", on ? "bg-accent" : "bg-faint/60")}
                        style={{ width: `${(v.stake / MAX) * 100}%` }}
                      />
                    </span>
                    <span className="ml-auto flex shrink-0 flex-col items-end leading-tight sm:ml-0 sm:w-24">
                      <span className="font-mono text-[12.5px] text-foreground tnum">{formatInt(v.stake)}</span>
                      <span className="font-mono text-[11px] text-faint tnum">{formatShare(v.stake / TOTAL)} of stake</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-faint">Try</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setWeighting(new Set(preset.uids))}
                className="inline-flex h-7 cursor-pointer items-center rounded-full px-2.5 text-xs font-medium text-muted-foreground shadow-[0_0_0_1px_var(--line)] transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                {preset.label}
              </button>
            ))}
          </div>
          {/* On phones the verdict is a screen away from the toggles, so a compact copy rides along */}
          <div
            aria-hidden
            className="sticky bottom-3 z-10 mt-4 flex items-center gap-2 rounded-lg bg-surface-2/95 px-3 py-2 text-[13px] font-medium shadow-(--shadow-raise) backdrop-blur lg:hidden"
          >
            <verdict.icon className={cn("size-4 shrink-0", verdict.tone)} />
            <span className={verdict.tone}>{verdict.short}</span>
            <span className="text-muted-foreground">
              {formatShare(result.share)} weighted it, kappa {kappaPct}%
            </span>
          </div>
        </fieldset>

        <div className="flex min-w-0 flex-col gap-6 px-5 py-5 sm:px-6">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={sliderId} className="text-[13px] font-medium text-foreground">
                Kappa, the agreement threshold
              </label>
              <span className="font-mono text-[15px] font-semibold text-foreground tnum">{kappaPct}%</span>
            </div>
            <input
              id={sliderId}
              type="range"
              min={0}
              max={100}
              step={1}
              value={kappaPct}
              onChange={(e) => setKappaPct(Number(e.target.value))}
              aria-valuetext={`${kappaPct} percent of validator stake must agree`}
              className="guide-range mt-3"
              style={{ "--fill": `${kappaPct}%` } as React.CSSProperties}
            />
            <p className="mt-1 text-xs text-faint">Finney subnets typically run 50%. SN64 reads 0.5</p>
          </div>

          <div>
            <p className="text-[13px] font-medium text-foreground">Validator stake that weighted the miner</p>
            <div className="relative mt-8">
              <div
                aria-hidden
                className="absolute -top-7 flex -translate-x-1/2 flex-col items-center transition-[left] duration-300 ease-(--ease-out-quart)"
                style={{ left: `clamp(2.25rem, ${kappaPct}%, calc(100% - 2.25rem))` }}
              >
                <span className="rounded bg-foreground px-1.5 py-px font-mono text-[10.5px] font-semibold whitespace-nowrap text-background">kappa {kappaPct}%</span>
              </div>
              <div aria-hidden className="relative flex h-4 overflow-hidden rounded-full bg-surface-3 shadow-[inset_0_0_0_1px_var(--line)]">
                {ordered.map((v) => (
                  <span
                    key={v.uid}
                    title={`UID ${v.uid}`}
                    className={cn(
                      "h-full border-r border-surface transition-[width,background-color] duration-500 ease-(--ease-out-quart) last:border-r-0",
                      weighting.has(v.uid) ? (result.status === "survives" ? "bg-healthy" : "bg-critical") : "bg-transparent",
                    )}
                    style={{ width: `${(v.stake / TOTAL) * 100}%` }}
                  />
                ))}
              </div>
              <span
                aria-hidden
                className="absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 rounded-full bg-foreground transition-[left] duration-300 ease-(--ease-out-quart)"
                style={{ left: `${kappaPct}%` }}
              />
            </div>
            <div aria-hidden className="mt-2 flex justify-between font-mono text-[11px] text-faint">
              <span>0%</span>
              <span className={cn("font-medium", result.status === "survives" ? "text-healthy" : result.status === "clipped" ? "text-critical" : "text-faint")}>
                {formatShare(result.share)} weighted it
              </span>
              <span>100%</span>
            </div>
          </div>

          <div
            className={cn(
              "mt-auto rounded-xl px-4 py-4 transition-colors duration-300",
              result.status === "survives" && "bg-healthy-soft shadow-[0_0_0_1px_color-mix(in_oklab,var(--healthy)_25%,transparent)]",
              result.status === "clipped" && "bg-critical-soft shadow-[0_0_0_1px_color-mix(in_oklab,var(--critical)_25%,transparent)]",
              result.status === "unweighted" && "bg-surface-2 shadow-[0_0_0_1px_var(--line)]",
            )}
          >
            <div role="status" aria-live="polite" aria-atomic="true">
              <p className={cn("flex items-start gap-2 text-[15px] leading-6 font-semibold", verdict.tone)}>
                <verdict.icon className="mt-1 size-4 shrink-0" aria-hidden />
                {verdict.title}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-6 text-pretty text-muted-foreground">
                {result.status === "survives" &&
                  `Validators holding ${formatShare(result.share)} of the stake weighted it, at or above kappa (${kappaPct}%). Consensus keeps the weight, so incentive is above zero`}
                {result.status === "clipped" &&
                  `Only ${formatShare(result.share)} of the stake weighted it, below kappa (${kappaPct}%). Consensus clips the weight to zero, so incentive is 0. This is the case PF110 reports`}
                {result.status === "unweighted" && "No validator weighted it, so incentive is 0 before consensus even runs. The Doctor reports PF108 here, not PF110"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
