import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { buildCta, buildQuizShareModel, deriveElementChips, quizSharePath, sanitizeResultLabel, QUIZ_SHARE_PALETTE, QUIZ_SHARE_SIZE } from "../src/lib/quiz-share-card.ts";

test("quiz share model keeps a light 1080x1350 card, short description and route", () => {
  assert.deepEqual(QUIZ_SHARE_SIZE, { width: 1080, height: 1350 });
  assert.match(QUIZ_SHARE_PALETTE.paper, /^#[fF]/);
  const model = buildQuizShareModel({ quizId: "six-realms", quizName: "六道", resultLabel: "人道", description: "一二三四五六七八九十".repeat(5), locale: "zh-Hant" }, "/en/quiz/six-realms");
  assert.ok([...model.description].length <= 40);
  assert.equal(model.marks.site, "zhao-wu.com");
  assert.equal(model.marks.original, "STONE 原創");
  assert.equal(new URL(model.shareUrl).pathname, "/en/quiz/six-realms");
  assert.notEqual(new URL(model.shareUrl).pathname, "/");
  const inline = buildQuizShareModel({ quizId: "animal", quizName: "內在動物", resultLabel: "虎", description: "短述", locale: "zh-Hant" }, "/fun-tests?test=animal");
  assert.equal(new URL(inline.shareUrl).pathname, "/fun-tests");
  assert.equal(new URL(inline.shareUrl).search, "?test=animal");
});

test("share cards drop option letters, fill traits/chips, and keep quiz paths in the CTA", () => {
  assert.equal(sanitizeResultLabel("A · 天道習氣"), "天道習氣");
  assert.equal(sanitizeResultLabel("A · 天道習氣 · B · 人道習氣"), "天道習氣 · 人道習氣");
  assert.equal(sanitizeResultLabel("玄豹 · 單點突破者", "animal"), "玄豹");
  const six = buildQuizShareModel({ quizId: "six-realms", quizName: "六道習氣測驗", resultLabel: "A · 天道習氣", description: "你較容易帶著『本來就會順』『我還有餘裕』的感受，對小事不太執著。", locale: "zh-Hant" }, "/quiz/six-realms");
  assert.equal(six.resultLabel, "天道習氣");
  assert.ok(six.traits.length >= 2 && six.traits.length <= 3);
  assert.equal(six.cta.path, "zhao-wu.com/quiz/six-realms");
  assert.match(six.cta.lead, /哪一道/);
  const english = buildQuizShareModel({ quizId: "six-realms", quizName: "Six Realms Habit Test With An Extra Long English Title For Wrapping", resultLabel: "A · Heaven-realm habit", description: "You often move from a sense that life will work out and that you have enough room to breathe.", locale: "en" }, "/en/quiz/six-realms");
  assert.equal(english.resultLabel, "Heaven-realm habit");
  assert.equal(english.cta.path, "zhao-wu.com/quiz/six-realms");
  assert.match(english.cta.lead, /path/i);
  assert.equal(quizSharePath("animal", "/en/fun-tests?test=animal"), "/fun-tests?test=animal");
  assert.equal(buildCta("zh-Hans", "divine-affinity", "/quiz/divine-affinity").lead, "免费测测你的本缘");
  const chips = deriveElementChips("five-element-overdrive", "木｜生發型", "zh-Hant");
  assert.equal(chips.length, 1);
  assert.equal(chips[0].label, "木");
  const animal = buildQuizShareModel({ quizId: "animal", quizName: "內在動物", resultLabel: "玄豹", description: "掌控節奏與有效成果", traits: ["單點突破者", "專注", "膽識"], locale: "zh-Hant" }, "/fun-tests?test=animal");
  assert.deepEqual(animal.traits, ["單點突破者", "專注", "膽識"]);
  assert.equal(animal.cta.path, "zhao-wu.com/fun-tests?test=animal");
});

test("build outputs a Sydney-based all-day ICS window and valid RSS items", () => {
  execFileSync(process.execPath, ["scripts/generate-calendar-feed.mjs"]);
  const ics = readFileSync("dist/calendar.ics", "utf8");
  const events = ics.match(/BEGIN:VEVENT/g) ?? [];
  const uids = [...ics.matchAll(/^UID:(.+)$/gm)].map((m) => m[1]);
  assert.equal(events.length, 60);
  assert.equal(new Set(uids).size, 60);
  assert.match(ics, /DTSTART;VALUE=DATE:\d{8}/);
  assert.match(ics, /DTEND;VALUE=DATE:\d{8}/);
  assert.match(ics, /SUMMARY:今日五行色彩/);
  assert.doesNotMatch(ics.match(/^SUMMARY:.*$/m)?.[0] ?? "", /#[0-9a-f]{3,8}|紅|绿|藍|白|黑|青|赤|黄/i);
  assert.match(readFileSync("scripts/generate-calendar-feed.mjs", "utf8"), /Australia\/Sydney/);
  const rss = readFileSync("dist/feed.xml", "utf8");
  assert.match(rss, /^<\?xml/);
  assert.match(rss, /<item>/);
  assert.match(rss, /https:\/\/zhao-wu\.com\/updates#/);
  execFileSync("python3", ["-c", "import xml.etree.ElementTree as E; r=E.parse('dist/feed.xml').getroot(); assert r.tag=='rss' and len(r.findall('./channel/item'))>0"]);
});

test("funnel telemetry names are registered and share events remain sanitized", () => {
  const telemetry = readFileSync("src/lib/observability/conversion-telemetry.ts", "utf8");
  for (const event of ["chart_started", "chart_completed", "report_viewed", "unlock_clicked", "unlock_paid", "quiz_shared", "calendar_subscribe_clicked"]) assert.ok(telemetry.includes(`"${event}"`));
  assert.match(telemetry, /sanitizePosthogProperties/);
  const privacy = readFileSync("src/lib/observability/posthog-privacy.ts", "utf8");
  assert.match(telemetry, /sanitizePosthogProperties/);
  assert.doesNotMatch(readFileSync("src/components/quiz-share-button.tsx", "utf8"), /birthData|email|access_key|session_id/);
});
