"""The local subnet development kit behind `preflight local up|down|reset|status|break`.

`up` always starts from a fresh container, builds one subnet with funded, registered,
staked and scored neurons, and persists everything later commands need to
`.preflight/local/` (override with `PREFLIGHT_LOCAL_DIR` or `home=`): `state.json` holds
public facts only; `wallets/<neuron name>/` holds a password-less bittensor wallet per
neuron (key files mode 0600) so `btcli --wallet-path ... --wallet <name>` can sign as it.
Mnemonics live only in those key files and are never printed or returned.
"""

from __future__ import annotations

import os
import shutil
import time
from collections.abc import Callable
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal

import bittensor as bt
from pydantic import Field

from ..chain.harness import (
    RAO_PER_TAO,
    ChainError,
    DevWallet,
    Harness,
    disk_wallet,
    wait_until,
)
from ..chain.localnet import ENDPOINT, LOOPBACK_AXON_IP, Localnet
from ..models import Model

DEFAULT_MINERS = 3
DEFAULT_VALIDATORS = 2
# Long enough that a validator nobody restarts stays inside the activity cutoff
# (13.889 x tempo by default, about 7 minutes at 0.3 s blocks), short enough that up's
# first scored epoch arrives in about 30 s.
DEFAULT_TEMPO = 100
VALIDATOR_STAKE_TAO = 1_000
FIRST_MINER_PORT = 8091
# Assumed worst case seconds per block when turning tempos into timeouts. The devnet
# image measured 0.29 s; the slack is for loaded CI runners.
SLOW_BLOCK_S = 1.0
WALLETS = "wallets"

Role = Literal["owner", "validator", "miner"]
Progress = Callable[[str], None]


class KitError(RuntimeError):
    """The local dev kit cannot do what was asked: nothing is up, or a bad argument."""


class LocalNeuron(Model):
    name: str
    role: Role
    netuid: int
    uid: int | None
    hotkey: str
    coldkey: str
    axon: str | None = None
    stake: float = Field(default=0.0, description="Stake in alpha, as the chain reports it")
    scenario: str | None = None
    wallet: str | None = Field(
        default=None,
        description="Wallet name under the kit's wallets directory; None for the sudo owner",
    )


class SubmittedExtrinsic(Model):
    """A signed extrinsic as sent, with enough to find, decode or replay it later."""

    call: str
    signer: str
    nonce: int
    extrinsic_hash: str
    call_data: str
    submitted_at_block: int
    stage: Literal["pool", "block"]
    block: int | None = None
    index: int | None = None
    error: str | None = None
    message: str | None = None


class BreakResult(Model):
    scenario: str
    netuid: int
    hotkey: str
    uid: int | None
    expected_rule: str
    summary: str
    steps: list[str]
    block: int
    failed_extrinsic: SubmittedExtrinsic | None = None
    landed_extrinsic: SubmittedExtrinsic | None = None


class LocalState(Model):
    endpoint: str
    container: str
    netuid: int
    tempo: int
    miners: int
    validators: int
    created_at: str
    up_seconds: float
    block: int
    runtime_spec: int | None
    neurons: list[LocalNeuron]
    subnets: dict[str, int] = Field(
        default_factory=dict, description="Scratch subnet per scenario that needs its own"
    )
    breaks: dict[str, BreakResult] = Field(default_factory=dict)

    def neuron(self, name: str) -> LocalNeuron | None:
        return next((n for n in self.neurons if n.name == name), None)


def local_dir(home: Path | None = None) -> Path:
    if home is not None:
        return home
    configured = os.environ.get("PREFLIGHT_LOCAL_DIR")
    return Path(configured) if configured else Path.cwd() / ".preflight" / "local"


def _quiet(_: str) -> None:
    return None


