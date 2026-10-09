import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("homepage (ZW-FE-02) renders four distinct portal cards and handles view switching", async () => {
  const home = await source("src/routes/index.tsx");

  // Four portals navigation cards with data-home-card attributes
  assert.match(home, /data-home-card=\{id\}/);
  assert.match(home, /NAV_ITEMS: \{ id: Section;/);
  assert.match(home, /id: "form"/);
  assert.match(home, /id: "today"/);
  assert.match(home, /id: "quiz"/);
  assert.match(home, /id: "notes"/);

  // Dedicated view switching condition
  assert.match(home, /activeSection === "today"/);
  assert.match(home, /activeSection === "form"/);
  assert.match(home, /activeSection === "quiz"/);
  assert.match(home, /activeSection === "notes"/);

  // Dedicated today guide view
  assert.match(home, /id="home-today-guide"/);
  assert.match(home, /LazyDailyAlmanacWidget/);
  assert.match(home, /LazySkyEventsHomeSection/);
});

test("homepage provides dedicated subview topbar with return-to-home action", async () => {
  const home = await source("src/routes/index.tsx");

  // Subview header and back button
  assert.match(home, /data-subview-header/);
  assert.match(home, /data-subview-back/);
  assert.match(home, /onClick=\{returnToHome\}/);

  // returnToHome resets activeSection and clears hash smoothly
  assert.match(home, /const returnToHome = \(\) => \{/);
  assert.match(home, /setActiveSection\(null\)/);
  assert.match(home, /window\.history\.pushState\(null, "", window\.location\.pathname\)/);
});

test("homepage supports direct hash routing and hashchange events for all four portals", async () => {
  const home = await source("src/routes/index.tsx");

  // Hash mappings
  assert.match(home, /BIRTH_HASHES = \[/);
  assert.match(home, /"#birth-form"/);
  assert.match(home, /TODAY_HASHES = \[/);
  assert.match(home, /"#today"/);
  assert.match(home, /QUIZ_HASHES = \[/);
  assert.match(home, /"#quiz"/);
  assert.match(home, /NOTES_HASHES = \[/);
  assert.match(home, /"#notes"/);

  // Window hashchange listener registration and cleanup
  assert.match(home, /window\.addEventListener\("hashchange", fromHash\)/);
  assert.match(home, /window\.removeEventListener\("hashchange", fromHash\)/);
});

test("result view enforces 3-part free report boundary and embeds paid destiny book unlock gateway", async () => {
  const resultView = await source("src/components/result-view.tsx");

  // Free report boundary: direct verdict + action guide + technical evidence
  assert.match(resultView, /data-technical-evidence/);
  assert.match(resultView, /data-destiny-unlock-gate/);

  // 2026-10-10 business decision: the quick tier is no longer sold — it is
  // a standing new-user welcome gift, so it has no purchase button and no
  // price card. Only system/bundle remain purchasable.
  assert.match(resultView, /新用戶的福利|新用户的福利|New-user welcome gift/);
  assert.doesNotMatch(resultView, /handleUnlock\("quick"\)/);
  assert.match(resultView, /REPORT_ACCESS_PRODUCTS\.system\.price/);
  assert.match(resultView, /REPORT_ACCESS_PRODUCTS\.bundle\.price/);
  assert.match(resultView, /handleUnlock\("system"\)/);
  assert.match(resultView, /handleUnlock\("bundle"\)/);

  // Free/paid boundary description
  assert.match(resultView, /十年大運|十年大运/);
  assert.match(resultView, /流年逐月/);
  assert.match(resultView, /神煞星曜/);
  assert.match(resultView, /五音/);
});
