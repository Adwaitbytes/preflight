"""Live numbers for the subnet directory, joined with the curated catalog.

The whole directory is four reads at one pinned block, run concurrently:
`get_all_dynamic_info` (names, symbols, reserves, per-block TAO emission, tempo, owner),
`get_subnets_info` (registered UIDs, max UIDs, burn), and two batched storage reads
(`ValidatorPermit`, `NetworkRegistrationAllowed`) for every netuid. That is about 2 s
warm on finney. Health needs a full metagraph per subnet, so the list computes it only
for the netuids a caller asks for.
"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from typing import Any

from ..chain import registry as R
from ..chain.network import Network, Pinned, gather, pin
from ..chain.snapshot import read_subnet
from ..models import Health, SubnetCard, SubnetDetail, SubnetLive
from ..plan.hyperparams import RAO, explain_hyperparams, raw_int
from ..plan.launch import decode_text, subnet_name
from .catalog import by_netuid
from .health import health

ROOT_NETUID = 0
# Per-subnet reads fan out again inside `read_subnet`, which uses the shared `gather`
# executor. Running the outer fan-out there too could park every worker on an outer
# task waiting for inner reads, so the outer level gets its own small pool.
_subnet_pool = ThreadPoolExecutor(max_workers=8, thread_name_prefix="preflight-subnet")


def _rows(value: Any) -> list[dict[str, Any]]:
    return [row for row in (value or []) if isinstance(row, dict)]  # pyright: ignore[reportUnknownVariableType]


def read_live(pinned: Pinned) -> list[SubnetLive]:
    first = gather(
        {
            "dynamic": lambda: pinned.runtime(R.API_ALL_DYNAMIC_INFO, []),
            "info": lambda: pinned.runtime(R.API_SUBNETS_INFO, []),
        }
    )
    dynamic = {raw_int(row["netuid"]): row for row in _rows(first["dynamic"])}
    info = {raw_int(row["netuid"]): row for row in _rows(first["info"])}
    netuids = sorted(dynamic)
    keys = [[netuid] for netuid in netuids]
    batched = gather(
        {
            "permits": lambda: pinned.client.query_batch(
                R.VALIDATOR_PERMIT, keys, block=pinned.block
            ),
            "allowed": lambda: pinned.client.query_batch(
                R.REGISTRATION_ALLOWED, keys, block=pinned.block
            ),
        }
    )
    permits = dict(zip(netuids, batched["permits"] or [], strict=False))
    allowed = dict(zip(netuids, batched["allowed"] or [], strict=False))
    total_emission = sum(raw_int(row.get("tao_in_emission")) for row in dynamic.values())
    live: list[SubnetLive] = []
    for netuid in netuids:
        row = dynamic[netuid]
        sub = info.get(netuid, {})
        validators = sum(1 for permit in permits.get(netuid) or [] if permit)
        registered = raw_int(sub.get("subnetwork_n"))
        alpha_in = raw_int(row.get("alpha_in"))
        price = (
            1.0
            if netuid == ROOT_NETUID
            else (raw_int(row.get("tao_in")) / alpha_in if alpha_in else None)
        )
        emission = raw_int(row.get("tao_in_emission"))
        owner = row.get("owner_coldkey")
        live.append(
            SubnetLive(
                netuid=netuid,
                name=subnet_name(row) or f"SN{netuid}",
                symbol=decode_text(row.get("token_symbol")),
                price_tao=price,
                emission_share=emission / total_emission if total_emission else None,
                miners=max(registered - validators, 0),
                validators=validators,
                max_uids=raw_int(sub.get("max_allowed_uids")),
                registration_cost_tao=raw_int(sub.get("burn")) / RAO,
                registration_allowed=bool(allowed.get(netuid, True)),
                tempo=raw_int(row.get("tempo")),
                owner_coldkey=str(owner) if owner else None,
            )
        )
    return live


def live_subnets(network: Network) -> list[SubnetLive]:
    return read_live(pin(network))


def _health_of(pinned: Pinned, netuid: int) -> Health:
    return health(read_subnet(pinned, netuid))


def _health_for(pinned: Pinned, netuids: set[int]) -> dict[int, Health]:
    futures = {
        netuid: _subnet_pool.submit(_health_of, pinned, netuid) for netuid in sorted(netuids)
    }
    return {netuid: future.result() for netuid, future in futures.items()}


def subnet_cards(network: Network, health_for: set[int] | None = None) -> list[SubnetCard]:
    """One card per subnet on chain (root excluded) plus catalog entries not on chain,
    which then carry `live=None`. Health only for the netuids in `health_for`."""
    pinned = pin(network)
    wanted = set(health_for or ())
    live_future = _subnet_pool.submit(read_live, pinned)
    scores = _health_for(pinned, wanted) if wanted else {}
    live = {row.netuid: row for row in live_future.result() if row.netuid != ROOT_NETUID}
    catalog = by_netuid()
    netuids = sorted(set(live) | set(catalog))
    return [
        SubnetCard(
            netuid=netuid,
            catalog=catalog.get(netuid),
            live=live.get(netuid),
            health=scores.get(netuid),
        )
        for netuid in netuids
    ]


def subnet_detail(network: Network, netuid: int) -> SubnetDetail:
    """Card with health, plus every hyperparameter explained. Raises LookupError when the
    netuid does not exist at the pinned block."""
    pinned = pin(network)
    live_future = _subnet_pool.submit(read_live, pinned)
    hp_future = _subnet_pool.submit(pinned.view.subnets.subnet_hyperparameters, netuid)
    snapshot = read_subnet(pinned, netuid, burn_history=6)
    live = next((row for row in live_future.result() if row.netuid == netuid), None)
    raw: dict[str, Any] = hp_future.result() or {}
    card = SubnetCard(
        netuid=netuid,
        catalog=by_netuid().get(netuid),
        live=live,
        health=health(snapshot),
    )
    return SubnetDetail(
        chain=pinned.ref,
        card=card,
        hyperparams=explain_hyperparams(raw, snapshot.block_seconds),
    )
