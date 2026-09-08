import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const article = await readFile(new URL("../src/lib/life-view-long-form/bazi-health-symbolism.ts", import.meta.url), "utf8");
const section = await readFile(new URL("../src/components/life-view-home-section.tsx", import.meta.url), "utf8");
const fivePhases = await readFile(new URL("../public/articles/bazi-health-five-phases.svg", import.meta.url), "utf8");
const bodyMap = await readFile(new URL("../public/articles/bazi-health-body-map.svg", import.meta.url), "utf8");
const timing = await readFile(new URL("../public/articles/bazi-health-timing-rings.svg", import.meta.url), "utf8");
const balance = await readFile(new URL("../public/articles/bazi-health-balance.svg", import.meta.url), "utf8");

test("bazi health symbolism article is registered as the newest life-view note", () => {
  assert.match(section, /BAZI_HEALTH_SYMBOLISM_LONG_FORM/);
  assert.match(section, /\[BAZI_HEALTH_SYMBOLISM_LONG_FORM, INNER_FENGSHUI_LONG_FORM/);
  assert.match(article, /id: "bazi-health-symbolism"/);
  assert.match(article, /publishedAt: "2026-09-09"/);
});

test("article keeps three complete locales and medical boundaries", () => {
  assert.match(article, /十天干與身體象義/);
  assert.match(article, /十天干与身体象义/);
  assert.match(article, /Ten Heavenly Stems and Body Symbolism/);
  assert.match(article, /不作醫療診斷或疾病預測/);
  assert.match(article, /不作医疗诊断或疾病预测/);
  assert.match(article, /not medical diagnosis or disease prediction/);
  assert.match(article, /不做簡單「缺什麼補什麼」/);
  assert.match(article, /never reduce Bazi to .*missing.*added/);
});

test("article renders multiple optional r93 illustrations without gating text", () => {
  assert.equal((article.match(/afterParagraph:\s*\d+/g) ?? []).length, 4);
  assert.match(section, /article\.illustrations\?\.find/);
  assert.match(section, /loading="lazy"/);
  assert.match(section, /decoding="async"/);
  assert.match(section, /<p className=/);
  for (const svg of [fivePhases, bodyMap, timing, balance]) {
    assert.match(svg, /viewBox="0 0 720 960"/);
    assert.match(svg, /data-zhaowu-article-art="r93"/);
    assert.match(svg, /<title>/);
  }
});
