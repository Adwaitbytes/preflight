"""Anonymous usage analytics behind the private /stats page.

What is kept: the page template (`/doctor/finney/:key`, never the hotkey), how long a page
was looked at, coarse geography from Vercel's edge headers, device class, browser, OS, the
traffic source, Core Web Vitals, which tool an API call ran and how long it took, and which
bot command was sent. What is never kept: IP addresses, hotkeys, coldkeys, hashes, chat ids,
full URLs or anything typed into a box. A visitor is a hash of IP and user agent salted per
UTC day, so it counts unique visitors within a day and cannot follow anyone across days.

The pure helpers here are unit tested; `record` and the queries need DATABASE_URL and fail
quietly without it, so analytics can never break an answer.
"""

from __future__ import annotations

import hashlib
import hmac
import logging
import math
import os
import re
from collections.abc import Mapping
from datetime import UTC, datetime, timedelta
from typing import Any, Literal
from urllib.parse import unquote, urlsplit

import psycopg
from psycopg.types.json import Jsonb
from pydantic import BaseModel, ConfigDict, Field, field_validator

from . import store
from .models import (
    CountStat,
    GeoStat,
    PageStat,
    RecentEvent,
    StatsPoint,
    StatsReport,
    StatsTotals,
    ToolStat,
    VitalStat,
)

log = logging.getLogger("preflight.analytics")

RETENTION_DAYS = 90
MAX_ENGAGED_MS = 2 * 3600 * 1000
ACTIVE_WINDOW_MINUTES = 5

SS58 = re.compile(r"5[1-9A-HJ-NP-Za-km-z]{46,47}")
HEX = re.compile(r"0x[0-9a-fA-F]{8,}")
BLOCK_REF = re.compile(r"(?<=/)\d{1,10}-\d{1,6}(?=/|$)")
UNSAFE = re.compile(r"[^A-Za-z0-9/_:.\-]")
SLUG = re.compile(r"^[a-z][a-z0-9_-]{0,39}$")
VITALS = {"LCP": (2500, 4000), "INP": (200, 500), "CLS": (0.1, 0.25), "FCP": (1800, 3000), "TTFB": (800, 1800)}
AUTOMATED = re.compile(
    r"bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|vercel|python|curl|httpx|wget|"
    r"node-fetch|undici|axios|go-http|playwright|puppeteer|phantom|monitor|uptime|scan",
    re.I,
)
SOURCES = (
    ("google", "Google"), ("bing.", "Bing"), ("duckduckgo", "DuckDuckGo"), ("t.co", "X"), ("x.com", "X"),
    ("twitter", "X"), ("github", "GitHub"), ("t.me", "Telegram"), ("telegram", "Telegram"),
    ("discord", "Discord"), ("linkedin", "LinkedIn"), ("lnkd.in", "LinkedIn"), ("reddit", "Reddit"),
    ("claude.ai", "Claude"), ("chatgpt", "ChatGPT"), ("perplexity", "Perplexity"), ("taostats", "Taostats"),
    ("hackquest", "HackQuest"), ("youtube", "YouTube"),
)  # fmt: skip
TOOLS = (
    (re.compile(r"^/v1/doctor/"), "doctor"),
    (re.compile(r"^/v1/tx/"), "tx"),
    (re.compile(r"^/v1/sim/"), "simulate"),
    (re.compile(r"^/v1/epoch/[^/]+/\d+/check"), "epoch-check"),
    (re.compile(r"^/v1/epoch/"), "epoch"),
    (re.compile(r"^/v1/change/"), "why"),
    (re.compile(r"^/v1/fleet/"), "fleet"),
    (re.compile(r"^/v1/economics/"), "mine"),
    (re.compile(r"^/v1/explain-error"), "explain"),
    (re.compile(r"^/v1/plan/"), "plan"),
    (re.compile(r"^/v1/find"), "find"),
    (re.compile(r"^/v1/ask"), "ask"),
    (re.compile(r"^/v1/reports"), "share"),
    (re.compile(r"^/v1/watch"), "watch"),
    (re.compile(r"^/v1/history/"), "history"),
    (re.compile(r"^/v1/subnets/[^/]+/\d+"), "subnet"),
    (re.compile(r"^/v1/house/join"), "house-join"),
)
NETWORKS = ("finney", "test", "local")

