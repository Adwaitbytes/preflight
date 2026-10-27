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

The full localnet suite (`uv run pytest tests/localnet -m chain -v`, 29 tests including the fixes) took 191 s on a fresh container, all passing.

## New quirks

- **`127.0.0.1` never reaches a block.** The runtime refuses it during transaction pool validation (`InvalidIpAddress`), in the same block it was sent, so there is no block number or extrinsic index to point at. The `loopback-axon` break sends it through `prepare_call`, signs it and submits it with `submit_signature`. It then keeps the extrinsic hash it computes (blake2b-256 of the length-prefixed v4 body), the call data, the signer, the nonce and the head block. The same code path computed the hash of the LAN-address fix, and that hash matched the bytes at its block and index, so the rejected hash is computed correctly too
- **The activity cutoff floor applies only to the direct setter.** `sudo_set_activity_cutoff(30)` fails with "Activity cutoff is being set too low" (`MinActivityCutoff` is 360). `sudo_set_activity_cutoff_factor(2000)` is accepted and gives an effective cutoff of 40 blocks at tempo 20
- **The UID cap needs its floor lowered first.** `sudo_set_max_allowed_uids` below `MinAllowedUids` (64) fails with "The maximum allowed UIDs must be greater than the minimum allowed UIDs". Lower `MinAllowedUids` first. After that, a registration into a full subnet prunes the lowest-emission neuron outside immunity, as expected
- **The SDK checks the weights rate limit before signing.** A retry inside the limit never reaches the chain: "Weights on netuid 4 were last set 1 blocks ago; the rate limit is 3600 blocks"
- **Inner sudo failures surface on their own.** The SDK decodes the nested `Sudid` result, so a failed inner call comes back as `success=False` with the inner error's message. Scanning events is not needed

## PF102 after the lead's rewrite

`find_deregistration` now gallops back from the head in doubling steps and then binary searches. `deregistered-miner` reports PF102 and the strict xfail is gone. The search only reaches back as far as the node keeps state, about 256 blocks (75 s). A victim diagnosed about 300 blocks after it was pruned showed PF101 again on this localnet.

## Fixes and wallets (`preflight local fix <scenario>`)

Every neuron the kit creates has a password-less bittensor wallet at `.preflight/local/wallets/<name>/`, with key files at mode 0600, and its name is recorded in `LocalNeuron.wallet`. The Doctor's own fix runs unchanged with the wallet flags added, for example:

```
uv run btcli axon set --netuid 2 --ip ::ffff:127.0.0.1 --port 8192 --network local --wallet-path .preflight/local/wallets --wallet loopback-miner --no-prompt
```

That landed at extrinsic `230-0002`, and the next diagnosis no longer reported PF106.

| Scenario | Fix | Ran as typed |
|---|---|---|
| `unserved-axon`, `loopback-axon` | `btcli axon set ... --ip ::ffff:127.0.0.1` | yes |
| `no-weight-miner` | `btcli weights set` from `validator-1`, including the miner | yes |
| `low-stake-validator` | `btcli stake add ... --no-mev-shield` | yes |
| `stale-validator` | `btcli weights set` | yes |
| `rate-limited-validator` | sudo sets `WeightsSetRateLimit` back to 0, in place of waiting 3,600 blocks; then `btcli weights set` | yes |
| `deregistered-miner` | the reported command is `btcli subnets register`; the kit submits the raw `burned_register` | **no** |
| `pending-reveal` | none: reveal needs drand, which the container cannot reach | no |

### btcli and the MEV shield on localnet

- `btcli stake add` is shielded by default. On localnet the decrypted extrinsic was "not included before its era expired". It lands with `--no-mev-shield`, so the Doctor's PF201 and PF204 commands (`btcli stake add ...`) fail on localnet as printed
- `btcli subnets register` and `btcli call SubtensorModule.burned_register` force the shield and refuse `--no-mev-shield` ("burned_register must be submitted MEV-shielded"). The shielded attempt failed with `AncientBirthBlock`. So no btcli command can register on localnet, and the PF101 and PF102 fix (`btcli subnets register`) cannot succeed there

## A Doctor read in the same process can trail a write by a block

Each SDK client follows its own new-head subscription. Right after a write, a second client in the same process, such as the Doctor's pooled one, pinned the block before the write in 3 of 3 trials, for up to 0.6 s. The diagnosis then showed the state from before the break. `up`, `break` and `fix` now wait until the chain is two blocks past their last write before returning (about 0.6 s). `test_doctor_in_the_same_process_sees_a_break_as_soon_as_it_returns` failed 3 of 3 before that change. Separate CLI invocations never hit this.

## Validator permits on a small subnet

- A permit needs stake at or above `StakeThreshold`. One epoch after `low-stake-validator` raised the threshold, the validator's permit was gone (`validator_permit=False`, stake 1.33 alpha). A rerun therefore must not wait for a permit
- With 64 permit slots and 6 UIDs, every UID that holds stake gets a permit. Miners earn alpha from emissions: `miner-1` went from 0 to 7.86 alpha in a few epochs, and by block 916 every UID had a permit. From then on the Doctor classifies the kit's miners as validators (`is_validator` reads the permit): it runs validator rules on them, reports PF202 and PF305 against them, and stops running PF105 to PF111. The tests only pass because they diagnose right after the first scored epoch. The same applies to any real subnet with fewer UIDs than `MaxAllowedValidators`. Two possible fixes, for the lead to decide: classify a permitted UID as a validator only when it has a weights row or meets `StakeThreshold`; or have `up` cap `MaxAllowedValidators` at the validator count, which would hide this on localnet without fixing it

## `preflight new` on the kit

Scaffolded `demo-subnet` into a scratch directory. `uv sync` and its 2 tests passed. The miner ran as `miner-1` and the validator as `validator-1`, using `WALLET`, `HOTKEY` and `WALLET_PATH` pointed at the kit's wallets, so no extra hotkeys were needed.

- **Template bug, `package/miner.py` line 38:** `uvicorn.run(app, host="::", ...)` listens IPv6-only, because asyncio sets `IPV6_V6ONLY` on IPv6 listeners. `[::1]:8091` answered, while `127.0.0.1:8091` and the advertised `[::ffff:127.0.0.1]:8091` were refused. The validator scored every miner 0, `normalize` returned `{}`, and it never set weights. Fix: `uvicorn.run(app, host="0.0.0.0", port=settings.miner_port)`. With that one change, signed queries returned 200 and the validator's weights landed (`validator-1` row `{3: 1.0}`, `LastUpdate` 703)
- **Template UX, `package/validator.py`:** a round in which no miner answers prints nothing, and the `print` output is block-buffered when stdout is a file, so the log stayed empty for minutes. Suggest `print(..., flush=True)` and a line such as "no miner answered correctly; not setting weights" when `weights` is empty
- With both kit validators running the scaffolded validator, UID 3 reached incentive 1.0 (block 1269), and the Doctor shows no PF108 for it. Because of the permit issue above, it shows `validator`, PF305 and PF202 rather than a miner verdict. When only `validator-1` scored UID 3, the incentive stayed 0: its 47% of permitted stake was below kappa (50%)
