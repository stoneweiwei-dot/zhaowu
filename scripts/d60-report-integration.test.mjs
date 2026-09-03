import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../src/components/d60-karma-section.tsx", import.meta.url), "utf8");
const route = fs.readFileSync(new URL("../src/routes/yizhangjing.tsx", import.meta.url), "utf8");

test("D60 reuses saved birth data and no longer exposes a second customer input form", () => {
  assert.match(source, /useCurrentUserState/);
  assert.match(source, /user\?\.birthData/);
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

test("D60 remains an auxiliary cross-check and never blocks the four-life report", () => {
  assert.match(source, /前四世報告不受影響/);
  assert.match(source, /只作弱旁證/);
  assert.match(source, /not promoted into a definite conclusion/);
});
