# Demo runbook, five minutes

## Before going on stage (T minus 15 min)

```bash
cd ~/Desktop/bittensor/preflight
docker info >/dev/null && echo docker ok
preflight local down; preflight local up          # fresh chain: a long lived localnet drifts
uv run --env-file web/.env.local preflight serve --fork finney &   # local API on :7979 plus a warm mainnet fork
open https://preflight-lemon.vercel.app           # the site shows a Local network option while serve runs
curl -s https://preflight-lemon.vercel.app/v1/health   # warms the hosted function
```

Keep three terminal tabs: `cli`, `serve`, `spare`. Font size 20

## Run of show

| Time | Do | Say |
|---|---|---|
| 0:00 | Slide 1 | "57 subnets had emissions halted in June. The most asked question in Bittensor is why does my miner earn zero. Explorers show you the data. Nobody explains it" |
| 0:40 | `preflight local break loopback-axon` | "This miner tried 127.0.0.1, the chain refused it, so it served its LAN address, like most people do" |
| 1:00 | `preflight local break stale-validator` | "And this validator stopped setting weights" |
| 1:20 | Web, network Local, paste the broken miner's hotkey | Read the headline out loud. Expand PF106, show evidence and the block |
| 1:50 | Copy the fix, run it (`preflight local fix loopback-axon` prints and runs the btcli command), click Run again | "Healthy" |
| 2:20 | Network Finney, paste `5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq` (or a judge's hotkey) | "Live mainnet, about two seconds" |
| 2:50 | Paste `9376733-28` | "A real failed mainnet commit: the explanation uses its own numbers, ten unrevealed commits" |
| 3:15 | Simulate `burned_register` on SN64 with a fresh coldkey, then with balance 10 | "Zero TAO: fails with Payment. With 10 TAO: executed by the real runtime on a fork of mainnet, nothing broadcast. The SDK's own dry run says ok to both" |
| 3:40 | `/subnets` then `/plan` | "351 TAO to launch today, and it would dissolve SN16" |
| 4:10 | `/house`, then the MCP install line | "N diagnoses for K builders in this room. And your own Claude can do all of it" |
| 4:40 | Close | "Preflight tells you why your miner earns zero, and lets you test a transaction before you spend a single rao" |

## Fallbacks

| If | Then |
|---|---|
| Wi Fi dies | `cd web && PREFLIGHT_OFFLINE=1 pnpm dev`: recorded finney results with an "Offline demo" banner; the localnet part needs no internet |
| Docker misbehaves | Skip to 2:20; the CLI output for each break is in `docs/demo-output/` |
| Fork is cold | The simulator answers in predicted mode and says so; show the label, that is the honest answer |
| Everything fails | The recorded run in `docs/demo-video/`: part 1 is the broken miner on Local, part 2 is Run again after the fix, then mainnet Doctor, the failed tx, the zero TAO simulation, mining economics, directory, planner, fleet, guide and house |

## Questions to expect

- **How is this different from Taostats?** They show data. Preflight explains it, names the fix, and simulates before you pay
- **Is the simulation real?** With a fork running, yes: the runtime's own `apply_extrinsic` on forked mainnet state. Without one it is a prediction from checks ported from subtensor, and the page says which
- **Will you keep it alive?** Open source, MCP server, alerts, a CI action. Next: testnet by default, then propose an integration to Taostats and apply for a grant
- **Privacy?** Public chain data only, no keys, nothing stored unless you share or watch
