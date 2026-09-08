import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const resultView = await readFile(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
const brand = await readFile(new URL("../src/components/brand-seal.tsx", import.meta.url), "utf8");
const design = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");

test("free direct-answer card delivers the engine's question-specific answer without generic template replacement", () => {
  assert.match(resultView, /customerDirectAnswer\(question, reading\.directAnswer\)/);
  assert.doesNotMatch(resultView, /buildFreeDirectAnswer/);
});

test("header reuses the owner-approved green-gold lotus instead of an invented vector", () => {
  assert.match(brand, /OFFICIAL_MARK = "\/apple-touch-icon-v3\.png"/);
  assert.match(brand, /<img className="zhaowu-brand-seal__image"/);
  assert.doesNotMatch(brand, /<svg|zhaowu-brand-seal__canopy|__character/);
  assert.match(design, /zhaowu-brand-seal__image/);
  assert.doesNotMatch(design, /zhaowu-brand-seal__canopy/);
});

test("r69 almanac refinement loads after earlier site locks", () => {
  const legacy = main.indexOf("./site-ux-r63-lock.css");
  const r69 = main.indexOf("./daily-almanac-r69.css");
  assert.ok(legacy >= 0 && r69 > legacy);
});
