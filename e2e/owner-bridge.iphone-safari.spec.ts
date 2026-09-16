import { expect, test, type Page } from "@playwright/test";

async function installOwnerBridgeMocks(page: Page) {
  const actions: string[] = [];
  await page.route("**/api/owner-session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ authenticated: true }),
    }),
  );
  await page.route("**/api/owner-data", async (route) => {
    const request = route.request();
    const body = request.postDataJSON() as { action?: string };
    const action = String(body?.action ?? "");
    actions.push(action);
    if (action === "report.list") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, items: [] }) });
    }
    if (action === "background.list") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, page: { items: [], total: 0, page: 0, pageSize: 1 } }),
      });
    }
    return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ ok: false, error: "UNEXPECTED_ACTION", action }) });
  });
  await page.route("**/rest/v1/**", (route) =>
    route.fulfill({ status: 599, body: "owner-backoffice-must-not-use-public-rest" }),
  );
  return actions;
}

test("owner cookie session opens /account through the same-origin owner-data bridge", async ({ page }) => {
  const actions = await installOwnerBridgeMocks(page);
  await page.goto("/account", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "昭梧站主後台", exact: true })).toBeVisible();
  await expect(page.getByText("OWNER CONSOLE", { exact: true })).toBeVisible();
  await expect.poll(() => actions).toContain("report.list");
  await expect.poll(() => actions).toContain("background.list");
  await expect(page.getByRole("link", { name: /會員登入|註冊|Sign in|Register/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
