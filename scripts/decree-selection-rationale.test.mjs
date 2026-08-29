import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");
const preview = readFileSync(new URL("../src/components/decree-gallery-preview.tsx", import.meta.url), "utf8");
const resultView = readFileSync(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
const customerReason = readFileSync(new URL("../src/lib/report/decree-selection-copy.ts", import.meta.url), "utf8");

const OLD_INTERNAL_COPY = /這不是隨機抽圖|这不是随机抽图|It was not picked at random|視覺匹配的五行|视觉匹配的五行|Five-Element visual direction|不會反過來改動命理判斷|不会反过来改动命理判断|does not change the reading itself/i;

test("the obsolete static selection-mechanism fallback is removed from the customer surface", () => {
  assert.doesNotMatch(main, /decree-selection-rationale\.css/);
  assert.doesNotMatch(resultView, /zhaowu-generated-decree/);
  assert.match(preview, /explainCustomerDecreeImageChoice/);
  assert.match(preview, /onGeneratedImageError/);
});

test("generated decree image is shown once and followed by its image-specific reason", () => {
  assert.match(preview, /generatedImageUrl \? \[\] : matches\.slice\(1, 3\)/);
  assert.match(preview, /reasonTitle/);
  assert.match(preview, /selectionReason/);
  assert.match(customerReason, /所以選這張，是因為它把你現在最需要的狀態畫了出來/);
  assert.match(customerReason, /所以选这张，是因为它把你现在最需要的状态画了出来/);
  assert.match(customerReason, /why this image belongs with this reading/i);
});

test("active decree-image customer copy does not expose the old selection mechanism", () => {
  assert.doesNotMatch(preview, OLD_INTERNAL_COPY);
  assert.doesNotMatch(resultView, OLD_INTERNAL_COPY);
  assert.doesNotMatch(customerReason, OLD_INTERNAL_COPY);
});
