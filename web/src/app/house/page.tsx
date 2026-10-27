import { Users } from "lucide-react";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/container";
import { StateView } from "@/components/ui/state";
import { formatInt } from "@/lib/format";
import { getApi } from "@/lib/server-api";

export const metadata: Metadata = { title: "Builders House" };

function formatSince(since: string): string {
  const date = new Date(since);
  return Number.isNaN(date.getTime()) ? since : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function HousePage() {
  const result = await (await getApi()).house();
  const stats = result.ok ? result.data : null;
  const empty = !stats || stats.diagnoses + stats.errors + stats.builders === 0;

  return (
    <Container className="max-w-4xl">
      <PageHeader
        eyebrow="Builders House"
        title="Builders helped at the House"
        description="Counters only. No hotkeys are stored unless a builder ticks share"
      />
      {empty ? (
        <StateView icon={Users} title="No counts yet">
          {result.ok ? "The first diagnosis run at the House shows up here" : result.error.message}
        </StateView>
      ) : (
        <>
          <dl className="grid gap-px overflow-hidden rounded-2xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-3">
            {[
              { label: "Diagnoses run", value: stats.diagnoses },
              { label: "Errors explained", value: stats.errors },
              { label: "Builders helped", value: stats.builders },
            ].map((item) => (
              <div key={item.label} className="bg-surface px-6 py-8">
                <dt className="text-[13px] text-muted-foreground">{item.label}</dt>
                <dd className="mt-3 font-mono text-5xl font-semibold tracking-[-0.04em] text-foreground">{formatInt(item.value)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-faint">Since {formatSince(stats.since)}</p>
        </>
      )}
    </Container>
  );
}
