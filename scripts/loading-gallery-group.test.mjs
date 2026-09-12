import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const groups = await readFile(new URL("../src/lib/gallery-groups.ts", import.meta.url), "utf8");
const owner = await readFile(new URL("../src/components/owner-gallery-manager.tsx", import.meta.url), "utf8");
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

test("owner gallery exposes a loading stills and animation view", () => {
  assert.match(owner, /type OwnerView =/);
  assert.match(owner, /"atlas"/);
  assert.match(owner, /"all"/);
  assert.match(owner, /"loading"/);
  assert.match(owner, /LOADING_GALLERY_CATALOG/);
  assert.match(owner, /isLoadingGalleryAsset/);
  assert.match(owner, /登入動畫/);
  assert.match(owner, /category: view === "loading" \? "loading" : "visual-library"/);
  assert.match(owner, /setPreview/);
  assert.match(owner, /video\/mp4/);
  assert.match(owner, /tooLong/);
});


test("public login catalog only references committed same-origin files", async () => {
  const committedFiles = [
    "../public/intro/loading-poster.jpg",
    "../public/intro/owner-lotus-bloom-r53.jpg",
    "../public/intro/owner-lotus-bloom-r53.mp4",
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
  assert.match(catalog, /kind: "animation"/);
  assert.match(writer, /loading-pack\.part\./);
  assert.match(writer, /EXPECTED_COUNT = 19/);
  assert.match(vite, /write-loading-gallery\.mjs/);
});
