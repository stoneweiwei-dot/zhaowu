import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const r81 = await readFile(new URL("../src/mobile-foundation-r81.css", import.meta.url), "utf8");
const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const yizhang = await readFile(new URL("../src/routes/yizhangjing.tsx", import.meta.url), "utf8");
const runtime = await readFile(new URL("../src/components/yizhangjing-runtime-r79.tsx", import.meta.url), "utf8");
const upload = await readFile(new URL("../src/lib/background-music-upload.ts", import.meta.url), "utf8");

test("homepage specialist systems stay in React instead of the R79 runtime DOM injector", () => {
  assert.doesNotMatch(root, /VisibleRegressionFixesR79/);
  assert.match(root, /mobile-foundation-r81\.css/);
  assert.match(home, /buildWesternReading/);
  assert.match(home, /buildZiweiReading/);
  assert.match(home, /buildQizhengReading/);
  assert.match(home, /buildIndianReading/);
  assert.match(home, /buildPalmReading/);
  assert.match(home, /zhaowu-home-portals/);
});

test("One-Palm and D60 react both on first load and every later direction change", () => {
  assert.doesNotMatch(yizhang, /SpecialistSystemPage/);
  assert.match(yizhang, /<PalmStandalone \/>/);
  assert.match(yizhang, /<D60KarmaSection \/>/);
  assert.match(yizhang, /<YizhangjingRuntimeR79 \/>/);
  assert.match(runtime, /zhaowu:d60-birth/);
  assert.match(runtime, /readSharedBirthRecord/);
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
  assert.match(r81, /data-background-music-control/);
  assert.match(r81, /safe-area-inset-right/);
  assert.match(r81, /zhaowu-pillar-detail-grid/);
  assert.match(r81, /data-scent-panel/);
  assert.match(home, /aria-expanded=\{scentOpen\}/);
  assert.match(home, /hidden=\{!scentOpen\}/);
  assert.doesNotMatch(root, /MutationObserver|createPortal/);
});
