import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../src/components/d60-karma-section.tsx", import.meta.url), "utf8");
const palm = fs.readFileSync(new URL("../src/components/palm-standalone.tsx", import.meta.url), "utf8");
const route = fs.readFileSync(new URL("../src/routes/yizhangjing.tsx", import.meta.url), "utf8");

test("D60 reuses only the current report birth input and exposes no second customer form", () => {
  assert.match(source, /zhaowu:d60-birth/);
  assert.match(palm, /zhaowu:d60-birth/);
  assert.doesNotMatch(source, /useCurrentUserState|user\?\.birthData/);
  assert.match(source, /createPortal/);
  assert.doesNotMatch(source, /searchCities|<form|formTitle|Generate D60|生成 D60|排你的 D60/);
});

test("D60 is injected into the existing Past & Present report with a visible uncertainty note", () => {
  assert.match(route, /<PalmStandalone \/>/);
  assert.match(route, /<D60KarmaSection \/>/);
  assert.match(source, /大約 2 分鐘就可能跨過一個 D60 分區/);
  assert.match(source, /roughly two minutes/);
  assert.match(source, /stableMinus2/);
  assert.match(source, /stablePlus2/);
});

test("D60 remains fail-closed and never blocks the four-life report", () => {
  assert.match(source, /前四世報告不受影響/);
  assert.match(source, /不會再從帳戶舊資料或其他報告自動補算/);
  assert.match(source, /no longer falls back to old account data or another report/);
  assert.match(source, /只作弱旁證/);
  assert.match(source, /not promoted into a definite conclusion/);
});
