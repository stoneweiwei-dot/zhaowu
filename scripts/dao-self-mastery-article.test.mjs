import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homeSection = readFileSync("src/components/life-view-home-section.tsx", "utf8");
const { DAO_SELF_MASTERY_LONG_FORM } = await import("../src/lib/life-view-long-form/dao-self-mastery.ts");

test("Dao self-mastery article is published on the homepage and complete in all three locales", () => {
  assert.match(homeSection, /DAO_SELF_MASTERY_LONG_FORM/);
  assert.equal(DAO_SELF_MASTERY_LONG_FORM.id, "dao-self-mastery-wuwei");
  assert.equal(DAO_SELF_MASTERY_LONG_FORM.publishedAt, "2026-09-08");

  for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
    assert.ok(DAO_SELF_MASTERY_LONG_FORM.title[locale]?.trim());
    assert.ok(DAO_SELF_MASTERY_LONG_FORM.summary[locale]?.trim());
    assert.ok(DAO_SELF_MASTERY_LONG_FORM.body[locale]?.trim());
  }

  assert.ok(DAO_SELF_MASTERY_LONG_FORM.body["zh-Hant"].length >= 1200);
  assert.ok(DAO_SELF_MASTERY_LONG_FORM.body["zh-Hans"].length >= 1200);
  assert.ok(DAO_SELF_MASTERY_LONG_FORM.body.en.length >= 3000);
  assert.ok(DAO_SELF_MASTERY_LONG_FORM.body["zh-Hant"].split(/\n\n+/).length >= 8);
  assert.match(DAO_SELF_MASTERY_LONG_FORM.body["zh-Hant"], /知人者智，自知者明。勝人者有力，自勝者強/);
  assert.match(DAO_SELF_MASTERY_LONG_FORM.body["zh-Hant"], /覺察、抽離、微行動/);
  assert.match(DAO_SELF_MASTERY_LONG_FORM.body.en, /notice, step back, take one small action/i);
});
