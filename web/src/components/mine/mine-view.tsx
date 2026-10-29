import { ArrowRight, CheckCircle2, FlaskConical } from "lucide-react";
import Link from "next/link";
import { FindingList } from "@/components/doctor/finding-list";
import { ChainMeta } from "@/components/shared/chain-meta";
import { RefreshButton } from "@/components/shared/refresh-button";
import { Badge, type Tone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInt, formatShare, pluralize } from "@/lib/format";
import { burnTrend, formatHours, formatPayback, formatPerDay, formatRate, relativeWidths, splitHeadline, trendLabel } from "@/lib/insights-format";
import type { HostedNetwork } from "@/lib/insights-api";
import { NETWORK_LABEL } from "@/lib/networks";
import { constantValue } from "@/lib/series";
import { normalizeTaoText } from "@/lib/tao";
import type { MinerEconomics } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BurnSparkline, EarningGrid } from "./charts";

const VERDICT: Record<MinerEconomics["verdict"], { label: string; tone: Tone }> = {
  promising: { label: "Promising", tone: "healthy" },
  competitive: { label: "Competitive", tone: "medium" },
  hard: { label: "Hard", tone: "high" },
  closed: { label: "Closed", tone: "critical" },
};

function withNetwork(path: string, network: HostedNetwork, query: URLSearchParams = new URLSearchParams()): string {
  if (network !== "finney") query.set("network", network);
  return query.size ? `${path}?${query}` : path;
}

function Panel({ eyebrow, children, className }: { eyebrow: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("panel flex flex-col gap-4 p-5 sm:p-6", className)}>
      <h2 className="eyebrow">{eyebrow}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line pt-2.5 text-[13px]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-mono text-foreground">{value}</dd>
    </div>
  );
}

/** "7.7 days" renders the number large and the unit quiet; a phrase such as "Under a day" stays whole */
function splitUnit(text: string): { value: string; unit?: string } {
  const match = /^([<>]?[\d.,]+) (.+)$/.exec(text);
  return match?.[1] && match[2] ? { value: match[1], unit: match[2] } : { value: text };
}

function BigNumber({ value, unit }: { value: string; unit?: string }) {
  if (!/\d/.test(value)) {
    return <p className="text-[1.75rem] leading-10 font-semibold tracking-[-0.03em] text-foreground">{value}</p>;
  }
  return (
    <p className="text-[2.75rem] leading-none font-light tracking-[-0.05em] text-foreground tnum">
      {value}
      {unit && <span className="ml-2 text-lg font-medium tracking-normal text-faint">{unit}</span>}
    </p>
  );
}

interface LadderRow {
  label: string;
  alpha: number;
  tao: number;
  bar?: boolean;
}

