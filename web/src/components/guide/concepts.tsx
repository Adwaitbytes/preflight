import { Boxes, Coins, Hash, KeyRound, Pickaxe, ScanSearch, Timer, Vault, type LucideIcon } from "lucide-react";

interface Concept {
  icon: LucideIcon;
  term: string;
  definition: string;
  example: string;
}

// Examples are finney reads from web/src/data/samples at blocks 9,376,730 and 9,376,731
const CONCEPTS: Concept[] = [
  {
    icon: Boxes,
    term: "Subnet",
    definition: "An independent competition with its own task, token and rules, numbered by its netuid",
    example: "SN64 Chutes, serverless AI inference",
  },
  {
    icon: Pickaxe,
    term: "Miner",
    definition: "A hotkey registered on a subnet that does the work the subnet asks for",
    example: "UID 207 on SN64 earns 23.34 alpha a tempo",
  },
  {
    icon: ScanSearch,
    term: "Validator",
    definition: "A hotkey with enough stake to hold a validator permit. It scores miners by setting weights",
    example: "UID 1 on SN64, 1,385,417 alpha of stake",
  },
  {
    icon: Coins,
    term: "TAO and alpha",
    definition: "TAO is the chain's token, 10⁹ rao each. Every subnet has its own alpha, traded against TAO, and rewards are paid in alpha",
    example: "A seat on SN64 costs 0.0005 TAO",
  },
  {
    icon: Hash,
    term: "UID",
    definition: "A numbered seat on one subnet. When every seat is taken, a new registration replaces the weakest neuron",
    example: "SN64 has 256 of 256 seats taken",
  },
  {
    icon: Timer,
    term: "Tempo",
    definition: "The subnet's clock. Once per tempo, consensus runs and everyone is paid. Blocks come every 12 seconds",
    example: "360 blocks, about 72 minutes",
  },
];

export function ConceptGrid() {
  return (
    <div>
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-2 lg:grid-cols-3">
        {CONCEPTS.map(({ icon: Icon, term, definition, example }) => (
          <div key={term} className="flex min-w-0 flex-col bg-surface p-5">
            <dt className="flex items-center gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-foreground shadow-[0_0_0_1px_var(--line)]">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{term}</span>
            </dt>
            <dd className="mt-3 flex-1 text-[13.5px] leading-[1.6] text-muted-foreground">{definition}</dd>
            <dd className="mt-4 border-t border-line pt-3 font-mono text-[12px] leading-5 text-foreground">
              <span className="sr-only">Example: </span>
              {example}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const COLDKEY = ["Owns the funds", "Transfers, stakes and pays to register", "Owns subnets", "Stays off your servers"];
const HOTKEY = ["Holds a UID on each subnet it joins", "Sets weights and serves the axon", "Lives on the mining or validating machine", "What Preflight diagnoses"];

function KeyCard({ icon: Icon, name, role, items, tone }: { icon: LucideIcon; name: string; role: string; items: string[]; tone: "cold" | "hot" }) {
  return (
    <div className="panel flex min-w-0 flex-1 flex-col p-5">
      <div className="flex items-center gap-3">
        <span
          className={
            tone === "cold"
              ? "grid size-9 place-items-center rounded-xl bg-surface-2 text-foreground shadow-[0_0_0_1px_var(--line-strong)]"
              : "grid size-9 place-items-center rounded-xl bg-accent-soft text-accent-ink shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_28%,transparent)]"
          }
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{name}</p>
          <p className="text-xs text-faint">{role}</p>
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-2 text-[13.5px] leading-5 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-faint" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Coldkey owns, hotkey operates (https://www.bittensor.com/docs/concepts/network) */
export function KeyPair() {
  return (
    <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
      <KeyCard icon={Vault} name="Coldkey" role="the owner, keep it offline" items={COLDKEY} tone="cold" />
      <div aria-hidden className="flex shrink-0 items-center justify-center gap-2 text-faint md:flex-col">
        <span className="h-5 w-px bg-line-strong md:h-px md:w-8" />
        <span className="font-mono text-[11px] tracking-[0.08em] uppercase">owns many</span>
        <span className="h-5 w-px bg-line-strong md:h-px md:w-8" />
      </div>
      <KeyCard icon={KeyRound} name="Hotkey" role="the worker, one per neuron" items={HOTKEY} tone="hot" />
    </div>
  );
}
