import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { allowAttempt, forgetAttempts, issueSession, passwordMatches, sessionValid, statsEnabled, SESSION_SECONDS } = await import("./stats-auth");

const NOW = Date.UTC(2026, 9, 30, 12);

describe("stats auth", () => {
  beforeEach(() => vi.stubEnv("STATS_PASSWORD", "a-long-random-stats-password"));
  afterEach(() => vi.unstubAllEnvs());

  it("stays shut without a long enough password", () => {
    vi.stubEnv("STATS_PASSWORD", "short");
    expect(statsEnabled()).toBe(false);
    expect(passwordMatches("short")).toBe(false);
    expect(sessionValid(issueSession(NOW), NOW)).toBe(false);
  });

  it("checks the password exactly", () => {
    expect(passwordMatches("a-long-random-stats-password")).toBe(true);
    expect(passwordMatches("a-long-random-stats-passwor")).toBe(false);
    expect(passwordMatches("")).toBe(false);
  });

  it("accepts its own session until it expires, and nothing forged", () => {
    const session = issueSession(NOW);
    expect(sessionValid(session, NOW + 1000)).toBe(true);
    expect(sessionValid(session, NOW + SESSION_SECONDS * 1000 + 1)).toBe(false);
    const [expires, signature] = session.split(".");
    expect(sessionValid(`${Number(expires) + 3600}.${signature}`, NOW)).toBe(false);
    expect(sessionValid(`${expires}.${signature}x`, NOW)).toBe(false);
    expect(sessionValid(`${expires}.${signature}.extra`, NOW)).toBe(false);
    expect(sessionValid(undefined, NOW)).toBe(false);
  });

  it("signs everyone out when the password changes", () => {
    const session = issueSession(NOW);
    vi.stubEnv("STATS_PASSWORD", "another-long-random-password");
    expect(sessionValid(session, NOW + 1000)).toBe(false);
  });

  it("throttles repeated attempts from one address", () => {
    const ip = "198.51.100.9";
    forgetAttempts(ip);
    const results = Array.from({ length: 10 }, () => allowAttempt(ip, NOW));
    expect(results.filter(Boolean)).toHaveLength(8);
    expect(allowAttempt(ip, NOW + 11 * 60 * 1000)).toBe(true);
  });
});
