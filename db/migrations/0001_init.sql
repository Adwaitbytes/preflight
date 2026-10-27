-- Preflight schema. Applied in order by scripts/migrate.py; each file runs once.
-- No hotkey is stored unless the user creates a watch or shares a report.

CREATE TABLE IF NOT EXISTS reports (
    id          text PRIMARY KEY,
    kind        text NOT NULL CHECK (kind IN ('doctor', 'tx', 'sim')),
    network     text NOT NULL,
    subject     text NOT NULL,
    block       bigint NOT NULL,
    payload     jsonb NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    shared      boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS watches (
    id          text PRIMARY KEY,
    network     text NOT NULL,
    hotkey      text NOT NULL,
    netuid      integer NOT NULL,
    channel     text NOT NULL DEFAULT 'telegram',
    chat_id     text,
    link_code   text UNIQUE,
    rules       jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at  timestamptz NOT NULL DEFAULT now(),
    last_state  jsonb
);

CREATE TABLE IF NOT EXISTS alerts (
    id          bigserial PRIMARY KEY,
    watch_id    text NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
    rule_id     text NOT NULL,
    sent_at     timestamptz NOT NULL DEFAULT now(),
    payload     jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS counters (
    day         date NOT NULL,
    kind        text NOT NULL,
    network     text NOT NULL,
    count       bigint NOT NULL DEFAULT 0,
    PRIMARY KEY (day, kind, network)
);

-- Builders who opted in on the /house page: a random browser id, never tied to a person.
CREATE TABLE IF NOT EXISTS house_members (
    id          text PRIMARY KEY,
    first_seen  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subnet_cache (
    network     text NOT NULL,
    netuid      integer NOT NULL,
    block       bigint NOT NULL,
    payload     jsonb NOT NULL,
    updated_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (network, netuid)
);

CREATE TABLE IF NOT EXISTS schema_migrations (
    name        text PRIMARY KEY,
    applied_at  timestamptz NOT NULL DEFAULT now()
);
