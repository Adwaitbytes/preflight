# Preflight build document

Paste everything below the line into a fresh Claude Code session started in `~/Desktop/bittensor/preflight`, then run `/goal` with it. This document is the whole brief. The human will not come back to explain anything, so every decision you need is either written here or yours to make with the rules in section 14.

---

You are the lead engineer of **Preflight**, working with parallel specialist subagents, and you own the outcome: win **Best Overall ($250)** and **Bittensor Developer Tools and Infrastructure ($200)** at the Bittensor Builders House (HackQuest x Bittensor, goSTOPS Alibaug, 27 October to 1 November 2026, about 20 builders, presentation on Day 5), with **Community Choice ($150)** as the bonus. Nobody will correct you. If something is wrong, it is your job to notice it, measure it and fix it.

## 0. Start here, in this order

1. Read this whole document once before touching anything
2. Run the checks in section 1 and send the human **one** message listing only what is actually missing. Then keep working on everything that does not depend on the missing items
3. Create the repo skeleton in section 7, commit, and start the Day 1 spikes in section 11

## 1. Things to check before building, ask the human only for what is missing

Check each yourself first (commands in brackets). Ask in a single message, grouped, with the exact steps the human must take.

| Need | How you check | If missing, what to ask for |
|---|---|---|
| Docker running | `docker info` | "Start Docker Desktop" |
| Localnet image | `docker image inspect ghcr.io/raofoundation/subtensor-localnet:devnet` | Pull it yourself, do not ask |
| Python 3.13 and uv | `uv python find 3.13` | Install with `uv python install 3.13`, do not ask |
| Node 22+ and pnpm | `node -v`, `pnpm -v` | Install pnpm with corepack, do not ask |
| GitHub | `gh auth status` | The account that should own the repo is **Adwaitbytes**. If the active account is another one, push with `GH_TOKEN=$(gh auth token --user Adwaitbytes)` and `-c credential.helper='!gh auth git-credential'` instead of switching the human's active account |
| Vercel | `vercel whoami` | "Run `! vercel login`" |
| Neon | none yet | "Create a new Neon project named preflight (free tier) and paste the pooled `DATABASE_URL`". Store it only in `web/.env.local` and the Vercel project env. Never print it, never commit it |
| Telegram bot for alerts | none yet | "Open Telegram, message @BotFather, send `/newbot`, name it Preflight Alerts, paste the token". You may instead do this through the Chrome MCP if the human is logged into Telegram Web, ask first |
| LLM key for the web copilot | none | Do **not** ask. Only free options are allowed. The copilot runs through the MCP server inside the user's own Claude, and the web gets a deterministic answer engine (section 5.H). If the human later volunteers a free key, wire it in behind a flag |
| Test TAO | none | Do **not** block on it. Build on localnet. Testnet comes later (section 12) |
| Chrome MCP | try `mcp__claude-in-chrome__tabs_context_mcp` | If it times out, call `list_connected_browsers`, then `switch_browser` so the human can click Connect in their logged in Chrome |

Use the Chrome MCP only for things that genuinely need a browser: Vercel and Neon dashboards, Telegram Web, checking the deployed site, reading subnet product pages for the capability directory. Never enter passwords or keys in a browser yourself; the human does logins.

## 2. The problem, in one paragraph you must be able to say on stage

Every Bittensor builder hits the same walls. A miner registers and earns zero and nobody can say why. A registration fails with a cryptic error and the burn moves before the retry. A validator sets weights that silently never count. A subnet owner launches without knowing what it costs or when emissions start. Explorers like Taostats, tao.app, bittensor.ai and Metagraphed **show** the data. None of them **explain** it, **fix** it or let you **try a transaction before paying** for it. Preflight does. It is Tenderly for Bittensor: paste a hotkey, a transaction or a netuid, get a plain answer, the cause, and the exact command that fixes it.

One line pitch: **"Preflight tells you why your miner earns zero, and lets you test a transaction before you spend a single rao."**

## 3. How we win, mapped to the judging text

