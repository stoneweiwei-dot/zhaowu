import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/owner-devices-manager.tsx", import.meta.url), "utf8");

test("device-list errors do not discard the independently verified password session", () => {
  assert.match(source, /Promise\.allSettled\(\[\s*listOwnerDevices\(\),\s*readOwnerSessionKind\(\)/);
  assert.match(source, /setKind\(sessionResult\.status === "fulfilled" \? sessionResult\.value : null\)/);
  assert.match(source, /deviceResult\.status === "fulfilled"/);
  assert.doesNotMatch(source, /Promise\.all\(\[listOwnerDevices\(\), readOwnerSessionKind\(\)\]\)/);
});

test("the device page never mistakes failed loading for an empty list or an unknown session for a device session", () => {
  assert.match(source, /devices && !deviceLoadFailed/);
  assert.match(source, /kind === "device"/);
  assert.match(source, /kind === null/);
  assert.match(source, /kind === "device"[\s\S]*kind === null[\s\S]*setLabel/);
  assert.match(source, /onClick=\{\(\) => void refresh\(\)\}/);
});
