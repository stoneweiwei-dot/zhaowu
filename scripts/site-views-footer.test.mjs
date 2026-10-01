import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Owner 2026-10-01: view counts must be visible to visitors. The header status strip's spans are hidden by the
// layout system (display:none !important), so the counts must live in the page footer.
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");

test("footer shows today and total views from the existing counter", () => {
  assert.match(shell, /data-site-views/);
  assert.match(shell, /stats\.todayVisits/);
  assert.match(shell, /stats\.totalVisits/);
  assert.match(shell, /今日瀏覽/);
  assert.match(shell, /累計瀏覽/);
  assert.match(shell, /Total views/);
});

test("footer counts are not shown as a misleading zero before the counter loads", () => {
  assert.match(shell, /stats\.totalVisits > 0 \?/);
});

test("footer view-count line is styled and the counter RPC is unchanged", () => {
  assert.match(css, /\.zhaowu-site-footer \.zhaowu-site-views/);
  const stats = /rpc\/zhaowu_record_visit/;
  return readFile(new URL("../src/lib/site-stats.ts", import.meta.url), "utf8").then((src) => assert.match(src, stats));
});
