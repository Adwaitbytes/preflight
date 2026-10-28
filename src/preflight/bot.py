"""The Telegram bot: every Preflight tool in a chat, the fourth surface beside the CLI, API and MCP.

Telegram posts each message to /v1/telegram/webhook and `reply` turns it into one answer.
Commands map onto the engines; anything else goes through the Ask box's deterministic
router, so pasting a hotkey, a block-index or an error name just works. Replies are
Telegram HTML with every value from the chain escaped. Mainnet stays read only: nothing
here signs or submits.
"""

from __future__ import annotations

import logging
import os
import re
from collections.abc import Callable
from html import escape, unescape
from urllib.parse import quote

from .core import store, validate
from .core.ask import ask
from .core.chain.network import ChainUnreachable, Network
from .core.models import Diagnosis, Verdict
from .core.watch import telegram

SITE = os.environ.get("PREFLIGHT_SITE", "https://preflight-lemon.vercel.app")
MAX_CHARS = 3900  # Telegram refuses messages over 4096 characters
NETWORKS = {"test": "test", "testnet": "test", "finney": "finney", "mainnet": "finney"}
COMMAND = re.compile(r"^/([A-Za-z_]+)(?:@\w+)?(?:\s+(.*))?$", re.S)
DOT = {Verdict.BROKEN: "🔴", Verdict.WARNING: "🟡", Verdict.HEALTHY: "🟢"}
LIVE_ORDER = {"register": 0, "subnet": 0, "stake": 1, "unstake": 1, "transfer": 1, "serve": 1, "shielded": 3, "evm": 4, "weights": 5}
log = logging.getLogger("preflight.bot")

HELP = """<b>Preflight</b> explains Bittensor in plain words. Paste a hotkey, a transaction or an error, or use:

/doctor &lt;hotkey&gt; [netuid]: why it earns what it earns
/why &lt;hotkey&gt; &lt;netuid&gt;: why its incentive changed
/fleet &lt;coldkey&gt;: every seat a coldkey owns
/tx &lt;block-index or hash&gt;: decode a transaction
/explain &lt;error&gt;: what an error means, and the fix
/mine &lt;netuid&gt;: should I mine here?
/subnet &lt;netuid&gt;: health and registration cost
/weather: what is failing on chain right now
/live: the latest blocks as sentences
/plan: what launching a subnet costs
/find &lt;words&gt;: subnets that do something
/watch &lt;hotkey&gt; &lt;netuid&gt;: message me here when it breaks

Add <code>test</code> to any command for testnet. Mainnet is read only: nothing here signs."""

COMMANDS = [
    ("doctor", "Why a hotkey earns what it earns"),
    ("why", "Why a hotkey's incentive changed"),
    ("fleet", "Every seat a coldkey owns"),
    ("tx", "Decode a transaction"),
    ("explain", "What an error means, and the fix"),
    ("mine", "Should I mine this subnet?"),
    ("subnet", "Subnet health and registration cost"),
    ("weather", "What is failing on chain right now"),
    ("live", "The latest blocks as sentences"),
    ("plan", "What launching a subnet costs"),
    ("find", "Subnets that do something"),
    ("watch", "Alert me here when my neuron breaks"),
    ("help", "Everything Preflight can do"),
]


class Usage(ValueError):
    """The command was understood but its arguments were not."""


def short(address: str | None) -> str:
    text = address or ""
    return f"{text[:6]}...{text[-4:]}" if len(text) >= 46 else text


def prose(text: str) -> str:
    """Escape catalog prose and keep its `code` spans as code."""
    return re.sub(r"`([^`\n]+)`", r"<code>\1</code>", escape(text))


def link(path: str, label: str) -> str:
    return f'<a href="{escape(SITE + path, quote=True)}">{escape(label)}</a>'


def join(lines: list[str]) -> str:
    """Whole lines only, so a cut never splits an HTML tag."""
    out: list[str] = []
    size = 0
    for line in lines:
        if size + len(line) + 1 > MAX_CHARS:
            out.append("...")
            break
        out.append(line)
        size += len(line) + 1
    return "\n".join(out)


def _split(args: str) -> tuple[list[str], Network]:
    words = args.split()
    names = [NETWORKS[w.lower()] for w in words if w.lower() in NETWORKS]
    rest = [w for w in words if w.lower() not in NETWORKS]
    return rest, Network.resolve(names[-1] if names else "finney")


