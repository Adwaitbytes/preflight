import { BellRing, Calculator, FlaskConical, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { EpochPicker } from "@/components/epoch/epoch-picker";
import { Container, PageHeader } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Epoch Lab",
  description:
    "See a Bittensor subnet's next epoch before it runs: each miner's incentive and why, computed in seconds from live mainnet state with Yuma consensus's own math, and what-ifs for kappa, offline validators and new weights",
  alternates: { canonical: "/epoch" },
};

const STEPS = [
  {
    icon: Calculator,
    title: "The chain’s own math",
    body: "Stake-weighted median at kappa, clipping, ranks: a line-by-line port of subtensor’s epoch, run on live state in about two seconds. No fork, no download, no TAO.",
  },
  {
    icon: ShieldCheck,
    title: "Checked every time",
    body: "Each page recomputes the subnet’s last epoch from the block before it and compares with what the chain stored, so you see the accuracy, not a promise.",
  },
  {
    icon: FlaskConical,
    title: "What if, before you act",
    body: "Change kappa, take a validator offline or paste the weights your validator is about to set. Its trust shows how much consensus would keep.",
  },
  {
    icon: BellRing,
    title: "Everywhere you work",
    body: "preflight epoch in the terminal, with a --min-trust gate for CI, /epoch in Telegram, and preview_epoch for Claude.",
  },
] as const;

export default function EpochIndexPage() {
  return (
    <Container className="pb-16">
      <PageHeader
        eyebrow="Epoch Lab"
        title="See the next epoch before it runs"
        accent="before it runs"
        description="Every miner’s incentive at the next epoch, and why, computed from live chain state with Yuma consensus’s own math. Then change the inputs and recompute, without touching the chain"
      />
      <EpochPicker />
      <section aria-labelledby="epoch-how" className="mt-12">
        <h2 id="epoch-how" className="text-sm font-semibold">
          How it works
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="panel flex gap-4 p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-pretty text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[72ch] text-xs leading-5 text-pretty text-faint">
          Measured on 29 October 2026 against nine real finney epochs: eight matched every UID to the last step the chain stores. The ninth, a commit-reveal subnet, was 0.25% off because a validator’s sealed weights opened in the epoch block itself. Previews cover incentive; dividends depend on bonds and are not computed yet.
        </p>
      </section>
    </Container>
  );
}
