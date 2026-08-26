import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";

const { resolveLocalSiteGuide, SITE_GUIDE_ROUTES } = await import("../src/lib/site-guide.ts");

test("common navigation requests resolve locally in all three languages", () => {
  assert.equal(resolveLocalSiteGuide("我想看双轨命盘", "zh-Hans")?.route, "/tianji-dual");
  assert.equal(resolveLocalSiteGuide("我要登入保存報告", "zh-Hant")?.route, "/login");
  assert.equal(resolveLocalSiteGuide("Where are my saved reports?", "en")?.route, "/account");
  assert.equal(resolveLocalSiteGuide("I want a career analysis", "en")?.route, "/#analysisForm");
});

test("the guide can only recommend real public site routes", () => {
  assert.deepEqual(SITE_GUIDE_ROUTES, ["/", "/#analysisForm", "/tianji-dual", "/account", "/login"]);
});

test("the shell mounts a non-blocking green dragon guide and the AI endpoint validates routes", async () => {
  const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
  const guide = await readFile(new URL("../src/components/green-dragon-guide.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/green-dragon-guide.css", import.meta.url), "utf8");
  const edge = await readFile(new URL("../supabase/functions/site-guide/index.ts", import.meta.url), "utf8");
  assert.match(shell, /<GreenDragonGuide \/>/);
  assert.match(guide, /data-site-guide|DAILY_AI_LIMIT/);
  assert.match(styles, /volume-01\.webp|volume-03\.webp/);
  assert.match(edge, /ALLOWED_ROUTES|safeRoute|gpt-4\.1-nano/);
  assert.match(edge, /source: "ai"|source: "fallback"/);
  assert.doesNotMatch(guide, /Suspense|await.*render/);
});
