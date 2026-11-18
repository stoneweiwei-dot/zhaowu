import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../src/components/indian-astrology-page.tsx", import.meta.url), "utf8");
const logger = await readFile(new URL("../src/lib/indian-astrology/d60-precision-log.ts", import.meta.url), "utf8");

test("both Indian D60 views use explicit minute confirmation; unknown times stay excluded", () => {
  assert.match(page, /birth && !birth.timeUnknown && effectivePrecision === "minute"/);
  assert.equal((page.match(/<D60ReliabilityGate precision="minute"/g) ?? []).length, 2);
  assert.match(page, /birth\?\.timeUnknown \? "unknown" : precision/);
});

test("logger has no transport, tracking, birth data, or UI dependencies", () => {
  assert.doesNotMatch(logger, /\b(import|fetch|XMLHttpRequest|sendBeacon|cookie|document|navigator|console)\b/);
  assert.doesNotMatch(logger, /\b(name|email|year|month|day|hour|city|latitude|longitude|reportBirth)\b/);
});
