import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/updates.tsx", import.meta.url), "utf8");
const routeTree = await readFile(new URL("../src/routeTree.gen.ts", import.meta.url), "utf8");
const design = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const stats = await readFile(new URL("../src/lib/site-stats.ts", import.meta.url), "utf8");
const changelog = await readFile(new URL("../src/lib/public-changelog.ts", import.meta.url), "utf8");

test("latest release entry is a real route, not an inline disclosure", () => {
  assert.match(shell, /<Link to="\/updates"[^>]+data-latest-change-report/);
  assert.doesNotMatch(shell, /<details[^>]+data-latest-change-report/);
  assert.match(route, /createFileRoute\("\/updates"\)/);
  assert.match(route, /data-updates-page/);
  assert.match(route, /getPublicSiteStats/);
  assert.match(route, /SITE_RELEASE_FALLBACK/);
  assert.match(routeTree, /UpdatesRoute/);
  assert.match(design, /\.zhaowu-updates-page/);
});

test("release page carries bilingual content and never hardcodes a commit SHA", () => {
  assert.match(route, /最新版本更新內容/);
  assert.match(route, /Latest release/);
  assert.doesNotMatch(route, /[a-f0-9]{40}/i);
});

test("SITE_RELEASE_FALLBACK and PUBLIC_CHANGELOG include r228 and recent official updates without internal jargon", () => {
  assert.match(stats, /version:\s*"ZW-WEB-2026\.11\.11-r228"/);
  assert.match(stats, /updateNumber:\s*228/);
  assert.match(stats, /summary:\s*\{[\s\S]*"zh-Hant":[\s\S]*"zh-Hans":[\s\S]*en:/);
  assert.match(stats, /details:\s*\{[\s\S]*"zh-Hant":[\s\S]*"zh-Hans":[\s\S]*en:/);
  for (const id of [
    "2026-11-11-sky-visits-updates",
    "2026-11-09-sky-solar-system",
    "2026-11-08-mobile-zoom-and-swipe-cues",
    "2026-11-08-owner-face-id-signin",
    "2026-11-07-sydney-auto-72-hou",
    "2026-11-07-language-switcher-and-music-volume",
    "2026-11-07-home-four-collapsed-blocks",
  ]) {
    assert.ok(changelog.includes(`id: "${id}"`), `missing public changelog entry ${id}`);
  }
  assert.doesNotMatch(changelog, /#1000|#1003|#1007|#1008|#1010|#1011|#1014|#1015|zhaowu-core|RPC|empty database/i);
});

test("development commits are distinguished from numbered releases", () => {
  assert.match(route, /development-history\.json/);
  assert.match(route, /一次正式發布可以包含多次提交/);
  assert.match(route, /history\.sha/);
  assert.match(shell, /正式版本序號/);
  assert.doesNotMatch(shell, /累計更新/);
});
