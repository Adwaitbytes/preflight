"""Neon (Postgres) persistence: shared reports, watches, alerts and house counters.

Everything here is optional. Without DATABASE_URL the engine still works and these
calls report `StoreUnavailable`; counters silently skip so a missing database never
breaks a diagnosis. Queries are parameterized, always.
"""

from __future__ import annotations

import logging
import os
import secrets
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from typing import Any

import psycopg
from psycopg.rows import DictRow, dict_row
from psycopg.types.json import Jsonb

log = logging.getLogger("preflight.store")
MAX_WATCHES_PER_CHAT = 20
UNLINKED_TTL_HOURS = 24


class StoreUnavailable(RuntimeError):
    pass


def configured() -> bool:
    return bool(os.environ.get("DATABASE_URL"))


def connect() -> psycopg.Connection[DictRow]:
    """A connection used as `with connect() as db:`, which commits on success."""
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise StoreUnavailable("DATABASE_URL is not set")
    try:
        return psycopg.Connection[DictRow].connect(url, row_factory=dict_row, connect_timeout=5)
    except psycopg.OperationalError as error:
        # libpq's message names the host and role; keep it in the logs, never in a reply
        log.warning("database unreachable: %s", error)
        raise StoreUnavailable("database unreachable") from error


def new_id(length: int = 10) -> str:
    return secrets.token_urlsafe(length)[:length].replace("-", "a").replace("_", "b")


_counter_pool = ThreadPoolExecutor(max_workers=1, thread_name_prefix="preflight-count")


def count(kind: str, network: str) -> None:
    """Bump today's counter off the request path. Best effort: a lost count is fine, a
    request waiting on a database round trip to count itself is not."""
    if configured():
        _counter_pool.submit(_count, kind, network)


def _count(kind: str, network: str) -> None:
    try:
        with connect() as db:
            db.execute(
                "INSERT INTO counters (day, kind, network, count) VALUES (%s, %s, %s, 1) "
                "ON CONFLICT (day, kind, network) DO UPDATE SET count = counters.count + 1",
                (datetime.now(UTC).date(), kind, network),
            )
    except (StoreUnavailable, psycopg.Error):
        return


def join_house(member_id: str) -> None:
    with connect() as db:
        db.execute("INSERT INTO house_members (id) VALUES (%s) ON CONFLICT DO NOTHING", (member_id,))


def house_totals(since: str) -> dict[str, Any]:
    with connect() as db:
        rows = db.execute(
            "SELECT kind, COALESCE(SUM(count), 0) AS total FROM counters WHERE day >= %s GROUP BY kind",
            (since,),
        ).fetchall()
        members = db.execute("SELECT COUNT(*) AS n FROM house_members").fetchone()
    totals = {str(r["kind"]): int(r["total"]) for r in rows}
    return {
        "diagnoses": totals.get("doctor", 0),
        "errors": totals.get("tx", 0) + totals.get("explain", 0),
        "simulations": totals.get("sim", 0),
        "builders": int(members["n"]) if members else 0,
        "since": since,
    }


def save_report(kind: str, network: str, subject: str, block: int, payload: dict[str, Any]) -> str:
    report_id = new_id()
    with connect() as db:
        db.execute(
            "INSERT INTO reports (id, kind, network, subject, block, payload) VALUES (%s, %s, %s, %s, %s, %s)",
            (report_id, kind, network, subject, block, Jsonb(payload)),
        )
    return report_id


def load_report(report_id: str) -> dict[str, Any] | None:
    with connect() as db:
        row = db.execute(
            "SELECT id, kind, network, subject, block, payload, created_at FROM reports WHERE id = %s AND shared",
            (report_id,),
        ).fetchone()
    return dict(row) if row else None


def add_watch(network: str, hotkey: str, netuid: int, chat_id: str | None, rules: dict[str, Any]) -> dict[str, Any]:
    watch_id = new_id()
    link_code = None if chat_id else new_id(8)
    with connect() as db:
        db.execute(
            "INSERT INTO watches (id, network, hotkey, netuid, chat_id, link_code, rules) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (watch_id, network, hotkey, netuid, chat_id, link_code, Jsonb(rules)),
        )
    return {"id": watch_id, "link_code": link_code}


def add_chat_watch(network: str, hotkey: str, netuid: int, chat_id: str) -> str:
    """A watch already bound to a chat, from the bot. "added", "exists" or "full"."""
    with connect() as db:
        rows = db.execute("SELECT network, hotkey, netuid FROM watches WHERE chat_id = %s", (chat_id,)).fetchall()
        if any((r["network"], r["hotkey"], r["netuid"]) == (network, hotkey, netuid) for r in rows):
            return "exists"
        if len(rows) >= MAX_WATCHES_PER_CHAT:
            return "full"
        db.execute(
            "INSERT INTO watches (id, network, hotkey, netuid, chat_id, link_code, rules) VALUES (%s, %s, %s, %s, %s, NULL, %s)",
            (new_id(), network, hotkey, netuid, chat_id, Jsonb({})),
        )
    return "added"


def prune_unlinked() -> int:
    """Watches nobody linked within a day can never alert anyone; drop them."""
    with connect() as db:
        return db.execute(
            "DELETE FROM watches WHERE chat_id IS NULL AND created_at < now() - make_interval(hours => %s)", (UNLINKED_TTL_HOURS,)
        ).rowcount


def link_chat(link_code: str, chat_id: str) -> int:
    with connect() as db:
        cursor = db.execute(
            "UPDATE watches SET chat_id = %s, link_code = NULL WHERE link_code = %s", (chat_id, link_code)
        )
        return cursor.rowcount


def watches(network: str | None = None) -> list[dict[str, Any]]:
    with connect() as db:
        if network:
            rows = db.execute("SELECT * FROM watches WHERE network = %s ORDER BY created_at", (network,)).fetchall()
        else:
            rows = db.execute("SELECT * FROM watches ORDER BY created_at").fetchall()
    return [dict(r) for r in rows]


def remove_watch(watch_id: str) -> int:
    with connect() as db:
        return db.execute("DELETE FROM watches WHERE id = %s", (watch_id,)).rowcount


def save_state(watch_id: str, state: dict[str, Any]) -> None:
    with connect() as db:
        db.execute("UPDATE watches SET last_state = %s WHERE id = %s", (Jsonb(state), watch_id))


def record_alert(watch_id: str, rule_id: str, payload: dict[str, Any]) -> None:
    with connect() as db:
        db.execute(
            "INSERT INTO alerts (watch_id, rule_id, payload) VALUES (%s, %s, %s)",
            (watch_id, rule_id, Jsonb(payload)),
        )
