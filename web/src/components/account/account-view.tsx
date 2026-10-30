import { ArrowRight, ExternalLink, KeyRound } from "lucide-react";
import Link from "next/link";
import { ChainMeta } from "@/components/shared/chain-meta";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { MonoValue } from "@/components/ui/mono-value";
import { formatInt } from "@/lib/format";
import { NETWORK_LABEL, type NetworkId } from "@/lib/networks";
import type { AccountReport } from "@/lib/types";

// Balances are exact: TAO and alpha both have 9 decimals, so nothing is rounded up or away
const EXACT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 });
const amount = (value: number) => EXACT.format(value);
const formatTao = (value: number) => `${amount(value)} TAO`;
const formatAlpha = (value: number) => `${amount(value)} alpha`;

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 bg-surface p-5">
      <dt className="font-mono text-[11px] tracking-[0.14em] text-faint uppercase">{label}</dt>
      <dd className={strong ? "text-[26px] leading-none font-light tracking-[-0.03em] tnum" : "text-[20px] leading-none tracking-[-0.02em] tnum"}>{value}</dd>
    </div>
  );
}

function SeatLinks({ network, hotkey, seats }: { network: NetworkId; hotkey: string; seats: AccountReport["seats"] }) {
  if (seats.length === 0) return <span className="text-sm text-faint">Not registered on any subnet</span>;
  return (
    <span className="flex flex-wrap gap-2">
      {seats.map((seat) => (
        <Link
          key={`${seat.netuid}-${seat.uid ?? "x"}`}
          href={`/doctor/${network}/${hotkey}?netuid=${seat.netuid}`}
          className="group inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface-2 px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-accent-soft hover:text-accent-ink"
        >
          SN{seat.netuid}
          {seat.uid != null && <span className="font-mono text-xs text-muted-foreground">UID {seat.uid}</span>}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      ))}
    </span>
  );
}

export function isEmptyAccount(report: AccountReport): boolean {
  return report.total_tao === 0 && report.stakes.length === 0 && report.owned_hotkeys.length === 0 && report.seats.length === 0;
}

