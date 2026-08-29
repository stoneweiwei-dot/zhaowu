import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import {
  SPECIALIST_HISTORY_KEY,
  clearSpecialistHistory,
  deleteSpecialistHistory,
  readSpecialistHistory,
  saveSpecialistHistory,
} from "../src/lib/specialist-history.ts";

function memoryStorage() {
  const data = new Map();
  return {
    get length() { return data.size; },
    clear() { data.clear(); },
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    key(index) { return [...data.keys()][index] ?? null; },
    removeItem(key) { data.delete(key); },
    setItem(key, value) { data.set(key, String(value)); },
  };
}

function draft(kind, title) {
  return {
    kind,
    locale: "zh-Hant",
    sourcePath: kind === "qizheng" ? "/qizheng" : kind === "ziwei" ? "/ziwei" : "/yizhangjing",
    title,
    inputSummary: "1988-10-04 · 04:40",
    sections: [{ title: "命局性情", body: "完整白話內容" }],
    closing: "結語",
  };
}

test("specialist reports save newest first and can be removed", () => {
  const storage = memoryStorage();
  const first = saveSpecialistHistory({ ...draft("qizheng", "七政報告"), id: "one", createdAt: "2026-08-29T01:00:00.000Z" }, storage);
  const second = saveSpecialistHistory({ ...draft("ziwei", "紫微報告"), id: "two", createdAt: "2026-08-29T02:00:00.000Z" }, storage);
  assert.equal(first?.id, "one");
  assert.deepEqual(readSpecialistHistory(storage).map((entry) => entry.id), ["two", "one"]);
  deleteSpecialistHistory("two", storage);
  assert.deepEqual(readSpecialistHistory(storage).map((entry) => entry.id), ["one"]);
  clearSpecialistHistory(storage);
  assert.equal(storage.getItem(SPECIALIST_HISTORY_KEY), null);
});

test("malformed or empty stored reports never break the history page", () => {
  const storage = memoryStorage();
  storage.setItem(SPECIALIST_HISTORY_KEY, "not json");
  assert.deepEqual(readSpecialistHistory(storage), []);
  storage.setItem(SPECIALIST_HISTORY_KEY, JSON.stringify([{ id: "bad", kind: "unknown" }]));
  assert.deepEqual(readSpecialistHistory(storage), []);
});

test("customer reflection comic does not expose gallery mechanics or tiny reference icons", async () => {
  const component = await readFile(new URL("../src/components/mind-advice-comic.tsx", import.meta.url), "utf8");
  const builder = await readFile(new URL("../src/lib/report/mind-advice-comic.ts", import.meta.url), "utf8");
  assert.doesNotMatch(component, /Gallery reference|zhaowu-mind-comic-gallery|galleryAssetPath/);
  assert.doesNotMatch(builder, /交叉引用圖庫|mountain-emblem|galleryMeaning/);
});
