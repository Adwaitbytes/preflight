"""Anonymous analytics: every helper is pure, and nothing stored may carry an account, a hash,
an IP or a chat id. The database is faked; `report` itself is exercised against Neon."""

from __future__ import annotations

import json
from datetime import UTC, datetime, timedelta
from typing import Any

import pytest
from fastapi.testclient import TestClient

from preflight import api, bot
from preflight.core import analytics as a

HOTKEY = "5FcJiV9Vc2Y5GemgWoXhksvQVXQ99csas9En9nYbSx38sS93"
HASH = "0x" + "ab" * 32
CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
NOW = datetime(2026, 10, 30, 12, tzinfo=UTC)


def ctx(ua: str = CHROME, **headers: str) -> a.Context:
    return a.Context(ip="203.0.113.7", ua=ua, host="preflight-lemon.vercel.app", headers=headers)


def test_page_templates_never_keep_what_was_looked_up() -> None:
    assert a.page_template(f"/doctor/finney/{HOTKEY}?netuid=19") == "/doctor/finney/:key"
    assert a.page_template("/tx/finney/9382178-8") == "/tx/finney/:ref"
    assert a.page_template(f"/tx/finney/{HASH}") == "/tx/finney/:hash"
    assert a.page_template("/d/AbC12xyz9") == "/d/:id"
    assert a.page_template(f"/fleet/test/{HOTKEY}/") == "/fleet/test/:key"
    assert a.page_template("/epoch/finney/19") == "/epoch/finney/19"
    assert a.page_template("") == "/" and a.page_template("/<script>") == "/script"
    assert a.clean_text(f"pasted {HOTKEY} and {HASH}") == "pasted :key and :hash"


def test_user_agents_read_as_browser_os_device_and_automation() -> None:
    assert (a.browser_of(CHROME), a.os_of(CHROME), a.device_of(CHROME)) == ("Chrome", "macOS", "desktop")
    assert (a.browser_of(IPHONE), a.os_of(IPHONE), a.device_of(IPHONE)) == ("Safari", "iOS", "mobile")
    assert a.device_of(CHROME, viewport=390) == "mobile" and a.device_of(IPHONE, viewport=1440) == "desktop"
    for ua in ("Googlebot/2.1", "curl/8.4", "Mozilla/5.0 HeadlessChrome/130", "python-httpx/0.28", ""):
        assert a.is_automated(ua), ua
    assert not a.is_automated(CHROME) and not a.is_automated(IPHONE)


def test_sources_prefer_campaign_tags_then_referrers() -> None:
    own = "preflight-lemon.vercel.app"
    assert a.source_of("https://www.google.com/search?q=x", own, None) == "Google"
    assert a.source_of("https://t.me/somechannel", own, None) == "Telegram"
    assert a.source_of(f"https://{own}/live", own, None) == "direct"
    assert a.source_of(None, own, "HackQuest") == "hackquest"
    assert a.source_of("https://news.example.org/a", own, None) == "news.example.org"


def test_api_calls_are_named_by_tool_and_caller() -> None:
    assert a.tool_of(f"/v1/doctor/finney/{HOTKEY}") == "doctor"
    assert a.tool_of("/v1/epoch/finney/64/check") == "epoch-check" and a.tool_of("/v1/epoch/finney/64") == "epoch"
    assert a.tool_of("/v1/live/finney") is None and a.tool_of("/v1/health") is None
    assert a.network_of(f"/v1/doctor/test/{HOTKEY}") == "test" and a.network_of("/v1/ask") is None
    assert a.client_of(CHROME, "site") == "site" and a.client_of("curl/8.4", None) == "curl"
    assert a.client_of("python-httpx/0.28", None) == "python" and a.client_of(CHROME, None) == "browser"


def test_visitors_are_unique_within_a_day_and_unlinkable_across_days() -> None:
    today = a.visitor_hash("203.0.113.7", CHROME, "2026-10-30", "salt")
    assert today == a.visitor_hash("203.0.113.7", CHROME, "2026-10-30", "salt")
    assert today != a.visitor_hash("203.0.113.7", CHROME, "2026-10-31", "salt")
    assert today is not None and "203" not in today and len(today) == 16
    assert a.visitor_hash("203.0.113.7", CHROME, "2026-10-30", None) is None


