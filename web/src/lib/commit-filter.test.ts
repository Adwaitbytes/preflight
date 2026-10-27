import { describe, expect, it } from "vitest";
import { isChoreCommit } from "./commit-filter.mjs";

describe("isChoreCommit", () => {
  it("drops housekeeping subjects", () => {
    for (const subject of [
      "Ignore Playwright MCP scratch",
      "Drop unneeded noqa in the Vercel function",
      "Lint fixes",
      "Run the formatter, format web",
      "Fix typo in README",
      "Bump next to 16.4.2",
      "Merge branch 'main' into feature",
    ]) {
      expect(isChoreCommit(subject), subject).toBe(true);
    }
  });

  it("keeps product changes", () => {
    for (const subject of [
      "Health for all 128 subnets from one bulk read, scores endpoint",
      "Action: start-localnet input so a second gate step diagnoses the same chain",
      "Show the information panel on the doctor page",
      "Readable API responses in Try it",
    ]) {
      expect(isChoreCommit(subject), subject).toBe(false);
    }
  });
});
