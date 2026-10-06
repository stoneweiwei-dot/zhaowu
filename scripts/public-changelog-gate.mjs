import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const CHANGELOG = "src/lib/public-changelog.ts";

if (!existsSync(".git")) process.exit(0);

let changed = [];
try {
  changed = execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
} catch {
  // CI checks out two commits. Local shallow/source archives may not.
  process.exit(0);
}

const productPrefixes = [
  "src/",
  "public/",
  "api/",
  "lib/",
  "supabase/functions/",
  "supabase/migrations/",
];
const productFiles = new Set(["package.json", "vite.config.ts", "vercel.json"]);

const productionImpact = changed.some((path) =>
  path !== CHANGELOG &&
  (productPrefixes.some((prefix) => path.startsWith(prefix)) || productFiles.has(path))
);

if (productionImpact && !changed.includes(CHANGELOG)) {
  console.error("[public-changelog] Product/runtime files changed without a public update note.");
  console.error("[public-changelog] Add a concise entry to " + CHANGELOG + " in the same change.");
  console.error(changed.join("\n"));
  process.exit(1);
}

console.log(productionImpact
  ? "[public-changelog] PASS — public change note present."
  : "[public-changelog] PASS — no public product/runtime change detected.");
