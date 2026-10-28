# 007 Epoch Lab: the next epoch, computed off-chain and checked against the chain

Date: 2026-10-29

## Why not a fork

A Chopsticks fork runs the real runtime, but building a block on a fork that lazy-loads from the
public finney endpoint stalled: `dev_newBlock` ran for over 8 minutes at 1.6% CPU waiting on
storage pages the endpoint load-sheds (measured 2026-10-29, fork at block 9,384,834). An epoch
needs a block. Forks fed from a full state snapshot report 30 to 90 s per block and about 90 s
per triggered epoch. Neither fits a web page or a chat reply.

## What instead

`src/preflight/core/epoch/yuma.py` ports `epoch_dense_mechanism` from
`pallets/subtensor/src/epoch/run_epoch.rs` up to the incentive vector, and `weighted_median`
from `epoch/math.rs`: activity cutoff, the weights-min-stake filter, permits, active stake,
self-weight and outdated-weight masks, row normalization, the stake-weighted median at kappa,
clipping, ranks. Floats stand in for I32F32. It reads one subnet snapshot, the same one the
Doctor reads, so a preview costs one snapshot read (1 to 3.4 s) and every what-if after it is
free. The API caches the snapshot for 60 s and shares it across previews and what-ifs.

## Measured against the chain

State at block E-1, epoch at E (`LastMechansimStepBlock`), compared with `Incentive` at E:

| Subnet | UIDs within one u16 step | Note |
|---|---|---|
| SN1, SN3, SN8, SN9, SN19, SN56, SN64 | 256 of 256 | |
| SN4 | 254 of 256, largest gap 2 steps | |
| SN51 | 245 of 256, 0.25% of incentive in total | commit-reveal: a validator's sealed weights opened in the epoch block, after the state read |

SN19 and SN64 are recorded in `tests/fixtures/epochs/finney/` and must match exactly in CI;
SN51 is recorded to keep the gap explained. Every preview page also calls
`/v1/epoch/{network}/{netuid}/check`, which repeats the comparison for the subnet's latest epoch.

## A forecast scored against what the chain then paid

A preview of SN64 recorded at block 9,385,153 (`web/src/data/samples/epoch-sn64.json`), 90 blocks
before the epoch, against the `Incentive` stored when it ran at block 9,385,243: 243 of 256 UIDs
exact, 0.136% of incentive different in total. The gap is validators setting new weights after
the forecast was read, which is why every preview says it holds "if validators keep their
current weights". Reproducing that same epoch from the block before it matched all 256 UIDs.

## Limits, stated where they apply

- Incentive only. Dividends depend on bonds (Yuma3, liquid alpha) and are not computed yet
- Commit-reveal subnets: sealed commits are encrypted until revealed, so validators count with
  the weights they last revealed; the preview says how many commits are waiting
- `get_next_epoch_start_block` returns last epoch plus tempo, which is the block the epoch runs in: SN64's ran at 9,385,243, the value it returned
