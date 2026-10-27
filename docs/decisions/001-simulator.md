# 001 Simulator rung

Date: 2026-10-27, Day 1. Measured on bittensor 11.3.0, finney runtime spec 486, Chopsticks 1.5.2, from a laptop in Alibaug

## Question

Which rung of the simulator ladder in BUILD.md section 5.D ships

## What we measured

### The SDK's own dry run is not a simulator

`client.plan(intent, wallet)` accepts a public-key-only wallet and returns fee, effects, warnings and policy violations in 0.4 to 2.2 s. It does not dispatch the call, so it reports `ok: true` for things the chain rejects:

| Intent on SN64 | `plan().ok` | What the chain does |
|---|---|---|
| `BurnedRegister` from a coldkey with 0 TAO | true | Rejected: cannot pay fees |
| `SetWeights` signed by a miner hotkey with no permit | true | `NeuronNoValidatorPermit` |
| `StartCall` on SN64 from a stranger | true | `NotSubnetOwner` or `FirstEmissionBlockNumberAlreadySet` |

Preflight uses `plan()` for fee and effect text only, never for the verdict

### Rung 1, Chopsticks, full block production: too slow

`npx @acala-network/chopsticks@1.5.2 --endpoint <finney> --build-block-mode Instant`

- Without `--allow-unresolved-imports` the fork cannot even read a header: subtensor imports `ext_host_calls_bls12_381_mul_projective_g2_version_1` (drand timelock), which Chopsticks' executor lacks. With the flag it serves reads
- The SDK needs two RPC adaptations, done in `core/sim/rpc_shim.py`: `account_nextIndex` is renamed to `system_accountNextIndex`, and `state_call` data gets its `0x` prefix
- Building one block that held a single `burned_register` did not finish in 11 minutes. `on_initialize` runs the coinbase over every subnet, and Chopsticks fetches each storage key lazily from finney

### Rung 1b, Chopsticks plus `BlockBuilder_apply_extrinsic`: ships

Instead of building a block, call the runtime's `BlockBuilder_apply_extrinsic` through `state_call` on the fork. That executes the real runtime wasm for one extrinsic on top of the forked state and returns the `ApplyExtrinsicResult`. State changes are discarded by `state_call`, so nothing is ever broadcast

- `--mock-signature-host` accepts any signature starting `0xdeadbeef`, so the extrinsic can be built for any address from its public key alone. A judge with zero TAO can simulate as any coldkey
- `dev_setStorage` on `System.Account` overrides balances on the fork, for "what if I had 100 TAO"

| Case, `burned_register` on SN64 | Result bytes | Meaning | Time |
|---|---|---|---|
| Coldkey with 0 TAO | `0x010001` | `Err(Invalid(Payment))` | 1.6 s |
| Same coldkey after `dev_setStorage` to 100 TAO, cold cache | `0x0000` | `Ok(Ok(()))` | 231 s |
| Same, warm cache | `0x0000` | `Ok(Ok(()))` | 0.3 to 2.5 s |

The cold number is the lazy storage fetch. Mitigations: `--db` SQLite cache across restarts, a warm-up pass that dry-runs every supported action once at startup, and a fork refresh at a new head in the background with an atomic swap

### Rung 2, `TaggedTransactionQueue_validate_transaction` on the public node

Needs a real signature from the user's key, so it cannot simulate for an address we do not hold. Rejected for the simulator, kept in mind for the Tx debugger

## Decision

- **Local CLI, MCP and `preflight serve`:** rung 1b. Label: "Executed on a fork of block N with the real runtime"
- **Hosted site on Vercel:** cannot run a long-lived Chopsticks process, so it uses rung 3 (live reads plus the pallet checks ported from subtensor source, cited by file and line) and labels it "Predicted from live state and runtime rules". When a local API is detected, the web UI routes simulations to it and gets rung 1b
- The rung 3 checks double as the explanation layer for rung 1b: when the fork says `Err(Module(...))`, the same ported check says which number caused it

## Update, Day 1 night: what shipped and measured

- Chopsticks runs against the public entrypoint. The archive pool (`archive.chain.opentensor.ai`) hung one storage request with no timeout and stalled the fork for 45 minutes; Chopsticks 1.5.2 has no RPC timeout option. The entrypoint load-sheds only the 1000-key pages that block building asks for, which `apply_extrinsic` never needs. `PREFLIGHT_FORK_UPSTREAM_FINNEY` points it at your own node
- `dev_setStorage` rejects `AccountInfo.flags` (a u128, here 2^127) as a JSON number above 2^53, so overrides are sent with integers as strings
- Measured on a fork of finney block 9,376,889, all through `preflight.core.sim.engine.simulate`, each agreeing with the rung 3 prediction:

| Action on SN64 | Fork result | Time |
|---|---|---|
| `burned_register`, coldkey with 0 TAO | `Err(Invalid(Payment))` | 10.8 s, first use |
| `burned_register`, balance overridden to 10 TAO | `Ok` | 222 s cold, about 2 s once cached |
| `burned_register`, balance overridden to 0.0001 TAO | `Err(Invalid(Payment))` | 1.8 s |
| `serve_axon` at 127.0.0.1 | `InvalidIpAddress` | 9.0 s |
| `start_call` from a stranger with 0 TAO | `Err(Invalid(Payment))` | 4.5 s |

- A cold call path is too slow for a request, so `simulate` gives the fork 20 s and otherwise returns the prediction, labelled "the fork is still warming", while the fork run finishes and fills the cache. `start_fork` runs every action once in the background (`warm`): 10.3 s on a primed cache
