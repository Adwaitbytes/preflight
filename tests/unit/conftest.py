"""A local stand-in for the Telegram Bot API, shared by the alert and bot tests."""

from __future__ import annotations

import json
import threading
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any, ClassVar

import pytest

TOKEN = "123:test-token"


class FakeBot(BaseHTTPRequestHandler):
    sent: ClassVar[list[dict[str, Any]]] = []
    updates: ClassVar[list[dict[str, Any]]] = []
    webhook: ClassVar[str] = ""

    def do_POST(self) -> None:
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])) or b"{}")
        method = self.path.rsplit("/", 1)[-1]
        assert self.path.startswith(f"/bot{TOKEN}/")
        if method == "getUpdates":
            offset = body.get("offset")
            result = [u for u in FakeBot.updates if offset is None or u["update_id"] >= offset]
            if offset is not None:
                FakeBot.updates = result
        elif method == "getWebhookInfo":
            result = {"url": FakeBot.webhook}
        elif method == "sendMessage":
            FakeBot.sent.append(body)
            result = {"message_id": len(FakeBot.sent)}
        else:
            result = {"username": "PreflightAlertsBot"}
        payload = json.dumps({"ok": True, "result": result}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format: str, *args: Any) -> None:
        return None


@pytest.fixture
def telegram_api(monkeypatch: pytest.MonkeyPatch) -> Iterator[type[FakeBot]]:
    server = HTTPServer(("127.0.0.1", 0), FakeBot)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    monkeypatch.setenv("TELEGRAM_API_BASE", f"http://127.0.0.1:{server.server_port}")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", TOKEN)
    FakeBot.sent, FakeBot.updates, FakeBot.webhook = [], [], ""
    yield FakeBot
    server.shutdown()
