import { describe, expect, it } from "vitest";
import { clipOutcome, weightedStakeShare, type StakeVote } from "./kappa";

// The five largest SN64 validators at finney block 9,376,730 (doctor_broken_miner.json, PF108 evidence)
const SN64: StakeVote[] = [
  { stake: 1_385_417, weights: false },
  { stake: 907_925, weights: false },
  { stake: 765_922, weights: true },
  { stake: 336_362, weights: true },
  { stake: 205_685, weights: true },
];

describe("weightedStakeShare", () => {
  it("is the stake that weighted the miner over all validator stake", () => {
    expect(weightedStakeShare(SN64)).toBeCloseTo(1_307_969 / 3_601_311, 10);
  });
  it("is 0 when nobody weights the miner", () => {
    expect(weightedStakeShare(SN64.map((v) => ({ ...v, weights: false })))).toBe(0);
  });
  it("is 1 when everyone weights the miner", () => {
    expect(weightedStakeShare(SN64.map((v) => ({ ...v, weights: true })))).toBe(1);
  });
  it("is 0 when the validator set holds no stake, instead of dividing by zero", () => {
    expect(weightedStakeShare([{ stake: 0, weights: true }])).toBe(0);
    expect(weightedStakeShare([])).toBe(0);
  });
  it("rejects stake that is negative or not a number", () => {
    expect(() => weightedStakeShare([{ stake: -1, weights: true }])).toThrow(RangeError);
    expect(() => weightedStakeShare([{ stake: Number.NaN, weights: true }])).toThrow(RangeError);
    expect(() => weightedStakeShare([{ stake: Number.POSITIVE_INFINITY, weights: true }])).toThrow(RangeError);
  });
});

describe("clipOutcome, mirroring PF110", () => {
  it("clips when the weighting stake share is below kappa", () => {
    const result = clipOutcome(SN64, 0.5);
    expect(result.status).toBe("clipped");
    expect(result.share).toBeCloseTo(0.3632, 4);
    expect(result.weightedStake).toBe(1_307_969);
    expect(result.totalStake).toBe(3_601_311);
  });
  it("survives once enough stake agrees", () => {
    const withLargest = SN64.map((v, i) => (i === 0 ? { ...v, weights: true } : v));
    expect(clipOutcome(withLargest, 0.5).status).toBe("survives");
  });
  it("survives at exactly kappa, because PF110 only fires when the share is below it", () => {
    const even: StakeVote[] = [
      { stake: 50, weights: true },
      { stake: 50, weights: false },
    ];
    expect(clipOutcome(even, 0.5).status).toBe("survives");
    expect(clipOutcome(even, 0.51).status).toBe("clipped");
  });
  it("reports unweighted, not clipped, when no validator weights the miner (that is PF108)", () => {
    const nobody = SN64.map((v) => ({ ...v, weights: false }));
    expect(clipOutcome(nobody, 0).status).toBe("unweighted");
    expect(clipOutcome(nobody, 0.5).status).toBe("unweighted");
  });
  it("counts a validator with zero stake as unweighted support", () => {
    const dust: StakeVote[] = [
      { stake: 0, weights: true },
      { stake: 10, weights: false },
    ];
    const result = clipOutcome(dust, 0.5);
    expect(result.status).toBe("clipped");
    expect(result.share).toBe(0);
  });
  it("lets any weighted miner through at kappa 0 and nobody short of everyone at kappa 1", () => {
    expect(clipOutcome(SN64, 0).status).toBe("survives");
    expect(clipOutcome(SN64, 1).status).toBe("clipped");
    expect(clipOutcome(SN64.map((v) => ({ ...v, weights: true })), 1).status).toBe("survives");
  });
  it("clamps kappa into 0 to 1 and rejects a kappa that is not a number", () => {
    expect(clipOutcome(SN64, 1.7).kappa).toBe(1);
    expect(clipOutcome(SN64, -0.2).kappa).toBe(0);
    expect(() => clipOutcome(SN64, Number.NaN)).toThrow(RangeError);
  });
});