Range = Literal["24h", "7d", "30d"]
RANGES: dict[str, tuple[timedelta, str]] = {"24h": (timedelta(hours=24), "hour"), "7d": (timedelta(days=7), "day"), "30d": (timedelta(days=30), "day")}


# ---- Pure helpers ---------------------------------------------------------------------------


def page_template(path: str) -> str:
    """A page path with every account, hash, transaction ref and share id replaced by a
    placeholder, so a view can be counted without recording what was looked up."""
    raw = unquote(path.split("?", 1)[0].split("#", 1)[0])[:300] or "/"
    raw = SS58.sub(":key", raw)
    raw = HEX.sub(":hash", raw)
    raw = BLOCK_REF.sub(":ref", raw)
    raw = re.sub(r"^/d/[^/]+", "/d/:id", raw)
    raw = UNSAFE.sub("", raw)
    raw = re.sub(r"/{2,}", "/", raw)
    if not raw.startswith("/"):
        raw = "/" + raw
    return raw.rstrip("/") or "/"


def clean_text(value: str | None, limit: int = 60) -> str | None:
    """Short free text that may be stored: nothing that looks like an account or a hash."""
    if not value:
        return None
    text = SS58.sub(":key", HEX.sub(":hash", str(value))).strip()[:limit]
    return text or None


def browser_of(ua: str) -> str:
    if re.search(r"Edg/", ua):
        return "Edge"
    if re.search(r"OPR/|Opera", ua):
        return "Opera"
    if re.search(r"SamsungBrowser", ua):
        return "Samsung Internet"
    if re.search(r"Firefox/|FxiOS", ua):
        return "Firefox"
    if re.search(r"Chrome/|CriOS", ua):
        return "Chrome"
    if re.search(r"Safari/", ua):
        return "Safari"
    return "Other"


def os_of(ua: str) -> str:
    if re.search(r"iPhone|iPad|iPod", ua):
        return "iOS"
    if re.search(r"Android", ua):
        return "Android"
    if re.search(r"CrOS", ua):
        return "ChromeOS"
    if re.search(r"Mac OS X|Macintosh", ua):
        return "macOS"
    if re.search(r"Windows", ua):
        return "Windows"
    if re.search(r"Linux", ua):
        return "Linux"
    return "Other"


def device_of(ua: str, viewport: int | None = None) -> str:
    """The viewport width the page reported wins; the user agent is the fallback."""
    if viewport:
        return "mobile" if viewport < 640 else "tablet" if viewport < 1024 else "desktop"
    if re.search(r"iPad|Tablet", ua):
        return "tablet"
    if re.search(r"Mobi|iPhone|Android", ua):
        return "mobile"
    return "desktop"


def is_automated(ua: str) -> bool:
    return not ua or bool(AUTOMATED.search(ua))


def source_of(referrer: str | None, own_host: str | None, utm_source: str | None) -> str:
    """Where a session came from: a campaign tag first, then the referring site, else direct."""
    tagged = clean_text(utm_source, 40)
    if tagged:
        return tagged.lower()
    if not referrer:
        return "direct"
    host = (urlsplit(referrer).hostname or "").lower().removeprefix("www.")
    if not host or (own_host and host == own_host.lower().removeprefix("www.")):
        return "direct"
    for needle, label in SOURCES:
        if needle in host:
            return label
    return host[:60]


def client_of(ua: str, declared: str | None) -> str:
    """Who called the API: the site's own server and browser code say so in a header."""
    if declared in ("site", "browser"):
        return declared
    if re.search(r"curl", ua, re.I):
        return "curl"
    if re.search(r"python|httpx|aiohttp|requests", ua, re.I):
        return "python"
    if re.search(r"node|undici|axios", ua, re.I):
        return "node"
    if "Mozilla" in ua:
        return "browser"
    return "other"


def tool_of(path: str) -> str | None:
    return next((name for pattern, name in TOOLS if pattern.search(path)), None)


def network_of(path: str) -> str | None:
    parts = path.split("/")
    return parts[3] if len(parts) > 3 and parts[3] in NETWORKS else None


