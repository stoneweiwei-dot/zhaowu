import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildFiveTonePlan,
  matchFiveToneTracks,
  parseFiveToneTrackName,
  resolveFiveTonePrimary,
} from "../src/lib/report/five-tone-gift.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("paid levels grant 1, 3 and 5 distinct five-tone tracks around the chart emphasis", () => {
  const expected = { quick: 1, system: 3, bundle: 5 };
  for (const primary of ["木", "火", "土", "金", "水"]) {
    for (const [level, count] of Object.entries(expected)) {
      const plan = buildFiveTonePlan(primary, level);
      assert.equal(plan.length, count);
      assert.equal(new Set(plan.map((item) => item.element)).size, count);
      assert.equal(plan.find((item) => item.role === "primary")?.element, primary);
    }
  }
});

test("the primary tone follows structural useful-element output and only falls back to the day master", () => {
  assert.equal(resolveFiveTonePrimary({ useful: ["水", "木"], dayMasterElement: "火" }), "水");
  assert.equal(resolveFiveTonePrimary({ useful: [], dayMasterElement: "土" }), "土");
});

test("only the standardized owner-library five-tone names can fulfill the gift", () => {
  const tracks = [
    { id: "wood", name: "木｜角音｜Beneath the Ancient Canopy", url: "/wood.mp3", contentType: "audio/mpeg", fileSize: 1, enabled: false, createdAt: null },
    { id: "fire", name: "火｜徵音｜雲鶴為橋", url: "/fire.mp3", contentType: "audio/mpeg", fileSize: 1, enabled: false, createdAt: null },
    { id: "other", name: "普通背景音樂", url: "/other.mp3", contentType: "audio/mpeg", fileSize: 1, enabled: true, createdAt: null },
  ];
  assert.deepEqual(parseFiveToneTrackName(tracks[0].name), { element: "木", tone: "角", title: "Beneath the Ancient Canopy" });
  assert.equal(parseFiveToneTrackName(tracks[2].name), null);
  const matched = matchFiveToneTracks(buildFiveTonePlan("木", "system"), tracks);
  assert.equal(matched.find((item) => item.element === "木")?.track?.id, "wood");
  assert.equal(matched.find((item) => item.element === "火")?.track?.id, "fire");
  assert.equal(matched.find((item) => item.element === "水")?.track, null);
});

test("every paid choice states its extra value and verified access renders the playable gift", async () => {
  const [gate, gift, css, specialist, palm, numerology, unified] = await Promise.all([
    read("src/components/report-access-gate.tsx"),
    read("src/components/five-tone-gift.tsx"),
    read("src/report-access.css"),
    read("src/components/specialist-system-page.tsx"),
    read("src/components/palm-standalone.tsx"),
    read("src/routes/numerology.tsx"),
    read("src/components/unified-birth-report.tsx"),
  ]);
  for (const phrase of ["命盤主音 1 首", "生扶／主音／疏導 3 首", "五音完整序列 5 首"]) assert.match(gate, new RegExp(phrase));
  assert.match(gate, /<FiveToneGift[\s\S]*level=\{level\}/);
  assert.match(gate, /<FiveToneGift[\s\S]*level="quick"/);
  assert.match(gift, /loadOwnerMusic/);
  assert.match(gift, /data-background-music-control/);
  assert.match(gift, /不是按五行數量「缺什麼補什麼」/);
  assert.match(gift, /不替代醫療、心理治療或專業診斷/);
  assert.match(gate, /五音療癒聆聽贈曲/);
  assert.match(gate, /不替代醫療、心理治療或專業診斷/);
  assert.match(css, /\.zhaowu-five-tone-gift/);
  assert.match(css, /grid-template-columns: 23px minmax\(0, 1fr\) 44px/);
  for (const surface of [specialist, palm, numerology, unified]) assert.match(surface, /birth=\{/);
});
