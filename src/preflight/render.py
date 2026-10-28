"""Terminal rendering for every report. The CLI prints these; `--json` bypasses them."""

from __future__ import annotations

from rich.console import Console, Group
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from .core.models import (
    ChainRef,
    Diagnosis,
    DoctorReport,
    EpochCheck,
    EpochPreview,
    ErrorExplanation,
    Finding,
    Fix,
    FleetReport,
    IncentiveChange,
    LaunchPlan,
    MinerEconomics,
    Severity,
    SimResult,
    SubnetCard,
    SubnetDetail,
    TxReport,
    Verdict,
    Weather,
)

SEVERITY_STYLE = {
    Severity.CRITICAL: "bold red",
    Severity.HIGH: "red",
    Severity.MEDIUM: "yellow",
    Severity.INFO: "cyan",
}
VERDICT_STYLE = {Verdict.BROKEN: "bold white on red", Verdict.WARNING: "bold black on yellow", Verdict.HEALTHY: "bold black on green"}


def chain_line(chain: ChainRef) -> Text:
    spec = f", runtime {chain.runtime_spec}" if chain.runtime_spec else ""
    return Text(f"{chain.network} at block {chain.block:,}{spec}", style="dim")


def fix_panel(fix: Fix) -> Panel:
    title = {"command": "Run", "code": "Change", "wait": "Wait", "info": "Next step"}[fix.kind]
    body = Text(fix.text, style="bold green" if fix.kind == "command" else "")
    if fix.note:
        body.append(f"\n{fix.note}", style="dim")
    return Panel(body, title=title, title_align="left", border_style="green" if fix.kind == "command" else "dim", padding=(0, 1))


def finding_block(f: Finding, *, verbose: bool) -> Group:
    head = Text()
    head.append(f" {f.severity.value.upper():<8}", style=SEVERITY_STYLE[f.severity])
    head.append(f" {f.id} ", style="dim")
    head.append(f.title, style="bold")
    parts: list[Text | Table | Panel] = [head, Text(f"  {f.explanation}", style="")]
    if verbose and f.evidence:
        table = Table(show_header=False, box=None, padding=(0, 1), pad_edge=False)
        table.add_column(style="dim", no_wrap=True)
        table.add_column()
        table.add_column(style="dim italic")
        for e in f.evidence:
            table.add_row(f"  {e.label}", e.value, e.source or "")
        parts.append(table)
    if f.fix:
        parts.append(fix_panel(f.fix))
    if verbose and f.docs:
        parts.append(Text(f"  {f.docs}", style="dim underline"))
    return Group(*parts)


def diagnosis(d: Diagnosis, *, verbose: bool) -> Panel:
    n = d.neuron
    stats = Text(style="dim")
    if n is not None:
        axon = n.axon.address if n.axon else "none"
        stats.append(
            f"UID {n.uid}  {d.role}  stake {n.stake:,.2f}  incentive {n.incentive:.4f}  trust {n.trust:.3f}  "
            f"emission {n.emission:,.4f}  axon {axon}"
        )
    else:
        stats.append(d.role)
    body: list[Text | Group] = [stats, Text("")]
    if d.findings:
        for f in d.findings:
            body.append(finding_block(f, verbose=verbose))
            body.append(Text(""))
    else:
        body.append(Text(f"No findings across {d.rules_run} rules", style="green"))
    name = f"SN{d.netuid} {d.subnet_name}" if d.subnet_name else f"SN{d.netuid}"
    return Panel(Group(*body), title=Text(f" {name} ", style="bold"), title_align="left", subtitle=Text(f"{d.rules_run} rules", style="dim"), subtitle_align="right", border_style="grey50")


def doctor(console: Console, report: DoctorReport, *, verbose: bool = True) -> None:
    badge = Text(f" {report.verdict.value.upper()} ", style=VERDICT_STYLE[report.verdict])
    console.print()
    console.print(Text.assemble(badge, "  ", Text(report.headline, style="bold")))
    console.print(Text.assemble(chain_line(report.chain), Text(f"  {report.elapsed_ms:,} ms  {report.hotkey}", style="dim")))
    console.print()
    for d in report.diagnoses:
        console.print(diagnosis(d, verbose=verbose))


