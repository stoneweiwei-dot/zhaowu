import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const share = await readFile(new URL("../src/lib/report/share-card.ts", import.meta.url), "utf8");

test("share card uses the approved day-master sprite registry", () => {
  assert.match(share, /getReportVisualAsset\("day-master", visual\.dayMaster\.visualKey\)/);
  assert.match(share, /type ReportVisualAsset/);
  assert.doesNotMatch(share, /artworkPath:\s*visual\.dayMaster\.imagePath/);
});

test("share card crops the selected sprite frame and keeps Canvas export CORS-safe", () => {
  assert.match(share, /image\.naturalWidth \/ asset\.count/);
  assert.match(share, /asset\.index \* sourceWidth/);
  assert.match(share, /image\.crossOrigin = "anonymous"/);
  assert.match(share, /\/wallpaper-song\.jpg/);
});