def test_geography_comes_from_vercel_headers() -> None:
    assert a.geo({"x-vercel-ip-country": "br", "x-vercel-ip-country-region": "SP", "x-vercel-ip-city": "S%C3%A3o%20Paulo"}) == ("BR", "SP", "São Paulo")
    assert a.geo({}) == (None, None, None)


def test_a_beacon_is_stored_without_any_account_or_address() -> None:
    beacon = a.Beacon.model_validate(
        {
            "session": "s3ss10n-abc",
            "referrer": "https://t.co/xyz",
            "viewport": 390,
            "network": "finney",
            "returning": True,
            "events": [
                {"type": "view", "name": "page", "path": f"/doctor/finney/{HOTKEY}?netuid=19"},
                {"type": "leave", "name": "page", "path": f"/doctor/finney/{HOTKEY}", "value": 9e7},
                {"type": "action", "name": "search", "path": "/", "detail": f"hotkey {HOTKEY}"},
                {"type": "action", "name": "Bad Name!", "path": "/"},
                {"type": "vital", "name": "LCP", "path": "/live", "value": 1830},
                {"type": "vital", "name": "MADEUP", "path": "/live", "value": 1},
                {"type": "view", "name": "page", "path": "/stats"},
            ],
        }
    )
    rows = a.rows_from_beacon(beacon, ctx(x_vercel_ip_country="DE"), NOW, "salt")
    assert [r["kind"] for r in rows] == ["view", "leave", "action", "vital"]
    stored = json.dumps(rows, default=str)
    assert HOTKEY not in stored and "203.0.113.7" not in stored
    view, leave, action, vital = rows
    assert view["name"] == "/doctor/finney/:key" and view["props"]["returning"] is True
    assert (view["device"], view["source"], view["network"], view["automated"]) == ("mobile", "X", "finney", False)
    assert leave["value"] == a.MAX_ENGAGED_MS
    assert action["props"]["detail"] == "hotkey :key"
    assert (vital["name"], vital["props"]["page"]) == ("LCP", "/live")


def test_api_rows_name_the_tool_and_keep_the_site_server_out_of_geography() -> None:
    row = a.api_row(f"/v1/epoch/finney/64?hotkey={HOTKEY}", "POST", 200, 812.34, ctx("curl/8.4", **{"x-vercel-ip-country": "US"}), None, NOW, "salt")
    assert row is not None
    assert (row["name"], row["network"], row["client"], row["country"], row["automated"]) == ("epoch-whatif", "finney", "curl", "US", True)
    assert row["props"] == {"netuid": 64} and HOTKEY not in json.dumps(row)
    site = a.api_row(f"/v1/doctor/finney/{HOTKEY}", "GET", 200, 1500, ctx(**{"x-vercel-ip-country": "US"}), "site", NOW, "salt")
    assert site is not None and (site["client"], site["country"], site["visitor"], site["automated"]) == ("site", None, None, False)
    assert a.api_row("/v1/health", "GET", 200, 3, ctx(), None, NOW, "salt") is None


def test_bot_usage_is_the_command_never_its_arguments() -> None:
    def update(text: str) -> dict[str, object]:
        return {"message": {"text": text, "chat": {"id": 4242}}}

    assert bot.usage_of(update(f"/doctor {HOTKEY} 64")) == ("/doctor", "4242")
    assert bot.usage_of(update(HOTKEY)) == ("paste", "4242")
    assert bot.usage_of(update("/nope")) == ("/unknown", "4242")
    assert bot.usage_of({"edited_message": {}}) is None
    row = a.bot_row("/doctor", "4242", NOW, "salt")
    assert row["name"] == "/doctor" and "4242" not in json.dumps(row)


