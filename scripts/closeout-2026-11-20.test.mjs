import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("..", import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), "utf8");
const bytes = (rel) => readFileSync(new URL(rel, root));

function pngSize(buf) {
  assert.equal(buf.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "not a PNG file");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test("terms clause 4 prices in AUD, matching the checkout button", () => {
  const legal = read("src/lib/legal-content.ts");
  assert.ok(legal.includes("付費報告以澳幣（AUD）標價"), "zh-Hant clause 4 must say AUD");
  assert.ok(legal.includes("付费报告以澳币（AUD）标价"), "zh-Hans clause 4 must say AUD");
  assert.ok(legal.includes("Paid reports are priced in Australian dollars (AUD)"), "en clause 4 must say AUD");
  assert.ok(!legal.includes("以美元（USD）標價"), "zh-Hant USD wording must be gone");
  assert.ok(!legal.includes("以美元（USD）标价"), "zh-Hans USD wording must be gone");
  assert.ok(!legal.includes("priced in US dollars (USD)"), "en USD wording must be gone");
  assert.match(read("src/lib/legal-meta.ts"), /LEGAL_LAST_UPDATED = "2026-11-20"/);
});

test("free page carries the three fixed lines, bazi only", () => {
  const unlock = read("src/components/bazi-reading-unlock.tsx");
  assert.ok(unlock.includes("data-free-summary-lines"), "three lines must be marked");
  assert.ok(unlock.includes("免費看到什麼：基本命盤、四柱、兩段核心試讀、大運起止年份。"), "line 1 zh-Hant");
  assert.ok(unlock.includes("多看什麼：完整解讀、詳細時運（大運流年）、連續追問。"), "line 2 zh-Hant");
  assert.ok(unlock.includes("單次付費，不自動續費。"), "line 3 zh-Hant");
  assert.ok(unlock.includes("deepPrice"), "line 2 price must come from the same price as the button");
  assert.ok(!unlock.includes("六系合集"), "free page must not push the six-system bundle");
});

test("free summary has an optional email field, never blocking", () => {
  assert.ok(existsSync(new URL("src/components/free-summary-email.tsx", root)), "email component must exist");
  const field = read("src/components/free-summary-email.tsx");
  assert.ok(field.includes("data-free-summary-email"), "email field must be marked");
  assert.ok(field.includes("把這份概要寄到信箱（選填）"), "label must match the draft");
  assert.ok(field.includes("寄給我"), "button must match the draft");
  assert.ok(field.includes("信箱已記在這台裝置上。"), "success copy must say saved, never sent");
  assert.ok(!field.includes("已寄出"), "success copy must never claim an email was sent");
  const form = read("src/components/analysis-form.tsx");
  assert.ok(form.includes('import { FreeSummaryEmail } from "@/components/free-summary-email"'), "form must import the field");
  assert.ok(form.includes("<FreeSummaryEmail locale={locale} />"), "form must render the field under the free summary");
});

test("icons are generated from scripts/home-icons, never edited in public/", () => {
  // vite build regenerates every public icon from these sources (see
  // vite.config.ts zhaowu-generated-public-assets): editing public/icons
  // directly is silently reverted by the next build. The 192/512 swap
  // itself is binary and cannot be pushed through this tooling, so it is
  // verified by hash at push time, not by this test.
  const writer = read("scripts/write-home-icons.mjs");
  assert.ok(writer.includes("home-icons/zhaowu-gourd-wordmark-r113-192.png"), "192 source must be wired");
  assert.ok(writer.includes("home-icons/zhaowu-gourd-wordmark-r113-512.png"), "512 source must be wired");
  assert.ok(writer.includes('["public/icons/zhaowu-gourd-wordmark-r113-192.png",192]'), "192 must regenerate the public icon");
  assert.ok(writer.includes('["public/icons/zhaowu-gourd-wordmark-r113-512.png",512]'), "512 must regenerate the public icon");
  assert.ok(existsSync(new URL("scripts/home-icons/zhaowu-gourd-wordmark-r113-192.png", root)), "192 source must exist");
  assert.ok(existsSync(new URL("scripts/home-icons/zhaowu-gourd-wordmark-r113-512.png", root)), "512 source must exist");
  assert.deepEqual(pngSize(bytes("scripts/home-icons/zhaowu-gourd-wordmark-r113-192.png")), { width: 192, height: 192 });
  assert.deepEqual(pngSize(bytes("scripts/home-icons/zhaowu-gourd-wordmark-r113-512.png")), { width: 512, height: 512 });
});
