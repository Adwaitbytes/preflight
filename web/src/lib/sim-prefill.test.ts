import { describe, expect, it } from "vitest";
import { parseSimPrefill, simulateRegistrationHref } from "./sim-prefill";

const HOTKEY = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

describe("parseSimPrefill", () => {
  it("reads the action and the known fields", () => {
    const prefill = parseSimPrefill(new URLSearchParams(`action=burned_register&hotkey=${HOTKEY}&netuid=64&bogus=1`));
    expect(prefill).toEqual({ action: "burned_register", network: null, values: { hotkey: HOTKEY, netuid: "64" } });
  });

  it("ignores links without a known action", () => {
    expect(parseSimPrefill(new URLSearchParams(`hotkey=${HOTKEY}`))).toBeNull();
    expect(parseSimPrefill(new URLSearchParams("action=transfer_all"))).toBeNull();
    expect(parseSimPrefill(new URLSearchParams("action=constructor"))).toBeNull();
  });

  it("drops oversized values and unknown networks", () => {
    const prefill = parseSimPrefill(new URLSearchParams({ action: "set_weights", uids: "1,".repeat(200), network: "mainnet" }));
    expect(prefill).toEqual({ action: "set_weights", network: null, values: {} });
    expect(parseSimPrefill(new URLSearchParams("action=add_stake&network=test"))?.network).toBe("test");
  });
});

describe("simulateRegistrationHref", () => {
  it("round trips through the parser", () => {
    const href = simulateRegistrationHref("test", HOTKEY, 51);
    expect(href).toBe(`/sim?action=burned_register&hotkey=${HOTKEY}&netuid=51&network=test`);
    expect(parseSimPrefill(new URLSearchParams(href.split("?")[1]))).toEqual({
      action: "burned_register",
      network: "test",
      values: { hotkey: HOTKEY, netuid: "51" },
    });
    expect(simulateRegistrationHref("finney", HOTKEY, null)).toBe(`/sim?action=burned_register&hotkey=${HOTKEY}`);
  });
});
