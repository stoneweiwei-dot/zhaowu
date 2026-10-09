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

    await expect(page.locator("#birth-form")).toBeVisible();
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
      await expect(page.locator("#birth-form")).toBeVisible();
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
  // Generated from the site's own Traditional↔Simplified tables (src/lib/report/reading-locale.ts), minus forms that
  // legitimately survive in Simplified text (於 著 乾 餘 裡). Do not hand-edit; regenerate from the tables.
  const TRADITIONAL_ONLY = "亂亞併來侶俠倆倉個們倫側偵偽備傳債傷傾僅價儀儉償優兩別刪則剛創劃劍動務勝勞勢匯區參員問啟單嗎嚴國圍園圓圖執堅報場塊塵墳墾壇壓壞壟夠夾奪奮娛婦學實審寫寶將專對導層屬島崗嶺帥師帳帶幣幫幾庫廟張強後徑從復悶惡愛態慣慮憂憫憲憶應懷戰戲戶捨掃揚換損撐擇擊擋擔據擴擺攜攝敗數斷時晉暈暫曉書會東條棄業極構樓標樣橋機橫檔檢權歡歲歸殘殺氣決沒沖況減渦測湯準溝溫滿漢漸潔潤澤澱濕濟濾災為無煉煩熱營爭爾牆牽狀獎獨獲現環產畢畫異當疊療發監盤眾確礎礙禮種稱積穩窩窮筆節範篩簡糧紀約納純級紛細終組結給統綠綱線緣編緩練縣縮縱總繪繼續罰羅義習聯聲職聽脫腦膚臨與興舉華萬葉蓋蕩薑薦藍藝藥處號虧術衛補裝複見規親覺觀觸計訊討訓記訪設許訴診評詞試話該詳認語誠誤說課調談請論諸謂講證識議護讀變讓讚貓負財貨責貴買費資賣賦質賴賺賽贈趕趙跡踐車軟較載輔輕輪輯輸轉辦農這連進運過違遞遠適遲選遺還邊邏郵鄉鄭鄰醞醫釋針銀鋒錄錢錦錯鍵鏈鐘鑑長門閉開間閱關陣陰陸陽隊階際隨險隱雖雜離難雲電霧靜韓響頁頂項順須預領頭額願類顧顯風飛飯飲養館駐駕驗驚體髮鬥鬧魚鮮鳥鳴鵝麗麼點黨齊齡龍";
  test.describe("Simplified Chinese route scan", () => {
    // Keep this cheap: one test, per-route failures reported together in a single assertion.
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
            if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName) || parent.closest(".site-lang-group")) continue;
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