def explanation(console: Console, e: ErrorExplanation) -> None:
    if not e.found and not e.error:
        console.print(Panel(e.explanation, title=e.title, border_style="yellow"))
        return
    lines: list[Text | Panel] = [Text(e.explanation)]
    if e.fix:
        lines.append(fix_panel(e.fix))
    meta = " ".join(x for x in (e.code and f"code {e.code}", e.trap and f"trap {e.trap}") if x)
    if meta:
        lines.append(Text(meta, style="dim"))
    for link in (e.source, e.docs):
        if link:
            lines.append(Text(link, style="dim underline"))
    title = f"{e.pallet}.{e.error}" if e.pallet else e.error
    console.print(Panel(Group(*lines), title=Text(f" {title}: {e.title} ", style="bold"), title_align="left", border_style="red" if e.found else "yellow"))


def tx(console: Console, r: TxReport) -> None:
    badge = Text(" SUCCESS ", style="bold black on green") if r.success else Text(" FAILED ", style="bold white on red")
    console.print()
    console.print(Text.assemble(badge, "  ", Text(f"{r.pallet}.{r.call}", style="bold"), Text(f"  block {r.block:,} index {r.index}", style="dim")))
    if r.extrinsic_hash:
        console.print(Text(r.extrinsic_hash, style="dim"))
    args = Table(show_header=False, box=None, padding=(0, 1))
    args.add_column(style="dim")
    args.add_column()
    args.add_row("signer", r.signer or "unsigned")
    for a in r.args:
        args.add_row(a.name, a.value)
    if r.fee_tao is not None:
        args.add_row("fee", f"{r.fee_tao:.9f} TAO".rstrip("0").rstrip("."))
    console.print(Panel(args, title="Call", title_align="left", border_style="grey50"))
    events = Table(show_header=False, box=None, padding=(0, 1))
    events.add_column(style="dim")
    events.add_column(style="bold")
    events.add_column()
    for e in r.events:
        events.add_row(str(e.index), f"{e.pallet}.{e.name}", e.summary)
    console.print(Panel(events, title="Events", title_align="left", border_style="grey50"))
    if r.explanation:
        explanation(console, r.explanation)


def sim(console: Console, r: SimResult) -> None:
    badge = Text(" WOULD SUCCEED ", style="bold black on green") if r.would_succeed else Text(" WOULD FAIL ", style="bold white on red")
    console.print()
    console.print(Text.assemble(badge, "  ", Text(r.action, style="bold"), Text(f"  as {r.signer}", style="dim")))
    console.print(Text(r.mode_label, style="italic"))
    table = Table(show_header=False, box=None, padding=(0, 1))
    table.add_column(style="dim")
    table.add_column()
    for a in r.args:
        table.add_row(a.name, a.value)
    if r.fee_tao is not None:
        table.add_row("fee", f"{r.fee_tao:.9f} TAO".rstrip("0").rstrip("."))
    for effect in r.effects:
        table.add_row("effect", effect)
    for check in r.checks:
        table.add_row(check.label, check.value)
    for change in r.balance_changes:
        table.add_row(change.label, f"{change.before} -> {change.after} ({change.delta})")
    for override in r.overrides:
        table.add_row("override", override)
    table.add_row("time", f"{r.elapsed_ms:,} ms")
    console.print(Panel(table, border_style="grey50"))
    if r.explanation:
        explanation(console, r.explanation)


