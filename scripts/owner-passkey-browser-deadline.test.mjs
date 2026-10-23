import assert from "node:assert/strict";
import test from "node:test";
import {
  PASSKEY_CEREMONY_TIMEOUT_MS,
  PASSKEY_REQUEST_TIMEOUT_MS,
  runPasskeyWithDeadline,
} from "../src/lib/auth/passkey-deadline.ts";

test("network and biometric deadlines are bounded", () => {
  assert.ok(PASSKEY_REQUEST_TIMEOUT_MS > 0 && PASSKEY_REQUEST_TIMEOUT_MS < PASSKEY_CEREMONY_TIMEOUT_MS);
  assert.ok(PASSKEY_CEREMONY_TIMEOUT_MS <= 60_000);
});

test("successful passkey call resolves without abort", async () => {
  let seenSignal;
  const result = await runPasskeyWithDeadline(async (signal) => {
    seenSignal = signal;
    return "ok";
  }, 100);
  assert.equal(result, "ok");
  assert.equal(seenSignal.aborted, false);
});

test("browser that ignores AbortSignal cannot strand sign-in", async () => {
  let seenSignal;
  await assert.rejects(
    runPasskeyWithDeadline((signal) => {
      seenSignal = signal;
      return new Promise(() => {});
    }, 5),
    /PASSKEY_TIMEOUT/,
  );
  assert.equal(seenSignal.aborted, true);
});

test("a normal authentication rejection is not mislabelled as a timeout", async () => {
  await assert.rejects(
    runPasskeyWithDeadline(async () => { throw new Error("PASSKEY_DEVICE_UNKNOWN"); }, 100),
    /PASSKEY_DEVICE_UNKNOWN/,
  );
});
