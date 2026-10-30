import {
  BookOpen,
  CloudSun,
  FlaskConical,
  GitBranch,
  LayoutGrid,
  type LucideIcon,
  MessageSquareText,
  Radio,
  Receipt,
  Rocket,
  Send,
  Stethoscope,
  Timer,
} from "lucide-react";
import Link from "next/link";

interface Tool {
  name: string;
  line: string;
  href: string;
  icon: LucideIcon;
}

const GROUPS: { job: string; accent: string; tools: Tool[] }[] = [
  {
    job: "Explains",
    accent: "what went wrong",
    tools: [
      { name: "Doctor", line: "Why a miner earns nothing", href: "/doctor/finney/5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq?netuid=64", icon: Stethoscope },
      { name: "Transaction debugger", line: "Why a transaction failed", href: "/tx/finney/9382178-8", icon: Receipt },
      { name: "Error explainer", line: "406 chain errors, explained", href: "/explain", icon: MessageSquareText },
      { name: "Guide", line: "How Bittensor pays", href: "/guide", icon: BookOpen },
    ],
  },
  {
    job: "Predicts",
    accent: "what happens next",
    tools: [
      { name: "Simulator", line: "Test it before you sign", href: "/sim", icon: FlaskConical },
      { name: "Epoch Lab", line: "Next epoch’s pay, early", href: "/epoch/finney/64", icon: Timer },
      { name: "Launch planner", line: "What a subnet costs today", href: "/plan", icon: Rocket },
      { name: "Subnet directory", line: "All 128 subnets, scored", href: "/subnets", icon: LayoutGrid },
    ],
  },
  {
    job: "Warns",
    accent: "before it costs you",
    tools: [
      { name: "Network weather", line: "What is failing right now", href: "/weather", icon: CloudSun },
      { name: "Live explorer", line: "Every block as it lands", href: "/live", icon: Radio },
      { name: "Telegram alerts", line: "Warned before a cut", href: "/bot", icon: Send },
      { name: "CI gate", line: "Stops bad weights shipping", href: "https://github.com/Adwaitbytes/preflight", icon: GitBranch },
    ],
  },
];

const CARD =
  "group flex min-w-0 items-center gap-3.5 rounded-2xl bg-[#f6f2ec] p-4 shadow-[0_0_0_1px_#ddd5c8] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-px hover:shadow-[0_0_0_1px_#c9bfae,0_12px_28px_-18px_rgb(23_25_30/0.45)] focus-visible:ring-2 focus-visible:ring-[#2f4fe0] focus-visible:outline-none motion-reduce:transition-none";

function Card({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#efeae2] text-[#2f4fe0] shadow-[0_0_0_1px_#ddd5c8]">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-medium text-[#17191e]">{tool.name}</span>
        <span className="block truncate text-[13px] text-[#5a5f69]">{tool.line}</span>
      </span>
    </>
  );
  return tool.href.startsWith("http") ? (
    <a href={tool.href} target="_blank" rel="noreferrer" className={CARD}>
      {body}
    </a>
  ) : (
    <Link href={tool.href} className={CARD}>
      {body}
    </Link>
  );
}

/** Every tool on one sheet, grouped by the job it does */
export function Toolkit() {
  return (
    <section aria-labelledby="toolkit-title" className="light bg-[#efeae2] text-[#17191e]">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
        <h2 id="toolkit-title" className="text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[1.02] font-light tracking-[-0.045em] text-balance">
          Twelve tools, <span className="font-serif font-normal tracking-[-0.01em] text-[#2f4fe0] italic">one</span> place
        </h2>
        <div className="mt-12 flex flex-col gap-10">
          {GROUPS.map((group) => (
            <div key={group.job}>
              <h3 className="flex items-center gap-4 text-[17px] font-medium">
                <span className="shrink-0">
                  {group.job} <span className="font-normal text-[#6b6f78]">{group.accent}</span>
                </span>
                <span aria-hidden className="h-px flex-1 bg-[#ddd5c8]" />
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {group.tools.map((tool) => (
                  <li key={tool.name} className="min-w-0">
                    <Card tool={tool} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
