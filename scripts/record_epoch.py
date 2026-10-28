"""Record a real epoch as an offline fixture: `tests/fixtures/epochs/<network>/epoch_sn<N>.json`.

Each fixture is the subnet as it stood one block before its last epoch plus the `Incentive`
vector the chain stored in the epoch block. `tests/unit/test_epoch.py` recomputes the epoch
from the snapshot and requires the chain's numbers to the last u16 step.

    uv run python scripts/record_epoch.py --network finney --netuid 64
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from preflight.core.chain import registry as R
from preflight.core.chain.network import Network, pin
from preflight.core.chain.snapshot import read_subnet

OUT = Path(__file__).resolve().parent.parent / "tests" / "fixtures" / "epochs"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--network", default="finney")
    parser.add_argument("--netuid", type=int, required=True)
    args = parser.parse_args()

    network = Network.resolve(args.network)
    now = pin(network)
    epoch_block = int(now.query(R.LAST_MECHANISM_STEP_BLOCK, [args.netuid]) or 0)
    if epoch_block <= 1:
        parser.error(f"SN{args.netuid} has not run an epoch yet")
    pre = read_subnet(pin(network, epoch_block - 1), args.netuid)
    stored = [int(v) for v in pin(network, epoch_block).query(R.INCENTIVE, [args.netuid]) or []]
    path = OUT / network.name / f"epoch_sn{args.netuid}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"epoch_block": epoch_block, "pre": pre.model_dump(mode="json"), "stored": stored}, separators=(",", ":")) + "\n")
    print(f"wrote {path} (epoch at block {epoch_block:,}, {len(stored)} UIDs)")


if __name__ == "__main__":
    main()
