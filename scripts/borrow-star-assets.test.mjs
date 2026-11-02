import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const names = [
  "/hero-gallery/karst-mist-lake.webp",
  "/hero-gallery/dragon-scholar.webp",
  "/hero-gallery/misty-mountains-lake.webp",
  "/hero-gallery/cloud-dragon.webp",
  "/hero-gallery/river-rain-boat.webp",
  "/hero-gallery/temple-bamboo-rain.webp",
  "/mythic-atlas/originals/03-celestial-procession.webp",
  "/hero-gallery/koi-dragon-rider.webp",
  "/mythic-atlas/originals/12-stars-and-constellations.webp",
];
const source = await readFile(new URL("../src/routes/-mythic-atlas-borrow-star.tsx", import.meta.url), "utf8");

test("Borrowed Star uses nine distinct real raster paintings instead of geometric SVG placeholders", async () => {
  assert.equal(names.length, 9);
  assert.equal(new Set(names).size, 9);
  for (const name of names) {
    const path = new URL("../public" + name, import.meta.url);
    const [bytes, info] = await Promise.all([readFile(path), stat(path)]);
    assert.ok(info.size > 50000, name + " must contain substantial artwork");
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", name + " must be RIFF WebP");
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", name + " must be a WebP image");
    assert.ok(source.includes('file: "' + name + '"'), name + " is not linked from the route");
  }
  assert.equal((source.match(/file:\s*"\/(?:hero-gallery|mythic-atlas\/originals)\/[^"]+\.webp"/g) || []).length, 9);
  assert.doesNotMatch(source, /file:\s*"\d\d-[a-z-]+\.svg"/);
  assert.match(source, /src=\{page\.file\}/);
  assert.match(source, /STONE 原創/);
  assert.match(source, /"I · Falling Star"/);
  assert.match(source, /"壹 · 墜星"/);
  assert.match(source, /"壹 · 坠星"/);
});
