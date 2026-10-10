import { expect, test } from "@playwright/test";

test("narrow public pages have a scrollable native-touch viewport", async ({ page }) => {
  const viewport = page.viewportSize();
  test.skip(!viewport || viewport.width > 700, "mobile scroll behavior");

  await page.goto("/quiz/divine-affinity");

  const metrics = await page.evaluate(() => {
    const root = document.querySelector("#root");
    const shell = document.querySelector("#root > .zhaowu-home-sheet-shell");
    return {
      rootOverflowY: root ? getComputedStyle(root).overflowY : "missing",
      shellOverflowY: shell ? getComputedStyle(shell).overflowY : "missing",
      shellHeight: shell?.clientHeight ?? 0,
      shellScrollHeight: shell?.scrollHeight ?? 0,
    };
  });

  expect(metrics.rootOverflowY).toBe("visible");
  expect(metrics.shellOverflowY).toBe("auto");
  expect(metrics.shellScrollHeight).toBeGreaterThan(metrics.shellHeight);

  await page.locator("#root > .zhaowu-home-sheet-shell").evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await expect.poll(() => page.locator("#root > .zhaowu-home-sheet-shell").evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
});
