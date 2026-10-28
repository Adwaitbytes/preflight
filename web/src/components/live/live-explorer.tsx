"use client";

import { Pause, Play, RotateCw, Unplug } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "@/components/site/app-state";
import { Button } from "@/components/ui/button";
import { ApiErrorState } from "@/components/ui/state";
import { formatInt, pluralize } from "@/lib/format";
import {
  announce,
  filterBlocks,
  hasFilters,
  liveStats,
  newestBlock,
  parseAddress,
  parseNetuid,
  pendingActivities,
  visibleBlocks,
  type ActivityKind,
  type BlockView,
  type LiveFilters as Filters,
} from "@/lib/live";
import type { NetworkId } from "@/lib/networks";
import { LiveFilters } from "./live-filters";
import { LiveHero, type PulseState } from "./live-hero";
import { LiveStream, StreamEmpty, StreamSkeleton } from "./live-stream";
import { useLiveFeed } from "./use-live-feed";
import { useNow } from "./use-now";

const ANNOUNCE_EVERY_MS = 30_000;
const EMPTY_COUNTS = liveStats([]).kindCounts;

/** Screen readers hear a summary every 30 s at most, never a row as it lands */
function useThrottledAnnouncement(views: BlockView[], filtered: boolean): string {
  const [message, setMessage] = useState("");
  const latest = useRef({ views, filtered });
  const through = useRef<number | null>(null);

  useEffect(() => {
    latest.current = { views, filtered };
    // What was on screen when the reader arrived is not news
    if (through.current == null && views[0]) through.current = views[0].block.number;
  }, [views, filtered]);

  useEffect(() => {
    const id = setInterval(() => {
      const { views: current, filtered: isFiltered } = latest.current;
      const since = through.current;
      const top = current[0]?.block.number;
      if (since == null || top == null) return;
      const fresh = current.filter((v) => v.block.number > since);
      through.current = Math.max(since, top);
      const text = announce(
        fresh.reduce((sum, v) => sum + v.activities.length, 0),
        fresh.length,
        isFiltered,
      );
      if (text) setMessage(text);
    }, ANNOUNCE_EVERY_MS);
    return () => clearInterval(id);
  }, []);

  return message;
}

function RetryCountdown({ retryAt }: { retryAt: number | null }) {
  const now = useNow();
  if (retryAt == null || now === 0) return <>Retrying</>;
  const seconds = Math.max(0, Math.ceil((retryAt - now) / 1000));
  return <>{seconds > 0 ? `Retrying in ${seconds} s` : "Retrying"}</>;
}

/** Remounts per network, so switching starts a clean stream instead of mixing chains */
export function LiveExplorer({ offline }: { offline: boolean }) {
  const { network } = useAppState();
  // The offline recording is finney, whatever network is picked
  const active: NetworkId = offline ? "finney" : network;
  return <LiveSession key={active} network={active} offline={offline} />;
}

