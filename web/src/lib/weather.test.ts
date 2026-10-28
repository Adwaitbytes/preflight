import { describe, expect, it } from "vitest";
import recorded from "@/data/samples/weather.json";
import { weatherSchema } from "./schemas";
import { kindMix, sky, subnetBars, windowMinutes } from "./weather";

const weather = weatherSchema.parse(recorded);

describe("sky", () => {
  it("reads ordinary failure rates as clear and broad failure as stormy", () => {
    expect(sky(0)).toBe("clear");
    expect(sky(0.013)).toBe("clear");
    expect(sky(0.02)).toBe("unsettled");
    expect(sky(0.08)).toBe("stormy");
    expect(sky(Number.NaN)).toBe("clear");
  });
});

describe("kindMix", () => {
  it("orders the recorded window's kinds largest first and sums to one", () => {
    const mix = kindMix(weather.by_kind);
    expect(mix.length).toBeGreaterThan(2);
    expect(mix.map((m) => m.count)).toEqual([...mix.map((m) => m.count)].sort((a, b) => b - a));
    expect(mix.reduce((sum, m) => sum + m.share, 0)).toBeCloseTo(1);
  });

  it("is empty for an empty window and ignores unknown kinds", () => {
    expect(kindMix({})).toEqual([]);
    expect(kindMix({ mystery: 4, stake: 1 })).toEqual([{ kind: "stake", count: 1, share: 0.2 }]);
  });
});

describe("helpers", () => {
  it("turns blocks into minutes and scales subnet bars to the busiest", () => {
    expect(windowMinutes(60)).toBe(12);
    expect(subnetBars([[64, 30], [13, 15]])).toEqual([
      { netuid: 64, count: 30, width: 1 },
      { netuid: 13, count: 15, width: 0.5 },
    ]);
    expect(subnetBars([])).toEqual([]);
  });
});
