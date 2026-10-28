import test from "node:test";
import assert from "node:assert/strict";
import { pendingManualChannels } from "../src/lib/owner-autopublish-client.ts";

test("skipped manual tasks stay out of the pending list", () => {
  const item = { status: "skipped", results: { xiaohongshu: { manual: true } } };
  assert.deepEqual(pendingManualChannels(item), []);
  assert.deepEqual(pendingManualChannels({ ...item, status: "manual" }), ["xiaohongshu"]);
  assert.deepEqual(pendingManualChannels({ ...item, status: "published", results: { ...item.results, manualDone: true } }), []);
});
