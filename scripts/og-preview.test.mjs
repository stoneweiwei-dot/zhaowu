import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { writeOgPreview } from "./write-og-preview.mjs";

await writeOgPreview();

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const og = await readFile(new URL("../public/og.jpg", import.meta.url));

test("link preview card is a committed 1200x630 JPEG", () => {
  assert.equal(og.subarray(0, 2).toString("hex"), "ffd8");
  assert.ok(og.length > 80_000);
  assert.ok(og.length < 800_000);
  assert.equal(og.readUInt16BE(og.length - 2), 0xffd9);
});

test("index.html exposes Open Graph and large-image Twitter cards for og.jpg", () => {
  assert.match(html, /property="og:image" content="https:\/\/stone-zhaowu-official\.vercel\.app\/og\.jpg"/);
  assert.match(html, /property="og:image:width" content="1200"/);
  assert.match(html, /property="og:image:height" content="630"/);
  assert.match(html, /property="og:image:type" content="image\/jpeg"/);
  assert.match(html, /property="og:title" content="昭梧｜昭於未見，梧於有歸"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /name="twitter:image" content="https:\/\/stone-zhaowu-official\.vercel\.app\/og\.jpg"/);
  assert.doesNotMatch(html, /x-banner|twitter-banner|feed-banner/);
});

test("JPEG SOF reports 1200x630", () => {
  let i = 2;
  while (i + 9 < og.length) {
    if (og[i] !== 0xff) break;
    const marker = og[i + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      i += 2;
      continue;
    }
    const size = og.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      const height = og.readUInt16BE(i + 5);
      const width = og.readUInt16BE(i + 7);
      assert.equal(width, 1200);
      assert.equal(height, 630);
      return;
    }
    i += 2 + size;
  }
  assert.fail("JPEG SOF dimensions not found");
});
