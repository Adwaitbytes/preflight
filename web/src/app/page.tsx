import { DEMO_PLAN, DEMO_SUBNETS } from "@/data/demo/subnets";
import { DEMO_SIMS, DEMO_TX } from "@/data/demo/tx";
import { Comparison } from "@/components/landing/comparison";
import { DirectoryPreview, DoctorPreview, SimPreview, TxPreview } from "@/components/landing/modules";
import { Omnibox, type Example } from "@/components/landing/omnibox";
import { Container } from "@/components/ui/container";
import { SAMPLE_REPORTS } from "@/lib/offline";

// Every value here is a recorded finney read, so the chips work offline and live
const EXAMPLES: Example[] = [
  { label: "Miner earning zero", value: "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq" },
  { label: "Failed unstake", value: "9376703-0022" },
  { label: "Error", value: "SubtensorModule.TooManyRegistrationsThisBlock" },
];

export default function Home() {
  const doctor = SAMPLE_REPORTS[0];
  const tx = DEMO_TX[0];
  const sim = DEMO_SIMS[0];
  const featured = [64, 62, 17].map((n) => DEMO_SUBNETS.find((c) => c.netuid === n)).filter((c) => c !== undefined);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="hairline-grid absolute inset-0 -z-10" />
        <Container className="flex flex-col items-start pt-16 pb-20 sm:pt-24 sm:pb-28">
          <p className="eyebrow rise-in">Bittensor debugger · finney, testnet and local</p>
          <h1 className="rise-in mt-5 max-w-[16ch] text-display font-semibold text-balance [animation-delay:60ms]">Why does my miner earn zero?</h1>
          <p className="rise-in mt-5 max-w-[56ch] text-[17px] leading-7 text-pretty text-muted-foreground [animation-delay:120ms]">
            Paste a hotkey, a transaction or a netuid. Preflight reads the chain at one block, names the cause in a sentence and hands you the exact command
            that fixes it
          </p>
          <div className="rise-in mt-10 w-full max-w-3xl [animation-delay:180ms]">
            <Omnibox examples={EXAMPLES} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="modules" className="border-t border-line bg-surface/40 py-20 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow">Four modules, one engine</p>
            <h2 id="modules" className="mt-3 text-headline font-semibold text-balance">
              Real results from finney, not mockups
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
                Explorers tell you what happened. You still have to work out why
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
