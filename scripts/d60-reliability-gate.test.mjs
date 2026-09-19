import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const gate = await readFile(new URL("../src/components/d60-reliability-gate.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../src/components/specialist-system-page.tsx", import.meta.url), "utf8");
const workflow = await readFile(new URL("../.github/workflows/build.yml", import.meta.url), "utf8");
const netlify = await readFile(new URL("../netlify.toml", import.meta.url), "utf8");

test("D60 reliability gate is wired on the Indian specialist page and not merged from the stale PR", () => {
  assert.match(page, /D60ReliabilityGate/);
  assert.match(page, /id === "indian"/);
  assert.match(page, /timeUnknown/);
  assert.doesNotMatch(page, /<D60KarmaSection /);
});

test("confirmation is bound to a birth fingerprint that includes time, timezone and place", () => {
  assert.match(gate, /function birthKey\(birth: D60GateBirth\)/);
  assert.match(gate, /birth.city.timezone, birth.city.latitude, birth.city.longitude/);
  assert.match(gate, /setConfirmedKey\(""\)/);
  assert.match(gate, /setState\("idle"\)/);
  assert.match(gate, /}, \[key\]\);/);
  assert.match(gate, /confirmedKey !== key/);
  assert.match(gate, /data-d60-minute-gate/);
  assert.match(gate, /data-d60-confirmed-record/);
  assert.match(gate, /padStart\(2, "0"\)\}:\$\{String\(reportBirth.minute\).padStart\(2, "0"\)/);
});

test("after minute confirmation D60 is shown only when stable; unstable or error is withheld; never rectify time", () => {
  assert.match(gate, /signAt\(-2\) === base && signAt\(2\) === base/);
  assert.match(gate, /data-d60-withheld/);
  assert.match(gate, /不作判定|不作判断|WITHHELD/);
  assert.match(gate, /不用 D60 反向考時|不用 D60 反向考时|not used to rectify/);
  assert.match(gate, /state === "unstable" \|\| state === "error"/);
  assert.match(gate, /state === "unstable" \? copy\.unstable : copy\.error/);
  assert.match(gate, /return <D60KarmaSection variant="standalone" reportBirth=\{reportBirth\} \/>/);
  assert.doesNotMatch(gate, /仍輸出 D60 盤面|still generated as weak supporting evidence/);
  assert.doesNotMatch(gate, /Astronomy Engine formula change|rectifyBirth|suggestBetterMinute/);
});

test("Astronomy Engine, Lahiri, Ascendant and D60 segment formulas stay local copies, not a new engine", () => {
  assert.match(gate, /astronomy-engine@2.1.19/);
  assert.match(gate, /function lahiriAyanamsa/);
  assert.match(gate, /function tropicalAscendant/);
  assert.match(gate, /function d60Sign/);
  assert.match(gate, /\(lon % 30\) \/ 0.5/);
  assert.match(gate, /SiderealTime/);
});

test("Engine suite is required and archived Netlify keeps compatibility functions without rebuilding", () => {
  assert.match(workflow, /name: Engine suite/);
  assert.doesNotMatch(workflow, /continue-on-error:\s*true/);
  assert.doesNotMatch(workflow, /Engine suite \(observe\)/);
  assert.match(netlify, /command = "npm run build"/);
  assert.match(netlify, /functions = "netlify\/functions"/);
  assert.match(netlify, /ignore = "exit 0"/);
});
