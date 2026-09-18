import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/updates.tsx", import.meta.url), "utf8");
const routeTree = await readFile(new URL("../src/routeTree.gen.ts", import.meta.url), "utf8");
const design = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");

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
