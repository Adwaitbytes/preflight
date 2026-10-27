import { describe, expect, it } from "vitest";
import { formatAmount, formatBlockIndex, formatDuration, formatShare, formatTao, pluralize, truncateMiddle } from "./format";

describe("truncateMiddle", () => {
  it("keeps both ends of an address", () => {
    expect(truncateMiddle("5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq", 6, 4)).toBe("5EKtvz...Qmhq");
  });
  it("leaves short values alone", () => {
    expect(truncateMiddle("5EKtvz", 6, 4)).toBe("5EKtvz");
  });
});

describe("formatAmount", () => {
  it("groups large values without decimals", () => {
    expect(formatAmount(1385416.969363297)).toBe("1,385,417");
  });
  it("keeps three significant digits below one", () => {
    expect(formatAmount(0.402097378)).toBe("0.402");
    expect(formatAmount(0.000629364, 6)).toBe("0.000629");
  });
  it("shows a floor instead of rounding tiny values to zero", () => {
    expect(formatAmount(0.000000001)).toBe("<0.0001");
  });
  it("renders zero as 0", () => {
    expect(formatAmount(0)).toBe("0");
  });
  it("labels TAO", () => {
    expect(formatTao(352.09906748)).toBe("352.099 TAO");
  });
});

describe("formatShare", () => {
  it("formats a 0..1 share as a percentage", () => {
    expect(formatShare(0.158)).toBe("15.8%");
    expect(formatShare(0.00001, 2)).toBe("<0.01%");
    expect(formatShare(0)).toBe("0%");
  });
});

describe("formatDuration", () => {
  it("turns blocks into a short duration at 12 s per block", () => {
    expect(formatDuration(3)).toBe("36 s");
    expect(formatDuration(18)).toBe("4 min");
    expect(formatDuration(360)).toBe("1.2 h");
    expect(formatDuration(14400)).toBe("2 days");
    expect(formatDuration(432000)).toBe("60 days");
  });
});

describe("small helpers", () => {
  it("pads the extrinsic index like explorers do", () => {
    expect(formatBlockIndex(9376574, 3)).toBe("9376574-0003");
  });
  it("pluralizes with grouped counts", () => {
    expect(pluralize(1, "rule")).toBe("1 rule");
    expect(pluralize(1200, "block")).toBe("1,200 blocks");
  });
});
