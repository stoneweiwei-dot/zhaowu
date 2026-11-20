import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BUNDLED_REPORT_ART, isBundledReportArt } from "../src/lib/owner-bundled-report-art.ts";
import { isOfficialSongGalleryAsset, matchesOwnerGalleryGroup } from "../src/lib/gallery-groups.ts";

const stemKeys = [
  "jia-wood", "yi-wood", "bing-fire", "ding-fire", "wu-earth",
  "ji-earth", "geng-metal", "xin-metal", "ren-water", "gui-water",
];
const branchKeys = ["zi", "chou", "yin", "mao", "chen", "si", "wu", "wei", "shen", "you", "xu", "hai"];

test("owner gallery registers all 22 existing report files once, with same-origin URLs", () => {
  assert.equal(BUNDLED_REPORT_ART.length, 22);
  assert.equal(new Set(BUNDLED_REPORT_ART.map((asset) => asset.id)).size, 22);
  assert.deepEqual(BUNDLED_REPORT_ART.slice(0, 10).map((asset) => asset.storage_path),
    stemKeys.map((key) => `/report-visuals/characters/${key}.webp`));
  assert.deepEqual(BUNDLED_REPORT_ART.slice(10).map((asset) => asset.storage_path),
    branchKeys.map((key) => `/report-visuals/branches/${key}.webp`));
  for (const asset of BUNDLED_REPORT_ART) {
    assert.ok(existsSync(new URL(`../public${asset.storage_path}`, import.meta.url)), asset.storage_path);
    assert.equal(asset.bucket_id, "public-fallback");
    assert.equal(asset.category, "visual-library");
    assert.equal(asset.enabled, true);
    assert.ok(isBundledReportArt(asset));
    assert.ok(!isOfficialSongGalleryAsset(asset), "new report artwork must not impersonate legacy mother art");
  }
});

test("new stems and branches appear in their owner tabs, never in legacy or uploads", () => {
  const count = (group) => BUNDLED_REPORT_ART.filter((asset) => matchesOwnerGalleryGroup(asset, group)).length;
  assert.equal(count("day-master"), 10);
  assert.equal(count("month-command"), 12);
  for (const group of ["song-master", "luck-five-elements", "auspicious", "owner-upload", "legacy"]) {
    assert.equal(count(group), 0, group);
  }
});

test("the owner console reads bundled assets locally and keeps their destructive actions disabled", () => {
  const source = readFileSync(new URL("../src/components/owner-gallery-manager.tsx", import.meta.url), "utf8");
  assert.match(source, /BUNDLED_REPORT_ART\.filter/);
  assert.match(source, /storedPaths\.has\(asset\.storage_path\)/);
  assert.match(source, /isBundledReportArt\(asset\)/);
  assert.match(source, /!isBundledReportArt\(asset\) \? <button/);
  assert.match(source, /data-bundled-report-count="22"/);
  assert.match(source, /protectedAsset\(asset\)/);
  assert.match(source, /asset\.category === "visual-library" && !isLoadingGalleryAsset\(asset\)/);
});
