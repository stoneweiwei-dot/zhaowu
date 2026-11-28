import { test, expect } from "@playwright/test";
import { join } from "node:path";

test("owner can recover a missing policy and publish a theme with confirmation", async ({ page, baseURL }) => {
  test.setTimeout(180_000);
  const origin = new URL(baseURL!).origin;
  let available = false;
  let stored = "sydney-jacaranda";
  let outcome: "success" | "error" | "timeout" = "success";
  const allowed = ["pastel-koi"];
  let writes = 0;
  let delayRead = false;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.display-language", "zh-Hant");
    localStorage.setItem("zhaowu.intro.seen-at.public.v2", String(Date.now()));
  });
  await page.route("**/*", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin && !/^\/(api\/|mock-supabase\/)/.test(url.pathname)) return route.continue();
    if (url.origin !== origin) return route.abort();
    if (url.searchParams.get("view") === "site-skin") {
      if (delayRead) { await new Promise(resolve => setTimeout(resolve, 16_500)); }
      return route.fulfill({ json: available ? { skin: stored, allowedSkins: allowed, settingsAvailable: true } : { skin: "solar-auto", settingsAvailable: false } });
    }
    if (url.pathname === "/api/owner-session") return route.fulfill({ json: { authenticated: true } });
    if (url.pathname === "/api/owner-data" && request.method() === "POST" && request.postDataJSON()?.action === "site-skin.publish") {
      writes++;
      expect(request.postDataJSON().allowedSkins).toEqual(allowed);
      if (outcome === "timeout") {
        // The server finishes after the browser's actual deadline.
        await new Promise(resolve => setTimeout(resolve, 16_500));
        return route.fulfill({ status: 504, json: { ok: false } });
      }
      if (outcome === "error") return route.fulfill({ status: 503, json: { ok: false } });
      stored = request.postDataJSON().skin;
      return route.fulfill({ json: { ok: true, skin: stored, allowedSkins: allowed } });
    }
    return route.fulfill({ json: url.pathname.includes("/rest/v1/") ? [] : { ok: true, reports: [], items: [] } });
  });
  const manager = page.locator("[data-owner-theme-skins]");
  const seasons = manager.locator("[data-sydney-seasons]");
  const button = (id: string) => seasons.locator(`[data-owner-theme-card="${id}"] button[aria-pressed]`);
  async function shot(name: string) {
    if (!process.env.THEME_SHOTS_DIR) return;
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(process.env.THEME_SHOTS_DIR, name + "-390.png"), animations: "disabled" });
  }
  await page.goto("/account?view=themes", { waitUntil: "commit" });
  await expect(manager.getByRole("alert")).toContainText("無法讀取", { timeout: 60_000 });
  expect(writes).toBe(0);
  delayRead = true;
  const retry = manager.getByRole("button", { name: "重試", exact: true });
  await retry.click();
  await expect(retry).toBeDisabled();
  await expect(retry).toBeEnabled({ timeout: 25_000 });
  await expect(manager.getByRole("alert")).toContainText("無法讀取");
  delayRead = false;
  available = true;
  await manager.getByRole("button", { name: "重試", exact: true }).click();
  const spring = button("sydney-jacaranda");
  const summer = button("southern-summer");
  const autumn = button("southern-autumn");
  await expect(spring).toBeDisabled();
  await expect(spring).toContainText("使用中");
  await expect(summer).toHaveText("套用");
  await seasons.evaluate(el => el.scrollIntoView({ behavior: "instant" }));
  await shot("after-theme-manager");
  await summer.click();
  await expect(summer).toContainText("使用中");
  await expect(manager.getByRole("status")).toContainText("已同步");
  await shot("after-apply-success");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(summer).toContainText("使用中");
  outcome = "error";
  await autumn.click();
  await expect(autumn).toHaveText("失敗，重試");
  await seasons.evaluate(el => el.scrollIntoView({ behavior: "instant" }));
  await shot("after-apply-error-retry");
  outcome = "timeout";
  await autumn.click();
  await expect(autumn).toHaveText("套用中…");
  await expect(autumn).toHaveText("失敗，重試", { timeout: 25_000 });
  await expect(manager.getByRole("alert")).toContainText("逾時");
  outcome = "success";
  await autumn.click();
  await expect(autumn).toContainText("使用中");
  expect(writes).toBe(4);
  await page.goto("/account", { waitUntil: "domcontentloaded" });
  const overview = page.locator("[data-console-overview]");
  await expect(overview).toBeVisible();
  await overview.locator("summary").click();
  await expect(overview.getByRole("button", { name: "主題皮膚" })).toBeVisible();
  await expect(overview.locator('a[target="_blank"]')).toHaveCount(0);
  await overview.evaluate(el => el.scrollIntoView({ behavior: "instant" }));
  await shot("after-admin-overview");
});