def visitor_hash(ip: str, ua: str, day: str, salt: str | None) -> str | None:
    """Same person, same UTC day: same value. Different day: unrelated value. No salt: none."""
    if not salt or not ip:
        return None
    return hmac.new(salt.encode(), f"{day}|{ip}|{ua}".encode(), hashlib.sha256).hexdigest()[:16]


def geo(headers: Mapping[str, str]) -> tuple[str | None, str | None, str | None]:
    """Country, region and city as Vercel's edge resolved them; absent off Vercel."""
    country = (headers.get("x-vercel-ip-country") or "").strip()[:2].upper() or None
    region = clean_text(unquote(headers.get("x-vercel-ip-country-region") or ""), 20)
    city = clean_text(unquote(headers.get("x-vercel-ip-city") or ""), 60)
    return country, region, city


def rating(metric: str, value: float) -> Literal["good", "needs work", "poor"]:
    good, poor = VITALS.get(metric, (math.inf, math.inf))
    return "good" if value <= good else "needs work" if value <= poor else "poor"


# ---- What the browser sends -----------------------------------------------------------------

Scalar = str | int | float | bool


class BeaconEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")

    type: Literal["view", "leave", "action", "vital"]
    name: str = Field(max_length=80)
    path: str = Field(max_length=400)
    value: float | None = Field(default=None, ge=0, le=1e8)
    detail: str | None = Field(default=None, max_length=60)

    @field_validator("value")
    @classmethod
    def finite(cls, value: float | None) -> float | None:
        return value if value is None or math.isfinite(value) else None


class Beacon(BaseModel):
    """One batch from one browser tab. Everything is bounded and re-cleaned on arrival."""

    model_config = ConfigDict(extra="ignore")

    session: str = Field(pattern=r"^[A-Za-z0-9_-]{8,40}$")
    events: list[BeaconEvent] = Field(min_length=1, max_length=30)
    referrer: str | None = Field(default=None, max_length=400)
    utm_source: str | None = Field(default=None, max_length=80)
    utm_medium: str | None = Field(default=None, max_length=80)
    utm_campaign: str | None = Field(default=None, max_length=80)
    lang: str | None = Field(default=None, max_length=20)
    tz: str | None = Field(default=None, max_length=60)
    viewport: int | None = Field(default=None, ge=0, le=20000)
    network: Literal["finney", "test", "local"] | None = None
    returning: bool = False


class Context(BaseModel):
    """What the server knows about a request, read once from its headers."""

    ip: str
    ua: str
    host: str | None
    headers: dict[str, str]


def rows_from_beacon(beacon: Beacon, ctx: Context, now: datetime, salt: str | None) -> list[dict[str, Any]]:
    country, region, city = geo(ctx.headers)
    automated = is_automated(ctx.ua)
    visitor = visitor_hash(ctx.ip, ctx.ua, now.date().isoformat(), salt)
    device = device_of(ctx.ua, beacon.viewport)
    browser, system = browser_of(ctx.ua), os_of(ctx.ua)
    source = source_of(beacon.referrer, ctx.host, beacon.utm_source)
    rows: list[dict[str, Any]] = []
    for event in beacon.events:
        page = page_template(event.path)
        if page.startswith("/stats"):
            continue  # the owner reading the dashboard is not a visitor
        props: dict[str, Scalar] = {"page": page}
        value = event.value
        if event.type in ("view", "leave"):
            name = page
            if event.type == "leave" and value is not None:
                value = min(value, MAX_ENGAGED_MS)
            if event.type == "view":
                props |= {k: v for k, v in (("lang", clean_text(beacon.lang, 20)), ("tz", clean_text(beacon.tz, 60)), ("medium", clean_text(beacon.utm_medium, 40)), ("campaign", clean_text(beacon.utm_campaign, 60))) if v}
                props["returning"] = beacon.returning
        elif event.type == "vital":
            if event.name not in VITALS or value is None:
                continue
            name = event.name
        else:
            if not SLUG.match(event.name):
                continue
            name = event.name
        detail = clean_text(event.detail, 40)
        if detail:
            props["detail"] = detail
        rows.append(
            {
                "kind": event.type,
                "name": name,
                "session": beacon.session,
                "visitor": visitor,
                "value": value,
                "status": None,
                "network": beacon.network,
                "client": "browser",
                "country": country,
                "region": region,
                "city": city,
                "device": device,
                "browser": browser,
                "os": system,
                "source": source,
                "automated": automated,
                "props": props,
            }
        )
    return rows


