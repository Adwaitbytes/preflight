import type { Metadata } from "next";
import { Closing } from "@/components/home/closing";
import { Everywhere } from "@/components/home/everywhere";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { Numbers } from "@/components/home/numbers";
import { Comparison } from "@/components/landing/comparison";
import type { Example } from "@/components/landing/omnibox";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Every value here is a real finney read, so the chips work offline and live
const EXAMPLES: Example[] = [
  { label: "Miner earning zero", value: "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq" },
  { label: "Failed unstake", value: "9382178-8" },
  { label: "Error", value: "SubtensorModule.TooManyRegistrationsThisBlock" },
];

export default function Home() {
  return (
    <>
      <Hero examples={EXAMPLES} />
      <Numbers />
      <Features />
      <Everywhere />
      <section aria-labelledby="compare-title" className="dark bg-[#05060a] text-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:px-8">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] text-[#9db0ff] uppercase">They show, Preflight explains</p>
            <h2 id="compare-title" className="mt-5 text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.04] font-light tracking-[-0.045em] text-balance text-white">
              Explorers tell you <span className="font-serif font-normal tracking-[-0.01em] text-[#9db0ff] italic">what</span> happened, not why
            </h2>
            <p className="mt-5 text-[17px] leading-7 text-pretty text-white/60">
              Taostats, tao.app, bittensor.ai and Metagraphed are great at showing chain data. None of them turns a zero into a reason, an error into a fix, or lets you test a transaction before you pay.
            </p>
          </div>
          <Comparison />
        </div>
      </section>
      <Closing examples={EXAMPLES} />
    </>
  );
}
