import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const groups = await readFile(new URL("../src/lib/gallery-groups.ts", import.meta.url), "utf8");
const owner = await readFile(new URL("../src/components/owner-gallery-manager.tsx", import.meta.url), "utf8");
const loginOwner = await readFile(new URL("../src/components/owner-login-visuals-manager.tsx", import.meta.url), "utf8");
const loginRuntime = await readFile(new URL("../src/lib/login-animation.ts", import.meta.url), "utf8");
const catalog = await readFile(new URL("../src/lib/loading-gallery-catalog.ts", import.meta.url), "utf8");
const writer = await readFile(new URL("./write-loading-gallery.mjs", import.meta.url), "utf8");
const vite = await readFile(new URL("../vite.config.ts", import.meta.url), "utf8");
const atlasTest = await readFile(new URL("./auspicious-gallery-section.test.mjs", import.meta.url), "utf8");

test("gallery keeps a dedicated loading group outside the public atlas", () => {
  assert.match(groups, /\| "loading"/);
  assert.match(groups, /if \(asset\.category === "loading"\) return "loading"/);
  assert.match(groups, /export function isLoadingGalleryAsset/);
  const publicBlock = groups.match(/PUBLIC_ATLAS_GROUPS = \[([\s\S]*?)\]/)?.[1] ?? "";
  assert.doesNotMatch(publicBlock, /"loading"/);
  assert.match(atlasTest, /doesNotMatch\(groups\.match\(\/PUBLIC_ATLAS_GROUPS/);
});

test("login visuals are isolated from the general owner gallery", () => {
  assert.match(owner, /type OwnerView = "atlas" \| "all"/);
  assert.match(owner, /isLoadingGalleryAsset/);
  assert.match(owner, /assets\.filter\(\(asset\) => !isLoadingGalleryAsset\(asset\)\)/);
  assert.doesNotMatch(owner, /LOADING_GALLERY_CATALOG/);
  assert.doesNotMatch(owner, /view === "loading"/);
  assert.match(loginOwner, /LOGIN_VISUAL_CATALOG/);
  assert.match(loginOwner, /login-background/);
  assert.match(loginRuntime, /LOGIN_VISUAL_CATALOG/);
});


test("public login catalog only references committed same-origin files", async () => {
  const committedFiles = [
    "../public/intro/loading-poster.jpg",
    "../public/intro/owner-lotus-bloom-r53.jpg",
    "../public/intro/owner-lotus-bloom-r53.mp4",
    "../public/intro/owner-immortal-ascent-r123.jpg",
    "../public/intro/owner-immortal-ascent-r123.mp4",
    "../public/intro/lotus-bloom-v12.webp",
    "../public/intro/twin-lotus-restored-r26.jpg",
    "../public/intro/twin-lotus-restored-r26.mp4",
    "../public/intro/wutong-owner-r29.jpeg",
  ];
  for (const file of committedFiles) {
    const bytes = await readFile(new URL(file, import.meta.url));
    assert.ok(bytes.length > 0, file);
  }
  assert.match(catalog, /publicPath: "\/intro\//);
  assert.doesNotMatch(catalog, /\/gallery\/loading\/(?:song-parchment|dawn-dragon|anim-live|official-monitor|jade-lotus)/);
});

test("loading catalog covers the owner stills and bloom animations", () => {
  assert.match(catalog, /loading-song-parchment-dragon/);
  assert.match(catalog, /loading-dawn-dragon-lotus/);
  assert.match(catalog, /loading-live-lotus-bloom/);
  assert.match(catalog, /loading-official-monitor-cat/);
  assert.match(catalog, /loading-owner-lotus-bloom-r53/);
  assert.match(catalog, /loading-owner-lotus-bloom-r53/);
  assert.match(catalog, /loading-owner-immortal-ascent-r123/);
  assert.match(catalog, /kind: "animation"/);
  assert.match(writer, /loading-pack\.part\./);
  assert.match(writer, /EXPECTED_COUNT = 19/);
  assert.match(vite, /write-loading-gallery\.mjs/);
});


test("curated login media excludes internal loading and operational artwork", () => {
  assert.match(catalog, /LOGIN_VISUAL_CATALOG_KEYS/);
  assert.match(catalog, /loading-owner-lotus-bloom-r53/);
  assert.match(catalog, /loading-owner-immortal-ascent-r123/);
  const curated = catalog.match(/LOGIN_VISUAL_CATALOG_KEYS = \[([\s\S]*?)\]/)?.[1] ?? "";
  assert.doesNotMatch(curated, /official-monitor|song-parchment|dawn-dragon|jade-lotus/);
});
