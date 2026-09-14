import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { classifyMingshuSource, sanitizeChartInput } from "../lib/mingshu-client.js";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("chart input is stripped to the public contract and rejects unknown-time guesses", () => {
  const bad = sanitizeChartInput({ birthDate: "1988-10-04" });
  assert.equal(bad.ok, false);
  const clock = sanitizeChartInput({
    birthDate: "1988-10-04",
    birthTime: "04:40",
    birthCalendar: "solar",
    gender: "male",
    timeMode: "clock",
    locale: "zh-TW",
    extra: "drop-me",
  });
  assert.equal(clock.ok, true);
  assert.deepEqual(clock.input, {
    birthDate: "1988-10-04",
    birthTime: "04:40",
    birthCalendar: "solar",
    gender: "male",
    timeMode: "clock",
    locale: "zh-TW",
  });
  const solar = sanitizeChartInput({
    birthDate: "1988-10-04",
    birthTime: "04:40",
    birthCalendar: "solar",
    gender: "male",
    timeMode: "true_solar",
    locale: "zh-TW",
  });
  assert.equal(solar.ok, false);
});

test("mingshu source is labeled as a side channel, not calc truth", () => {
  const sourceMeta = classifyMingshuSource({ chartDigest: "abc" });
  assert.equal(sourceMeta.calcTruth, false);
  assert.equal(sourceMeta.layer, "SIDE_CHANNEL");
  assert.match(sourceMeta.note, /不得覆蓋/);
});

test("API handlers stay self-contained and off the SPA rewrite", async () => {
  const doctor = await source("api/mingshu-doctor.js");
  const chart = await source("api/mingshu-chart.js");
  const client = await source("lib/mingshu-client.js");
  const vercel = JSON.parse(await source("vercel.json"));
  const chartTs = await source("src/lib/bazi/chart.ts");
  const calendar = await source("src/lib/bazi/calendar.ts");
  const actions = await source("src/lib/actions.ts");
  assert.doesNotMatch(doctor, /from ["']\.\.\/src\//);
  assert.doesNotMatch(chart, /from ["']\.\.\/src\//);
  assert.match(doctor, /\/api\/v1\/capabilities/);
  assert.doesNotMatch(doctor, /birthDate/);
  assert.match(chart, /OWNER_REQUIRED/);
  assert.match(chart, /__Host-zhaowu_owner_session/);
  assert.match(chart, /6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07/);
  assert.match(chart, /wiredIntoFinalizeReading: false/);
  assert.match(client, /https:\/\/mingshu\.help/);
  assert.equal(vercel.functions["api/mingshu-doctor.js"].maxDuration, 10);
  assert.equal(vercel.functions["api/mingshu-chart.js"].maxDuration, 15);
  assert.equal(vercel.rewrites.at(-1).source, "/((?!api/).*)");
  assert.doesNotMatch(chartTs, /mingshu/);
  assert.doesNotMatch(calendar, /mingshu/);
  assert.doesNotMatch(actions, /mingshu/);
});

test("r138 release ledger and contract docs exist", async () => {
  const stats = await source("src/lib/site-stats.ts");
  const report = await source("docs/change-reports/ZW-WEB-2026.09.15-r138.md");
  const docs = await source("docs/MINGSHU-CALL-LAYER.md");
  const note = await source("docs/INSTRUCTION-REGISTRY-NOTE-r138.md");
  assert.match(stats, /ZW-WEB-2026\.09\.15-r138/);
  assert.match(stats, /updateNumber:\s*138/);
  assert.match(report, /# 昭梧更新報告｜ZW-WEB-2026.09.15-r138/);
  assert.match(docs, /SIDE_CHANNEL/);
  assert.match(docs, /\/api\/mingshu-doctor/);
  assert.match(note, /MINGSHU-CALL-LAYER/);
  assert.match(note, /SIDE_CHANNEL/);
});
