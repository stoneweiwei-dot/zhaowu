import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const groups = await readFile(new URL("../src/lib/gallery-groups.ts", import.meta.url), "utf8");
const owner = await readFile(new URL("../src/components/owner-gallery-manager.tsx", import.meta.url), "utf8");
const loginOwner = await readFile(new URL("../src/components/owner-login-visuals-manager.tsx", import.meta.url), "utf8");
const loginRuntime = await readFile(new URL("../src/lib/login-animation.ts", import.meta.url), "utf8");
const catalog = await readFile(new URL("../src/lib/loading-gallery-catalog.ts", import.meta.url), "utf8");
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
  assert.match(owner, /OwnerGalleryGroup/);
  assert.match(owner, /isLoadingGalleryAsset/);
  assert.match(owner, /asset\.category === "visual-library" && !isLoadingGalleryAsset\(asset\)/);
  assert.doesNotMatch(owner, /LOADING_GALLERY_CATALOG/);
  assert.doesNotMatch(owner, /group === "loading"/);
  assert.doesNotMatch(loginOwner, /LOGIN_VISUAL_CATALOG|catalogRows/);
  assert.match(loginOwner, /const rows = assets/);
  assert.match(loginOwner, /login-background/);
  assert.match(loginOwner, /&& isVideo\(asset\)/);
  assert.match(loginOwner, /accept=\{LOGIN_VIDEO_ACCEPT\}/);
  assert.doesNotMatch(loginOwner, /accept="[^"]*image\//);
  assert.match(loginRuntime, /LOGIN_VISUAL_CATALOG/);
});


test("public login catalog only references committed same-origin files", async () => {
  const committedFiles = [
    "../public/intro/owner-lotus-bloom-r53.jpg",
    "../public/intro/owner-lotus-bloom-r53.mp4",
    "../public/intro/owner-immortal-ascent-r123.jpg",
    "../public/intro/owner-immortal-ascent-r123.mp4",
  ];
  for (const file of committedFiles) {
    const bytes = await readFile(new URL(file, import.meta.url));
    assert.ok(bytes.length > 0, file);
  }
  assert.match(catalog, /publicPath: "\/intro\//);
  assert.doesNotMatch(catalog, /\/gallery\/loading\/(?:song-parchment|dawn-dragon|anim-live|official-monitor|jade-lotus)/);
});

test("login catalog contains only the two approved owner visuals", async () => {
  assert.match(catalog, /loading-owner-lotus-bloom-r53/);
  assert.match(catalog, /loading-owner-immortal-ascent-r123/);
  assert.match(catalog, /kind: "animation"/);
  assert.doesNotMatch(catalog, /official-monitor|song-parchment|dawn-dragon|jade-lotus|live-lotus/);
  assert.doesNotMatch(vite, /write-intro-media|write-loading-gallery/);

  const introFiles = await readdir(new URL("../public/intro/", import.meta.url));
  assert.equal(
    introFiles.filter((name) => /^(?:loading-v11|loading-v13|loading-user-)|\.b64(?:\.|$)|v11\.manifest|r40-payload-pending|wutong-owner|twin-lotus|loading-poster/.test(name)).length,
    0,
  );
});


test("curated login media excludes internal loading and operational artwork", () => {
  assert.match(catalog, /LOGIN_VISUAL_CATALOG_KEYS/);
  assert.match(catalog, /loading-owner-lotus-bloom-r53/);
  assert.match(catalog, /loading-owner-immortal-ascent-r123/);
  const curated = catalog.match(/LOGIN_VISUAL_CATALOG_KEYS = \[([\s\S]*?)\]/)?.[1] ?? "";
  assert.doesNotMatch(curated, /official-monitor|song-parchment|dawn-dragon|jade-lotus/);
});

test("owner video edit controls use mobile-friendly tap targets", () => {
  assert.match(loginOwner, /const rows = assets/);
  assert.doesNotMatch(loginOwner, /LOGIN_VISUAL_CATALOG|catalogRows/);
  for (const label of ["copy.save", "copy.cancel", "copy.use", "copy.rename", "copy.remove"]) {
    const start = loginOwner.lastIndexOf("<button", loginOwner.indexOf("{" + label + "}"));
    assert.ok(start >= 0 && loginOwner.slice(start, loginOwner.indexOf("</button>", start)).includes("min-h-11"), label);
  }
  assert.doesNotMatch(loginOwner, /px-2(?:\.5)? py-1 text-\[10px\]/);
});