def _netuid(value: str, usage: str) -> int:
    if not value.isdigit():
        raise Usage(usage)
    number = validate.netuid(int(value))
    if number is None:
        raise Usage(usage)
    return number


def _findings(d: Diagnosis, limit: int) -> list[str]:
    lines: list[str] = []
    for f in d.findings[:limit]:
        lines.append(f"• <b>{escape(f.id)}</b> {escape(f.severity.value)}: {escape(f.title)}")
        if f.fix and f.fix.kind in ("command", "code"):
            lines.append(f"  Fix: <code>{escape(f.fix.text)}</code>")
        elif f.fix:
            lines.append(f"  {prose(f.fix.text)}")
    return lines


def doctor(args: str, _chat: str) -> str:
    from .core.doctor.engine import diagnose

    words, net = _split(args)
    if not words:
        raise Usage("Send /doctor followed by a hotkey, and a netuid if you want one subnet")
    hotkey = validate.ss58(words[0])
    netuid = _netuid(words[1], "The netuid is a number, like /doctor <hotkey> 19") if len(words) > 1 else None
    report = diagnose(net, hotkey, netuid)
    lines = [f"{DOT[report.verdict]} <b>{escape(report.verdict.value.upper())}</b> · {escape(short(hotkey))}", f"<b>{escape(report.headline)}</b>"]
    for d in report.diagnoses[:3]:
        uid = f" · UID {d.neuron.uid}" if d.neuron else ""
        # With one subnet the report headline already is this diagnosis's headline.
        said = "" if len(report.diagnoses) == 1 else f": {escape(d.headline)}"
        lines += ["", f"{DOT[d.verdict]} <b>SN{d.netuid}{uid} · {escape(d.role)}</b>{said}", *_findings(d, 3)]
    if len(report.diagnoses) > 3:
        lines.append(f"\nand {len(report.diagnoses) - 3} more subnets")
    query = f"?netuid={netuid}" if netuid is not None else ""
    lines += ["", f"{link(f'/doctor/{net.name}/{hotkey}{query}', 'Full report')} · block {report.chain.block:,}"]
    return join(lines)


def why(args: str, _chat: str) -> str:
    from .core.doctor.change import explain_change

    words, net = _split(args)
    usage = "Send /why <hotkey> <netuid>, and optionally how many epochs back, like /why <hotkey> 19 3"
    if len(words) < 2:
        raise Usage(usage)
    hotkey = validate.ss58(words[0])
    netuid = _netuid(words[1], usage)
    epochs = max(1, min(int(words[2]), 48)) if len(words) > 2 and words[2].isdigit() else 1
    c = explain_change(net, hotkey, netuid, epochs=epochs)
    arrow = "📈" if c.change > 0.05 else "📉" if c.change < -0.05 else "⏸"
    lines = [f"{arrow} <b>{escape(c.headline)}</b>"]
    if c.drivers:
        lines += ["", "<b>Validators that moved it</b>"]
        for d in c.drivers[:4]:
            lines.append(f"• UID {d.uid} ({d.stake_share_after or d.stake_share_before:.1%} of stake) {escape(d.reason)}")
    lines += ["", *(f"<i>{escape(note)}</i>" for note in c.notes[:2])]
    lines += ["", link(f"/doctor/{net.name}/{hotkey}?netuid={netuid}", "Open the full diagnosis")]
    return join(lines)


def fleet(args: str, _chat: str) -> str:
    from .core.doctor.fleet import fleet as run

    words, net = _split(args)
    if not words:
        raise Usage("Send /fleet followed by a coldkey")
    coldkey = validate.ss58(words[0], "coldkey")
    r = run(net, coldkey)
    lines = [f"<b>{escape(r.headline)}</b>", f"{r.broken} broken, {r.warning} to watch, {r.healthy} healthy · about {r.tao_per_day:,.2f} TAO a day", ""]
    for row in r.rows[:10]:
        where = f"SN{row.netuid} UID {row.uid}" if row.netuid is not None else "no seat"
        worst = f": {escape(row.worst.id)} {escape(row.worst.title)}" if row.worst else ""
        lines.append(f"{DOT[row.verdict]} {where} · {escape(short(row.hotkey))}{worst}")
    lines += ["", link(f"/fleet/{net.name}/{coldkey}", "Open the fleet")]
    return join(lines)


