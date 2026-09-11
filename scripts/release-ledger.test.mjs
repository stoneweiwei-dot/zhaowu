import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const stats = await readFile(new URL("../src/lib/site-stats.ts", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const manifest = await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8");
const report = await readFile(new URL("../docs/change-reports/ZW-WEB-2026.09.11-r109.md", import.meta.url), "utf8");
const agents = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");
test("public footer always exposes current release and cumulative update count", () => {
  assert.match(stats, /ZW-WEB-2026\.09\.11-r109/);
  assert.match(stats, /updateNumber:\s*109/);
  assert.match(shell, /data-site-release/);
  assert.match(shell, /累計更新/);
  assert.match(shell, /data-latest-change-report/);
});
test("fresh static shell defaults to Traditional Chinese before hydration", () => {
  assert.match(indexHtml, /<html lang="zh-Hant">/);
  assert.match(indexHtml, /<title>昭梧｜昭於未見，梧於有歸<\/title>/);
  assert.match(indexHtml, /name="description" content="看見命運的節奏，選擇屬於你的道路"/);
  assert.match(indexHtml, /property="og:locale" content="zh_TW"/);
  assert.match(indexHtml, /localStorage\.getItem\("zhaowu\.display-language"\)/);
  assert.match(manifest, /"lang":\s*"zh-TW"/);
  assert.match(manifest, /人生節奏與選擇分析/);
});
test("every production backend change requires a matching change report", () => {
  assert.match(report, /# 昭梧更新報告｜ZW-WEB-2026\.09\.11-r109/);
  assert.match(report, /## 本次改動/);
  assert.match(report, /## 為什麼改/);
  assert.match(report, /## 影響範圍/);
  assert.match(report, /## 回滾/);
  assert.match(agents, /MANDATORY RELEASE LEDGER/);
  assert.match(agents, /docs\/change-reports/);
  assert.match(agents, /release_history/);
  assert.match(agents, /CANONICAL METAPHYSICS DEFAULT/);
});
