"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Step {
  chapter: string;
  tool: string;
  question: string;
  body: string;
  proof: string[];
  href: string;
  cta: string;
  shot: string;
  url: string;
  alt: string;
}

const STEPS: Step[] = [
  {
    chapter: "Before you act",
    tool: "Simulator",
    question: "Will this transaction work?",
    body: "Dry run a stake, unstake, transfer or registration against the live chain before you sign. If it would fail, you see the error, what it means and the fix, and nothing is ever sent.",
    proof: ["Checked against live mainnet state", "Never signs, never broadcasts", "Catches the traps the chain only tells you after you pay"],
    href: "/sim",
    cta: "Test a transaction",
    shot: "/shots/sim-fail.png",
    url: "preflight / simulate",
    alt: "The Simulator saying a transfer would fail with SubtensorModule.Payment, what it means and how much TAO to top up",
  },
  {
    chapter: "Before you act",
    tool: "Epoch Lab",
    question: "What will the next epoch pay me?",
    body: "Bittensor’s own consensus math, run on live data before the chain runs it. Then try a new kappa, take a validator offline, or test the weights you are about to set.",
    proof: ["Called all 256 seats of SN19, 111 blocks early", "About two seconds, no fork or download", "Warns you on Telegram before a cut lands"],
    href: "/epoch/finney/64",
    cta: "See the next epoch",
    shot: "/shots/epoch-sn64.png",
    url: "preflight / epoch / SN64",
    alt: "Epoch Lab for SN64 counting down to the next epoch, with the last epoch matched on all 256 seats",
  },
  {
    chapter: "When it breaks",
    tool: "Doctor",
    question: "Why does my miner earn nothing?",
    body: "Paste a hotkey. You get the reason in one sentence, the evidence read from the chain at one block, and the exact step that fixes it.",
    proof: ["27 rules copied from the chain’s own code", "Every answer names its block and hash", "About a second on a real mainnet miner"],
    href: "/doctor/finney/5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq?netuid=64",
    cta: "Diagnose a real miner",
    shot: "/shots/doctor-sn64.png",
    url: "preflight / doctor / SN64 / UID 0",
    alt: "The Doctor saying UID 0 on SN64 earns nothing because no validator has scored it, with the fix and the evidence",
  },
  {
    chapter: "When it breaks",
    tool: "Transaction debugger",
    question: "Why did my transaction fail?",
    body: "Paste a hash, a block and position, or just the error text. You get what it means on chain, what it cost you, and what to do instead.",
    proof: ["406 chain errors, plus the traps they miss", "Explained with the transaction’s own numbers", "Paste a block hash and it opens the block"],
    href: "/tx/finney/9382178-8",
    cta: "Open a failed unstake",
    shot: "/shots/tx-failed-unstake.png",
    url: "preflight / tx / 9382178-8",
    alt: "A failed remove_stake explained: InsufficientLiquidity, the fee it still paid, what it means and the fix",
  },
  {
    chapter: "Always watching",
    tool: "Network weather",
    question: "Is it me, or the whole network?",
    body: "What is failing on chain right now, grouped by error, with the subnets it hits and the fix. Add a watch and Preflight messages you on Telegram before your miner drops, not after.",
    proof: ["Every block decoded as it lands", "Each failure opens in the debugger", "Telegram alerts before an epoch cuts your pay"],
    href: "/weather",
    cta: "Check the weather",
    shot: "/shots/weather-finney.png",
    url: "preflight / weather",
    alt: "Network weather showing the share of transactions failing right now and the errors behind them",
  },
];

/**
 * The tools as one guided scroll: the questions move past while a single framed screen holds still
 * beside them and changes to answer the one in view. Phones get each screen inline instead.
 */
