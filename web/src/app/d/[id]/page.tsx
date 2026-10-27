import { ArrowUpRight, Link2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorView } from "@/components/doctor/doctor-view";
import { SimResultView } from "@/components/sim/sim-result";
import { TxView } from "@/components/tx/tx-view";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ApiErrorState } from "@/components/ui/state";
import { formatInt } from "@/lib/format";
import { parseNetwork } from "@/lib/networks";
import type { SharedReport } from "@/lib/schemas";
import { getReport } from "@/lib/server-api";
import { summarizeShared } from "@/lib/shared-summary";

const ID = /^[A-Za-z0-9]{4,32}$/;

function liveHref(shared: SharedReport): string {
  const network = parseNetwork(shared.network);
  switch (shared.kind) {
    case "doctor":
      return `/doctor/${network}/${shared.payload.hotkey}`;
    case "tx":
      return `/tx/${network}/${shared.payload.ref}`;
    case "sim":
      return "/sim";
  }
}

function formatShared(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" });
}

export async function generateMetadata({ params }: PageProps<"/d/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!ID.test(id)) return { title: "Shared report" };
  const result = await getReport(id);
  if (!result.ok) return { title: "Shared report" };
  const summary = summarizeShared(result.data);
  return {
    title: summary.title,
    description: summary.description,
    openGraph: { title: summary.title, description: summary.description, type: "article" },
    twitter: { card: "summary_large_image", title: summary.title, description: summary.description },
  };
}

export default async function SharedReportPage({ params }: PageProps<"/d/[id]">) {
  const { id } = await params;
  if (!ID.test(id)) notFound();
  const result = await getReport(id);
  if (!result.ok) {
    return (
      <Container className="py-14">
        <ApiErrorState
          error={result.error}
          action={
            <Button asChild variant="secondary">
              <Link href="/">Back to Preflight</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const shared = result.data;
  const network = parseNetwork(shared.network);
  return (
    <Container>
      <div className="mt-8 flex flex-col gap-3 rounded-xl bg-surface-2 px-4 py-3 shadow-[0_0_0_1px_var(--line)] sm:flex-row sm:items-center sm:justify-between">
        <p className="flex min-w-0 items-start gap-2.5 text-[13px] leading-5 text-muted-foreground">
          <Link2 className="mt-0.5 size-3.5 shrink-0 text-faint" aria-hidden />
          <span>
            Shared report, read at block <span className="font-mono text-foreground">{formatInt(shared.block)}</span>, shared {formatShared(shared.created_at)}.
            Chain state has moved since
          </span>
        </p>
        <Button asChild variant="accent" size="sm" className="self-start sm:self-auto">
          <Link href={liveHref(shared)}>
            Run it live
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
      </div>
      {shared.kind === "doctor" && <DoctorView report={shared.payload} network={network} shared />}
      {shared.kind === "tx" && <TxView report={shared.payload} network={network} shared />}
      {shared.kind === "sim" && (
        <div className="pt-10 sm:pt-14">
          <p className="eyebrow">Simulation · {shared.payload.action}</p>
          <div className="mt-6">
            <SimResultView result={shared.payload} />
          </div>
        </div>
      )}
    </Container>
  );
}
