import Link from "next/link";
import { formatAmount } from "@/lib/format";
import type { SubnetCard as SubnetCardData } from "@/lib/types";
import { capabilityLabel, hasPublicApi } from "./capabilities";
import { HealthRing } from "./health-ring";

export function subnetName(card: SubnetCardData): string {
  return card.catalog?.name ?? card.live?.name ?? `Subnet ${card.netuid}`;
}

export function SubnetCard({ card, network }: { card: SubnetCardData; network: string }) {
  const live = card.live;
  const name = subnetName(card);
  return (
    <Link
      href={`/subnets/${card.netuid}${network !== "finney" ? `?network=${network}` : ""}`}
      className="group panel flex min-w-0 flex-col gap-4 p-4 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:shadow-(--shadow-float)"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-faint">SN{card.netuid}</p>
          <h3 className="mt-1 truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">{name}</h3>
        </div>
        <HealthRing health={card.health} />
      </div>
      <p className="line-clamp-2 min-h-10 text-[13px] leading-5 text-muted-foreground">
        {card.catalog?.summary ?? "Not in the curated catalog yet. Live numbers only"}
      </p>
      <div className="flex min-h-6 flex-wrap gap-1.5 overflow-hidden">
        {card.catalog?.capabilities.slice(0, hasPublicApi(card.catalog.api) ? 2 : 3).map((cap) => (
          <span key={cap} className="rounded-md bg-surface-2 px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground shadow-[0_0_0_1px_var(--line)]">
            {capabilityLabel(cap)}
          </span>
        ))}
        {hasPublicApi(card.catalog?.api) && (
          <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11.5px] font-medium text-accent-ink">API</span>
        )}
      </div>
      <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
        <div className="min-w-0">
          <dt className="text-faint">Miners</dt>
          <dd className="mt-0.5 font-mono text-foreground">{live ? live.miners : "n/a"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-faint">Validators</dt>
          <dd className="mt-0.5 font-mono text-foreground">{live ? live.validators : "n/a"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-faint">Register</dt>
          <dd className="mt-0.5 truncate font-mono text-foreground">{live ? `${formatAmount(live.registration_cost_tao)} τ` : "n/a"}</dd>
        </div>
      </dl>
    </Link>
  );
}
