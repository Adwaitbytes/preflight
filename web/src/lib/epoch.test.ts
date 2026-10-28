import { describe, expect, it } from "vitest";
import { buildWhatIf, consensusCut, countdown, epochDelta, epochHref, parseWeightRow } from "./epoch";

describe("epochDelta", () => {
  it("names drops, starts and steady moves in words", () => {
    expect(epochDelta({ incentive_now: 0.01, incentive_next: 0, change: -1 }).label).toBe("Drops to zero");
    expect(epochDelta({ incentive_now: 0, incentive_next: 0.02, change: 1 }).label).toBe("New");
    expect(epochDelta({ incentive_now: 0, incentive_next: 0, change: 0 }).label).toBe("Zero");
    expect(epochDelta({ incentive_now: 0.1, incentive_next: 0.1005, change: 0.005 }).label).toBe("Steady");
    expect(epochDelta({ incentive_now: 0.1, incentive_next: 0.134, change: 0.34 })).toEqual({ direction: "up", label: "+34%", spoken: "up 34%" });
    expect(epochDelta({ incentive_now: 0.1, incentive_next: 0.095, change: -0.05 }).label).toBe("-5%");
  });
});

describe("parseWeightRow", () => {
  it("reads JSON and uid: weight lines alike", () => {
    expect(parseWeightRow('{"12": 0.4, "31": 0.6}')).toEqual({ ok: true, row: { "12": 0.4, "31": 0.6 }, uids: 2 });
    expect(parseWeightRow("12: 3\n31=1, 7 0")).toEqual({ ok: true, row: { "12": 3, "31": 1 }, uids: 2 });
  });

  it("refuses rows the epoch cannot use, in words", () => {
    expect(parseWeightRow("")).toMatchObject({ ok: false, error: "Add at least one uid: weight pair" });
    expect(parseWeightRow("{oops")).toMatchObject({ ok: false, error: "That JSON does not parse" });
    expect(parseWeightRow("[1, 2]")).toMatchObject({ ok: false });
    expect(parseWeightRow("twelve: 1")).toMatchObject({ ok: false });
    expect(parseWeightRow('{"4": -1}')).toMatchObject({ ok: false, error: "The weight for UID 4 must be a number of 0 or more" });
    expect(parseWeightRow("4: 0")).toMatchObject({ ok: false, error: "Every weight is zero; give at least one UID a weight" });
  });
});

describe("buildWhatIf", () => {
  it("sends only what differs from live state", () => {
    expect(buildWhatIf({ kappa: 0.5, offline: [], tested: null }, 0.5)).toEqual({ ok: true, whatif: null });
    expect(buildWhatIf({ kappa: 0.3, offline: [9, 3], tested: { uid: 3, text: "12: 1" } }, 0.5)).toEqual({
      ok: true,
      whatif: { kappa: 0.3, drop_validators: [3, 9], weights: { "3": { "12": 1 } } },
    });
    expect(buildWhatIf({ kappa: 0.5, offline: [], tested: { uid: 3, text: "nope" } }, 0.5)).toMatchObject({ ok: false });
  });
});

describe("helpers", () => {
  it("weighs the consensus cut by support", () => {
    expect(consensusCut({ miners: [] })).toBe(0);
    const miner = { uid: 1, hotkey: "", incentive_now: 0, incentive_next: 0, change: 0, validators: 1, reason: "" };
    expect(consensusCut({ miners: [{ ...miner, support: 0.75, clipped: 0 }, { ...miner, support: 0.25, clipped: 0.4 }] })).toBeCloseTo(0.1);
  });

  it("formats links and countdowns", () => {
    expect(epochHref("finney", 19)).toBe("/epoch/finney/19");
    expect(epochHref("finney", 19, "5F a")).toBe("/epoch/finney/19?hotkey=5F%20a");
    expect(countdown(0)).toBe("now");
    expect(countdown(1800)).toBe("in 30 min");
    expect(countdown(84_600)).toBe("in 23.5 h");
    expect(countdown(3 * 86_400)).toBe("in 3 days");
  });
});
