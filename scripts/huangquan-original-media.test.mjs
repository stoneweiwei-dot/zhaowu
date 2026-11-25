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
test("720p film in repo matches the web derivative; 42 MB original is recorded in the backup manifest", () => {
  const backup = JSON.parse(readFileSync("docs/mythic-atlas/huangquan-original-film-backup.json", "utf8"));
  // Original recovered from Git history, kept out of the repo (Cloudflare Pages
  // 25 MB single-file limit); its hash/size still match the 2026-10-28 manifest.
  assert.equal(backup.original.size, manifest.film.size);
  assert.equal(backup.original.sha256, manifest.film.sha256);
  assert.equal(backup.original.gitBlob, "556fcf120f6e3b45714bdc4a23594041519dcbe4");
  // In-repo file is the 720p derivative, byte-identical to the web copy.
  const path = "public/mythic-atlas/films/" + manifest.film.file;
  const bytes = readFileSync(path);
  assert.equal(statSync(path).size, backup.inRepo.size);
  assert.equal(sha256(bytes), backup.inRepo.sha256);
  assert.equal(sha256(bytes), sha256(readFileSync("public/mythic-atlas/web/films/huangquan-chronicles-720p.mp4")));
  assert.match(main, /<video controls playsInline preload="metadata"/);
  assert.match(main, /<source src="\/mythic-atlas\/films\/huangquan-chronicles\.mp4" type="video\/mp4"/);
  assert.match(main, /id="huangquan-film"/);
});
test("original matching plate images appear in the story and Guaili sections", () => {
  assert.ok(main.includes("([5, 11, 10, 12] as const)[chapterIndex]"));
  assert.ok(main.includes("hq-full-plate"));
  assert.ok(guaili.includes("07-shanhaijing-atlas.png"));
});
