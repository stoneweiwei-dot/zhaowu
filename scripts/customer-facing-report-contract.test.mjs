import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("English customer report is composed separately from the Bazi section engine", async () => {
  const customer = await source("src/lib/report/customer-report.ts");
  const start = customer.indexOf("function composePlainEnglish");
  const end = customer.indexOf("function compactChinese");
  assert.ok(start >= 0 && end > start);
  const englishPath = customer.slice(start, end);
  assert.match(customer, /if \(locale === "en"\) return composePlainEnglish\(result\)/);
  assert.doesNotMatch(englishPath, /composeFocusedReport/);
  assert.doesNotMatch(englishPath, /chart\./);
  assert.match(englishPath, /Bottom line/);
  assert.match(englishPath, /What to do next/);
});

test("English report renderer rejects translated Bazi jargon and hides the basis card", async () => {
  const renderer = await source("src/components/paid-report-pages.tsx");
  assert.match(renderer, /ENGLISH_TECHNICAL/);
  assert.match(renderer, /locale === "en" \? null/);
  assert.match(renderer, /section\.key !== "basis"/);
  assert.match(renderer, /ZHAOWU · PERSONAL GUIDANCE/);
  assert.match(renderer, /Bottom line/);
  assert.match(renderer, /What to do next/);
});

test("image provider details are never exposed to customers", async () => {
  const decree = await source("src/lib/report/decree-image.ts");
  const result = await source("src/components/result-view.tsx");
  assert.doesNotMatch(decree, /\$\{detail\}/);
  assert.doesNotMatch(decree, /return detail/);
  assert.match(decree, /命诰图暂时无法生成/);
  assert.match(result, /setMsg\(copy\.imageUnavailable\)/);
  assert.doesNotMatch(result, /setMsg\(err instanceof Error \? err\.message/);
});

test("rich visual layer is loaded last and keeps wallpaper plus ornamental accents", async () => {
  const main = await source("src/main.tsx");
  const rich = await source("src/production-visual-richness.css");
  const shell = await source("src/components/site-shell.tsx");
  assert.ok(main.indexOf("production-visual-reset.css") < main.indexOf("production-visual-richness.css"));
  assert.match(rich, /zhaowu-home-hero/);
  assert.match(rich, /zhaowu-specialist-card\.is-dual/);
  assert.match(rich, /zhaowu-focused-report/);
  assert.match(rich, /zhaowu-seal-scatter/);
  assert.match(shell, /<SealScatter seedKey=\{pathname\} \/>/);
});
