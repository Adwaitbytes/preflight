import { ArrowRight, BookOpen, Receipt, Stethoscope, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ConceptGrid, KeyPair } from "@/components/guide/concepts";
import { MINER_STAGES } from "@/components/guide/content";
import { Glossary } from "@/components/guide/glossary";
import { GuideJumpMenu, GuideReveal, GuideToc, type TocEntry } from "@/components/guide/guide-nav";
import { KappaWidget } from "@/components/guide/kappa-widget";
import { LaunchBody } from "@/components/guide/launch-section";
import { MinerLifecycle } from "@/components/guide/miner-lifecycle";
import { NetworkDiagram } from "@/components/guide/network-diagram";
import { Code, ExternalLink, GuideSectionShell, Prose, Snippet, SubHeading } from "@/components/guide/primitives";
import { RuleReference } from "@/components/guide/rule-reference";
import { Term } from "@/components/guide/term";
import { SimulatorBody } from "@/components/guide/simulator-section";
import { Surfaces } from "@/components/guide/surfaces";
import { TxWalkthrough } from "@/components/guide/tx-walkthrough";
import { ValidatorBody } from "@/components/guide/validator-section";
import { ZeroCauses } from "@/components/guide/zero-causes";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { GUIDE_SECTIONS, RULES, type GuideSectionId } from "@/lib/guide";

export const metadata: Metadata = {
  title: "Guide",
  description:
    "Bittensor from zero: subnets, miners, validators, consensus and failed transactions in plain words, with real finney data and the Preflight rule that catches each problem",
};

const DOCS = "https://www.bittensor.com/docs";

