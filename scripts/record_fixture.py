"""Record real chain reads as offline fixtures: `tests/fixtures/<network>/<name>.json`.

Each fixture is a NeuronSnapshot (everything the rules read) plus the rule ids the Doctor
produced when it was recorded. `tests/unit/test_fixtures.py` replays them offline and fails
if a rule change alters a verdict on real data without the fixture being re-recorded.

    uv run python scripts/record_fixture.py --network finney --netuid 64 --pick broken_miner
    uv run python scripts/record_fixture.py --network finney --netuid 64 --hotkey 5F... --name mine
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from preflight.core.chain.network import Network, pin
from preflight.core.chain.snapshot import read_neuron, read_subnet
from preflight.core.doctor.engine import evaluate

OUT = Path(__file__).resolve().parent.parent / "tests" / "fixtures"
PICKS = ("broken_miner", "earning_miner", "top_validator", "unregistered")
UNREGISTERED = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--network", default="finney")
    parser.add_argument("--netuid", type=int, required=True)
    parser.add_argument("--hotkey")
    parser.add_argument("--pick", choices=PICKS)
    parser.add_argument("--name")
    args = parser.parse_args()

    network = Network.resolve(args.network)
    pinned = pin(network)
    subnet = read_subnet(pinned, args.netuid)
    hotkey = args.hotkey
    if hotkey is None:
        miners = [n for n in subnet.neurons if not n.validator_permit]
        if args.pick == "broken_miner":
            hotkey = next(n.hotkey for n in miners if n.incentive == 0)
        elif args.pick == "earning_miner":
            hotkey = max(miners, key=lambda n: n.incentive).hotkey
        elif args.pick == "top_validator":
            hotkey = max(subnet.validators(), key=lambda n: n.stake).hotkey
        elif args.pick == "unregistered":
            hotkey = UNREGISTERED
        else:
            parser.error("pass --hotkey or --pick")
    snap = read_neuron(pinned, args.netuid, hotkey, subnet=subnet)
    diagnosis = evaluate(snap)
    name = args.name or f"sn{args.netuid}_{args.pick or hotkey[:8]}"
    path = OUT / network.name / f"{name}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {
                "snapshot": snap.model_dump(mode="json"),
                "expected_rules": [f.id for f in diagnosis.findings],
                "expected_verdict": diagnosis.verdict.value,
            },
            indent=1,
        )
        + "\n"
    )
    print(f"{path.relative_to(OUT.parent.parent)}: block {pinned.block:,}, {diagnosis.verdict.value}, rules {[f.id for f in diagnosis.findings]}")


if __name__ == "__main__":
    main()
