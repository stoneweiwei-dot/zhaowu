import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const registry = await readFile(new URL("../src/lib/life-view-long-form.ts", import.meta.url), "utf8");
const article = await readFile(new URL("../src/lib/life-view-long-form/ten-gods-relationship-friction.ts", import.meta.url), "utf8");
const media = await readFile(new URL("../src/lib/article-media/ten-gods-relationship-comic.ts", import.meta.url), "utf8");

test("Ten Gods relationship article is registered in Guanshilu", () => {
  assert.match(registry, /TEN_GODS_RELATIONSHIP_FRICTION_LONG_FORM/);
  assert.match(article, /id: "ten-gods-relationship-friction"/);
  assert.match(article, /publishedAt: "2026-09-14"/);
  assert.match(article, /十神看你最容易嫌棄誰/);
  assert.match(article, /完整四柱/);
  assert.match(article, /歲運與現實/);
});

test("Guanshilu article carries its comic without blocking text", () => {
  assert.match(article, /TEN_GODS_RELATIONSHIP_COMIC/);
  assert.match(article, /afterParagraph: 2/);
  assert.match(media, /data:image\/avif;base64/);
});
