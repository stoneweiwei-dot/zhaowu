import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const atlas = await readFile(new URL("../src/lib/public-atlas.ts", import.meta.url), "utf8");
const gallery = await readFile(new URL("../src/components/auspicious-gallery-section.tsx", import.meta.url), "utf8");
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
  assert.doesNotMatch(`${atlas}\n${gallery}`, /storage\/v1\/object\/public\/zhaowu-gallery|gallery_assets/);
});

test("public visual directories receive reusable cache headers", () => {
  for (const source of ["/report-visuals/(.*)", "/ornaments/(.*)", "/gallery/loading/(.*)"]) {
    assert.match(cacheValue(source), /public/);
    assert.match(cacheValue(source), /max-age=86400/);
    assert.match(cacheValue(source), /stale-while-revalidate=604800/);
  }
});

test("dynamic application shell remains no-store", () => {
  assert.match(cacheValue("/"), /no-store/);
  assert.match(cacheValue("/index.html"), /no-store/);
  assert.match(cacheValue("/manifest.webmanifest"), /no-store/);
});
