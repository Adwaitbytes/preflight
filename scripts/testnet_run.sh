#!/usr/bin/env bash
# BUILD.md section 12: the testnet run, once test TAO is in the preflight-miner and
# preflight-validator coldkeys. Every chain write is simulated with Preflight first and only
# submitted if the simulation says it would succeed. Usage: scripts/testnet_run.sh [netuid]
set -eu
export COLUMNS=${COLUMNS:-110}
NET=test
WALLETS="$HOME/.bittensor/wallets"
pf() { uv run preflight "$@"; }
bt() { uv run btcli "$@" --network "$NET" --wallet-path "$WALLETS" --no-prompt; }
addr() { python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['ss58Address'])" "$WALLETS/$1/$2"; }
step() { printf '\n== %s\n' "$1"; }

MINER_COLD=$(addr preflight-miner coldkeypub.txt);       MINER_HOT=$(addr preflight-miner hotkeys/default)
VALI_COLD=$(addr preflight-validator coldkeypub.txt);    VALI_HOT=$(addr preflight-validator hotkeys/default)

step "balances"
uv run btcli wallet balance --network "$NET" --wallet-path "$WALLETS" --wallet preflight-miner || true
uv run btcli wallet balance --network "$NET" --wallet-path "$WALLETS" --wallet preflight-validator || true

NETUID=${1:-}
if [ -z "$NETUID" ]; then
  step "pick the cheapest open testnet subnet"
  NETUID=$(uv run python - <<'PY'
from preflight.core.chain.network import Network
from preflight.core.directory.live import live_subnets
open_ = [s for s in live_subnets(Network.resolve("test")) if s.registration_allowed and s.netuid != 0]
print(min(open_, key=lambda s: s.registration_cost_tao).netuid)
PY
)
  echo "SN$NETUID"
fi
pf mine "$NETUID" --network "$NET" | head -4

step "simulate the miner registration before paying"
if pf sim burned_register --netuid "$NETUID" --coldkey "$MINER_COLD" --hotkey "$MINER_HOT" --network "$NET"; then
  step "register the miner"
  bt subnets register --netuid "$NETUID" --wallet preflight-miner --wallet-hotkey default
else
  echo "Simulation says it would fail; not submitting. Fund $MINER_COLD with test TAO"; exit 1
fi

step "doctor the new miner (expect PF103 immunity, PF105 no axon, PF108 not yet scored)"
pf doctor "$MINER_HOT" --netuid "$NETUID" --network "$NET" --brief | head -12

step "break it like most people do: serve a LAN address (expect PF106)"
bt axon set --netuid "$NETUID" --ip 192.168.1.50 --port 8091 --wallet preflight-miner --wallet-hotkey default
pf doctor "$MINER_HOT" --netuid "$NETUID" --network "$NET" --brief | head -6

step "simulate and register the validator"
if pf sim burned_register --netuid "$NETUID" --coldkey "$VALI_COLD" --hotkey "$VALI_HOT" --network "$NET"; then
  bt subnets register --netuid "$NETUID" --wallet preflight-validator --wallet-hotkey default
  step "doctor the validator (expect PF201 or PF204 until it holds enough stake)"
  pf doctor "$VALI_HOT" --netuid "$NETUID" --network "$NET" --brief | head -8
fi

step "the whole coldkey at once"
pf fleet "$MINER_COLD" --network "$NET"
echo
echo "Record the differences from localnet in docs/decisions/005-testnet.md"
