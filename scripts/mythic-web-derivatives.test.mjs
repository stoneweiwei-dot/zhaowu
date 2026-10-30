import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";

// Web derivatives must exist for every original plate, be real WebP/MP4 files,
// stay small enough for mobile, and the originals must remain in place.
const manifest = JSON.parse(readFileSync("docs/mythic-atlas/huangquan-original-media-20261028.json", "utf8"));
const zodiac = [...readFileSync("src/routes/-mythic-atlas-zodiac-essay.ts", "utf8").matchAll(/image:"(\d\d-[a-z-]+\.png)"/g)].map((m) => m[1]);

function assertWebp(path, maxBytes) {
  assert.ok(existsSync(path), "missing " + path);
  const bytes = readFileSync(path);
  assert.equal(bytes.subarray(0, 4).toString("latin1"), "RIFF", path);
  assert.equal(bytes.subarray(8, 12).toString("latin1"), "WEBP", path);
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, "truncated " + path);
  assert.ok(bytes.length <= maxBytes, `${path} is ${bytes.length} bytes`);
}

test("every mythic-atlas original plate has a full WebP and a thumbnail", () => {
  assert.equal(manifest.images.length, 12);
  for (const image of manifest.images) {
    assert.ok(existsSync("public/mythic-atlas/originals/" + image.file), "original kept");
    assertWebp("public/mythic-atlas/web/originals/" + image.file.replace(/\.png$/, ".webp"), 700_000);
    assertWebp("public/mythic-atlas/web/originals/" + image.file.replace(/\.png$/, "-thumb.webp"), 60_000);
  }
});

test("every zodiac plate has a full WebP and a thumbnail", () => {
  assert.equal(zodiac.length, 12);
  for (const file of zodiac) {
    assert.ok(existsSync("public/mythic-atlas/zodiac/" + file), "original kept");
    assertWebp("public/mythic-atlas/web/zodiac/" + file.replace(/\.png$/, ".webp"), 700_000);
    assertWebp("public/mythic-atlas/web/zodiac/" + file.replace(/\.png$/, "-thumb.webp"), 60_000);
  }
});

test("web film is a faststart MP4 well under the original size, with a WebP poster", () => {
  const film = readFileSync("public/mythic-atlas/web/films/huangquan-chronicles-720p.mp4");
  assert.equal(film.subarray(4, 8).toString("latin1"), "ftyp");
  const moov = film.indexOf(Buffer.from("moov"));
  const mdat = film.indexOf(Buffer.from("mdat"));
  assert.ok(moov > 0 && moov < mdat, "moov atom must precede mdat (faststart)");
  assert.ok(film.length < statSync("public/mythic-atlas/films/" + manifest.film.file).size / 4);
  assertWebp("public/mythic-atlas/web/films/huangquan-chronicles-poster.webp", 400_000);
});

test("pages render web derivatives and keep original links", () => {
  const main = readFileSync("src/routes/mythic-atlas.tsx", "utf8");
  assert.match(main, /href=\{`\/mythic-atlas\/originals\/\$\{art\.file\}`\}/);
  assert.match(main, /<img src=\{mythicWebPlate\("originals", art\.file\)\}/);
  assert.match(main, /<img src=\{mythicWebThumb\("originals", art\.file\)\}/);
  assert.match(main, /poster=\{MYTHIC_WEB_FILM_POSTER\}/);
  assert.ok(main.indexOf("src={MYTHIC_WEB_FILM}") < main.indexOf('src="/mythic-atlas/films/huangquan-chronicles.mp4"'));
  const guaili = readFileSync("src/routes/-mythic-atlas-guaili.tsx", "utf8");
  assert.ok(!/<img src="\/mythic-atlas\/originals\/[^"]+\.png"/.test(guaili));
  const index = readFileSync("src/routes/guaili-luanshen.tsx", "utf8");
  assert.match(index, /<img src=\{mythicWebPlate\("zodiac", ZODIAC_PLATES\[i\]\.image\)\}/);
});
