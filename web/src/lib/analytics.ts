/**
 * Anonymous page analytics for the private /stats page. No cookies: a random id per browser
 * tab groups one visit, and the server never sees an account, a hash or anything typed. Paths
 * are reduced to templates here and again on the server. Do Not Track and Global Privacy
 * Control turn it off, and so does logging in to /stats, so the owner is never counted.
 */

import type { NetworkId } from "./networks";

export type BeaconEvent =
  | { type: "view" | "leave"; name: "page"; path: string; value?: number }
  | { type: "action"; name: string; path: string; detail?: string }
  | { type: "vital"; name: string; path: string; value: number };

const SS58 = /5[1-9A-HJ-NP-Za-km-z]{46,47}/g;
const HEX = /0x[0-9a-fA-F]{8,}/g;
const BLOCK_REF = /(?<=\/)\d{1,10}-\d{1,6}(?=\/|$)/g;
const MAX_BATCH = 30;

export const IGNORE_KEY = "pf-stats-ignore";
const SESSION_KEY = "pf-session";
const SEEN_KEY = "pf-seen";
const CAMPAIGN_KEY = "pf-campaign";

/** The same placeholders the server applies, so nothing looked up ever leaves the browser */
export function templatePath(path: string): string {
  let raw = path.split("?")[0]?.split("#")[0] ?? "/";
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // a malformed escape stays as typed; the server cleans it again
  }
  raw = raw.replace(SS58, ":key").replace(HEX, ":hash").replace(BLOCK_REF, ":ref").replace(/^\/d\/[^/]+/, "/d/:id");
  raw = raw.replace(/\/{2,}/g, "/");
  return raw.replace(/\/$/, "") || "/";
}

/** A short free-text detail, with anything that looks like an account or hash masked */
export function cleanDetail(detail: string | undefined): string | undefined {
  if (!detail) return undefined;
  const text = detail.replace(SS58, ":key").replace(HEX, ":hash").trim().slice(0, 40);
  return text || undefined;
}

export interface Campaign {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export function campaignOf(search: string): Campaign {
  const params = new URLSearchParams(search);
  const pick = (key: keyof Campaign) => params.get(key)?.slice(0, 60) || undefined;
  return { utm_source: pick("utm_source"), utm_medium: pick("utm_medium"), utm_campaign: pick("utm_campaign") };
}

function store(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function read(kind: "local" | "session", key: string): string | null {
  try {
    return store(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(kind: "local" | "session", key: string, value: string): void {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    // storage blocked: the visit still counts, it just cannot be grouped or tagged returning
  }
}

export function trackingAllowed(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.doNotTrack === "1" || nav.globalPrivacyControl === true) return false;
  if (read("local", IGNORE_KEY) === "1") return false;
  return !window.location.pathname.startsWith("/stats");
}

/** Excluding this browser is what logging in to /stats does; it never sends a page view again */
export function ignoreThisBrowser(): void {
  write("local", IGNORE_KEY, "1");
}

interface Context {
  session: string;
  returning: boolean;
  campaign: Campaign;
  network: NetworkId | null;
}

let context: Context | null = null;
let queue: BeaconEvent[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;

function savedCampaign(): Campaign | null {
  const saved = read("session", CAMPAIGN_KEY);
  if (!saved) return null;
  try {
    const parsed: unknown = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? (parsed as Campaign) : null;
  } catch {
    return null;
  }
}

function ensureContext(): Context {
  if (context) return context;
  let session = read("session", SESSION_KEY);
  if (!session) {
    session = (crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/[^A-Za-z0-9]/g, "").slice(0, 24);
    write("session", SESSION_KEY, session);
  }
  const returning = read("local", SEEN_KEY) === "1";
  write("local", SEEN_KEY, "1");
  // The campaign belongs to the landing URL; later navigations inside the site keep it
  const campaign = savedCampaign() ?? campaignOf(window.location.search);
  write("session", CAMPAIGN_KEY, JSON.stringify(campaign));
  context = { session, returning, campaign, network: null };
  return context;
}

export function setNetwork(network: NetworkId): void {
  ensureContext().network = network;
}

function endpoint(): string {
  const base = process.env.NEXT_PUBLIC_PREFLIGHT_API_URL?.trim() || "";
  return `${base.replace(/\/+$/, "")}/v1/collect`;
}

export function enqueue(event: BeaconEvent): void {
  if (!trackingAllowed()) return;
  queue.push({ ...event, path: templatePath(event.path) });
  if (queue.length >= MAX_BATCH) flush();
  else if (!timer) timer = setTimeout(() => flush(), 4000);
}

/** Send what is queued. `final` uses sendBeacon, which survives the page being closed */
export function flush(final = false): void {
  if (timer) clearTimeout(timer);
  timer = undefined;
  if (!queue.length || typeof window === "undefined") return;
  const ctx = ensureContext();
  const events = queue.slice(0, MAX_BATCH);
  queue = queue.slice(MAX_BATCH);
  const body = JSON.stringify({
    session: ctx.session,
    events,
    referrer: document.referrer || undefined,
    ...ctx.campaign,
    lang: navigator.language?.slice(0, 20),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone?.slice(0, 60),
    viewport: Math.round(window.innerWidth),
    network: ctx.network ?? undefined,
    returning: ctx.returning,
  });
  const url = endpoint();
  if (final && typeof navigator.sendBeacon === "function" && navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))) return;
  fetch(url, { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {
    // analytics never interrupts the page; a lost batch is fine
  });
  if (queue.length) flush(final);
}

/** Count a named action, like `track("search", "hotkey")`. Never pass what was typed */
export function track(name: string, detail?: string): void {
  if (typeof window === "undefined") return;
  enqueue({ type: "action", name, path: window.location.pathname, detail: cleanDetail(detail) });
}
