import { describe, expect, it } from "vitest";
import { countVerdicts, DEFAULT_FLEET_SORT, filterFleet, fleetDoctorHref, nextSort, partitionFleet, sortFleet } from "./fleet";
import type { Finding, FleetRow, Severity } from "./types";

function finding(severity: Severity): Finding {
  return { id: "PF108", rule: "no_validator_weight", severity, title: "No validator has scored this UID", evidence: [], explanation: "" };
}

function row(over: Partial<FleetRow> & Pick<FleetRow, "hotkey">): FleetRow {
  return { netuid: 1, uid: 0, role: "miner", verdict: "healthy", headline: "", worst: null, tao_per_day: 0, ...over };
}

const broken = row({ hotkey: "5A", netuid: 26, uid: 82, verdict: "broken", worst: finding("critical") });
const warnHigh = row({ hotkey: "5B", netuid: 64, uid: 3, verdict: "warning", worst: finding("high"), tao_per_day: 1 });
const warnMedium = row({ hotkey: "5C", netuid: 4, uid: 9, verdict: "warning", worst: finding("medium"), tao_per_day: 5 });
const richest = row({ hotkey: "5D", netuid: 64, uid: 207, tao_per_day: 30.8 });
const modest = row({ hotkey: "5E", netuid: 51, uid: 50, tao_per_day: 4.17 });
const idle = row({ hotkey: "5F", netuid: null, uid: null, role: "unregistered", verdict: "warning" });

const seats = [modest, richest, warnMedium, broken, warnHigh];

describe("partitionFleet", () => {
  it("separates hotkeys registered nowhere from seats", () => {
    expect(partitionFleet([broken, idle, richest])).toEqual({ seats: [broken, richest], unregistered: [idle] });
  });
});

describe("sortFleet", () => {
  it("defaults to worst first: verdict, then severity, then the biggest earner", () => {
    expect(sortFleet(seats, DEFAULT_FLEET_SORT).map((r) => r.hotkey)).toEqual(["5A", "5B", "5C", "5D", "5E"]);
  });
  it("reverses worst first to put healthy seats on top", () => {
    expect(sortFleet(seats, { key: "verdict", direction: "desc" }).map((r) => r.hotkey)).toEqual(["5E", "5D", "5C", "5B", "5A"]);
  });
  it("sorts by subnet, then UID", () => {
    expect(sortFleet(seats, { key: "subnet", direction: "asc" }).map((r) => r.hotkey)).toEqual(["5C", "5A", "5E", "5B", "5D"]);
  });
  it("sorts by TAO a day", () => {
    expect(sortFleet(seats, { key: "tao", direction: "desc" }).map((r) => r.hotkey)).toEqual(["5D", "5C", "5E", "5B", "5A"]);
    expect(sortFleet(seats, { key: "tao", direction: "asc" }).map((r) => r.hotkey)).toEqual(["5A", "5B", "5E", "5C", "5D"]);
  });
  it("keeps rows without a UID last in either direction", () => {
    const withIdle = [idle, ...seats];
    expect(sortFleet(withIdle, { key: "uid", direction: "asc" }).at(-1)).toBe(idle);
    expect(sortFleet(withIdle, { key: "uid", direction: "desc" }).at(-1)).toBe(idle);
  });
  it("treats a missing emission as zero", () => {
    const unknown = row({ hotkey: "5G", netuid: 9, uid: 1, tao_per_day: undefined });
    expect(sortFleet([unknown, modest], { key: "tao", direction: "desc" }).map((r) => r.hotkey)).toEqual(["5E", "5G"]);
  });
  it("does not mutate its input", () => {
    const input = [...seats];
    sortFleet(input, { key: "tao", direction: "desc" });
    expect(input).toEqual(seats);
  });
});

describe("nextSort", () => {
  it("toggles the active column", () => {
    expect(nextSort({ key: "tao", direction: "desc" }, "tao")).toEqual({ key: "tao", direction: "asc" });
  });
  it("starts a new column in its natural direction", () => {
    expect(nextSort(DEFAULT_FLEET_SORT, "tao")).toEqual({ key: "tao", direction: "desc" });
    expect(nextSort(DEFAULT_FLEET_SORT, "uid")).toEqual({ key: "uid", direction: "asc" });
  });
});

describe("filterFleet and countVerdicts", () => {
  it("filters by verdict and counts every verdict", () => {
    const rows = [...seats, idle];
    expect(filterFleet(rows, "all")).toHaveLength(6);
    expect(filterFleet(rows, "warning").map((r) => r.hotkey)).toEqual(["5C", "5B", "5F"]);
    expect(countVerdicts(rows)).toEqual({ broken: 1, warning: 3, healthy: 2 });
  });
});

describe("fleetDoctorHref", () => {
  it("opens the Doctor on the row's subnet", () => {
    expect(fleetDoctorHref("finney", broken)).toBe("/doctor/finney/5A?netuid=26");
  });
  it("opens the Doctor across subnets for an unregistered hotkey", () => {
    expect(fleetDoctorHref("test", idle)).toBe("/doctor/test/5F");
  });
});
