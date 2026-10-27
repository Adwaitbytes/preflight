#!/usr/bin/env bash
# Runs the Doctor for each hotkey and fails if any finding reaches FAIL_ON. Used by action.yml.
set -euo pipefail

if [[ -z "${HOTKEYS}" && "${NETWORK}" == "local" ]]; then
  HOTKEYS=$($PF local status --json | python3 -c "import json,sys; print(','.join(n['hotkey'] for n in json.load(sys.stdin)['neurons'] if n['role'] != 'owner'))")
  NETUID=${NETUID:-$($PF local status --json | python3 -c "import json,sys; print(json.load(sys.stdin)['netuid'])")}
fi
if [[ -z "${HOTKEYS}" ]]; then
  echo "::error::pass hotkeys, or use network: local to diagnose the kit's neurons"
  exit 2
fi

failed=0
IFS=',' read -ra keys <<< "${HOTKEYS}"
for key in "${keys[@]}"; do
  args=("$key" --network "$NETWORK" --brief --fail-on "$FAIL_ON")
  [[ -n "${NETUID}" ]] && args+=(--netuid "$NETUID")
  if ! $PF doctor "${args[@]}"; then
    failed=$((failed + 1))
    echo "::error::Preflight found ${FAIL_ON} or worse findings for ${key}"
  fi
done
echo "findings=${failed}" >> "$GITHUB_OUTPUT"
exit $(( failed > 0 ? 1 : 0 ))
