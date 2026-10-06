import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const readBytes = (path) => readFile(new URL(`../${path}`, import.meta.url));

function gitBlobSha(bytes) {
  return createHash("sha1")
    .update(Buffer.from(`blob ${bytes.length}\0`))
    .update(bytes)
    .digest("hex");
}

function webpDimensions(bytes) {
  const chunk = bytes.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X") {
    return {
      width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
      height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16),
    };
  }
  if (chunk === "VP8 ") {
    for (let i = 20; i < bytes.length - 10; i += 1) {
      if (bytes[i] === 0x9d && bytes[i + 1] === 0x01 && bytes[i + 2] === 0x2a) {
        return {
          width: (bytes[i + 3] | (bytes[i + 4] << 8)) & 0x3fff,
          height: (bytes[i + 5] | (bytes[i + 6] << 8)) & 0x3fff,
        };
      }
    }
  }
  throw new Error(`Unsupported WebP header: ${chunk}`);
}

test("runtime Song mother art is bound to reviewed pixels, dimensions and face/head QC", async () => {
  const manifest = JSON.parse(await readText("public/report-visuals/qc-manifest.json"));
  assert.equal(manifest.version, "ZW-REPORT-VISUAL-QC-1.0");
  assert.equal(manifest.policy.targetFullWidth, 1080);
  assert.equal(manifest.policy.targetFullHeight, 1920);

  const runtime = Object.entries(manifest.assets).filter(([, item]) => item.runtime);
  assert.equal(runtime.length, 23);

  for (const [id, item] of runtime) {
    const bytes = await readBytes(`public/report-visuals/full/${id}.webp`);
    const actualSha = gitBlobSha(bytes);
    const actual = webpDimensions(bytes);
    assert.equal(actualSha, item.blobSha, `${id}: pixels changed; re-run human QC before approving`);
    assert.equal(actual.width, item.width, `${id}: width drifted`);
    assert.equal(actual.height, item.height, `${id}: height drifted`);
    assert.ok(["pass", "not-applicable"].includes(item.faceHeadQc), `${id}: face/head QC not approved`);

    const ratioError = Math.abs(actual.width / actual.height - 9 / 16);
    assert.ok(ratioError < 0.002, `${id}: no longer approximately 9:16`);

    if (actual.width < manifest.policy.targetFullWidth) {
      assert.equal(item.legacyResolutionException, true, `${id}: sub-1080 asset needs an explicit grandfathered baseline`);
      assert.equal(item.legacyBaselineBlobSha, actualSha, `${id}: changed low-resolution image is forbidden; replace with >=1080w`);
      assert.ok(actual.width >= manifest.policy.minimumGrandfatheredRuntimeWidth, `${id}: below phone-safe width`);
      assert.ok(actual.height >= manifest.policy.minimumGrandfatheredRuntimeHeight, `${id}: below phone-safe height`);
    }
  }
});

test("known ghosted five-element timing images are archived and cannot enter runtime", async () => {
  const manifest = JSON.parse(await readText("public/report-visuals/qc-manifest.json"));
  const assets = await readText("src/lib/report/report-visual-assets.ts");
  for (const id of ["luck-wood", "luck-fire", "luck-earth", "luck-metal", "luck-water"]) {
    assert.equal(manifest.assets[id].runtime, false);
    assert.equal(manifest.assets[id].faceHeadQc, "blocked-ghosting");
  }
  assert.match(assets, /STEM_VISUAL_KEYS/);
  assert.match(assets, /return key \? DAY_MASTER_ASSETS\[key\]/);
  assert.doesNotMatch(assets, /const LUCK_ASSETS/);
});

test("lightbox opens the full source and refuses to zoom beyond source-native pixels", async () => {
  const artwork = await readText("src/components/report-sprite-artwork.tsx");
  const viewer = await readText("src/components/image-viewer.tsx");
  assert.match(artwork, /fullImageUrl: asset\.fullImageUrl/);
  assert.match(viewer, /setSrc\(item\?\.fullImageUrl/);
  assert.match(viewer, /updateNativeZoomLimit/);
  assert.match(viewer, /image\.naturalWidth \/ renderedWidth/);
  assert.match(viewer, /Math\.min\(maxScale/);
});
