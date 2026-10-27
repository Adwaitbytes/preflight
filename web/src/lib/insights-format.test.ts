import { describe, expect, it } from "vitest";
import { burnTrend, formatHours, formatPayback, formatPerDay, formatRate, relativeWidths, sparkPath, splitHeadline, trendLabel } from "./insights-format";

describe("formatPerDay", () => {
  it("keeps two decimals from one up, matching the API's own prose", () => {
    expect(formatPerDay(34.9755757523381)).toBe("34.98");
    expect(formatPerDay(6.1849312793113365)).toBe("6.18");
    expect(formatPerDay(457.355504901939)).toBe("457.36");
  });
  it("trims trailing zeros", () => {
    expect(formatPerDay(30.803591637001574)).toBe("30.8");
    expect(formatPerDay(0.5)).toBe("0.5");
    expect(formatPerDay(20)).toBe("20");
  });
  it("keeps three significant digits below one", () => {
    expect(formatPerDay(0.06491390155387738)).toBe("0.0649");
    expect(formatPerDay(0.004642513568522486)).toBe("0.00464");
    expect(formatPerDay(0.0005)).toBe("0.0005");
  });
  it("groups thousands without decimals", () => {
    expect(formatPerDay(2068.895429471468)).toBe("2,069");
  });
  it("shows a floor instead of rounding a real amount to zero", () => {
    expect(formatPerDay(0.00001)).toBe("<0.0001");
    expect(formatPerDay(0)).toBe("0");
    expect(formatPerDay(Number.NaN)).toBe("n/a");
  });
});

describe("formatRate", () => {
  it("rounds big rates and keeps one decimal for small ones", () => {
    expect(formatRate(20)).toBe("20");
    expect(formatRate(128.57142857142858)).toBe("129");
    expect(formatRate(2.5)).toBe("2.5");
    expect(formatRate(3)).toBe("3");
  });
});

describe("formatHours", () => {
  it("keeps one decimal of an hour, matching the chain notes", () => {
    expect(formatHours(16.666666666666668)).toBe("16.7 h");
    expect(formatHours(25.066666666666666)).toBe("25.1 h");
    expect(formatHours(24)).toBe("24 h");
    expect(formatHours(1.2)).toBe("1.2 h");
  });
  it("switches to minutes under an hour and days from two days", () => {
    expect(formatHours(0.18666666666666665)).toBe("11 min");
    expect(formatHours(0.001)).toBe("1 min");
    expect(formatHours(72)).toBe("3 days");
  });
});

describe("formatPayback", () => {
  it("says when there is no estimate", () => {
    expect(formatPayback(null)).toBe("No estimate");
  });
  it("collapses anything under a day", () => {
    expect(formatPayback(8.0841641955264e-5)).toBe("Under a day");
  });
  it("uses the shared duration format from a day up", () => {
    expect(formatPayback(7.702510371911768)).toBe("7.7 days");
    expect(formatPayback(1.5)).toBe("36 h");
    expect(formatPayback(42.2)).toBe("42 days");
  });
});

describe("splitHeadline", () => {
  it("splits at the first semicolon and capitalises the rest", () => {
    expect(splitHeadline("3 of 19 seats need attention; the worst: UID 82 on SN26 earns nothing")).toEqual({
      lead: "3 of 19 seats need attention",
      rest: "The worst: UID 82 on SN26 earns nothing",
    });
  });
  it("falls back to the first colon when there is no semicolon", () => {
    expect(splitHeadline("SN26 Perturb burns its miner emission today: validators weight the owner's UID")).toEqual({
      lead: "SN26 Perturb burns its miner emission today",
      rest: "Validators weight the owner's UID",
    });
  });
  it("leaves a single clause alone", () => {
    expect(splitHeadline("All 5 seats look healthy")).toEqual({ lead: "All 5 seats look healthy", rest: null });
  });
  it("does not split off a fragment too short to stand alone", () => {
    expect(splitHeadline("Note: this coldkey owns no hotkeys")).toEqual({ lead: "Note: this coldkey owns no hotkeys", rest: null });
  });
});

describe("burnTrend", () => {
  it("reports the change from the first to the last read", () => {
    const trend = burnTrend([
      [100, 0.5],
      [200, 0.55],
      [460, 0.6],
    ]);
    expect(trend).toMatchObject({ first: 0.5, last: 0.6, blocks: 360 });
    expect(trend?.change).toBeCloseTo(0.2);
  });
  it("needs two points", () => {
    expect(burnTrend([[100, 0.5]])).toBeNull();
    expect(burnTrend([])).toBeNull();
  });
  it("has no ratio when the burn started at zero", () => {
    expect(burnTrend([
      [1, 0],
      [2, 1],
    ])?.change).toBeNull();
  });
});

describe("trendLabel", () => {
  it("describes flat, rising and falling burns over the window", () => {
    expect(trendLabel({ first: 0.5, last: 0.5, change: 0, blocks: 2880 })).toBe("Flat over 9.6 h");
    expect(trendLabel({ first: 0.5, last: 0.6, change: 0.2, blocks: 2880 })).toBe("Up 20% over 9.6 h");
    expect(trendLabel({ first: 1, last: 0.955, change: -0.045, blocks: 7200 })).toBe("Down 4.5% over 24 h");
    expect(trendLabel({ first: 0, last: 1, change: null, blocks: 300 })).toBe("Up from 0 over 1 h");
  });
});

describe("sparkPath", () => {
  it("draws a flat series through the middle", () => {
    expect(sparkPath([0.5, 0.5, 0.5], 100, 20, 2)).toBe("M2.0,10.0 L50.0,10.0 L98.0,10.0");
  });
  it("puts the lowest value at the bottom and the highest at the top", () => {
    expect(sparkPath([1, 3], 100, 20, 2)).toBe("M2.0,18.0 L98.0,2.0");
  });
  it("draws nothing for an empty series", () => {
    expect(sparkPath([], 100, 20, 2)).toBe("");
  });
});

describe("relativeWidths", () => {
  it("scales every value against the largest", () => {
    expect(relativeWidths([1, 2, 4])).toEqual([0.25, 0.5, 1]);
  });
  it("returns zeros when nothing is positive", () => {
    expect(relativeWidths([0, 0])).toEqual([0, 0]);
  });
});
