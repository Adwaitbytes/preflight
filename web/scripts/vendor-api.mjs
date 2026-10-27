// Copies the preflight Python package and its vendored catalogs into the API function so it
// always runs the engine from this commit. Runs in Vercel's install step. Never edit
// api/_vendor by hand; it is regenerated and git-ignored.
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(web, "..");
const source = join(repo, "src", "preflight");
const target = join(web, "api", "_vendor", "preflight");

if (!existsSync(join(source, "api.py"))) {
  console.error(`vendor-api: ${source} has no api.py; run from the preflight repository`);
  process.exit(1);
}
const skip = (path) => !path.includes("__pycache__") && !path.endsWith(".pyc");
rmSync(join(web, "api", "_vendor"), { recursive: true, force: true });
cpSync(source, target, { recursive: true, filter: skip });
cpSync(join(repo, "catalog"), join(target, "catalog"), { recursive: true, filter: skip });
console.log("vendor-api: copied src/preflight and catalog/ into api/_vendor");
