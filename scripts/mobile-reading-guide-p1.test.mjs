import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MobileReadingGuide } from "../src/components/mobile-reading-guide.tsx";

const renderer = readFileSync(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const model = {
  contract: { primaryQuestion: "Should I change jobs?" },
  directAnswer: "Decide after comparing real offers.",
  reasons: ["The current reading supports a careful comparison."],
  risks: ["Check the cost of leaving."],
  nextAction: "Write down the two options.",
  confidenceBasis: "Birth time is unconfirmed.",
  biggestVariable: "The actual offer terms.",
  actions: ["Keep the original action detail."],
  timing: ["Timing is conditional."],
};

test("guide renders only existing claims and leaves the decision model intact", () => {
  const before = structuredClone(model);
  const html = renderToStaticMarkup(createElement(MobileReadingGuide, { model, locale: "en" }));
  assert.deepEqual(model, before);
  for (const claim of [model.directAnswer, ...model.reasons, ...model.risks, model.nextAction]) {
    assert.ok(html.includes(claim), claim);
  }
  assert.match(html, /<details class="zhaowu-mobile-guide__evidence"/);
  assert.doesNotMatch(html, /birth date|date of birth|full name/i);
});

test("three languages keep the same claims and readable, bounded mobile styles", () => {
  for (const [locale, label] of [["zh-Hant", "簡明導讀"], ["zh-Hans", "简明导读"], ["en", "Reading guide"]]) {
    const html = renderToStaticMarkup(createElement(MobileReadingGuide, { model, locale }));
    assert.ok(html.includes(label));
    assert.ok(html.includes(model.directAnswer));
  }
  assert.match(styles, /\.zhaowu-mobile-guide__chapter p\{[^}]*font-size:17px;[^}]*overflow-wrap:anywhere/);
  assert.match(styles, /html\[data-zw-theme="night"\][^\n]*\.zhaowu-mobile-guide/);
  assert.match(styles, /\.zhaowu-professional-report\{min-width:0/);
});

test("professional report content remains in one collapsed chapter", () => {
  assert.match(renderer, /<MobileReadingGuide model=\{model\} locale=\{locale\} narrative=/);
  assert.match(renderer, /<details className="zhaowu-professional-report" data-professional-report>/);
  const fold = renderer.slice(renderer.indexOf('data-professional-report>'));
  for (const marker of ["zhaowu-report-summary-block", "data-report-stage=\"visual\"", "zhaowu-report-body-block", "<AnalysisNotes result={result}"]) {
    assert.ok(fold.includes(marker), marker);
  }
  assert.doesNotMatch(renderer, /ComicLiteReport|ReportComicLite/);
});

 test("guide prioritises action and never invents a strength from the day stem", () => {
  const html = renderToStaticMarkup(createElement(MobileReadingGuide, { model, locale: "en" }));
  assert.ok(html.indexOf(model.nextAction) < html.indexOf("data-guide-explanation"));
  assert.match(html, /no separate strength statement/);
  assert.doesNotMatch(html, /data-guide-explanation[^>]*open/);
  const withNarrative = renderToStaticMarkup(createElement(MobileReadingGuide, { model, locale: "en", narrative: { strength: "Existing source strength" } }));
  assert.match(withNarrative, /Existing source strength/);
});

 test("result-page guide does not duplicate the primary answer or drop actions", () => {
  const html = renderToStaticMarkup(createElement(MobileReadingGuide, { model, locale: "en", showPrimary: false }));
  assert.ok(!html.includes(model.directAnswer));
  assert.ok(!html.includes(model.contract.primaryQuestion));
  assert.ok(html.includes(model.actions[0]));
  assert.ok(html.includes(model.timing[0]));
});