def plan(console: Console, p: LaunchPlan) -> None:
    console.print()
    console.print(Text.assemble(Text(f"Launching a subnet on {p.chain.network} costs {p.lock_cost_tao:,.2f} TAO right now", style="bold")))
    console.print(chain_line(p.chain))
    table = Table(show_header=False, box=None, padding=(0, 1))
    table.add_column(style="dim")
    table.add_column()
    table.add_row("lock cost", f"{p.lock_cost_tao:,.4f} TAO (floor {p.min_lock_tao:,.2f}, last paid {p.last_lock_tao:,.2f})")
    table.add_row("subnets", f"{p.subnet_count} of {p.subnet_limit}")
    if p.replaced_netuid is not None:
        table.add_row("at the cap", f"registering would dissolve SN{p.replaced_netuid} {p.replaced_name or ''}".rstrip())
    table.add_row("rate limit", f"{p.rate_limit_blocks:,} blocks between registrations")
    if p.next_registration_block:
        table.add_row("next allowed", f"block {p.next_registration_block:,}")
    console.print(Panel(table, title="Cost", title_align="left", border_style="grey50"))
    steps = Table(show_header=True, box=None, padding=(0, 1), header_style="dim")
    steps.add_column("Step")
    steps.add_column("Block", justify="right")
    steps.add_column("Detail")
    for s in p.timeline:
        steps.add_row(s.label, f"{s.block:,}" if s.block else "", s.detail)
    console.print(Panel(steps, title="Timeline", title_align="left", border_style="grey50"))


def subnet(console: Console, d: SubnetDetail, *, show_params: bool = True) -> None:
    card = d.card
    live, cat, health = card.live, card.catalog, card.health
    name = (cat.name if cat else None) or (live.name if live else f"SN{card.netuid}")
    console.print()
    title = Text.assemble(Text(f"SN{card.netuid} {name}", style="bold"))
    if health:
        style = {"healthy": "green", "watch": "yellow", "at_risk": "red"}[health.band]
        title.append(f"   health {health.score}/100", style=f"bold {style}")
    console.print(title)
    if cat:
        console.print(Text(cat.summary))
    console.print(chain_line(d.chain))
    if health:
        factors = Table(show_header=False, box=None, padding=(0, 1))
        factors.add_column(style="dim")
        factors.add_column(justify="right")
        factors.add_column()
        for f in health.factors:
            factors.add_row(f.label, f"{round(f.score * 100)}", f"{f.value}  {f.explanation}")
        console.print(Panel(factors, title="Health factors", title_align="left", border_style="grey50"))
        for f in health.findings:
            console.print(finding_block(f, verbose=False))
    if show_params:
        params = Table(show_header=True, header_style="dim", box=None, padding=(0, 1))
        params.add_column("Group", style="dim")
        params.add_column("Hyperparameter")
        params.add_column("Value", justify="right")
        params.add_column("Meaning", style="dim")
        for h in d.hyperparams:
            params.add_row(h.group, h.name, h.value, h.meaning)
        console.print(Panel(params, title="Hyperparameters", title_align="left", border_style="grey50"))


def cards(console: Console, items: list[SubnetCard]) -> None:
    table = Table(header_style="dim", box=None, padding=(0, 1))
    table.add_column("SN", justify="right")
    table.add_column("Name")
    table.add_column("What it does")
    table.add_column("API")
    table.add_column("Health", justify="right")
    for c in items:
        cat = c.catalog
        api = "none" if not cat or not cat.api or cat.api == "none" else ("key" if cat.api_needs_key else "open")
        table.add_row(
            str(c.netuid),
            (cat.name if cat else None) or (c.live.name if c.live else ""),
            cat.summary if cat else "",
            api,
            str(c.health.score) if c.health else "",
        )
    console.print(table)


