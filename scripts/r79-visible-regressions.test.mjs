import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const visible = await readFile(new URL("../src/components/visible-regression-fixes-r79.tsx", import.meta.url), "utf8");
const yizhang = await readFile(new URL("../src/routes/yizhangjing.tsx", import.meta.url), "utf8");
const runtime = await readFile(new URL("../src/components/yizhangjing-runtime-r79.tsx", import.meta.url), "utf8");
const upload = await readFile(new URL("../src/lib/background-music-upload.ts", import.meta.url), "utf8");

test("homepage specialist systems render real reports inline instead of dead portal cards", () => {
  assert.match(root, /VisibleRegressionFixesR79/);
  assert.match(visible, /data-r79-report-stack/);
  assert.match(visible, /buildWesternReading/);
  assert.match(visible, /buildZiweiReading/);
  assert.match(visible, /buildQizhengReading/);
  assert.match(visible, /buildIndianReading/);
  assert.match(visible, /buildPalmReading/);
  assert.match(visible, /reading\.sections\.map/);
  assert.match(visible, /data-r79-inline-reports/);
  assert.match(visible, /\.zhaowu-home-portals \{ display: none !important; \}/);
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

test("mobile visual regressions are explicitly overridden", () => {
  assert.match(visible, /data-background-music-control/);
  assert.match(visible, /right: max\(\.65rem, env\(safe-area-inset-right\)\)/);
  assert.match(visible, /data-r79-scent/);
  assert.match(visible, /grid-template-columns: repeat\(2, minmax\(0,1fr\)\)/);
});
