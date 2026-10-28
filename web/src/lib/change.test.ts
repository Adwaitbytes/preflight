import { describe, expect, it } from "vitest";
import recorded from "@/data/samples/change-sn19.json";
import {
  clampEpochs,
  DEFAULT_EPOCH_BLOCKS,
  EPOCH_OPTIONS,
  epochHint,
  formatRank,
  formatSharePercent,
  formatSignificant,
  incentiveDelta,
  longerOptions,
  measuredEpochBlocks,
  rankDelta,
  reasonSentence,
  sinceUpdate,
  supportBars,
  windowLabel,
} from "./change";
import { incentiveChangeSchema } from "./schemas";
import type { NeuronPoint } from "./types";

const change = incentiveChangeSchema.parse(recorded);

function point(overrides: Partial<NeuronPoint>): NeuronPoint {
  return { block: 1, uid: 85, incentive: 0.001, emission: 1, trust: 0, rank_by_emission: 10, miners: 200, ...overrides };
}

describe("epoch options", () => {
  it("offers one epoch, about six hours and about a day on a 360 block tempo", () => {
    expect(EPOCH_OPTIONS.map((o) => o.epochs)).toEqual([1, 5, 20]);
    expect(EPOCH_OPTIONS.map((o) => epochHint(o.epochs))).toEqual(["~1.2 h", "~6 h", "~24 h"]);
  });

  it("keeps the epochs inside what the API accepts", () => {
    expect(clampEpochs(0)).toBe(1);
    expect(clampEpochs(2.7)).toBe(2);
    expect(clampEpochs(500)).toBe(48);
    expect(clampEpochs(Number.NaN)).toBe(1);
  });

  it("measures the subnet's own epoch from a read, so a long tempo is labelled honestly", () => {
    // SN19 runs a 7,200 block tempo: two epochs span two days, not two and a half hours
    expect(measuredEpochBlocks(change, 2)).toBe(7201);
    expect(epochHint(1, 7201)).toBe("~24 h");
    expect(epochHint(20, 7201)).toBe("~20 days");
    expect(measuredEpochBlocks({ from_block: 10, to_block: 10 }, 1)).toBeNull();
    expect(epochHint(1)).toBe(epochHint(1, DEFAULT_EPOCH_BLOCKS));
  });

  it("suggests only longer windows", () => {
    expect(longerOptions(1).map((o) => o.epochs)).toEqual([5, 20]);
    expect(longerOptions(20)).toEqual([]);
  });
});

describe("number formatting", () => {
  it("keeps three significant digits on tiny incentives", () => {
    expect(formatSignificant(0.0009155413138017853)).toBe("0.000916");
    expect(formatSignificant(0.0013275349050125887)).toBe("0.00133");
    expect(formatSignificant(3.921984786)).toBe("3.92");
    expect(formatSignificant(0)).toBe("0");
    expect(formatSignificant(12_345.6)).toBe("12,346");
  });

  it("prints shares the way the API's reasons do", () => {
    expect(formatSharePercent(0.0009920600266179486)).toBe("0.0992%");
    expect(formatSharePercent(0.0018237296505987971)).toBe("0.182%");
    expect(formatSharePercent(0.48123431716926823)).toBe("48.1%");
    expect(formatSharePercent(1)).toBe("100%");
    expect(formatSharePercent(0)).toBe("0%");
  });
});

describe("incentiveDelta", () => {
  it("reads the recorded rise", () => {
    expect(incentiveDelta(change.before, change.after, change.change)).toEqual({ direction: "up", label: "+45%", spoken: "up 45%" });
  });

  it("names a fall, a start from zero, a flat zero and a lost seat", () => {
    expect(incentiveDelta(point({ incentive: 0.002 }), point({ incentive: 0.0014 }), -0.3)).toMatchObject({ direction: "down", label: "-30%" });
    expect(incentiveDelta(point({ incentive: 0 }), point({ incentive: 0.001 }), 1)).toMatchObject({ direction: "up", label: "From zero" });
    expect(incentiveDelta(point({ incentive: 0 }), point({ incentive: 0 }), 0)).toMatchObject({ direction: "flat", label: "Zero at both" });
    expect(incentiveDelta(point({}), point({ uid: null, incentive: 0 }), -1)).toMatchObject({ direction: "down", label: "Seat lost" });
  });

  it("calls a move under 5% steady, as the API's headline does", () => {
    expect(incentiveDelta(point({}), point({ incentive: 0.00103 }), 0.03)).toMatchObject({ direction: "flat", label: "Steady" });
  });

  it("keeps a decimal on small moves and groups large ones", () => {
    expect(incentiveDelta(point({}), point({}), 0.065).label).toBe("+6.5%");
    expect(incentiveDelta(point({}), point({}), 8.666666666666668).label).toBe("+867%");
    expect(incentiveDelta(point({}), point({}), 25).label).toBe("+2,500%");
  });
});

describe("rank", () => {
  it("climbs when the number gets smaller", () => {
    expect(rankDelta(change.before, change.after)).toEqual({ direction: "up", label: "Up 2", spoken: "up 2 places" });
    expect(rankDelta(point({ rank_by_emission: 3 }), point({ rank_by_emission: 4 }))).toMatchObject({ direction: "down", label: "Down 1", spoken: "down 1 place" });
    expect(rankDelta(point({}), point({}))).toMatchObject({ direction: "flat" });
    expect(rankDelta(point({ rank_by_emission: null }), point({}))).toBeNull();
  });

  it("formats an unranked UID", () => {
    expect(formatRank(change.after)).toBe("#22");
    expect(formatRank(point({ rank_by_emission: null }))).toBe("Unranked");
  });
});

describe("supportBars", () => {
  it("scales every validator against the largest move", () => {
    const bars = supportBars(change.drivers);
    expect(bars[0]).toEqual({ direction: "up", width: 1 });
    expect(bars.every((b) => b.direction === "up" && b.width > 0 && b.width <= 1)).toBe(true);
  });

  it("draws cuts on the other side and nothing for a validator that did not move", () => {
    const bars = supportBars([
      { support_before: 0.2, support_after: 0.1 },
      { support_before: 0.1, support_after: 0.15 },
      { support_before: 0.3, support_after: 0.3 },
    ]);
    expect(bars.map((b) => b.direction)).toEqual(["down", "up", "flat"]);
    expect(bars.map((b) => Number(b.width.toFixed(6)))).toEqual([1, 0.5, 0]);
    expect(supportBars([])).toEqual([]);
  });
});

describe("labels", () => {
  it("turns the API's reason clause into a sentence", () => {
    expect(reasonSentence("raised its weight on this UID from 0.0992% to 0.182%")).toBe("Raised its weight on this UID from 0.0992% to 0.182%");
    expect(reasonSentence("  ")).toBe("");
  });

  it("says how long ago a validator last set weights", () => {
    expect(sinceUpdate(2909)).toBe("2,909 blocks ago, ~9.7 h");
    expect(sinceUpdate(1)).toBe("1 block ago, ~12 s");
    expect(sinceUpdate(0)).toBe("this block");
  });

  it("names the window the comparison spans", () => {
    expect(windowLabel(change)).toBe("Blocks 9,366,277 to 9,380,679, ~2 days apart");
  });
});