def api_row(path: str, method: str, status: int, elapsed_ms: float, ctx: Context, declared_client: str | None, now: datetime, salt: str | None) -> dict[str, Any] | None:
    path = path.split("?", 1)[0]
    tool = tool_of(path)
    if tool is None:
        return None
    if tool == "epoch" and method == "POST":
        tool = "epoch-whatif"
    if tool == "share" and method == "GET":
        tool = "share-open"
    client = client_of(ctx.ua, declared_client)
    country, region, city = geo(ctx.headers) if client not in ("site",) else (None, None, None)
    netuid = next((part for part in path.split("/")[4:6] if part.isdigit()), None)
    return {
        "kind": "api",
        "name": tool,
        "session": None,
        "visitor": visitor_hash(ctx.ip, ctx.ua, now.date().isoformat(), salt) if client != "site" else None,
        "value": round(elapsed_ms, 1),
        "status": status,
        "network": network_of(path),
        "client": client,
        "country": country,
        "region": region,
        "city": city,
        "device": None,
        "browser": None,
        "os": None,
        "source": None,
        # The site's own server is a person using the site; other machines are flagged
        "automated": client not in ("site", "browser") and is_automated(ctx.ua),
        "props": {"netuid": int(netuid)} if netuid else {},
    }


def bot_row(command: str, chat_id: str | None, now: datetime, salt: str | None) -> dict[str, Any]:
    visitor = None
    if salt and chat_id:
        visitor = hmac.new(salt.encode(), f"{now.date().isoformat()}|chat|{chat_id}".encode(), hashlib.sha256).hexdigest()[:16]
    return {
        "kind": "bot",
        "name": command,
        "session": None,
        "visitor": visitor,
        "value": None,
        "status": None,
        "network": None,
        "client": "telegram",
        "country": None,
        "region": None,
        "city": None,
        "device": None,
        "browser": None,
        "os": None,
        "source": None,
        "automated": False,
        "props": {},
    }


# ---- Storage ---------------------------------------------------------------------------------

COLUMNS = ("kind", "name", "session", "visitor", "value", "status", "network", "client", "country", "region", "city", "device", "browser", "os", "source", "automated", "props")


def salt() -> str | None:
    return os.environ.get("ANALYTICS_SALT") or None


def enabled() -> bool:
    return store.configured()


def record(rows: list[dict[str, Any]]) -> None:
    """Insert rows. The API runs this as a background task after the reply is sent: nobody
    waits on it, and on Vercel the function stays alive until it finishes, where a thread
    pool can be frozen with the write still queued. A failed write is logged and dropped."""
    if rows and enabled():
        _insert(rows)


INSERT = (
    "INSERT INTO events (kind, name, session, visitor, value, status, network, client, country, region, city, device, browser, os, source, automated, props) "
    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
)


def _insert(rows: list[dict[str, Any]]) -> None:
    try:
        with store.connect() as db, db.cursor() as cursor:
            cursor.executemany(
                INSERT,
                [tuple(Jsonb(row["props"]) if column == "props" else row[column] for column in COLUMNS) for row in rows],
            )
    except (store.StoreUnavailable, psycopg.Error) as error:
        log.warning("analytics insert skipped: %s", type(error).__name__)


def prune(days: int = RETENTION_DAYS) -> int:
    with store.connect() as db:
        return db.execute("DELETE FROM events WHERE at < now() - make_interval(days => %s)", (days,)).rowcount


# ---- The report ------------------------------------------------------------------------------

ENGAGEMENT = (("Under 10 s", 0, 10_000), ("10 to 30 s", 10_000, 30_000), ("30 s to 1 min", 30_000, 60_000), ("1 to 3 min", 60_000, 180_000), ("3 to 10 min", 180_000, 600_000), ("Over 10 min", 600_000, None))


def _counts(rows: list[Any], label: str = "label", count: str = "n") -> list[CountStat]:
    return [CountStat(label=str(r[label] or "Unknown"), count=int(r[count])) for r in rows]