class Kit:
    """A running localnet plus its persisted state; what scenarios operate on."""

    def __init__(self, home: Path, state: LocalState, progress: Progress = _quiet) -> None:
        self.home = home
        self.state = state
        self.progress = progress
        self.chain = Harness(state.endpoint)

    def close(self) -> None:
        self.chain.close()

    def save(self) -> None:
        save_state(self.home, self.state)

    @property
    def wallets_dir(self) -> Path:
        return self.home / WALLETS

    def wallet(self, name: str) -> DevWallet:
        return disk_wallet(self.wallets_dir, name)

    def wallet_flags(self, name: str) -> list[str]:
        """btcli flags that sign as this neuron's on-disk wallet."""
        return ["--wallet-path", str(self.wallets_dir), "--wallet", name, "--wallet-hotkey", "default"]

    def epoch_timeout(self, netuid: int, epochs: int = 3) -> float:
        tempo = int(self.chain.hyperparameters(netuid).get("tempo", self.state.tempo))
        return 60.0 + epochs * (tempo + 1) * SLOW_BLOCK_S

    def remember(self, neuron: LocalNeuron) -> None:
        others = [n for n in self.state.neurons if n.name != neuron.name]
        self.state = self.state.model_copy(update={"neurons": [*others, neuron]})
        self.save()

    def record(self, result: BreakResult) -> None:
        breaks = {**self.state.breaks, result.scenario: result}
        self.state = self.state.model_copy(update={"breaks": breaks})
        self.save()

    def settle(self) -> int:
        """The head after the last write, returned once the chain is two blocks past it.

        Each client follows its own new-head subscription, and a second client (the Doctor's
        pooled one, in the same process) was measured one block behind for up to 0.6 s, so a
        diagnosis right after a break could read the block before it."""
        head = self.chain.block
        self.chain.wait_blocks(2)
        return head

    def forget(self, scenario: str) -> None:
        breaks = {k: v for k, v in self.state.breaks.items() if k != scenario}
        self.state = self.state.model_copy(update={"breaks": breaks})
        self.save()

    def enroll(
        self,
        name: str,
        role: Role,
        netuid: int,
        *,
        scenario: str | None = None,
        axon: tuple[str, int] | None = None,
    ) -> tuple[DevWallet, int]:
        """Fund and register a named neuron (idempotent) and optionally serve its axon."""
        wallet = self.wallet(name)
        if self.chain.uid_or_none(netuid, wallet.hotkey_ss58) is None:
            self.chain.fund([wallet])
        uid = self.chain.register(netuid, wallet)
        address = None
        if axon is not None:
            ip, port = axon
            self.chain.serve(netuid, wallet, ip, port)
            address = format_axon(ip, port)
        previous = self.state.neuron(name)
        self.remember(
            LocalNeuron(
                name=name,
                role=role,
                netuid=netuid,
                uid=uid,
                hotkey=wallet.hotkey_ss58,
                coldkey=wallet.coldkey_ss58,
                axon=address or (previous.axon if previous else None),
                stake=previous.stake if previous else 0.0,
                scenario=scenario,
                wallet=name,
            )
        )
        return wallet, uid

    def stake(self, name: str, netuid: int, tao: float) -> float:
        """Stake once per neuron (reruns keep what they have); returns the alpha stake."""
        neuron = self.state.neuron(name)
        if neuron is None:
            raise KitError(f"{name} is not enrolled")
        alpha = self.alpha_stake(netuid, neuron.hotkey)
        if alpha <= 0:
            self.chain.stake(netuid, self.wallet(name), tao)
            alpha = wait_until(
                lambda: self.alpha_stake(netuid, neuron.hotkey) or None, f"{name}'s stake", 30
            )
        self.remember(neuron.model_copy(update={"stake": alpha}))
        return alpha

    def alpha_stake(self, netuid: int, hotkey: str) -> float:
        graph = self.chain.metagraph(netuid)
        live = next((n for n in graph.neurons if n.hotkey == hotkey), None)
        return int(live.total_stake.rao) / RAO_PER_TAO if live is not None else 0.0

    def wait_for_permits(self, netuid: int, hotkeys: list[str]) -> None:
        def permitted() -> bool:
            graph = self.chain.metagraph(netuid)
            have = {n.hotkey for n in graph.neurons if n.validator_permit}
            return all(h in have for h in hotkeys)

        wait_until(permitted, f"validator permits on netuid {netuid}", self.epoch_timeout(netuid))

    def lab(self, name: str, tempo: int) -> int:
        """A dedicated subnet for a scenario that changes subnet-wide parameters, so it
        cannot spoil the main subnet or another scenario. Reused on reruns."""
        existing = self.state.subnets.get(name)
        if existing is not None and existing in self.chain.netuids():
            return existing
        self.progress(f"creating a scratch subnet for {name}")
        netuid = self.chain.create_subnet()
        self.chain.configure(netuid, tempo=tempo)
        self.chain.start_subnet(netuid)
        self.state = self.state.model_copy(update={"subnets": {**self.state.subnets, name: netuid}})
        self.save()
        return netuid

    def result(
        self,
        scenario: str,
        rule: str,
        netuid: int,
        hotkey: str,
        uid: int | None,
        summary: str,
        steps: list[str],
        **extrinsics: SubmittedExtrinsic | None,
    ) -> BreakResult:
        result = BreakResult(
            scenario=scenario,
            netuid=netuid,
            hotkey=hotkey,
            uid=uid,
            expected_rule=rule,
            summary=summary,
            steps=steps,
            block=self.settle(),
            **extrinsics,
        )
        self.record(result)
        return result


