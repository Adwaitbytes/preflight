"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useState } from "react";
import { Omnibox, type Example } from "@/components/landing/omnibox";
import seats from "@/data/seats.json";
import { LiveTicker } from "./live-ticker";
import { SeatGalaxy, type HoveredSubnet } from "./seat-galaxy";

const FORMAT = new Intl.NumberFormat("en-US");

/**
 * The landing hero: every miner seat on Bittensor as a turning field of light behind one
 * question. Always dark, whatever the visitor's theme, like an instrument panel.
 */
export function Hero({ examples }: { examples: Example[] }) {
  const [hovered, setHovered] = useState<HoveredSubnet | null>(null);
  const onHover = useCallback((subnet: HoveredSubnet | null) => setHovered(subnet), []);
  const zeroShare = Math.round((seats.zero / seats.miners) * 100);

  return (
    <section aria-labelledby="hero-title" className="dark relative isolate -mt-14 flex min-h-svh flex-col overflow-hidden bg-[#040407] pt-14 text-foreground">
      <SeatGalaxy className="absolute inset-0 -z-10" onHover={onHover} />
      {/* Keep the centred headline readable: a soft dark pool behind the text, the field open around it */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(4_4_7/0.94)_0%,rgb(4_4_7/0.86)_62%,transparent_92%)] md:bg-[radial-gradient(52%_46%_at_50%_40%,rgb(4_4_7/0.92)_0%,rgb(4_4_7/0.7)_55%,transparent_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-[#040407] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#040407] to-transparent" />

      {hovered && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-20 hidden -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl bg-[#0d0f18]/90 px-3.5 py-2.5 text-left shadow-[0_0_0_1px_rgb(124_147_255/0.35),0_16px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur-md md:block"
          style={{ left: hovered.x, top: hovered.y }}
        >
          <p className="font-mono text-xs text-[#a9b8ff]">SN{hovered.netuid}</p>
          <p className="mt-0.5 text-sm font-medium tnum text-white">
            {hovered.earning} of {hovered.miners} seats earn
          </p>
          <p className="text-xs text-white/50 tnum">{Math.round(((hovered.miners - hovered.earning) / Math.max(hovered.miners, 1)) * 100)}% earned nothing</p>
        </div>
      )}

      <div className="pointer-events-none mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pt-10 pb-8 text-center sm:px-6 lg:px-8">
        <div className="pointer-events-auto flex w-full max-w-[46rem] flex-col items-center">
          <a
            href="#tour-title"
            className="group inline-flex max-w-full items-center gap-2 rounded-full bg-white/[0.06] py-1.5 pr-3 pl-2.5 text-xs font-medium text-white/80 shadow-[0_0_0_1px_rgb(255_255_255/0.12)] backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#56d68a] shadow-[0_0_8px_#56d68a]" />
            <span className="truncate">The debugger for Bittensor · live on mainnet</span>
            <ArrowRight className="size-3 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-white motion-reduce:transition-none" aria-hidden />
          </a>
          <h1 id="hero-title" className="mt-7 text-[clamp(2.9rem,min(6.6vw,10svh),6.5rem)] leading-[0.98] font-light tracking-[-0.055em] text-balance text-white">
            Stop flying <span className="font-serif font-normal tracking-[-0.02em] text-[#9db0ff] italic">blind</span> <br className="max-sm:hidden" />
            on Bittensor
          </h1>
          <p className="mt-6 max-w-[38rem] text-[17px] leading-7 text-pretty text-white/65 sm:text-lg">Paste a hotkey, a transaction or an error. Get the reason and the fix.</p>
          <div className="mt-9 w-full max-w-[40rem] text-left">
            <Omnibox examples={examples} variant="hero" align="center" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6 lg:px-8 [&_a]:pointer-events-auto">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-end lg:justify-between">
          <p className="text-[13px] leading-5 text-white/55">
            <span className="mr-2 inline-flex translate-y-[-1px] items-center gap-1.5 align-middle">
              <span className="size-2 rounded-full bg-[#7c93ff] shadow-[0_0_10px_#7c93ff]" />
              <span className="size-2 rounded-full bg-white/25" />
            </span>
            {FORMAT.format(seats.miners)} miner seats. Lit ones earned last epoch, {zeroShare}% earned nothing.
          </p>
          <LiveTicker />
        </div>
      </div>
    </section>
  );
}
