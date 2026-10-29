import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

/** Sets one word of a title in the serif italic, the way the landing marks the word that matters */
export function withAccent(title: string, accent?: string): ReactNode {
  const at = accent ? title.indexOf(accent) : -1;
  if (!accent || at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <span className="font-serif font-normal tracking-[-0.01em] text-accent-ink italic">{accent}</span>
      {title.slice(at + accent.length)}
    </>
  );
}

export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  /** A word or phrase of `title` to set in the serif italic */
  accent?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6 pt-12 pb-10 sm:pt-20 sm:pb-12 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium tracking-[0.16em] text-accent-ink uppercase">
          <span aria-hidden className="h-px w-5 bg-current opacity-60" />
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-[22ch] text-[clamp(2.25rem,1.55rem+2.9vw,3.75rem)] leading-[1.03] font-light tracking-[-0.045em] text-balance">{withAccent(title, accent)}</h1>
        {description && <p className="mt-5 max-w-[60ch] text-[16.5px] leading-7 text-pretty text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
