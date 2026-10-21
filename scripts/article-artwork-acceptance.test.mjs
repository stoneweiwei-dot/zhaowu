import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const articlePath = path.join(root, "src/lib/life-view-long-form/abhidhamma-thirty-one-planes.ts");
const source = readFileSync(articlePath, "utf8");
const illustratedBlock = source.split('"illustrations":')[1];
const imageSources = illustratedBlock ? [...illustratedBlock.matchAll(/"src":\s*"([^"]+)"/g)].map((match) => match[1]) : [];

function fileIsRealRaster(data, ext) {
  if (ext === ".webp") return data.length > 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP";
  if (ext === ".png") return data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (ext === ".jpg" || ext === ".jpeg") return data[0] === 255 && data[1] === 216 && data[2] === 255;
  return false;
}

test("Abhidhamma article uses four local, distinct raster paintings rather than geometric SVG cards", () => {
  assert.equal(imageSources.length, 4, "Expected four illustrations");
  assert.equal(new Set(imageSources).size, 4, "Do not repeat one painting in several slots");
  for (const src of imageSources) {
    assert.match(src, /^\/(?:art|hero-gallery|articles)\/[a-z0-9-]+\.(?:webp|png|jpe?g)$/i, "A published painting must be an approved local image asset, not a temporary external URL, JS or flat SVG mockup");
    const file = path.join(root, "public", src.substring(1));
    assert.ok(existsSync(file), `Missing published artwork: ${src}`);
    assert.ok(fileIsRealRaster(readFileSync(file), path.extname(src).toLowerCase()), `Invalid raster image: ${src}`);
  }
});
