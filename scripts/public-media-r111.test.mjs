import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { preferVerifiedPublicMedia, verifiedPublicMediaUrl } from "../src/lib/public-media-preference.ts";

const atlas = await readFile(new URL("../src/lib/public-atlas.ts", import.meta.url), "utf8");
const gallery = await readFile(new URL("../src/components/auspicious-gallery-section.tsx", import.meta.url), "utf8");
const customerMatch = await readFile(new URL("../src/lib/gallery-match.ts", import.meta.url), "utf8");
const loginAnimation = await readFile(new URL("../src/lib/login-animation.ts", import.meta.url), "utf8");
const reportVisualAssets = await readFile(new URL("../src/lib/report/report-visual-assets.ts", import.meta.url), "utf8");
const music = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const backgroundAssets = await readFile(new URL("../src/lib/background-assets.ts", import.meta.url), "utf8");
const galleryAssets = await readFile(new URL("../src/lib/gallery-assets.ts", import.meta.url), "utf8");
const dailyAlmanac = await readFile(new URL("../src/components/daily-almanac-widget.tsx", import.meta.url), "utf8");
const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

function cacheValue(source) {
  const entry = vercel.headers.find((item) => item.source === source);
  return entry?.headers?.find((header) => header.key === "Cache-Control")?.value ?? "";
}

test("public atlas exposes only face-safe same-origin ornaments", () => {
  assert.match(atlas, /url:\s*`\/ornaments\/generated\/\$\{file\}\.webp`/);
  assert.doesNotMatch(atlas, /report-visuals|reportVisual/);
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

test("customer media paths stay on same-origin assets and music keeps idle preload off", () => {
  for (const source of [customerMatch, loginAnimation, reportVisualAssets]) {
    assert.doesNotMatch(source, /SUPABASE_URL|SUPABASE_KEY/, "customer media references Supabase client configuration");
    assert.doesNotMatch(source, new RegExp("rest/v1|storage/v1/object/public"), "customer media reads public Supabase assets at runtime");
  }
  assert.match(customerMatch, /PUBLIC_ATLAS_ASSETS/);
  assert.match(loginAnimation, /LOGIN_VISUAL_CATALOG/);
  assert.ok(reportVisualAssets.includes('const REPORT_VISUAL_CDN_BASE = "/report-visuals/groups"'));
  assert.ok(music.includes('preload="none"'));
  assert.ok(music.includes('window.addEventListener("pointerdown", unlock'));
  assert.ok(music.includes('window.addEventListener("touchend", unlock'));
  assert.ok(music.includes('if (!enabled || requested) return;'));
});

test("dynamic application shell remains no-store", () => {
  assert.match(cacheValue("/"), /no-store/);
  assert.match(cacheValue("/index.html"), /no-store/);
  assert.match(cacheValue("/manifest.webmanifest"), /no-store/);
});


test("public Supabase-managed media requires a verified safe URL and preserves origin", () => {
  const source = { storage_path: "source/original.webp", cdn_url: "https://cdn.example.test/media.webp", cdn_verified_at: "2026-09-19T00:00:00Z" };
  const resolved = preferVerifiedPublicMedia(source);
  assert.equal(resolved.storage_path, "https://cdn.example.test/media.webp");
  assert.equal(resolved.origin_storage_path, "source/original.webp");
  assert.notStrictEqual(resolved, source);

  for (const candidate of [
    { ...source, cdn_verified_at: null },
    { ...source, cdn_verified_at: "not-a-date" },
    { ...source, cdn_url: "http://cdn.example.test/media.webp" },
    { ...source, cdn_url: "//cdn.example.test/media.webp" },
    { ...source, cdn_url: "javascript:alert(1)" },
  ]) {
    assert.strictEqual(preferVerifiedPublicMedia(candidate), candidate);
  }
  assert.equal(verifiedPublicMediaUrl("/report-visuals/full/overview.webp", "2026-09-19T00:00:00Z"), "/report-visuals/full/overview.webp");

  assert.match(backgroundAssets, /cdn_url,cdn_provider,cdn_verified_at/);
  assert.match(backgroundAssets, /rows\.map\(preferVerifiedPublicMedia\)/);
  assert.match(backgroundAssets, /backgroundFallbackUrl/);
  assert.match(galleryAssets, /cdn_url,cdn_provider,cdn_verified_at/);
  assert.match(galleryAssets, /rows\.map\(preferVerifiedPublicMedia\)/);
  assert.match(galleryAssets, /galleryFallbackUrl/);
  assert.match(dailyAlmanac, /onError=.*galleryFallbackUrl/);
});
