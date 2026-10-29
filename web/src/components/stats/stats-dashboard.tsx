"use client";

import { Activity, Bot, Clock, Gauge, Globe2, LogOut, MonitorSmartphone, MousePointerClick, RefreshCw, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { logout } from "@/app/stats/actions";
import { Button } from "@/components/ui/button";
import { ignoreThisBrowser } from "@/lib/analytics";
import { bucketLabel, CLIENT_LABEL, countryName, describeEvent, formatMs, formatSeconds, formatVital, timeAgo, TOOL_LABEL, VITAL_NAMES } from "@/lib/stats";
import type { StatsReport } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BarList, ColumnChart, type Column } from "./charts";

const REFRESH_MS = 60_000;
const RANGES: { value: StatsReport["range"]; label: string }[] = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

function href(range: StatsReport["range"], automated: boolean): string {
  return `/stats?range=${range}${automated ? "&automated=1" : ""}`;
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function Section({ title, icon: Icon, hint, children, className }: { title: string; icon: typeof Globe2; hint?: string; children: ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={cn("panel flex min-w-0 flex-col gap-4 p-4 sm:p-5", className)}>
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-faint" aria-hidden />
          {title}
        </h2>
        {hint && <p className="text-xs text-faint">{hint}</p>}
      </header>
      {children}
    </section>
  );
}

function Tile({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <div className="flex min-w-0 flex-col bg-surface px-4 py-3.5 sm:px-5">
      <dt className="eyebrow truncate">{label}</dt>
      <dd className="mt-1.5 text-2xl leading-8 font-semibold tracking-[-0.025em] tnum">{value}</dd>
      {caption && <dd className="mt-0.5 truncate text-xs text-faint tnum">{caption}</dd>}
    </div>
  );
}

const RATING_TONE = { good: "bg-healthy-soft text-healthy", "needs work": "bg-medium-soft text-medium", poor: "bg-critical-soft text-critical" } as const;

function Rating({ rating }: { rating: keyof typeof RATING_TONE }) {
  return <span className={cn("rounded px-1.5 py-px text-[11px] font-medium whitespace-nowrap", RATING_TONE[rating])}>{rating}</span>;
}

const KIND_TONE: Record<string, string> = {
  view: "bg-accent",
  leave: "bg-accent/40",
  action: "bg-medium",
  api: "bg-healthy",
  bot: "bg-foreground/50",
};

export function StatsDashboard({ report, range, automated }: { report: StatsReport; range: StatsReport["range"]; automated: boolean }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [now, setNow] = useState(() => Date.now());
  const t = report.totals;

  useEffect(() => {
    // Logging in here means this browser belongs to the owner: stop counting its visits
    ignoreThisBrowser();
    const timer = setInterval(() => {
      setNow(Date.now());
      if (document.visibilityState === "visible") startRefresh(() => router.refresh());
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [router]);

  const empty = t.views === 0 && t.tool_runs === 0 && t.bot_messages === 0;
  const viewColumns: Column[] = report.series.map((p) => ({
    key: p.t,
    label: bucketLabel(p.t, range),
    value: p.views,
    lines: [`${p.sessions} sessions`, `${p.tool_runs} tool runs`, `${p.bot} bot messages`],
  }));
  const toolColumns: Column[] = report.series.map((p) => ({ key: p.t, label: bucketLabel(p.t, range), value: p.tool_runs }));
  const hourColumns: Column[] = report.hours.map((n, h) => ({ key: String(h), label: `${String(h).padStart(2, "0")}:00 UTC`, value: n }));
  const engagementColumns: Column[] = report.engagement.map((e) => ({ key: e.label, label: e.label, value: e.count }));
  const siteVitals = report.vitals.filter((v) => v.page === null);
  const pageVitals = report.vitals.filter((v) => v.page !== null && (v.metric === "LCP" || v.metric === "INP"));

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 pt-10 pb-2 sm:pt-12 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Private · only you can see this</p>
          <h1 className="mt-3 text-headline font-semibold text-balance">Who uses Preflight</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex size-2">
                {t.active_now > 0 && <span className="absolute inline-flex size-full animate-ping rounded-full bg-healthy opacity-60 motion-reduce:animate-none" />}
                <span className={cn("relative inline-flex size-2 rounded-full", t.active_now > 0 ? "bg-healthy" : "bg-faint")} />
              </span>
              <span className="tnum">{t.active_now}</span> active now
            </span>
            <span className="text-faint">·</span>
            <span>updated {timeAgo(report.generated_at, now)}, refreshes every minute</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Range" className="inline-grid grid-cols-3 rounded-lg bg-surface-2 p-0.5 shadow-[0_0_0_1px_var(--line)]">
            {RANGES.map((r) => (
              <Link
                key={r.value}
                href={href(r.value, automated)}
                aria-current={r.value === range ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-center text-xs font-medium whitespace-nowrap transition-colors",
                  r.value === range ? "bg-surface text-foreground shadow-[0_0_0_1px_var(--line-strong)]" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </Link>
            ))}
          </nav>
          <Link
            href={href(range, !automated)}
            aria-pressed={automated}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-medium shadow-[0_0_0_1px_var(--line)] transition-colors", automated ? "bg-accent-soft text-accent-ink" : "text-muted-foreground hover:text-foreground")}
          >
            {automated ? "Including automated" : "Include automated"}
          </Link>
          <Button size="sm" variant="ghost" onClick={() => startRefresh(() => router.refresh())} disabled={refreshing} aria-label="Refresh now">
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin motion-reduce:animate-none")} aria-hidden />
          </Button>
          <form action={logout}>
            <Button size="sm" variant="ghost" type="submit">
              <LogOut className="size-3.5" aria-hidden />
              Log out
            </Button>
          </form>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-3 lg:grid-cols-5">
        <Tile label="Visitors" value={t.visitors.toLocaleString("en-US")} caption={range === "24h" ? "unique today" : "daily uniques, summed"} />
        <Tile label="Sessions" value={t.sessions.toLocaleString("en-US")} caption={`${pct(t.returning_share)} returning browsers`} />
        <Tile label="Page views" value={t.views.toLocaleString("en-US")} caption={`${t.pages_per_session.toFixed(1)} per session`} />
        <Tile label="Time on site" value={formatSeconds(t.avg_engaged_s)} caption={`median ${formatSeconds(t.median_engaged_s)}, visible time only`} />
        <Tile label="Bounce rate" value={pct(t.bounce_rate)} caption="sessions with one page" />
        <Tile label="Tool runs" value={t.tool_runs.toLocaleString("en-US")} caption={`${pct(t.api_error_rate)} server errors, ${t.rejected} rejected`} />
        <Tile label="Telegram" value={t.bot_messages.toLocaleString("en-US")} caption={`messages from ${t.bot_chats} chats`} />
        <Tile label="Countries" value={String(report.countries.filter((c) => c.country).length)} caption={report.countries[0] ? `most from ${countryName(report.countries[0].country)}` : "none yet"} />
        <Tile label="Top source" value={report.sources[0]?.label ?? "n/a"} caption={report.sources[0] ? `${report.sources[0].count} sessions` : "no sessions yet"} />
        <Tile label="Top tool" value={report.tools[0] ? (TOOL_LABEL[report.tools[0].name] ?? report.tools[0].name) : "n/a"} caption={report.tools[0] ? `${report.tools[0].runs} runs, p50 ${formatMs(report.tools[0].p50_ms)}` : "no runs yet"} />
      </dl>

      {empty && (
        <p role="status" className="panel px-5 py-4 text-sm text-muted-foreground">
          Nothing recorded in this range yet. Visits count from the moment analytics went live; open the site in another browser to see a session appear here within a minute.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Activity" icon={Activity} hint="hover a column for detail">
          <ColumnChart title="Page views" unit="views" columns={viewColumns} />
        </Section>
        <Section title="Tools run" icon={Wrench} hint="every API answer, timed">
          <ColumnChart title="Tool runs" unit="runs" columns={toolColumns} />
        </Section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Section title="Countries" icon={Globe2} hint="by session">
          <BarList
            rows={report.countries.map((c) => ({
              key: c.country ?? "unknown",
              label: (
                <>
                  {countryName(c.country)} {c.country && <span className="font-mono text-[11px] text-faint">{c.country}</span>}
                </>
              ),
              value: c.sessions,
              hint: `${c.visitors} visitors`,
            }))}
          />
        </Section>
        <Section title="Cities" icon={Globe2} hint="from Vercel's edge">
          <BarList rows={report.cities.map((c) => ({ key: `${c.country}-${c.city}`, label: `${c.city}, ${countryName(c.country)}`, value: c.sessions }))} empty="No city data yet" />
        </Section>
        <Section title="Where they came from" icon={MousePointerClick} hint="first page of each session">
          <BarList rows={report.sources.map((s) => ({ key: s.label, label: s.label === "direct" ? "Direct or unknown" : s.label, value: s.count }))} />
        </Section>
      </div>

      <Section title="Pages" icon={Activity} hint="templates: no hotkey or hash is stored">
        {report.pages.length === 0 ? (
          <p className="text-sm text-faint">No page views in this range</p>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:-mx-5">
            <table className="w-full min-w-[34rem] text-[13px]">
              <thead>
                <tr className="text-left">
                  {["Page", "Views", "Sessions", "Entries", "Avg time"].map((h, i) => (
                    <th key={h} scope="col" className={cn("eyebrow pb-2 font-normal", i === 0 ? "pl-4 sm:pl-5" : "text-right", i === 4 && "pr-4 sm:pr-5")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.pages.map((p) => (
                  <tr key={p.path} className="border-t border-line">
                    <td className="max-w-0 py-2 pl-4 sm:pl-5">
                      <span className="block truncate font-mono text-xs" title={p.path}>
                        {p.path}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono text-xs tnum">{p.views}</td>
                    <td className="py-2 text-right font-mono text-xs tnum">{p.sessions}</td>
                    <td className="py-2 text-right font-mono text-xs tnum">{p.entries}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs tnum sm:pr-5">{formatSeconds(p.avg_engaged_s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Tools" icon={Wrench} hint="latency at the API, p50 and p95">
          {report.tools.length === 0 ? (
            <p className="text-sm text-faint">No tool runs in this range</p>
          ) : (
            <div className="-mx-4 overflow-x-auto sm:-mx-5">
              <table className="w-full min-w-[30rem] text-[13px]">
                <thead>
                  <tr className="text-left">
                    {["Tool", "Runs", "p50", "p95", "Errors"].map((h, i) => (
                      <th key={h} scope="col" className={cn("eyebrow pb-2 font-normal", i === 0 ? "pl-4 sm:pl-5" : "text-right", i === 4 && "pr-4 sm:pr-5")}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.tools.map((tool) => (
                    <tr key={tool.name} className="border-t border-line">
                      <td className="py-2 pl-4 sm:pl-5">{TOOL_LABEL[tool.name] ?? tool.name}</td>
                      <td className="py-2 text-right font-mono text-xs tnum">{tool.runs}</td>
                      <td className="py-2 text-right font-mono text-xs tnum">{formatMs(tool.p50_ms)}</td>
                      <td className={cn("py-2 text-right font-mono text-xs tnum", tool.p95_ms > 10_000 && "text-medium")}>{formatMs(tool.p95_ms)}</td>
                      <td className={cn("py-2 pr-4 text-right font-mono text-xs tnum sm:pr-5", tool.errors > 0 && "text-critical")}>
                        {tool.errors}
                        {tool.rejected > 0 && <span className="text-faint"> +{tool.rejected}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
        <div className="grid gap-5 sm:grid-cols-2">
          <Section title="Actions" icon={MousePointerClick} hint="on the site">
            <BarList rows={report.actions.map((a) => ({ key: a.label, label: a.label, value: a.count }))} empty="No actions yet" />
          </Section>
          <Section title="Telegram" icon={Bot} hint="command names only">
            <BarList rows={report.bot_commands.map((c) => ({ key: c.label, label: c.label === "paste" ? "Pasted text" : c.label, value: c.count }))} empty="No bot messages yet" />
          </Section>
          <Section title="Who calls the API" icon={Wrench} className="sm:col-span-2">
            <BarList rows={report.clients.map((c) => ({ key: c.label, label: CLIENT_LABEL[c.label] ?? c.label, value: c.count }))} empty="No API calls yet" />
          </Section>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="How long sessions last" icon={Clock} hint="visible time, per session">
          <ColumnChart title="Sessions by length" unit="sessions" columns={engagementColumns} height={120} everyNth={1} />
        </Section>
        <Section title="When they come" icon={Clock} hint="page views by hour, UTC">
          <ColumnChart title="Views by hour of day" unit="views" columns={hourColumns} height={120} everyNth={6} />
        </Section>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Section title="Devices" icon={MonitorSmartphone}>
          <BarList rows={report.devices.map((d) => ({ key: d.label, label: d.label, value: d.count }))} />
        </Section>
        <Section title="Browsers" icon={MonitorSmartphone}>
          <BarList rows={report.browsers.map((d) => ({ key: d.label, label: d.label, value: d.count }))} />
        </Section>
        <Section title="Systems" icon={MonitorSmartphone}>
          <BarList rows={report.systems.map((d) => ({ key: d.label, label: d.label, value: d.count }))} />
        </Section>
        <Section title="Networks" icon={Globe2} hint="views">
          <BarList rows={report.networks.map((d) => ({ key: d.label, label: d.label, value: d.count }))} />
        </Section>
      </div>

      <Section title="Speed real visitors get" icon={Gauge} hint="Core Web Vitals, 75th percentile">
        {siteVitals.length === 0 ? (
          <p className="text-sm text-faint">No measurements yet: they arrive as people browse</p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-5">
              {siteVitals.map((v) => (
                <div key={v.metric} className="flex flex-col gap-1 bg-surface px-4 py-3">
                  <dt className="eyebrow truncate" title={VITAL_NAMES[v.metric]}>
                    {v.metric} · {VITAL_NAMES[v.metric] ?? v.metric}
                  </dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-lg font-semibold tnum">{formatVital(v.metric, v.p75)}</span>
                    <Rating rating={v.rating} />
                  </dd>
                  <dd className="text-xs text-faint tnum">{v.samples} samples</dd>
                </div>
              ))}
            </dl>
            {pageVitals.length > 0 && (
              <div className="-mx-4 overflow-x-auto sm:-mx-5">
                <table className="w-full min-w-[30rem] text-[13px]">
                  <thead>
                    <tr className="text-left">
                      {["Page", "Metric", "p75", "Rating", "Samples"].map((h, i) => (
                        <th key={h} scope="col" className={cn("eyebrow pb-2 font-normal", i === 0 ? "pl-4 sm:pl-5" : "text-right", i === 4 && "pr-4 sm:pr-5")}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageVitals.slice(0, 16).map((v) => (
                      <tr key={`${v.page}-${v.metric}`} className="border-t border-line">
                        <td className="max-w-0 py-2 pl-4 sm:pl-5">
                          <span className="block truncate font-mono text-xs">{v.page}</span>
                        </td>
                        <td className="py-2 text-right text-xs">{v.metric}</td>
                        <td className="py-2 text-right font-mono text-xs tnum">{formatVital(v.metric, v.p75)}</td>
                        <td className="py-2 text-right">
                          <Rating rating={v.rating} />
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-xs tnum sm:pr-5">{v.samples}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Section>

      <Section title="Latest activity" icon={Activity} hint="newest first">
        {report.recent.length === 0 ? (
          <p className="text-sm text-faint">Nothing yet</p>
        ) : (
          <ol className="flex flex-col">
            {report.recent.map((e, i) => (
              <li key={`${e.at}-${i}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t border-line py-2 first:border-t-0 first:pt-0">
                <span aria-hidden className={cn("relative top-[-1px] size-2 rounded-full", KIND_TONE[e.kind] ?? "bg-faint")} />
                <div className="min-w-0">
                  <p className="truncate text-[13px]">{describeEvent(e)}</p>
                  <p className="truncate text-xs text-faint">
                    {[e.city && e.country ? `${e.city}, ${countryName(e.country)}` : e.country ? countryName(e.country) : null, e.device, e.client && e.kind === "api" ? (CLIENT_LABEL[e.client] ?? e.client) : null].filter(Boolean).join(" · ") || "no location"}
                  </p>
                </div>
                <time dateTime={e.at} className="font-mono text-[11px] whitespace-nowrap text-faint tnum" title={new Date(e.at).toUTCString()}>
                  {timeAgo(e.at, now)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <ul className="flex flex-col gap-1.5 text-xs leading-5 text-faint">
        {report.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
        <li>Your own visits stop counting on this browser once you open this page.</li>
      </ul>
    </div>
  );
}
