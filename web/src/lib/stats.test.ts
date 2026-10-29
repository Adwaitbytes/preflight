import { describe, expect, it } from "vitest";
import { barWidth, bucketLabel, countryName, describeEvent, formatMs, formatSeconds, formatVital, timeAgo } from "./stats";

describe("stats formatting", () => {
  it("names countries and keeps unknowns readable", () => {
    expect(countryName("DE")).toBe("Germany");
    expect(countryName("in")).toBe("India");
    expect(countryName(null)).toBe("Unknown");
  });

  it("says durations the way a person would", () => {
    expect(formatSeconds(8.4)).toBe("8 s");
    expect(formatSeconds(190)).toBe("3 min 10 s");
    expect(formatSeconds(120)).toBe("2 min");
    expect(formatSeconds(3840)).toBe("1 h 4 min");
    expect(formatSeconds(null)).toBe("n/a");
    expect(formatMs(812.4)).toBe("812 ms");
    expect(formatMs(1234)).toBe("1.23 s");
    expect(formatVital("CLS", 0.0512)).toBe("0.051");
    expect(formatVital("LCP", 1830)).toBe("1.83 s");
  });

  it("labels buckets by hour or by day, in UTC", () => {
    expect(bucketLabel("2026-10-30T14:00:00+00:00", "24h")).toBe("14:00");
    expect(bucketLabel("2026-10-30T00:00:00+00:00", "7d")).toBe("30 Oct");
  });

  it("describes recent events in words", () => {
    const base = { at: "2026-10-30T12:00:00Z", detail: null, country: "IN", city: "Mumbai", device: "desktop", client: null, value: null, status: null };
    expect(describeEvent({ ...base, kind: "leave", name: "/epoch/finney/19", value: 95_000 })).toBe("Spent 1 min 35 s on /epoch/finney/19");
    expect(describeEvent({ ...base, kind: "api", name: "doctor", value: 1234, status: 200 })).toBe("Ran Doctor in 1.23 s");
    expect(describeEvent({ ...base, kind: "action", name: "search", detail: "hotkey" })).toBe("Used search (hotkey)");
    expect(describeEvent({ ...base, kind: "bot", name: "/epoch" })).toBe("Telegram /epoch");
  });

  it("measures bars and time ago", () => {
    expect(barWidth(0, 10)).toBe(0);
    expect(barWidth(1, 1000)).toBe(2);
    expect(barWidth(5, 10)).toBe(50);
    const now = Date.parse("2026-10-30T12:00:00Z");
    expect(timeAgo("2026-10-30T11:59:40Z", now)).toBe("just now");
    expect(timeAgo("2026-10-30T11:30:00Z", now)).toBe("30 min ago");
    expect(timeAgo("2026-10-29T12:00:00Z", now)).toBe("1 d ago");
  });
});
