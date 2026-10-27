import { describe, expect, it } from "vitest";
import { GUIDE_SECTIONS, RULES, guideHref, ruleAnchor } from "./guide";

describe("rule catalog", () => {
  it("lists every rule the engine runs, PF101 to PF113, PF201 to PF208 and PF301 to PF306, once", () => {
    const expected = [
      ...Array.from({ length: 13 }, (_, i) => `PF${101 + i}`),
      ...Array.from({ length: 8 }, (_, i) => `PF${201 + i}`),
      ...Array.from({ length: 6 }, (_, i) => `PF${301 + i}`),
    ];
    expect(RULES.map((r) => r.id)).toEqual(expected);
  });
  it("files each rule under the audience its number says", () => {
    for (const rule of RULES) {
      const audience = rule.id.startsWith("PF1") ? "miner" : rule.id.startsWith("PF2") ? "validator" : "subnet";
      expect(rule.audience, rule.id).toBe(audience);
    }
  });
  it("points each rule at a guide section that exists", () => {
    const ids = new Set(GUIDE_SECTIONS.map((s) => s.id));
    for (const rule of RULES) expect(ids.has(rule.section), rule.id).toBe(true);
  });
  it("cites only official Bittensor docs", () => {
    for (const rule of RULES) if (rule.docs) expect(rule.docs, rule.id).toMatch(/^https:\/\/www\.bittensor\.com\/docs\//);
  });
});

describe("guideHref", () => {
  it("sends a finding to the chapter that explains it", () => {
    expect(guideHref("PF110")).toBe("/guide#consensus");
    expect(guideHref("PF203")).toBe("/guide#validator");
  });
  it("sends a rule without its own chapter to its row in the reference", () => {
    expect(guideHref("PF112")).toBe(`/guide#${ruleAnchor("PF112")}`);
  });
  it("falls back to the reference for an id it does not know", () => {
    expect(guideHref("PF999")).toBe("/guide#rules");
  });
});

describe("sections", () => {
  it("have unique ids and consecutive numbers", () => {
    expect(new Set(GUIDE_SECTIONS.map((s) => s.id)).size).toBe(GUIDE_SECTIONS.length);
    expect(GUIDE_SECTIONS.map((s) => s.number)).toEqual(GUIDE_SECTIONS.map((_, i) => i + 1));
  });
  it("follow the writing rules: no trailing full stop, no em or en dash", () => {
    for (const s of GUIDE_SECTIONS) {
      for (const text of [s.title, s.takeaway]) {
        expect(text, s.id).not.toMatch(/\.$/);
        expect(text, s.id).not.toMatch(/[–—]/);
      }
    }
  });
});
