import test from "node:test";
import assert from "node:assert/strict";
import { birthdayIntroKey, birthdayIntroMode, birthdayLetter, birthdayState, buildBirthdayShareModel } from "../src/lib/report/birthday-surprise.ts";

test("birthday state covers today, countdown, hidden boundaries and timezone-local midnight", () => {
  assert.deepEqual(birthdayState(11, 20, new Date("2026-11-20T12:00:00Z"), "UTC"), { kind: "today" });
  assert.deepEqual(birthdayState(11, 23, new Date("2026-11-20T12:00:00Z"), "UTC"), { kind: "countdown", days: 3 });
  assert.deepEqual(birthdayState(11, 28, new Date("2026-11-20T12:00:00Z"), "UTC"), { kind: "hidden" });
  assert.deepEqual(birthdayState(11, 19, new Date("2026-11-20T12:00:00Z"), "UTC"), { kind: "hidden" });
  // UTC says Nov 20, but in Kiritimati it is already Nov 21.
  assert.deepEqual(birthdayState(11, 21, new Date("2026-11-20T12:30:00Z"), "Pacific/Kiritimati"), { kind: "today" });
});

test("Feb 29 is observed on Feb 28 in non-leap years", () => {
  assert.deepEqual(birthdayState(2, 29, new Date("2025-02-28T12:00:00Z"), "UTC"), { kind: "today" });
  assert.deepEqual(birthdayState(2, 29, new Date("2024-02-28T12:00:00Z"), "UTC"), { kind: "countdown", days: 1 });
});

test("intro respects reduced motion, skip/played state and birthday-scoped on-device key", () => {
  assert.equal(birthdayIntroMode(false, false), "intro");
  assert.equal(birthdayIntroMode(false, true), "letter");
  assert.equal(birthdayIntroMode(true, false), "letter");
  assert.equal(birthdayIntroKey(11, 20, 2026), "zhaowu.birthday-intro.v1:2026:11-20");
});

test("10 stems × 3 locales expose placeholder copy and the required brand signature", () => {
  for (const stem of "甲乙丙丁戊己庚辛壬癸") for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
    const letter = birthdayLetter(stem, locale);
    assert.ok(letter?.placeholder);
    assert.match(letter.marker, /Placeholder|佔位稿|占位稿/);
    assert.equal(letter.signature, "昭梧・S原創");
    assert.ok(locale === "en" ? letter.body.length >= 250 : letter.body.length >= 150 && letter.body.length <= 220, `${stem}/${locale}: ${letter.body.length}`);
  }
});

test("birthday share-card model builds for a Chinese stem", () => {
  const letter = birthdayLetter("甲", "zh-Hant");
  const model = buildBirthdayShareModel("甲", "zh-Hant", letter);
  assert.equal(model?.title, "生日快樂");
  assert.match(model?.artwork?.fullImageUrl ?? "", /characters\/jia-wood\.webp$/);
});
