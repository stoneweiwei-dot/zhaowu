import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const unified = await readFile(new URL("../src/components/unified-birth-report.tsx", import.meta.url), "utf8");
const pages = await readFile(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");

test("core destiny-book sections are folded by default (no `open` attribute) with a teaser", () => {
  assert.match(unified, /<details className="zhaowu-unified-fold" data-report-fold>/);
  assert.match(unified, /zhaowu-unified-fold__teaser/);
  assert.doesNotMatch(unified, /<details className="zhaowu-unified-fold"[^>]*\bopen\b/);
});

test("specialist hub mounts only in the selected systems mode", () => {
  assert.match(unified, /data-specialist-hub/);
  assert.match(unified, /mode === "formal"[\s\S]*mode === "comic"[\s\S]*<SpecialistHub/);
  for (const id of ["ziwei", "qizheng", "western", "indian", "palm", "numerology"]) {
    assert.match(unified, new RegExp(`"${id}"`));
  }
  assert.match(unified, /buildIndianReading/);
});

test("full report folds summary overflow and the body note but keeps both headings and their order", () => {
  assert.match(pages, /SUMMARY_VISIBLE_LINES/);
  assert.match(pages, /<section className="zhaowu-report-body-block">/);
  assert.ok(pages.indexOf("zhaowu-report-summary-block") < pages.indexOf('<section className="zhaowu-report-body-block">'));
  assert.match(pages, /<summary><h4><span className="zhaowu-report-stage-no">03<\/span>\{copy\.body\}<\/h4><\/summary>/);
});

test("the home page keeps specialist entrances inside the report and links to each free chart", () => {
  assert.doesNotMatch(home, /紫微斗數|七政四餘|達摩一掌經|印度古法占星|Western astrology|D60/);
  assert.doesNotMatch(unified, /data-specialist-link/);
  assert.match(unified, /zhaowu-specialist-free-link/);
  assert.match(unified, /SPECIALIST_ROUTES/);
  assert.match(unified, /href=\{entry\.route\}/);
  assert.doesNotMatch(unified, /<ReportAccessGate/);
});

test("fold styles exist and respect reduced motion", () => {
  assert.match(css, /\.zhaowu-unified-fold > summary/);
  assert.match(css, /\.zhaowu-specialist-node/);
  assert.match(css, /\.zhaowu-report-fold > summary::after \{ transition: none; \}/);
});
