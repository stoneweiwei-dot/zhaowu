import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
const manifest = JSON.parse(readFileSync("docs/mythic-atlas/huangquan-original-media-20261028.json", "utf8"));
const main = readFileSync("src/routes/mythic-atlas.tsx", "utf8");
const data = readFileSync("src/routes/-mythic-atlas-data.ts", "utf8");
const guaili = readFileSync("src/routes/-mythic-atlas-guaili.tsx", "utf8");
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
test("all twelve unmodified 9:16 PNG images match their source hashes and gallery references", () => {
  assert.equal(manifest.images.length, 12);
  for (const [index, image] of manifest.images.entries()) {
    const bytes = readFileSync("public/mythic-atlas/originals/" + image.file);
    assert.deepEqual([...bytes.subarray(0,8)], [137,80,78,71,13,10,26,10]);
    assert.equal(sha256(bytes), image.sha256, image.file);
    assert.ok(data.includes(image.file), "missing gallery ref " + image.file);
  }
});
test("original MP4 exists and is referenced in the relevant chronicle section", () => {
  const path = "public/mythic-atlas/films/" + manifest.film.file;
  assert.equal(statSync(path).size, manifest.film.size);
  assert.equal(sha256(readFileSync(path)), manifest.film.sha256);
  assert.match(main, /<video controls playsInline preload="metadata"/);
  assert.match(main, /<source src="\/mythic-atlas\/films\/huangquan-chronicles\.mp4" type="video\/mp4"/);
  assert.match(main, /id="huangquan-film"/);
});
test("original matching plate images appear in the story and Guaili sections", () => {
  assert.ok(main.includes("([5, 11, 10, 12] as const)[chapterIndex]"));
  assert.ok(main.includes("hq-full-plate"));
  assert.ok(guaili.includes("07-shanhaijing-atlas.png"));
});
