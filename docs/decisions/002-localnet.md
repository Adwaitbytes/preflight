# 002 Local subnet dev kit

Date: 2026-10-28, Day 2. Measured on bittensor 11.3.0, `ghcr.io/raofoundation/subtensor-localnet:devnet` (runtime spec **484**, not the 482 in BUILD.md section 4), Docker Desktop on an Apple silicon laptop

## Question

How `preflight local up` and `preflight local break <scenario>` build a working subnet and each Doctor failure on a fresh localnet, and how long that takes

## What we measured

### The chain

| What | Value |
|---|---|
| Container start to first block over RPC | 6.1 to 7.9 s |
| Block time | 0.29 s (34 blocks in 10 s); the image runs the fast runtime |
| State kept by the node | about 256 blocks. A read 300 blocks back fails with "State discarded ... use an archive node" |
| Archive mode | not available without overriding the entrypoint: `/scripts/localnet.sh` passes no extra flags to `node-subtensor` |
| Drand | unreachable from the container (`Drand: HTTP Deadline Reached` in the logs), so timelocked commits never reveal |
| Default `MaxAllowedUids`, `MinAllowedUids`, `MinNonImmuneUids`, `ImmunityPeriod` | 256, 64, 10, 5000 |
| Default `StakeThreshold`, `SubnetLimit` | 0, 128 |
| Effective activity cutoff | `tempo x ActivityCutoffFactorMilli / 1000`. The hyperparameters API reported 277 at tempo 20 while storage `ActivityCutoff` still said 5000 |

### Submitting

| What | Wait for finalization (Crucible) | Wait for inclusion only (Preflight) |
|---|---|---|
| `burned_register` | about 4 s | 0.26 s |
| `force_set_balance` via sudo | about 2 s | 0.05 s |

Inclusion is enough here: every later read polls until the effect is visible, so `Harness` defaults to `finalize=False`.

### `up` (3 miners, 2 validators, tempo 100): 69.6 s

| Step | Elapsed |
|---|---|
| Fresh container | 6.1 s |
| Subnet created, configured, started | 10.0 s |
| 5 neurons funded and registered | 14.0 s |
| Validators staked (1,000 TAO each) | 14.8 s |
| Validator permits (waits for an epoch) | 38.8 s |
| Weights set | 39.3 s |
| Every miner earns incentive (next epoch) | 69.6 s |

The default tempo is 100 because a validator nobody restarts crosses the activity cutoff after about 1,389 blocks, roughly 7 minutes. At tempo 20 that would happen after 80 s. Only staked hotkeys receive permits: miners with zero stake never do, even with 64 permit slots, so the Doctor classifies them as miners.

### Scenarios

Scenarios that change a subnet-wide parameter would spoil each other on one subnet. For example, commit reveal suppresses PF203, the rate limit blocks every later `set_weights`, and a short activity cutoff makes every validator stale. Those four scenarios each create a small scratch subnet (tempo 20) and record its netuid in `state.json`. The rest add neurons to the main subnet. `StakeThreshold` is global, so `low-stake-validator` puts the threshold between its own stake and the smallest other validator's.

| Scenario | Where | Time | Doctor findings on the target |
|---|---|---|---|
| `unserved-axon` | main | 0.4 s | PF105 high, PF108 medium, PF103 info |
| `loopback-axon` | main | 1.0 s | PF106 high, PF108 medium, PF103 info |
| `no-weight-miner` | main | 1.5 s | PF108 medium (immune), PF103 info |
| `low-stake-validator` | main | 28.2 s | PF204 high, PF305 high |
| `stale-validator` | scratch | 21.6 s | PF202 critical, PF305 high |
| `rate-limited-validator` | scratch | 9.4 s | PF203 info |
| `pending-reveal` | scratch | 9.7 s | PF205 info |
| `deregistered-miner` | scratch | 7.2 s | PF101 critical, PF302 medium (**expected PF102**, see below) |

The full localnet suite (`uv run pytest tests/localnet -m chain -x -v`) took 151 s: 15 passed and 1 strict xfail.

## New quirks

- **`127.0.0.1` never reaches a block.** The runtime refuses it during transaction pool validation (`InvalidIpAddress`), in the same block it was sent, so there is no block number or extrinsic index to point at. The `loopback-axon` break sends it through `prepare_call`, signs it and submits it with `submit_signature`. It then keeps the extrinsic hash it computes (blake2b-256 of the length-prefixed v4 body), the call data, the signer, the nonce and the head block. The same code path computed the hash of the LAN-address fix, and that hash matched the bytes at its block and index, so the rejected hash is computed correctly too
- **The activity cutoff floor applies only to the direct setter.** `sudo_set_activity_cutoff(30)` fails with "Activity cutoff is being set too low" (`MinActivityCutoff` is 360). `sudo_set_activity_cutoff_factor(2000)` is accepted and gives an effective cutoff of 40 blocks at tempo 20
- **The UID cap needs its floor lowered first.** `sudo_set_max_allowed_uids` below `MinAllowedUids` (64) fails with "The maximum allowed UIDs must be greater than the minimum allowed UIDs". Lower `MinAllowedUids` first. After that, a registration into a full subnet prunes the lowest-emission neuron outside immunity, as expected
- **The SDK checks the weights rate limit before signing.** A retry inside the limit never reaches the chain: "Weights on netuid 4 were last set 1 blocks ago; the rate limit is 3600 blocks"
- **Inner sudo failures surface on their own.** The SDK decodes the nested `Sudid` result, so a failed inner call comes back as `success=False` with the inner error's message. Scanning events is not needed

## A rule that cannot fire on localnet: PF102

`deregistered-miner` produces the right chain state: the victim held UID 1 at block 462 and has no UID at block 467. The Doctor still reports PF101, not PF102. `find_deregistration` (`core/chain/snapshot.py`) starts by reading `Uids` at `low = max(1, head - 21600)`. It returns `None` unless the hotkey held a UID at that block. Two separate problems follow:

1. Unless a chain is older than 21,600 blocks (about 1.7 h at 0.29 s per block), `low` falls before the subnet existed, so the hotkey cannot hold a UID there. This applies on any network for a hotkey that registered less than 21,600 blocks ago
2. Nodes that are not archive nodes, this localnet included, discard state older than about 256 blocks. The first read raises "State discarded" and the function returns `None`

Suggested fix (not applied; out of scope): walk back from the head (1, 2, 4, 8, ... blocks) until a block shows the hotkey with a UID or the state runs out. Then binary search between that block and the next one walked. This makes PF102 work for any deregistration still within the node's history, which is about 256 blocks (75 s) on this localnet. `tests/localnet/test_local_kit.py::test_deregistered_miner_makes_the_doctor_report_pf102` is a strict xfail, so it fails loudly once this is fixed and the marker should come off.
