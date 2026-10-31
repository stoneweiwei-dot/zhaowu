import test from "node:test";
import assert from "node:assert/strict";
import { watchReportAccess } from "../src/lib/report-access-watch.ts";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pending = { level: "quick", pending: true, owner: false };
const paid = { level: "system", pending: false, owner: false };

test("pending payment is rechecked until the server confirms access", { timeout: 2000 }, async () => {
  let calls = 0;
  const seen = [];
  let done;
  const completed = new Promise((resolve) => { done = resolve; });
  const stop = watchReportAccess(async () => ++calls === 1 ? pending : paid, (value) => { seen.push(value.level); if (value.level === "system") done(); }, () => assert.fail("unexpected error"), { intervalMs: 1, maxAttempts: 5 });
  await completed;
  await wait(10);
  stop();
  assert.deepEqual(seen, ["quick", "system"]);
  assert.equal(calls, 2);
});

test("a still-pending payment is not granted and retries are bounded", { timeout: 2000 }, async () => {
  let calls = 0;
  const seen = [];
  let done;
  const completed = new Promise((resolve) => { done = resolve; });
  const stop = watchReportAccess(async () => { calls++; return pending; }, (value) => { seen.push(value.level); if (seen.length === 3) done(); }, () => assert.fail("unexpected error"), { intervalMs: 1, maxAttempts: 3 });
  await completed;
  await wait(10);
  stop();
  assert.equal(calls, 3);
  assert.deepEqual(seen, ["quick", "quick", "quick"]);
});

test("unmount while a verification is in flight prevents updates and retries", async () => {
  let finish;
  let callbacks = 0;
  const stop = watchReportAccess(() => new Promise((resolve) => { finish = resolve; }), () => callbacks++, () => callbacks++, { intervalMs: 1 });
  stop();
  finish(pending);
  await wait(10);
  assert.equal(callbacks, 0);
});
