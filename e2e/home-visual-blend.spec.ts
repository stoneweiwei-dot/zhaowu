import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, locale: "zh-TW", reducedMotion: "reduce", serviceWorkers: "block" });

for (const width of [390, 320]) {
  test(`homepage paintings and controls scroll with the paper at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.route("**/api/owner-data?view=site-skin", route =>
      route.fulfill({ json: { configured: true, skin: "solar-minor-snow" } }));
    await page.goto("/?zw_entry=home", { waitUntil: "networkidle" });
    const home = page.locator(".zw-painted-home");
    const shell = page.locator(".zhaowu-route-home");
    await expect(home.locator(".zw-v2-season")).toBeVisible();
    await expect(home.locator(".zw-v2-season")).toHaveCSS("position", "static");
    await expect(shell.locator(".zhaowu-site-utility-dock")).toHaveCSS("position", "relative");
    await expect(home.locator(".zw-stage")).toHaveCSS("position", "absolute");
    await expect(home.locator(".zw-stage")).toHaveCSS("mask-image", /gradient/);
    await expect(home.locator(".zw-bajinggong-feature-link img")).toHaveCSS("mask-image", /gradient/);
    const containers = home.locator(".zw-bajinggong-feature-link, .ph-tree-tile:has(img), .ph-tree-branch-tile");
    for (const container of await containers.all()) {
      const blended = await container.evaluate(el => {
        const style = getComputedStyle(el);
        return style.maskImage !== "none" || style.boxShadow === "none";
      });
      expect(blended).toBe(true);
    }

    let previousTop = 0;
    for (const fraction of [0.1, 0.5, 0.9]) {
      const result = await shell.evaluate(async (el, fraction) => {
        el.scrollTo({ top: (el.scrollHeight - el.clientHeight) * fraction, behavior: "instant" });
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        const visible = (rect: DOMRect) => rect.width > 0 && rect.height > 0
          && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
        const blocks = Array.from(el.querySelectorAll("main :is(h1,h2,h3,p,label,legend,strong,small)"))
          .filter(block => visible(block.getBoundingClientRect()));
        const collisions: string[] = [];
        for (const layer of document.body.querySelectorAll("*")) {
          const style = getComputedStyle(layer);
          if (!["sticky", "fixed"].includes(style.position) || style.visibility === "hidden" || style.opacity === "0") continue;
          const area = layer.getBoundingClientRect();
          if (!visible(area)) continue;
          for (const block of blocks) {
            if (layer.contains(block) || block.contains(layer)) continue;
            const range = document.createRange();
            range.selectNodeContents(block);
            if (Array.from(range.getClientRects()).some(r => visible(r)
              && r.left < area.right && r.right > area.left && r.top < area.bottom && r.bottom > area.top)) {
              collisions.push(`${layer.tagName}.${layer.className} over ${block.textContent?.slice(0, 24)}`);
            }
          }
        }
        return {
          top: el.scrollTop, textBlocks: blocks.length, collisions,
          overflow: Math.max(el.scrollWidth - el.clientWidth, document.documentElement.scrollWidth - innerWidth),
        };
      }, fraction);
      expect(result.top).toBeGreaterThan(previousTop);
      expect(result.textBlocks).toBeGreaterThan(0);
      expect(result.overflow).toBeLessThanOrEqual(0);
      expect(result.collisions).toEqual([]);
      previousTop = result.top;
    }
  });
}
