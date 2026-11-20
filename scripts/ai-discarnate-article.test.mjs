import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { AI_DISCARNATE_INTELLIGENCE_ARTICLE as article } from "../src/lib/life-view-long-form/ai-discarnate-intelligence.ts";

const assetBase = "/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022";
const originalSha256 = [
  "6198d40a62e8cf2a0b425e0c65d97c881e7e74bb22db56d65add7886f9d68f1d",
  "9c065d4625f2df44e7a020e18f8b54a3e59046fb8e5f97f578d83d9629cd785e",
  "d1fa06c09392b77797826491b06c5a912fae3038ebfeccbbef714e40160c77a8",
  "cb087c5ce0bd2ed820fcde0130030262422c52a094766cdd11fa0ee3209a23d9",
  "ee6cd4104555e7367112fa08ceee7eafafafb8a56e86797192f9da93919695a3",
  "89d2b79e98e842b8d2ca196fcc8dc189d903856f3b51332f4b431418fc8794ee",
  "e1e1f0077e00ca808f1ee2a0157afe56dc344337b13034be180ebcdc56cb5107",
  "e12fefb9da4b84b8dfe9ffae79d37ddc2fa94dc5c367d1891cb449c8663572f6",
  "33958f6029045c67d344aa0590b44a93ddc4fd0fbc318ea7ae0364152dc2b8e3"
];
const originalSizes = [2840157,2813357,2947511,2977625,2930217,2891230,2817525,3116963,3031537];

test("AI essay has a real image for each of nine bilingual sections, without drawing replacements", () => {
  assert.equal(article.illustrations?.length, 9);
  assert.equal(new Set(article.illustrations?.map(x => x.src)).size, 9);
  for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
    assert.equal(article.body[locale].split(/\n\n+/).length, 9);
  }
  for (const [i, item] of article.illustrations.entries()) {
    const index = String(i + 1).padStart(2, "0");
    assert.equal(item.src, `${assetBase}/${index}.png`);
    assert.equal(item.afterParagraph, i + 1);
    assert.equal(item.display, "wide");
    for (const locale of ["zh-Hant", "zh-Hans", "en"]) assert.ok(item.alt[locale]);
  }
  assert.ok(readFileSync("src/lib/life-view-long-form.ts","utf8").includes("AI_DISCARNATE_INTELLIGENCE_ARTICLE"));
});

test("Optional byte-for-byte live media verification, only when specifically requested", async (t) => {
  if (process.env.VERIFY_ARTICLE_MEDIA_NETWORK !== "1") return t.skip("Network media QA is opt-in; don't use public network in routine build.");
  for (let i=0;i<9;i++) {
    const res = await fetch("https://zhao-wu.com" + article.illustrations[i].src);
    assert.equal(res.status, 200, `Slide ${i+1} HTTP`);
    assert.match(res.headers.get("content-type")||"", /image\/png/);
    const bytes = Buffer.from(await res.arrayBuffer());
    assert.equal(bytes.length, originalSizes[i], `Slide ${i+1} size`);
    assert.equal(bytes.subarray(0,8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), originalSha256[i], `Slide ${i+1} differs from original generated image`);
  }
});
