import Link from "next/link";
import { CopyButton } from "@/components/ui/copy-button";
import { MCP_INSTALL } from "@/lib/install";
import { LogoMark } from "./logo";
import { GUIDE, NAV_GROUPS, isExternal } from "./nav-items";

// The footer reads the same map as the header, plus the pages that only belong down here
const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  ...NAV_GROUPS.map((group) => ({ title: group.title, links: group.items.map(({ href, label }) => ({ href, label })) })),
  { title: "More", links: [{ href: GUIDE.href, label: GUIDE.label }, { href: "/changelog", label: "Changelog" }] },
];

const LINK = "rounded text-[14px] text-white/65 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/**
 * The site's closing band on every page: always dark, a way back into the tools, the Claude
 * install line, and the name set large across the bottom.
 */
export function SiteFooter() {
  return (
    <footer className="dark relative isolate overflow-hidden bg-[#040407] text-foreground print:hidden">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4c6bff]/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="min-w-0">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <LogoMark className="size-5" />
              <span className="text-[17px] font-medium tracking-[-0.02em]">Preflight</span>
            </Link>
            <p className="mt-4 mb-12 max-w-[34ch] text-[15px] leading-6 text-white/55">The debugger for Bittensor.</p>
            <p className="font-mono text-[11px] tracking-[0.16em] text-white/55 uppercase">Use it from your own Claude</p>
            <div className="mt-3 flex max-w-xl items-center gap-2 rounded-2xl bg-white/[0.05] py-1.5 pr-1.5 pl-4 shadow-[0_0_0_1px_rgb(255_255_255/0.1)]">
              <span aria-hidden className="font-mono text-[13px] text-white/35 select-none">
                $
              </span>
              <code tabIndex={0} aria-label="MCP install command" className="min-w-0 flex-1 overflow-x-auto py-1.5 font-mono text-[13px] whitespace-nowrap text-white/85 [mask-image:linear-gradient(to_right,black_88%,transparent)] [scrollbar-width:none]">
                {MCP_INSTALL}
              </code>
              <CopyButton value={MCP_INSTALL} label="Copy MCP install command" />
            </div>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {GROUPS.map((group) => (
              <div key={group.title}>
                <p className="font-mono text-[11px] tracking-[0.16em] text-white/55 uppercase">{group.title}</p>
                <ul className="mt-5 flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {isExternal(link.href) ? (
                        <a href={link.href} className={LINK}>
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className={LINK}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-white/10 py-6 text-[13px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2.5">
            <LogoMark className="size-4 text-white/70" />
            Read only. Never asks for keys, never signs.
          </p>
          <p className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4ade80] opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-[#4ade80]" />
            </span>
            Reading Bittensor mainnet · Built at the Builders House, October 2026
          </p>
        </div>
      </div>

      {/* The name across the bottom, lit from below like the seat field in the hero */}
      <div aria-hidden className="pointer-events-none relative -mb-[0.5vw] select-none">
        <p className="bg-[linear-gradient(180deg,rgb(255_255_255/0.14)_0%,rgb(157_176_255/0.32)_55%,rgb(76_107_255/0.08)_100%)] bg-clip-text text-center text-[22vw] leading-[0.86] font-semibold tracking-[-0.07em] text-transparent">
          Preflight
        </p>
        <div className="absolute inset-0 bg-[radial-gradient(rgb(124_147_255/0.35)_1px,transparent_1.4px)] [background-size:14px_14px] [mask-image:linear-gradient(180deg,transparent_20%,black_75%)] opacity-40" />
      </div>
    </footer>
  );
}
