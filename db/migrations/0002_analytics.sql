-- Anonymous usage analytics for the private /stats page.
-- Never stored: IP addresses, hotkeys, coldkeys, transaction hashes, chat ids or full URLs.
-- `visitor` is a hash of IP and user agent salted per day, so it counts unique visitors
-- within a day and cannot follow anyone across days. Rows older than 90 days are pruned.

CREATE TABLE IF NOT EXISTS events (
    id          bigserial PRIMARY KEY,
    at          timestamptz NOT NULL DEFAULT now(),
    kind        text NOT NULL CHECK (kind IN ('view', 'leave', 'action', 'vital', 'api', 'bot')),
    name        text NOT NULL,
    session     text,
    visitor     text,
    value       double precision,
    status      integer,
    network     text,
    client      text,
    country     text,
    region      text,
    city        text,
    device      text,
    browser     text,
    os          text,
    source      text,
    automated   boolean NOT NULL DEFAULT false,
    props       jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS events_at ON events (at DESC);
CREATE INDEX IF NOT EXISTS events_kind_at ON events (kind, at DESC);
CREATE INDEX IF NOT EXISTS events_session ON events (session, at) WHERE session IS NOT NULL;
