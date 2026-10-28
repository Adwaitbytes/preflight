"""Evaluate every watch once: link new chats, diagnose, send fresh alerts, store state.

Run by `preflight watch run` locally (every 30 s against localnet for the demo) and by the
scheduled GitHub Actions workflow every 10 minutes against Neon.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from .. import store
from ..chain.network import ChainUnreachable, Network
from ..doctor.engine import diagnose
from ..epoch.preview import next_epoch
from ..models import Diagnosis, EpochPreview
from . import telegram
from .alerts import Alert, evaluate, load_state, message

SITE = os.environ.get("PREFLIGHT_SITE", "https://preflight-lemon.vercel.app")


@dataclass
class RunReport:
    linked: int = 0
    checked: int = 0
    alerts: list[tuple[str, Alert]] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    delivered: int = 0


def link_chats(report: RunReport) -> None:
    try:
        if telegram.webhook_url():
            # Telegram refuses getUpdates while a webhook is set; the API links chats then.
            return
        requests = telegram.start_requests()
    except telegram.TelegramUnavailable as error:
        report.errors.append(str(error))
        return
    for request in requests:
        if store.link_chat(request.code, request.chat_id):
            report.linked += 1
            try:
                telegram.send(request.chat_id, "Preflight is watching your neuron. You will get a message when something breaks")
            except telegram.TelegramUnavailable as error:
                report.errors.append(str(error))
    if requests:
        # Acknowledge processed updates so they are not read again.
        try:
            telegram.start_requests(offset=max(r.update_id for r in requests) + 1)
        except telegram.TelegramUnavailable as error:
            report.errors.append(str(error))


def forecast(diagnosis: Diagnosis, report: RunReport) -> EpochPreview | None:
    """The next epoch for a watched miner, so a coming cut alerts before it is paid. Best effort:
    a failed forecast must not stop the diagnosis alerts."""
    if diagnosis.role != "miner" or diagnosis.neuron is None:
        return None
    try:
        return next_epoch(Network.resolve(diagnosis.chain.network), diagnosis.netuid, hotkey=diagnosis.hotkey)
    except (ChainUnreachable, ValueError, LookupError) as error:
        report.errors.append(f"forecast {diagnosis.hotkey[:8]} SN{diagnosis.netuid}: {error}")
        return None


def run_once(network: str | None = None, *, deliver: bool = True) -> RunReport:
    report = RunReport()
    if deliver and telegram.token():
        link_chats(report)
    store.prune_unlinked()
    for watch in store.watches(network):
        if not watch.get("chat_id"):
            # Nobody can be told about an unlinked watch, so it is not worth a chain read
            continue
        report.checked += 1
        try:
            result = diagnose(Network.resolve(str(watch["network"])), str(watch["hotkey"]), int(watch["netuid"]))
        except (ChainUnreachable, ValueError, LookupError) as error:
            report.errors.append(f"{watch['id']}: {error}")
            continue
        if not result.diagnoses:
            continue
        diagnosis = result.diagnoses[0]
        upcoming = forecast(diagnosis, report)
        fresh, state = evaluate(diagnosis, load_state(watch.get("last_state")), upcoming)
        for alert in fresh:
            report.alerts.append((str(watch["id"]), alert))
            chat = watch.get("chat_id")
            if deliver and chat and telegram.token():
                try:
                    telegram.send(str(chat), message(alert, diagnosis, SITE))
                    report.delivered += 1
                except telegram.TelegramUnavailable as error:
                    report.errors.append(str(error))
            store.record_alert(str(watch["id"]), alert.id, alert.model_dump())
        store.save_state(str(watch["id"]), state.model_dump())
    return report
