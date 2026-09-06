import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../src/components/d60-karma-section.tsx", import.meta.url), "utf8");
const palm = fs.readFileSync(new URL("../src/components/palm-standalone.tsx", import.meta.url), "utf8");
const route = fs.readFileSync(new URL("../src/routes/yizhangjing.tsx", import.meta.url), "utf8");
const home = fs.readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");

test("Indian classical astrology reuses only the current report birth input and exposes no second customer form", () => {
  assert.match(source, /zhaowu:d60-birth/);
  assert.match(palm, /zhaowu:d60-birth/);
  assert.doesNotMatch(source, /useCurrentUserState|user\?\.birthData/);
  assert.match(source, /createPortal/);
  assert.doesNotMatch(source, /searchCities|<form|formTitle|Generate D60|生成 D60|排你的 D60/);
});

test("customer-facing title names Indian classical astrology while D60 stays an explicit minute-sensitive sublayer", () => {
  assert.match(source, /title: "印度古法占星"/);
  assert.match(home, /title: "印度古法占星"/);
  assert.match(home, /title: "Classical Indian Astrology"/);
  assert.match(home, /D60 對出生分鐘非常敏感|D60 对出生分钟非常敏感/);
  assert.match(home, /D60 minute-sensitive cross-check/);
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

test("Indian classical astrology is injected into the existing Past & Present report with a visible uncertainty note", () => {
  assert.match(route, /PalmStandalone/);
  assert.match(palm, /export function PalmStandalone/);
  assert.match(source, /export function D60KarmaSection/);
  assert.match(source, /大約 2 分鐘就可能跨過一個細分區/);
  assert.match(source, /roughly two minutes/);
  assert.match(source, /stableMinus2/);
  assert.match(source, /stablePlus2/);
});

test("Indian classical astrology remains fail-closed and never blocks the four-life report", () => {
  assert.match(source, /前四世報告不受影響/);
  assert.match(source, /不會再從帳戶舊資料或其他報告自動補算/);
  assert.match(source, /no longer falls back to old account data or another report/);
  assert.match(source, /只作弱旁證/);
  assert.match(source, /not promoted into a definite conclusion/);
});
