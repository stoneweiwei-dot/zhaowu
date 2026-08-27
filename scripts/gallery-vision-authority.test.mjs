import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("gallery semantic audit uses high-detail two-model consensus and ignores legacy category hints", async () => {
  const source = await read("supabase/functions/gallery-vision-audit/index.ts");
  assert.match(source, /detail:\s*"high"/);
  assert.match(source, /"gpt-4\.1-mini"/);
  assert.match(source, /"gpt-4\.1"/);
  assert.match(source, /filter\(\(tag\) => !tag\.startsWith\("legacy-category:"\)\)/);
  assert.match(source, /const subjectAgreement = overlap\(a\.subject_labels, b\.subject_labels\)/);
  assert.match(source, /const styleAgreement = overlap\(a\.style_labels, b\.style_labels\)/);
  assert.match(source, /const motifAgreement = overlap\(a\.motifs, b\.motifs\)/);
  assert.match(source, /analysis_version:\s*"vision-consensus-v2-strict"/);
  assert.match(source, /Do not force a Buddhist, Daoist, Hindu, Shinto, Christian, Islamic or other religious label/);
});

test("retired pixel audit cannot overwrite semantic gallery knowledge", async () => {
  const [pixel, batch] = await Promise.all([
    read("supabase/functions/gallery-pixel-audit/index.ts"),
    read("supabase/functions/gallery-pixel-audit-batch-runner/index.ts"),
  ]);
  for (const source of [pixel, batch]) {
    assert.match(source, /PIXEL_AUDIT_RETIRED_USE_GALLERY_VISION_AUDIT/);
    assert.match(source, /410/);
    assert.doesNotMatch(source, /gallery_asset_knowledge/);
  }
});
