import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Feature {
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

const FEATURES: Feature[] = [
  {
    tool: "Doctor",
    question: "Why does my miner earn nothing?",
    body: "Paste a hotkey. You get the reason in one sentence, the evidence read from the chain at one block, and the exact command that fixes it.",
    proof: ["27 rules copied from the chain’s own code", "Every answer names its block and hash", "1.4 seconds on this real mainnet miner"],
    href: "/doctor/finney/5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq?netuid=64",
    cta: "Diagnose a real miner",
    shot: "/shots/doctor-sn64.png",
    url: "preflight / doctor / SN64 / UID 0",
    alt: "The Doctor saying UID 0 on SN64 earns nothing because no validator has scored it, with the fix and the evidence",
  },
  {
    tool: "Epoch Lab",
    question: "What will the next epoch pay me?",
    body: "Bittensor’s own consensus math, run on live data before the chain runs it. Then try a new kappa, take a validator offline, or test the weights you are about to set.",
    proof: ["Called all 256 seats of SN19, 111 blocks ahead", "About two seconds, no fork or download", "Warns you on Telegram before a cut lands"],
    href: "/epoch/finney/64",
    cta: "See the next epoch",
    shot: "/shots/epoch-sn64.png",
    url: "preflight / epoch / SN64",
    alt: "Epoch Lab for SN64 counting down to the next epoch in 61 minutes, with the last epoch matched on all 256 seats",
  },
  {
    tool: "Transaction debugger",
    question: "Why did my transaction fail?",
    body: "Paste a hash, a block and position, or just the error text. You get what it means on chain, what it cost you, and what to do instead.",
    proof: ["406 chain errors, plus the traps they miss", "Explained with the transaction’s own numbers", "Test the fix in the simulator first"],
    href: "/tx/finney/9382178-8",
    cta: "Open a failed unstake",
    shot: "/shots/tx-failed-unstake.png",
    url: "preflight / tx / 9382178-8",
    alt: "A failed remove_stake explained: InsufficientLiquidity, the fee it still paid, what it means and the fix",
  },
  {
    tool: "Network weather",
    question: "Is it me, or the whole network?",
    body: "What is failing on chain right now, grouped by error, with the subnets it hits, what it means and how to fix it. Refreshed every minute.",
    proof: ["Every block decoded as it lands", "Each failure opens in the debugger", "A live feed of the whole chain beside it"],
    href: "/weather",
    cta: "Check the weather",
    shot: "/shots/weather-finney.png",
    url: "preflight / weather",
    alt: "Network weather showing the share of transactions failing right now and the errors behind them",
  },
];

function Shot({ feature, flip }: { feature: Feature; flip: boolean }) {
  return (
    <div className="group/shot relative [perspective:1600px]">
      <div aria-hidden className="absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,rgb(76_107_255/0.28),transparent)] blur-2xl" />
      <figure
        className={cn(
          "overflow-hidden rounded-2xl bg-[#0b0c12] shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_40px_100px_-30px_rgb(0_0_0/0.9)] transition-transform duration-700 ease-out motion-reduce:transition-none",
          flip ? "lg:[transform:rotateY(5deg)]" : "lg:[transform:rotateY(-5deg)]",
          "group-hover/shot:[transform:rotateY(0deg)]",
        )}
      >
        <div aria-hidden className="flex h-9 items-center gap-1.5 border-b border-white/10 px-3.5">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="ml-3 truncate font-mono text-[11px] text-white/40">{feature.url}</span>
        </div>
        <Image src={feature.shot} alt={feature.alt} width={2360} height={1476} sizes="(min-width: 1024px) 680px, 100vw" className="block h-auto w-full" />
      </figure>
    </div>
  );
}

/** The tools, each as one real screen from mainnet and the question it answers */
export function Features() {
  return (
    <section aria-labelledby="features-title" className="dark relative isolate overflow-hidden bg-[#05060a] text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs tracking-[0.16em] text-[#9db0ff] uppercase">What Preflight does</p>
          <h2 id="features-title" className="mt-5 text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[1.02] font-light tracking-[-0.045em] text-balance text-white">
            One paste. <span className="font-serif font-normal tracking-[-0.01em] text-[#9db0ff] italic">Every</span> answer, from the chain itself
          </h2>
        </div>
        <div className="mt-20 flex flex-col gap-28 sm:gap-36">
          {FEATURES.map((feature, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={feature.tool} className={cn("grid items-center gap-12 lg:gap-16", flip ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]")}>
                <div className={cn("min-w-0", flip && "lg:order-2")}>
                  <p className="font-mono text-xs tracking-[0.16em] text-white/55 uppercase">{feature.tool}</p>
                  <h3 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] leading-[1.08] font-light tracking-[-0.035em] text-balance text-white">{feature.question}</h3>
                  <p className="mt-5 max-w-[34rem] text-[17px] leading-7 text-pretty text-white/60">{feature.body}</p>
                  <ul className="mt-8 max-w-[34rem] border-t border-white/10">
                    {feature.proof.map((line, n) => (
                      <li key={line} className="flex items-baseline gap-5 border-b border-white/10 py-3.5 text-[15px] text-white/80">
                        <span aria-hidden className="font-mono text-[11px] text-[#9db0ff] tnum">
                          {String(n + 1).padStart(2, "0")}
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={feature.href}
                    className="group/cta mt-9 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#05060a] transition-colors hover:bg-[#dfe5ff]"
                  >
                    {feature.cta}
                    <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" aria-hidden />
                  </Link>
                </div>
                <div className={cn("min-w-0", flip && "lg:order-1")}>
                  <Shot feature={feature} flip={flip} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
