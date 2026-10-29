import { FileClock } from "lucide-react";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/container";
import { StateView } from "@/components/ui/state";
import { loadChangelog } from "@/lib/changelog";
import type { ChangelogEntry } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every Preflight commit as it shipped, straight from git log, newest first",
  alternates: { canonical: "/changelog" },
};

function byDay(entries: ChangelogEntry[]): [string, ChangelogEntry[]][] {
  const days = new Map<string, ChangelogEntry[]>();
  for (const entry of entries) {
    const day = entry.date.slice(0, 10);
    days.set(day, [...(days.get(day) ?? []), entry]);
  }
  return [...days.entries()];
}

export default function ChangelogPage() {
  const entries = loadChangelog();
  return (
    <Container className="max-w-4xl">
      <PageHeader eyebrow="Changelog" title="Every commit, as it shipped" accent="shipped" description="Straight from git log, newest first" />
      {entries.length === 0 ? (
        <StateView icon={FileClock} title="No entries yet">
          The changelog is generated from git log at build time
        </StateView>
      ) : (
        <ol className="flex flex-col gap-10">
          {byDay(entries).map(([day, items]) => (
            <li key={day} className="grid gap-4 md:grid-cols-[9rem_1fr]">
              <h2 className="font-mono text-[13px] text-faint md:pt-3">{day}</h2>
              <ul className="panel divide-y divide-line overflow-hidden">
                {items.map((item) => (
                  <li key={item.sha} className="flex items-baseline gap-4 px-4 py-3 sm:px-5">
                    <code className="shrink-0 font-mono text-xs text-accent-ink">{item.sha.slice(0, 7)}</code>
                    <span className="min-w-0 text-sm leading-6 text-foreground">{item.subject}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </Container>
  );
}
