// Local production-preview evidence only. Do not call the live site or Vercel.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = process.env.PREVIEW_ORIGIN || "http://127.0.0.1:4173";
const directory = "docs/pr-screenshots/collapsible-lang-volume";
await mkdir(directory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const notes = [];

function shot(name) {
  return `${directory}/${name}.jpg`;
}

async function prepare(page, language = "zh-Hant") {
  await page.addInitScript((value) => {
    localStorage.setItem("zhaowu.display-language", value);
  }, language);
  await page.route("**/rest/v1/**", (route) => route.fulfill({ status: 503, body: "offline-preview" }));
  await page.route("**/api/**", (route) => route.fulfill({ status: 503, body: "offline-preview" }));
}

async function newPage(width, language = "zh-Hant") {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    locale: "zh-TW",
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  await prepare(page, language);
  return { context, page };
}

try {
  for (const width of [320, 390]) {
    const { context, page } = await newPage(width);
    await page.goto(`${origin}/`, { waitUntil: "networkidle" });
    const header = page.locator(".zhaowu-site-header");
    const toggle = page.locator(".zw-langpick__toggle");
    await toggle.waitFor({ state: "visible" });
    assert.equal(await header.evaluate((el) => getComputedStyle(el).position), "fixed");
    assert.equal(await page.locator("[data-language-switcher]").getAttribute("data-open"), "false");
    assert.equal(await page.locator(".zw-langpick__opt").count(), 9);
    await expectHidden(page.locator(".zw-langpick__track"));
    assert.match(await toggle.innerText(), /繁體/);
    const toggleBox = await toggle.boundingBox();
    assert.ok(toggleBox, "collapsed control has a box");
    assert.ok(toggleBox.y < 80, `control not in the top safe area: ${JSON.stringify(toggleBox)}`);
    assert.ok(toggleBox.x + toggleBox.width > width - 180, `control not at the right: ${JSON.stringify(toggleBox)}`);
    assert.ok(toggleBox.height >= 44, JSON.stringify(toggleBox));
    await page.screenshot({ type: "jpeg", quality: 80, path: shot(`home-${width}-collapsed`) });

    await toggle.click();
    await page.locator(".zw-langpick__track").waitFor({ state: "visible" });
    const options = page.locator(".zw-langpick__opt");
    const boxes = await options.evaluateAll((nodes) => nodes.map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        text: el.textContent,
        lang: el.getAttribute("data-lang"),
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      };
    }));
    assert.equal(boxes.length, 9);
    for (const box of boxes) {
      assert.ok(box.height >= 44 && box.width >= 44, JSON.stringify(box));
      assert.ok(box.x >= -1 && box.x + box.width <= width + 1, JSON.stringify(box));
      assert.ok(box.scrollWidth <= box.clientWidth + 1, `clipped name: ${JSON.stringify(box)}`);
    }
    const indonesian = boxes.find((box) => box.lang === "id");
    const english = boxes.find((box) => box.lang === "en");
    assert.ok(indonesian && english && indonesian.width > english.width + 20, JSON.stringify({ indonesian, english }));
    await page.screenshot({ type: "jpeg", quality: 80, path: shot(`home-${width}-expanded`) });

    await page.getByRole("radio", { name: "English", exact: true }).click();
    await page.waitForFunction(() => document.documentElement.lang === "en");
    assert.equal(await page.locator("[data-language-switcher]").getAttribute("data-open"), "false");
    await expectHidden(page.locator(".zw-langpick__track"));
    assert.match(await toggle.innerText(), /English/);
    await page.screenshot({ type: "jpeg", quality: 80, path: shot(`home-${width}-after-select`) });

    await page.locator(".zw-langpick__toggle").click();
    await page.locator("h1").click({ position: { x: 8, y: 8 } });
    await expectHidden(page.locator(".zw-langpick__track"));

    const volume = page.locator("[data-music-volume]");
    await expectHidden(volume);
    await page.screenshot({ type: "jpeg", quality: 80, path: shot(`home-${width}-music-closed`) });
    const musicButton = page.locator(".zhaowu-site-utility-buttons button[aria-expanded]").first();
    await musicButton.click();
    await page.locator('[data-utility-panel="music"]').waitFor({ state: "visible" });
    await volume.waitFor({ state: "visible" });
    const volumeInside = await page.evaluate(() => {
      const panel = document.querySelector('[data-utility-panel="music"]');
      const control = document.querySelector("[data-music-volume]");
      if (!panel || !control) return false;
      return panel.contains(control) && getComputedStyle(panel).display !== "none";
    });
    assert.equal(volumeInside, true);
    const separated = await page.evaluate(() => {
      const volume = document.querySelector("[data-music-volume]")?.getBoundingClientRect();
      const button = document.querySelector(".zhaowu-site-utility-buttons")?.getBoundingClientRect();
      return Boolean(volume && button && button.top >= volume.bottom - 4);
    });
    assert.equal(separated, true, "Music button covers the volume controls");
    await page.screenshot({ type: "jpeg", quality: 80, path: shot(`home-${width}-music-open`) });
    await musicButton.click();
    await expectHidden(volume);

    await page.evaluate(() => document.querySelector('[data-home-card="notes"]')?.scrollIntoView({ block: "center" }));
    await page.waitForFunction(() => {
      const shell = document.querySelector(".zhaowu-home-sheet-shell");
      return Math.max(window.scrollY, shell?.scrollTop || 0) > 200;
    });
    const cards = await page.locator("[data-home-card]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-home-card")));
    assert.deepEqual(cards, ["form", "today", "quiz", "notes"]);
    const scrolledToggle = await page.locator(".zw-langpick__toggle").boundingBox();
    assert.ok(scrolledToggle && scrolledToggle.y >= 0 && scrolledToggle.y < 90, JSON.stringify(scrolledToggle));
    await page.screenshot({ type: "jpeg", quality: 80, path: shot(`home-${width}-scrolled-blocks`) });
    notes.push({ width, home: "PASS", boxes });
    await context.close();
  }

  const { context, page } = await newPage(390);
  await page.goto(`${origin}/about`, { waitUntil: "networkidle" });
  const toggle = page.locator(".zw-langpick__toggle");
  await toggle.waitFor({ state: "visible" });
  assert.equal(await page.locator("[data-language-switcher]").getAttribute("data-open"), "false");
  await expectHidden(page.locator(".zw-langpick__track"));
  await page.screenshot({ type: "jpeg", quality: 80, path: shot("about-390-collapsed") });
  await toggle.click();
  await page.locator(".zw-langpick__track").waitFor({ state: "visible" });
  assert.equal(await page.locator(".zw-langpick__opt").count(), 9);
  await page.screenshot({ type: "jpeg", quality: 80, path: shot("about-390-expanded") });
  await context.close();

  const article = await newPage(390);
  await article.page.goto(`${origin}/knowledge/five-elements-tone-qi`, { waitUntil: "networkidle" });
  await article.page.locator("article, main").first().waitFor();
  await expectHidden(article.page.locator("[data-music-volume]"));
  const bodyVisible = await article.page.locator("p").first().isVisible();
  assert.equal(bodyVisible, true);
  await article.page.screenshot({ type: "jpeg", quality: 80, path: shot("article-390-music-closed") });
  await article.page.locator("[data-site-utility-dock] button[aria-expanded]").first().click();
  await article.page.locator("[data-music-volume]").waitFor({ state: "visible" });
  const contained = await article.page.evaluate(() => {
    const panel = document.querySelector('[data-utility-panel="music"]');
    const control = document.querySelector("[data-music-volume]");
    return Boolean(panel && control && panel.contains(control));
  });
  assert.equal(contained, true);
  await article.page.screenshot({ type: "jpeg", quality: 80, path: shot("article-390-music-open") });
  await article.context.close();

  await writeFile(`${directory}/verification.json`, JSON.stringify(notes, null, 2) + "\n");
  console.log("preview checks passed");
} finally {
  await browser.close();
}

async function expectHidden(locator) {
  assert.equal(await locator.isVisible().catch(() => false), false);
}
