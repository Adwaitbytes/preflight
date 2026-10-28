# 005 Testnet

Date: 2026-10-28. Testnet head 8,316,520, runtime spec 486. Read only: no test TAO was available, so nothing was registered or submitted

## Verified on testnet

| Feature | Result | Time |
|---|---|---|
| Doctor, a miner on SN1 | Diagnosed: only scored by validators the epoch ignores, and clipped by consensus | 1.4 s |
| Doctor, a validator across all its subnets | Diagnosed on SN2 | 2.7 s |
| Fleet of that validator's coldkey | 3 seats, 1 needing attention | 3.5 s |
| Launch planner | Lock 1.00 TAO | 1.6 s |
| Mining economics, SN1 and SN51 | SN1: 250 of 251 miners earn; SN51: competitive | 1.1 to 2.0 s |
| Subnet detail, SN1 | Health 55 | 1.9 s |
| Directory | 597 cards | 1.2 s |
| Health for every subnet | 597 scored from one bulk read | 37.4 s |
| Simulator, predicted | burned_register refused with HotKeyAlreadyRegisteredInSubNet | 2.8 s |
| Transaction debugger | No failed extrinsic in the last 400 testnet blocks to try it on | |

## Differences from finney, and what they changed

- Testnet SN51 has a neuron advertising an axon with `ip_type` 4 and an address past 2^32. The SDK's metagraph builder raises on it and fails the whole subnet. Preflight wraps that one SDK helper so a malformed axon reads as unserved (`core/chain/snapshot.py`)
- Validators registered on the root network report SN0 among their subnets. Root has no miners, axons or incentive, and diagnosing it with the subnet rules produced a false "no validator has scored it". The Doctor and Fleet now skip SN0, and an explicit netuid 0 gets a plain refusal
- Testnet has 597 subnets against finney's 129, so the bulk health read is the same single call but the response is about five times larger
- `testnet.taostats.io` does not resolve, so testnet results carry no explorer link (`core/chain/network.py`)

## Ready for test TAO

Wallets exist at `~/.bittensor/wallets/preflight-miner` and `preflight-validator` (throwaway testnet keys, files mode 0600, mnemonics never printed or stored):

- Miner coldkey `5EsJhFJcryS3tyKsLZyCohg74hyfiww7rZUHVT7eRc5fvb9U`
- Validator coldkey `5DFVgQQbtgqjxuYzxbcSQPLktKUgnPHFRBdkvPD34kK87cws`

`scripts/testnet_run.sh [netuid]` reads both balances, picks the cheapest open subnet, simulates each registration with Preflight and submits only when the simulation passes, then runs the Doctor and Fleet on the results. Dry run on 2026-10-28 with 0 TAO: it chose SN284, the simulator refused the registration (Payment), and nothing was submitted

## Testnet run without test TAO: proof of work registration

Testnet SN597 (labo-test) allows proof of work registration at difficulty 1,000, and `btcli subnets register --pow` with zero tip needs no TAO. So the section 12 run happened on real testnet with zero balance:

| Step | Result |
|---|---|
| Register the miner hotkey by PoW | Landed at `8318795-0007`, fee 0, UID 8, mined in about 17 s |
| `preflight tx 8318795-7 --network test` | Decoded `SubtensorModule.pow_register`, success |
| Doctor on the new miner | PF103 in immunity (298 blocks left) and PF108 not yet scored: correct for a fresh seat |
| Serve a LAN axon, `192.168.1.50:8091` (simulated first: would succeed) | Landed at `8318798-0006` |
| Doctor again | PF106 high, "advertises 192.168.1.50:8091, which validators cannot reach", with the `btcli axon set` fix |
| Register the validator hotkey by PoW | Landed at `8318802-0006`, fee 0, UID 22 |
| Simulate set_weights from the unstaked validator | Would fail: SettingWeightsTooFast, 5 blocks since last set against a limit of 100; the SDK's own plan() raised the same refusal, which the simulator now records instead of crashing |
| Fleet on the miner coldkey | 1 seat, PF106 as the worst finding |

Found on the way: the Doctor reads the head's parent block, so a diagnosis in the same 12 s as a write can still show the state before it; a second read a block later is correct. The localnet kit waits two blocks after its own writes for the same reason

## Closed by the owner, 2026-10-28

- **Hosted default network stays Finney.** Section 12 says to switch the hosted default to testnet after the testnet run. The owner chose to keep Finney: the Day 5 demo and judges' own hotkeys are mainnet, and a mainnet hotkey pasted on a testnet default would read "not registered". Testnet and Local stay one click away in the network switch
- **Testnet staking is out of scope until test TAO exists.** The validator permit, stale weights and stake threshold scenarios (PF201, PF202, PF204) are proven on localnet by the integration suite (29 of 29 on a fresh chain, in CI on every push). If test TAO arrives, `scripts/testnet_run.sh` runs the remaining steps; the validator coldkey is `5DFVgQQbtgqjxuYzxbcSQPLktKUgnPHFRBdkvPD34kK87cws`
