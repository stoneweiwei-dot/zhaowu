import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { SACRED_SOURCE, hantToHans, nextSacredAfter, sacredForDate } from "../src/lib/sacred-days.ts";
import { SPIRIT_SLIP_SOURCE, SPIRIT_SLIP_COUNT, spiritSlipFor } from "../src/lib/spirit-slips.ts";
import { toLunar } from "../src/lib/bazi/calendar.ts";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

// Traditional-only characters that must never survive a zh-Hans conversion.
const TRADITIONAL_ONLY = Array.from("亂並係來個側動勝勢後啟嚴嶽帥師彈彌態憂應擊撐斷於時會條槃歡歸氣決減準滿潑為無煙燈爭爺現璣盧確礎穩節簡籤純紙細終給經緒緣續羨聖聲聽臘華葉藍藥處複見親觀訊話認誕語誤說請諾證變財貴費資賓賢贏趙轉還邊釋長門開間關雜難雲靜韋頭願風養餘馬馱驚麼東積補進過達遠適遲錢順須別呂問媽寫寬薩對將換載齋與廟宮屬異搖當預詩創");

function findLunarDate(month, day, fromYear = 2026) {
  for (let year = fromYear; year < fromYear + 3; year += 1) {
    for (let dayOfYear = 0; dayOfYear < 380; dayOfYear += 1) {
      const date = new Date(year, 0, 1 + dayOfYear);
      const lunar = toLunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
      if (lunar && !lunar.isLeap && lunar.month === month && lunar.day === day) return date;
    }
  }
  return null;
}

test("r228 sacred-day table keeps every lunar key valid and every entry bilingual", () => {
  const keys = Object.keys(SACRED_SOURCE.FESTIVALS);
  assert.ok(keys.length >= 40, `expected a full table, got ${keys.length}`);
  for (const key of keys) {
    const [month, day] = key.split("-").map(Number);
    assert.ok(month >= 1 && month <= 12 && day >= 1 && day <= 30, `bad lunar key ${key}`);
    for (const entry of SACRED_SOURCE.FESTIVALS[key]) {
      assert.ok(entry.zh && entry.en && ["buddha", "dao", "folk"].includes(entry.kind), `incomplete entry on ${key}`);
    }
  }
  for (const day of [1, 8, 14, 15, 18, 23, 24, 28, 29, 30]) assert.ok(SACRED_SOURCE.FAST_DAYS[day], `missing 十齋日 ${day}`);
});

test("r228 the lunar dates people look for resolve to the right 菩薩／佛 birthdays", () => {
  const buddha = findLunarDate(4, 8);
  assert.ok(buddha, "found a 4-8 lunar date");
  assert.ok(sacredForDate(buddha, "zh-Hant").items.some((item) => item.label.includes("釋迦牟尼佛聖誕")));
  const guanyin = findLunarDate(2, 19);
  assert.ok(sacredForDate(guanyin, "zh-Hant").items.some((item) => item.label.includes("觀世音菩薩聖誕")));
  assert.ok(sacredForDate(guanyin, "zh-Hans").items.some((item) => item.label.includes("观世音菩萨圣诞")));
  assert.ok(sacredForDate(guanyin, "en").items.some((item) => item.label.includes("Guanyin")));
  const ksitigarbha = findLunarDate(7, 30) ?? findLunarDate(7, 29);
  assert.ok(ksitigarbha && sacredForDate(ksitigarbha, "zh-Hant").items.some((item) => item.label.includes("地藏王菩薩聖誕")), "地藏誕 also lands on 廿九 in a 小月");
});

test("r228 ordinary days still show something real: the 十齋日 buddha or the next observance", () => {
  let quiet = 0;
  for (let offset = 0; offset < 420; offset += 1) {
    const date = new Date(2026, 9, 1 + offset);
    const today = sacredForDate(date, "zh-Hant");
    if (!today.items.length) {
      quiet += 1;
      const next = nextSacredAfter(date, "zh-Hant");
      assert.ok(next && next.inDays >= 1 && next.items.length, `no upcoming observance after ${date.toDateString()}`);
    }
  }
  assert.ok(quiet > 0);
  assert.equal(nextSacredAfter(new Date(2026, 9, 1), "en")?.items.every((item) => /[A-Za-z]/.test(item.label)), true);
});

test("r228 simplified output never keeps a traditional-only character", () => {
  const texts = [];
  for (const entries of Object.values(SACRED_SOURCE.FESTIVALS)) for (const entry of entries) texts.push(entry.zh);
  for (const entry of Object.values(SACRED_SOURCE.FAST_DAYS)) texts.push(entry.zh);
  for (const slip of SPIRIT_SLIP_SOURCE) texts.push(slip.title, slip.gloss, slip.advice, ...slip.poem);
  for (const text of texts) {
    const hans = hantToHans(text);
    for (const char of Array.from(hans)) assert.ok(!TRADITIONAL_ONLY.includes(char), `"${text}" → "${hans}" keeps traditional ${char}`);
  }
  assert.equal(hantToHans("觀世音菩薩聖誕"), "观世音菩萨圣诞");
});

