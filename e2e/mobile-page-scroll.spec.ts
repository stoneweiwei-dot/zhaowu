import { expect, test } from "@playwright/test";

test("public mobile pages keep native document scrolling", async ({ page }) => {
  await page.goto("/quiz/divine-affinity");

  const metrics = await page.evaluate(() => {
    const root = document.querySelector("#root");
    const shell = document.querySelector("#root > .zhaowu-home-sheet-shell");
    return {
      rootOverflowY: root ? getComputedStyle(root).overflowY : "missing",
      shellOverflowY: shell ? getComputedStyle(shell).overflowY : "missing",
      documentHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
    };
  });

  expect(metrics.rootOverflowY).toBe("visible");
  expect(metrics.shellOverflowY).toBe("visible");
  expect(metrics.documentHeight).toBeGreaterThan(metrics.viewportHeight);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});
