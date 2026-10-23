import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/routes/account.tsx", import.meta.url), "utf8");

test("owner console tabs are real deep links", () => {
  assert.match(source, /function consoleViewHref\(view: ConsoleView\)/);
  assert.match(source, /view === "overview" \? "\/account" : `\/account\?view=\$\{encodeURIComponent\(view\)\}`/);
  assert.match(source, /href=\{consoleViewHref\(view\)\}/);
  assert.match(source, /window\.history\.pushState/);
  assert.match(source, /window\.addEventListener\("popstate", restoreViewFromUrl\)/);
});

test("every owner console panel remains directly addressable", () => {
  for (const view of ["overview", "reports", "autopublish", "images", "opening", "themes", "promo", "articles", "devices"]) {
    assert.match(source, new RegExp(`\\["${view}",`), `missing console link for ${view}`);
  }
});
