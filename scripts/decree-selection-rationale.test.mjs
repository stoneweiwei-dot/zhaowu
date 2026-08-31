import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");
const preview = readFileSync(new URL("../src/components/decree-gallery-preview.tsx", import.meta.url), "utf8");
const reasonComponent = readFileSync(new URL("../src/components/decree-image-reason.tsx", import.meta.url), "utf8");
const resultView = readFileSync(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
const account = readFileSync(new URL("../src/routes/account.tsx", import.meta.url), "utf8");
const customerReason = readFileSync(new URL("../src/lib/report/decree-selection-copy.ts", import.meta.url), "utf8");

const OLD_INTERNAL_COPY = /這不是隨機抽圖|这不是随机抽图|It was not picked at random|視覺匹配的五行|视觉匹配的五行|Five-Element visual direction|不會反過來改動命理判斷|不会反过来改动命理判断|does not change the reading itself/i;

test("the obsolete static selection-mechanism fallback stays removed", () => {
  assert.doesNotMatch(main, /decree-selection-rationale\.css/);
  assert.doesNotMatch(resultView, /zhaowu-generated-decree/);
  assert.match(preview, /DecreeImageReason/);
  assert.match(reasonComponent, /explainCustomerDecreeImageChoice/);
  assert.match(reasonComponent, /data-testid="decree-image-reason"/);
});

test("every delivered decree image gets a React reason even when Gallery metadata or legacy chart metadata is unavailable", () => {
  assert.match(preview, /generatedImageUrl \? \(/);
  assert.match(preview, /<DecreeImageReason chart=\{chart\} question=\{question\} selectedAssetId=\{selectedAssetId\}/);
  assert.match(reasonComponent, /selectedCandidate\s*\?\s*explainCustomerDecreeImageChoice/);
  assert.match(reasonComponent, /chartForReason:\s*ReasonChart\s*=\s*chart\s*\?\?/);
  assert.match(reasonComponent, /:\s*fallbackReason\(chartForReason, question, locale\)/);
  assert.match(account, /<DecreeImageReason/);
  assert.match(account, /chart=\{snapshot\?\.chart \?\? null\}/);
  assert.match(account, /reportGalleryReferenceAssetId\(detail\)/);
});

test("customer reason stays symbolic and does not expose selection internals", () => {
  assert.match(customerReason, /所以選這張，是因為它把你現在最需要的狀態畫了出來/);
  assert.match(customerReason, /所以选这张，是因为它把你现在最需要的状态画了出来/);
  assert.match(customerReason, /why this image belongs with this reading/i);
  assert.doesNotMatch(preview, OLD_INTERNAL_COPY);
  assert.doesNotMatch(resultView, OLD_INTERNAL_COPY);
  assert.doesNotMatch(reasonComponent, OLD_INTERNAL_COPY);
  assert.doesNotMatch(customerReason, OLD_INTERNAL_COPY);
});
