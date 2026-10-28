"""Telegram Bot API: send alerts and link chats. The token never leaves the environment.

Linking without sign-in: a watch created without a chat id gets a one-time code, and the
user sends `/start <code>` to the bot. With the webhook set (`preflight bot webhook`), the
API answers it at once; without one, the worker reads it with getUpdates and binds the chat.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass

import httpx

START = re.compile(r"^/start\s+([A-Za-z0-9]{6,16})\s*$")


def api_base() -> str:
    # Overridable so the delivery path can be exercised against a local stand-in in tests.
    return os.environ.get("TELEGRAM_API_BASE", "https://api.telegram.org")


class TelegramUnavailable(RuntimeError):
    pass


@dataclass(frozen=True)
class StartRequest:
    chat_id: str
    code: str
    update_id: int


def token() -> str | None:
    return os.environ.get("TELEGRAM_BOT_TOKEN") or None


def _call(method: str, payload: dict[str, object]) -> object:
    secret = token()
    if not secret:
        raise TelegramUnavailable("TELEGRAM_BOT_TOKEN is not set")
    try:
        response = httpx.post(f"{api_base()}/bot{secret}/{method}", json=payload, timeout=15.0)
        body = response.json()
    except (httpx.HTTPError, ValueError) as error:
        # Never echo the URL: it contains the token.
        raise TelegramUnavailable(f"Telegram {method} failed: {type(error).__name__}") from error
    if not body.get("ok"):
        raise TelegramUnavailable(f"Telegram {method} refused: {body.get('description', 'unknown error')}")
    return body.get("result")


def send(chat_id: str, text: str, *, html: bool = False) -> None:
    payload: dict[str, object] = {"chat_id": chat_id, "text": text, "link_preview_options": {"is_disabled": True}}
    if html:
        payload["parse_mode"] = "HTML"
    _call("sendMessage", payload)


def typing(chat_id: str) -> None:
    """Best effort: the reply still arrives if the indicator does not."""
    try:
        _call("sendChatAction", {"chat_id": chat_id, "action": "typing"})
    except TelegramUnavailable:
        return


def webhook_url() -> str | None:
    """The URL Telegram posts updates to, or None when the bot is polled with getUpdates."""
    info = _call("getWebhookInfo", {})
    url = info.get("url") if isinstance(info, dict) else None
    return str(url) if url else None


def set_webhook(url: str, secret: str) -> None:
    _call("setWebhook", {"url": url, "secret_token": secret, "allowed_updates": ["message"], "drop_pending_updates": False})


def set_commands(commands: list[tuple[str, str]]) -> None:
    _call("setMyCommands", {"commands": [{"command": c, "description": d} for c, d in commands]})


def start_requests(offset: int | None = None) -> list[StartRequest]:
    result = _call("getUpdates", {"offset": offset, "timeout": 0, "allowed_updates": ["message"]})
    found: list[StartRequest] = []
    for update in result if isinstance(result, list) else []:
        message = update.get("message") or {}
        match = START.match(str(message.get("text") or ""))
        chat = message.get("chat") or {}
        if match and chat.get("id") is not None:
            found.append(StartRequest(chat_id=str(chat["id"]), code=match.group(1), update_id=int(update["update_id"])))
    return found


def bot_username() -> str | None:
    try:
        me = _call("getMe", {})
    except TelegramUnavailable:
        return None
    return str(me.get("username")) if isinstance(me, dict) and me.get("username") else None
