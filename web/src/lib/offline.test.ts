import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { SAMPLE_REPORTS, explainFromCatalog, offlineApi } = await import("./offline");

describe("offline demo data", () => {
  it("parses every recorded doctor sample against the contract", () => {
    expect(SAMPLE_REPORTS).toHaveLength(4);
  });

  it("filters a multi subnet report by netuid", async () => {
    const result = await offlineApi.doctor("finney", "5CSa1rZAzh8Nf9nT9wMBghE6DPzTFoEdWZaRXD6mdVBkVJhw", { netuid: 51 });
    expect(result.ok && result.data.diagnoses.map((d) => d.netuid)).toEqual([51]);
  });

  it("answers offline_miss for hotkeys it never recorded", async () => {
    const result = await offlineApi.doctor("finney", "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY");
    expect(result).toMatchObject({ ok: false, error: { kind: "offline_miss" } });
  });

  it("finds tx by block-index and by hash", async () => {
    expect((await offlineApi.tx("finney", "9376703-0022")).ok).toBe(true);
    expect((await offlineApi.tx("finney", "0xfcc0ad9a9622e8380fdbc05b16384d802283ff8a1263edc3b441adb56141a02a")).ok).toBe(true);
  });

  it("explains a runtime error found inside a traceback", () => {
    const explained = explainFromCatalog("bittensor.core.errors: SubtensorModule.TooManyRegistrationsThisBlock: retry");
    expect(explained).toMatchObject({ error: "TooManyRegistrationsThisBlock", pallet: "SubtensorModule", found: true });
    expect(explainFromCatalog("something unrelated").found).toBe(false);
  });
});
