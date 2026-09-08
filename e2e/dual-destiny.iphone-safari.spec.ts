import { expect, test } from "@playwright/test";

const TEST_USER_ID = "specialist-member-test";
const SESSION = {
  access_token: "e2e-specialist-session",
  refresh_token: "e2e-specialist-refresh",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: {
    id: TEST_USER_ID,
    email: "specialist@example.test",
    user_metadata: { name: "專題測試會員" },
  },
};

const SHARED_BIRTH = {
  year: 1988,
  month: 10,
  day: 4,
  hour: 4,
  minute: 40,
  timeUnknown: false,
  gender: "male",
  relation: "unset",
  city: {
    name: "Sydney",
    country: "Australia",
    display: "Sydney, Australia",
    timezone: "Australia/Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
  },
  liveCity: null,
  ziPolicy: "midnight",
  useTrueSolar: true,
};

test("iPhone Safari One-Palm page is usable without the removed duplicate specialist shell", async ({ page }) => {
  await page.goto("/yizhangjing", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "前世今生・達摩一掌經", exact: true })).toBeVisible();
  await expect(page.locator("form.palm-form")).toBeVisible();
  await expect(page.getByLabel("年", { exact: true })).toBeVisible();
  await expect(page.getByLabel("時", { exact: true })).toBeVisible();
  await expect(page.locator("main.palm-standalone")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("signed-in shared birth auto-generates the report and changing direction regenerates it", async ({ page }) => {
  await page.addInitScript(({ record, session, userId }) => {
    localStorage.setItem("zhaowu.supabase.session.v1", JSON.stringify(session));
    localStorage.setItem("zhaowu.birth-record-owner.v1", userId);
    localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify(record));
  }, { record: SHARED_BIRTH, session: SESSION, userId: TEST_USER_ID });
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-test" }));
  await page.goto("/yizhangjing", { waitUntil: "domcontentloaded" });

  const result = page.locator(".palm-result");
  await expect(result).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('article[aria-label="印度古法占星"]')).toBeVisible({ timeout: 10_000 });
  const before = await result.innerText();

  await page.getByLabel("逆行（傳統女命）", { exact: true }).check();
  await expect.poll(async () => result.innerText(), { timeout: 10_000 }).not.toBe(before);
  await expect(result).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
