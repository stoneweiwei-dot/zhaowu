import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const lib = path.join(root, "src", "lib");
const articleDirs = [/^life-view(?:-.+)?\.ts$/, /^life-view-long-form\/.*\.ts$/];

// These thirteen explicitly scoped legacy SVGs are actual data diagrams or clearly identified text infographics,
// not supposed "original paintings". Every NEW SVG needs explicit review and approval.
const approvedDiagrams = new Set([
  "/articles/bazi-health-five-phases.svg",
  "/articles/bazi-health-body-map.svg",
  "/articles/bazi-health-timing-rings.svg",
  "/articles/bazi-health-balance.svg",
  "/images/articles/23-notes-on-mysticism.svg",
  "/articles/cern-lhc-2026/01.svg",
  "/articles/cern-lhc-2026/02.svg",
  "/articles/cern-lhc-2026/03.svg",
  "/articles/cern-lhc-2026/04.svg",
  "/articles/cern-lhc-2026/05.svg",
  "/articles/cern-lhc-2026/06.svg",
  "/articles/cern-lhc-2026/07.svg",
  "/articles/cern-lhc-2026/08.svg",
]);

function articleFiles(directory, prefix = "") {
  const entries = [];
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const rel = path.posix.join(prefix, item.name);
    const absolute = path.join(directory, item.name);
    if (item.isDirectory()) entries.push(...articleFiles(absolute, rel));
    else if (articleDirs.some(rx => rx.test(rel))) entries.push({ rel, absolute });
  }
  return entries;
}

function validRaster(buffer, ext) {
  if (ext === ".webp") return buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  if (ext === ".png") return buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (ext === ".jpg" || ext === ".jpeg") return buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  return false;
}

test("Every article illustration points to real local art or an explicitly approved diagram", () => {
  const validated = new Set();
  const found = new Set();
  for (const file of articleFiles(lib)) {
    const source = readFileSync(file.absolute, "utf8");
    // Limit to literal image src entries inside article-data modules; other asset systems have separate contracts.
    for (const match of source.matchAll(/(?:["']?src["']?\s*:\s*)["'](\/[^"']+\.(?:svg|webp|png|jpe?g))["']/gi)) {
      const src = match[1];
      found.add(src);
      assert.doesNotMatch(src, /\/\.|\.\.|[?#]/, `Invalid media URL in ${file.rel}`);
      const extension = path.posix.extname(src).toLowerCase();
      const absolute = path.join(root, "public", src.slice(1));
      assert.ok(existsSync(absolute), `Missing asset in ${file.rel}: ${src}`);
      if (extension === ".svg") {
        assert.ok(approvedDiagrams.has(src), `Unapproved code-generated SVG in ${file.rel}: ${src}. Do not substitute text-and-box diagrams for a requested painting.`);
        const svg = readFileSync(absolute, "utf8");
        assert.match(svg, /<svg\b/, `Bad SVG diagram: ${src}`);
      } else {
        assert.ok(validRaster(readFileSync(absolute), extension), `Not a valid raster painting/photo: ${src}`);
      }
      validated.add(src);
    }
  }
  assert.ok(validated.size >= 13, `Expected audited article artwork inventory, got ${validated.size} assets`);
  for (const legacy of [
    "/articles/abhidhamma-31-realms-overview.svg",
    "/articles/abhidhamma-31-realms-desire.svg",
    "/articles/abhidhamma-31-realms-form.svg",
    "/articles/abhidhamma-31-realms-formless.svg",
    "/articles/face-mind-cultivation-2026-09-14.svg",
    "/article-shushu-choice.svg"
  ]) assert.ok(!found.has(legacy), `Code-card artwork still published: ${legacy}`);
});

test("Three-sphere article has four distinct real image sources and keeps doctrine in page text", () => {
  const file = readFileSync(path.join(lib, "life-view-long-form/abhidhamma-thirty-one-planes.ts"), "utf8");
  const illustratedBlock = file.split('"illustrations":')[1] ?? "";
  const refs = [...illustratedBlock.matchAll(/"src":\s*"([^"]+)"/g)].map(m => m[1]);
  assert.equal(refs.length, 4);
  assert.equal(new Set(refs).size, 4);
  for (const src of refs) assert.match(src, /^\/(?:art|hero-gallery|articles)\/[a-z0-9-]+\.(?:webp|png|jpe?g)$/i);
  assert.ok(file.includes("11＋16＋4＝31"));
});
