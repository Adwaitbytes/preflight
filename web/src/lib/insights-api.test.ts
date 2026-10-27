import { describe, expect, it, vi } from "vitest";
import economicsSample from "@/data/samples/economics-51.json";
import fleetSample from "@/data/samples/fleet.json";

vi.mock("server-only", () => ({}));

const { createInsightsApi, offlineInsightsApi } = await import("./insights-api");

const COLDKEY = "5FyBy1yBnm1ZLoLGEskzXWLbsCuC9961fkLG1ZTs9DbcnpMB";

function respond(status: number, body: unknown, seen: string[] = []): typeof fetch {
  return async (input) => {
    seen.push(String(input));
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  };
}

describe("createInsightsApi", () => {
  it("reads a fleet report from the fleet endpoint", async () => {
    const seen: string[] = [];
    const api = createInsightsApi({ baseUrl: "http://api/", fetch: respond(200, fleetSample, seen) });
    const result = await api.fleet("finney", COLDKEY);
    expect(seen).toEqual([`http://api/v1/fleet/finney/${COLDKEY}`]);
    expect(result).toMatchObject({ ok: true, data: { coldkey: COLDKEY, broken: 3 } });
  });

  it("reads miner economics from the economics endpoint", async () => {
    const seen: string[] = [];
    const api = createInsightsApi({ baseUrl: "http://api", fetch: respond(200, economicsSample, seen) });
    const result = await api.economics("test", 51);
    expect(seen).toEqual(["http://api/v1/economics/test/51"]);
    expect(result).toMatchObject({ ok: true, data: { netuid: 51, verdict: "competitive" } });
  });

  it("maps the API's error detail through the shared status mapping", async () => {
    const detail = "coldkey must be an ss58 address like 5F...; got 'nope'";
    const invalid = await createInsightsApi({ baseUrl: "http://api", fetch: respond(400, { detail, kind: "invalid_input" }) }).fleet("finney", "nope");
    expect(invalid).toEqual({ ok: false, error: { kind: "invalid_input", status: 400, message: detail } });
    const missing = await createInsightsApi({ baseUrl: "http://api", fetch: respond(404, { detail: "netuid 500 does not exist" }) }).economics("finney", 500);
    expect(missing).toMatchObject({ ok: false, error: { kind: "not_found", message: "netuid 500 does not exist" } });
    const down = await createInsightsApi({ baseUrl: "http://api", fetch: respond(503, { detail: "finney did not answer" }) }).fleet("finney", COLDKEY);
    expect(down).toMatchObject({ ok: false, error: { kind: "unreachable" } });
  });

  it("rejects a 200 whose body breaks the contract", async () => {
    const result = await createInsightsApi({ baseUrl: "http://api", fetch: respond(200, { ...economicsSample, verdict: "great" }) }).economics("finney", 51);
    expect(result).toMatchObject({ ok: false, error: { kind: "server" } });
  });

  it("reports a network failure instead of throwing", async () => {
    const failing: typeof fetch = async () => {
      throw new TypeError("fetch failed");
    };
    const result = await createInsightsApi({ baseUrl: "http://api", fetch: failing }).fleet("finney", COLDKEY);
    expect(result).toMatchObject({ ok: false, error: { kind: "network", message: "Could not reach the Preflight API" } });
  });
});

describe("offlineInsightsApi", () => {
  it("serves the recorded fleet and SN51 economics", async () => {
    expect(await offlineInsightsApi.fleet("finney", COLDKEY)).toMatchObject({ ok: true, data: { hotkeys: 16, rows: { length: 19 } } });
    expect(await offlineInsightsApi.economics("finney", 51)).toMatchObject({ ok: true, data: { name: "lium.io" } });
  });

  it("answers offline_miss for anything it never recorded", async () => {
    expect(await offlineInsightsApi.fleet("finney", "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toMatchObject({
      ok: false,
      error: { kind: "offline_miss" },
    });
    expect(await offlineInsightsApi.economics("finney", 64)).toMatchObject({ ok: false, error: { kind: "offline_miss" } });
  });
});
