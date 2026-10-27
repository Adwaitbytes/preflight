import { formatInt, formatMs } from "@/lib/format";
import type { ChainRef } from "@/lib/types";
import { MonoValue } from "@/components/ui/mono-value";

/** Where and when a result was read. Every result shows it, because chain state moves every 12 s */
export function ChainMeta({ chain, elapsedMs }: { chain: ChainRef; elapsedMs?: number }) {
  return (
    <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
      <div className="flex items-center gap-1.5">
        <dt>Block</dt>
        <dd className="font-mono text-muted-foreground">{formatInt(chain.block)}</dd>
      </div>
      <div className="hidden items-center gap-1.5 sm:flex">
        <dt>Hash</dt>
        <dd className="text-muted-foreground">
          <MonoValue value={chain.block_hash} label="block hash" head={8} tail={6} />
        </dd>
      </div>
      {chain.runtime_spec != null && (
        <div className="flex items-center gap-1.5">
          <dt>Runtime</dt>
          <dd className="font-mono text-muted-foreground">{chain.runtime_spec}</dd>
        </div>
      )}
      {elapsedMs != null && (
        <div className="flex items-center gap-1.5">
          <dt>Took</dt>
          <dd className="font-mono text-muted-foreground">{formatMs(elapsedMs)}</dd>
        </div>
      )}
    </dl>
  );
}
