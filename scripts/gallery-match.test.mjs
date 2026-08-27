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

test("owner Gallery category list contains only application roles", async () => {
  const manager = await read("src/components/owner-gallery-manager.tsx");
  const categoryLine = manager.match(/const CATEGORIES = \[[^\n]+\] as const;/)?.[0] ?? "";
  assert.equal(categoryLine, 'const CATEGORIES = ["visual-library", "tea-guardian", "background", "dragon-sticker"] as const;');
  assert.doesNotMatch(categoryLine, /buddhist|daoist|guardian-beast|auspicious-motif|report-art|reference-style/);
  assert.match(manager, /Semantic interpretation belongs to per-image knowledge metadata/);
});