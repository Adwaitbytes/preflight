from __future__ import annotations

import threading

import pytest

from preflight.core.chain.network import Network, gather


def test_nested_gather_does_not_deadlock() -> None:
    def inner() -> int:
        return sum(gather({str(i): (lambda i=i: i) for i in range(5)}).values())

    done: dict[str, int] = {}
    worker = threading.Thread(target=lambda: done.update(gather({str(i): inner for i in range(40)})))
    worker.start()
    worker.join(timeout=10)
    assert not worker.is_alive(), "nested gather deadlocked"
    assert sum(done.values()) == 400


@pytest.mark.parametrize(
    ("value", "name"),
    [("finney", "finney"), ("mainnet", "finney"), ("test", "test"), ("local", "local"), ("ws://10.0.0.2:9944", "custom")],
)
def test_network_resolve(value: str, name: str) -> None:
    assert Network.resolve(value).name == name


def test_network_rejects_unknown() -> None:
    with pytest.raises(ValueError):
        Network.resolve("http://example.com")
