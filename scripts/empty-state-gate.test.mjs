import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  ALLOW_MARKER, EMPTY_COPY, GATE_MARKER, atlasAssetPaths, checkAtlasAssets, checkSelfGatingModules,
  checkSitemapRoutes, findNewEmptyCopy, routeFileFor, runGate, sitemapPaths,
} from "./empty-state-gate.mjs";

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "zw-empty-gate-"));
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(join(abs, ".."), { recursive: true });
    writeFileSync(abs, content);
  }
  return root;
}

test("the live repository passes every structural empty-state check", () => {
  assert.deepEqual(runGate(), []);
  assert.ok(atlasAssetPaths().length >= 26, "atlas keeps its 22 report artworks + 4 ornaments");
  assert.ok(sitemapPaths().includes("/auspicious-atlas"));
});

test("a /guide-style ghost route cannot enter the sitemap", () => {
  assert.ok(!sitemapPaths().includes("/guide"));
  const root = fixture({
    "public/sitemap.xml": "<urlset><url><loc>https://zhao-wu.com/guide</loc></url></urlset>",
    "src/lib/route-meta.json": JSON.stringify({ routes: {} }),
  });
  const problems = checkSitemapRoutes(root);
  assert.equal(problems.length, 2);
  assert.match(problems[0], /ghost route/);
  assert.equal(routeFileFor("/knowledge/system-map"), "src/routes/knowledge.system-map.tsx");
  assert.equal(routeFileFor("/"), "src/routes/index.tsx");
});

test("a collection module without the gate, a null return, or with empty copy is rejected", () => {
  const good = `// ${GATE_MARKER}\nexport function X(){ if (!x) return null; return null; }`;
  const bad = `export function X(){ return <p>此分類暫無已啟用的影片。</p>; }`;
  const goodRoot = fixture({
    "src/components/curated-video-shelf.tsx": good,
    "src/components/auspicious-gallery-section.tsx": good,
  });
  assert.deepEqual(checkSelfGatingModules(goodRoot), []);
  const badRoot = fixture({
    "src/components/curated-video-shelf.tsx": bad,
    "src/components/auspicious-gallery-section.tsx": good,
  });
  const problems = checkSelfGatingModules(badRoot);
  assert.ok(problems.some((p) => p.includes("missing EMPTY_STATE_GATE")));
  assert.ok(problems.some((p) => p.includes("return null")));
  assert.ok(problems.some((p) => p.includes("暫無")));
});

test("an atlas asset that is missing or zero bytes fails the build", () => {
  const atlas = 'reportVisual("a", "one"); ornament("b", "two");';
  const root = fixture({
    "src/lib/public-atlas.ts": atlas,
    "public/report-visuals/full/one.webp": "x",
    "public/ornaments/generated/two.webp": "",
  });
  const problems = checkAtlasAssets(root);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /two\.webp is missing or zero bytes/);
});

test("new empty-state copy in a diff is flagged unless explicitly justified", () => {
  const diff = [
    "+++ b/src/routes/example.tsx",
    '+  <p>目前暫無內容</p>',
    '+  <p>Coming soon</p>',
    '+  <p>尚無資料</p> {/* empty-state-ok: private owner page, never linked publicly */}',
    "+++ b/docs/readme.md",
    "+Coming soon in docs is not product copy",
  ].join("\n");
  const hits = findNewEmptyCopy(diff);
  assert.equal(hits.length, 2);
  assert.deepEqual(hits.map((h) => h.file), ["src/routes/example.tsx", "src/routes/example.tsx"]);
  assert.ok(EMPTY_COPY.test("No enabled films yet"));
  assert.ok(!EMPTY_COPY.test("Browse the full film gallery"));
  assert.ok(ALLOW_MARKER.endsWith(":"));
});

test("the gate is wired into prebuild and the shelf/gallery components carry the marker", async () => {
  const { readFile } = await import("node:fs/promises");
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.match(pkg.scripts.prebuild, /node scripts\/empty-state-gate\.mjs/);
  assert.equal(pkg.scripts["check:empty-state:diff"], "node scripts/empty-state-gate.mjs --diff");
  for (const name of ["curated-video-shelf", "auspicious-gallery-section"]) {
    const source = await readFile(new URL(`../src/components/${name}.tsx`, import.meta.url), "utf8");
    assert.ok(source.includes(GATE_MARKER), `${name} must carry ${GATE_MARKER}`);
  }
});
