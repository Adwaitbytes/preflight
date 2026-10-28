/**
 * The live explorer's model: a rolling buffer of recent blocks, the filters over it and the stats
 * the hero reads. Pure functions, so polling, replay and rendering all share one tested core.
 */

import { classifyInput } from "./route-input";
import { truncateMiddle } from "./format";
import type { Activity, LiveBlock, LiveFeed } from "./types";

export type ActivityKind = Activity["kind"];

export const ACTIVITY_KINDS = [
  "weights",
  "register",
  "stake",
  "unstake",
  "transfer",
  "serve",
  "commitment",
  "subnet",
  "shielded",
  "evm",
  "other",
] as const satisfies readonly ActivityKind[];

/** Finney makes a block every 12 s; polling at half that catches each one within a few seconds */
export const BLOCK_SECONDS = 12;
export const POLL_MS = 6_000;
/** The most blocks the API returns per call */
export const FEED_LIMIT = 12;
/** Blocks on screen */
export const VISIBLE_BLOCKS = 60;
/** Blocks kept in memory: the visible window plus room for what lands while the stream is held */
export const BUFFER_BLOCKS = 120;
const MAX_BACKOFF_MS = 60_000;
const STALE_AFTER_MS = BLOCK_SECONDS * 3 * 1000;

/**
 * Folds newly fetched blocks into the buffer, newest first. A block that arrives twice replaces
 * its earlier copy, and an extrinsic index appears once per block, so overlapping polls never duplicate rows.
 */
export function mergeBlocks(buffer: readonly LiveBlock[], incoming: readonly LiveBlock[], max = BUFFER_BLOCKS): LiveBlock[] {
  const byNumber = new Map<number, LiveBlock>();
  for (const block of buffer) byNumber.set(block.number, block);
  for (const block of incoming) byNumber.set(block.number, dedupeActivities(block));
  return [...byNumber.values()].sort((a, b) => b.number - a.number).slice(0, Math.max(0, max));
}

function dedupeActivities(block: LiveBlock): LiveBlock {
  const seen = new Set<number>();
  const activities = block.activities.filter((a) => {
    if (seen.has(a.index)) return false;
    seen.add(a.index);
    return true;
  });
  return activities.length === block.activities.length ? block : { ...block, activities };
}

export function newestBlock(blocks: readonly LiveBlock[]): number | null {
  return blocks[0]?.number ?? null;
}

/** Blocks the reader can see: the newest window at or below the watermark, which freezes while the stream is held */
export function visibleBlocks(blocks: readonly LiveBlock[], watermark: number | null, limit = VISIBLE_BLOCKS): LiveBlock[] {
  const shown = watermark == null ? blocks : blocks.filter((b) => b.number <= watermark);
  return shown.slice(0, limit);
}

export interface LiveFilters {
  /** Empty means every kind */
  kinds: readonly ActivityKind[];
  netuid: number | null;
  /** A full ss58 address to follow */
  address: string | null;
  failuresOnly: boolean;
}

export const NO_FILTERS: LiveFilters = { kinds: [], netuid: null, address: null, failuresOnly: false };

export function hasFilters(filters: LiveFilters): boolean {
  return filters.kinds.length > 0 || filters.netuid != null || filters.address != null || filters.failuresOnly;
}

/** The summary prints addresses as `5HbScN...FZdT`, so a followed wallet matches as signer or anywhere it is named */
export function mentionsAddress(activity: Activity, address: string): boolean {
  return activity.signer === address || activity.summary.includes(truncateMiddle(address, 6, 4));
}

export function matchesFilters(activity: Activity, filters: LiveFilters): boolean {
  if (filters.kinds.length > 0 && !filters.kinds.includes(activity.kind)) return false;
  if (filters.netuid != null && activity.netuid !== filters.netuid) return false;
  if (filters.failuresOnly && activity.success) return false;
  if (filters.address != null && !mentionsAddress(activity, filters.address)) return false;
  return true;
}

export interface BlockView {
  block: LiveBlock;
  activities: Activity[];
  /** Blocks between this one and the next older one on screen that were never fetched */
  missingBelow: number;
}