/** Per miner earnings bands on one linear scale, with the seat the runtime would prune next placed among them */
function EarningsLadder({ economics }: { economics: MinerEconomics }) {
  const earning = economics.earning_miners > 0;
  const rows: LadderRow[] = economics.bands.map((b) => ({ label: b.label, alpha: b.alpha_per_day, tao: b.tao_per_day }));
  const bar = economics.prune_bar_tao_per_day;
  if (earning && bar != null && bar > 0) {
    rows.push({ label: "Weakest seat out of immunity", alpha: economics.prune_bar_alpha_per_day ?? 0, tao: bar, bar: true });
    rows.sort((a, b) => a.tao - b.tao);
  }
  const widths = relativeWidths(rows.map((r) => r.tao));

  return (
    <section aria-labelledby="ladder" className="panel p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="ladder" className="text-sm font-semibold">
          What earning miners make today
        </h2>
        <p className="text-xs text-faint">Per miner, at today&apos;s alpha price of {formatPerDay(economics.alpha_price_tao)} TAO</p>
      </div>
      {earning ? (
        <>
          <div aria-hidden className="mt-6 hidden grid-cols-[12rem_minmax(0,1fr)_7rem_7rem] gap-x-5 text-right text-xs text-faint sm:grid">
            <span />
            <span />
            <span>TAO a day</span>
            <span>Alpha a day</span>
          </div>
          <ol className="mt-4 flex flex-col gap-5 sm:mt-3 sm:gap-4">
            {rows.map((row, i) => {
              const pct = (widths[i] ?? 0) * 100;
              return (
                <li
                  key={row.label}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 sm:grid-cols-[12rem_minmax(0,1fr)_7rem_7rem] sm:items-center sm:gap-x-5"
                >
                  <span className={cn("min-w-0 text-[13px]", row.bar ? "font-medium text-critical" : "text-foreground")}>{row.label}</span>
                  <span className="col-span-2 row-start-2 h-2 overflow-hidden rounded-full bg-surface-3 sm:col-span-1 sm:row-start-auto">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        row.bar
                          ? "bg-[repeating-linear-gradient(-45deg,var(--critical)_0_3px,transparent_3px_6px)] shadow-[inset_0_0_0_1px_var(--critical)]"
                          : "bg-accent",
                      )}
                      style={{ width: row.tao > 0 ? `max(4px, ${pct.toFixed(2)}%)` : "0" }}
                    />
                  </span>
                  <span className="text-right font-mono text-[13px] text-foreground tnum">
                    {formatPerDay(row.tao)}
                    <span className="ml-1 font-sans text-xs text-faint sm:sr-only">TAO</span>
                    <span className="sr-only"> a day</span>
                    <span className="block text-xs text-faint sm:hidden">{formatPerDay(row.alpha)} alpha</span>
                  </span>
                  <span className="hidden text-right font-mono text-[13px] text-muted-foreground tnum sm:block">
                    {formatPerDay(row.alpha)}
                    <span className="sr-only"> alpha a day</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-6 border-t border-line pt-3 text-xs leading-5 text-faint">
            {pluralize(economics.earning_miners, "miner")} with emission today, ranked. Bars share one linear scale, so the gap between them is the real
            gap
          </p>
        </>
      ) : (
        <p className="mt-4 text-[15px] leading-7 text-muted-foreground">No miner on SN{economics.netuid} earns today, so there is no band to show</p>
      )}
    </section>
  );
}

interface SeatStep {
  title: string;
  value: string;
  body: string;
}

function seatSteps(e: MinerEconomics): SeatStep[] {
  const free = e.seats_max - e.seats_used;
  const immunity: SeatStep = {
    title: "Immunity",
    value: formatHours(e.immunity_hours),
    body: `For ${formatInt(e.immunity_blocks)} blocks after you register the runtime will not prune you. Use them to get scored`,
  };

  let bar: SeatStep;
  if (free > 0) {
    bar = { title: "The bar", value: "None yet", body: `${pluralize(free, "seat is", "seats are")} free, so nobody is pruned until the subnet fills` };
  } else if (e.prune_bar_tao_per_day == null || e.prune_bar_alpha_per_day == null) {
    bar = { title: "The bar", value: "None yet", body: "Every seat is still in immunity, so nobody can be pruned yet" };
  } else if (e.prune_bar_alpha_per_day > 0) {
    bar = {
      title: "The bar",
      value: `${formatPerDay(e.prune_bar_tao_per_day)} TAO a day`,
      body: `After immunity, out-earn the weakest seat, now ${formatPerDay(e.prune_bar_alpha_per_day)} alpha a day, or the next registration replaces you`,
    };
  } else {
    bar = {
      title: "The bar",
      value: "Any score",
      body: "The weakest seats out of immunity earn nothing today and are pruned oldest first. A miner still unscored when immunity ends joins them",
    };
  }

  const turnover: SeatStep =
    e.seat_turnover_hours != null
      ? {
          title: "Turnover",
          value: `Every ${formatHours(e.seat_turnover_hours)}`,
          body: `At the ${formatRate(e.registrations_per_day)} registrations a day the burn steers toward, a full subnet prunes a seat about this often`,
        }
      : { title: "Turnover", value: "None", body: "The subnet has free seats, so registrations fill them instead of pruning anyone" };

  return [immunity, bar, turnover];
}

function KeepingYourSeat({ economics }: { economics: MinerEconomics }) {
  const full = economics.seats_used >= economics.seats_max;
  const used = economics.seats_max > 0 ? Math.min(1, economics.seats_used / economics.seats_max) : 0;
  const steps = seatSteps(economics);
  return (
    <section aria-labelledby="keeping" className="panel flex flex-col gap-6 p-5 sm:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="keeping" className="text-sm font-semibold">
            Keeping your seat
          </h2>
          <Badge tone={full ? "medium" : "healthy"}>{full ? "Full" : "Seats free"}</Badge>
        </div>
        <div className="flex items-baseline justify-between gap-3 text-[13px]">
          <span className="text-muted-foreground">Seats used</span>
          <span className="font-mono text-foreground tnum">
            {formatInt(economics.seats_used)} <span className="text-faint">of {formatInt(economics.seats_max)}</span>
          </span>
        </div>
        <div
          role="img"
          aria-label={`${economics.seats_used} of ${economics.seats_max} seats used`}
          className="h-1.5 overflow-hidden rounded-full bg-surface-3"
        >
          <div className={cn("h-full rounded-full", full ? "bg-medium" : "bg-healthy")} style={{ width: `${(used * 100).toFixed(2)}%` }} />
        </div>
      </div>
      <ol className="flex flex-col">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && <span aria-hidden className="absolute top-7 bottom-1 left-[11px] w-px bg-line-strong" />}
            <span
              aria-hidden
              className="relative grid size-6 shrink-0 place-items-center rounded-full bg-surface font-mono text-[11px] font-medium text-muted-foreground shadow-[0_0_0_1px_var(--line-strong)]"
            >
              {i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="font-medium text-foreground">{step.title}</span>
                <span className="font-mono text-[13px] text-accent-ink">{step.value}</span>
              </p>
              <p className="mt-1 text-[13px] leading-5 text-pretty text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function MineView({ economics, network }: { economics: MinerEconomics; network: HostedNetwork }) {
  const verdict = VERDICT[economics.verdict];
  const { lead, rest } = splitHeadline(normalizeTaoText(economics.headline));
  const subnetLabel = `SN${economics.netuid} ${economics.name}`;
  const subnetHref = withNetwork(`/subnets/${economics.netuid}`, network);
  const simHref = withNetwork("/sim", network, new URLSearchParams({ action: "burned_register", netuid: String(economics.netuid) }));
  const trend = burnTrend(economics.burn_history);
  const median = economics.bands.find((b) => b.label.startsWith("Median"));
  const share = economics.miners > 0 ? economics.earning_miners / economics.miners : 0;

  return (
    <div className="flex flex-col">
      <header className="rise-in flex flex-col gap-6 pt-10 pb-10 sm:pt-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="eyebrow">Mining · {NETWORK_LABEL[network]}</p>
          <span aria-hidden className="h-3 w-px bg-line-strong" />
          <Link href={subnetHref} className="rounded text-[13px] text-muted-foreground transition-colors hover:text-foreground">
            <span className="font-mono">SN{economics.netuid}</span> {economics.name}
          </Link>
        </div>
        <div className="flex flex-col gap-5">
          <div className="self-start">
            <Badge tone={verdict.tone} dot size="md">
              {verdict.label}
            </Badge>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="max-w-[26ch] text-[clamp(2rem,1.5rem+2.2vw,3.25rem)] leading-[1.06] font-light tracking-[-0.045em] text-balance">{lead}</h1>
            {rest && <p className="max-w-[64ch] text-[17px] leading-7 text-pretty text-muted-foreground">{rest}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ChainMeta chain={economics.chain} />
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={simHref}>
                <FlaskConical className="size-3.5" aria-hidden />
                Simulate registration
              </Link>
            </Button>
            <RefreshButton />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel eyebrow="Registration">
            <BigNumber value={formatPerDay(economics.registration_cost_tao)} unit="TAO" />
            <p className="text-[13px] leading-5 text-muted-foreground">Burned to take a seat at this block. The burn moves with demand</p>
            {trend && (
              <div className="flex flex-col gap-2">
                {constantValue(economics.burn_history.map(([, tao]) => tao)) === null && (
                  <BurnSparkline history={economics.burn_history} label={trendLabel(trend)} />
                )}
                <p className="text-xs text-faint">Burn {trendLabel(trend).toLowerCase()}</p>
              </div>
            )}
            <dl className="mt-auto flex flex-col gap-2.5">
              <Row label="Target registrations" value={`${formatRate(economics.registrations_per_day)} a day`} />
            </dl>
          </Panel>

          <Panel eyebrow="Earning today">
            <p className="flex flex-wrap items-baseline gap-x-2 font-mono leading-none">
              <span className="text-[2.75rem] font-light tracking-[-0.05em] text-foreground tnum">{formatInt(economics.earning_miners)}</span>
              <span className="text-lg font-medium text-faint">of {formatInt(economics.miners)}</span>
            </p>
            <p className="text-[13px] leading-5 text-muted-foreground">Miners with any emission at this block</p>
            <EarningGrid earning={economics.earning_miners} total={economics.miners} />
            <dl className="mt-auto flex flex-col gap-2.5">
              <Row label="Earning share" value={formatShare(share)} />
            </dl>
          </Panel>

          <Panel eyebrow="Payback">
            <BigNumber {...splitUnit(formatPayback(economics.payback_days))} />
            <p className="text-[13px] leading-5 text-muted-foreground">
              {economics.payback_days != null && median
                ? `The ${formatPerDay(economics.registration_cost_tao)} TAO registration over the median earner's day, if validators score you like them`
                : "No miner earns today, so nothing pays the registration back yet"}
            </p>
            <dl className="mt-auto flex flex-col gap-2.5">
              {median && economics.earning_miners > 0 && <Row label="Median earner" value={`${formatPerDay(median.tao_per_day)} TAO a day`} />}
              <Row label="Alpha price" value={`${formatPerDay(economics.alpha_price_tao)} TAO`} />
            </dl>
          </Panel>
        </div>

        <section aria-labelledby="signals" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="signals" className="text-sm font-semibold">
              Subnet signals
            </h2>
            <p className="text-xs text-faint">
              {economics.findings.length === 0 ? "No issues" : pluralize(economics.findings.length, "finding")} at block {formatInt(economics.chain.block)}
            </p>
          </div>
          {economics.findings.length > 0 ? (
            <FindingList findings={economics.findings} block={economics.chain.block} />
          ) : (
            <div className="panel flex items-center gap-3 px-5 py-4 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 shrink-0 text-healthy" aria-hidden />
              No subnet level rule fired on {subnetLabel}
            </div>
          )}
        </section>

        <EarningsLadder economics={economics} />

        <div className="grid gap-4 lg:grid-cols-2">
          <KeepingYourSeat economics={economics} />
          <section aria-labelledby="notes" className="panel flex flex-col gap-4 p-5 sm:p-6">
            <h2 id="notes" className="text-sm font-semibold">
              Read from chain
            </h2>
            <ul className="flex flex-col gap-3">
              {economics.notes.map((note) => (
                <li key={note} className="flex gap-3 text-[13px] leading-5 text-pretty text-muted-foreground">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-faint" />
                  <span className="min-w-0">{normalizeTaoText(note)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>


        <section aria-labelledby="next" className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <h2 id="next" className="text-[15px] font-semibold tracking-[-0.01em]">
              Try the registration before you burn
            </h2>
            <p className="mt-1 max-w-[62ch] text-sm leading-6 text-pretty text-muted-foreground">
              The simulator runs burned_register on SN{economics.netuid} against real chain state: the burn, the fee and anything that would fail
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={subnetHref}>Subnet details</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href={simHref}>
                Simulate registration
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
