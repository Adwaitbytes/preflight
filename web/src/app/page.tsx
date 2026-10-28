import type { Metadata } from "next";
import { DEMO_PLAN, DEMO_SUBNETS } from "@/data/demo/subnets";
import { DEMO_SIMS, DEMO_TX } from "@/data/demo/tx";
import { Blocks, Network, ShieldCheck } from "lucide-react";
import { AnswerCard } from "@/components/landing/answer-card";
import { Comparison } from "@/components/landing/comparison";
import { FlightPath } from "@/components/landing/flight-path";
import { LiveEntry } from "@/components/landing/live-entry";
import { DirectoryPreview, DoctorPreview, SimPreview, TxPreview } from "@/components/landing/modules";
import { Omnibox, type Example } from "@/components/landing/omnibox";
import { Container } from "@/components/ui/container";
import { SAMPLE_REPORTS } from "@/lib/offline";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Every value here is a recorded finney read, so the chips work offline and live
const EXAMPLES: Example[] = [
  { label: "Miner earning zero", value: "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq" },
  { label: "Failed unstake", value: "9376703-0022" },
  { label: "Error", value: "SubtensorModule.TooManyRegistrationsThisBlock" },
];

const PROOF = [
  { icon: ShieldCheck, label: "Reads public chain state, never asks for keys" },
  { icon: Network, label: "Finney, testnet and your local chain" },
  { icon: Blocks, label: "Every answer cites the block it read" },
];

export default function Home() {
  // The hero answers its own question with the zero incentive read; the module grid shows a different case
  const answer = SAMPLE_REPORTS.find((r) => r.verdict === "broken" && r.diagnoses[0]?.role === "miner");
  const doctor = SAMPLE_REPORTS.find((r) => r.diagnoses[0]?.role === "unregistered") ?? SAMPLE_REPORTS[0];
  const tx = DEMO_TX[0];
  const sim = DEMO_SIMS[0];
  const featured = [64, 62, 17].map((n) => DEMO_SUBNETS.find((c) => c.netuid === n)).filter((c) => c !== undefined);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="hairline-grid absolute inset-0 -z-10" />
        <FlightPath className="absolute inset-0 -z-10 hidden size-full md:block" />
        <Container className="grid items-center gap-12 pt-14 pb-20 sm:pt-20 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
          <div className="flex min-w-0 flex-col items-start">
            <p className="inline-flex items-center gap-2 rounded-full bg-surface/70 py-1 pr-3 pl-2 font-mono text-2xs font-medium tracking-[0.08em] text-muted-foreground uppercase shadow-[0_0_0_1px_var(--line-strong)] backdrop-blur-sm">
              <span aria-hidden className="grid size-3.5 place-items-center rounded-full bg-accent-soft">
                <span className="size-1.5 rounded-full bg-accent" />
              </span>
              Bittensor debugger
            </p>
            <h1 className="mt-6 max-w-[15ch] text-display font-semibold text-balance">Why does my miner earn zero?</h1>
            <p className="mt-5 max-w-[54ch] text-[17px] leading-7 text-pretty text-muted-foreground">
              Paste a hotkey, a transaction or a netuid. Preflight reads the chain at one block, names the cause, hands you the command that fixes it, and
              lets you test the next transaction before you spend a single rao
            </p>
            <div className="mt-9 w-full">
              <Omnibox examples={EXAMPLES} />
            </div>
            <ul className="mt-9 flex flex-col gap-2.5 text-[13px] text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
              {PROOF.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="size-3.5 shrink-0 text-faint" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          {answer && <AnswerCard report={answer} />}
        </Container>
      </section>

      <LiveEntry />

      <section aria-labelledby="modules" className="border-t border-line bg-surface/40 py-20 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow">Four modules, one engine</p>
            <h2 id="modules" className="mt-3 text-headline font-semibold text-balance">
              Real results from Finney, not mockups
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Each card below is a recorded read from block 9,376,730. The same engine answers the CLI, the HTTP API and the MCP server
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {doctor && <DoctorPreview report={doctor} />}
            {tx && <TxPreview tx={tx} />}
            {sim && <SimPreview sim={sim} />}
            <DirectoryPreview plan={DEMO_PLAN} subnets={featured} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="compare" className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-center">
            <div>
              <p className="eyebrow">They show, Preflight explains</p>
              <h2 id="compare" className="mt-3 text-headline font-semibold text-balance">
                Explorers tell you what happened, not why
              </h2>
              <p className="mt-3 text-pretty text-muted-foreground">
                Taostats, tao.app, bittensor.ai and Metagraphed are good at showing chain data. None of them explains a zero incentive, turns an error into a
                command, or lets you try an extrinsic before you pay for it
              </p>
            </div>
            <Comparison />
          </div>
        </Container>
      </section>
    </>
  );
}
