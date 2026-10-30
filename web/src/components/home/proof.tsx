"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SIDE = 16;
const SEATS = SIDE * SIDE;
// UID 85: the miner Epoch Lab said would drop to zero, and did
const CALLED = 85;

const CHECKS = [
  { what: "SN1, SN3, SN8, SN9, SN19, SN56, SN64", how: "last epoch rebuilt", result: "256 of 256 each" },
  { what: "SN64", how: "called 90 blocks early", result: "243 of 256" },
  { what: "SN4", how: "last epoch rebuilt", result: "254 of 256" },
  { what: "SN51", how: "last epoch rebuilt", result: "245 of 256" },
] as const;

/**
 * The forecast that came true: SN19's next epoch, written down 111 blocks before it ran, against
 * what the chain paid. The seats fill as the section comes into view; the count follows them.
 */
export function Proof() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        setShown(true);
        if (reduce) {
          setCount(SEATS);
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1600);
          setCount(Math.round(SEATS * (1 - Math.pow(1 - t, 3))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section aria-labelledby="proof-title" className="dark relative isolate overflow-hidden bg-[#040407] text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_75%_45%,rgb(31_154_85/0.16),transparent_70%)]" />
      <div ref={ref} className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-8">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-[0.16em] text-[#9db0ff] uppercase">Proof, not promises</p>
          <h2 id="proof-title" className="mt-5 text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[1.02] font-light tracking-[-0.045em] text-balance text-white">
            We called the epoch <span className="font-serif font-normal tracking-[-0.01em] text-[#9db0ff] italic">before</span> it ran
          </h2>
          <p className="mt-6 max-w-[34rem] text-[17px] leading-7 text-pretty text-white/60">
            On 30 October we saved Epoch Lab’s forecast for SN19 at block 9,392,018, 111 blocks or about 22 minutes before the epoch. Then the chain ran it.
          </p>

          <p className="mt-10 flex items-baseline gap-3 text-white" aria-label="256 of 256 seats matched the chain exactly">
            <span className="text-[clamp(4.5rem,9vw,7.5rem)] leading-none font-light tracking-[-0.06em] tnum">{count}</span>
            <span className="text-[clamp(2rem,4vw,3.25rem)] leading-none font-light tracking-[-0.05em] text-white/40 tnum">/ 256</span>
          </p>
          <p className="mt-3 text-[17px] text-white/70">seats paid exactly what we said they would</p>

          <dl className="mt-10 max-w-[34rem] border-t border-white/10">
            {CHECKS.map((check) => (
              <div key={check.what + check.how} className="flex items-baseline justify-between gap-6 border-b border-white/10 py-3 text-[14px]">
                <dt className="min-w-0 text-white/60">
                  <span className="text-white/85">{check.what}</span> · {check.how}
                </dt>
                <dd className="shrink-0 font-mono text-[13px] text-white/85 tnum">{check.result}</dd>
              </div>
            ))}
          </dl>
          <Link href="/epoch/finney/64" className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#a9b8ff] transition-colors hover:text-white">
            Check the last epoch yourself
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <div className="relative min-w-0">
          <div role="img" aria-label="A 16 by 16 grid of SN19's 256 seats, every one matched; UID 85 is marked" className="grid grid-cols-16 gap-[5px] sm:gap-[6px]">
            {Array.from({ length: SEATS }, (_, i) => {
              const row = Math.floor(i / SIDE);
              const col = i % SIDE;
              return (
                <span
                  key={i}
                  className={cn(
                    "aspect-square rounded-[4px] transition-[background-color,box-shadow] duration-300 motion-reduce:transition-none",
                    shown ? "bg-[#1f9a55]" : "bg-white/[0.06]",
                    shown && i === CALLED && "shadow-[0_0_0_2px_#040407,0_0_0_4px_#ff8a4c]",
                  )}
                  style={{ transitionDelay: shown ? `${(row + col) * 34}ms` : "0ms" }}
                />
              );
            })}
          </div>
          <div
            className={cn(
              "absolute top-[38%] right-0 left-[28%] rounded-2xl bg-[#0d0f18]/92 p-5 shadow-[0_0_0_1px_rgb(255_138_76/0.35),0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-md transition-[opacity,transform] duration-500 motion-reduce:transition-none sm:left-[36%]",
              shown ? "translate-y-0 opacity-100 [transition-delay:1.4s]" : "translate-y-2 opacity-0",
            )}
          >
            <p className="flex items-center justify-between gap-3">
              <span className="text-[17px] font-medium text-white">UID 85</span>
              <span className="font-mono text-xs text-white/60">
                forecast <b className="text-white">0%</b> · paid <b className="text-white">0%</b>
              </span>
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-white/60">
              <span className="rounded-md bg-[#ff8a4c]/15 px-2 py-0.5 text-[#ffb58f]">Drops to zero</span>
              <span className="font-mono text-white/80">0.182% → 0%</span>
            </p>
            <p className="mt-2 text-[13px] leading-5 text-white/55">No voting validator weighted it any more. Epoch Lab said so 22 minutes early.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