/** Any address on any network: what it holds, where it is staked, and the keys it owns */
export function AccountView({
  report,
  network,
  note,
  elsewhere,
}: {
  report: AccountReport;
  network: NetworkId;
  /** doctor: arrived from a pasted address that is not a working miner; switched: moved here from the other network */
  note?: "doctor" | "switched";
  elsewhere?: { network: NetworkId; total: number };
}) {
  const { balance } = report;
  const empty = isEmptyAccount(report);
  const isHotkey = Boolean(report.hotkey_owner);

  return (
    <div className="flex flex-col gap-8 pt-12 pb-16 sm:pt-20">
      <header className="flex flex-col gap-5">
        <p className="flex flex-wrap items-center gap-2">
          <Badge tone={network === "finney" ? "accent" : "medium"} dot>
            {NETWORK_LABEL[network]}
          </Badge>
          {isHotkey && <Badge tone="info">Hotkey</Badge>}
        </p>
        <h1 className="flex min-w-0 items-center gap-2 font-mono text-[clamp(1rem,0.7rem+1.2vw,1.5rem)] break-all text-foreground">
          {report.address}
          <CopyButton value={report.address} label="Copy address" />
        </h1>
        <p className="flex items-baseline gap-3">
          <span className="text-[clamp(3rem,2rem+4vw,5rem)] leading-none font-light tracking-[-0.05em] tnum">{amount(report.total_tao)}</span>
          <span className="text-xl text-muted-foreground">TAO</span>
        </p>
      </header>

      {note && !elsewhere && (
        <p className="rounded-2xl bg-accent-soft px-5 py-4 text-[15px] text-foreground shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_24%,transparent)]">
          {note === "switched"
            ? `Found on ${NETWORK_LABEL[network]}. It holds nothing on ${NETWORK_LABEL[network === "test" ? "finney" : "test"]}.`
            : report.owned_hotkeys_total > 0
              ? "This is a wallet, not a miner. Here is what it holds."
              : "No UID on any subnet, so here is what it holds."}
        </p>
      )}

      {elsewhere && (
        <Link
          href={`/account/${elsewhere.network}/${report.address}`}
          className="group flex items-center justify-between gap-4 rounded-2xl bg-medium-soft px-5 py-4 text-[15px] text-foreground shadow-[0_0_0_1px_color-mix(in_oklab,var(--medium)_35%,transparent)] transition-[filter] hover:brightness-110"
        >
          <span>
            Empty on {NETWORK_LABEL[network]}, but it holds <b className="font-semibold tnum">{formatTao(elsewhere.total)}</b> on {NETWORK_LABEL[elsewhere.network]}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 font-medium">
            Open on {NETWORK_LABEL[elsewhere.network]}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      )}

      {empty && elsewhere ? null : empty ? (
        <p className="rounded-2xl bg-surface-2 px-5 py-4 text-[15px] text-muted-foreground">
          This account holds nothing on {NETWORK_LABEL[network]} at block {formatInt(report.chain.block)}.
        </p>
      ) : (
        <dl className="grid gap-px overflow-hidden rounded-2xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Free" value={formatTao(balance.free)} strong />
          <Stat label="Transferable" value={formatTao(balance.transferable)} />
          <Stat label="Staked" value={formatTao(report.staked_tao)} />
          <Stat label="Reserved" value={formatTao(balance.reserved)} />
        </dl>
      )}

      {isHotkey && (
        <section className="panel flex flex-col gap-4 p-5">
          <h2 className="flex items-center gap-2 text-[17px] font-medium">
            <KeyRound className="size-4 text-accent-ink" aria-hidden /> This address is a hotkey
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>Owned by</span>
            <Link href={`/account/${network}/${report.hotkey_owner}`} className="font-mono text-foreground hover:text-accent-ink">
              {report.hotkey_owner}
            </Link>
          </div>
          <SeatLinks network={network} hotkey={report.address} seats={report.seats} />
        </section>
      )}

      {report.stakes.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[17px] font-medium">Stakes</h2>
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-faint">
                  <th scope="col" className="px-5 py-3 font-medium">Subnet</th>
                  <th scope="col" className="px-5 py-3 font-medium">Validator hotkey</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Alpha</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">TAO value</th>
                </tr>
              </thead>
              <tbody>
                {report.stakes.map((stake) => (
                  <tr key={`${stake.hotkey}-${stake.netuid}`} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 font-medium">{stake.netuid === 0 ? "Root" : `SN${stake.netuid}`}</td>
                    <td className="px-5 py-3">
                      <MonoValue value={stake.hotkey} label="validator hotkey" head={6} tail={6} />
                    </td>
                    <td className="px-5 py-3 text-right font-mono tnum">{formatAlpha(stake.alpha)}</td>
                    <td className="px-5 py-3 text-right font-mono tnum">{stake.tao_value != null ? formatTao(stake.tao_value) : "n/a"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {report.owned_hotkeys.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[17px] font-medium">
            Hotkeys it owns <span className="font-normal text-muted-foreground">{report.owned_hotkeys_total}</span>
          </h2>
          <ul className="panel divide-y divide-line overflow-hidden">
            {report.owned_hotkeys.map((key) => (
              <li key={key.hotkey} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/account/${network}/${key.hotkey}`} className="font-mono text-sm text-foreground hover:text-accent-ink">
                  {key.hotkey}
                </Link>
                <SeatLinks network={network} hotkey={key.hotkey} seats={key.seats} />
              </li>
            ))}
          </ul>
          {report.owned_hotkeys_total > report.owned_hotkeys.length && (
            <p className="text-xs text-faint">Showing {report.owned_hotkeys.length} of {report.owned_hotkeys_total}</p>
          )}
        </section>
      )}

      {report.omitted && report.omitted.length > 0 && <p className="text-xs text-faint">Not read: {report.omitted.join(", ")}</p>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <ChainMeta chain={report.chain} elapsedMs={report.elapsed_ms} />
        {network === "finney" && (
          <a
            href={`https://taostats.io/account/${report.address}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Open on Taostats <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}
