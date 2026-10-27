import { describe, expect, it } from "vitest";
import brokenMiner from "@/data/samples/doctor_broken_miner.json";
import unregistered from "@/data/samples/doctor_unregistered.json";
import { isOnlyUnregistered } from "./doctor-state";
import { doctorReportSchema } from "./schemas";

const UNREGISTERED = doctorReportSchema.parse(unregistered);
const BROKEN = doctorReportSchema.parse(brokenMiner);

describe("isOnlyUnregistered", () => {
  it("is true when PF101 is the only finding", () => {
    expect(isOnlyUnregistered(UNREGISTERED)).toBe(true);
  });

  it("is true when no subnet was diagnosed at all", () => {
    expect(isOnlyUnregistered({ ...UNREGISTERED, diagnoses: [] })).toBe(true);
  });

  it("is false for a registered neuron or any finding beyond PF101", () => {
    expect(isOnlyUnregistered(BROKEN)).toBe(false);
    const [first] = UNREGISTERED.diagnoses;
    const extra = BROKEN.diagnoses[0]?.findings[0];
    if (!first || !extra) throw new Error("fixture changed");
    expect(isOnlyUnregistered({ ...UNREGISTERED, diagnoses: [{ ...first, findings: [...first.findings, extra] }] })).toBe(false);
  });
});
