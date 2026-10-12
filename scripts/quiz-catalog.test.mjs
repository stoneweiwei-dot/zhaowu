import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { QUIZ_CATALOG } from "../src/lib/quiz-catalog.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("every quiz in the catalog is offered on the home Explore panel in all three languages", async () => {
  const home = await read("src/routes/index.tsx");
  for (const quiz of QUIZ_CATALOG) {
    const occurrences = home.split(`href: "${quiz.href}"`).length - 1;
    assert.equal(occurrences, 3, `${quiz.href} must appear once per locale on the home page`);
  }
});

test("home quiz cards use the catalog titles, so the two entrances cannot drift apart", async () => {
  const home = await read("src/routes/index.tsx");
  for (const quiz of QUIZ_CATALOG) {
    for (const locale of ["zh-Hant", "zh-Hans", "en"]) assert.ok(home.includes(`title: "${quiz.text[locale].title}"`), `${quiz.id} (${locale}) title differs from the catalog`);
  }
});

test("the /fun-tests hub lists every non-inline quiz from the catalog", async () => {
  const hub = await read("src/routes/fun-tests.tsx");
  assert.match(hub, /QUIZ_CATALOG\.filter\(\(quiz\) => !quiz\.inline\)/);
  assert.match(hub, /data-quiz-hub/);
});