def tx(args: str, _chat: str) -> str:
    from .core.tx.debugger import debug

    words, net = _split(args)
    if not words:
        raise Usage("Send /tx followed by a block-index like 9380607-15, or an extrinsic hash")
    r = debug(net, words[0])
    state = "✅ <b>SUCCESS</b>" if r.success else "❌ <b>FAILED</b>"
    lines = [f"{state} <code>{escape(r.pallet)}.{escape(r.call)}</code> · block {r.block:,} index {r.index}", f"Signer {escape(short(r.signer) or 'unsigned')}"]
    if r.fee_tao is not None:
        lines.append(f"Fee {r.fee_tao:.6f} TAO")
    for a in r.args[:6]:
        lines.append(f"• {escape(a.name)}: <code>{escape(a.value[:120])}</code>")
    if r.explanation:
        e = r.explanation
        lines += ["", f"<b>{escape(e.title)}</b>", prose(e.explanation.split(chr(10))[0])]
        if e.fix:
            lines.append(f"Fix: <code>{escape(e.fix.text)}</code>" if e.fix.kind in ("command", "code") else f"Fix: {prose(e.fix.text)}")
    lines += ["", link(f"/tx/{net.name}/{r.ref}", "Open in the debugger")]
    return join(lines)


def explain(args: str, _chat: str) -> str:
    from .core.tx.explain import explain_text

    if not args.strip():
        raise Usage("Send /explain followed by an error name or the error text you got")
    e = explain_text(args)
    if not e.found:
        return join([f"<b>{escape(e.title)}</b>", prose(e.explanation), "", "Paste the full error text, or the transaction with /tx"])
    lines = [f"<b>{escape(e.title)}</b> <code>{escape(e.error)}</code>", "", prose(e.explanation)]
    if e.fix:
        lines += ["", f"Fix: <code>{escape(e.fix.text)}</code>" if e.fix.kind in ("command", "code") else f"Fix: {prose(e.fix.text)}"]
    if e.source:
        lines.append(f"<i>Source: {escape(e.source)}</i>")
    lines += ["", link(f"/explain?text={quote(e.error)}", "Open the explainer")]
    return join(lines)


def mine(args: str, _chat: str) -> str:
    from .core.plan.economics import economics

    words, net = _split(args)
    netuid = _netuid(words[0] if words else "", "Send /mine followed by a netuid, like /mine 19")
    e = economics(net, netuid)
    word = {"promising": "🟢 PROMISING", "competitive": "🟡 COMPETITIVE", "hard": "🔴 HARD", "closed": "⛔ CLOSED"}[e.verdict]
    lines = [f"<b>{word}</b> · SN{e.netuid} {escape(e.name)}", f"<b>{escape(e.headline)}</b>", ""]
    lines.append(f"Registration {e.registration_cost_tao:,.4f} TAO · {e.earning_miners} of {e.miners} miners earn")
    for band in e.bands:
        lines.append(f"• {escape(band.label)}: {band.tao_per_day:,.4f} TAO a day")
    if e.payback_days is not None:
        lines.append(f"Payback for the median earner: {e.payback_days:,.1f} days")
    lines += ["", link(f"/subnets/{e.netuid}/mine", "Open the full breakdown")]
    return join(lines)


def subnet(args: str, _chat: str) -> str:
    from .core.directory.live import subnet_detail

    words, net = _split(args)
    netuid = _netuid(words[0] if words else "", "Send /subnet followed by a netuid, like /subnet 19")
    card = subnet_detail(net, netuid).card
    name = (card.live.name if card.live else None) or (card.catalog.name if card.catalog else f"Subnet {netuid}")
    lines = [f"<b>SN{netuid} {escape(name)}</b>"]
    if card.catalog:
        lines.append(escape(card.catalog.summary))
    if card.health:
        lines.append(f"Health {card.health.score}/100, {escape(card.health.band.replace('_', ' '))}")
    if card.live:
        live = card.live
        price = f" · price {live.price_tao:,.5f} TAO" if live.price_tao is not None else ""
        lines.append(f"{live.miners} miners, {live.validators} validators of {live.max_uids} seats{price}")
        state = "open" if live.registration_allowed else "closed"
        lines.append(f"Registration {state}, {live.registration_cost_tao:,.4f} TAO")
    lines += ["", link(f"/subnets/{netuid}", "Open the subnet")]
    return join(lines)


