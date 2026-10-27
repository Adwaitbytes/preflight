"""The deterministic Ask box: plain patterns route a question to the right module. No LLM.

Anything it cannot parse gets the MCP install line, so the user's own Claude can answer
with Preflight's tools behind it.
"""

from __future__ import annotations

import re

from . import errors_catalog as catalog
from .models import AskAnswer
from .tx.debugger import BLOCK_INDEX, HASH
from .validate import SS58_SHAPE, is_ss58

MCP_INSTALL = "claude mcp add preflight -- uvx --from git+https://github.com/Adwaitbytes/preflight preflight mcp"
NETUID = re.compile(r"\b(?:sn|netuid|subnet)\s*#?\s*(\d{1,4})\b", re.I)
BARE_NUMBER = re.compile(r"^\s*(\d{1,4})\s*$")
LAUNCH = re.compile(r"\b(launch|create|start|register|open)\b.{0,30}\b(subnet|network)\b|\bsubnet (lock|cost)\b", re.I)
REGISTER_COST = re.compile(r"\b(how much|cost|price|burn)\b.{0,40}\b(register|registration|uid|seat)\b", re.I)
SIMULATE = re.compile(r"\b(simulate|dry ?run|would .{0,20} (work|fail|succeed)|try .{0,20} before)\b", re.I)
FIND = re.compile(r"\b(find|which|search|subnets? (for|that|doing))\b", re.I)


def _netuid(text: str) -> str | None:
    match = NETUID.search(text) or BARE_NUMBER.match(text)
    return match.group(1) if match else None


def ask(query: str, network: str = "finney") -> AskAnswer:
    text = query.strip()[:2000]

    def answer(intent: str, route: str | None, params: dict[str, str], message: str) -> AskAnswer:
        return AskAnswer(query=text, intent=intent, route=route, params=params, message=message)  # type: ignore[arg-type]  # intent is one of the Literal values above

    tokens = re.findall(r"[1-9A-HJ-NP-Za-km-z]{46,48}", text)
    hotkey = next((t for t in tokens if SS58_SHAPE.match(t) and is_ss58(t)), None)
    netuid = _netuid(text)

    if hotkey:
        params = {"hotkey": hotkey, "network": network}
        route = f"/doctor/{network}/{hotkey}"
        if netuid:
            params["netuid"] = netuid
            route += f"?netuid={netuid}"
        return answer("doctor", route, params, "Diagnose this hotkey")

    stripped = text.strip()
    if HASH.match(stripped) or BLOCK_INDEX.match(stripped):
        return answer("tx", f"/tx/{network}/{stripped}", {"ref": stripped, "network": network}, "Decode and explain this transaction")

    if names := catalog.parse_error_names(text):
        return answer("explain_error", f"/explain?error={names[0]}", {"error": names[0]}, f"Explain {names[0]}")

    if SIMULATE.search(text):
        return answer("sim", "/sim", {"network": network}, "Simulate a transaction against live state before paying for it")

    if LAUNCH.search(text):
        return answer("plan", "/plan", {"network": network}, "Cost and timeline for launching a subnet")

    if REGISTER_COST.search(text) and netuid:
        return answer("subnet", f"/subnets/{netuid}", {"netuid": netuid, "network": network}, f"Registration cost and health for SN{netuid}")

    if netuid:
        return answer("subnet", f"/subnets/{netuid}", {"netuid": netuid, "network": network}, f"Subnet {netuid}: hyperparameters and health")

    if FIND.search(text) or len(text.split()) <= 4:
        words = re.sub(FIND, "", text).strip() or text
        return answer("find", f"/subnets?q={words}", {"q": words}, f"Subnets matching {words!r}")

    return answer(
        "unknown",
        None,
        {"install": MCP_INSTALL},
        "Preflight could not map that to a tool. Ask your own Claude with the Preflight MCP server installed: " + MCP_INSTALL,
    )
