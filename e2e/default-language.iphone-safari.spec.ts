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

const LANGUAGE_ORDER = ["English", "繁體", "한국어", "हिन्दी"];
const LANGUAGE_SWITCHES = [
  { aria: "English", lang: "en" },
  { aria: "繁體中文", lang: "zh-Hant" },
  { aria: "한국어", lang: "ko" },
  { aria: "हिन्दी", lang: "hi" },
] as const;

test.describe("iPhone Safari display-language contract", () => {
  test("fresh visit defaults to Traditional Chinese and keeps the approved four-language order", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript(() => {
      localStorage.removeItem("zhaowu.display-language");
      localStorage.removeItem("zhaowu.locale");
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#analysisForm")).toBeVisible();
    await expect(page.getByRole("button", { name: "繁體中文", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "简体中文", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "日本語", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "登入", exact: true })).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("zh-Hant");

    const labels = await page.locator(".site-lang-button").evaluateAll((nodes) =>
      nodes.map((node) => node.textContent?.trim() ?? ""),
    );
    expect(labels).toEqual(LANGUAGE_ORDER);
    await expectNoHorizontalOverflow(page);
  });

  test("all four public language controls switch cleanly without breaking the iPhone viewport", async ({ page }) => {
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

  test("a saved Hindi preference is restored instead of being overwritten by the Traditional Chinese default", async ({ page }) => {
    await makeAppOfflineSafe(page);
    await page.addInitScript(() => {
      localStorage.setItem("zhaowu.display-language", "hi");
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("button", { name: "हिन्दी", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("hi");
    await expect(page.locator("#analysisForm")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("retired Simplified Chinese and Japanese preferences fold to Traditional Chinese", async ({ page }) => {
    await makeAppOfflineSafe(page);
    for (const retired of ["zh-Hans", "ja"] as const) {
      await page.addInitScript((value) => {
        localStorage.setItem("zhaowu.display-language", value);
      }, retired);
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("button", { name: "繁體中文", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("zh-Hant");
      await page.evaluate(() => localStorage.removeItem("zhaowu.display-language"));
    }
  });
});
