import { ArrowUpRight, Link2, Terminal } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import type { GuideSection } from "@/lib/guide";
import { cn } from "@/lib/utils";

/** One chapter: anchor, number, title, the one line takeaway, then the body */
export function GuideSectionShell({ section, children }: { section: GuideSection; children: ReactNode }) {
  const titleId = `${section.id}-title`;
  return (
    <section
      id={section.id}
      aria-labelledby={titleId}
      tabIndex={-1}
      data-guide-section
      className="scroll-mt-32 border-t border-line pt-14 pb-16 outline-none first-of-type:border-t-0 sm:pt-16 sm:pb-20 lg:scroll-mt-20"
    >
      <header className="max-w-3xl">
        <p className="font-mono text-[13px] font-medium text-accent-ink tnum">
          <span className="sr-only">Chapter </span>
          {String(section.number).padStart(2, "0")}
        </p>
        <h2 id={titleId} className="group mt-2 text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.08] font-light tracking-[-0.04em] text-balance">
          {section.title}
          <a
            href={`#${section.id}`}
            className="ml-2.5 inline-grid size-7 translate-y-[-3px] place-items-center rounded-md align-middle text-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-2 hover:text-foreground focus-visible:opacity-100"
          >
            <Link2 className="size-4" aria-hidden />
            <span className="sr-only">Link to {section.title}</span>
          </a>
        </h2>
        <p className="mt-4 max-w-[60ch] text-[19px] leading-[1.55] tracking-[-0.012em] text-pretty text-foreground">{section.takeaway}</p>
      </header>
      <div className="mt-10 flex flex-col gap-12">{children}</div>
    </section>
  );
}

/** Body copy at reading width */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex max-w-[68ch] flex-col gap-4 text-[16px] leading-[27px] text-pretty text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground", className)}>
      {children}
    </div>
  );
}

export function SubHeading({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="text-subtitle font-semibold text-foreground">
      {children}
    </h3>
  );
}

/** Rule chips preview the rule in a popover, so they live with the other client popovers */
export { RuleChip } from "./term";

/** Inline code inside prose. Short tokens never split; long identifiers may, so phones never scroll sideways */
export function Code({ children }: { children: string }) {
  return (
    <code
      className={cn(
        "rounded-[5px] bg-surface-2 px-1.5 py-px font-mono text-[0.86em] text-foreground shadow-[0_0_0_1px_var(--line)]",
        children.length > 20 ? "break-all" : "whitespace-nowrap",
      )}
    >
      {children}
    </code>
  );
}

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn("inline-flex items-center gap-0.5 rounded font-medium text-foreground underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-foreground", className)}
    >
      {children}
      <ArrowUpRight className="size-3.5 shrink-0 text-faint" aria-hidden />
    </a>
  );
}

export function InternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const local = href.startsWith("#");
  const style = cn("rounded font-medium text-foreground underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-foreground", className);
  return local ? (
    <a href={href} className={style}>
      {children}
    </a>
  ) : (
    <Link href={href} className={style}>
      {children}
    </Link>
  );
}

/**
 * A copyable snippet in the same terminal frame as FixBlock. `prompt` marks lines that are
 * commands; output and file contents are shown as they are
 */
export function Snippet({
  title,
  code,
  prompt = true,
  className,
}: {
  title: string;
  code: string;
  prompt?: boolean;
  className?: string;
}) {
  const lines = code.split("\n");
  const copyable = prompt ? lines.filter((l) => l.trim() && !l.startsWith("#")).join("\n") : code;
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--line-strong)]", className)}>
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2">
        <Terminal className="size-3.5 text-faint" aria-hidden />
        <span className="eyebrow truncate text-accent-ink">{title}</span>
        <CopyButton value={copyable} label={`Copy ${title.toLowerCase()}`} className="ml-auto -mr-1.5" size="xs" />
      </div>
      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[13px] leading-6 text-foreground">
        <code className="block min-w-max">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {prompt && line.startsWith("#") ? (
                <span className="text-faint">{line}</span>
              ) : (
                <>
                  {prompt && line.trim() && (
                    <span aria-hidden className="text-faint select-none">
                      ${" "}
                    </span>
                  )}
                  {line || " "}
                </>
              )}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/** Where a figure's data came from, always under the figure */
export function SourceNote({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-5 text-faint">{children}</p>;
}
