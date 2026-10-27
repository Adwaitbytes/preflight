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

## Still to do with test TAO (BUILD.md section 12)

Create `preflight-*` wallets, register a miner and a validator on a testnet subnet that allows it, re-run the break scenarios that need no sudo (unserved axon, LAN axon, stale validator, rate limited validator, low stake), and switch the hosted default to testnet with localnet kept as the stage fallback
