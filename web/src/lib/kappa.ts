/**
 * The yes or no question PF110 asks of Yuma Consensus: did validators holding at least kappa of
 * the validator stake put weight on this miner? Mirrors `pf110_incentive_zero_but_weighted` in
 * src/preflight/core/doctor/rules_miner.py. The real epoch clips each weight to the largest value
 * kappa of stake supports (https://www.bittensor.com/docs/internals/consensus), so this is a
 * simplified model of it, used by the guide's consensus widget.
 */

export interface StakeVote {
  /** Stake weight of one permitted validator, in alpha */
  stake: number;
  /** Whether its latest weights put a non zero weight on the miner */
  weights: boolean;
}

/** `unweighted` is PF108's territory: nobody scored the miner, so there is nothing to clip */
export type ClipStatus = "unweighted" | "clipped" | "survives";

export interface ClipResult {
  status: ClipStatus;
  /** Share of validator stake that weighted the miner, 0 to 1 */
  share: number;
  weightedStake: number;
  totalStake: number;
  /** The kappa the result was judged against, clamped to 0 to 1 */
  kappa: number;
}

function checkedStake(vote: StakeVote): number {
  if (!Number.isFinite(vote.stake) || vote.stake < 0) {
    throw new RangeError(`Validator stake must be a finite number of at least 0, got ${vote.stake}`);
  }
  return vote.stake;
}

function sums(votes: readonly StakeVote[]): { weighted: number; total: number } {
  let weighted = 0;
  let total = 0;
  for (const vote of votes) {
    const stake = checkedStake(vote);
    total += stake;
    if (vote.weights) weighted += stake;
  }
  return { weighted, total };
}

/** Stake that weighted the miner over all permitted validator stake; 0 when there is no stake */
export function weightedStakeShare(votes: readonly StakeVote[]): number {
  const { weighted, total } = sums(votes);
  return total > 0 ? weighted / total : 0;
}

export function clipOutcome(votes: readonly StakeVote[], kappa: number): ClipResult {
  if (Number.isNaN(kappa)) throw new RangeError("kappa must be a number between 0 and 1");
  const threshold = Math.min(1, Math.max(0, kappa));
  const { weighted, total } = sums(votes);
  const share = total > 0 ? weighted / total : 0;
  const status: ClipStatus = !votes.some((v) => v.weights) ? "unweighted" : share >= threshold ? "survives" : "clipped";
  return { status, share, weightedStake: weighted, totalStake: total, kappa: threshold };
}
