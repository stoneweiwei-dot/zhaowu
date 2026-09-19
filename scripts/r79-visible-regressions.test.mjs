import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const design = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const yizhang = await readFile(new URL("../src/routes/yizhangjing.tsx", import.meta.url), "utf8");
const runtime = await readFile(new URL("../src/components/yizhangjing-runtime-r79.tsx", import.meta.url), "utf8");
const upload = await readFile(new URL("../src/lib/background-music-upload.ts", import.meta.url), "utf8");
const unified = await readFile(new URL("../src/components/unified-birth-report.tsx", import.meta.url), "utf8");

test("homepage specialist systems stay internal behind one React report instead of the R79 injector", () => {
  assert.doesNotMatch(root, /VisibleRegressionFixesR79/);
  assert.doesNotMatch(root, /mobile-foundation-r81\.css/);
  assert.match(main, /zhaowu-design-system\.css/);
  assert.doesNotMatch(home, /buildWesternReading|buildZiweiReading|zhaowu-home-portals|data-specialist-link/);
  assert.match(unified, /buildWesternReading/);
  assert.match(unified, /buildZiweiReading/);
  assert.match(unified, /buildQizhengReading/);
  assert.match(unified, /buildIndianReading/);
  assert.match(unified, /buildPalmReading/);
  assert.match(unified, /data-unified-birth-report/);
});

test("One-Palm runtime submits on first load and direction changes while D60 stays on Indian astrology", () => {
  assert.doesNotMatch(yizhang, /SpecialistSystemPage/);
  assert.match(yizhang, /<PalmStandalone \/>/);
  assert.doesNotMatch(yizhang, /D60KarmaSection/);
  assert.match(yizhang, /<YizhangjingRuntimeR79 \/>/);
  assert.doesNotMatch(runtime, /zhaowu:d60-birth/);
  assert.doesNotMatch(runtime, /readSharedBirthRecord/);
  assert.match(runtime, /palm-direction/);
  assert.match(runtime, /submitPalm\(false\)/);
  assert.match(runtime, /submitPalm\(true\)/);
});

test("owner audio upload cannot hang on a remote browser transcoder anymore", () => {
  assert.doesNotMatch(upload, /@ffmpeg\/ffmpeg/);
  assert.doesNotMatch(upload, /ffmpeg-core/);
  assert.match(upload, /native-aac/);
  assert.match(upload, /native-aac-m4a/);
  assert.match(upload, /直接上傳原始音訊/);
});

test("mobile visual fixes are static, compact and scent stays collapsed until requested", () => {
  assert.match(design, /data-background-music-control/);
  assert.match(design, /safe-area-inset-right/);
  assert.match(design, /zhaowu-pillar-detail-grid/);
  assert.match(design, /data-scent-panel/);
  assert.match(home, /aria-expanded=\{scentOpen\}/);
  assert.match(home, /hidden=\{!scentOpen\}/);
  assert.doesNotMatch(root, /MutationObserver|createPortal/);
  assert.doesNotMatch(design, /MutationObserver|createPortal/);
});
