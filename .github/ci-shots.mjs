import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const BASE = process.env.SHOT_BASE || "http://127.0.0.1:4173";
const OUT = process.env.SHOT_OUT || "shots";
mkdirSync(OUT, { recursive: true });
const birth = { year: 1988, month: 10, day: 4, hour: 4, minute: 30, timeUnknown: false, gender: "male", relation: "unset",
  city: { name: "雪梨", country: "澳洲", display: "雪梨，澳洲", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
  liveCity: null, ziPolicy: "midnight", useTrueSolar: true };
const browser = await chromium.launch();
setTimeout(() => { console.log("GLOBAL TIMEOUT"); process.exit(0); }, 240000);
const log = [];
async function ctx(withBirth, lang = "zh-Hant") {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, locale: "zh-TW", timezoneId: "Australia/Sydney" });
  await c.addInitScript(([b, l]) => {
    try {
      localStorage.setItem("zhaowu.intro.seen.public.v1", "1");
      localStorage.setItem("zhaowu.display-language", l);
      if (b) { localStorage.setItem("zhaowu.birth-record.v1", JSON.stringify(b)); }
    } catch {}
  }, [withBirth ? birth : null, lang]);
  const p = await c.newPage();
  p.on("pageerror", (e) => log.push(`pageerror: ${e.message}`));
  p.on("console", (m) => { if (m.type() === "error") log.push(`console: ${m.text()}`); });
  return { c, p };
}
async function step(name, fn) { try { await fn(); log.push(`OK ${name}`); } catch (e) { log.push(`FAIL ${name}: ${e.message.split("\n")[0]}`); } }

await step("home", async () => {
  const { c, p } = await ctx(false);
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 30000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/01-home.png` });
  await p.screenshot({ path: `${OUT}/02-home-full.png`, fullPage: true });
  await step("today", async () => {
    await p.click('[data-home-card="today"]');
    await p.waitForSelector("[data-almanac-ink-board]", { timeout: 15000 });
    await p.waitForTimeout(2500);
    await p.locator("[data-almanac-ink-board]").screenshot({ path: `${OUT}/03-almanac.png` });
    await p.locator(".zhaowu-today-guide__spirit-paper").scrollIntoViewIfNeeded();
    await p.locator(".zhaowu-today-guide__spirit-paper").screenshot({ path: `${OUT}/09-slip.png` });
  });
  await c.close();
});
await step("almanac-personal", async () => {
  const { c, p } = await ctx(true);
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 30000 });
  await p.click('[data-home-card="today"]');
  await p.waitForSelector("[data-almanac-personal]", { timeout: 15000 });
  await p.waitForTimeout(1500);
  await p.locator("[data-almanac-ink-board]").screenshot({ path: `${OUT}/04-almanac-personal.png` });
  await c.close();
});
await step("city", async () => {
  const { c, p } = await ctx(false);
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 30000 });
  await p.click('[data-home-card="form"]');
  await p.waitForSelector("#birth-city", { timeout: 15000 });
  await p.locator("#birth-city").scrollIntoViewIfNeeded();
  await p.locator("#birth-city").pressSequentially("員林", { delay: 150 });
  await p.waitForTimeout(4000);
  log.push("city value after typing: " + await p.locator("#birth-city").inputValue());
  log.push("city options: " + (await p.locator('[data-city-picker] [role="option"]').allInnerTexts()).join(" | ").replace(/\n/g, " "));
  await p.screenshot({ path: `${OUT}/05-city-yuanlin.png` });
  await p.locator("#birth-city").fill("");
  await p.locator("#birth-city").pressSequentially("Dubbo", { delay: 120 });
  await p.waitForTimeout(4000);
  log.push("Dubbo options: " + (await p.locator('[data-city-picker] [role="option"]').allInnerTexts()).join(" | ").replace(/\n/g, " "));
  await c.close();
});
await step("bazi+report", async () => {
  const { c, p } = await ctx(true);
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 30000 });
  await p.click('[data-home-card="form"]');
  await p.waitForSelector("[data-plain-summary]", { timeout: 15000 });
  await p.waitForTimeout(1200);
  await p.locator("#bazi").screenshot({ path: `${OUT}/06-bazi-plain.png` });
  await p.fill("#analysis-question", "我今年適合換工作嗎？");
  await p.click('[data-analysis-stage="question"] button[type="submit"]');
  await p.waitForSelector("#result", { timeout: 30000 });
  await p.waitForTimeout(1500);
  await p.click(".zhaowu-result-primary");
  await p.waitForSelector(".zhaowu-focused-report", { timeout: 30000 });
  await p.waitForTimeout(2000);
  await p.locator("#result").screenshot({ path: `${OUT}/07-report.png` });
  await c.close();
});
await step("en-almanac", async () => {
  const { c, p } = await ctx(true, "en");
  await p.goto(BASE + "/", { waitUntil: "load", timeout: 30000 });
  await p.click('[data-home-card="today"]');
  await p.waitForSelector("[data-almanac-ink-board]", { timeout: 15000 });
  await p.waitForTimeout(1500);
  await p.locator("[data-almanac-ink-board]").screenshot({ path: `${OUT}/08-almanac-en.png` });
  await c.close();
});
await browser.close();
const { writeFileSync } = await import("node:fs");
writeFileSync(`${OUT}/log.txt`, log.join("\n"));
console.log(log.join("\n"));