/**
 * The stream as rendered. Unfiltered, a quiet block still shows so the chain's rhythm stays visible;
 * filtered, only blocks with a match remain and gaps are not reported, since the filter made them.
 */
export function filterBlocks(blocks: readonly LiveBlock[], filters: LiveFilters): BlockView[] {
  const filtered = hasFilters(filters);
  const views: BlockView[] = [];
  blocks.forEach((block, i) => {
    const activities = filtered ? block.activities.filter((a) => matchesFilters(a, filters)) : block.activities;
    if (filtered && activities.length === 0) return;
    const older = blocks[i + 1];
    views.push({ block, activities, missingBelow: !filtered && older ? Math.max(0, block.number - older.number - 1) : 0 });
  });
  return views;
}

/** Matching activities that landed above the watermark and wait for the reader to resume */
export function pendingActivities(blocks: readonly LiveBlock[], watermark: number | null, filters: LiveFilters): { activities: number; blocks: number } {
  if (watermark == null) return { activities: 0, blocks: 0 };
  let activities = 0;
  let count = 0;
  for (const block of blocks) {
    if (block.number <= watermark) break;
    const matched = block.activities.filter((a) => matchesFilters(a, filters)).length;
    activities += matched;
    if (matched > 0 || !hasFilters(filters)) count += 1;
  }
  return { activities, blocks: count };
}

export interface SubnetCount {
  netuid: number;
  count: number;
}

export interface BlockBar {
  number: number;
  total: number;
  failed: number;
}

export interface LiveStats {
  activities: number;
  failed: number;
  /** Distinct signing accounts */
  signers: number;
  /** 0..1, null with no activity */
  failureRate: number | null;
  txPerMinute: number | null;
  topSubnets: SubnetCount[];
  /** Oldest first, for the activity bars */
  bars: BlockBar[];
  kindCounts: Record<ActivityKind, number>;
}

function emptyKindCounts(): Record<ActivityKind, number> {
  return Object.fromEntries(ACTIVITY_KINDS.map((k) => [k, 0])) as Record<ActivityKind, number>;
}

function spanSeconds(blocks: readonly LiveBlock[]): number {
  const newest = blocks[0];
  const oldest = blocks[blocks.length - 1];
  const fallback = blocks.length * BLOCK_SECONDS;
  if (!newest?.timestamp || !oldest?.timestamp) return fallback;
  const span = (Date.parse(newest.timestamp) - Date.parse(oldest.timestamp)) / 1000 + BLOCK_SECONDS;
  return Number.isFinite(span) && span > 0 ? span : fallback;
}

/** Chain wide numbers over the buffered blocks (newest first), independent of the reader's filters */
export function liveStats(blocks: readonly LiveBlock[], topN = 5): LiveStats {
  const kindCounts = emptyKindCounts();
  const subnets = new Map<number, number>();
  const signers = new Set<string>();
  let activities = 0;
  let failed = 0;
  const bars: BlockBar[] = [];
  for (const block of blocks) {
    let blockFailed = 0;
    for (const a of block.activities) {
      kindCounts[a.kind] += 1;
      if (!a.success) blockFailed += 1;
      if (a.signer) signers.add(a.signer);
      if (a.netuid != null) subnets.set(a.netuid, (subnets.get(a.netuid) ?? 0) + 1);
    }
    activities += block.activities.length;
    failed += blockFailed;
    bars.push({ number: block.number, total: block.activities.length, failed: blockFailed });
  }
  const topSubnets = [...subnets.entries()]
    .map(([netuid, count]) => ({ netuid, count }))
    .sort((a, b) => b.count - a.count || a.netuid - b.netuid)
    .slice(0, topN);
  return {
    activities,
    failed,
    signers: signers.size,
    failureRate: activities > 0 ? failed / activities : null,
    txPerMinute: blocks.length > 0 ? (activities / spanSeconds(blocks)) * 60 : null,
    topSubnets,
    bars: bars.reverse(),
    kindCounts,
  };
}

