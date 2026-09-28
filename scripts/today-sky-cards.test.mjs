import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getAspectAffectedSigns,
  getTodaySkyCards,
  getTodaySkyUpdatedDate
} from "../src/lib/sky-events.ts";

const source = await readFile(new URL("../src/lib/sky-events.ts", import.meta.url), "utf8");
const component = await readFile(new URL("../src/components/today-sky-cards.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/sky-events.tsx", import.meta.url), "utf8");

test("trine affected-signs are the full element triplicity, not a guess", () => {
  assert.deepEqual(getAspectAffectedSigns("Libra", "Gemini", "trine").sort(), ["Aquarius", "Gemini", "Libra"].sort());
  assert.deepEqual(getAspectAffectedSigns("Leo", "Aries", "trine").sort(), ["Aries", "Leo", "Sagittarius"].sort());
});

test("square/opposition affected-signs are the full modality quadruplicity", () => {
  assert.deepEqual(
    getAspectAffectedSigns("Leo", "Scorpio", "square").sort(),
    ["Aquarius", "Leo", "Scorpio", "Taurus"].sort()
  );
  assert.deepEqual(
    getAspectAffectedSigns("Leo", "Aquarius", "opposition").sort(),
    ["Aquarius", "Leo", "Scorpio", "Taurus"].sort()
  );
  assert.deepEqual(
    getAspectAffectedSigns("Aries", "Libra", "opposition").sort(),
    ["Aries", "Cancer", "Capricorn", "Libra"].sort()
  );
});

test("conjunction affected-signs is just the shared sign", () => {
  assert.deepEqual(getAspectAffectedSigns("Scorpio", "Scorpio", "conjunction"), ["Scorpio"]);
});

test("today sky cards carry no invented timestamp precision and are internally consistent", () => {
  const cards = getTodaySkyCards();
  assert.ok(cards.length > 0, "expected at least one card");
  for (const card of cards) {
    assert.match(card.date, /^\d{4}-\d{2}-\d{2}$/, `card ${card.id} must use a plain calendar date, no fabricated clock time`);
    assert.ok(["A", "B"].includes(card.grade), `card ${card.id} must be graded A or B`);
    assert.equal(typeof card.visibleToNakedEye, "boolean");
    assert.ok(card.affectedSigns.length > 0, `card ${card.id} must derive at least one affected sign`);
    for (const lang of ["zh-Hant", "zh-Hans", "en"]) {
      assert.ok(card.title[lang], `card ${card.id} missing ${lang} title`);
      assert.ok(card.scienceLine[lang], `card ${card.id} missing ${lang} scienceLine`);
      assert.ok(card.theme[lang], `card ${card.id} missing ${lang} theme`);
    }
  }
});

test("only Saturn's own observable opposition is marked visible to the naked eye", () => {
  const cards = getTodaySkyCards();
  const pureAspectOrIngressIds = [
    "sun-trine-uranus-2026-09-28",
    "mercury-into-scorpio-2026-10-01",
    "mars-square-mercury-2026-10-02",
    "mars-trine-neptune-2026-10-02",
    "mars-opposite-pluto-2026-10-03"
  ];
  for (const id of pureAspectOrIngressIds) {
    const card = cards.find((c) => c.id === id);
    assert.ok(card, `expected card ${id} to exist`);
    assert.equal(card.visibleToNakedEye, false, `${id} is a geometric aspect/ingress and must not claim naked-eye visibility`);
  }
  const saturn = cards.find((c) => c.id === "saturn-opposition-2026-10-04");
  assert.ok(saturn, "expected the Saturn opposition card to exist");
  assert.equal(saturn.visibleToNakedEye, true, "Saturn at opposition is the one genuinely observable event and must stay marked visible");
});

test("getTodaySkyUpdatedDate reflects the latest card date", () => {
  const cards = getTodaySkyCards();
  const latest = [...cards].map((c) => c.date).sort().at(-1);
  assert.equal(getTodaySkyUpdatedDate(), latest);
});

test("corrected Uranus/Neptune signs are no longer misstated in SKY_EVENTS source", () => {
  assert.doesNotMatch(source, /天王星（金牛|Uranus \(Taurus\)/);
  assert.doesNotMatch(source, /海王星（雙魚|海王星（双鱼|Neptune \(Pisces\)/);
  assert.match(source, /天王星逆行（雙子|Uranus \(Gemini\)/);
  assert.match(source, /海王星逆行（白羊|Neptune \(Aries\)/);
});

test("today sky cards render on the /sky-events route above the deep-dive article", () => {
  assert.match(component, /export function TodaySkyCards/);
  assert.match(route, /import \{ TodaySkyCards \} from "@\/components\/today-sky-cards"/);
  const todayIndex = route.indexOf("<TodaySkyCards");
  const articleIndex = route.indexOf("sky-event-article");
  assert.ok(todayIndex > -1 && articleIndex > -1 && todayIndex < articleIndex, "today cards must appear before the deep-dive article");
});
