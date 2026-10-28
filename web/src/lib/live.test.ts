import { describe, expect, it } from "vitest";
import recording from "@/data/samples/live.json";
import {
  announce,
  backoffMs,
  errorName,
  filterBlocks,
  isStaleFeed,
  liveStats,
  matchesFilters,
  mergeBlocks,
  NO_FILTERS,
  parseAddress,
  parseNetuid,
  pendingActivities,
  replayBlock,
  replayOpening,
  summarySegments,
  visibleBlocks,
  type LiveFilters,
} from "./live";
import type { Activity, LiveBlock, LiveFeed } from "./types";

const SIGNER = "5HbScNssaEfioJHXjcXdpyqo1AKnYjymidGF8opcF9rTFZdT";
const OTHER = "5GKH9FPPnWSUoeeTJp19wVtd84XbQaTVXyGT6BdBNMdETrP1";

function activity(block: number, index: number, over: Partial<Activity> = {}): Activity {
  return {
    block,
    index,
    ref: `${block}-${index}`,
    hash: null,
    kind: "weights",
    pallet: "SubtensorModule",
    call: "set_weights",
    signer: SIGNER,
    netuid: 64,
    summary: "Validator 5HbScN...FZdT set weights on SN64 for 98 UIDs",
    success: true,
    error: null,
    amount: null,
    ...over,
  };
}

function block(number: number, activities: Activity[] = [], over: Partial<LiveBlock> = {}): LiveBlock {
  return {
    number,
    hash: `0x${number.toString(16).padStart(64, "0")}`,
    timestamp: new Date(Date.UTC(2026, 9, 28, 6, 0, 0) + (number - 100) * 12_000).toISOString(),
    activities,
    system_calls: 2,
    failed: activities.filter((a) => !a.success).length,
    ...over,
  };
}

const filters = (over: Partial<LiveFilters>): LiveFilters => ({ ...NO_FILTERS, ...over });

describe("mergeBlocks", () => {
  it("keeps the buffer newest first whatever order blocks arrive in", () => {
    const merged = mergeBlocks([block(101)], [block(100), block(103), block(102)]);
    expect(merged.map((b) => b.number)).toEqual([103, 102, 101, 100]);
  });

  it("never duplicates rows when a block arrives twice", () => {
    const first = block(100, [activity(100, 1), activity(100, 2)]);
    const once = mergeBlocks([], [first]);
    const twice = mergeBlocks(once, [first, block(101, [activity(101, 1)])]);
    const again = mergeBlocks(twice, [block(101, [activity(101, 1)])]);
    expect(again.map((b) => b.number)).toEqual([101, 100]);
    expect(again.flatMap((b) => b.activities.map((a) => a.ref))).toEqual(["101-1", "100-1", "100-2"]);
  });

  it("drops a repeated extrinsic index inside one block", () => {
    const merged = mergeBlocks([], [block(100, [activity(100, 1), activity(100, 1), activity(100, 2)])]);
    expect(merged[0]?.activities.map((a) => a.index)).toEqual([1, 2]);
  });

  it("evicts the oldest blocks past the cap", () => {
    const incoming = Array.from({ length: 10 }, (_, i) => block(100 + i));
    expect(mergeBlocks([], incoming, 4).map((b) => b.number)).toEqual([109, 108, 107, 106]);
  });

  it("leaves the buffer untouched for an empty poll", () => {
    const buffer = [block(101), block(100)];
    expect(mergeBlocks(buffer, [])).toEqual(buffer);
  });
});

describe("visibleBlocks", () => {
  const buffer = mergeBlocks([], [block(100), block(101), block(102), block(103)]);

  it("shows everything when the stream is not held", () => {
    expect(visibleBlocks(buffer, null).map((b) => b.number)).toEqual([103, 102, 101, 100]);
  });

  it("holds the window at the watermark so new blocks wait above it", () => {
    expect(visibleBlocks(buffer, 101).map((b) => b.number)).toEqual([101, 100]);
  });

  it("caps the window", () => {
    expect(visibleBlocks(buffer, null, 2).map((b) => b.number)).toEqual([103, 102]);
  });
});

