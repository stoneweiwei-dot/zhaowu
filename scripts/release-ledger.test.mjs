import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const stats = await readFile(new URL("../src/lib/site-stats.ts", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const manifest = await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8");
const report = await readFile(new URL("../docs/change-reports/ZW-WEB-2026.09.11-r107.md", import.meta.url), "utf8");
const agents = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");
test("public footer always exposes current release and cumulative update count", () => {
  assert.match(stats, /ZW-WEB-2026\.09\.11-r107/);
  assert.match(stats, /updateNumber:\s*107/);
  assert.match(shell, /data-site-release/);
  assert.match(shell, /累計更新/);
  assert.match(shell, /data-latest-change-report/);
});
test("fresh static shell defaults to Simplified Chinese before hydration", () => {
  assert.match(indexHtml, /<html lang="zh-Hans">/);
  assert.match(indexHtml, /<title>昭梧｜昭于未见，梧于有归<\/title>/);
  assert.match(indexHtml, /name="description" content="看见命运的节奏，选择属于你的道路"/);
  assert.match(indexHtml, /property="og:locale" content="zh_CN"/);
  assert.match(indexHtml, /localStorage\.getItem\("zhaowu\.display-language"\)/);
  assert.match(manifest, /"lang":\s*"zh-CN"/);
  assert.match(manifest, /人生节奏与选择分析/);
});
test("every production backend change requires a matching change report", () => {
  assert.match(report, /# 昭梧更新報告｜ZW-WEB-2026\.09\.11-r107/);
  assert.match(report, /## 本次改動/);
  assert.match(report, /## 為什麼改/);
  assert.match(report, /## 影響範圍/);
  assert.match(report, /## 回滾/);
  assert.match(agents, /MANDATORY RELEASE LEDGER/);
  assert.match(agents, /docs\/change-reports/);
  assert.match(agents, /release_history/);
  assert.match(agents, /CANONICAL METAPHYSICS DEFAULT/);
});
