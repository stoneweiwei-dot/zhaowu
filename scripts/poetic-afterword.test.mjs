import test from "node:test";
import assert from "node:assert/strict";
import { buildPoeticAfterword, POETIC_AFTERWORD_LIBRARY } from "../src/lib/report/poetic-afterword.ts";

const base = {
  locale: "zh-Hant",
  theme: "patience",
  finalInterpretation: "這份命書的已完成分析指出：現階段重在整備，不宜倉促定案。",
  realWorldAction: "核對手上兩項選擇的收入、成長與退出成本。",
  editorialApproved: true,
};

test("five attributable linked sources without invented upstream record IDs", () => {
  assert.equal(POETIC_AFTERWORD_LIBRARY.length, 5);
  assert.equal(new Set(POETIC_AFTERWORD_LIBRARY.map((item) => item.id)).size, 5);
  assert.equal(new Set(POETIC_AFTERWORD_LIBRARY.map((item) => item.theme)).size, 5);
  for (const item of POETIC_AFTERWORD_LIBRARY) {
    assert.equal(item.textualStatus, "literary_source_checked");
    assert.equal(item.apiRecordId, null);
    assert.ok(item.sourceUrl.startsWith("https://zh.wikisource.org/"));
    assert.ok(item.sourceLocator);
    for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
      assert.ok(item.work[locale] && item.author[locale] && item.line[locale] && item.explanation[locale]);
    }
  }
});

test("final report facts are preserved, poem is labelled literary, not evidence", () => {
  const afterword = buildPoeticAfterword(base);
  assert.ok(afterword);
  assert.equal(afterword.finalInterpretation, base.finalInterpretation);
  assert.equal(afterword.realWorldAction, base.realWorldAction);
  assert.equal(afterword.quote, "行到水窮處，坐看雲起時。");
  assert.match(afterword.evidenceBoundary, /不是排盤依據/);
});

test("never decorate missing/unreviewed conclusions", () => {
  assert.equal(buildPoeticAfterword({ ...base, editorialApproved: false }), null);
  assert.equal(buildPoeticAfterword({ ...base, theme: null }), null);
  assert.equal(buildPoeticAfterword({ ...base, finalInterpretation: " " }), null);
  assert.equal(buildPoeticAfterword({ ...base, realWorldAction: " " }), null);
});

test("source and original remain stable across three distinct language readings", () => {
  const hant = buildPoeticAfterword(base);
  const hans = buildPoeticAfterword({ ...base, locale: "zh-Hans" });
  const english = buildPoeticAfterword({ ...base, locale: "en" });
  assert.ok(hant && hans && english);
  assert.notEqual(hant.quote, hans.quote);
  assert.notEqual(hant.quote, english.quote);
  assert.equal(english.originalChinese, hant.originalChinese);
  assert.match(english.evidenceBoundary, /not chart evidence/);
  assert.equal(hant.sourceUrl, english.sourceUrl);
});

test("explicit semantic theme selects each source without inspecting a day stem", () => {
  const selected = POETIC_AFTERWORD_LIBRARY.map((item) => buildPoeticAfterword({ ...base, theme: item.theme }));
  assert.equal(selected.every(Boolean), true);
  assert.equal(new Set(selected.map((item) => item.verseId)).size, 5);
});

test("theme derives only from report-language content, and abstains on ambiguity", async () => {
  const { matchPoeticTheme } = await import("../src/components/premium-poetic-afterword.tsx");
  assert.equal(matchPoeticTheme("目前應當等待與準備，先整備資源再確認方向。"), "patience");
  assert.equal(matchPoeticTheme("工作與家庭的責任及界線，需要清楚承擔與調整。"), "resilience");
  assert.equal(matchPoeticTheme("現階段暫不確定結論。"), null);
  assert.equal(matchPoeticTheme(""), null);
});

test("premium gate only mounts afterword after a verified bundle result", async () => {
  const { readFileSync } = await import("node:fs");
  const gate = readFileSync(new URL("../src/components/report-access-gate.tsx", import.meta.url), "utf8");
  assert.match(gate, /if \(level === "bundle" \|\| level === "system"\)/);
  assert.match(gate, /level === "bundle" && poeticContext \? <PremiumPoeticAfterword/);
  assert.doesNotMatch(gate, /level === "system" && poeticContext \? <PremiumPoeticAfterword/);
});
