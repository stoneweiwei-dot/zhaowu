import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

function resolveReleaseId() {
  const fromEnvironment =
    process.env.ZHAOWU_RELEASE_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA;
  if (fromEnvironment?.trim()) return fromEnvironment.trim();

  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

const release = resolveReleaseId();
const builtAt = new Date().toISOString();
const template = readFileSync(new URL("./sw-template.js.txt", import.meta.url), "utf8");

writeFileSync(
  new URL("../public/release.json", import.meta.url),
  `${JSON.stringify({ release, builtAt }, null, 2)}\n`,
  "utf8",
);

// Runtime handlers (api/, functions/, netlify/) cannot read public/release.json, so the same
// release value is also baked into a tiny module that they import.
writeFileSync(
  new URL("../lib/release-id.js", import.meta.url),
  `// Written by scripts/write-release-assets.mjs at build time; same value as public/release.json.\nexport const ZHAOWU_BUILD_RELEASE = ${JSON.stringify(release)};\n`,
  "utf8",
);

writeFileSync(
  new URL("../public/sw.js", import.meta.url),
  template.replaceAll("__ZHAOWU_RELEASE__", release),
  "utf8",
);

console.log(`[zhaowu-release] ${release}`);
