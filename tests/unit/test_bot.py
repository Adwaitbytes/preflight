"""The Telegram bot: commands route to the engines, every chain value is escaped, and the
webhook answers only Telegram. Engines and the database are faked; the Bot API is the same
local stand-in the alert tests use."""

from __future__ import annotations

from typing import Any

import pytest
from fastapi.testclient import TestClient

from preflight import api, bot
from preflight.core.doctor import engine
from preflight.core.models import DoctorReport

from .conftest import FakeBot
from .factory import snap, subnet

HOTKEY = "5FcJiV9Vc2Y5GemgWoXhksvQVXQ99csas9En9nYbSx38sS93"
SECRET = "a-webhook-secret-of-some-length"


@pytest.fixture
def broken(monkeypatch: pytest.MonkeyPatch) -> list[tuple[str, int | None]]:
    calls: list[tuple[str, int | None]] = []
    d = engine.evaluate(snap(2, subnet(weights={0: {3: 1.0}, 1: {3: 1.0}})))
    report = DoctorReport(hotkey=HOTKEY, chain=d.chain, diagnoses=[d], verdict=d.verdict, headline=d.headline, elapsed_ms=1)

    def diagnose(_net: object, hotkey: str, netuid: int | None, **_: object) -> DoctorReport:
        calls.append((hotkey, netuid))
        return report

    monkeypatch.setattr(engine, "diagnose", diagnose)
    return calls


def test_doctor_command_names_the_finding_and_links_the_report(broken: list[tuple[str, int | None]]) -> None:
    text = bot.reply(f"/doctor@PreflightAlertsbot {HOTKEY} 7", "1")
    assert broken == [(HOTKEY, 7)]
    assert "BROKEN" in text and "PF108" in text
    assert f'href="https://preflight-lemon.vercel.app/doctor/finney/{HOTKEY}?netuid=7"' in text


def test_pasted_hotkey_routes_to_the_doctor(broken: list[tuple[str, int | None]]) -> None:
    bot.reply(f"why is {HOTKEY} on sn7 earning nothing", "1")
    assert broken == [(HOTKEY, 7)]


def test_hostile_input_is_escaped_and_usage_is_plain() -> None:
    text = bot.reply("/doctor <script>alert(1)</script>", "1")
    assert "<script>" not in text and "&lt;script&gt;" in text
    assert bot.reply("/why", "1").startswith("Send /why &lt;hotkey&gt; &lt;netuid&gt;")
    assert bot.reply("/mine abc", "1").startswith("Send /mine followed by a netuid")
    assert bot.reply("/nope", "1").startswith("There is no /nope command")
    assert bot.reply("/start", "1") == bot.HELP


def test_testnet_word_switches_network(monkeypatch: pytest.MonkeyPatch) -> None:
    seen: list[str] = []

    def economics(net: Any, netuid: int) -> Any:
        seen.append(net.name)
        raise LookupError(f"SN{netuid} does not exist")

    monkeypatch.setattr("preflight.core.plan.economics.economics", economics)
    assert bot.reply("/mine 4000 test", "1") == "netuid must be between 0 and 1024; got 4000" and seen == []
    assert bot.reply("/mine 12 testnet", "1") == "SN12 does not exist" and seen == ["test"]


def test_join_never_cuts_inside_a_line() -> None:
    text = bot.join(["<b>head</b>", *("<i>" + "x" * 500 + "</i>" for _ in range(20))])
    assert len(text) <= bot.MAX_CHARS + 4 and text.endswith("...") and text.count("<i>") == text.count("</i>")


def test_webhook_answers_only_telegram(telegram_api: type[FakeBot], monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_WEBHOOK_SECRET", SECRET)
    client = TestClient(api.app)
    update = {"update_id": 1, "message": {"text": "/help", "chat": {"id": 777}}}
    assert client.post(api.TELEGRAM_WEBHOOK, json=update).status_code == 404
    assert client.post(api.TELEGRAM_WEBHOOK, json=update, headers={"X-Telegram-Bot-Api-Secret-Token": "wrong"}).status_code == 404
    assert telegram_api.sent == []

    response = client.post(api.TELEGRAM_WEBHOOK, json=update, headers={"X-Telegram-Bot-Api-Secret-Token": SECRET})
    assert response.status_code == 200 and response.json() == {"ok": True}
    [message] = telegram_api.sent
    assert message["chat_id"] == "777" and message["parse_mode"] == "HTML" and message["text"] == bot.HELP


def test_webhook_links_a_watch_and_limits_each_chat(telegram_api: type[FakeBot], monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_WEBHOOK_SECRET", SECRET)
    linked: list[tuple[str, str]] = []

    def link_chat(code: str, chat: str) -> int:
        linked.append((code, chat))
        return 1

    monkeypatch.setattr(bot.store, "link_chat", link_chat)
    client = TestClient(api.app)
    headers = {"X-Telegram-Bot-Api-Secret-Token": SECRET}

    client.post(api.TELEGRAM_WEBHOOK, json={"update_id": 2, "message": {"text": "/start AbC12345", "chat": {"id": 31}}}, headers=headers)
    assert linked == [("AbC12345", "31")] and "Linked." in telegram_api.sent[-1]["text"]

    for n in range(13):
        client.post(api.TELEGRAM_WEBHOOK, json={"update_id": 10 + n, "message": {"text": "/help", "chat": {"id": 32}}}, headers=headers)
    assert telegram_api.sent[-1]["text"].startswith("Slow down")


def test_webhook_checks_the_secret_before_reading_the_body(telegram_api: type[FakeBot], monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_WEBHOOK_SECRET", SECRET)
    client = TestClient(api.app)
    junk = client.post(api.TELEGRAM_WEBHOOK, content=b"not json", headers={"content-type": "application/json"})
    assert junk.status_code == 404
    signed = client.post(api.TELEGRAM_WEBHOOK, content=b"not json", headers={"content-type": "application/json", "X-Telegram-Bot-Api-Secret-Token": SECRET})
    assert signed.status_code == 200 and signed.json() == {"ok": False}


def test_an_unexpected_failure_still_answers_with_200(telegram_api: type[FakeBot], monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_WEBHOOK_SECRET", SECRET)

    def explode(_text: str, _chat: str) -> str:
        raise RuntimeError("boom")

    monkeypatch.setattr(bot, "reply", explode)
    response = TestClient(api.app).post(
        api.TELEGRAM_WEBHOOK, json={"update_id": 5, "message": {"text": "/help", "chat": {"id": 41}}}, headers={"X-Telegram-Bot-Api-Secret-Token": SECRET}
    )
    assert response.status_code == 200 and telegram_api.sent[-1]["text"].startswith("Something went wrong")


def test_watch_from_the_bot_dedupes_and_caps(monkeypatch: pytest.MonkeyPatch) -> None:
    outcomes = iter(["added", "exists", "full"])

    def add_chat_watch(*_args: object) -> str:
        return next(outcomes)

    monkeypatch.setattr(bot.store, "add_chat_watch", add_chat_watch)
    assert "Watching" in bot.reply(f"/watch {HOTKEY} 19", "9")
    assert bot.reply(f"/watch {HOTKEY} 19", "9").startswith("Already watching")
    assert "the most one chat can" in bot.reply(f"/watch {HOTKEY} 20", "9")
