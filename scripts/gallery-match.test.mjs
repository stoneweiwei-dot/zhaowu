import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("customer Gallery matching reads approved client-eligible knowledge only", async () => {
  const source = await read("src/lib/gallery-match.ts");
  assert.match(source, /analysis_status=eq\.approved/);
  assert.match(source, /client_eligible=eq\.true/);
  assert.match(source, /chart\.useful/);
  assert.match(source, /chart\.drain/);
  assert.match(source, /rankCustomerGalleryArt/);
  assert.match(source, /a\.asset\.id\.localeCompare\(b\.asset\.id\)/);
});

test("approved Gallery match is visible at the decree action instead of appearing only after the full report", async () => {
  const [resultView, preview] = await Promise.all([
    read("src/components/result-view.tsx"),
    read("src/components/decree-gallery-preview.tsx"),
  ]);
  assert.match(resultView, /<DecreeGalleryPreview/);
  assert.match(resultView, /generatedImageUrl=\{imageUrl\}/);
  assert.doesNotMatch(resultView, /<CustomerStandardArt/);
  assert.match(resultView, /reportSections \? <FocusedReportSections/);
  assert.match(preview, /loadCustomerGalleryCandidates/);
  assert.match(preview, /rankCustomerGalleryArt/);
  assert.match(preview, /站主核准的個人命誥圖庫匹配母圖/);
  assert.match(preview, /The image never changes the reading itself/);
  assert.match(preview, /\.catch\(\(\) =>/);
});
