import { expect, test, type Page } from "@playwright/test";

const BIRTH = {
  year: 1988,
  month: 10,
  day: 4,
  hour: 4,
  minute: 40,
  timeUnknown: false,
  gender: "male",
  relation: "unset",
  city: {
    name: "Sanming",
    country: "China",
    display: "Sanming, China",
    timezone: "Asia/Shanghai",
    latitude: 26.2639,
    longitude: 117.6389,
  },
  liveCity: null,
  ziPolicy: "midnight",
  useTrueSolar: true,
};

async function makeAppOfflineSafe(page: Page) {
  await page.route("**/rest/v1/**", (route) =>
    route.fulfill({ status: 503, body: "offline-test" }),
  );
}

async function seed(page: Page, language: "ko" | "hi") {
  await page.addInitScript(({ birth, language }) => {
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify(birth));
    localStorage.setItem("zhaowu.display-language", language);
  }, { birth: BIRTH, language });
}

async function englishLeakSamples(page: Page) {
  return page.locator(".zhaowu-focused-report").evaluate((root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const leaks: string[] = [];
    let node: Node | null = walker.nextNode();
    while (node) {
      const value = (node.nodeValue ?? "").replace(/\s+/g, " ").trim();
      const words = value.match(/[A-Za-z]{3,}/g) ?? [];
      const technicalOnly = /^(?:ZHAOWU|STONE|BaZi|D60|Asia\/Shanghai|Sanming(?:, China)?)$/i.test(value);
      if (!technicalOnly && words.length >= 3) leaks.push(value);
      node = walker.nextNode();
    }
    return [...new Set(leaks)].slice(0, 12);
  });
}

for (const config of [
  {
    language: "ko" as const,
    question: "이 일을 계속해야 할까요, 아니면 떠나야 할까요?",
    analyse: "이 질문 분석하기",
    full: "전체 분석 보기",
    title: "전체 분석",
  },
  {
    language: "hi" as const,
    question: "क्या मुझे यह नौकरी जारी रखनी चाहिए या छोड़ देनी चाहिए?",
    analyse: "इस प्रश्न का विश्लेषण करें",
    full: "पूरा विश्लेषण देखें",
    title: "आपका पूरा विश्लेषण",
  },
]) {
  test(`${config.language} guest report reaches the full-analysis view without core English leakage`, async ({ page }) => {
    await makeAppOfflineSafe(page);
    await seed(page, config.language);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#analysis-question")).toBeVisible();
    await page.locator("#analysis-question").fill(config.question);
    const analyse = page.getByRole("button", { name: config.analyse, exact: true });
    await expect(analyse).toBeVisible();
    await analyse.click();

    await expect(page.locator("#result")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("[data-primary-answer]")).toBeVisible();
    await expect(page.locator(".zhaowu-result-primary")).toHaveText(config.full);
    await page.locator(".zhaowu-result-primary").click();

    const report = page.locator(".zhaowu-focused-report");
    await expect(report).toBeVisible({ timeout: 15_000 });
    await expect(report.locator("#focused-report-title")).toHaveText(config.title);
    expect(await englishLeakSamples(page)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}