def weather(args: str, _chat: str) -> str:
    from .core.live.weather import weather as read

    _, net = _split(args)
    w = read(net, 60)
    sky = "☀️" if w.failure_rate < 0.02 else "🌦" if w.failure_rate < 0.08 else "⛈"
    lines = [f"{sky} <b>{escape(w.headline)}</b>", f"Blocks {w.from_block:,} to {w.to_block:,}: {w.extrinsics:,} transactions, {w.failed} failed", ""]
    for e in w.top_errors[:5]:
        where = f" on {', '.join(f'SN{n}' for n in e.subnets[:3])}" if e.subnets else ""
        lines.append(f"• <b>{escape(e.error)}</b> {"once" if e.count == 1 else f"{e.count} times"}{where}: {prose(e.meaning)}")
        lines.append(f"  e.g. {link(f'/tx/{net.name}/{e.example_ref}', e.example_ref)}")
    if w.busiest_subnets:
        lines += ["", "Busiest: " + ", ".join(f"SN{n} ({count})" for n, count in w.busiest_subnets[:5])]
    lines += ["", link("/live", "Watch it live")]
    return join(lines)


def live(args: str, _chat: str) -> str:
    from .core.live.feed import feed

    _, net = _split(args)
    result = feed(net, None, 2)
    lines: list[str] = []
    for block in result.blocks:
        lines.append(f"<b>Block {block.number:,}</b>: {len(block.activities)} transactions, {block.failed} failed")
        # Weight sets and EVM calls fill most blocks; show failures and what people did first.
        ordered = sorted(block.activities, key=lambda a: (a.success, LIVE_ORDER.get(a.kind, 2)))
        for a in ordered[:8]:
            mark = "✅" if a.success else "❌"
            error = f" <code>{escape(a.error.split('.')[-1])}</code>" if a.error else ""
            lines.append(f"{mark} {escape(a.summary)}{error}")
        if len(ordered) > 8:
            lines.append(f"<i>and {len(ordered) - 8} more</i>")
        lines.append("")
    lines.append(link("/live", "Watch it live"))
    return join(lines)


def plan(args: str, _chat: str) -> str:
    from .core.plan.launch import launch_plan

    _, net = _split(args)
    p = launch_plan(net)
    lines = [f"<b>Launching a subnet costs {p.lock_cost_tao:,.2f} TAO right now</b>", f"{p.subnet_count} of {p.subnet_limit} subnets exist"]
    if p.replaced_netuid is not None:
        lines.append(f"At the cap, SN{p.replaced_netuid} {escape(p.replaced_name or '')} would be replaced")
    lines.append("")
    for step in p.timeline[:5]:
        at = f" (block {step.block:,})" if step.block else ""
        lines.append(f"• {escape(step.label)}{at}: {escape(step.detail.split('; ')[0])}")
    lines += ["", link("/plan", "Open the planner")]
    return join(lines)


def find(args: str, _chat: str) -> str:
    from .core.directory.catalog import search

    if not args.strip():
        raise Usage("Send /find followed by what you need, like /find image generation")
    results = search(args, 6)
    if not results:
        return f"No subnet in the directory matches {escape(args)}. Try fewer words"
    lines = [f"<b>Subnets for {escape(args)}</b>", ""]
    for entry in results:
        api = " · public API" if entry.api and entry.api != "none" else ""
        lines.append(f"• <b>SN{entry.netuid} {escape(entry.name)}</b>{api}: {escape(entry.summary)}")
    lines += ["", link(f"/subnets?q={quote(args)}", "Open the directory")]
    return join(lines)


def watch(args: str, chat_id: str) -> str:
    words, net = _split(args)
    usage = "Send /watch <hotkey> <netuid>, like /watch 5F... 19"
    if len(words) < 2:
        raise Usage(usage)
    hotkey = validate.ss58(words[0])
    netuid = _netuid(words[1], usage)
    try:
        outcome = store.add_chat_watch(net.name, hotkey, netuid, chat_id)
    except store.StoreUnavailable:
        return "Watches are unavailable right now. Try again in a few minutes"
    if outcome == "exists":
        return f"Already watching {escape(short(hotkey))} on SN{netuid} for this chat"
    if outcome == "full":
        return f"This chat already watches {store.MAX_WATCHES_PER_CHAT} neurons, the most one chat can"
    return join(
        [
            f"👀 <b>Watching {escape(short(hotkey))} on SN{netuid}</b>",
            "Preflight checks it every 10 minutes and messages you here when it is deregistered, stops being scored, "
            "loses its validator permit, goes stale or its axon stops answering, each with the fix",
        ]
    )


