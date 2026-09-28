// Temporary visual audit: screenshots of production and local build. Not part of production.
import { chromium, webkit, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR || "visual-audit-shots";
mkdirSync(OUT, { recursive: true });
const targets = (process.env.TARGETS || "local=http://127.0.0.1:4173").split(",").map((t) => t.split("="));
const routes = (process.env.ROUTES || "/").split(",");

async function shoot(browserType, name, ctxOpts, base, label, route, theme, expand) {
  const browser = await browserType.launch();
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  await page.addInitScript((o) => {
    localStorage.setItem("zhaowu.display-language", o.lang);
    if (o.theme === "night") localStorage.setItem("zhaowu.theme.v1", "night");
    else localStorage.removeItem("zhaowu.theme.v1");
  }, { theme, lang: process.env.LANG_CODE || "zh-Hant" });
  await page.goto(base + route, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
  if (expand) {
    const triggers = page.locator(".zhaowu-home-disclosure-trigger");
    const n = await triggers.count();
    for (let i = 0; i < n; i++) { await triggers.nth(i).click().catch(() => {}); await page.waitForTimeout(300); }
    await page.waitForTimeout(1200);
  }
  const slug = route === "/" ? "home" : route.replace(/\W+/g, "_");
  const file = `${OUT}/${process.env.LANG_CODE || "zh"}-${label}-${slug}-${name}-${theme}${expand ? "-open" : ""}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log("shot", file);
  await browser.close();
}

const iphone = { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } };
const desktop = { viewport: { width: 1440, height: 900 } };
for (const [label, base] of targets) {
  for (const route of routes) {
    for (const theme of ["day", "night"]) {
      await shoot(webkit, "iphone", iphone, base, label, route, theme, false);
      await shoot(webkit, "iphone", iphone, base, label, route, theme, true);
      await shoot(chromium, "desktop", desktop, base, label, route, theme, false);
    }
  }
}
