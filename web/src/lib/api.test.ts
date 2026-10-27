import { describe, expect, it } from "vitest";
import { createHttpApi, errorForStatus } from "./api";

function fakeFetch(status: number, body: unknown, headers: Record<string, string> = {}): typeof fetch {
  return async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

describe("errorForStatus", () => {
  it("maps HTTP statuses to typed states", () => {
    expect(errorForStatus(400, null, null).kind).toBe("invalid_input");
    expect(errorForStatus(422, null, null).kind).toBe("invalid_input");
    expect(errorForStatus(404, null, null).kind).toBe("not_found");
    expect(errorForStatus(503, null, null).kind).toBe("unreachable");
    expect(errorForStatus(500, null, null).kind).toBe("server");
    expect(errorForStatus(429, null, "12")).toMatchObject({ kind: "rate_limited", retryAfter: 12 });
  });
});

describe("createHttpApi", () => {
  it("returns FastAPI's detail message on failure", async () => {
    const api = createHttpApi({ baseUrl: "http://api", fetch: fakeFetch(503, { detail: "finney did not answer within 10 s" }) });
    const result = await api.doctor("finney", "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq");
    expect(result).toEqual({ ok: false, error: { kind: "unreachable", status: 503, message: "finney did not answer within 10 s" } });
  });

  it("rejects a 200 whose body does not have the promised shape", async () => {
    const api = createHttpApi({ baseUrl: "http://api", fetch: fakeFetch(200, { hello: "world" }) });
    const result = await api.tx("finney", "9376703-0022");
    expect(result.ok).toBe(false);
  });

  it("reports a network failure instead of throwing", async () => {
    const failing: typeof fetch = async () => {
      throw new TypeError("fetch failed");
    };
    const result = await createHttpApi({ baseUrl: "http://api", fetch: failing }).health();
    expect(result).toMatchObject({ ok: false, error: { kind: "network" } });
  });

  it("reads health scores and rejects a body without them", async () => {
    const chain = { network: "finney", endpoint: "wss://x", block: 9377656, block_hash: "0x00" };
    const good = createHttpApi({ baseUrl: "http://api", fetch: fakeFetch(200, { chain, scores: {} }) });
    expect(await good.scores("finney")).toMatchObject({ ok: true, data: { chain: { block: 9377656 } } });
    const bad = createHttpApi({ baseUrl: "http://api", fetch: fakeFetch(200, { chain }) });
    expect((await bad.scores("finney")).ok).toBe(false);
  });

  it("validates the house counters", async () => {
    const good = createHttpApi({ baseUrl: "http://api", fetch: fakeFetch(200, { diagnoses: 3, errors: 1, builders: 2, since: "2026-10-27" }) });
    expect(await good.house()).toMatchObject({ ok: true, data: { diagnoses: 3 } });
    const bad = createHttpApi({ baseUrl: "http://api", fetch: fakeFetch(200, { diagnoses: -1 }) });
    expect((await bad.house()).ok).toBe(false);
  });
});