function section(id: GuideSectionId) {
  const found = GUIDE_SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown guide section ${id}`);
  return found;
}

const PATHS: { icon: LucideIcon; who: string; then: string; href: string }[] = [
  { icon: BookOpen, who: "New to Bittensor", then: "The two minute version", href: "#basics" },
  { icon: Stethoscope, who: "My miner earns zero", then: "Five causes, with real findings", href: "#earns-zero" },
  { icon: Receipt, who: "My transaction failed", then: "Read one, step by step", href: "#failed-tx" },
];

function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <div aria-hidden className="hairline-grid absolute inset-0 -z-10" />
      <Container className="pt-14 pb-14 sm:pt-20 sm:pb-16">
        <p className="eyebrow rise-in">
          Guide · {GUIDE_SECTIONS.length} chapters · {RULES.length} rules<span className="hidden sm:inline"> · real finney data</span>
        </p>
        <h1 className="rise-in mt-5 max-w-[15ch] text-[clamp(2.75rem,1.8rem+4.2vw,5.25rem)] leading-[0.98] font-light tracking-[-0.055em] text-balance [animation-delay:60ms]">
          Bittensor, explained <span className="font-serif font-normal tracking-[-0.01em] text-accent-ink italic">from zero</span>
        </h1>
        <p className="rise-in mt-5 max-w-[60ch] text-[17px] leading-7 text-pretty text-muted-foreground [animation-delay:120ms]">
          Subnets, miners, validators, consensus and the errors that cost you TAO, in plain words. Every example is a real read from finney, and every problem
          links to the Preflight rule that catches it
        </p>
        <ul className="rise-in mt-10 grid grid-cols-1 gap-3 [animation-delay:180ms] lg:grid-cols-3">
          {PATHS.map((path) => (
            <li key={path.href}>
              <a
                href={path.href}
                className="group flex h-full items-center gap-3.5 rounded-xl bg-surface/80 px-4 py-3.5 shadow-(--shadow-raise) backdrop-blur-sm transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-surface"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-foreground shadow-[0_0_0_1px_var(--line)]">
                  <path.icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-foreground">{path.who}</span>
                  <span className="block text-[13px] text-muted-foreground">{path.then}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Outro() {
  return (
    <section aria-labelledby="next-title" data-reveal className="panel relative mt-2 mb-16 overflow-hidden px-6 py-10 sm:mb-20 sm:px-10 sm:py-12">
      <div aria-hidden className="hairline-grid absolute inset-0 opacity-70" />
      <div className="relative">
        <p className="eyebrow">That is the guide</p>
        <h2 id="next-title" className="mt-3 max-w-[22ch] text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.08] font-light tracking-[-0.04em] text-balance">
          Now run it on your own hotkey
        </h2>
        <p className="mt-3 max-w-[56ch] text-[16px] leading-[27px] text-pretty text-muted-foreground">
          Paste a hotkey, a transaction or an error. Preflight reads the chain at one block and tells you which of the problems above you have, with the command
          that fixes it. Below is reference: every rule, every way to run Preflight, and a glossary
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link href="/" className={buttonVariants({ variant: "primary", size: "lg" })}>
            Diagnose a hotkey
          </Link>
          <Link href="/explain" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            Explain an error
          </Link>
          <Link href="/sim" className={buttonVariants({ variant: "ghost", size: "lg" })}>
            Simulate a transaction
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function GuidePage() {
  // Chapters 9 to 11 are lookup material, so the navigation sets them apart from the guide proper
  const entries: TocEntry[] = GUIDE_SECTIONS.map(({ id, number, title }) => ({ id, number, title, reference: number >= 9 }));
  return (
    <>
      <GuideReveal />
      <Hero />
      <Container className="lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden pt-14 lg:block">
          <GuideToc entries={entries} />
        </aside>
        <div className="min-w-0 pb-8">
          <GuideJumpMenu entries={entries} />

          <GuideSectionShell section={section("basics")}>
            <Prose>
              <p>
                Bittensor is a blockchain that pays people to do useful work, such as running AI models, collecting data or renting out GPUs. The work is split into{" "}
                <Term name="Subnet">subnets</Term>, each one a competition with its own task. On every subnet, <Term name="Miner">miners</Term> do the work and{" "}
                <Term name="Validator">validators</Term> check it and score it. The chain adds up the scores, weighted by how much{" "}
                <Term name="Stake">stake</Term> each validator has, and pays out on a fixed clock called the <Term name="Tempo">tempo</Term>. Underlined words open a
                short definition
              </p>
            </Prose>
            <NetworkDiagram />
            <div className="flex flex-col gap-4">
              <SubHeading>Six words every other chapter builds on</SubHeading>
              <ConceptGrid />
            </div>
            <div className="flex flex-col gap-4">
              <SubHeading>Hotkey and coldkey: two keys, two jobs</SubHeading>
              <Prose>
                <p>
                  Every participant has a pair of keys. The <Term name="Coldkey">coldkey</Term> is the owner and holds the money, so it should never sit on a server. The{" "}
                  <Term name="Hotkey">hotkey</Term> is the worker: it is what registers on a subnet and what Preflight diagnoses. Read more in the <ExternalLink href={`${DOCS}/concepts/network`}>network overview</ExternalLink>
                </p>
              </Prose>
              <KeyPair />
            </div>
          </GuideSectionShell>

          <GuideSectionShell section={section("miner")}>
            <Prose>
              <p>
                Every miner goes through the same stages: it pays a <Term name="Burn">burn</Term> to register, sits in{" "}
                <Term name="Immunity period">immunity</Term> while validators find its <Term name="Axon">axon</Term>, earns once they score it, and can be{" "}
                <Term name="Pruning">pruned</Term>. Hover or tap each stage, or use the arrow keys, to see what tends to go wrong there and which Preflight rule
                catches it. The numbers are real SN64 reads. See the official <ExternalLink href={`${DOCS}/guides/mining`}>mining guide</ExternalLink> and{" "}
                <ExternalLink href={`${DOCS}/guides/mining/burn`}>burn registration</ExternalLink> for the full detail
              </p>
            </Prose>
            <MinerLifecycle stages={MINER_STAGES} />
          </GuideSectionShell>

          <GuideSectionShell section={section("earns-zero")}>
            <Prose>
              <p>
                Check these in order, because each one hides the next: an unregistered miner cannot be reached, an unreachable miner cannot be scored, and so on. The
                findings below are real Doctor output, rendered with the same components as a live diagnosis
              </p>
            </Prose>
            <Snippet title="Run every check at once" code={"preflight doctor <hotkey> --netuid <netuid>"} />
            <ZeroCauses />
          </GuideSectionShell>

          <GuideSectionShell section={section("consensus")}>
            <Prose>
              <p>
                Validators do not simply vote a miner up. Each <Term name="Epoch">epoch</Term>, <Term name="Yuma Consensus" /> looks at every weight on a miner and keeps
                only as much of it as validators holding at least <Term name="Kappa">kappa</Term> of the stake agree on. Anything above that is clipped. If too little stake weights a miner at all,
                its consensus weight is zero and so is its incentive, even though some validators scored it
              </p>
              <p>
                Try it below with the five largest validators on SN64. Switch validators on and off, move kappa, and watch whether the miner&apos;s weight survives. This
                is the exact check behind <Code>PF110</Code>
              </p>
            </Prose>
            <KappaWidget />
            <Prose>
              <p>
                The real epoch is finer grained: it clips each weight to the highest value that kappa of stake supports, so validators who agree a miner is good but
                disagree on how good still lose some weight. That partial loss shows up as low <Term name="Trust">trust</Term>, which is what <Code>PF111</Code> watches. The full
                model is in <ExternalLink href={`${DOCS}/internals/consensus`}>Yuma Consensus</ExternalLink>
              </p>
            </Prose>
          </GuideSectionShell>

          <GuideSectionShell section={section("validator")}>
            <Prose>
              <p>
                A validator earns <Term name="Dividends">dividends</Term> for scoring miners well. To do that it needs stake, a{" "}
                <Term name="Validator permit">permit</Term> and weights that reach the chain on time, inside the <Term name="Activity cutoff">activity cutoff</Term>. Most validator
                problems are one of the checks below failing, and the chain error names which one. See the{" "}
                <ExternalLink href={`${DOCS}/guides/validating`}>validating guide</ExternalLink> and <ExternalLink href={`${DOCS}/guides/timelock`}>timelock</ExternalLink>{" "}
                for <Term name="Commit reveal">commit reveal</Term>
              </p>
            </Prose>
            <ValidatorBody />
          </GuideSectionShell>

          <GuideSectionShell section={section("failed-tx")}>
            <Prose>
              <p>
                This is a real validator <Term name="Extrinsic">extrinsic</Term> on finney that failed. Every failure names the{" "}
                <Term name="Pallet">pallet</Term> and the error that stopped it. Here is how to read one, top to bottom, the same way the transaction debugger does
              </p>
            </Prose>
            <TxWalkthrough />
          </GuideSectionShell>

          <GuideSectionShell section={section("simulate")}>
            <Prose>
              <p>
                A failed registration still costs its fee, and the burn can move between your quote and your retry. The simulator answers &ldquo;would this work right
                now&rdquo; without sending anything, by running the chain&apos;s own <Term name="Runtime">runtime</Term> on a <Term name="Fork">fork</Term> or
                predicting from the same rules. It always says which one it used
              </p>
            </Prose>
            <SimulatorBody />
          </GuideSectionShell>

          <GuideSectionShell section={section("launch")}>
            <Prose>
              <p>
                Launching a subnet means paying the <Term name="Lock cost">lock cost</Term>, waiting for the network <Term name="Rate limit">rate limit</Term>, possibly
                replacing another subnet, and calling <Term name="start_call">start_call</Term> before anyone earns. These are the real numbers from finney at block 9,377,485
              </p>
            </Prose>
            <LaunchBody />
          </GuideSectionShell>

          <Outro />

          <GuideSectionShell section={section("rules")}>
            <Prose>
              <p>
                Every finding the Doctor returns comes from one of these rules. Each reads a single pinned block, cites the storage item it read, and ships with tests
                for when it fires and when it does not. Link to any row with its id, like <Code>/guide#pf110</Code>
              </p>
            </Prose>
            <RuleReference />
          </GuideSectionShell>

          <GuideSectionShell section={section("surfaces")}>
            <Surfaces />
          </GuideSectionShell>

          <GuideSectionShell section={section("glossary")}>
            <Glossary />
          </GuideSectionShell>
        </div>
      </Container>
    </>
  );
}