describe("matchesFilters", () => {
  const failedStake = activity(100, 3, {
    kind: "unstake",
    netuid: 103,
    signer: OTHER,
    summary: "5GKH9F...TrP1 unstaked all stake from 5HbScN...FZdT on SN103",
    success: false,
    error: "SubtensorModule.SlippageTooHigh",
  });

  it("passes everything with no filters", () => {
    expect(matchesFilters(failedStake, NO_FILTERS)).toBe(true);
  });

  it("filters by any of several kinds", () => {
    expect(matchesFilters(failedStake, filters({ kinds: ["stake", "unstake"] }))).toBe(true);
    expect(matchesFilters(failedStake, filters({ kinds: ["weights"] }))).toBe(false);
  });

  it("filters by subnet and failures", () => {
    expect(matchesFilters(failedStake, filters({ netuid: 103, failuresOnly: true }))).toBe(true);
    expect(matchesFilters(activity(100, 1), filters({ failuresOnly: true }))).toBe(false);
    expect(matchesFilters(activity(100, 1), filters({ netuid: 103 }))).toBe(false);
  });

  it("follows a wallet as signer or wherever the sentence names it", () => {
    expect(matchesFilters(failedStake, filters({ address: OTHER }))).toBe(true);
    expect(matchesFilters(failedStake, filters({ address: SIGNER }))).toBe(true);
    expect(matchesFilters(activity(100, 1, { signer: null, summary: "An EVM transaction ran" }), filters({ address: SIGNER }))).toBe(false);
  });
});

describe("filterBlocks", () => {
  const buffer = mergeBlocks([], [
    block(100, [activity(100, 1)]),
    block(101, [activity(101, 1, { kind: "transfer", netuid: null })]),
    block(104, []),
  ]);

  it("keeps quiet blocks and reports unfetched gaps when unfiltered", () => {
    const views = filterBlocks(buffer, NO_FILTERS);
    expect(views.map((v) => [v.block.number, v.activities.length, v.missingBelow])).toEqual([
      [104, 0, 2],
      [101, 1, 0],
      [100, 1, 0],
    ]);
  });

  it("drops blocks without a match once filtered", () => {
    const views = filterBlocks(buffer, filters({ kinds: ["transfer"] }));
    expect(views.map((v) => [v.block.number, v.activities.length, v.missingBelow])).toEqual([[101, 1, 0]]);
  });
});

describe("pendingActivities", () => {
  const buffer = mergeBlocks([], [
    block(100, [activity(100, 1)]),
    block(101, [activity(101, 1), activity(101, 2, { success: false })]),
    block(102, [activity(102, 1, { kind: "transfer" })]),
  ]);

  it("counts nothing while the stream is live", () => {
    expect(pendingActivities(buffer, null, NO_FILTERS)).toEqual({ activities: 0, blocks: 0 });
  });

  it("counts what landed above the watermark", () => {
    expect(pendingActivities(buffer, 100, NO_FILTERS)).toEqual({ activities: 3, blocks: 2 });
  });

  it("counts only matching activities when filtered", () => {
    expect(pendingActivities(buffer, 100, filters({ failuresOnly: true }))).toEqual({ activities: 1, blocks: 1 });
  });
});

describe("liveStats", () => {
  it("is empty and honest for no blocks", () => {
    const stats = liveStats([]);
    expect(stats.txPerMinute).toBeNull();
    expect(stats.failureRate).toBeNull();
    expect(stats.bars).toEqual([]);
  });

  it("derives rate, failures, busiest subnets and per block bars", () => {
    const buffer = mergeBlocks([], [
      block(100, [activity(100, 1), activity(100, 2, { netuid: 3 })]),
      block(101, [activity(101, 1, { success: false }), activity(101, 2, { netuid: 3 }), activity(101, 3, { netuid: null })]),
      block(102, [activity(102, 1, { netuid: 3, kind: "stake" })]),
    ]);
    const stats = liveStats(buffer);
    expect(stats.activities).toBe(6);
    expect(stats.failed).toBe(1);
    expect(stats.signers).toBe(1);
    expect(stats.failureRate).toBeCloseTo(1 / 6);
    // Three blocks span 36 s of chain time
    expect(stats.txPerMinute).toBeCloseTo(10);
    expect(stats.topSubnets).toEqual([
      { netuid: 3, count: 3 },
      { netuid: 64, count: 2 },
    ]);
    expect(stats.bars).toEqual([
      { number: 100, total: 2, failed: 0 },
      { number: 101, total: 3, failed: 1 },
      { number: 102, total: 1, failed: 0 },
    ]);
    expect(stats.kindCounts.weights).toBe(5);
    expect(stats.kindCounts.stake).toBe(1);
  });

  it("falls back to the block time when timestamps are missing", () => {
    const stats = liveStats([block(101, [activity(101, 1)], { timestamp: null }), block(100, [activity(100, 1)], { timestamp: null })]);
    expect(stats.txPerMinute).toBeCloseTo(5);
  });
});

