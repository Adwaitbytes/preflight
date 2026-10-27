import "server-only";

import raw from "@/data/changelog.json";
import { changelogSchema, type ChangelogEntry } from "./schemas";

/** The lead fills changelog.json from git log. A malformed file renders as empty, never as a crash */
export function loadChangelog(): ChangelogEntry[] {
  const parsed = changelogSchema.safeParse(raw);
  if (!parsed.success) return [];
  return [...parsed.data].sort((a, b) => b.date.localeCompare(a.date));
}
