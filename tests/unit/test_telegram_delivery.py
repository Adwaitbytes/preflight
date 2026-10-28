"""The whole alert path against a local stand-in for the Telegram Bot API: a user sends
/start <code>, the worker links the chat, sends a confirmation, then delivers the alert with
its fix, and does not repeat it on the next run. Only the chain read and the database are faked."""

from __future__ import annotations

from typing import Any

import pytest

from preflight.core.doctor.engine import evaluate
from preflight.core.models import DoctorReport
from preflight.core.watch import worker

from .conftest import FakeBot
from .factory import snap, subnet


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
    monkeypatch.setattr(worker.store, "prune_unlinked", lambda: 0)
    monkeypatch.setattr(worker, "diagnose", diagnose)
    return {"watch": watch, "alerts": alerts}


def test_start_links_the_chat_and_the_alert_is_delivered_once(telegram_api: type[FakeBot], db: dict[str, Any]) -> None:
    telegram_api.updates = [{"update_id": 7, "message": {"text": "/start AbC12345", "chat": {"id": 4242}}}]

    first = worker.run_once()
    assert first.linked == 1 and first.errors == []
    assert db["watch"]["chat_id"] == "4242"
    texts = [m["text"] for m in telegram_api.sent if m["chat_id"] == "4242"]
    assert texts[0].startswith("Preflight is watching your neuron")
    alert = next(t for t in texts if "is no longer scored by any validator" in t)
    assert "/doctor/finney/5Hot2?netuid=7" in alert
    assert first.delivered >= 1 and ("w1", "PF108") in db["alerts"]

    sent_before = len(telegram_api.sent)
    second = worker.run_once()
    assert second.delivered == 0 and len(telegram_api.sent) == sent_before, "a persisting problem must not be re-sent"


def test_a_wrong_code_links_nothing(telegram_api: type[FakeBot], db: dict[str, Any]) -> None:
    telegram_api.updates = [{"update_id": 9, "message": {"text": "/start WRONG999", "chat": {"id": 1}}}]
    report = worker.run_once()
    assert report.linked == 0 and db["watch"]["chat_id"] is None and telegram_api.sent == []


def test_with_a_webhook_set_the_worker_leaves_linking_to_the_api(telegram_api: type[FakeBot], db: dict[str, Any]) -> None:
    telegram_api.webhook = "https://example.test/v1/telegram/webhook"
    telegram_api.updates = [{"update_id": 11, "message": {"text": "/start AbC12345", "chat": {"id": 5}}}]
    report = worker.run_once()
    assert report.linked == 0 and report.errors == [] and db["watch"]["chat_id"] is None


def test_unlinked_watches_cost_no_chain_reads(telegram_api: type[FakeBot], db: dict[str, Any], monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[object] = []

    def diagnose(*args: object, **_: object) -> None:
        calls.append(args)

    monkeypatch.setattr(worker, "diagnose", diagnose)
    report = worker.run_once()
    assert report.checked == 0 and calls == [] and db["watch"]["chat_id"] is None
