import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../src/components/d60-karma-section.tsx", import.meta.url), "utf8");
const palm = fs.readFileSync(new URL("../src/components/palm-standalone.tsx", import.meta.url), "utf8");
const route = fs.readFileSync(new URL("../src/routes/yizhangjing.tsx", import.meta.url), "utf8");
const indian = fs.readFileSync(new URL("../src/routes/indian-astrology.tsx", import.meta.url), "utf8");
const specialist = fs.readFileSync(new URL("../src/components/specialist-system-page.tsx", import.meta.url), "utf8");
const home = fs.readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const unified = fs.readFileSync(new URL("../src/components/unified-birth-report.tsx", import.meta.url), "utf8");
const runtime = fs.readFileSync(new URL("../src/components/yizhangjing-runtime-r79.tsx", import.meta.url), "utf8");

test("Indian classical astrology reuses only the current report birth input and exposes no second customer form", () => {
  assert.match(source, /zhaowu:d60-birth/);
  assert.doesNotMatch(palm, /zhaowu:d60-birth/);
  assert.doesNotMatch(source, /useCurrentUserState|user\?\.birthData/);
  assert.match(source, /createPortal/);
  assert.doesNotMatch(source, /searchCities|<form|formTitle|Generate D60|生成 D60|排你的 D60/);
});

test("Indian classical astrology stays internal on the unified homepage report while D60 remains minute-sensitive", () => {
  assert.match(source, /title: "印度古法占星"/);
  assert.doesNotMatch(home, /印度古法占星|Classical Indian astrology|D60/);
  assert.doesNotMatch(unified, /indian\.warning \|\| indian\.lead/);
  assert.match(unified, /withoutMethodLabels/);
  assert.match(unified, /時間敏感細分層|时间敏感细分层|Time-sensitive detail/);
  assert.doesNotMatch(source, /D60 · SHASHTIAMSA|title: "D60 業力旁證"|title: "D60 业力旁证"|title: "D60 karmic cross-check"/);
});

test("every Indian classical astrology result card can reveal a plain-language explanation", () => {
  assert.match(source, /plainExplanation/);
  assert.match(source, /openTheme/);
  assert.match(source, /aria-expanded=\{isOpen\}/);
  assert.match(source, /點開看白話解釋/);
  assert.match(source, /Tap for a plain-language explanation/);
  for (const key of ["core", "emotion", "duty", "resource", "relation"]) {
    assert.match(source, new RegExp(`${key}:`));
  }
});

test("D60 lives in its own Indian grouping and is no longer injected into Past & Present", () => {
  assert.match(route, /PalmStandalone/);
  assert.doesNotMatch(route, /D60KarmaSection/);
  assert.match(indian, /SpecialistSystemPage id="indian"/);
  assert.match(specialist, /D60ReliabilityGate/);
  assert.match(specialist, /id === "indian"/);
  assert.match(palm, /export function PalmStandalone/);
  assert.match(source, /export function D60KarmaSection/);
  assert.match(source, /大約 2 分鐘就可能跨過一個細分區/);
  assert.match(source, /roughly two minutes/);
  assert.match(source, /stableMinus2/);
  assert.match(source, /stablePlus2/);
});

test("Indian classical astrology remains fail-closed and never blocks other readings", () => {
  assert.match(source, /本卷其他分析不受影響/);
  assert.match(source, /不會再從帳戶舊資料或其他報告自動補算/);
  assert.match(source, /no longer falls back to old account data or another report/);
  assert.match(source, /只作弱旁證/);
  assert.match(source, /not promoted into a definite conclusion/);
});

test("shared minute-level records hydrate the palm page without a D60 confirmation checkbox", () => {
  assert.match(palm, /setBirthMinute\(record\.timeUnknown \? "" : String\(record\.minute\)\)/);
  assert.doesNotMatch(palm, /d60Confirm|setD60Exact|d60Exact/);
  assert.match(runtime, /submitPalm\(false\)/);
});

test("D60 events cannot be reintroduced by the Past & Present form", () => {
  assert.doesNotMatch(runtime, /readSharedBirthRecord|SHARED_BIRTH_EVENT|emitD60Birth|zhaowu:d60-birth/);
  assert.doesNotMatch(palm, /zhaowu:d60-birth/);
});
