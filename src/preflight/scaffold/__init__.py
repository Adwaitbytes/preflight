"""`preflight new <name>`: a small, correct bittensor 11 subnet that runs on localnet."""

from __future__ import annotations

import re
from pathlib import Path

TEMPLATE = Path(__file__).resolve().parent / "template"
NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_-]{1,40}$")


class ScaffoldError(ValueError):
    pass


def package_name(project: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", project.lower()).strip("_")


def create(project: str, parent: Path) -> list[Path]:
    """Write the template into `parent/project`. Refuses to touch an existing directory."""
    if not NAME.match(project):
        raise ScaffoldError("name must start with a letter and use letters, digits, - or _ (2 to 41 characters)")
    target = parent / project
    if target.exists():
        raise ScaffoldError(f"{target} already exists; pick another name or remove it")
    package = package_name(project)
    written: list[Path] = []
    for source in sorted(TEMPLATE.rglob("*")):
        if source.is_dir() or "__pycache__" in source.parts:
            continue
        relative = source.relative_to(TEMPLATE)
        parts = [package if part == "package" else part for part in relative.parts]
        destination = target.joinpath(*parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        text = source.read_text().replace("{{project}}", project).replace("{{package}}", package)
        destination.write_text(text)
        written.append(destination)
    return written