| Criterion from the handbook | What Preflight shows |
|---|---|
| Working prototype | Everything runs live on localnet on stage, and on mainnet read only |
| Clear problem and useful solution | "Why is my miner zero" is the most asked question in Bittensor |
| Strong execution within the five days | Commits every day, a public changelog page, and real usage numbers from the house |
| Meaningful use of Bittensor | Reads real chain state, decodes real extrinsics, simulates against real runtime code, launches real subnets on localnet |
| Credible path forward | Hosted site, CLI, MCP server for AI agents, alert bot, GitHub Action. Testnet next, then a public good grant or Taostats integration |
| Track 2 ideas list | Covers five of its seven bullets: local subnet dev kit and scaffolding, testnet debugging for transactions, registrations, wallets and neuron status, explorer, monitoring and CI, docs grounded assistant |
| Community Choice | The other 19 builders use it during the week to fix their own errors. Day 5 slide: "Preflight diagnosed N neurons and explained M errors for K builders in this room" |

## 4. Verified facts, do not rediscover them

These were measured on bittensor 11.3.0 with `ghcr.io/raofoundation/subtensor-localnet:devnet` (runtime spec 482) while building Crucible. Crucible's working code is at `~/Desktop/bittensor/crucible/src/crucible/chain/harness.py` and `localnet.py`. **Copy and adapt it** for localnet lifecycle, funding, subnet creation and registration rather than writing new chain plumbing.

- Python 3.13 is required; 3.12 fails to build `ckzg`
- v11 removed Axon, Dendrite, Synapse, MockSubtensor, array metagraph and `weight_utils`. Use namespaces: `client.subnets.metagraph(netuid)`, `client.subnets.all()`, `client.neurons.all(netuid)`, `client.weights.weights(netuid)`. Writes are intents: `client.execute(bt.SetWeights(...), wallet)`, `bt.RegisterSubnet`, `bt.StartCall`, `bt.AddStake`, `bt.ServeAxon`
- Raw storage reads used in Crucible: `SubtensorModule.WeightCommits`, `SubtensorModule.TimelockedWeightCommits`, `SubtensorModule.LastMechansimStepBlock` (the misspelling is real)
- `bt.BurnedRegister` forces the MEV shield, which never lands on localnet. Register with the raw `SubtensorModule.burned_register` call through `submit_call`
- `//Alice` is sudo on localnet. Wrap admin calls as `Sudo.sudo(call=client.compose(inner))`. Mint with `Balances.force_set_balance`
- The chain rejects `127.0.0.1` axons and accepts `::ffff:127.0.0.1`. The macOS stealth firewall blocks the LAN IP
- Register every neuron before anyone stakes, keep `collateral_lock_share` at 0, seed pools with a 10,000 TAO lock, or registration fails with "reserves too low" or "Not enough liquidity"
- Double lock cost drains Alice; Crucible sets min lock and mints. Reuse that
- A long lived localnet drifts. Anything recorded for the demo comes from a fresh container
- Request signing is `bt.http_auth.sign` and `bt.http_auth.verify` (btauth/1)
- Official machine readable catalogs exist: `https://bittensor.com/catalog/errors.json` (several hundred chain errors, each with a semantic `code`, `description` that includes the fix, `pallets`, source links; plus about 18 semantic codes with `remediation`), `catalog/reads.json` (every query) and `catalog/intents.json`. Vendor pinned copies into the repo with a fetch script and a date stamp
- Endpoints: mainnet `wss://entrypoint-finney.opentensor.ai:443`, testnet `wss://test.finney.opentensor.ai:443`, localnet `ws://127.0.0.1:9944`. Testnet explorer reportedly `testnet.taostats.io` (single source, verify)
- 2026 context for copy and rules: 57 of 128 subnets had emissions halted in June 2026 (dead code, near 100% miner burn, self mining, flow gaming); price based emissions with a gate that concentrates rewards; owner chosen Etao split, default owner 18, validators 41, miners 41; first halving December 2025 to 0.5 TAO per block

**Storage item names in this document are a guide, not gospel.** Before you implement any rule, confirm the exact pallet, item and type from runtime metadata (`client.substrate` metadata or `state_getMetadata`) and `reads.json`, write that into `core/chain/registry.py`, and add a test that fails if the item disappears. Runtime upgrades rename things.

## 5. Product specification

Every module ships as: a Python core function, a CLI command, an HTTP endpoint, an MCP tool, and a web view. One engine, many surfaces. Everything works against `--network local|test|finney` or a custom endpoint.

### A. Network layer