def start(args: str, chat_id: str) -> str:
    code = args.strip()
    if not code:
        return HELP
    if not re.fullmatch(r"[A-Za-z0-9]{6,16}", code):
        return "That link code does not look right. Copy it again from the Watch button on Preflight"
    try:
        linked = store.link_chat(code, chat_id)
    except store.StoreUnavailable:
        return "Linking is unavailable right now. Try again in a few minutes"
    if not linked:
        return "That code was already used or never existed. Make a new one with the Watch button on any Doctor report"
    return "👀 <b>Linked.</b> Preflight is watching your neuron and will message you here when something breaks, with the fix"


def _ask(text: str, chat_id: str) -> str:
    answer = ask(text)
    params = answer.params
    routes: dict[str, Callable[[], str]] = {
        "doctor": lambda: doctor(f"{params['hotkey']} {params.get('netuid', '')}", chat_id),
        "tx": lambda: tx(params["ref"], chat_id),
        "explain_error": lambda: explain(text, chat_id),
        "economics": lambda: mine(params["netuid"], chat_id),
        "subnet": lambda: subnet(params["netuid"], chat_id),
        "plan": lambda: plan("", chat_id),
        "find": lambda: find(params["q"], chat_id),
    }
    route = routes.get(answer.intent)
    if route is not None:
        return route()
    if answer.intent == "sim":
        return f"Simulation needs the exact call and accounts. {link('/sim', 'Open the simulator')}, or run <code>preflight sim</code>"
    return "I could not map that to a tool.\n\n" + HELP


HANDLERS: dict[str, Callable[[str, str], str]] = {
    "start": start,
    "help": lambda _args, _chat: HELP,
    "doctor": doctor,
    "why": why,
    "change": why,
    "fleet": fleet,
    "tx": tx,
    "explain": explain,
    "mine": mine,
    "subnet": subnet,
    "weather": weather,
    "live": live,
    "plan": plan,
    "find": find,
    "watch": watch,
}


def reply(text: str, chat_id: str) -> str:
    """One answer for one message. Failures become a plain sentence, never a stack trace."""
    message = text.strip()[:2000]
    match = COMMAND.match(message)
    try:
        if match:
            handler = HANDLERS.get(match.group(1).lower())
            if handler is None:
                return f"There is no /{escape(match.group(1))} command.\n\n{HELP}"
            return handler(match.group(2) or "", chat_id)
        return _ask(message, chat_id)
    except ChainUnreachable as error:
        return f"The chain did not answer: {escape(str(error))}. Try again in a minute"
    except (ValueError, LookupError) as error:  # Usage and InvalidInput are ValueErrors
        return escape(str(error))


def handle_update(update: dict[str, object], allow: Callable[[str], bool]) -> bool:
    """Answer one Telegram update. False when there was nothing to answer or it was rate limited."""
    message = update.get("message")
    if not isinstance(message, dict):
        return False
    chat = message.get("chat")
    text = message.get("text")
    if not isinstance(chat, dict) or chat.get("id") is None or not isinstance(text, str):
        return False
    chat_id = str(chat["id"])
    if not allow(f"telegram:{chat_id}"):
        telegram.send(chat_id, "Slow down a little: try again in a minute")
        return False
    telegram.typing(chat_id)
    try:
        answer = reply(text, chat_id)
    except Exception:
        # Anything unexpected still gets an answer and a 200, or Telegram resends the update for hours
        log.exception("bot reply failed")
        answer = "Something went wrong answering that. Try again in a minute"
    try:
        telegram.send(chat_id, answer, html=True)
    except telegram.TelegramUnavailable as error:
        # Usually a formatting refusal; the plain text still reads fine.
        log.warning("HTML reply refused, sending plain text: %s", error)
        telegram.send(chat_id, unescape(re.sub(r"<[^>]+>", "", answer)))
    return True