describe("isStaleFeed", () => {
  const chain = { network: "finney" as const, endpoint: "wss://x", block: 101, block_hash: "0x00" };
  const at = Date.UTC(2026, 9, 28, 6, 0, 12);
  const feed: LiveFeed = { chain, head: 101, blocks: [block(100), block(101)] };

  it("flags an answer whose newest block is several block times old", () => {
    expect(isStaleFeed(feed, at + 10_000)).toBe(false);
    expect(isStaleFeed(feed, at + 5 * 60_000)).toBe(true);
  });

  it("never flags an empty answer or one without timestamps", () => {
    expect(isStaleFeed({ ...feed, blocks: [] }, at + 5 * 60_000)).toBe(false);
    expect(isStaleFeed({ ...feed, blocks: [block(101, [], { timestamp: null })] }, at + 5 * 60_000)).toBe(false);
  });
});

describe("backoffMs", () => {
  it("doubles from the poll interval and caps at a minute", () => {
    expect([0, 1, 2, 3, 4, 5, 9].map(backoffMs)).toEqual([6000, 6000, 12000, 24000, 48000, 60000, 60000]);
  });
});

describe("summarySegments", () => {
  it("links the signer and leaves other addresses as text", () => {
    const segments = summarySegments("5GKH9F...TrP1 unstaked all stake from 5HbScN...FZdT on SN103", OTHER);
    expect(segments).toEqual([
      { kind: "address", text: "5GKH9F...TrP1", address: OTHER },
      { kind: "text", text: " unstaked all stake from " },
      { kind: "address", text: "5HbScN...FZdT", address: null },
      { kind: "text", text: " on SN103" },
    ]);
  });

  it("returns plain text for a sentence without addresses", () => {
    expect(summarySegments("An EVM transaction ran", null)).toEqual([{ kind: "text", text: "An EVM transaction ran" }]);
  });
});

describe("input parsing", () => {
  it("accepts only full ss58 addresses to follow", () => {
    expect(parseAddress(` ${SIGNER} `)).toBe(SIGNER);
    expect(parseAddress("5HbScN...FZdT")).toBeNull();
  });

  it("reads subnet ids in the forms people type", () => {
    expect(parseNetuid("64")).toBe(64);
    expect(parseNetuid("sn64")).toBe(64);
    expect(parseNetuid("nope")).toBeNull();
  });

  it("shortens error names to the variant", () => {
    expect(errorName("SubtensorModule.TooManyUnrevealedCommits")).toBe("TooManyUnrevealedCommits");
    expect(errorName(null)).toBeNull();
  });
});

describe("announce", () => {
  it("summarises instead of reading each row", () => {
    expect(announce(18, 3, false)).toBe("18 new activities in 3 blocks");
    expect(announce(1, 1, true)).toBe("1 new activity matching your filters in 1 block");
    expect(announce(0, 0, false)).toBeNull();
  });
});

describe("offline replay", () => {
  const feed = recording as LiveFeed;
  const length = feed.blocks.length;

  it("ships a real recording", () => {
    expect(length).toBeGreaterThanOrEqual(12);
    expect(feed.blocks.every((b, i) => i === 0 || b.number > (feed.blocks[i - 1]?.number ?? 0))).toBe(true);
  });

  it("loops with fresh block numbers so merged replays never collide", () => {
    const now = Date.UTC(2026, 9, 28);
    let buffer: LiveBlock[] = replayOpening(feed, 6, now);
    for (let step = 6; step < length * 2 + 3; step += 1) {
      const next = replayBlock(feed, step, now + step * 12_000);
      if (next) buffer = mergeBlocks(buffer, [next], 1000);
    }
    expect(buffer).toHaveLength(length * 2 + 3);
    expect(new Set(buffer.map((b) => b.number)).size).toBe(buffer.length);
    expect(buffer.every((b) => b.activities.every((a) => a.block === b.number))).toBe(true);
  });

  it("opens with blocks a block time apart ending now", () => {
    const now = Date.UTC(2026, 9, 28, 12);
    const opening = replayOpening(feed, 3, now);
    expect(opening.map((b) => b.timestamp)).toEqual([new Date(now).toISOString(), new Date(now - 12_000).toISOString(), new Date(now - 24_000).toISOString()]);
  });
});
