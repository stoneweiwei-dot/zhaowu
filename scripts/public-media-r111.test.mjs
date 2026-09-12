import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const atlas = await readFile(new URL("../src/lib/public-atlas.ts", import.meta.url), "utf8");
const gallery = await readFile(new URL("../src/components/auspicious-gallery-section.tsx", import.meta.url), "utf8");
const customerMatch = await readFile(new URL("../src/lib/gallery-match.ts", import.meta.url), "utf8");
const loginAnimation = await readFile(new URL("../src/lib/login-animation.ts", import.meta.url), "utf8");
const reportVisualAssets = await readFile(new URL("../src/lib/report/report-visual-assets.ts", import.meta.url), "utf8");
const music = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

function cacheValue(source) {
  const entry = vercel.headers.find((item) => item.source === source);
  return entry?.headers?.find((header) => header.key === "Cache-Control")?.value ?? "";
}

test("public atlas uses same-origin thumbnails for report visuals", () => {
  assert.match(atlas, /thumbnailUrl:\s*`\/report-visuals\/thumb\/\$\{file\}\.webp`/);
  assert.match(atlas, /url:\s*`\/report-visuals\/full\/\$\{file\}\.webp`/);
  assert.match(gallery, /src=\{asset\.thumbnailUrl \?\? asset\.url\}/);
  assert.match(gallery, /href=\{asset\.url\}/);
  assert.doesNotMatch(gallery, /galleryPublicUrl|listPublicGalleryAssets|SUPABASE_URL|storage\/v1\/object\/public\/zhaowu-gallery/);
});

test("public visual directories receive reusable cache headers", () => {
  for (const source of ["/report-visuals/(.*)", "/ornaments/(.*)", "/gallery/loading/(.*)"]) {
    assert.match(cacheValue(source), /public/);
    assert.match(cacheValue(source), /max-age=86400/);
    assert.match(cacheValue(source), /stale-while-revalidate=604800/);
  }
});

test("customer media paths stay on same-origin assets and opt in to audio", () => {
  for (const source of [customerMatch, loginAnimation, reportVisualAssets]) {
    assert.doesNotMatch(source, /SUPABASE_URL|SUPABASE_KEY/, "customer media references Supabase client configuration");
    assert.doesNotMatch(source, new RegExp("rest/v1|storage/v1/object/public"), "customer media reads public Supabase assets at runtime");
  }
  assert.match(customerMatch, /PUBLIC_ATLAS_ASSETS/);
  assert.match(loginAnimation, /LOADING_GALLERY_CATALOG/);
  assert.ok(reportVisualAssets.includes('const REPORT_VISUAL_CDN_BASE = "/report-visuals/groups"'));
  assert.ok(music.includes('preload="none"'));
  assert.ok(music.includes("const primarySrc = requested ?"));
  assert.ok(music.includes("if (!requested) return;"));
});
test("dynamic application shell remains no-store", () => {
  assert.match(cacheValue("/"), /no-store/);
  assert.match(cacheValue("/index.html"), /no-store/);
  assert.match(cacheValue("/manifest.webmanifest"), /no-store/);
});
