#!/usr/bin/env node
/**
 * Empty-state gate (owner instruction 2026-10-23, wave-2 #14).
 *
 * Rule: a public-facing module must either have something in it or not exist. It may never render
 * a heading over "nothing here yet" (a false ready state). This gate turns that rule into checks
 * that run in `prebuild` (structural, deterministic, no network/git) and, with `--diff`, as a
 * tripwire on newly added lines — the same shape as scripts/public-changelog-gate.mjs.
 *
 *   A. self-gating modules      collection components must carry the EMPTY_STATE_GATE marker, return
 *                               null when empty, and contain no "empty" copy.
 *   B. atlas assets             every public atlas image is a real, non-empty file in public/.
 *   C. sitemap ↔ routes         every sitemap URL has a route file and a static route-meta shell
 *                               (no ghost routes such as the former empty /guide page).
 *   D. diff tripwire (--diff)   newly added empty-state copy in src/ fails unless the line carries
 *                               `empty-state-ok: <reason>`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Collection modules whose emptiness depends on data, and which therefore must hide themselves. */
export const SELF_GATING_MODULES = [
  "src/components/curated-video-shelf.tsx",
  "src/components/auspicious-gallery-section.tsx",
];
export const GATE_MARKER = "EMPTY_STATE_GATE";
export const ALLOW_MARKER = "empty-state-ok:";

/** User-facing "nothing here" copy in zh-Hant / zh-Hans / en. */
export const EMPTY_COPY = new RegExp(
  [
    "暫無", "暂无", "尚無", "尚无", "敬請期待", "敬请期待", "即將推出", "即将推出", "還沒有", "还没有",
    "coming soon",
    "no (?:public |enabled )?(?:images?|films?|videos?|items?|entries|artworks?) (?:are |is )?(?:available|yet)",
    "nothing (?:here|to show) yet",
    "no (?:public )?images are available",
  ].join("|"),
  "i",
);

const read = (root, rel) => readFileSync(join(root, rel), "utf8");

export function checkSelfGatingModules(root = ROOT) {
  const problems = [];
  for (const rel of SELF_GATING_MODULES) {
    if (!existsSync(join(root, rel))) { problems.push(`${rel}: module is registered in the empty-state gate but missing`); continue; }
    const source = read(root, rel);
    if (!source.includes(GATE_MARKER)) problems.push(`${rel}: missing ${GATE_MARKER} marker`);
    if (!/return null;/.test(source)) problems.push(`${rel}: must return null when it has nothing to show`);
    const copy = source.match(EMPTY_COPY);
    if (copy) problems.push(`${rel}: contains empty-state copy "${copy[0]}" — hide the module instead of announcing it is empty`);
  }
  return problems;
}

export function atlasAssetPaths(root = ROOT) {
  const source = read(root, "src/lib/public-atlas.ts");
  const found = [];
  for (const [, id, file] of source.matchAll(/reportVisual\("([^"]+)",\s*"([^"]+)"\)/g)) found.push({ id, path: `public/report-visuals/full/${file}.webp` });
  for (const [, id, file] of source.matchAll(/\bornament\("([^"]+)",\s*"([^"]+)"\)/g)) found.push({ id, path: `public/ornaments/generated/${file}.webp` });
  return found;
}

export function checkAtlasAssets(root = ROOT) {
  const problems = [];
  const assets = atlasAssetPaths(root);
  if (assets.length === 0) problems.push("src/lib/public-atlas.ts: no atlas assets found — the atlas page would be empty");
  const seen = new Set();
  for (const { id, path } of assets) {
    if (seen.has(id)) problems.push(`public-atlas: duplicate asset id ${id}`);
    seen.add(id);
    const abs = join(root, path);
    if (!existsSync(abs) || statSync(abs).size === 0) problems.push(`public-atlas: ${id} -> ${path} is missing or zero bytes`);
  }
  return problems;
}

export function sitemapPaths(root = ROOT) {
  const xml = read(root, "public/sitemap.xml");
  return [...xml.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => (m[1].length > 1 ? m[1].replace(/\/+$/, "") : "/"));
}

export function routeFileFor(path) {
  return path === "/" ? "src/routes/index.tsx" : `src/routes/${path.slice(1).split("/").join(".")}.tsx`;
}

export function checkSitemapRoutes(root = ROOT) {
  const problems = [];
  const meta = JSON.parse(read(root, "src/lib/route-meta.json")).routes ?? {};
  for (const path of sitemapPaths(root)) {
    if (!existsSync(join(root, routeFileFor(path)))) problems.push(`sitemap lists ${path} but ${routeFileFor(path)} does not exist (ghost route)`);
    if (!meta[path]) problems.push(`sitemap lists ${path} but src/lib/route-meta.json has no static shell for it`);
  }
  return problems;
}

/** Added lines in a unified diff (-U0 is enough) that introduce empty-state copy under src/. */
export function findNewEmptyCopy(diffText) {
  const hits = [];
  let file = "";
  for (const line of diffText.split("\n")) {
    if (line.startsWith("+++ ")) { file = line.slice(4).replace(/^b\//, ""); continue; }
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    if (!/^src\/.*\.(tsx|ts)$/.test(file)) continue;
    const text = line.slice(1);
    if (text.includes(ALLOW_MARKER)) continue;
    const match = text.match(EMPTY_COPY);
    if (match) hits.push({ file, copy: match[0], line: text.trim().slice(0, 140) });
  }
  return hits;
}

function diffProblems() {
  let diff = "";
  try {
    diff = execFileSync("git", ["diff", "-U0", "HEAD^", "HEAD", "--", "src"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return []; // shallow/source archives have no HEAD^; the structural checks above still ran
  }
  return findNewEmptyCopy(diff).map((h) => `${h.file}: new empty-state copy "${h.copy}" — ${h.line}\n    (hide the module when empty, or justify with a line comment containing "${ALLOW_MARKER} <reason>")`);
}

export function runGate({ root = ROOT, diff = false } = {}) {
  return [
    ...checkSelfGatingModules(root),
    ...checkAtlasAssets(root),
    ...checkSitemapRoutes(root),
    ...(diff ? diffProblems() : []),
  ];
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  const problems = runGate({ diff: process.argv.includes("--diff") });
  if (problems.length) {
    console.error("[empty-state-gate] FAIL — a public module would show a false ready state:");
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(`[empty-state-gate] PASS — ${SELF_GATING_MODULES.length} self-gating modules, ${atlasAssetPaths().length} atlas assets, ${sitemapPaths().length} sitemap routes${process.argv.includes("--diff") ? ", no new empty-state copy" : ""}.`);
}
