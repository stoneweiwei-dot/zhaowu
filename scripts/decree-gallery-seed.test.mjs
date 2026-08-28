import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("decree image backend ranks the whole enabled visual library and keeps approval as a signal, not a gate", async () => {
  const source = await read("supabase/functions/generate-decree-image/index.ts");
  assert.match(source, /from\("gallery_asset_knowledge"\)/);
  assert.match(source, /knowledge\?\.analysis_status === "approved"/);
  assert.match(source, /knowledge\?\.client_eligible === true/);
  assert.match(source, /\.eq\("category", "visual-library"\)/);
  assert.match(source, /rankGalleryAssets\(visualAssets, knowledgeById, chart, question\)/);
  assert.doesNotMatch(source, /const strictAssets/);
  assert.doesNotMatch(source, /if \(strictAssets\.length\)/);
  assert.match(source, /knowledge-fallback/);
  assert.match(source, /visual-library-fallback/);
  assert.match(source, /any-enabled-fallback/);
  assert.doesNotMatch(source, /GALLERY_REFERENCE_NOT_FOUND/);
  assert.match(source, /NO_GALLERY_ASSET_AVAILABLE/);
  assert.match(source, /chart\?\.useful/);
  assert.match(source, /chart\?\.drain/);
});

test("Gallery ranking recognizes real travel and holiday wording without double-counting confidence", async () => {
  const source = await read("supabase/functions/generate-decree-image/index.ts");
  assert.match(source, /度假/);
  assert.match(source, /假期/);
  assert.match(source, /行程/);
  assert.match(source, /旅程/);
  assert.match(source, /trip/);
  assert.match(source, /vacation/);
  assert.match(source, /holiday/);
  assert.match(source, /journey/);
  const confidenceBonus = "Math.max(0, Math.min(1, Number(knowledge?.confidence) || 0)) * 4";
  assert.equal(source.split(confidenceBonus).length - 1, 0, "relaxed ranking must not add confidence a second time");
  assert.equal((source.match(/confidence \* 4/g) ?? []).length, 1, "confidence belongs only inside the base reference score");
});

test("new reports copy the best matched Gallery artwork directly without requiring image-provider credits", async () => {
  const source = await read("supabase/functions/generate-decree-image/index.ts");
  const directIndex = source.indexOf("if (!force)");
  const providerIndex = source.indexOf('fetch("https://api.openai.com/v1/images/edits"');
  assert.ok(directIndex >= 0, "default Gallery-direct delivery branch is required");
  assert.ok(providerIndex > directIndex, "Gallery-direct delivery must happen before optional provider personalization");
  assert.match(source, /deliverGalleryDirect/);
  assert.match(source, /imageSource: "gallery-direct"/);
  assert.match(source, /GALLERY_DIRECT_VERSION/);
  assert.match(source, /upload\(objectPath, referenceBlob/);
  assert.match(source, /gallerySelectionMode/);
});

test("provider personalization remains optional and falls back to the matched Gallery image", async () => {
  const source = await read("supabase/functions/generate-decree-image/index.ts");
  assert.match(source, /new FormData\(\)/);
  assert.match(source, /form\.append\("image", referenceBlob/);
  assert.match(source, /https:\/\/api\.openai\.com\/v1\/images\/edits/);
  assert.doesNotMatch(source, /\/v1\/images\/generations/);
  assert.match(source, /Explicit force=true keeps the optional provider-personalized path/);
  assert.match(source, /galleryDirect: true/);
  assert.match(source, /degraded: true/);
});

test("existing personal decree image is delivered before any reselection or regeneration attempt", async () => {
  const source = await read("supabase/functions/generate-decree-image/index.ts");
  const reuseIndex = source.indexOf("if (report.image_path && !force)");
  const galleryIndex = source.indexOf("chooseGalleryReference(service, chart, question)");
  const providerIndex = source.indexOf('fetch("https://api.openai.com/v1/images/edits"');
  assert.ok(reuseIndex >= 0, "existing image reuse guard is required");
  assert.ok(galleryIndex > reuseIndex, "existing personal image must be returned before Gallery reselection");
  assert.ok(providerIndex > reuseIndex, "existing personal image must be returned before provider generation");
  assert.match(source, /createSignedUrl\(imagePath, 3600\)/);
  assert.match(source, /A failed refresh must never make an already-generated personal image disappear/);
});

test("provider billing details are never exposed to customers", async () => {
  const client = await read("src/lib/report/decree-image.ts");
  assert.match(client, /IMAGE_GENERATION_FAILED/);
  assert.doesNotMatch(client, /detail \? `命/);
  assert.doesNotMatch(client, /platform\.openai\.com/);
  assert.doesNotMatch(client, /九页|九頁/);
});
