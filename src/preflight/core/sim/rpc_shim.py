"""A WebSocket proxy that lets the bittensor SDK talk to a Chopsticks fork.

Chopsticks implements most of the Substrate RPC surface but differs from a real
subtensor node in two places the SDK depends on (verified against Chopsticks 1.5.2
and bittensor 11.3):
- it has no `account_nextIndex`, only the older `system_accountNextIndex` alias
- `state_call` rejects call data that lacks the `0x` prefix the SDK leaves off

Every other frame, including subscriptions and batches, passes through untouched.
"""

from __future__ import annotations

import asyncio
import contextlib
import json
from typing import Any

from websockets.asyncio.client import ClientConnection, connect
from websockets.asyncio.server import Server, ServerConnection, serve
from websockets.exceptions import ConnectionClosed

RENAMED = {"account_nextIndex": "system_accountNextIndex"}
MAX_FRAME = 64 * 1024 * 1024


def rewrite_frame(frame: Any) -> Any:
    if isinstance(frame, list):
        return [rewrite_frame(item) for item in frame]
    if not isinstance(frame, dict):
        return frame
    method = frame.get("method")
    if not isinstance(method, str):
        return frame
    rewritten = dict(frame)
    rewritten["method"] = RENAMED.get(method, method)
    params = frame.get("params")
    if method == "state_call" and isinstance(params, list) and len(params) >= 2:
        data = params[1]
        if isinstance(data, str) and not data.startswith("0x"):
            rewritten["params"] = [params[0], "0x" + data, *params[2:]]
    return rewritten


def rewrite_message(message: str | bytes) -> str | bytes:
    try:
        frame = json.loads(message)
    except ValueError:
        return message
    return json.dumps(rewrite_frame(frame))


async def _pipe_up(client: ServerConnection, upstream: ClientConnection) -> None:
    async for message in client:
        await upstream.send(rewrite_message(message))


async def _pipe_down(upstream: ClientConnection, client: ServerConnection) -> None:
    async for message in upstream:
        await client.send(message)


async def _relay(client: ServerConnection, upstream_url: str) -> None:
    async with connect(upstream_url, max_size=MAX_FRAME) as upstream:
        tasks = [
            asyncio.create_task(_pipe_up(client, upstream)),
            asyncio.create_task(_pipe_down(upstream, client)),
        ]
        _done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for task in pending:
            task.cancel()
        for task in tasks:
            # A closed socket on either side is the normal way a relay ends.
            with contextlib.suppress(asyncio.CancelledError, ConnectionClosed):
                await task


async def start_shim(upstream_url: str, host: str, port: int) -> Server:
    async def handler(client: ServerConnection) -> None:
        await _relay(client, upstream_url)

    return await serve(handler, host, port, max_size=MAX_FRAME)
