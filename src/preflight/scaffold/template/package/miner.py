"""The miner: an HTTP server that answers signed tasks. Run: uv run python -m {{package}}.miner"""

from __future__ import annotations

import os

import bittensor as bt
import uvicorn
from fastapi import FastAPI, HTTPException, Request

from . import config
from .protocol import PATH, Answer, Task

settings = config.load()
wallet = bt.Wallet(name=os.environ.get("WALLET", "miner"), hotkey=os.environ.get("HOTKEY", "default"), path=os.environ.get("WALLET_PATH", "~/.bittensor/wallets"))
app = FastAPI()


@app.post(PATH)
async def handle(request: Request) -> Answer:
    body = await request.body()
    try:
        caller = bt.http_auth.verify(dict(request.headers), body, method="POST", path=PATH, self_hotkey_ss58=wallet.hotkey.ss58_address)
    except bt.http_auth.AuthError as error:
        raise HTTPException(401, str(error)) from error
    task = Task.model_validate_json(body)
    _ = caller.hotkey_ss58  # check it is a permitted validator here if your subnet needs to
    return Answer(total=sum(task.numbers))


def main() -> None:
    client = bt.Subtensor(settings.endpoint)
    if not settings.advertise_ip:
        raise SystemExit("set AXON_IP to the public address validators can reach")
    result = client.execute(bt.ServeAxon(settings.netuid, settings.advertise_ip, settings.miner_port), wallet)
    if not result.success:
        raise SystemExit(f"serve_axon failed: {result.message}. Explain it with: preflight tx \"{result.message}\"")
    uvicorn.run(app, host="::", port=settings.miner_port)


if __name__ == "__main__":
    main()
