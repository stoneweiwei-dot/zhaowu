import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("customer Gallery matching reads approved client-eligible knowledge from one visual library", async () => {
  const source = await read("src/lib/gallery-match.ts");
  assert.match(source, /analysis_status=eq\.approved/);
  assert.match(source, /client_eligible=eq\.true/);
  assert.match(source, /category=eq\.visual-library/);
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
  assert.match(preview, /站主核准作品庫中自行匹配合適母圖/);
  assert.match(preview, /Religious category guesses do not control the match/);
  assert.match(preview, /\.catch\(\(\) =>/);
});

test("owner Gallery is one upload surface with no manual religious taxonomy", async () => {
  const manager = await read("src/components/owner-gallery-manager.tsx");
  assert.match(manager, /category:\s*"visual-library"/);
  assert.match(manager, /tags:\s*\["owner-upload", "auto-classify"\]/);
  assert.match(manager, /分類、五行、用途、客戶匹配與背景調用都由系統在後台處理/);
  assert.doesNotMatch(manager, /const CATEGORIES/);
  assert.doesNotMatch(manager, /<select[^>]*>[^]*buddhist|<select[^>]*>[^]*daoist/);
});