export function Tour() {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // The step crossing the middle band of the viewport is the one being read
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    steps.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const current = STEPS[active] ?? STEPS[0]!;

  return (
    <section aria-labelledby="tour-title" className="dark relative isolate bg-[#05060a] text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4c6bff]/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs tracking-[0.16em] text-[#9db0ff] uppercase">Explain · Predict · Warn</p>
          <h2 id="tour-title" className="mt-5 text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[1.02] font-light tracking-[-0.045em] text-balance text-white">
            Before you act, when it breaks, and <span className="font-serif font-normal tracking-[-0.01em] text-[#9db0ff] italic">always</span> watching
          </h2>
        </div>

        <div className="mt-8 pb-24 sm:pb-32 lg:mt-12 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <ol className="flex flex-col">
            {STEPS.map((step, i) => (
              <li
                key={step.tool}
                ref={(el) => {
                  steps.current[i] = el;
                }}
                data-step={i}
                className={cn(
                  "flex flex-col justify-center py-14 transition-opacity duration-500 motion-reduce:transition-none lg:min-h-[86vh] lg:py-0",
                  i === active ? "lg:opacity-100" : "lg:opacity-35",
                )}
              >
                <p className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-[0.16em] text-white/55 uppercase">
                  <span className="text-[#9db0ff] tnum">{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden className="h-px w-6 bg-white/20" />
                  <span className="text-white/40">{step.chapter}</span>
                  <span aria-hidden className="text-white/25">/</span>
                  {step.tool}
                </p>
                <h3 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] leading-[1.08] font-light tracking-[-0.035em] text-balance text-white">{step.question}</h3>
                <p className="mt-5 max-w-[34rem] text-[17px] leading-7 text-pretty text-white/60">{step.body}</p>
                <ul className="mt-7 max-w-[34rem] border-t border-white/10">
                  {step.proof.map((line) => (
                    <li key={line} className="border-b border-white/10 py-3 text-[15px] text-white/80">
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  href={step.href}
                  className="group/cta mt-8 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#05060a] transition-colors hover:bg-[#dfe5ff]"
                >
                  {step.cta}
                  <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" aria-hidden />
                </Link>
                {/* Phones and tablets read each screen in place */}
                <Frame step={step} className="mt-10 lg:hidden" />
              </li>
            ))}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-[calc(50vh-17rem)]">
              <div className="relative">
                <div aria-hidden className="absolute -inset-12 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,rgb(76_107_255/0.28),transparent)] blur-2xl" />
                <figure className="overflow-hidden rounded-2xl bg-[#0b0c12] shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_40px_100px_-30px_rgb(0_0_0/0.9)]">
                  <div aria-hidden className="flex h-10 items-center gap-1.5 border-b border-white/10 px-4">
                    <span className="size-2.5 rounded-full bg-white/15" />
                    <span className="size-2.5 rounded-full bg-white/15" />
                    <span className="size-2.5 rounded-full bg-white/15" />
                    <span key={current.url} className="tour-url ml-3 truncate font-mono text-xs text-white/50">
                      {current.url}
                    </span>
                  </div>
                  <div className="relative aspect-[1180/738]">
                    {STEPS.map((step, i) => (
                      <Image
                        key={step.shot}
                        src={step.shot}
                        alt={i === active ? step.alt : ""}
                        aria-hidden={i !== active}
                        fill
                        sizes="(min-width: 1024px) 680px, 100vw"
                        className={cn(
                          "object-cover transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
                          i === active ? "scale-100 opacity-100" : "scale-[1.02] opacity-0",
                        )}
                      />
                    ))}
                  </div>
                </figure>
              </div>
              <ol aria-label="Tools" className="mt-6 grid grid-cols-5 gap-3">
                {STEPS.map((step, i) => (
                  <li key={step.tool}>
                    <span className="block h-[3px] overflow-hidden rounded-full bg-white/10">
                      <span className={cn("block h-full rounded-full bg-[#7c93ff] transition-[width] duration-500 motion-reduce:transition-none", i <= active ? "w-full" : "w-0")} />
                    </span>
                    <span className={cn("mt-2 block truncate font-mono text-[11px] tracking-[0.12em] uppercase transition-colors", i === active ? "text-white" : "text-white/40")}>{step.tool === "Transaction debugger" ? "Tx debugger" : step.tool}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Frame({ step, className }: { step: Step; className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-2xl bg-[#0b0c12] shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_30px_80px_-30px_rgb(0_0_0/0.9)]", className)}>
      <div aria-hidden className="flex h-9 items-center gap-1.5 border-b border-white/10 px-3.5">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="ml-3 truncate font-mono text-[11px] text-white/45">{step.url}</span>
      </div>
      <Image src={step.shot} alt={step.alt} width={2360} height={1476} sizes="100vw" className="block h-auto w-full" />
    </figure>
  );
}
