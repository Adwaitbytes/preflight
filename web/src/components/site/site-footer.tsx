import Link from "next/link";
import { CopyButton } from "@/components/ui/copy-button";
import { MCP_INSTALL } from "@/lib/install";
import { LogoMark } from "./logo";

const LINKS = [
  { href: "/guide", label: "Guide" },
  { href: "/sim", label: "Simulator" },
  { href: "/subnets", label: "Subnet directory" },
  { href: "/plan", label: "Launch planner" },
  { href: "/explain", label: "Explain an error" },
  { href: "/changelog", label: "Changelog" },
  { href: "/house", label: "Builders House" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div className="min-w-0">
          <p className="eyebrow">Use it from your own Claude</p>
          <div className="mt-3 flex max-w-2xl items-center gap-2 rounded-xl bg-surface-2 py-1.5 pr-1.5 pl-3.5 shadow-[0_0_0_1px_var(--line)]">
            <span aria-hidden className="font-mono text-[13px] text-faint select-none">
              $
            </span>
            <code tabIndex={0} aria-label="MCP install command" className="min-w-0 flex-1 overflow-x-auto py-1 font-mono text-[13px] whitespace-nowrap text-foreground [mask-image:linear-gradient(to_right,black_88%,transparent)] [scrollbar-width:none]">
              {MCP_INSTALL}
            </code>
            <CopyButton value={MCP_INSTALL} label="Copy MCP install command" />
          </div>
          <p className="mt-3 max-w-[60ch] text-[13px] leading-5 text-faint">
            Seven tools: diagnose_neuron, explain_extrinsic, explain_error, simulate, subnet_health, launch_plan and find_subnet. Same JSON as the API
          </p>
        </div>
        <nav aria-label="Footer" className="grid content-start grid-cols-2 gap-x-10 gap-y-2 text-[13px] sm:grid-cols-3 lg:grid-cols-2">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 pb-10 text-xs text-faint sm:px-6 lg:px-8">
        <LogoMark className="size-4" />
        <span>Preflight reads public chain state only. It never asks for keys</span>
      </div>
    </footer>
  );
}
