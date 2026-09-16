import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

function resolveReleaseId() {
  const fromEnvironment = process.env.ZHAOWU_RELEASE_ID || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
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

writeFileSync(
  new URL("../public/sw.js", import.meta.url),
  template.replaceAll("__ZHAOWU_RELEASE__", release),
  "utf8",
);

console.log(`[zhaowu-release] ${release}`);