def test_the_series_has_every_bucket_even_empty_ones() -> None:
    hourly = a._series([], NOW - timedelta(hours=24), NOW, "hour")  # pyright: ignore[reportPrivateUsage]
    daily = a._series([], NOW - timedelta(days=7), NOW, "day")  # pyright: ignore[reportPrivateUsage]
    assert len(hourly) == 25 and len(daily) == 8 and all(p.views == 0 for p in hourly + daily)


def test_vitals_are_rated_on_googles_thresholds() -> None:
    assert a.rating("LCP", 2400) == "good" and a.rating("LCP", 3000) == "needs work" and a.rating("INP", 600) == "poor"


@pytest.fixture
def recorded(monkeypatch: pytest.MonkeyPatch) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    monkeypatch.setattr(a, "enabled", lambda: True)
    monkeypatch.setattr(a, "record", rows.extend)
    return rows


def test_collect_stores_clean_rows_and_respects_do_not_track(recorded: list[dict[str, Any]]) -> None:
    client = TestClient(api.app)
    body = {"session": "s3ss10n-abc", "events": [{"type": "view", "name": "page", "path": f"/doctor/finney/{HOTKEY}"}]}
    assert client.post("/v1/collect", json=body).status_code == 204
    assert [r["name"] for r in recorded] == ["/doctor/finney/:key"]
    assert client.post("/v1/collect", json=body, headers={"DNT": "1"}).status_code == 204
    assert client.post("/v1/collect", content=b"not json").status_code == 204
    assert len(recorded) == 1


def test_stats_answers_only_with_the_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("STATS_PASSWORD", "a-long-random-stats-key")
    monkeypatch.setattr(a, "enabled", lambda: True)
    empty = a.StatsReport.model_validate(
        {
            "range": "24h", "since": NOW.isoformat(), "generated_at": NOW.isoformat(), "include_automated": False,
            "totals": {"visitors": 0, "sessions": 0, "views": 0, "avg_engaged_s": None, "median_engaged_s": None, "bounce_rate": 0, "pages_per_session": 0, "returning_share": 0, "tool_runs": 0, "api_error_rate": 0, "rejected": 0, "bot_messages": 0, "bot_chats": 0, "active_now": 0},
            "series": [], "pages": [], "tools": [], "countries": [], "cities": [], "sources": [], "devices": [], "browsers": [], "systems": [],
            "networks": [], "clients": [], "actions": [], "bot_commands": [], "vitals": [], "engagement": [], "hours": [0] * 24, "recent": [], "notes": [],
        }
    )  # fmt: skip
    asked: list[tuple[str, bool]] = []

    def fake_report(range_: str = "7d", include_automated: bool = False) -> a.StatsReport:
        asked.append((range_, include_automated))
        return empty

    monkeypatch.setattr(a, "report", fake_report)
    client = TestClient(api.app)
    assert client.get("/v1/stats").status_code == 404
    assert client.get("/v1/stats", headers={"x-stats-key": "wrong"}).status_code == 404
    ok = client.get("/v1/stats?range=24h&automated=true", headers={"x-stats-key": "a-long-random-stats-key"})
    assert ok.status_code == 200 and ok.headers["cache-control"] == "no-store"
    assert ok.json()["range"] == "24h" and asked == [("24h", True)]


def test_tool_calls_are_timed_and_counted(recorded: list[dict[str, Any]], monkeypatch: pytest.MonkeyPatch) -> None:
    from preflight.core.epoch import preview as module

    from .factory import BLOCK, subnet

    def state(_net: object, _netuid: int) -> module.EpochState:
        return module.EpochState(subnet=subnet(), epoch_block=BLOCK + 350)

    monkeypatch.setattr(module, "epoch_state", state)
    response = TestClient(api.app).get("/v1/epoch/finney/911", headers={"x-preflight-client": "browser", "User-Agent": CHROME})
    assert response.status_code == 200
    [row] = [r for r in recorded if r["kind"] == "api"]
    assert (row["name"], row["status"], row["client"], row["props"]) == ("epoch", 200, "browser", {"netuid": 911})
    assert row["value"] >= 0