def format_axon(ip: str, port: int) -> str:
    return f"[{ip}]:{port}" if ":" in ip else f"{ip}:{port}"


def save_state(home: Path, state: LocalState) -> None:
    home.mkdir(parents=True, exist_ok=True)
    path = home / "state.json"
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(state.model_dump_json(indent=2))
    temporary.replace(path)


def load_state(home: Path) -> LocalState | None:
    path = home / "state.json"
    if not path.exists():
        return None
    return LocalState.model_validate_json(path.read_text())


def up(
    miners: int = DEFAULT_MINERS,
    validators: int = DEFAULT_VALIDATORS,
    tempo: int = DEFAULT_TEMPO,
    *,
    home: Path | None = None,
    progress: Progress = _quiet,
) -> LocalState:
    """Boot a fresh localnet and a working subnet on it: miners served and scored by
    staked validators, with incentive flowing before this returns."""
    if not 1 <= miners <= 64:
        raise KitError("miners must be between 1 and 64")
    if not 1 <= validators <= 16:
        raise KitError("validators must be between 1 and 16")
    if not 10 <= tempo <= 1000:
        raise KitError("tempo must be between 10 and 1000 blocks")
    directory = local_dir(home)
    started = time.monotonic()
    net = Localnet()
    progress("starting a fresh localnet container")
    net.start()
    _clear(directory)

    chain = Harness(ENDPOINT)
    try:
        progress("creating the subnet")
        netuid = chain.create_subnet()
        chain.configure(netuid, tempo=tempo)
        chain.start_subnet(netuid)
        state = LocalState(
            endpoint=ENDPOINT,
            container=net.container,
            netuid=netuid,
            tempo=tempo,
            miners=miners,
            validators=validators,
            created_at=datetime.now(UTC).isoformat(timespec="seconds"),
            up_seconds=0.0,
            block=chain.block,
            runtime_spec=_spec(chain.client),
            neurons=[
                LocalNeuron(
                    name="owner",
                    role="owner",
                    netuid=netuid,
                    uid=chain.uid_or_none(netuid, chain.sudo_wallet.hotkey_ss58),
                    hotkey=chain.sudo_wallet.hotkey_ss58,
                    coldkey=chain.sudo_wallet.coldkey_ss58,
                )
            ],
        )
    finally:
        chain.close()
    save_state(directory, state)

    kit = Kit(directory, state, progress)
    try:
        validator_names = [f"validator-{i + 1}" for i in range(validators)]
        miner_names = [f"miner-{i + 1}" for i in range(miners)]
        # Every neuron registers before anyone stakes: staking first moves the pool and
        # registrations then fail with "reserves too low".
        progress(f"registering {validators} validators and {miners} miners")
        for name in validator_names:
            kit.enroll(name, "validator", netuid)
        miner_uids: list[int] = []
        for index, name in enumerate(miner_names):
            _, uid = kit.enroll(
                name, "miner", netuid, axon=(LOOPBACK_AXON_IP, FIRST_MINER_PORT + index)
            )
            miner_uids.append(uid)
        progress("staking validators")
        for name in validator_names:
            kit.stake(name, netuid, VALIDATOR_STAKE_TAO)
        progress("waiting for validator permits")
        kit.wait_for_permits(netuid, [kit.wallet(n).hotkey_ss58 for n in validator_names])
        progress("validators setting weights")
        weights = {uid: float(rank + 1) for rank, uid in enumerate(miner_uids)}
        for name in validator_names:
            kit.chain.set_weights(netuid, kit.wallet(name), weights)
        progress("waiting for the first scored epoch")
        wait_until(
            lambda: _miners_earn(kit.chain, netuid, set(miner_uids)),
            "miners to earn incentive",
            kit.epoch_timeout(netuid),
        )
        kit.settle()
        kit.state = _refreshed(kit.chain, kit.state).model_copy(
            update={"up_seconds": round(time.monotonic() - started, 1)}
        )
        kit.save()
        return kit.state
    finally:
        kit.close()