test("r228 spirit slips are an original, locale-complete set drawn from a stable hash", () => {
  assert.equal(SPIRIT_SLIP_COUNT, 12);
  const titles = new Set();
  for (const slip of SPIRIT_SLIP_SOURCE) {
    assert.equal(slip.poem.length, 4);
    for (const line of slip.poem) assert.equal(Array.from(line).length, 5, `五言 line "${line}"`);
    assert.equal(slip.en.poem.length, 4);
    assert.ok(slip.title && slip.gloss && slip.advice && slip.en.title && slip.en.gloss && slip.en.advice);
    assert.ok(!titles.has(slip.title), `duplicate title ${slip.title}`);
    titles.add(slip.title);
  }
  for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
    const slip = spiritSlipFor(2166136261, locale);
    assert.equal(slip.poem.length, 4);
    assert.ok(slip.number && slip.gradeLabel && slip.title);
  }
  assert.equal(spiritSlipFor(7, "zh-Hant").number, "第八籤");
  assert.equal(spiritSlipFor(7, "en").number, "No. 8");
  assert.deepEqual(spiritSlipFor(31, "zh-Hant"), spiritSlipFor(31, "zh-Hant"));
});

test("r228 Today opens on the almanac, leads with the sacred-day card and draws the slip without gallery art", async () => {
  const widget = await source("src/components/daily-almanac-widget.tsx");
  assert.match(widget, /const \[page, setPage\] = useState\(0\)/);
  const grid = widget.indexOf('<div className="zhaowu-today-guide__grid" hidden={page !== 0}>');
  const sacred = widget.indexOf('className="zhaowu-today-card is-sacred"');
  const date = widget.indexOf('className="zhaowu-today-card is-date"');
  assert.ok(grid > 0 && sacred > grid && sacred < date, "sacred-day card is the first card on the almanac page");
  assert.match(widget, /sacredForDate\(now, locale\)/);
  assert.match(widget, /nextSacredAfter\(now, locale\)/);
  assert.match(widget, /data-sacred-kind=\{item\.kind\}/);
  assert.match(widget, /spiritSlipFor\(stableHash\(`\$\{dayKey\}\|daily-spirit-slip`\), locale\)/);
  assert.doesNotMatch(widget, /listPublicGalleryAssets|galleryPublicUrl|slipOpen|zhaowu-spirit-slip-layout/);
  assert.match(widget, /mark-gourd\.svg/);
});

test("r228 opening video never flashes the old r148 opening before the owner's clip", async () => {
  const gate = await source("src/components/intro-gate.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(gate, /INTRO_VISUAL_OVERRIDE_TIMEOUT_MS = 1800/, "gate waits as long as the lookup's own timeout");
  assert.match(gate, /INTRO_VISUAL_CACHED_START_MS = 400/);
  assert.match(gate, /zhaowu\.intro\.last-visual\.v1/);
  assert.match(gate, /poster=\{usesBuiltInVisual \? OWNER_LOADING_POSTER : undefined\}/);
  assert.match(gate, /is-neutral/);
  assert.match(css, /\.zhaowu-lotus-intro__fallback\.is-neutral > \* \{ display: none !important; \}/);
  const fetchSource = await source("src/lib/intro-visual-source.ts");
  assert.match(fetchSource, /FETCH_TIMEOUT_MS = 1800/);
});

test("r228 owner music list shows the whole file name and keeps the buttons small, under the name", async () => {
  const manager = await source("src/components/owner-background-music-manager.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(manager, /data-owner-music-name/);
  assert.doesNotMatch(manager, /<h3 className="truncate/);
  const name = manager.indexOf("data-owner-music-name");
  const actions = manager.indexOf("data-owner-music-actions");
  const audio = manager.indexOf("<audio className=\"mt-3 w-full\"");
  assert.ok(name > 0 && actions > name && audio > actions, "name, then buttons, then the player");
  assert.match(css, /\[data-owner-music-name\] \{[^}]*white-space: normal !important/);
  assert.match(css, /\[data-owner-music-actions\] button \{[^}]*height: 26px !important/);
});

test("r228 night dragon panel has no dark-green blocks left on the paper", async () => {
  const css = await source("src/zhaowu-design-system.css");
  for (const selector of [".zhaowu-dragon-guide-answer", ".zhaowu-dragon-guide-shortcuts button", "> form input"]) {
    const rule = new RegExp(`html\\[data-zw-theme="night"\\] body \\.zhaowu-dragon-guide-panel[^{]*${selector.replace(/[.>\\[\\]]/g, "\\$&")}[^{]*\\{[^}]*background: transparent !important`);
    assert.match(css, rule, `${selector} must be transparent inside the night paper panel`);
  }
});
