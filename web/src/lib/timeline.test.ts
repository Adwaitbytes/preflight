import { describe, expect, it } from "vitest";
import { detailClauses, segmentWeight, timelineColumns } from "./timeline";

describe("segmentWeight", () => {
  it("grows with the gap but stays readable for zero and huge gaps", () => {
    expect(segmentWeight(0)).toBe(1);
    expect(segmentWeight(null)).toBe(1);
    expect(segmentWeight(361)).toBeCloseTo(2.569, 3);
    expect(segmentWeight(431_639)).toBeCloseTo(5.635, 3);
    expect(segmentWeight(-5)).toBe(1);
  });
});

describe("timelineColumns", () => {
  it("sizes each step by the gap to the next one", () => {
    expect(timelineColumns([9378690, 9378690, 9379051, 9810690])).toBe(
      "minmax(9.5rem,1.000fr) minmax(9.5rem,2.569fr) minmax(9.5rem,5.635fr) minmax(9.5rem,1.000fr)",
    );
  });

  it("treats an unknown block as a short segment", () => {
    expect(timelineColumns([null, 100])).toBe("minmax(9.5rem,1.000fr) minmax(9.5rem,1.000fr)");
  });
});

describe("detailClauses", () => {
  it("splits the derivation into capitalised clauses", () => {
    expect(detailClauses("Locks 345 TAO at block 9,377,656; the cost falls by about 0.0078 TAO per block;  each registration doubles the cost")).toEqual([
      "Locks 345 TAO at block 9,377,656",
      "The cost falls by about 0.0078 TAO per block",
      "Each registration doubles the cost",
    ]);
  });
});
