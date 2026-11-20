import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const reason = await readFile(new URL("../src/components/decree-image-reason.tsx", import.meta.url), "utf8");
const account = await readFile(new URL("../src/routes/account.tsx", import.meta.url), "utf8");
const preview = await readFile(new URL("../src/components/decree-gallery-preview.tsx", import.meta.url), "utf8");

test("decree reason survives missing legacy chart metadata", () => {
  assert.match(reason, /chart\?:\s*ReasonChart\s*\|\s*null/);
  assert.match(reason, /chartForReason:\s*ReasonChart\s*=\s*chart\s*\?\?\s*\{\s*useful:\s*\[\],\s*drain:\s*\[\]\s*\}/);
  assert.match(reason, /data-testid="decree-image-reason"/);
  assert.match(reason, /fallbackReason\(chartForReason, question, locale\)/);
});

test("saved report mounts the reason whenever its image is shown", () => {
  const imageBlock = account.slice(account.indexOf("{imageUrls[row.id] ? ("));
  assert.ok(imageBlock.length > 0, "saved report image block must exist");
  assert.match(imageBlock, /<DecreeImageReason/);
  assert.match(imageBlock, /chart=\{snapshot\?\.chart \?\? null\}/);
  assert.doesNotMatch(imageBlock.slice(0, imageBlock.indexOf("{sections.length ? (")), /\{snapshot\?\.chart \? \(/);
});

test("fresh result keeps the reason tied to a delivered generated image", () => {
  assert.match(preview, /\{generatedImageUrl \? \(/);
  assert.match(preview, /<DecreeImageReason/);
  assert.match(preview, /selectedAssetId=\{selectedAssetId\}/);
});
