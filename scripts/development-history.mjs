import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// A verified, explicitly dated fallback remains accurate if history or GitHub is unavailable.
export const FALLBACK = { count: 2258, sha: "32b5046ed0639999ebd3dfb305250e7ce129907e", measuredAt: "2026-11-03T00:21:41.000Z" };
const shaPattern = /^[0-9a-f]{40}$/;
function git(...args) { return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 3000 }).trim(); }

export function countFromLink(link) {
  if (!link) return null; // Without a last-page link, one page is ambiguous; fail closed.
  const last = link.split(",").find((part) => /rel="last"/.test(part));
  const match = last?.match(/[?&]page=(\d+)/);
  const count = Number(match?.[1]);
  return Number.isSafeInteger(count) && count > 0 ? count : null;
}

export async function measureHistory(targetSha, fetchImpl = fetch) {
  if (!shaPattern.test(targetSha)) return FALLBACK;
  try {
    if (git("rev-parse", "HEAD") === targetSha && git("rev-parse", "--is-shallow-repository") === "false") {
      const count = Number(git("rev-list", "--count", targetSha));
      if (Number.isSafeInteger(count) && count > 0) return { count, sha: targetSha, measuredAt: new Date().toISOString() };
    }
  } catch { /* Deployment builds may not include Git history. */ }
  try {
    const url = `https://api.github.com/repos/stoneweiwei-dot/zhaowu/commits?sha=${targetSha}&per_page=1`;
    const response = await fetchImpl(url, { headers: { "User-Agent": "zhaowu-release-build", Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(6000) });
    if (!response.ok) return FALLBACK;
    const commits = await response.json();
    if (!Array.isArray(commits) || commits[0]?.sha !== targetSha) return FALLBACK;
    const count = countFromLink(response.headers.get("link"));
    return count ? { count, sha: targetSha, measuredAt: new Date().toISOString() } : FALLBACK;
  } catch { return FALLBACK; }
}

export async function writeHistory(targetSha) {
  const history = await measureHistory(targetSha);
  writeFileSync(new URL("../public/development-history.json", import.meta.url), `${JSON.stringify(history, null, 2)}\n`);
  console.log(`[development-history] ${history.count} @ ${history.sha.slice(0, 12)}${history.sha === targetSha ? "" : " (dated fallback)"}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const target = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || (() => { try { return git("rev-parse", "HEAD"); } catch { return ""; } })();
  await writeHistory(target);
}
