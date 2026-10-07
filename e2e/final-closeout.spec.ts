import { expect, test, type Page } from "@playwright/test";

// Isolated API fixtures exercise the actual route/components without writing owner data.
async function isolate(page: Page, owner = false) {
  await page.addInitScript(() => {
    localStorage.setItem("zhaowu.display-language", "zh-Hant");
    localStorage.setItem("zhaowu.intro.seen.public.v1", "1");
  });
  await page.route("**/api/owner-session", r => r.fulfill({ json: { authenticated: owner } }));
  await page.route("**/rest/v1/**", r => r.fulfill({ status: 503, body: "offline-test" }));
  await page.route(/ipwho\.is|open-meteo\.com|nominatim|geocoding/, r => r.abort());
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test("flow: birth, single book, answer and restored birth remain usable", async ({ page }) => {
  await isolate(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "命書", exact: true }).click();
  for (const [field, value] of Object.entries({ year: "1988", month: "10", day: "4", hour: "4", minute: "40" })) {
    await page.locator(`#birth-${field}`).fill(value);
  }
  await page.locator("#birth-city").click();
  await page.locator('#birth-city-results [role="option"]').first().click();
  await page.getByRole("button", { name: "保存並生成昭梧命書", exact: true }).click();
  await expect(page.locator("#bazi [data-bazi-chart]")).toBeVisible();
  const pillar = await page.locator('#bazi [data-pillar="year"] strong').textContent();
  await page.locator("#bazi .zhaowu-bazi-full-details > summary").click();
  await expect(page.locator("[data-unified-birth-report]")).toHaveCount(1);
  await expect(page.locator("[data-unified-birth-report]")).toBeVisible();
  await page.locator("#analysis-question").fill("這份工作我應該繼續還是離開？");
  await page.getByRole("button", { name: "開始分析這個問題", exact: true }).click();
  await expect(page.locator("[data-primary-answer]")).toBeVisible();
  await expect(page.locator("[data-next-action]")).toBeVisible();
  await noOverflow(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "命書", exact: true }).click();
  await expect(page.locator('#bazi [data-pillar="year"] strong')).toHaveText(pillar!);
  await page.locator("#bazi .zhaowu-bazi-full-details > summary").click();
  await expect(page.locator("[data-specialist-hub]")).toHaveCount(0);
  await page.getByRole("button", { name: "六大系統", exact: true }).click();
  await expect(page.locator("[data-specialist-node]")).toHaveCount(6);
  await page.locator('[data-specialist-node="western"] a').click();
  await expect(page.locator('[data-report-paywall="western"]')).toBeVisible();
  await expect(page.locator("[data-report-access]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "解鎖 $4.99", exact: true })).toBeVisible();
  await noOverflow(page);
});

test("owner: reports refresh without retired background requests, media stays reachable", async ({ page }) => {
  await isolate(page, true);
  const actions: string[] = [];
  await page.route("**/api/owner-data", r => {
    actions.push(r.request().postDataJSON().action);
    return r.fulfill({ json: { ok: true, items: [], page: { items: [], total: 0, page: 0, pageSize: 12 } } });
  });
  await page.goto("/account", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("目前沒有報告。", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "刷新後台", exact: true }).click();
  await expect.poll(() => actions.filter(a => a === "report.list").length).toBe(2);
  expect(actions.filter(a => a.startsWith("background."))).toEqual([]);
  await expect(page.locator("[data-background-card]")).toHaveCount(0);
  await noOverflow(page);
  await page.getByRole("link", { name: /圖片與開場影片/ }).click();
  await expect(page.getByRole("tab", { name: "開場影片", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "內容圖片", exact: true }).click();
  await expect.poll(() => actions.filter(a => a === "gallery.list").length).toBeGreaterThanOrEqual(2);
  await noOverflow(page);
});

test("owner: the existing gallery wallpaper action updates the shared homepage background", async ({ page }) => {
  await isolate(page, true);
  const actions: string[] = [];
  let pinned = false;
  const wallpaper = { id: "fixture-background", name: "Fixture", storage_path: "fixture.png", enabled: true, theme: "wallpaper", days_of_week: [], start_date: null, end_date: null, created_at: "2026-10-07T00:00:00Z" };
  const asset = { id: "fixture-art", category: "visual-library", asset_key: "fixture", title: "Fixture artwork", storage_path: "fixture.png", bucket_id: "zhaowu-gallery", content_type: "image/png", tags: ["song-atlas", "final", "production"], enabled: true, is_primary: false };
  await page.route("**/rest/v1/background_assets?**", r => r.fulfill({ json: pinned ? [wallpaper] : [] }));
  await page.route("**/storage/v1/object/public/**/fixture.png", r => r.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2l9sAAAAASUVORK5CYII=", "base64") }));
  await page.route("**/fixture-upload", r => r.fulfill({ json: {} }));
  await page.route("**/api/owner-data", r => {
    const { action } = r.request().postDataJSON();
    actions.push(action);
    if (action === "gallery.list") return r.fulfill({ json: { ok: true, items: [asset] } });
    if (action === "background.prepareUpload") return r.fulfill({ json: { ok: true, signedUrl: "http://127.0.0.1:4173/fixture-upload", uploadTicket: "fixture-only", path: "fixture.png", category: "background", assetKey: "fixture", contentType: "image/png", expectedSizeBytes: 68 } });
    if (action === "background.finalizeUpload") return r.fulfill({ json: { ok: true, item: wallpaper } });
    if (action === "background.setWallpaper") pinned = true;
    return r.fulfill({ json: { ok: true } });
  });
  await page.goto("/gallery", { waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: "內容圖片", exact: true }).click();
  await page.getByRole("button", { name: "打開圖庫", exact: true }).click();
  await page.getByRole("button", { name: "設為首頁背景", exact: true }).click();
  await expect(page.getByText("已設為首頁背景。", { exact: true })).toBeVisible();
  expect(actions.filter(a => a.startsWith("background."))).toEqual(["background.prepareUpload", "background.finalizeUpload", "background.setWallpaper"]);
  await expect.poll(() => page.locator(".zhaowu-home-sheet-shell").evaluate(el => (el as HTMLElement).style.getPropertyValue("--zhaowu-shell-wallpaper"))).toContain("fixture.png");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "今日", exact: true }).click();
  await expect(page.locator(".zhaowu-today-section.is-almanac")).toBeVisible();
  await expect.poll(() => page.locator(".zhaowu-home-sheet-shell").evaluate(el => (el as HTMLElement).style.getPropertyValue("--zhaowu-shell-wallpaper"))).toContain("fixture.png");
  await noOverflow(page);
});

for (const width of [320, 390, 412, 820, 1440]) {
  test(`mobile: Today independent sections and slip dialog at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await isolate(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await noOverflow(page);
    await page.getByRole("button", { name: "今日", exact: true }).click();
    for (const section of ["almanac", "wardrobe", "spirit"]) {
      await expect(page.locator(`.zhaowu-today-section.is-${section}`)).toBeVisible();
    }
    await noOverflow(page);
    await page.locator(".zhaowu-today-section.is-spirit").getByRole("button", { name: /完整/ }).click();
    const dialog = page.getByRole("dialog", { name: /靈籤/ });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
    await noOverflow(page);
    await dialog.getByRole("button", { name: "收起", exact: true }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: "命書", exact: true }).click();
    await expect(page.locator("#birth-year")).toBeVisible();
  });
}
