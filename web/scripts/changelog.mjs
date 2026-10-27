// Writes src/data/changelog.json from git log: newest first, merge commits skipped.
// Runs before every build. When git or the history is unavailable (for example a shallow
// deploy checkout without .git) it keeps the committed file and exits 0.

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, "..", "src", "data", "changelog.json");
const SEP = "\u001f";

function readLog() {
  const out = execFileSync("git", ["log", "--no-merges", `--pretty=format:%aI${SEP}%h${SEP}%s`], {
    cwd: here,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 16 * 1024 * 1024,
  });
  return out
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [date, sha, ...subject] = line.split(SEP);
      return { date, sha, subject: subject.join(SEP).trim() };
    })
    .filter((entry) => entry.date && entry.sha && entry.subject);
}

try {
  const entries = readLog();
  if (entries.length === 0) {
    console.warn("changelog: git log returned nothing, keeping the existing file");
  } else {
    writeFileSync(target, `${JSON.stringify(entries, null, 2)}\n`);
    console.log(`changelog: wrote ${entries.length} commits`);
  }
} catch (error) {
  console.warn(`changelog: git unavailable (${error instanceof Error ? error.message.split("\n")[0] : "unknown"}), keeping the existing file`);
}
