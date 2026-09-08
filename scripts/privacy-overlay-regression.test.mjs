import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sharedBirth = await readFile(new URL("../src/lib/shared-birth.ts", import.meta.url), "utf8");
const authProvider = await readFile(new URL("../src/lib/auth/provider.tsx", import.meta.url), "utf8");
const viewerCss = await readFile(new URL("../src/image-viewer.css", import.meta.url), "utf8");
const resultView = await readFile(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
const shareCard = await readFile(new URL("../src/lib/report/share-card.ts", import.meta.url), "utf8");
const { customerCopy } = await import("../src/lib/report/customer-copy.ts");

test("logged-out visitors cannot read or persist a previous account birth record", () => {
  assert.match(sharedBirth, /activeSharedBirthUserId/);
  assert.match(sharedBirth, /typeof window === "undefined" \|\| !activeSharedBirthUserId/);
  assert.match(sharedBirth, /SHARED_BIRTH_OWNER_KEY/);
  assert.match(sharedBirth, /localStorage\.removeItem\(SHARED_BIRTH_STORAGE_KEY\)/);
  assert.match(authProvider, /setSharedBirthAccessUser\(active\?\.user\.id \?\? null\)/);
});

test("image viewer is fully opaque so the report beneath cannot ghost through", () => {
  assert.match(viewerCss, /\.zhaowu-image-viewer\s*\{[\s\S]*background:\s*#100e0c/);
  assert.match(viewerCss, /z-index:\s*10000/);
  assert.match(viewerCss, /opacity:\s*1/);
  assert.doesNotMatch(viewerCss, /\.zhaowu-image-viewer\s*\{[\s\S]*?background:\s*rgba\(18,\s*14,\s*10,\s*0\.94\)/);
});

test("customer result and share card strip the screenshot's internal timing trace", () => {
  const raw = "2026 屬於可做、但要挑月份的年份。較順的窗口：9月、11月、1月。較需要保守安排：3月、10月。歲運作用鏈：大運乙丑 → 流年丙午 → 流月丁酉；大運層：辰丑相破（牽動年柱辰）；流年層：丑午六害（牽動大運乙丑丑）；流月層：酉酉自刑（牽動月柱酉） 2027 屬於可做、但要挑月份的年份。較順的窗口：9月、4月、8月。較需要保守安排：10月、3月。歲運作用鏈：大運乙丑 → 流年丁未 → 流月己酉；流年層：丑未六沖（牽動大運乙丑丑） 排序依序核對原局、大運、流年、流月；支合只先論牽制，支沖刑害只先論引動與摩擦，不把任何單一關係當作結果保證。";
  const cleaned = customerCopy(raw);
  assert.match(cleaned, /2026 屬於可做/);
  assert.match(cleaned, /2027 屬於可做/);
  assert.doesNotMatch(cleaned, /歲運作用鏈|大運層|流年層|流月層|排序依序核對原局|結果保證/);
  assert.match(resultView, /customerDirectAnswer/);
  assert.match(shareCard, /customerCopy\(text\)/);
});
