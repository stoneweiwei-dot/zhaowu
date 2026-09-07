import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const resultView = await readFile(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
const brand = await readFile(new URL("../src/components/brand-seal.tsx", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");

test("free direct-answer card delivers the engine's question-specific answer without generic template replacement", () => {
  assert.match(resultView, /customerDirectAnswer\(question, reading\.directAnswer\)/);
  assert.doesNotMatch(resultView, /buildFreeDirectAnswer/);
});

test("header uses one inspectable static owner mark without iPhone crop artefacts", () => {
  assert.match(brand, /const OFFICIAL_MARK = "\/apple-touch-icon\.png"/);
  assert.match(brand, /src=\{OFFICIAL_MARK\}/);
  assert.match(brand, /object-contain/);
  assert.doesNotMatch(brand, /data:image\/jpeg;base64,/);
  assert.doesNotMatch(brand, /<svg[\s>]/);
});

test("r69 almanac refinement loads after earlier site locks", () => {
  const legacy = main.indexOf("./site-ux-r63-lock.css");
  const r69 = main.indexOf("./daily-almanac-r69.css");
  assert.ok(legacy >= 0 && r69 > legacy);
});
