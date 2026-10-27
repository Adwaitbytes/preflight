"""The validator: query every served miner with a signed task, score answers, set weights.

Run: uv run python -m {{package}}.validator
"""

from __future__ import annotations

import os
import random
import time

import bittensor as bt
import httpx

from . import config
from .protocol import PATH, Answer, Task
from .scoring import normalize, score

settings = config.load()
wallet = bt.Wallet(name=os.environ.get("WALLET", "validator"), hotkey=os.environ.get("HOTKEY", "default"), path=os.environ.get("WALLET_PATH", "~/.bittensor/wallets"))


def query(miner_hotkey: str, address: str, task: Task) -> Answer | None:
    body = task.model_dump_json().encode()
    headers = bt.http_auth.sign(wallet, method="POST", path=PATH, body=body, receiver_ss58=miner_hotkey)
    host = address if address.startswith("[") or address.count(":") <= 1 else f"[{address.rsplit(':', 1)[0]}]:{address.rsplit(':', 1)[1]}"
    try:
        response = httpx.post(f"http://{host}{PATH}", content=body, headers={**headers, "content-type": "application/json"}, timeout=5.0)
        response.raise_for_status()
        return Answer.model_validate_json(response.content)
    except (httpx.HTTPError, ValueError):
        return None


def round_once(client: bt.Subtensor) -> dict[int, float]:
    graph = client.subnets.metagraph(settings.netuid, commitments=False)
    if graph is None:
        raise SystemExit(f"netuid {settings.netuid} does not exist on {settings.network}")
    task = Task(numbers=[random.randint(0, 1000) for _ in range(8)])
    scores = {n.uid: score(task, query(n.hotkey, n.axon, task)) for n in graph.neurons if n.axon and n.hotkey != wallet.hotkey.ss58_address}
    return normalize(scores)


def main() -> None:
    client = bt.Subtensor(settings.endpoint)
    while True:
        weights = round_once(client)
        if weights:
            uids = sorted(weights)
            result = client.execute(bt.SetWeights(settings.netuid, uids=uids, weights=[weights[u] for u in uids]), wallet)
            print(f"set weights on {len(uids)} miners: {'ok' if result.success else result.message}")
            if not result.success:
                print(f"explain it: preflight tx \"{result.message}\" --network {settings.network}")
        time.sleep(int(os.environ.get("ROUND_SECONDS", "12")))


if __name__ == "__main__":
    main()