def down(*, home: Path | None = None) -> None:
    """Remove the container and forget its state and dev keys; the chain is gone."""
    Localnet().stop()
    _clear(local_dir(home))


def reset(*, home: Path | None = None, progress: Progress = _quiet) -> LocalState:
    """A fresh chain with the same shape as the last `up` (or the defaults)."""
    previous = load_state(local_dir(home))
    down(home=home)
    if previous is None:
        return up(home=home, progress=progress)
    return up(previous.miners, previous.validators, previous.tempo, home=home, progress=progress)


def status(*, home: Path | None = None) -> LocalState | None:
    """The persisted state refreshed from the chain, or None when nothing is up."""
    directory = local_dir(home)
    state = load_state(directory)
    if state is None or not Localnet(endpoint=state.endpoint, container=state.container).is_running():
        return None
    chain = Harness(state.endpoint)
    try:
        state = _refreshed(chain, state)
    finally:
        chain.close()
    save_state(directory, state)
    return state


def break_scenario(
    name: str, *, home: Path | None = None, progress: Progress = _quiet
) -> BreakResult:
    """Create one failure the Doctor detects on the running localnet."""
    # Imported here because scenarios build on Kit, which this module defines.
    from .scenarios import SCENARIOS

    scenario = SCENARIOS.get(name)
    if scenario is None:
        raise KitError(f"unknown scenario {name!r}; choose one of {', '.join(SCENARIOS)}")
    kit = open_kit(home, progress)
    try:
        return scenario.run(kit)
    finally:
        kit.close()


def open_kit(home: Path | None = None, progress: Progress | None = None) -> Kit:
    """The running localnet's kit; the caller closes it."""
    directory = local_dir(home)
    state = load_state(directory)
    if state is None or not Localnet(endpoint=state.endpoint, container=state.container).is_running():
        raise KitError("no localnet is up; run `preflight local up` first")
    return Kit(directory, state, progress or _quiet)


def _clear(directory: Path) -> None:
    (directory / "state.json").unlink(missing_ok=True)
    shutil.rmtree(directory / WALLETS, ignore_errors=True)


def _spec(client: bt.Subtensor) -> int | None:
    try:
        return int(client.spec_version)
    except Exception:  # informational only
        return None


def _miners_earn(chain: Harness, netuid: int, uids: set[int]) -> bool:
    graph = chain.metagraph(netuid)
    return all(float(n.incentive) > 0 for n in graph.neurons if n.uid in uids)


def _refreshed(chain: Harness, state: LocalState) -> LocalState:
    """UIDs, axons and stakes as the chain has them now; pruned neurons get uid None."""
    graphs = {netuid: chain.metagraph(netuid) for netuid in {n.netuid for n in state.neurons}}
    neurons: list[LocalNeuron] = []
    for neuron in state.neurons:
        live = next((m for m in graphs[neuron.netuid].neurons if m.hotkey == neuron.hotkey), None)
        if live is None:
            neurons.append(neuron.model_copy(update={"uid": None}))
            continue
        neurons.append(
            neuron.model_copy(
                update={
                    "uid": int(live.uid),
                    "axon": str(live.axon) if live.axon else None,
                    "stake": int(live.total_stake.rao) / RAO_PER_TAO,
                }
            )
        )
    return state.model_copy(update={"neurons": neurons, "block": chain.block})


__all__ = [
    "DEFAULT_MINERS",
    "DEFAULT_TEMPO",
    "DEFAULT_VALIDATORS",
    "BreakResult",
    "ChainError",
    "KitError",
    "LocalNeuron",
    "LocalState",
    "SubmittedExtrinsic",
    "break_scenario",
    "down",
    "reset",
    "status",
    "up",
]