def report(range_: Range = "7d", include_automated: bool = False) -> StatsReport:
    window, bucket = RANGES[range_]
    now = datetime.now(UTC)
    since = now - window
    human = "" if include_automated else "AND NOT automated"
    web = f"at >= %(since)s {human}"
    p = {"since": since, "bucket": bucket}
    with store.connect() as db:
        db.execute("SET TIME ZONE 'UTC'")

        def q(sql: str) -> list[Any]:
            return db.execute(sql, p).fetchall()  # pyright: ignore[reportArgumentType]  # the SQL is built from constants only

        def one(sql: str) -> Any:
            rows = q(sql)
            return rows[0] if rows else {}

        sessions_sql = f"""
            SELECT session, MIN(at) AS first_at, COUNT(*) FILTER (WHERE kind = 'view') AS views,
                   COALESCE(SUM(value) FILTER (WHERE kind = 'leave'), 0) AS engaged
            FROM events WHERE session IS NOT NULL AND kind IN ('view', 'leave', 'action') AND {web}
            GROUP BY session HAVING COUNT(*) FILTER (WHERE kind = 'view') > 0"""
        totals_row = one(f"""
            WITH s AS ({sessions_sql})
            SELECT COUNT(*) AS sessions, COALESCE(SUM(views), 0) AS views,
                   AVG(engaged) FILTER (WHERE engaged > 0) AS avg_engaged,
                   percentile_cont(0.5) WITHIN GROUP (ORDER BY engaged) FILTER (WHERE engaged > 0) AS median_engaged,
                   COUNT(*) FILTER (WHERE views = 1) AS bounced,
                   AVG(views) AS pages_per_session
            FROM s""")
        visitors = one(f"SELECT COALESCE(SUM(n), 0) AS n FROM (SELECT COUNT(DISTINCT visitor) AS n FROM events WHERE kind = 'view' AND {web} GROUP BY date_trunc('day', at)) d")
        api = one(f"SELECT COUNT(*) AS runs, COUNT(*) FILTER (WHERE status >= 500) AS errors, COUNT(*) FILTER (WHERE status BETWEEN 400 AND 499) AS rejected FROM events WHERE kind = 'api' AND {web}")
        bot = one(f"SELECT COUNT(*) AS n, COUNT(DISTINCT visitor) AS chats FROM events WHERE kind = 'bot' AND {web}")
        active = one(f"SELECT COUNT(DISTINCT session) AS n FROM events WHERE session IS NOT NULL AND at >= now() - interval '{ACTIVE_WINDOW_MINUTES} minutes' {human}")
        returning = one(f"""
            SELECT COUNT(*) FILTER (WHERE (props->>'returning')::boolean) AS returning, COUNT(*) AS total
            FROM (SELECT DISTINCT ON (session) props FROM events WHERE kind = 'view' AND {web} ORDER BY session, at) f""")

        series_rows = q(f"""
            SELECT date_trunc(%(bucket)s, at) AS t,
                   COUNT(*) FILTER (WHERE kind = 'view') AS views,
                   COUNT(DISTINCT session) FILTER (WHERE kind = 'view') AS sessions,
                   COUNT(*) FILTER (WHERE kind = 'api') AS tool_runs,
                   COUNT(*) FILTER (WHERE kind = 'bot') AS bot
            FROM events WHERE {web} GROUP BY 1 ORDER BY 1""")

        pages = q(f"""
            WITH v AS (SELECT name, COUNT(*) AS views, COUNT(DISTINCT session) AS sessions FROM events WHERE kind = 'view' AND {web} GROUP BY name),
                 l AS (SELECT name, AVG(value) AS engaged FROM events WHERE kind = 'leave' AND value > 0 AND {web} GROUP BY name),
                 e AS (SELECT name, COUNT(*) AS entries FROM (SELECT DISTINCT ON (session) name FROM events WHERE kind = 'view' AND {web} ORDER BY session, at) f GROUP BY name)
            SELECT v.name, v.views, v.sessions, COALESCE(e.entries, 0) AS entries, l.engaged
            FROM v LEFT JOIN l USING (name) LEFT JOIN e USING (name) ORDER BY v.views DESC LIMIT 25""")

        tools = q(f"""
            SELECT name, COUNT(*) AS runs, COUNT(*) FILTER (WHERE status >= 500) AS errors,
                   COUNT(*) FILTER (WHERE status BETWEEN 400 AND 499) AS rejected,
                   percentile_cont(0.5) WITHIN GROUP (ORDER BY value) AS p50,
                   percentile_cont(0.95) WITHIN GROUP (ORDER BY value) AS p95
            FROM events WHERE kind = 'api' AND {web} GROUP BY name ORDER BY runs DESC""")

        first_views = f"(SELECT DISTINCT ON (session) * FROM events WHERE kind = 'view' AND {web} ORDER BY session, at) f"
        countries = q(f"SELECT country, COUNT(*) AS sessions, COUNT(DISTINCT visitor) AS visitors FROM {first_views} GROUP BY country ORDER BY sessions DESC LIMIT 30")
        cities = q(f"SELECT country, city, COUNT(*) AS sessions, COUNT(DISTINCT visitor) AS visitors FROM {first_views} WHERE city IS NOT NULL GROUP BY country, city ORDER BY sessions DESC LIMIT 30")
        sources = q(f"SELECT source AS label, COUNT(*) AS n FROM {first_views} GROUP BY source ORDER BY n DESC LIMIT 15")
        devices = q(f"SELECT device AS label, COUNT(*) AS n FROM {first_views} GROUP BY device ORDER BY n DESC")
        browsers = q(f"SELECT browser AS label, COUNT(*) AS n FROM {first_views} GROUP BY browser ORDER BY n DESC")
        systems = q(f"SELECT os AS label, COUNT(*) AS n FROM {first_views} GROUP BY os ORDER BY n DESC")
        networks = q(f"SELECT COALESCE(network, 'unknown') AS label, COUNT(*) AS n FROM events WHERE kind = 'view' AND {web} GROUP BY 1 ORDER BY n DESC")
        clients = q(f"SELECT client AS label, COUNT(*) AS n FROM events WHERE kind = 'api' AND {web} GROUP BY client ORDER BY n DESC")
        actions = q(f"SELECT name || COALESCE(' · ' || (props->>'detail'), '') AS label, COUNT(*) AS n FROM events WHERE kind = 'action' AND {web} GROUP BY 1 ORDER BY n DESC LIMIT 20")
        commands = q(f"SELECT name AS label, COUNT(*) AS n FROM events WHERE kind = 'bot' AND {web} GROUP BY name ORDER BY n DESC")
        vitals = q(f"""
            SELECT name AS metric, COALESCE(props->>'page', '*') AS page, COUNT(*) AS samples,
                   percentile_cont(0.75) WITHIN GROUP (ORDER BY value) AS p75
            FROM events WHERE kind = 'vital' AND {web}
            GROUP BY GROUPING SETS ((name), (name, props->>'page'))
            ORDER BY metric, samples DESC""")
        engagement = q(f"""
            WITH s AS ({sessions_sql})
            SELECT {", ".join(f"COUNT(*) FILTER (WHERE engaged >= {lo}{f' AND engaged < {hi}' if hi else ''}) AS b{i}" for i, (_, lo, hi) in enumerate(ENGAGEMENT))} FROM s""")
        hours = q(f"SELECT EXTRACT(hour FROM at AT TIME ZONE 'UTC')::int AS h, COUNT(*) AS n FROM events WHERE kind = 'view' AND {web} GROUP BY 1")
        recent = q(f"""
            SELECT at, kind, name, props->>'detail' AS detail, country, city, device, client, value, status
            FROM events WHERE kind <> 'vital' AND {web} ORDER BY at DESC LIMIT 50""")

    sessions = int(totals_row.get("sessions") or 0)
    runs = int(api.get("runs") or 0)
    by_hour = {int(r["h"]): int(r["n"]) for r in hours}
    eng = engagement[0] if engagement else {}
    total_returning = int(returning.get("total") or 0)
    vital_stats: list[VitalStat] = []
    for r in vitals:
        page = None if r["page"] == "*" else str(r["page"])
        if r["p75"] is None:
            continue
        value = float(r["p75"])
        vital_stats.append(VitalStat(metric=str(r["metric"]), page=page, p75=value, samples=int(r["samples"]), rating=rating(str(r["metric"]), value)))
    notes = [
        "Visitors are counted per UTC day from a salted hash that changes daily, then summed: the same person on two days counts twice",
        "API calls served from Vercel's edge cache never reach the server, so repeated identical lookups within the cache window count once",
        "The command line and the MCP server run on people's own machines and send nothing here",
    ]
    if not include_automated:
        notes.append("Crawlers, uptime checks, headless browsers and scripts are left out; switch on Include automated to see them")
    return StatsReport(
        range=range_,
        since=since.isoformat(),
        generated_at=now.isoformat(),
        include_automated=include_automated,
        totals=StatsTotals(
            visitors=int(visitors.get("n") or 0),
            sessions=sessions,
            views=int(totals_row.get("views") or 0),
            avg_engaged_s=round(float(totals_row["avg_engaged"]) / 1000, 1) if totals_row.get("avg_engaged") else None,
            median_engaged_s=round(float(totals_row["median_engaged"]) / 1000, 1) if totals_row.get("median_engaged") else None,
            bounce_rate=int(totals_row.get("bounced") or 0) / sessions if sessions else 0.0,
            pages_per_session=round(float(totals_row["pages_per_session"]), 2) if totals_row.get("pages_per_session") else 0.0,
            returning_share=int(returning.get("returning") or 0) / total_returning if total_returning else 0.0,
            tool_runs=runs,
            api_error_rate=int(api.get("errors") or 0) / runs if runs else 0.0,
            rejected=int(api.get("rejected") or 0),
            bot_messages=int(bot.get("n") or 0),
            bot_chats=int(bot.get("chats") or 0),
            active_now=int(active.get("n") or 0),
        ),
        series=_series(series_rows, since, now, bucket),
        pages=[PageStat(path=str(r["name"]), views=int(r["views"]), sessions=int(r["sessions"]), entries=int(r["entries"]), avg_engaged_s=round(float(r["engaged"]) / 1000, 1) if r["engaged"] else None) for r in pages],
        tools=[ToolStat(name=str(r["name"]), runs=int(r["runs"]), errors=int(r["errors"]), rejected=int(r["rejected"]), p50_ms=round(float(r["p50"] or 0)), p95_ms=round(float(r["p95"] or 0))) for r in tools],
        countries=[GeoStat(country=r["country"], city=None, sessions=int(r["sessions"]), visitors=int(r["visitors"])) for r in countries],
        cities=[GeoStat(country=r["country"], city=r["city"], sessions=int(r["sessions"]), visitors=int(r["visitors"])) for r in cities],
        sources=_counts(sources),
        devices=_counts(devices),
        browsers=_counts(browsers),
        systems=_counts(systems),
        networks=_counts(networks),
        clients=_counts(clients),
        actions=_counts(actions),
        bot_commands=_counts(commands),
        vitals=vital_stats,
        engagement=[CountStat(label=label, count=int(eng.get(f"b{i}") or 0)) for i, (label, _, _) in enumerate(ENGAGEMENT)],
        hours=[by_hour.get(h, 0) for h in range(24)],
        recent=[
            RecentEvent(
                at=r["at"].isoformat(),
                kind=r["kind"],
                name=str(r["name"]),
                detail=r["detail"],
                country=r["country"],
                city=r["city"],
                device=r["device"],
                client=r["client"],
                value=float(r["value"]) if r["value"] is not None else None,
                status=int(r["status"]) if r["status"] is not None else None,
            )
            for r in recent
        ],
        notes=notes,
    )


def _series(rows: list[Any], since: datetime, now: datetime, bucket: str) -> list[StatsPoint]:
    """Every bucket in the window, empty ones included, so the chart's time axis is honest."""
    step = timedelta(hours=1) if bucket == "hour" else timedelta(days=1)
    start = since.replace(minute=0, second=0, microsecond=0)
    if bucket == "day":
        start = start.replace(hour=0)
    found = {r["t"].astimezone(UTC).replace(tzinfo=UTC): r for r in rows}
    points: list[StatsPoint] = []
    t = start
    while t <= now:
        r = found.get(t)
        points.append(StatsPoint(t=t.isoformat(), views=int(r["views"]) if r else 0, sessions=int(r["sessions"]) if r else 0, tool_runs=int(r["tool_runs"]) if r else 0, bot=int(r["bot"]) if r else 0))
        t += step
    return points
