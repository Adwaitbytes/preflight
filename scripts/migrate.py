"""Apply db/migrations/*.sql to DATABASE_URL in name order, each exactly once.

`uv run --env-file web/.env.local python scripts/migrate.py`
"""

from __future__ import annotations

from pathlib import Path

from preflight.core.store import connect

MIGRATIONS = Path(__file__).resolve().parent.parent / "db" / "migrations"


def main() -> None:
    with connect() as db:
        db.execute("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())")
        done = {str(r["name"]) for r in db.execute("SELECT name FROM schema_migrations").fetchall()}
        for path in sorted(MIGRATIONS.glob("*.sql")):
            if path.name in done:
                print(f"skip  {path.name}")
                continue
            db.execute(path.read_text().encode())
            db.execute("INSERT INTO schema_migrations (name) VALUES (%s)", (path.name,))
            print(f"apply {path.name}")


if __name__ == "__main__":
    main()
