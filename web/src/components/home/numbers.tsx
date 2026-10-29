"use client";

import { useEffect, useRef, useState } from "react";
import seats from "@/data/seats.json";
import { cn } from "@/lib/utils";

const FORMAT = new Intl.NumberFormat("en-US");

type Reason = keyof typeof seats.buckets;

// Fixed categorical order, validated for colour blindness on this sand surface; "other" stays neutral
const REASONS: { key: Reason; label: string; detail: string; color: string }[] = [
  { key: "burn", label: "Subnet pays one UID", detail: `${seats.burn_subnets} subnets send 90% or more of miner pay to a single UID, an owner burn or one winner`, color: "#c2541c" },
  { key: "no_axon", label: "Never served an axon", detail: "Validators have nothing to query, so it is never scored", color: "#2f4fe0" },
  { key: "no_weight", label: "No validator weights it", detail: "No voting validator puts any weight on it", color: "#008f8a" },
  { key: "immune", label: "Still in immunity", detail: "Registered recently and not scored yet", color: "#a06a00" },
  { key: "clipped", label: "Cut by consensus", detail: "Validators weight it, but consensus cuts it to zero", color: "#7b4fd1" },
  { key: "other", label: "Something else", detail: "The Doctor names the rule for each one", color: "#8a8f99" },
];

const STATS = [
  { value: "11", unit: "in 22 days", label: "new runtimes shipped, and each one can move your pay" },
  { value: "1 in 90", unit: "transactions", label: "failed in a two hour sample, and still paid its fee" },
  { value: "256", unit: "of 256", label: "seats called right, 111 blocks before the epoch ran", tone: "text-[#2f4fe0]" },
] as const;

function share(count: number): string {
  const pct = (count / seats.zero) * 100;
  return pct < 1 ? "<1%" : `${Math.round(pct)}%`;
}

/** What we measured on mainnet: how many seats earned nothing, and the reason behind each one */
export function Numbers() {
  const barRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [focus, setFocus] = useState<Reason | null>(null);

  // The bar fills once it is on screen, so the proportions read as they arrive
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(bar);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="numbers-title" className="light relative bg-[#efeae2] text-[#17191e]">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="numbers-title" className="max-w-[18ch] scroll-mt-24 text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[1.02] font-light tracking-[-0.045em] text-balance">
            We measured <span className="font-serif font-normal tracking-[-0.01em] text-[#2f4fe0] italic">every</span> miner on Bittensor
          </h2>
          <p className="max-w-[26rem] text-[15px] leading-7 text-pretty text-[#4a4f5a]">
            Read with Preflight across all {seats.subnets} subnets at block {FORMAT.format(seats.block)} on 30 October 2026. The chain shows each of these miners a zero. It never says why, so we checked.
          </p>
        </div>

        <figure className="mt-14 rounded-3xl bg-[#f6f2ec] p-6 shadow-[0_0_0_1px_#ddd5c8,0_30px_60px_-40px_rgb(23_25_30/0.35)] sm:p-10">
          <figcaption className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p>
              <span className="block text-[clamp(3.25rem,7vw,5.5rem)] leading-[0.9] font-light tracking-[-0.055em] text-[#c2541c] tnum">{FORMAT.format(seats.zero)}</span>
              <span className="mt-3 block text-[17px] leading-6 text-[#3a3f48]">
                of {FORMAT.format(seats.miners)} miner seats earned nothing at the last epoch
              </span>
            </p>
            <p className="font-mono text-xs tracking-[0.14em] text-[#6b6f78] uppercase">Why each one earned nothing</p>
          </figcaption>

          <div
            ref={barRef}
            role="img"
            aria-label={REASONS.map((r) => `${r.label}: ${FORMAT.format(seats.buckets[r.key])}`).join(", ")}
            className="mt-8 flex h-14 gap-[2px] overflow-hidden rounded-xl sm:h-16"
          >
            {REASONS.map((reason, i) => {
              const count = seats.buckets[reason.key];
              const wide = count / seats.zero >= 0.06;
              return (
                <div
                  key={reason.key}
                  onPointerEnter={() => setFocus(reason.key)}
                  onPointerLeave={() => setFocus(null)}
                  className={cn(
                    "relative flex min-w-[3px] origin-left items-center overflow-hidden px-3 transition-[transform,opacity] duration-[900ms] ease-(--ease-out-expo) first:rounded-l-[4px] last:rounded-r-[4px] motion-reduce:transition-none",
                    shown ? "scale-x-100" : "scale-x-0",
                    focus && focus !== reason.key ? "opacity-35" : "opacity-100",
                  )}
                  style={{ flexGrow: count, flexBasis: 0, backgroundColor: reason.color, transitionDelay: shown ? `${i * 70}ms, 0ms` : undefined }}
                >
                  {wide && <span className="font-mono text-[13px] font-medium text-white tnum">{share(count)}</span>}
                </div>
              );
            })}
          </div>

          <ul className="mt-8 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((reason) => {
              const count = seats.buckets[reason.key];
              return (
                <li
                  key={reason.key}
                  onPointerEnter={() => setFocus(reason.key)}
                  onPointerLeave={() => setFocus(null)}
                  className={cn("-mx-3 rounded-2xl px-3 py-3 transition-[background-color,opacity] duration-200", focus === reason.key && "bg-[#ece6dc]", focus && focus !== reason.key && "opacity-55")}
                >
                  <p className="flex items-baseline gap-2.5">
                    <span aria-hidden className="size-2.5 shrink-0 translate-y-[-1px] rounded-[3px]" style={{ backgroundColor: reason.color }} />
                    <span className="text-[15px] font-medium">{reason.label}</span>
                    <span className="ml-auto font-mono text-[13px] text-[#3a3f48] tnum">{FORMAT.format(count)}</span>
                    <span className="w-10 text-right font-mono text-[13px] text-[#6b6f78] tnum">{share(count)}</span>
                  </p>
                  <p className="mt-1 pl-5 text-[13.5px] leading-5 text-pretty text-[#5a5f69]">{reason.detail}</p>
                </li>
              );
            })}
          </ul>
        </figure>

        <dl className="mt-4 grid gap-px overflow-hidden rounded-3xl bg-[#ddd5c8] shadow-[0_0_0_1px_#ddd5c8] sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col bg-[#f6f2ec] p-6 sm:p-8">
              <dt className="sr-only">{stat.label}</dt>
              <dd className={cn("flex items-baseline gap-3", "tone" in stat ? stat.tone : "text-[#17191e]")}>
                <span className="text-[clamp(2.25rem,3.4vw,3rem)] leading-none font-light tracking-[-0.05em] tnum">{stat.value}</span>
                <span className="font-mono text-xs tracking-[0.08em] text-[#6b6f78] uppercase">{stat.unit}</span>
              </dd>
              <dd className="mt-3 text-[15px] leading-6 text-pretty text-[#3a3f48]">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