function LiveSession({ network, offline }: { network: NetworkId; offline: boolean }) {
  const feed = useLiveFeed(network, offline);
  const [kinds, setKinds] = useState<ActivityKind[]>([]);
  const [subnetText, setSubnetText] = useState("");
  const [addressText, setAddressText] = useState("");
  const [failuresOnly, setFailuresOnly] = useState(false);
  const [paused, setPaused] = useState(false);
  const [holds, setHolds] = useState({ pointer: false, focus: false });
  const [frozenAt, setFrozenAt] = useState<number | null>(null);

  const netuid = parseNetuid(subnetText);
  const address = parseAddress(addressText);
  const filters: Filters = useMemo(
    () => ({ kinds, netuid, address, failuresOnly }),
    [kinds, netuid, address, failuresOnly],
  );
  const filtered = hasFilters(filters);

  const newest = newestBlock(feed.blocks);
  const held = paused || holds.pointer || holds.focus;
  // While held, nothing above the watermark is drawn, so rows never move under the cursor
  const watermark = held ? frozenAt : null;

  const recent = useMemo(() => visibleBlocks(feed.blocks, null), [feed.blocks]);
  const stats = useMemo(() => (recent.length ? liveStats(recent) : null), [recent]);
  const views = useMemo(() => filterBlocks(visibleBlocks(feed.blocks, watermark), filters), [feed.blocks, watermark, filters]);
  const pending = useMemo(() => pendingActivities(feed.blocks, watermark, filters), [feed.blocks, watermark, filters]);
  const message = useThrottledAnnouncement(views, filtered);

  function hold(source: "pointer" | "focus", on: boolean) {
    if (on && !held) setFrozenAt(newest);
    setHolds((h) => (h[source] === on ? h : { ...h, [source]: on }));
  }

  function togglePause() {
    if (!paused && !held) setFrozenAt(newest);
    setPaused((p) => !p);
  }

  function showPending() {
    setPaused(false);
    setFrozenAt(newest);
  }

  function clearFilters() {
    setKinds([]);
    setSubnetText("");
    setAddressText("");
    setFailuresOnly(false);
  }

  const pulse: PulseState = feed.status === "failing" ? "failing" : !newest ? "connecting" : paused ? "paused" : offline ? "replay" : "live";
  const loading = feed.blocks.length === 0 && feed.status !== "failing";
  // With nothing on screen yet a failure takes the whole stream; once blocks exist it is a banner above them
  const down = feed.blocks.length === 0 && feed.status === "failing" ? feed.error : null;
  const totalShown = views.reduce((sum, v) => sum + v.activities.length, 0);

  return (
    <div className="flex flex-col gap-8 pb-20">
      <LiveHero
        network={network}
        state={pulse}
        newest={recent[0] ?? null}
        stats={stats}
        blockCount={recent.length}
        selectedNetuid={netuid}
        onPickSubnet={(n) => setSubnetText((current) => (parseNetuid(current) === n ? "" : String(n)))}
      />

      <section aria-labelledby="stream-heading" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h2 id="stream-heading" className="text-title font-semibold">
              Activity
            </h2>
            <p className="mt-1 min-h-6 text-sm text-muted-foreground tnum">
              {loading
                ? "Reading the latest blocks"
                : `${pluralize(totalShown, filtered ? "matching activity" : "activity", filtered ? "matching activities" : "activities")} in the last ${pluralize(recent.length, "block")}`}
              {!loading && held && !paused && <span className="text-faint">, held while you read</span>}
            </p>
          </div>
          <Button
            variant={paused ? "primary" : "secondary"}
            size="sm"
            onClick={togglePause}
            aria-pressed={paused}
            disabled={loading || down != null}
            className="min-w-24"
          >
            {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
            {paused ? "Resume" : "Pause"}
          </Button>
        </div>

        <LiveFilters
          kinds={kinds}
          onToggleKind={(kind) => setKinds((current) => (current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind]))}
          kindCounts={stats?.kindCounts ?? EMPTY_COUNTS}
          subnetText={subnetText}
          onSubnetText={setSubnetText}
          subnetInvalid={subnetText.trim() !== "" && netuid == null}
          addressText={addressText}
          onAddressText={setAddressText}
          addressInvalid={addressText.trim() !== "" && address == null}
          failuresOnly={failuresOnly}
          onToggleFailures={() => setFailuresOnly((f) => !f)}
          failedCount={stats?.failed ?? 0}
          active={filtered || subnetText !== "" || addressText !== ""}
          onClear={clearFilters}
        />

        {feed.status === "failing" && feed.error && feed.blocks.length > 0 && (
          <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-critical-soft px-4 py-3 text-[13px] text-critical shadow-[0_0_0_1px_color-mix(in_oklab,var(--critical)_22%,transparent)]">
            <Unplug className="size-4 shrink-0" aria-hidden />
            <p className="min-w-0 flex-1">
              <span className="font-semibold">Lost the feed at block {formatInt(newest ?? 0)}</span>
              <span className="text-critical/85">
                {" "}
                {feed.error.message}. <RetryCountdown retryAt={feed.retryAt} />
              </span>
            </p>
            <Button variant="secondary" size="sm" onClick={feed.retry}>
              <RotateCw className="size-3.5" aria-hidden />
              Retry now
            </Button>
          </div>
        )}

        {loading ? (
          <StreamSkeleton />
        ) : down ? (
          <ApiErrorState
            error={down}
            action={
              <Button variant="secondary" onClick={feed.retry}>
                <RotateCw className="size-3.5" aria-hidden />
                Retry now
              </Button>
            }
          />
        ) : views.length === 0 && filtered ? (
          <StreamEmpty blocks={recent.length} onClear={clearFilters} />
        ) : (
          <LiveStream views={views} network={network} filtered={filtered} pending={pending} held={paused ? "paused" : held ? "reading" : null} onShowPending={showPending} onHold={hold} />
        )}
      </section>

      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {message}
      </p>
    </div>
  );
}