def fleet(console: Console, r: FleetReport) -> None:
    console.print()
    console.print(Text(r.headline, style="bold"))
    console.print(Text.assemble(chain_line(r.chain), Text(f"  {r.elapsed_ms:,} ms  {r.coldkey}", style="dim")))
    seats = len(r.rows) - r.unseated
    summary = f"{r.hotkeys} hotkeys, {seats} seats: {r.broken} broken, {r.warning} to watch, {r.healthy} healthy, about {r.tao_per_day:,.2f} TAO a day at today's prices"
    if r.unseated:
        summary += f"; {r.unseated} hotkeys hold no seat"
    if r.checked < r.hotkeys:
        summary += f" (first {r.checked} hotkeys checked)"
    console.print(Text(summary, style="dim"))
    table = Table(header_style="dim", box=None, padding=(0, 1))
    for column in ("", "SN", "UID", "Hotkey", "Role", "TAO a day", "Worst finding"):
        table.add_column(column, justify="right" if column in ("SN", "UID", "TAO a day") else "left")
    for row in r.rows:
        style = VERDICT_STYLE[row.verdict]
        worst = f"{row.worst.id} {row.worst.title}" if row.worst else ""
        table.add_row(
            Text(f" {row.verdict.value[:1].upper()} ", style=style),
            str(row.netuid) if row.netuid is not None else "",
            str(row.uid) if row.uid is not None else "",
            f"{row.hotkey[:6]}...{row.hotkey[-4:]}",
            row.role,
            f"{row.tao_per_day:,.3f}",
            worst,
        )
    console.print(table)


def economics(console: Console, e: MinerEconomics) -> None:
    style = {"promising": "bold black on green", "competitive": "bold black on yellow", "hard": "bold white on red", "closed": "bold white on red"}[e.verdict]
    console.print()
    console.print(Text.assemble(Text(f" {e.verdict.upper()} ", style=style), "  ", Text(e.headline, style="bold")))
    console.print(chain_line(e.chain))
    table = Table(show_header=False, box=None, padding=(0, 1))
    table.add_column(style="dim")
    table.add_column(justify="right")
    table.add_column(style="dim")
    table.add_row("registration", f"{e.registration_cost_tao:,.4f} TAO", "burned, the price moves with demand")
    table.add_row("seats", f"{e.seats_used} of {e.seats_max}", f"{e.earning_miners} of {e.miners} miners earn")
    for band in e.bands:
        table.add_row(band.label, f"{band.tao_per_day:,.4f} TAO a day", f"{band.alpha_per_day:,.3f} alpha at {e.alpha_price_tao:,.5f}")
    if e.payback_days is not None:
        table.add_row("payback", f"{e.payback_days:,.1f} days", "registration over the median earner's day")
    console.print(Panel(table, title="Today", title_align="left", border_style="grey50"))
    for note in e.notes:
        console.print(Text(f"  - {note}"))
    for f in e.findings:
        console.print(finding_block(f, verbose=False))


def change(console: Console, c: IncentiveChange) -> None:
    style = "bold black on green" if c.change > 0.05 else "bold white on red" if c.change < -0.05 or (c.before.uid is not None and c.after.uid is None) else "bold black on yellow"
    word = "UP" if c.change > 0.05 else "DOWN" if c.change < -0.05 else "STEADY"
    console.print()
    console.print(Text.assemble(Text(f" {word} ", style=style), "  ", Text(c.headline, style="bold")))
    console.print(Text.assemble(chain_line(c.chain), Text(f"  blocks {c.from_block:,} to {c.to_block:,}", style="dim")))
    if c.drivers:
        table = Table(header_style="dim", box=None, padding=(0, 1))
        for column in ("Validator", "Stake", "Weight before", "Weight now", "Support moved", "What it did"):
            table.add_column(column, justify="right" if column not in ("Validator", "What it did") else "left")
        for d in c.drivers:
            moved = d.support_after - d.support_before
            table.add_row(
                f"UID {d.uid}",
                f"{d.stake_share_after:.1%}",
                f"{d.weight_before:.2%}",
                f"{d.weight_after:.2%}",
                Text(f"{moved:+.3%}", style="green" if moved > 0 else "red" if moved < 0 else "dim"),
                d.reason,
            )
        console.print(Panel(table, title="Validators that moved it", title_align="left", border_style="grey50"))
    for note in c.notes:
        console.print(Text(f"  - {note}", style="dim"))


