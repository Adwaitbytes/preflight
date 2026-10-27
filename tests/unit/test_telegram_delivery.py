"""The whole alert path against a local stand-in for the Telegram Bot API: a user sends
/start <code>, the worker links the chat, sends a confirmation, then delivers the alert with
its fix, and does not repeat it on the next run. Only the chain read and the database are faked."""

from __future__ import annotations

import json
import threading
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any, ClassVar

import pytest

from preflight.core.doctor.engine import evaluate
from preflight.core.models import DoctorReport
from preflight.core.watch import worker

from .factory import snap, subnet

TOKEN = "123:test-token"


class FakeBot(BaseHTTPRequestHandler):
    sent: ClassVar[list[dict[str, Any]]] = []
    updates: ClassVar[list[dict[str, Any]]] = []

    def do_POST(self) -> None:
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])) or b"{}")
        method = self.path.rsplit("/", 1)[-1]
        assert self.path.startswith(f"/bot{TOKEN}/")
        if method == "getUpdates":
            offset = body.get("offset")
            result = [u for u in FakeBot.updates if offset is None or u["update_id"] >= offset]
            if offset is not None:
                FakeBot.updates = result
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
def bot(monkeypatch: pytest.MonkeyPatch) -> Iterator[type[FakeBot]]:
    server = HTTPServer(("127.0.0.1", 0), FakeBot)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    monkeypatch.setenv("TELEGRAM_API_BASE", f"http://127.0.0.1:{server.server_port}")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", TOKEN)
    FakeBot.sent, FakeBot.updates = [], []
    yield FakeBot
    server.shutdown()


@pytest.fixture
def db(monkeypatch: pytest.MonkeyPatch) -> dict[str, Any]:
    watch: dict[str, Any] = {"id": "w1", "network": "finney", "hotkey": "5Hot2", "netuid": 7, "chat_id": None, "link_code": "AbC12345", "last_state": None}
    alerts: list[tuple[str, str]] = []

    def link_chat(code: str, chat_id: str) -> int:
        if code != watch["link_code"]:
            return 0
        watch.update(chat_id=chat_id, link_code=None)
        return 1

    def watches(network: str | None = None) -> list[dict[str, Any]]:
        return [dict(watch)]

    def save_state(watch_id: str, state: dict[str, Any]) -> None:
        watch.update(last_state=state)

    def record_alert(watch_id: str, rule: str, payload: dict[str, Any]) -> None:
        alerts.append((watch_id, rule))

    broken = evaluate(snap(2, subnet(weights={0: {3: 1.0}, 1: {3: 1.0}})))
    report = DoctorReport(hotkey="5Hot2", chain=broken.chain, diagnoses=[broken], verdict=broken.verdict, headline=broken.headline, elapsed_ms=1)

    def diagnose(*args: object, **kwargs: object) -> DoctorReport:
        return report

    monkeypatch.setattr(worker.store, "watches", watches)
    monkeypatch.setattr(worker.store, "link_chat", link_chat)
    monkeypatch.setattr(worker.store, "save_state", save_state)
    monkeypatch.setattr(worker.store, "record_alert", record_alert)
    monkeypatch.setattr(worker, "diagnose", diagnose)
    return {"watch": watch, "alerts": alerts}


def test_start_links_the_chat_and_the_alert_is_delivered_once(bot: type[FakeBot], db: dict[str, Any]) -> None:
    bot.updates = [{"update_id": 7, "message": {"text": "/start AbC12345", "chat": {"id": 4242}}}]

    first = worker.run_once()
    assert first.linked == 1 and first.errors == []
    assert db["watch"]["chat_id"] == "4242"
    texts = [m["text"] for m in bot.sent if m["chat_id"] == "4242"]
    assert texts[0].startswith("Preflight is watching your neuron")
    alert = next(t for t in texts if "is no longer scored by any validator" in t)
    assert "/doctor/finney/5Hot2?netuid=7" in alert
    assert first.delivered >= 1 and ("w1", "PF108") in db["alerts"]

    sent_before = len(bot.sent)
    second = worker.run_once()
    assert second.delivered == 0 and len(bot.sent) == sent_before, "a persisting problem must not be re-sent"


def test_a_wrong_code_links_nothing(bot: type[FakeBot], db: dict[str, Any]) -> None:
    bot.updates = [{"update_id": 9, "message": {"text": "/start WRONG999", "chat": {"id": 1}}}]
    report = worker.run_once()
    assert report.linked == 0 and db["watch"]["chat_id"] is None and bot.sent == []
