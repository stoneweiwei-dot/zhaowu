import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

// Article image provenance gate. article-artwork-acceptance.test.mjs proves a referenced file exists and is a real
// raster/approved diagram; it cannot say WHERE an image came from. This manifest records that, and fails the build
// for anything declared a placeholder or an undersized "painting".
const root = process.cwd();
const lib = path.join(root, "src", "lib");
const manifest = JSON.parse(readFileSync(path.join(root, "docs", "article-image-manifest.json"), "utf8"));
const KINDS = new Set(["painting", "infographic", "diagram"]);
const SOURCES = new Set(["stone-original", "existing-reused", "coded-diagram", "unverified"]);
const STATUSES = new Set(["approved", "interim", "needs-review"]);
const MIN_PAINTING_WIDTH = 800;

function articleRefs() {
  const refs = new Map();
  const walk = (dir, prefix = "") => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const rel = path.posix.join(prefix, item.name);
      if (item.isDirectory()) { walk(path.join(dir, item.name), rel); continue; }
      if (!/^life-view(?:-.+)?\.ts$/.test(rel) && !/^life-view-long-form\/.*\.ts$/.test(rel)) continue;
      const source = readFileSync(path.join(dir, item.name), "utf8");
      for (const m of source.matchAll(/(?:["']?src["']?\s*:\s*)["'](\/[^"']+\.(?:svg|webp|png|jpe?g))["']/gi)) refs.set(m[1], rel);
    }
  };
  walk(lib);
  return refs;
}

/** Pixel width of a PNG or WebP, read from the file header. Returns 0 when it cannot be parsed. */
function rasterWidth(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return buffer.readUInt32BE(16);
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return 0;
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X") return 1 + buffer.readUIntLE(24, 3);
  if (chunk === "VP8 ") return buffer.readUInt16LE(26) & 0x3fff;
  if (chunk === "VP8L") return 1 + (buffer.readUInt32LE(21) & 0x3fff);
  return 0;
}

test("manifest entries use only known kinds, sources and statuses — placeholders can never ship", () => {
  assert.ok(manifest.entries.length >= 24, "manifest looks truncated");
  for (const e of manifest.entries) {
    assert.ok(KINDS.has(e.kind), `${e.src}: unknown kind "${e.kind}"`);
    assert.ok(SOURCES.has(e.source), `${e.src}: unknown source "${e.source}" (placeholder / generated art is not an allowed source)`);
    assert.ok(STATUSES.has(e.status), `${e.src}: unknown status "${e.status}"`);
    assert.ok(e.article && e.note, `${e.src}: article and note are required`);
  }
  assert.equal(new Set(manifest.entries.map((e) => e.src)).size, manifest.entries.length, "duplicate manifest src");
});

test("every article image is registered, and every registered image is still used", () => {
  const refs = articleRefs();
  const registered = new Set(manifest.entries.map((e) => e.src));
  for (const [src, file] of refs) assert.ok(registered.has(src), `Unregistered article image ${src} (used in ${file}). Add it to docs/article-image-manifest.json with its real source.`);
  for (const src of registered) assert.ok(refs.has(src), `Manifest lists ${src} but no article references it. Remove stale entries.`);
  for (const e of manifest.entries) assert.match(refs.get(e.src) ?? "", new RegExp(e.article.replace(/[-/]/g, "[-/]")), `${e.src}: article "${e.article}" does not match ${refs.get(e.src)}`);
});

test("kind matches the file: diagrams are coded SVG, paintings are real raster of painting size", () => {
  for (const e of manifest.entries) {
    const isSvg = e.src.toLowerCase().endsWith(".svg");
    if (e.kind === "diagram") {
      assert.ok(isSvg && e.source === "coded-diagram", `${e.src}: a diagram must be a coded SVG`);
      continue;
    }
    assert.ok(!isSvg, `${e.src}: a coded SVG may only be registered as a diagram, never as a ${e.kind}`);
    assert.notEqual(e.source, "coded-diagram", `${e.src}: raster art cannot claim coded-diagram`);
    if (e.kind === "painting") {
      const width = rasterWidth(readFileSync(path.join(root, "public", e.src.slice(1))));
      assert.ok(width >= MIN_PAINTING_WIDTH, `${e.src}: registered as a painting but only ${width}px wide (min ${MIN_PAINTING_WIDTH}). Register it as an infographic or replace it.`);
    }
  }
});

test("a painting's source is never 'unverified'; unresolved items stay visible as needs-review", () => {
  for (const e of manifest.entries) {
    if (e.kind === "painting") assert.notEqual(e.source, "unverified", `${e.src}: a painting needs a known source`);
    if (e.source === "unverified") assert.equal(e.status, "needs-review", `${e.src}: unverified art must be flagged needs-review`);
    if (e.status === "interim") assert.equal(e.source, "existing-reused", `${e.src}: only reused existing art may be interim`);
  }
  const open = manifest.entries.filter((e) => e.status !== "approved");
  console.log(`article images awaiting owner decision: ${open.length}/${manifest.entries.length}`);
  for (const e of open) console.log(`  [${e.status}] ${e.src} (${e.article})`);
});
