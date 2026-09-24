import { expect, test } from "@playwright/test";

const PRODUCTION = "https://stone-zhaowu-official.vercel.app/";

test("r191 is visibly rendered on real Production in iPhone Safari", async ({ page }) => {
  test.setTimeout(90_000);

  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.display-language", "zh-Hant");
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify({
      year: 1988,
      month: 10,
      day: 4,
      hour: 4,
      minute: 40,
      timeUnknown: false,
      gender: "male",
      relation: "unset",
      ziPolicy: "midnight",
      useTrueSolar: true,
      city: {
        name: "Sanming",
        display: "Sanming, Fujian, China",
        country: "CN",
        timezone: "Asia/Shanghai",
        latitude: 26.27,
        longitude: 117.65
      }
    }));
  });

  await page.goto(PRODUCTION, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await expect(page.getByRole("button", { name: "繁體中文", exact: true })).toHaveAttribute("aria-pressed", "true");

  const fullDetails = page.locator("#bazi .zhaowu-bazi-full-details");
  await expect(fullDetails).toBeVisible();
  if (!(await fullDetails.getAttribute("open"))) {
    await fullDetails.locator(":scope > summary").click();
  }

  const report = page.locator("[data-unified-birth-report]");
  await expect(report).toBeVisible();

  const structureRule = report.getByText(
    "這份命書不把五行湊平均，也不按「缺什麼補什麼」處理；先看月令、格局、病藥、流通與承載，偏向本身不是缺陷。",
    { exact: true },
  );
  const stemRule = report.getByText(
    "十干沒有高下。天干圖像只是把功能翻成容易理解的畫面，不替代整局判斷。",
    { exact: true },
  );
  const comicRule = report.getByText(
    "十干無高下；這只是文化象意的白話翻譯，不用來補缺、定吉凶，也不替代整局判斷。",
    { exact: true },
  );

  await expect(structureRule).toBeVisible();
  await expect(stemRule).toBeVisible();
  await expect(comicRule).toBeVisible();

  console.log("R191_PROD_STRUCTURE:", await structureRule.textContent());
  console.log("R191_PROD_STEMS:", await stemRule.textContent());
  console.log("R191_PROD_COMIC:", await comicRule.textContent());

  await page.locator("#analysis-question").fill("我為何而生？我的使命是什麼？");
  await page.getByRole("button", { name: "開始分析這個問題", exact: true }).click();

  const primary = page.locator("[data-primary-answer]");
  await expect(primary).toBeVisible({ timeout: 45_000 });
  await expect(primary).toContainText("命理不能證明「上天為什麼安排你出生」");
  await expect(primary).toContainText("也不替你指定唯一使命");
  await expect(primary).toContainText("比追求五行平均或「缺什麼補什麼」更有意義");
  console.log("R191_PROD_PURPOSE:", (await primary.textContent())?.trim());

  await page.getByRole("button", { name: "查看補充重點", exact: true }).click();
  const narrative = page.locator(".zhaowu-report-narrative");
  await expect(narrative).toBeVisible({ timeout: 45_000 });
  const evidence = narrative.locator(".zhaowu-report-narrative__evidence");
  if (!(await evidence.getAttribute("open"))) {
    await evidence.locator(":scope > summary").click();
  }
  await expect(evidence).toContainText("題名與畫面只能從既有分析往下翻譯");
  await expect(evidence).toContainText("也不能反過來用圖像推格局、喜用或吉凶");
  console.log("R191_PROD_IMAGERY:", (await evidence.textContent())?.replace(/\s+/g, " ").trim());

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: "test-results/r191-production-visual.png", fullPage: true });
});
