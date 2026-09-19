import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const form = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
const report = await readFile(new URL("../src/components/unified-birth-report.tsx", import.meta.url), "utf8");\nconst trust = await readFile(new URL("../src/components/chart-trust-panel.tsx", import.meta.url), "utf8");
const state = await readFile(new URL("../docs/CURRENT-STATE.md", import.meta.url), "utf8");

test("r165 locks the public product around one ZHAOWU Destiny Book", () => {
  assert.match(home, /昭梧 · 個人命書/);
  assert.match(home, /一份生辰，讀成一本昭梧命書/);
  assert.match(form, /保存並生成昭梧命書/);
  assert.match(form, /第二步 · 昭梧命書/);
  assert.match(form, /<BaziChart/);
  assert.match(form, /<UnifiedBirthReport/);
  assert.match(report, /昭梧命書 · 本命卷/);
  assert.match(report, /你的昭梧命書/);
});

test("r165 keeps calculation truth separate from interpretation", () => {
  assert.match(report, /排盤與解讀分層/);
  assert.match(report, /確定性規則計算/);
  assert.match(report, /子平八字仍是唯一結構主判/);
  assert.match(form, /規則引擎排出四柱/);
});

test("r165 does not reopen public school/tool entrances", () => {
  assert.doesNotMatch(home, /紫微斗數|七政四餘|達摩一掌經|印度古法占星|Western astrology|D60/);
  assert.match(state, /最終產品收線為「昭梧命書」/);
  assert.match(state, /不再以增加流派入口、首頁卡片或獨立工具作為產品主線/);
});


test("r165 exposes an auditable AI-readable chart package without reopening a tool hub", () => {
  assert.match(form, /<ChartTrustPanel chart=\{previewChart\}/);
  assert.match(trust, /data-chart-ai-copy/);
  assert.match(trust, /昭梧 AI 可讀命盤資料包/);
  assert.match(trust, /不要重新推算或靜默改寫四柱/);
  assert.match(trust, /固定回歸案例與核心流程檢查/);
  assert.match(trust, /href="\/updates"/);
});
