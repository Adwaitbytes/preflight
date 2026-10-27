import { describe, expect, it } from "vitest";
import { classifyInput, hrefForInput } from "./route-input";

const HOTKEY = "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq";
const HASH = "0x1d7d1e5f5529135a00d793616d63ed5e9c45a4007997678ce0f4d19d460ea649";

describe("classifyInput", () => {
  it("treats blank input as empty", () => {
    expect(classifyInput("   ")).toEqual({ kind: "empty" });
  });

  it("recognises an ss58 hotkey, trimming whitespace", () => {
    expect(classifyInput(`  ${HOTKEY}\n`)).toEqual({ kind: "hotkey", hotkey: HOTKEY });
  });

  it("rejects base58 lookalikes containing 0, O, I or l", () => {
    expect(classifyInput("5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmh0").kind).not.toBe("hotkey");
  });

  it("recognises an extrinsic hash and lowercases it", () => {
    expect(classifyInput(HASH.toUpperCase().replace("0X", "0x"))).toEqual({ kind: "extrinsic", hash: HASH });
  });

  it("does not take a 63 character hex string for a hash", () => {
    expect(classifyInput(HASH.slice(0, -1)).kind).not.toBe("extrinsic");
  });

  it("recognises block-index references and pads the index", () => {
    expect(classifyInput("9376574-0003")).toEqual({ kind: "block_index", block: 9376574, index: 3, ref: "9376574-0003" });
    expect(classifyInput("9376703-22")).toMatchObject({ kind: "block_index", ref: "9376703-0022" });
  });

  it("recognises bare and prefixed netuids", () => {
    expect(classifyInput("64")).toEqual({ kind: "netuid", netuid: 64 });
    expect(classifyInput("SN64")).toEqual({ kind: "netuid", netuid: 64 });
    expect(classifyInput("netuid 0")).toEqual({ kind: "netuid", netuid: 0 });
  });

  it("recognises dotted pallet errors, bare error names and tracebacks", () => {
    expect(classifyInput("SubtensorModule.TooManyRegistrationsThisBlock").kind).toBe("error");
    expect(classifyInput("TooManyUnrevealedCommits").kind).toBe("error");
    expect(classifyInput('Traceback (most recent call last):\n  File "x.py"\nSubstrateRequestException: {"name": "SettingWeightsTooFast"}').kind).toBe("error");
  });

  it("finds a hotkey inside a question", () => {
    expect(classifyInput(`why is ${HOTKEY} earning zero`)).toEqual({ kind: "hotkey", hotkey: HOTKEY });
  });

  it("falls back to a subnet search for short names", () => {
    expect(classifyInput("chutes")).toEqual({ kind: "subnet_name", query: "chutes" });
    expect(classifyInput("3D generation")).toEqual({ kind: "subnet_name", query: "3D generation" });
  });

  it("treats long free text as an error to explain", () => {
    expect(classifyInput("my registration keeps getting rejected after I pay the burn on subnet sixty four").kind).toBe("error");
  });
});

describe("hrefForInput", () => {
  it("routes each kind to its view on the chosen network", () => {
    expect(hrefForInput(classifyInput(HOTKEY), "test")).toBe(`/doctor/test/${HOTKEY}`);
    expect(hrefForInput(classifyInput("9376703-0022"), "finney")).toBe("/tx/finney/9376703-0022");
    expect(hrefForInput(classifyInput("64"), "finney")).toBe("/subnets/64?network=finney");
    expect(hrefForInput(classifyInput("chutes"), "finney")).toBe("/subnets?q=chutes&network=finney");
    expect(hrefForInput(classifyInput("InvalidIpAddress"), "finney")).toBe("/explain?text=InvalidIpAddress");
    expect(hrefForInput(classifyInput(""), "finney")).toBeNull();
  });
});
