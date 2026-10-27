"""One fresh localnet per test session: `up` once, then every scenario breaks it further.

Each scenario test runs `break` and then diagnoses, so later scenarios may disturb neurons an
earlier test already checked; the healthy check therefore runs before any break.
"""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

import pytest

from preflight.core.local import LocalState, down, up


@pytest.fixture(scope="session")
def local_home(tmp_path_factory: pytest.TempPathFactory) -> Path:
    return tmp_path_factory.mktemp("preflight-local")


@pytest.fixture(scope="session")
def local_state(local_home: Path) -> Iterator[LocalState]:
    state = up(home=local_home)
    yield state
    down(home=local_home)