/**
 * True when the newest block in an answer is several block times old. The API's CDN can serve a
 * stale copy of a URL while it revalidates, so asking the same URL again shortly returns fresh blocks.
 */
export function isStaleFeed(feed: LiveFeed, now: number): boolean {
  const timestamp = feed.blocks.at(-1)?.timestamp;
  if (!timestamp) return false;
  const at = Date.parse(timestamp);
  return Number.isFinite(at) && now - at > STALE_AFTER_MS;
}

/** Wait before the next poll after `failures` failed attempts in a row: 6, 12, 24, 48, then 60 s */
export function backoffMs(failures: number): number {
  if (failures <= 0) return POLL_MS;
  return Math.min(MAX_BACKOFF_MS, POLL_MS * 2 ** (failures - 1));
}

export type SummarySegment = { kind: "text"; text: string } | { kind: "address"; text: string; address: string | null };

const SHORT_ADDRESS = /5[1-9A-HJ-NP-Za-km-z]{5}\.\.\.[1-9A-HJ-NP-Za-km-z]{4}/g;

/**
 * Splits a summary around the addresses it names. Only the signer's full address is known,
 * so other addresses stay as text: a guessed link would open the wrong wallet.
 */
export function summarySegments(summary: string, signer: string | null): SummarySegment[] {
  const segments: SummarySegment[] = [];
  const signerShort = signer ? truncateMiddle(signer, 6, 4) : null;
  let last = 0;
  for (const match of summary.matchAll(SHORT_ADDRESS)) {
    const start = match.index;
    if (start > last) segments.push({ kind: "text", text: summary.slice(last, start) });
    segments.push({ kind: "address", text: match[0], address: match[0] === signerShort ? signer : null });
    last = start + match[0].length;
  }
  if (last < summary.length) segments.push({ kind: "text", text: summary.slice(last) });
  return segments;
}

/** A full ss58 address to follow, or null when the input is not one */
export function parseAddress(input: string): string | null {
  const parsed = classifyInput(input);
  return parsed.kind === "hotkey" ? parsed.hotkey : null;
}

/** Accepts `64`, `sn64` or `SN 64` */
export function parseNetuid(input: string): number | null {
  const parsed = classifyInput(input);
  return parsed.kind === "netuid" ? parsed.netuid : null;
}

/** `Runtime.BadOrigin` reads as `BadOrigin`; the pallet stays in the title text */
export function errorName(error: string | null | undefined): string | null {
  if (!error) return null;
  return error.split(".").pop() || error;
}

export function announce(activities: number, blocks: number, filtered: boolean): string | null {
  if (blocks === 0) return null;
  const what = activities === 1 ? "1 new activity" : `${activities} new activities`;
  const where = blocks === 1 ? "1 block" : `${blocks} blocks`;
  return `${what}${filtered ? " matching your filters" : ""} in ${where}`;
}

/**
 * Offline replay: the recording loops forever, one block per step. Each lap renumbers past the last
 * so blocks stay unique, and timestamps are restamped so the page reads as a chain running now.
 */
export function replayBlock(recording: LiveFeed, step: number, now: number): LiveBlock | null {
  const length = recording.blocks.length;
  const source = recording.blocks[((step % length) + length) % length];
  if (!source || length === 0) return null;
  const first = recording.blocks[0]?.number ?? 0;
  const last = recording.blocks[length - 1]?.number ?? 0;
  const lap = Math.floor(step / length);
  const number = source.number + lap * (last - first + 1);
  return {
    ...source,
    number,
    timestamp: new Date(now).toISOString(),
    activities: source.activities.map((a) => ({ ...a, block: number })),
  };
}

/** The first screen of a replay: `count` blocks ending at `now`, spaced a block time apart, newest first */
export function replayOpening(recording: LiveFeed, count: number, now: number): LiveBlock[] {
  const blocks: LiveBlock[] = [];
  for (let step = 0; step < count; step += 1) {
    const block = replayBlock(recording, step, now - (count - 1 - step) * BLOCK_SECONDS * 1000);
    if (block) blocks.push(block);
  }
  return blocks.reverse();
}