- `Network` value: name, ws endpoint, ss58 format, explorer link builder (Taostats URLs for finney and test, none for local)
- Connection pool with timeouts, retries on transient errors (copy `_transient` from Crucible), and a block pin so one diagnosis reads one consistent block. Every result carries `block`, `block_hash`, `runtime_spec` and `network`
- Read cache keyed by block hash. Mainnet reads must stay polite: batch with `state_queryStorageAt` or multi queries, never one RPC per neuron in a loop when a map query works

### B. Neuron Doctor (the core, build this first)

Input: `hotkey` (ss58) and optional `netuid`. If no netuid, find every subnet the hotkey is registered on and diagnose each.

Output: a `Diagnosis` with an overall verdict (`healthy`, `warning`, `broken`), a headline in plain English, and a list of `Finding` items. Each finding has `id`, `severity` (`critical`, `high`, `medium`, `info`), `title`, `evidence` (the real values read from chain with the block), `explanation` (two sentences max, plain words), `fix` (exact `btcli` command or code change, filled with the user's own values) and `docs` link.

Rule catalog, implement all of these. Number them `PF1xx` for miners, `PF2xx` for validators, `PF3xx` for subnet level. Each rule is one small pure function `(snapshot) -> Finding | None` with a unit test for the firing and the non firing case.

Miner rules:
- `PF101 not_registered`: hotkey has no UID on the netuid. Explain registration, show current burn cost, fix with the `btcli subnets register` command
- `PF102 recently_deregistered`: hotkey had a UID at an earlier block but not now. Find the block it lost the seat, show the incentive it had, explain pruning. Search back with binary search over block hashes, bounded to the last N blocks
- `PF103 in_immunity`: registered less than `ImmunityPeriod` blocks ago. Show blocks and minutes left, explain that low early rewards are normal
- `PF104 near_pruning`: not immune and in the bottom k by pruning score (incentive or emission, whichever the runtime uses; confirm in subtensor source). Show rank, the score of the next neuron up, and the seat count versus `MaxAllowedUids`
- `PF105 axon_not_served`: axon info empty or zero IP. Fix with serve command
- `PF106 axon_bad_address`: IP is private, loopback `127.0.0.1`, `0.0.0.0` or IPv6 that validators cannot reach. On localnet explain the `::ffff:127.0.0.1` rule
- `PF107 axon_unreachable`: TCP connect to the advertised ip:port from the Preflight server fails or times out (3 s). Only run when the user ticks "probe my axon", and only to the advertised address. Report the exact error (refused, timeout, no route)
- `PF108 no_validator_weight`: no validator with a permit put non zero weight on this UID in its latest weights. List the top validators and when each last set weights
- `PF109 weights_from_stale_validators_only`: the only validators scoring it have stale `LastUpdate`
- `PF110 incentive_zero_but_weighted`: some validators weight it but incentive is zero. Explain consensus clipping in one sentence: too few validators by stake agree (kappa), show the stake share that weighted it versus kappa
- `PF111 low_trust`: trust well below subnet median
- `PF112 duplicate_coldkey_crowding`: many UIDs on one coldkey on this subnet (sybil signature). Info severity
- `PF113 version_mismatch`: if the subnet sets `WeightsVersionKey`, show it so miners can compare with their code version

Validator rules:
- `PF201 no_validator_permit`: has stake but no permit. Show the stake of the lowest permitted validator and the gap
- `PF202 weights_stale`: `current_block - LastUpdate > activity cutoff` or more than a tempo behind. Show minutes since last set
- `PF203 rate_limited`: last set was less than `WeightsSetRateLimit` blocks ago, so a new call would fail. Show the block when it becomes allowed
- `PF204 below_min_stake_for_weights`: stake below the minimum stake required to set weights (confirm the item name). Show the gap and the add stake command
- `PF205 commit_pending_reveal`: commit reveal is on and the hotkey has commits in `WeightCommits` or `TimelockedWeightCommits` not yet revealed. Show when the reveal window opens and closes
- `PF206 weights_too_few_uids`: last weights cover fewer than `MinAllowedWeights` UIDs or exceed max weight limit
- `PF207 self_weighting`: validator puts most weight on UIDs owned by its own coldkey. Warning, link to the 2026 halting reasons
- `PF208 copier_signature`: its weights correlate above 0.98 with the stake weighted consensus of the previous epoch while differing from the current epoch more than peers do. Info severity, phrased as "looks like", never as an accusation

Subnet rules, used by Doctor and by the Health Score:
- `PF301 registration_closed`: registration disabled or the per block or per interval limits are already hit. Show when it reopens
- `PF302 burn_spiking`: burn cost far above its recent mean. Suggest waiting, show the trend
- `PF303 emissions_not_started`: subnet exists but start call not done or the waiting period not over. Show blocks left
- `PF304 near_full_burn`: miner side emission almost entirely burned or recycled (one of the June 2026 halting reasons)
- `PF305 weights_mostly_stale`: most permitted validators have not set weights within a tempo
- `PF306 owner_self_mining`: a large share of miner incentive goes to hotkeys under the owner's coldkey

Headline generator: pick the highest severity finding and phrase one sentence. Example: "UID 37 earns nothing because no validator has scored it in the last 2 tempos, and its axon points at 127.0.0.1"

### C. Transaction Debugger

Inputs, accept all three:
1. Extrinsic hash (search back from head over a bounded window, or accept `block_number-index` like Subscan)
2. Block number plus extrinsic index
3. Pasted error text from btcli or the SDK (for example `SubtensorModule.TooManyRegistrationsThisBlock` or a Python traceback). Parse the error name out of it

Output:
- Decoded call with readable args: TAO and alpha formatted with units, ss58 addresses with labels if known, netuid names
- Result: success or failure, the `DispatchError` decoded to pallet and error name, fee paid, events in order
- Explanation: the `errors.json` description rewritten with **this** transaction's numbers. Example: "You tried to stake 0.4 alpha. The minimum after fees is 0.5. Run: ..."
- "Will it work now?" button: re-run the relevant Doctor rules at the current head for the same hotkey and netuid and say whether retrying would succeed
- Hand written explainers for the traps we know, beyond `errors.json`: MEV shield on `BurnedRegister`, reserves too low, register before stake, loopback axon rejection, weight rate limits, commit reveal timing, burn moving between attempts

### D. Simulator, "try it before you pay"

Goal: run an extrinsic against a copy of real chain state and report the outcome, fees, balance changes and events, without spending anything.

Supported actions: `burned_register`, `add_stake` and `remove_stake` (show slippage and alpha received), `set_weights` (show whether it would be rejected and why), `serve_axon`, `register_network` (show lock cost), `start_call`.

Implementation ladder, Day 1 spike decides which rung you ship. Try in order and record results in `docs/decisions/001-simulator.md`:
1. **Chopsticks fork.** `npx @acala-network/chopsticks --endpoint <ws> --port 8011` forks live state locally and executes real runtime wasm. Override the user's balance with `dev_setStorage` so judges can simulate with zero TAO. Submit the extrinsic signed by a throwaway key with storage overrides that make it the owner where needed, or use Chopsticks' signature mock. Read the resulting events. If Subtensor's consensus or signed extensions break Chopsticks, try its `--build-block-mode Instant` and the `mock-signature-host` options before giving up
2. **Runtime API dry run.** Check whether subtensor exposes a dry run or `TaggedTransactionQueue_validate_transaction` through `state_call`. Validation catches nonce, fee and some signed extension failures but not dispatch errors. Combine with rule checks
3. **Rules plus localnet replay.** Read the live values (burn, limits, stake, pool reserves), run the same checks the pallet runs (port them from the subtensor Rust source and cite file and line in comments), and for state that matters replay the action on a fresh localnet seeded with those values. Use the SDK's `sim_swap` for stake and unstake quotes

Whichever rung ships, the UI labels the result honestly: "Executed on a fork of block N" or "Predicted from live state and runtime rules".

The Chopsticks spike needs `npx` to fetch an external package. If the permission system blocks it, tell the human exactly which command to approve and move to rung 3 meanwhile.

### E. Subnet Launch Planner and local dev kit

- **Cost panel:** live subnet lock cost (runtime API or storage, confirm), how it changes after a registration and decays, rate limit until the next allowed registration, and the 128 subnet cap with which subnet would be replaced (lowest by the runtime's pruning metric, not immune)
- **Timeline:** register network, waiting period, `start_call`, first emissions, immunity length. Real block numbers for the chosen network
- **Hyperparameter explainer:** every hyperparameter of a chosen subnet (or the defaults) with a one sentence meaning, the current value, the allowed range and who can change it. Group into Registration, Weights, Consensus, Emissions, Commit reveal
- **`preflight new <name>` scaffolder:** creates a v11 subnet project (miner, validator using `bt.http_auth`, scoring stub, tests, `preflight.toml`) that runs on localnet in one command. Keep it small and correct, do not build a framework. Make the scaffolded subnet use the same localnet tricks
- **`preflight local up`:** boots the localnet container, creates a subnet, funds and registers N miners and M validators, serves axons on `::ffff:127.0.0.1`, starts the subnet, and prints a table. `preflight local down` and `preflight local reset`. This is the "local subnet development kit with scaffolding and setup automation" from the handbook
- **Broken on purpose:** `preflight local break <scenario>` creates each failure the Doctor detects (unserved axon, loopback axon, stale validator, rate limited validator, pending reveal, deregistered miner, low stake validator). This doubles as the integration test suite and as the stage demo

### F. Subnet Capability Directory

The "dashboard about subnet capabilities" from the organisers' session.

- A card per subnet: name, netuid, what it does in one line, who runs it, links (site, GitHub, docs, API), live numbers (emission share, alpha price, miners and validators count, registration cost), the Health Score (G), and **how to use it**: an example API call where a public API exists
- Data: chain for live numbers; a curated `catalog/subnets.yaml` you fill for the top 30 subnets by emission plus every subnet the handbook names (404-GEN SN17, Chutes SN64, Macrocosmos SN13 and SN9 and SN1, BitMind SN34, Ridges SN62, Dippy SN11, Targon SN4). Use the Chrome MCP to read each project's own site and docs, cite the URL for every claim, and mark `api: none` when there is no public API rather than inventing one
- "Try it" panel only for APIs that work without a paid key, or behind the user's own key typed into the browser and never stored server side
- Search and filters: by capability (inference, data, 3D, video, voice, agents, compute, prediction), by has API, by health

### G. Subnet Health Score

A 0 to 100 score per subnet with the factors shown, built from rules `PF301` to `PF306` plus: share of permitted validators active this tempo, miner incentive concentration (Gini), weights freshness, burn ratio, owner self mining share. Explain each factor in one sentence and link the June 2026 halting reasons. Never call a subnet a scam. Words to use: "signals", "looks like", "at risk".

### H. Copilot and MCP server

- **MCP server** (`preflight mcp`, stdio, installable with `claude mcp add preflight -- uvx --from <repo> preflight mcp`): tools `diagnose_neuron`, `explain_extrinsic`, `explain_error`, `simulate`, `subnet_health`, `launch_plan`, `find_subnet` (capability search). Each returns the same JSON the API returns plus a short text summary. This is how the user's own Claude becomes the copilot, at no cost
- **Web "Ask" box:** deterministic, no LLM. Parse intent with simple patterns ("why is <hotkey> zero", "what does <ErrorName> mean", "how much to register on <netuid>", "launch a subnet") and route to the right module. Show "Ask your own Claude with the MCP server" with the one line install for anything it cannot parse
- `docs/llms.txt` for the Preflight site so agents can read it

### I. Watch and Alerts

- `preflight watch add <hotkey> --netuid N --telegram <chat id>` and the same from the web (sign in not required: the user links a chat by sending `/start <code>` to the bot)
- Alerts: deregistered, entered bottom k, incentive dropped by more than X% between epochs, validator weights stale, permit lost, reveal window about to close, axon became unreachable (only if the user opted in to probing)
- Worker: a Python job that evaluates all watches each tempo. Free hosting: a scheduled GitHub Actions workflow every 10 minutes on the public repo reading from Neon, plus `preflight watch run` for local use. For localnet demo, run it locally every 30 seconds
- Store watches and sent alerts in Neon; dedupe so one problem sends one alert until it changes

### J. Small extras that judges notice

- Shareable report links: `/d/<id>` for a diagnosis, `/tx/<network>/<hash>` for a transaction, with an Open Graph image showing the headline
- `preflight doctor --json` and `--fail-on high` so it can run in CI; a 20 line GitHub Action that runs the Doctor against a subnet's own test neurons on localnet
- A `/changelog` page fed from git log, proving execution during the five days
- A `/house` page (only with each builder's consent) counting diagnoses run, errors explained and builders helped at the Builders House. Store counters only, no hotkeys, unless the user ticks "share"

## 6. Interfaces

### CLI (Typer, rich output)
```
preflight doctor <hotkey> [--netuid N] [--network local|test|finney|<ws>] [--probe] [--json] [--fail-on LEVEL]
preflight tx <hash|block-index|"error text"> [--network ...] [--json]
preflight sim <action> [args] [--network ...] [--as <ss58>] [--json]
preflight plan [--network ...]           # launch planner
preflight subnet <netuid> [--health]     # hyperparams explained plus health
preflight find "<capability words>"      # capability directory search
preflight new <name>                     # scaffold a v11 subnet
preflight local up|down|reset|status|break <scenario>
preflight watch add|list|remove|run
preflight serve [--port 7979]            # local API plus the web UI against localnet
preflight mcp                            # MCP server over stdio
preflight version
```
Exit codes: 0 healthy, 1 findings at or above `--fail-on`, 2 usage error, 3 chain unreachable.

### HTTP API (FastAPI, versioned `/v1`, OpenAPI published)
`GET /v1/doctor/{network}/{hotkey}?netuid=&probe=`, `GET /v1/tx/{network}/{ref}`, `POST /v1/explain-error`, `POST /v1/sim/{network}`, `GET /v1/plan/{network}`, `GET /v1/subnets/{network}`, `GET /v1/subnets/{network}/{netuid}`, `GET /v1/find?q=`, `POST /v1/watch`, `GET /v1/health`. Rate limit by IP. Validate every input (ss58 checksum, netuid range, hash format) and reject early with a clear message.

### Shared contract
Pydantic models in `core/models.py` are the single source of truth. Generate JSON Schema into `schema/` and TypeScript types into `web/src/lib/types.ts` in the same change, with a CI check that they match.

## 7. Architecture and repo layout

```
preflight/
  BUILD.md                  this document
  README.md
  pyproject.toml            uv, Python 3.13, bittensor>=11.3,<12
  src/preflight/
    core/
      models.py             Diagnosis, Finding, TxReport, SimResult, LaunchPlan, SubnetCard, Health
      chain/
        network.py          endpoints, pinned block reads, cache, retries
        registry.py         verified storage items and runtime APIs, one place
        snapshot.py         NeuronSnapshot, SubnetSnapshot built from batched reads
        decode.py           extrinsic and event decoding, units
        localnet.py         adapted from crucible
        harness.py          adapted from crucible (fund, create subnet, register, stake, serve, weights)
      doctor/rules_miner.py rules_validator.py rules_subnet.py engine.py headline.py
      tx/debugger.py explain.py traps.py
      sim/chopsticks.py rules.py localnet_replay.py
      plan/launch.py hyperparams.py
      directory/catalog.py health.py
      watch/store.py worker.py telegram.py
      errors_catalog.py     loads vendored errors.json
    cli.py api.py mcp.py
    scaffold/template/      files for `preflight new`
  catalog/
    errors.json reads.json intents.json   vendored with fetched_at
    subnets.yaml                          curated directory, every claim with a source URL
  web/                      Next.js 16, React 19, Tailwind 4, shadcn, motion, drizzle, Neon
  tests/unit/ tests/localnet/ tests/fixtures/
  scripts/fetch_catalogs.py scripts/record_fixture.py scripts/demo.sh
  docs/decisions/ docs/DEMO.md docs/llms.txt
  .github/workflows/ci.yml watch.yml
  action.yml
```

### Hosting decision
- **Web on Vercel** (free), project `preflight`, root `web/`
- **API:** first try Vercel Python functions (Fluid Compute, Python 3.13, 5 GB bundles; bt-migrate already runs a Python function there, see `~/Desktop/bittensor/bt-migrate/web/api/migrate.py`). Day 1 spike: deploy `GET /v1/health` that imports bittensor and reads the finney head block. If cold start exceeds 10 s or install fails, fall back to the Next.js routes calling a TypeScript read layer with `@polkadot/api` for the hosted site only, keeping the Python engine authoritative for CLI and MCP, with shared golden fixtures proving both give identical findings
- **Localnet is never reachable from Vercel.** `preflight serve` runs the API locally and serves the built web app pointed at it. The hosted site handles test and finney; the web UI shows a "Local" network option that only appears when a local API is detected at `http://127.0.0.1:7979`
- **Neon** for reports, watches, alerts, counters and directory cache. Drizzle migrations committed

## 8. Design brief for the web app

Bar: Linear, Vercel, Stripe, Raycast. It must look like a serious developer tool, not a template.

- Typography: a precise grotesk for UI (Inter or Geist), a mono for addresses, hashes and commands (JetBrains Mono or Geist Mono). Real scale, tight tracking on headings
- Colour: dark first with a full light theme, one accent, semantic colours for critical, high, medium, healthy that pass WCAG AA in both themes
- Landing: one input that accepts anything (hotkey, hash, error text, netuid, subnet name) and routes it, with three example chips. Below: the four modules with one real result each, then the explorers comparison ("they show, Preflight explains")
- Doctor view: headline sentence large, verdict badge, findings sorted by severity, each finding expandable to evidence with the block number and a copy button on the fix command. A neuron timeline chart (incentive, trust, weights received) over recent epochs
- Tx view: call, result, events timeline, explanation card, "Will it work now" button
- Sim view: before and after balances, events, fees, honest label about fork or prediction
- Directory: dense grid of cards, filters, health ring, try it drawer
- Launch planner: cost, timeline as a horizontal track with real blocks, hyperparameter table grouped and searchable
- States for every view: loading skeletons, empty, chain unreachable, invalid input, not found
- Keyboard: `/` focuses the input, `cmd+k` command palette, visible focus rings, full keyboard nav. Respect `prefers-reduced-motion`
- Mobile: every view works at 375 px with no horizontal page scroll
- After any significant UI change run the `design-critic` subagent and fix its top findings; check 1440, 1280 and 375 widths, light and dark, in a real browser through the Playwright or Chrome MCP

## 9. Data model (Neon, drizzle)

- `reports(id, kind, network, subject, block, payload jsonb, created_at, shared bool)` for doctor, tx and sim results that users choose to share
- `watches(id, network, hotkey, netuid, channel, chat_id, rules jsonb, created_at, last_state jsonb)`
- `alerts(id, watch_id, rule_id, sent_at, payload jsonb)`
- `counters(day, kind, network, count)` for the house page, no personal data
- `subnet_cache(network, netuid, block, payload jsonb, updated_at)`
Parameterised queries only. No hotkey is stored unless the user creates a watch or shares a report.

## 10. Testing

- **Unit:** every rule has firing and non firing tests on hand built snapshots. Decoder tests on recorded extrinsics. Explainer tests that every error name in `errors.json` produces a non empty explanation
- **Fixtures:** `scripts/record_fixture.py` records real finney and testnet reads at a pinned block into `tests/fixtures/` so tests run offline and deterministic
- **Localnet integration:** for each `preflight local break <scenario>`, assert the Doctor reports exactly the expected rule. Run on a fresh container in CI (`docker rm -f` first). Copy Crucible's CI setup, including pinned action versions and the 10 s tolerant timings for slow runners
- **Simulator:** for each supported action, compare the simulated outcome with actually submitting it on localnet; they must agree
- **Mainnet smoke:** read only, nightly, diagnoses five known hotkeys and checks the engine does not crash on real data
- **Web:** `tsc`, eslint, vitest for components, Playwright for the main flows at desktop and 375 px
- **Quality gates:** pyright strict and ruff clean, `pnpm build` clean, CI green before every push

## 11. Five day plan with gates

Today is Day 1 (Tue 27 Oct, arrival 1 PM). Each day ends with a commit, a deploy and a line in `/changelog`.

**Day 1, Tue 27:** skeleton repo, catalogs vendored, network layer, registry verified against metadata, `preflight local up` working by adapting Crucible, three spikes with written decisions (Chopsticks on finney and on localnet, Vercel Python with bittensor, block pinned batch reads on finney). Gate: `preflight local up` gives a running subnet and `preflight doctor` prints a real snapshot for a localnet hotkey

**Day 2, Wed 28:** all miner and validator rules, headline, CLI output, `local break` scenarios for each rule with passing localnet tests, error explainer with the known traps. Gate: every `break` scenario is diagnosed correctly on a fresh chain. Share the CLI with other builders at the house

**Day 3, Thu 29:** Tx debugger, simulator on the chosen rung, API, MCP server, web app shell with Doctor and Tx views deployed. Gate: a judge can paste a mainnet hotkey on the hosted site and get a diagnosis in under 5 s. Ask builders at the house to try it, log counters

**Day 4, Fri 30:** launch planner, scaffolder, directory with 30 curated subnets, health score, watch and Telegram alerts, share links, design critic pass and fixes, mobile pass. Gate: full demo rehearsal three times on a fresh localnet, recorded fallback video made

**Day 5, Sat 31:** freeze features by noon, fix only bugs, update numbers on the site and deck, rehearse, present. Make the repo public if the human approved it

If a day slips, cut from the bottom of this list first: try it panels, GitHub Action, alerts web UI (keep CLI), health score factors beyond four, scaffolder. Never cut Doctor, Tx debugger or the live localnet demo.

## 12. Moving to testnet later

When the human sends test TAO:
1. Create wallets with `btcli wallet create`, never print mnemonics, store under `~/.bittensor/wallets/preflight-*`
2. Run `preflight plan --network test`, register a subnet if the TAO covers the lock, otherwise register miners and validators on an existing testnet subnet that allows it
3. Re-run every `break` scenario that does not need sudo on testnet and record results
4. Switch the hosted demo default to testnet, keep localnet as the stage fallback
Document every testnet difference in `docs/decisions/`.

## 13. Demo on Day 5 (five minutes)

| Time | Show |
|---|---|
| 0:00 | Problem in one breath: 57 halted subnets, "why is my miner zero" is the most asked question, explorers show data but do not explain it |
| 0:40 | `preflight local up`, then `preflight local break loopback-axon` and `break stale-validator` |
| 1:20 | Paste the broken miner's hotkey in the web app: headline sentence, findings, the fix command. Run the fix, re-run Doctor, it turns healthy |
| 2:20 | Paste a judge's or a famous mainnet hotkey: live diagnosis on mainnet |
| 2:50 | Paste a failed transaction: decoded, explained with its own numbers. Then simulate a registration on a mainnet subnet with zero TAO |
| 3:40 | Directory and launch planner in 30 seconds |
| 4:10 | The house slide: N diagnoses, M errors explained, K builders helped this week. MCP install line. Close on the pitch sentence |

Fallbacks: recorded video, `preflight doctor --json` output saved for every demo step, offline fixtures if Wi Fi dies.

Judge questions to prepare answers for: "How is this different from Taostats?" (they show, we explain and fix, and simulate). "Is the simulation real?" (say which rung, honestly). "Will you keep it alive?" (public repo, MCP, alerts, plan to propose integration with Taostats and a grant). "Privacy?" (nothing stored unless you share or watch).

## 14. How to work

- Use the superpowers skills: brainstorming before new modules, writing-plans for multi step work, test-driven-development for every rule, systematic-debugging for every failure, verification-before-completion before claiming anything works
- Parallel subagents with narrow written briefs, one directory each, no overlapping files. Only one agent touches a given localnet at a time, because two signers using `//Alice` race on nonces. Give agents their own containers on different ports if they need chains
- A subagent's report is a claim, not evidence. Check its diff and run its tests yourself before accepting
- Small focused commits. Never commit secrets, `.env*`, wallets, `node_modules` or `.preflight/`
- Decisions you can make alone: library choices, naming, layout, which simulator rung, cutting scope per section 11. Decisions that need the human: making the repo public, spending money, anything that signs with a key holding real value, contacting other teams or posting publicly
- Never sign or submit anything on finney. Mainnet is read only. Simulation never broadcasts
- Never probe any address except the axon the user asked you to probe
- If you are blocked on the human, say exactly what you need in one message and keep working on everything else

## 15. Writing rules for anything a human reads

No emojis. No em dashes or en dashes. No trailing full stops on headings, buttons, labels and list items, and as few full stops as natural prose allows. No AI marketing language: write like a senior engineer, use real numbers from real runs, cite a source for every ecosystem claim. Findings say "looks like" for anything inferred and never accuse a real person or subnet.

## 16. Definition of done

Done means observed working: commands run with real output, tests passing, a fresh localnet run where every `break` scenario is diagnosed correctly, the hosted site diagnosing a mainnet hotkey, CI green, the design critic's top findings fixed, the demo rehearsed three times. Report plainly what works, what you verified, and what is still open. If a number on the site or deck no longer matches the latest real run, fixing it is part of the change.

## 17. Final message to the human when done

List: the live URL, the install command, the MCP install line, what each module does in one line, the demo runbook path, what is still open, and what you need from them (test TAO, repo visibility). Remind them that Crucible and bt-migrate exist and can be shown as earlier work by the same builder if a judge asks.
