import { expect, test, type Page } from "@playwright/test";

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) =>
    route.fulfill({ status: 503, body: "offline-test" }),
  );
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

const LANGUAGE_ORDER = ["English", "繁體", "简体"];
const LANGUAGE_SWITCHES = [
  { aria: "English", lang: "en" },
  { aria: "繁體中文", lang: "zh-Hant" },
  { aria: "简体中文", lang: "zh-Hans" },
] as const;

test.describe("iPhone Safari display-language contract", () => {
  test("fresh visit defaults to Traditional Chinese, keeps approved languages and exposes only the owner login entry", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript(() => {
      localStorage.removeItem("zhaowu.display-language");
      localStorage.removeItem("zhaowu.locale");
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(page.getByRole("button", { name: "繁體中文", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "简体中文", exact: true })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "日本語", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "한국어", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "हिन्दी", exact: true })).toHaveCount(0);
    await expect(page.locator('[data-owner-login-entry="true"]')).toHaveCount(1);
    await expect(page.getByRole("link", { name: "站主登入", exact: true })).toHaveAttribute("href", "/login");
    await expect(page.locator(".zhaowu-header-login")).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("zh-Hant");

    const labels = await page.locator(".site-lang-button").evaluateAll((nodes) =>
      nodes.map((node) => node.textContent?.trim() ?? ""),
    );
    expect(labels).toEqual(LANGUAGE_ORDER);
    await expectNoHorizontalOverflow(page);
  });

  test("the three public language controls (English, 繁體, 简体) switch cleanly without breaking the iPhone viewport", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    for (const { aria, lang } of LANGUAGE_SWITCHES) {
      const button = page.getByRole("button", { name: aria, exact: true });
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(lang);
      await expect(page.locator("#analysisForm")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test("saved retired language preferences (ja/ko/hi) fold to Traditional Chinese", async ({ page }) => {
    await makeAppOfflineSafe(page);
    for (const retired of ["ko", "hi", "ja"] as const) {
      await page.addInitScript((value) => {
        localStorage.setItem("zhaowu.display-language", value);
      }, retired);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("button", { name: "繁體中文", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("zh-Hant");
      await page.evaluate(() => localStorage.removeItem("zhaowu.display-language"));
    }
  });

  test("a saved Simplified Chinese preference is honoured before hydration", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript(() => localStorage.setItem("zhaowu.display-language", "zh-Hans"));
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "简体中文", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("zh-Hans");
  });

  // Owner 2026-10-02: Simplified must be a real third language, not Traditional text behind a button.
  // These characters exist only in Traditional script, so any hit is Traditional text served to a Simplified reader.
  const TRADITIONAL_ONLY = "個們這來說為與對體當時麼開關運氣學會國點應區義樣愛過還後從見讓題無問門間車長總經結構現實證動係觀產進選專業張計圖書單據認識語讀師機發覺紀錄許請謝歲歷興藝覆陽陰靈壇鐘齡願衝處標準備顧慮價際線訊費變壞醫療衛險護報導啟廣積極項決議級終續統織試類詳細種稱釋範圍態確權擇調整額組";
  test.describe("Simplified Chinese route scan", () => {
    // Keep this cheap: one test, no trace capture, per-route failures reported together.
    test.use({ trace: "off" });
    test("Simplified Chinese shows no Traditional-only text on key routes", async ({ page }) => {
      test.setTimeout(150_000);
      await makeAppOfflineSafe(page);
      await page.addInitScript(() => localStorage.setItem("zhaowu.display-language", "zh-Hans"));
      const report: string[] = [];
      for (const route of ["/", "/knowledge", "/numerology", "/fun-tests", "/sky-events"]) {
        try {
          await page.goto(route, { waitUntil: "domcontentloaded", timeout: 25_000 });
          await page.waitForTimeout(1200);
        } catch (error) {
          report.push(`${route}: load failed (${String(error).slice(0, 80)})`);
          continue;
        }
        const lang = await page.evaluate(() => document.documentElement.lang);
        if (lang !== "zh-Hans") report.push(`${route}: html lang is ${lang}`);
        const leaks = await page.evaluate((trad) => {
          const out: string[] = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const parent = (node as Text).parentElement;
            if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;
            const text = node.textContent ?? "";
            const hit = [...text].filter((ch) => trad.includes(ch));
            if (hit.length) out.push(`[${[...new Set(hit)].join("")}] ${text.trim().slice(0, 50)}`);
          }
          return out.slice(0, 12);
        }, TRADITIONAL_ONLY);
        for (const leak of leaks) report.push(`${route}: ${leak}`);
      }
      expect(report, "Traditional-only text while 简体 is selected").toEqual([]);
    });
  });
});
