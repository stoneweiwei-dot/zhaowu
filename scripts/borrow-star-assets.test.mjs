import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";

const manifest = JSON.parse(await readFile(new URL("../public/mythic-atlas/borrow-star/art-manifest.json", import.meta.url), "utf8"));
const source = await readFile(new URL("../src/routes/-mythic-atlas-borrow-star.tsx", import.meta.url), "utf8");

test("Borrow Star displays nine approved permanent raster illustrations with verified SHA-256", async () => {
  assert.equal(manifest.files.length, 9);
  assert.equal(new Set(manifest.files.map((f) => f.id)).size, 9);
  assert.equal(manifest.dimensions.width, 540);
  assert.equal(manifest.dimensions.height, 960);
  for (const { id, file, sha256 } of manifest.files) {
    const path = new URL("../public/mythic-atlas/borrow-star/" + file, import.meta.url);
    const [bytes, info] = await Promise.all([readFile(path), stat(path)]);
    assert.ok(info.size > 20000, file + " must contain actual image content");
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", file);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", file);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), sha256, file);
    assert.ok(source.includes('file: "/mythic-atlas/borrow-star/' + file + '"'), id);
  }
  assert.equal((source.match(/file:\s*"\/mythic-atlas\/borrow-star\/\d\d-[a-z-]+\.webp"/g) || []).length, 9);
  assert.doesNotMatch(source, /file:\s*"\d\d-[a-z-]+\.svg"/);
  assert.doesNotMatch(source, /file:\s*"\/(?:hero-gallery|mythic-atlas\/originals)\//);
  assert.match(source, /src=\{page\.file\}/);
  assert.match(source, /STONE 原創/);
  assert.match(source, /"I · Falling Star"/);
  assert.match(source, /"壹 · 墜星"/);
  assert.match(source, /"壹 · 坠星"/);
});
