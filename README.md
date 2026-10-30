# Preflight

Preflight tells you why your Bittensor miner earns zero, and lets you test a transaction before you spend a single rao

Explorers like Taostats and tao.app show chain data. Preflight explains it: paste a hotkey, a transaction or an error and get one plain sentence with the cause, the evidence read from chain at a pinned block, and the exact command that fixes it

Live: https://preflight-lemon.vercel.app

```
$ preflight doctor 5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq --netuid 64
 BROKEN   UID 0 on SN64 earns nothing because no validator has scored it
finney at block 9,376,777, runtime 486

  CRITICAL PF108 No validator has scored this UID
  Validators weighting this UID   0 of 17
  UID 1 (5DU1dv...S7ww)           stake 1,385,410 alpha, last set weights 65 blocks (about 13 min) ago
  ...
```

## What it does

| Module | Answers | Try |
|---|---|---|
| Doctor | Why does this hotkey earn what it earns? 27 rules for miners, validators and subnets, each citing the storage item it read | `preflight doctor <hotkey>` |
| Fleet | Every hotkey a coldkey owns, on every subnet, worst first, with what each seat earns a day. One real coldkey: 16 hotkeys, 19 seats, 3 broken, 12 hotkeys registered nowhere | `preflight fleet <coldkey>` |
| Should I mine here? | What earning miners make a day at today's prices, how many earn at all, the emission needed to keep a seat after immunity, seat turnover and payback | `preflight mine 51` |
| Transaction debugger | Why did this extrinsic fail, with its own numbers, read from the block before it ran | `preflight tx 9376733-28` or paste the error text |
| Simulator | Would this work if I sent it now? Executed with the real runtime on a Chopsticks fork of mainnet, or predicted from the pallet checks ported from subtensor | `preflight sim burned_register --netuid 64 --coldkey <ss58> --hotkey <ss58>` |
| Launch planner | What a subnet costs right now, which subnet it would dissolve at the cap, and the timeline in real blocks | `preflight plan` |
| Subnet health and directory | A 0 to 100 health score with its factors, every hyperparameter explained, and 35 curated subnets with sourced summaries and public APIs | `preflight subnet 64`, `preflight find inference` |
| Local dev kit | A localnet subnet with funded, registered, scored neurons in about 70 s, and eight ways to break it | `preflight local up`, `preflight local break loopback-axon` |
| Scaffolder | A bittensor 11 subnet with signed requests, pure scoring and tests | `preflight new my-subnet` |
| Why did my incentive change? | Compares a UID now against N epochs ago and names the validators whose stake weighted support moved it, and what each did: stopped weighting, cut weight, went stale or lost stake | `preflight why <hotkey> --netuid 19 --epochs 3` |
| Epoch Lab | The next epoch before it runs: every miner's incentive and why, computed in about 2 s with a port of Yuma consensus's incentive math on live state, and checked against the chain's last epoch on every read (8 of 9 real epochs matched every UID exactly). What-ifs for kappa, an offline validator or a validator's new weights; `--min-trust` gates a validator's scoring change in CI | `preflight epoch 19 --hotkey <ss58> --verify` |
| Network weather | What is failing on chain right now: failed extrinsics over the last hour of blocks grouped by error, with the subnets each hits, what it means, the fix and one to open | `preflight weather` |
| Live explorer | Every extrinsic in every block as a plain sentence, as blocks land | `preflight live --failures` |
| Watch | Telegram alerts when a neuron is deregistered, stops being scored, loses its permit or its incentive halves | `preflight watch add <hotkey> --netuid 64` |
| Telegram bot | Every tool as a chat command in [@PreflightAlertsbot](https://t.me/PreflightAlertsbot): `/doctor`, `/why`, `/epoch`, `/fleet`, `/tx`, `/explain`, `/mine`, `/subnet`, `/weather`, `/live`, `/plan`, `/find`, `/watch`; or paste a hotkey, a block-index or an error | `preflight bot ask "/weather"` |
| MCP server | The same tools for your own Claude, at no cost | see below |

One engine, many surfaces: every module is a Python function, a CLI command, an HTTP endpoint (`/v1/...`, OpenAPI at `/v1/docs`), an MCP tool and a web view, all speaking the models in `src/preflight/core/models.py`

## Install

```bash
uv tool install git+https://github.com/Adwaitbytes/preflight
preflight doctor <hotkey>
```

Use it from Claude:

```bash
claude mcp add preflight -- uvx --from git+https://github.com/Adwaitbytes/preflight preflight mcp
```

Use it in CI: the action boots a localnet subnet and fails the job on findings at or above a severity

```yaml
- uses: Adwaitbytes/preflight@main
  with:
    fail-on: high
```

## Why the answers can be trusted

- **One block per answer.** Every report carries the block, block hash and runtime spec it was read at
- **Rules mirror the runtime.** Pruning order, immunity, owner immunity, the set_weights check sequence and axon address validation are ported from subtensor and cite the file and line (`src/preflight/core/chain/registry.py`)
- **The simulator executes, it does not guess,** when a fork is running. The SDK's own `plan()` dry run returned `ok` for a zero balance registration, a miner setting weights and a stranger calling `start_call`; all three fail on chain, and Preflight's fork reports the exact error. See `docs/decisions/001-simulator.md`
- **Errors come from the official catalog** (406 chain errors, vendored with a date stamp) plus hand-written traps it does not cover: the MEV shield on registration, loopback axons, reserves too low, burn moving between attempts
- **The epoch is reproduced, then proven.** `preflight epoch --verify` recomputes the last epoch from the block before it and compares every UID with the `Incentive` the chain stored; the recorded SN19 and SN64 epochs must match to the last u16 step in CI. See `docs/decisions/007-epoch-lab.md`
- **Tested on real data.** 138 unit tests including real finney snapshots replayed offline, and a localnet suite that breaks a fresh chain eight ways and asserts the Doctor names each rule

## Measured

| What | Result |
|---|---|
| Mainnet diagnosis, hosted, warm | 1.8 to 2.2 s |
| Mainnet diagnosis, hosted, cold function | about 6.5 s |
| Subnet snapshot, 256 neurons, 15 concurrent reads | 0.67 s |
| `preflight local up` | 70 s to a subnet with miners earning |
| Next epoch preview, 256 UIDs, from live state | 1.0 to 3.4 s |
| Fork simulation, cached call path | 1.8 to 10 s; first use of a path up to 222 s, so requests fall back to prediction after 20 s |

## Privacy

Preflight reads public chain state only and never asks for keys. Nothing is stored unless you share a report or create a watch; the house counters store counts, not hotkeys

The site keeps anonymous usage stats for its owner at `/stats` (password protected): the page template (`/doctor/finney/:key`, never the hotkey), visible time, country and city from Vercel's edge, device, browser, traffic source, page speed, and which tool or bot command ran. No cookies, no IP addresses, no hotkeys, hashes, chat ids or typed text are stored; a visitor is a hash salted per day, so nobody can be followed across days. Do Not Track and Global Privacy Control are honoured, and rows are deleted after 90 days

## Layout

```
src/preflight/core/   chain reads, rules, debugger, simulator, planner, directory, watch
src/preflight/        cli.py, api.py, mcp_server.py, render.py
catalog/              official catalogs (vendored) and the curated subnet directory
web/                  Next.js site; web/api/index.py runs the same engine on Vercel
docs/decisions/       what was measured and decided
```

Built at the Bittensor Builders House, October 2026, by the builder of Crucible and bt-migrate

## License

MIT. See [LICENSE](LICENSE).
