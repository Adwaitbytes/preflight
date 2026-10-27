#!/usr/bin/env bash
# Rehearses the localnet half of docs/DEMO.md on a fresh chain and times each step.
set -eu
export COLUMNS=${COLUMNS:-110}
pf() { uv run preflight "$@"; }
step() { printf '\n== %s\n' "$1"; }
t() { local s=$SECONDS; "$@"; echo "   ($(( SECONDS - s )) s)" >&2; }
field() { python3 -c "import json,sys; print(json.load(open(sys.argv[1]))[sys.argv[2]])" "$1" "$2"; }
out=$(mktemp -d)

step "fresh localnet";        t pf local reset > /dev/null
step "break loopback-axon";   t pf local break loopback-axon --json > "$out/miner.json"
step "break stale-validator"; t pf local break stale-validator --json > "$out/validator.json"

miner=$(field "$out/miner.json" hotkey); miner_net=$(field "$out/miner.json" netuid)
validator=$(field "$out/validator.json" hotkey); validator_net=$(field "$out/validator.json" netuid)

step "doctor the miner (expect PF106)";       t pf doctor "$miner" --netuid "$miner_net" --network local --brief | head -2
step "doctor the validator (expect PF202)";   t pf doctor "$validator" --netuid "$validator_net" --network local --brief | head -2
step "explain the rejected 127.0.0.1";        t pf tx InvalidIpAddress --network local | head -3
step "run the fix";                           t pf local fix loopback-axon | head -1
step "doctor the miner again (PF106 gone)";   t pf doctor "$miner" --netuid "$miner_net" --network local --brief | head -2
