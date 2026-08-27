import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("decree image backend requires approved client-eligible art from the flat visual library", async () => {
  const source = await read("supabase/functions/generate-decree-image/index.ts");
  assert.match(source, /from\("gallery_asset_knowledge"\)/);
  assert.match(source, /\.eq\("analysis_status", "approved"\)/);
  assert.match(source, /\.eq\("client_eligible", true\)/);
  assert.match(source, /\.eq\("category", "visual-library"\)/);
  assert.doesNotMatch(source, /\.eq\("category", "reference-style"\)/);
  assert.match(source, /chart\?\.useful/);
  assert.match(source, /chart\?\.drain/);
  assert.match(source, /GALLERY_REFERENCE_NOT_FOUND/);
});

test("decree generation edits the matched Gallery image instead of starting from text only", async () => {
  const source = await read("supabase/functions/generate-decree-image/index.ts");
  assert.match(source, /service\.storage[\s\S]*\.download\(String\(galleryReference\.storage_path\)\)/);
  assert.match(source, /new FormData\(\)/);
  assert.match(source, /form\.append\("image", referenceBlob/);
  assert.match(source, /https:\/\/api\.openai\.com\/v1\/images\/edits/);
  assert.doesNotMatch(source, /\/v1\/images\/generations/);
  assert.match(source, /galleryReferenceAssetId/);
});

test("existing personal decree image is delivered before any regeneration attempt", async () => {
  const source = await read("supabase/functions/generate-decree-image/index.ts");
  const reuseIndex = source.indexOf("if (report.image_path && !force)");
  const providerIndex = source.indexOf('fetch("https://api.openai.com/v1/images/edits"');
  assert.ok(reuseIndex >= 0, "existing image reuse guard is required");
  assert.ok(providerIndex > reuseIndex, "existing personal image must be signed and returned before provider generation");
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
