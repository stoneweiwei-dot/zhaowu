import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";

const { resolveLocalSiteGuide, SITE_GUIDE_ROUTES } =
  await import("../src/lib/site-guide.ts");

test("common navigation requests resolve locally in all three languages", () => {
  assert.equal(resolveLocalSiteGuide("我想看性格兩面", "zh-Hant"), null);
  assert.equal(resolveLocalSiteGuide("Show me two sides of character", "en"), null);
  assert.equal(
    resolveLocalSiteGuide("我要登入保存報告", "zh-Hant")?.route,
    "/login",
  );
  assert.equal(
    resolveLocalSiteGuide("Where are my saved reports?", "en")?.route,
    "/history",
  );
  assert.equal(resolveLocalSiteGuide("我想看七政四餘", "zh-Hant")?.route, "/qizheng");
  assert.equal(resolveLocalSiteGuide("我想看以前的紫微报告", "zh-Hans")?.route, "/ziwei");
  assert.equal(resolveLocalSiteGuide("Open Dharma Palm", "en")?.route, "/yizhangjing");
  assert.equal(
    resolveLocalSiteGuide("I want a career analysis", "en")?.route,
    "/#analysisForm",
  );
});

test("the guide can only recommend real public site routes", () => {
  assert.deepEqual(SITE_GUIDE_ROUTES, [
    "/",
    "/#analysisForm",
    "/qizheng",
    "/yizhangjing",
    "/ziwei",
    "/history",
    "/account",
    "/login",
  ]);
});

test("the shell mounts a non-blocking green dragon guide and the AI endpoint validates routes", async () => {
  const shell = await readFile(
    new URL("../src/components/site-shell.tsx", import.meta.url),
    "utf8",
  );
  const guide = await readFile(
    new URL("../src/components/green-dragon-guide.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(
    new URL("../src/green-dragon-guide.css", import.meta.url),
    "utf8",
  );
  const layout = await readFile(
    new URL("../src/content-layout-fixes.css", import.meta.url),
    "utf8",
  );
  const edge = await readFile(
    new URL("../supabase/functions/site-guide/index.ts", import.meta.url),
    "utf8",
  );
  assert.match(shell, /<GreenDragonGuide \/>/);
  assert.match(guide, /data-site-guide|DAILY_AI_LIMIT/);
  assert.match(styles, /volume-01\.webp|volume-03\.webp/);
  assert.match(edge, /ALLOWED_ROUTES|safeRoute|gpt-4\.1-nano/);
  assert.match(edge, /source: "ai"|source: "fallback"/);
  assert.doesNotMatch(guide, /性格兩面|性格两面|Two sides|tianji-dual/);
  assert.match(guide, /七政四餘/);
  assert.match(guide, /前世今生/);
  assert.match(guide, /紫微斗數/);
  assert.match(guide, /我的紀錄/);
  assert.doesNotMatch(edge, /性格兩面|性格两面|Two sides|tianji-dual/);
  assert.match(shell, /<GreenDragonGuide \/>[\s\S]*zhaowu-app-frame/);
  assert.match(layout, /@media \(max-width: 640px\)/);
  assert.match(layout, /\.zhaowu-dragon-guide-panel \{[\s\S]*position: static/);
  assert.match(layout, /\.zhaowu-dragon-guide \{[\s\S]*position: relative/);
  assert.doesNotMatch(guide, /雙軌命盤|双轨命盘|Dual chart/);
  assert.doesNotMatch(guide, /Suspense|await.*render/);
});
