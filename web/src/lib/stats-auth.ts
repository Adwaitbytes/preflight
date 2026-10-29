import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * The /stats password gate. The password lives only in the STATS_PASSWORD environment
 * variable; a login sets an httpOnly cookie holding an expiry and its HMAC, keyed by that
 * password, so changing the password signs everyone out. Failed logins are throttled per IP.
 */

export const STATS_COOKIE = "pf_stats";
export const SESSION_SECONDS = 12 * 3600;
const MIN_PASSWORD_LENGTH = 12;
const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

function secret(): string {
  return process.env.STATS_PASSWORD ?? "";
}

/** No password configured, or a short one, means /stats stays shut for everyone */
export function statsEnabled(): boolean {
  return secret().length >= MIN_PASSWORD_LENGTH;
}

function sign(expires: number): Buffer {
  return createHmac("sha256", `pf-stats-session:${secret()}`).update(String(expires)).digest();
}

export function issueSession(nowMs = Date.now()): string {
  const expires = Math.floor(nowMs / 1000) + SESSION_SECONDS;
  return `${expires}.${sign(expires).toString("base64url")}`;
}

export function sessionValid(value: string | undefined, nowMs = Date.now()): boolean {
  if (!value || !statsEnabled()) return false;
  const [rawExpires, rawSignature, extra] = value.split(".");
  if (!rawExpires || !rawSignature || extra !== undefined || !/^\d{1,12}$/.test(rawExpires)) return false;
  const expires = Number(rawExpires);
  if (expires * 1000 <= nowMs) return false;
  const given = Buffer.from(rawSignature, "base64url");
  const expected = sign(expires);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Constant time: both sides are hashed to the same length before comparing */
export function passwordMatches(given: string): boolean {
  if (!statsEnabled()) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(secret()).digest();
  return timingSafeEqual(a, b);
}

const attempts = new Map<string, { count: number; first: number }>();

/** Per instance, which is enough against guessing a random password and costs nothing */
export function allowAttempt(ip: string, nowMs = Date.now()): boolean {
  const seen = attempts.get(ip);
  if (!seen || nowMs - seen.first > ATTEMPT_WINDOW_MS) {
    attempts.set(ip, { count: 1, first: nowMs });
    if (attempts.size > 5000) attempts.clear();
    return true;
  }
  seen.count += 1;
  return seen.count <= MAX_ATTEMPTS;
}

export function forgetAttempts(ip: string): void {
  attempts.delete(ip);
}