def weather(console: Console, w: Weather) -> None:
    calm = w.failure_rate < 0.02
    console.print()
    console.print(Text.assemble(Text(" CLEAR " if calm else " STORMY ", style="bold black on green" if calm else "bold black on yellow"), "  ", Text(w.headline, style="bold")))
    console.print(Text.assemble(chain_line(w.chain), Text(f"  blocks {w.from_block:,} to {w.to_block:,}, {w.extrinsics:,} transactions, {w.failed} failed", style="dim")))
    if w.top_errors:
        table = Table(header_style="dim", box=None, padding=(0, 1))
        for column in ("Error", "Times", "Subnets", "What it means", "Open one"):
            table.add_column(column, justify="right" if column == "Times" else "left")
        for e in w.top_errors:
            subnets = ", ".join(f"SN{n}" for n in e.subnets[:4]) + (" ..." if len(e.subnets) > 4 else "")
            table.add_row(Text(e.error, style="red"), str(e.count), subnets, e.meaning, Text(f"preflight tx {e.example_ref}", style="dim"))
        console.print(Panel(table, title="What is failing", title_align="left", border_style="grey50"))
    kinds = ", ".join(f"{count} {kind}" for kind, count in sorted(w.by_kind.items(), key=lambda item: -item[1]))
    busiest = ", ".join(f"SN{n} ({count})" for n, count in w.busiest_subnets)
    console.print(Text(f"  Activity: {kinds}", style="dim"))
    if busiest:
        console.print(Text(f"  Busiest subnets: {busiest}", style="dim"))

def epoch(console: Console, p: EpochPreview, check: EpochCheck | None = None, *, limit: int = 15) -> None:
    focus = p.focus
    if focus is not None and focus.incentive_next == 0 and focus.incentive_now > 0:
        badge, style = " DROPS ", "bold white on red"
    elif focus is not None and focus.change > 0.01:
        badge, style = " UP ", "bold black on green"
    elif focus is not None and focus.change < -0.01:
        badge, style = " DOWN ", "bold white on red"
    else:
        badge, style = " NEXT EPOCH ", "bold black on cyan"
    console.print()
    console.print(Text.assemble(Text(badge, style=style), "  ", Text(p.headline, style="bold")))
    console.print(Text.assemble(chain_line(p.chain), Text(f"  epoch at block {p.epoch_block:,}, kappa {p.kappa:.0%}", style="dim")))
    if p.whatif:
        console.print(Text(f"  What-if: {'; '.join(p.whatif)}", style="yellow"))
    if check is not None:
        console.print(Text(f"  {'✓' if check.matched else '≈'} {check.headline}", style="green" if check.matched else "yellow"))
    miners = Table(header_style="dim", box=None, padding=(0, 1))
    for column in ("UID", "Now", "Next", "Change", "Cut by consensus", "Why"):
        miners.add_column(column, justify="left" if column in ("UID", "Why") else "right")
    rows = p.miners[:limit]
    if focus is not None and focus.uid not in {m.uid for m in rows}:
        rows = [*rows, focus]
    for m in rows:
        change = Text(f"{m.change:+.0%}" if m.incentive_now > 0 else ("new" if m.incentive_next > 0 else "-"), style="green" if m.change > 0.01 else "red" if m.change < -0.01 else "dim")
        uid = Text(f"UID {m.uid}", style="bold" if focus is not None and m.uid == focus.uid else "")
        miners.add_row(uid, f"{m.incentive_now:.4f}", f"{m.incentive_next:.4f}", change, f"{m.clipped:.0%}" if m.support > 0 else "-", m.reason)
    console.print(Panel(miners, title=f"Miners, {p.earners_next} earning next epoch", title_align="left", border_style="grey50"))
    validators = Table(header_style="dim", box=None, padding=(0, 1))
    for column in ("Validator", "Stake", "Trust", "UIDs", "Status"):
        validators.add_column(column, justify="left" if column in ("Validator", "Status") else "right")
    for v in p.validators:
        validators.add_row(f"UID {v.uid}", f"{v.stake_share:.1%}", f"{v.trust:.0%}" if v.status == "voting" else "-", str(v.weighted_uids), Text(v.note, style="dim" if v.status == "voting" else "yellow"))
    console.print(Panel(validators, title="Validators", title_align="left", border_style="grey50"))
    for note in p.notes:
        console.print(Text(f"  - {note}", style="dim"))
