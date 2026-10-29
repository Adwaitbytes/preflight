import { ArrowRight, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import Link from "next/link";
import { ChainMeta } from "@/components/shared/chain-meta";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/container";
import { MonoValue } from "@/components/ui/mono-value";
import { formatBlockIndex, formatInt } from "@/lib/format";
import { NETWORK_LABEL, taostatsExtrinsic, type NetworkId } from "@/lib/networks";
import type { BlockReport } from "@/lib/types";
import { cn } from "@/lib/utils";

/** One block's extrinsics. Reached when someone pastes a block hash where a transaction hash goes */
export function BlockView({ report, network, fromHash = false }: { report: BlockReport; network: NetworkId; fromHash?: boolean }) {
  const signed = report.extrinsics.filter((x) => x.signer).length;
  return (
    <div className="flex flex-col gap-8 pb-16">
      <PageHeader
        eyebrow={`Block · ${NETWORK_LABEL[network]}`}
        title={`Block ${formatInt(report.block)}`}
        accent={formatInt(report.block)}
        description={`${report.extrinsics.length} extrinsics, ${signed} signed by an account, ${report.failed === 0 ? "none failed" : `${report.failed} failed`}. Open any one in the Transaction Debugger.`}
      />
      {fromHash && (
        <p className="rounded-2xl bg-accent-soft px-5 py-4 text-[15px] leading-6 text-pretty text-foreground shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_24%,transparent)]">
          The hash you pasted names this block, not a transaction. Pages show a block hash next to the block they read; a transaction has its own hash, or a reference like{" "}
          <code className="font-mono text-accent-ink">{formatBlockIndex(report.block, 2)}</code>.
        </p>
      )}
      <ChainMeta chain={report.chain} />
      <ol className="panel divide-y divide-line overflow-hidden">
        {report.extrinsics.map((x) => {
          const ref = formatBlockIndex(report.block, x.index);
          const explorer = taostatsExtrinsic(network, report.block, x.index);
          return (
            <li key={x.index} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
              <span className="w-12 shrink-0 font-mono text-xs text-faint tnum">#{x.index}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm">
                  <span className="text-faint">{x.pallet}.</span>
                  <span className="text-foreground">{x.call}</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {x.signer ? <MonoValue value={x.signer} label="signer" head={6} tail={6} /> : <span>Inherent, no signer</span>}
                  {x.error && <span className="font-mono text-critical">{x.error}</span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={x.success ? "healthy" : "critical"} dot>
                  {x.success ? "Succeeded" : "Failed"}
                </Badge>
                <Link
                  href={`/tx/${network}/${ref}`}
                  className={cn(
                    "group inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors",
                    x.success ? "text-muted-foreground hover:bg-surface-2 hover:text-foreground" : "bg-critical-soft text-critical hover:brightness-110",
                  )}
                >
                  Debug
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
                {explorer && (
                  <a href={explorer} target="_blank" rel="noreferrer" aria-label={`Open ${ref} on Taostats`} className="grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-2 hover:text-foreground">
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {report.failed === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-healthy" aria-hidden /> Every extrinsic in this block went through.
        </p>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <XCircle className="size-4 text-critical" aria-hidden /> Open a failed one to see why it failed and the fix.
        </p>
      )}
    </div>
  );
}
