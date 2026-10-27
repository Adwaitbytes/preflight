import { describe, expect, it } from "vitest";
import { parseSource } from "./source";

describe("parseSource", () => {
  it("shortens a source URL to the file and line", () => {
    expect(parseSource("https://www.bittensor.com/code/pallets/subtensor/src/macros/errors.rs#L180")).toEqual({
      href: "https://www.bittensor.com/code/pallets/subtensor/src/macros/errors.rs#L180",
      label: "errors.rs#L180",
    });
    expect(parseSource("https://www.bittensor.com/code/pallets/subtensor/src/subnets/registration.rs").label).toBe("registration.rs");
  });

  it("falls back to the host for a bare origin", () => {
    expect(parseSource("https://docs.example.org/").label).toBe("docs.example.org");
  });

  it("never links anything but http(s)", () => {
    expect(parseSource("javascript:alert(1)")).toEqual({ href: null, label: "javascript:alert(1)" });
    expect(parseSource("SubtensorModule.Burn")).toEqual({ href: null, label: "SubtensorModule.Burn" });
  });
});
