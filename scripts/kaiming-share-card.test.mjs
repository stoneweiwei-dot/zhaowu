import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderKaimingStatic } from "./build-route-html.mjs";
import { renderLandscapeShareCardPng } from "../src/lib/report/share-card.ts";

// 驗證靜態正文與結構化資料使用同一份三語內容。
test("開明獸靜態正文及 Article 資料一致", () => {
  const content = JSON.parse(readFileSync("src/lib/kaiming-content.json", "utf8"));
  const page = renderKaimingStatic("https://zhao-wu.com");
  assert.match(page.main, /開明獸/);
  assert.match(page.main, /山海經/);
  assert.equal(page.jsonLd["@type"], "Article");
  assert.equal(page.jsonLd.mainEntityOfPage, `https://zhao-wu.com${content.path}`);
  for (const locale of ["zh-Hant", "zh-Hans", "en"]) assert.equal(content.locales[locale].sections.length, 5);
});

// 模擬 Canvas 核對輸出尺寸與輸出文字，不讀取或上傳生辰資料。
test("橫版卡片以 1200 × 630 輸出並放入日柱", async () => {
  const lines = [];
  const ctx = { fillRect() {}, strokeRect() {}, fillText(t) { lines.push(t); }, measureText(t) { return { width: t.length * 18 }; } };
  const canvas = { getContext: () => ctx, toBlob: (done) => done(new Blob(["test"], { type: "image/png" })) };
  const oldDocument = globalThis.document;
  globalThis.document = { createElement: () => canvas };
  try {
    const blob = await renderLandscapeShareCardPng({brand:"昭梧",title:"水",keywords:["流動"],watermark:"STONE 原創"}, "壬辰", "zh-Hant");
    assert.equal(canvas.width, 1200);
    assert.equal(canvas.height, 630);
    assert.equal(blob.type, "image/png");
    assert.ok(lines.includes("日柱 · 壬辰"));
  } finally { globalThis.document = oldDocument; }
});
