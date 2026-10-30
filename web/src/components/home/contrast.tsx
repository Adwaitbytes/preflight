import { ArrowRight } from "lucide-react";
import { Comparison } from "@/components/landing/comparison";

const ROW = [
  ["UID", "0"],
  ["Incentive", "0"],
  ["Trust", "0"],
  ["Emission", "0"],
  ["Axon", "not served"],
] as const;

/** The same miner twice: what the chain hands you, and what Preflight hands you */
export function Contrast() {
  return (
    <section aria-labelledby="compare-title" className="dark bg-[#05060a] text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs tracking-[0.16em] text-[#9db0ff] uppercase">They show, Preflight explains</p>
          <h2 id="compare-title" className="mt-5 text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[1.02] font-light tracking-[-0.045em] text-balance text-white">
            Explorers tell you <span className="font-serif font-normal tracking-[-0.01em] text-[#9db0ff] italic">what</span> happened, not why
          </h2>
        </div>

        <div className="mt-14 grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.25fr)]">
          <div className="flex flex-col rounded-3xl bg-white/[0.03] p-7 shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
            <p className="font-mono text-[11px] tracking-[0.16em] text-white/45 uppercase">What the chain shows</p>
            <dl className="mt-6 flex flex-col divide-y divide-white/[0.06] font-mono text-[15px]">
              {ROW.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between py-3">
                  <dt className="text-white/45">{k}</dt>
                  <dd className="text-white/80 tnum">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-auto pt-6 text-[15px] leading-6 text-white/45">Five numbers. No reason. So you guess, restart, re-register and pay again.</p>
          </div>

          <div aria-hidden className="hidden items-center justify-center lg:flex">
            <span className="grid size-11 place-items-center rounded-full bg-white/[0.06] text-white/60 shadow-[0_0_0_1px_rgb(255_255_255/0.1)]">
              <ArrowRight className="size-4" />
            </span>
          </div>

          <div className="flex flex-col rounded-3xl bg-[linear-gradient(180deg,rgb(76_107_255/0.12),rgb(76_107_255/0.03))] p-7 shadow-[0_0_0_1px_rgb(124_147_255/0.28),0_40px_100px_-40px_rgb(76_107_255/0.5)]">
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#a9b8ff] uppercase">What Preflight says</p>
            <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#ff7b72]/12 px-3 py-1 text-xs font-medium text-[#ff9b94] shadow-[0_0_0_1px_rgb(255_123_114/0.25)]">
              <span className="size-1.5 rounded-full bg-[#ff7b72]" aria-hidden />
              Broken
            </p>
            <p className="mt-4 text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.15] font-light tracking-[-0.03em] text-balance text-white">UID 0 on SN64 earns nothing because no validator has scored it</p>
            <div className="mt-6 rounded-2xl bg-[#7c93ff]/10 p-4 shadow-[0_0_0_1px_rgb(124_147_255/0.3)]">
              <p className="font-mono text-[11px] tracking-[0.14em] text-[#a9b8ff] uppercase">Fix</p>
              <p className="mt-1.5 text-[15px] leading-6 text-white/90">Check that the axon is reachable and that the miner answers the subnet’s queries in the format validators expect</p>
            </div>
            <p className="mt-5 font-mono text-xs text-white/45">Validators weighting this UID: 0 of 17 · read at block 9,395,595</p>
          </div>
        </div>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
          <p className="text-[17px] leading-7 text-pretty text-white/60">
            Taostats, tao.app, bittensor.ai and Metagraphed are great at showing chain data. None of them turns a zero into a reason, an error into a fix, or lets you test a transaction before you pay.
          </p>
          <Comparison />
        </div>
      </div>
    </section>
  );
}
