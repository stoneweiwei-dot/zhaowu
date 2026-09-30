import { expect, test } from "@playwright/test";

test("owner music keeps long names readable on a narrow phone", async ({ page }) => {
  page.on("pageerror", error => console.log("OWNER PAGE ERROR:", error.stack));
  page.on("console", message => { if (message.type() === "error") console.log("OWNER CONSOLE ERROR:", message.text()); });
  const name = "before_the_morning_mist_with_a_long_owner_chosen_track_name";
  await page.route("**/api/owner-session**", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true }) }));
  await page.route("**/api/owner-data**", route => route.fulfill({ status: 503, json: { error: "OFFLINE_TEST" } }));
  await page.route("**/api/owner-music", route => route.fulfill({ json: {
    active: null,
    tracks: [{ id: "fixture-track", name, url: "/audio/fixture.mp3", contentType: "audio/mpeg", fileSize: 700000, enabled: false }],
  } }));
  await page.goto("/account", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-owner-background-music-manager]")).toBeVisible({ timeout: 5000 }).catch(async error => {
    console.log("OWNER PAGE URL:", page.url());
    console.log("OWNER PAGE BODY:", await page.locator("body").innerText());
    throw error;
  });
  await page.locator("[data-owner-background-music-manager]").click();
  const dialog = page.getByRole("dialog", { name: "網站背景音樂" });
  const title = dialog.getByRole("heading", { name, exact: true });
  await expect(title).toBeVisible();
  await expect(dialog.locator("audio[controls]")).toHaveCount(0);
  await expect(dialog.locator("audio")).toHaveAttribute("crossorigin", "anonymous");
  await expect(dialog.getByRole("button", { name: "改名", exact: true })).not.toBeVisible();
  await expect(dialog.getByRole("button", { name: "試聽 " + name, exact: true })).toBeVisible();
  const bounds = await title.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.width).toBeGreaterThan(180);
  expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  expect(await title.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  const previewButton = dialog.getByRole("button", { name: "試聽 " + name, exact: true });
  await previewButton.click();
  await expect(dialog.locator("audio")).toHaveAttribute("src", "/audio/fixture.mp3");
  await dialog.getByRole("button", { name: "關閉", exact: true }).click();
  await page.locator("[data-owner-background-music-manager]").click();
  await dialog.getByRole("button", { name: "試聽 " + name, exact: true }).click();
  await expect(dialog.locator("audio")).toHaveAttribute("src", "/audio/fixture.mp3");
  await dialog.getByText("更多 ⋯", { exact: true }).click();
  await expect(dialog.getByRole("button", { name: "改名", exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "刪除", exact: true })).toBeVisible();
});
