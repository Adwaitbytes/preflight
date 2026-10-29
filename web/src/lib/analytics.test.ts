import { describe, expect, it } from "vitest";
import { campaignOf, cleanDetail, templatePath } from "./analytics";

const HOTKEY = "5FcJiV9Vc2Y5GemgWoXhksvQVXQ99csas9En9nYbSx38sS93";

describe("templatePath", () => {
  it("replaces anything looked up with a placeholder before it leaves the browser", () => {
    expect(templatePath(`/doctor/finney/${HOTKEY}?netuid=19`)).toBe("/doctor/finney/:key");
    expect(templatePath("/tx/finney/9382178-8")).toBe("/tx/finney/:ref");
    expect(templatePath(`/tx/finney/0x${"ab".repeat(32)}`)).toBe("/tx/finney/:hash");
    expect(templatePath("/d/AbC12xyz9")).toBe("/d/:id");
    expect(templatePath(`/epoch/finney/19?hotkey=${HOTKEY}`)).toBe("/epoch/finney/19");
    expect(templatePath("/")).toBe("/");
    expect(templatePath("/live/")).toBe("/live");
  });
});

describe("cleanDetail", () => {
  it("masks accounts and trims", () => {
    expect(cleanDetail(`hotkey ${HOTKEY}`)).toBe("hotkey :key");
    expect(cleanDetail("  ")).toBeUndefined();
    expect(cleanDetail(undefined)).toBeUndefined();
  });
});

describe("campaignOf", () => {
  it("reads utm tags from the landing URL", () => {
    expect(campaignOf("?utm_source=hackquest&utm_medium=form&x=1")).toEqual({ utm_source: "hackquest", utm_medium: "form", utm_campaign: undefined });
    expect(campaignOf("")).toEqual({ utm_source: undefined, utm_medium: undefined, utm_campaign: undefined });
  });
});
