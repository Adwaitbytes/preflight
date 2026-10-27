"use client";

import { Bell, Bot, GitBranch, Globe, Server, SquareTerminal, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Tabs } from "radix-ui";
import type { ReactNode } from "react";
import { Kbd } from "@/components/ui/kbd";
import { JsonView } from "@/components/ui/json-view";
import { API_BASE, CLI_INSTALL, MCP_INSTALL } from "@/lib/install";
import { DOCTOR_OUTPUT } from "./content";
import { Code, Prose, Snippet } from "./primitives";

const HOTKEY = "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq";

const MCP_TOOLS = ["diagnose_neuron", "explain_extrinsic", "explain_error", "simulate", "subnet_health", "launch_plan", "find_subnet"];

const ACTION_YAML = `- uses: Adwaitbytes/preflight@main
  with:
    fail-on: high`;

interface Surface {
  id: string;
  label: string;
  icon: LucideIcon;
  lead: ReactNode;
  body: ReactNode;
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <Prose>
      <p>{children}</p>
    </Prose>
  );
}

function Output({ lines, caption }: { lines: string[]; caption: string }) {
  return (
    <figure className="min-w-0 overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--line-strong)]">
      <figcaption className="eyebrow border-b border-line px-3.5 py-2">{caption}</figcaption>
      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[12px] leading-5 text-muted-foreground">
        <code className="block min-w-max">
          {lines.map((line, i) => (
            <span key={i} className={i === 0 ? "block font-semibold text-critical" : i === 3 ? "block text-foreground" : "block"}>
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

// An abridged copy of the recorded Doctor response for UID 0 on SN64 (doctor_broken_miner.json)
const RECORDED_RESPONSE = JSON.stringify({
  hotkey: HOTKEY,
  verdict: "broken",
  headline: "UID 0 on SN64 earns nothing because no validator has scored it",
  chain: { network: "finney", block: 9376730, runtime_spec: 486 },
  diagnoses: [
    {
      netuid: 64,
      role: "miner",
      findings: [{ id: "PF108", severity: "critical", title: "No validator has scored this UID" }],
    },
  ],
});

const SURFACES: Surface[] = [
  {
    id: "cli",
    label: "CLI",
    icon: SquareTerminal,
    lead: (
      <>
        Install once with uv, then ask from any terminal. Add <Code>--json</Code> for machine output and <Code>--fail-on high</Code> to fail a script when
        something is wrong
      </>
    ),
    body: (
      <div className="flex flex-col gap-3">
        <Snippet
          title="Install and run"
          code={[CLI_INSTALL, `preflight doctor ${HOTKEY} --netuid 64`, "preflight tx 9376733-28", "preflight plan"].join("\n")}
        />
        <Output lines={DOCTOR_OUTPUT} caption="Real output, docs/demo-output/doctor-mainnet.txt" />
      </div>
    ),
  },
  {
    id: "web",
    label: "Web",
    icon: Globe,
    lead: (
      <>
        Paste a hotkey, a transaction, an error or a netuid into the box on the home page and Preflight routes it. Press <Kbd>/</Kbd> to focus the box and{" "}
        <Kbd>⌘K</Kbd> for the command menu from anywhere
      </>
    ),
    body: (
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          { href: `/doctor/finney/${HOTKEY}`, label: "A miner earning zero", note: "Doctor, SN64 UID 0" },
          { href: "/tx/finney/9376733-28", label: "A failed transaction", note: "Transaction debugger" },
          { href: "/explain?text=SubtensorModule.TooManyRegistrationsThisBlock", label: "An error message", note: "Error explainer" },
          { href: "/subnets", label: "Every subnet, with a health score", note: "Subnet directory" },
        ].map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="group flex flex-col rounded-xl bg-surface px-4 py-3 shadow-[0_0_0_1px_var(--line)] transition-colors hover:bg-surface-2">
              <span className="text-[14px] font-medium text-foreground">{item.label}</span>
              <span className="mt-0.5 text-xs text-faint">{item.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "api",
    label: "HTTP API",
    icon: Server,
    lead: "Every module is a JSON endpoint, and every answer carries the block, block hash and runtime it was read at. OpenAPI lives at /v1/docs",
    body: (
      <div className="flex flex-col gap-3">
        <Snippet title="Diagnose over HTTP" code={`curl -s "${API_BASE}/v1/doctor/finney/${HOTKEY}?netuid=64"`} />
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-xs text-faint">Recorded response at block 9,376,730, abridged</p>
          <JsonView body={RECORDED_RESPONSE} status={200} elapsedMs={null} />
        </div>
      </div>
    ),
  },
  {
    id: "mcp",
    label: "Claude (MCP)",
    icon: Bot,
    lead: "Add Preflight to your own Claude and ask in plain words. The tools return the same JSON as the API, so the answer quotes real evidence and exact commands",
    body: (
      <div className="flex flex-col gap-3">
        <Snippet title="Add the MCP server" code={MCP_INSTALL} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-surface px-4 py-3.5 shadow-[0_0_0_1px_var(--line)]">
            <p className="eyebrow">Then ask</p>
            <p className="mt-2 text-[14px] leading-6 text-foreground">Why does 5EKtvz...Qmhq earn nothing on SN64, and what do I run to fix it?</p>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3.5 shadow-[0_0_0_1px_var(--line)]">
            <p className="eyebrow">Seven tools</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {MCP_TOOLS.map((tool) => (
                <li key={tool} className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[12px] text-foreground shadow-[0_0_0_1px_var(--line)]">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "action",
    label: "GitHub Action",
    icon: GitBranch,
    lead: "Boots a localnet subnet in CI, diagnoses your neurons and fails the job on findings at or above a severity",
    body: (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Snippet title="In your workflow" code={ACTION_YAML} prompt={false} />
        <ul className="flex flex-col gap-2 rounded-xl bg-surface px-4 py-3.5 text-[13.5px] leading-5 text-muted-foreground shadow-[0_0_0_1px_var(--line)]">
          {[
            ["fail-on", "critical, high, medium or info"],
            ["network", "local by default, or test, finney or a ws:// endpoint"],
            ["hotkeys", "comma separated; empty on localnet means every neuron it created"],
            ["netuid", "the subnet to diagnose"],
          ].map(([name, text]) => (
            <li key={name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <span className="w-20 shrink-0 font-mono text-[12.5px] text-foreground">{name}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: Bell,
    lead: "Watch a hotkey and get a Telegram message when it is deregistered, stops being scored, loses its permit or its incentive halves. One problem sends one alert until it changes",
    body: (
      <div className="flex flex-col gap-3">
        <Snippet title="Watch a hotkey" code={`preflight watch add ${HOTKEY} --netuid 64`} />
        <ol className="flex flex-col gap-2.5 rounded-xl bg-surface px-4 py-3.5 text-[13.5px] leading-5 text-muted-foreground shadow-[0_0_0_1px_var(--line)]">
          {["The command prints a link code", "Send /start with that code to the Preflight Alerts bot in Telegram", "Alerts arrive in that chat; preflight watch list shows what is watched"].map(
            (step, i) => (
              <li key={step} className="flex gap-3">
                <span className="font-mono text-[12px] text-accent-ink">{i + 1}</span>
                {step}
              </li>
            ),
          )}
        </ol>
      </div>
    ),
  },
];

export function Surfaces() {
  return (
    <Tabs.Root defaultValue="cli" className="flex flex-col gap-6" data-reveal>
      <Tabs.List aria-label="Ways to use Preflight" className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 [mask-image:linear-gradient(to_right,black_82%,transparent)] [scrollbar-width:none] sm:mx-0 sm:px-0 sm:[mask-image:none]">
        {SURFACES.map((s) => (
          <Tabs.Trigger
            key={s.id}
            value={s.id}
            className="relative -mb-px inline-flex shrink-0 cursor-pointer items-center gap-2 border-b-2 border-transparent px-3 pt-2 pb-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground"
          >
            <s.icon className="size-3.5" aria-hidden />
            {s.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {SURFACES.map((s) => (
        <Tabs.Content
          key={s.id}
          value={s.id}
          className="flex flex-col gap-5 rounded-xl focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-ring data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-300"
        >
          <Lead>{s.lead}</Lead>
          {s.body}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
