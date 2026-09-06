import assert from "node:assert/strict";
import test from "node:test";
import { pruneSpecialistHistory, saveSpecialistHistory, SPECIALIST_HISTORY_KEY } from "../src/lib/specialist-history.ts";
import { pruneDisposableLocalMedia, runLocalHousekeeping } from "../src/lib/local-housekeeping.ts";

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  get length() {
    return this.map.size;
  }
  key(index) {
    return [...this.map.keys()][index] ?? null;
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
}

const sample = {
  kind: "qizheng",
  locale: "zh-Hant",
  sourcePath: "/qizheng",
  title: "測試紀錄",
  inputSummary: "甲辰年",
  sections: [{ title: "結論", body: "先看這句。" }],
  closing: "完",
};

test("unused specialist history older than 7 days is deleted", () => {
  const storage = new MemoryStorage();
  const now = Date.parse("2026-09-07T00:00:00+10:00");
  saveSpecialistHistory({
    ...sample,
    id: "old-unopened",
    createdAt: "2026-08-20T00:00:00.000Z",
    lastOpenedAt: "2026-08-20T00:00:00.000Z",
  }, storage);
  saveSpecialistHistory({
    ...sample,
    id: "recently-opened",
    createdAt: "2026-08-01T00:00:00.000Z",
    lastOpenedAt: "2026-09-06T00:00:00.000Z",
  }, storage);
  const result = pruneSpecialistHistory(now, storage);
  const kept = JSON.parse(storage.getItem(SPECIALIST_HISTORY_KEY));
  assert.equal(result.removed, 1);
  assert.equal(result.kept, 1);
  assert.equal(kept[0].id, "recently-opened");
});

test("generated media cache older than 7 days is deleted without asking", () => {
  const storage = new MemoryStorage();
  const now = Date.parse("2026-09-07T00:00:00+10:00");
  storage.setItem("zhaowu.visitor.v1", "keep-me");
  storage.setItem("zhaowu.generated.image.1", JSON.stringify({ createdAt: "2026-08-01T00:00:00.000Z" }));
  storage.setItem("zhaowu.media-cache.audio.1", JSON.stringify({ lastOpenedAt: "2026-09-06T00:00:00.000Z" }));
  const result = pruneDisposableLocalMedia(now, storage);
  assert.equal(result.removed, 1);
  assert.equal(storage.getItem("zhaowu.visitor.v1"), "keep-me");
  assert.equal(storage.getItem("zhaowu.generated.image.1"), null);
  assert.ok(storage.getItem("zhaowu.media-cache.audio.1"));
});

test("boot housekeeping returns both buckets", () => {
  const storage = new MemoryStorage();
  const summary = runLocalHousekeeping(Date.now(), storage);
  assert.equal(summary.specialistHistory.removed, 0);
  assert.equal(summary.disposableMedia.removed, 0);
});
