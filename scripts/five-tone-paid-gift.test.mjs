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

test("free and paid levels grant 1 and 3 distinct five-tone tracks around the chart emphasis", () => {
  const expected = { quick: 1, system: 3 };
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
    { id: "wood", name: "木｜角音｜Beneath the Ancient Canopy", url: "/wood.mp3", contentType: "audio/mpeg", fileSize: 1, enabled: true, createdAt: null },
    { id: "fire", name: "火｜徵音｜雲鶴為橋", url: "/fire.mp3", contentType: "audio/mpeg", fileSize: 1, enabled: true, createdAt: null },
    { id: "other", name: "普通背景音樂", url: "/other.mp3", contentType: "audio/mpeg", fileSize: 1, enabled: true, createdAt: null },
  ];
  assert.deepEqual(parseFiveToneTrackName(tracks[0].name), { element: "木", tone: "角", title: "Beneath the Ancient Canopy" });
  assert.equal(parseFiveToneTrackName(tracks[2].name), null);
  const matched = matchFiveToneTracks(buildFiveTonePlan("木", "system"), tracks);
  assert.equal(matched.find((item) => item.element === "木")?.track?.id, "wood");
  assert.equal(matched.find((item) => item.element === "火")?.track?.id, "fire");
  assert.equal(matched.find((item) => item.element === "水")?.track, null);
});

test("the descriptive owner-library five-tone names (as stored live) also fulfill the gift", () => {
  // Live owner-music names, 2026-11-25: descriptive Chinese name + English "Element · Tone · title".
  // The old standardized form above still works; this form is what the library actually stores,
  // and the parser must accept it or every gift button stays "syncing from the music library".
  const live = [
    { id: "jue", name: "古木角聲｜Wood · Jue · Ancient Grove", element: "木", tone: "角", title: "古木角聲" },
    { id: "zhi", name: "雲鶴徵聲｜Fire · Zhi · Cloud Crane", element: "火", tone: "徵", title: "雲鶴徵聲" },
    { id: "gong", name: "山寺宮聲｜Earth · Gong · Mountain Temple", element: "土", tone: "宮", title: "山寺宮聲" },
    { id: "shang", name: "石英商聲｜Metal · Shang · Quartz", element: "金", tone: "商", title: "石英商聲" },
    { id: "yu", name: "清蓮羽聲｜Water · Yu · Clear Lotus", element: "水", tone: "羽", title: "清蓮羽聲" },
  ];
  for (const track of live) {
    assert.deepEqual(parseFiveToneTrackName(track.name), { element: track.element, tone: track.tone, title: track.title });
  }
  // A mismatched element/tone pair still fulfills nothing.
  assert.equal(parseFiveToneTrackName("古木角聲｜Fire · Jue · Mismatch"), null);
  assert.equal(parseFiveToneTrackName("普通背景音樂"), null);
  const tracks = live.map((t) => ({ id: t.id, name: t.name, url: `/${t.id}.mp3`, contentType: "audio/mpeg", fileSize: 1, enabled: true, createdAt: null }));
  for (const primary of ["木", "火", "土", "金", "水"]) {
    const matched = matchFiveToneTracks(buildFiveTonePlan(primary, "system"), tracks);
    assert.equal(matched.length, 3);
    for (const item of matched) assert.ok(item.track, `expected a playable track for ${item.element} (${primary} primary)`);
  }
});

test("the report stays primary while every verified paid level includes its playable five-tone gift", async () => {
  const [gate, gift, css, specialist, palm, numerology, unified] = await Promise.all([
    read("src/components/report-access-gate.tsx"),
    read("src/components/five-tone-gift.tsx"),
    read("src/report-access.css"),
    read("src/components/specialist-system-page.tsx"),
    read("src/components/palm-standalone.tsx"),
    read("src/routes/numerology.tsx"),
    read("src/components/unified-birth-report.tsx"),
  ]);
  assert.match(gate, /你購買的是命盤解讀/);
  for (const phrase of ["隨報告附贈｜命盤主音 1 首", "隨報告附贈｜生扶音・主音・疏導音 3 首"]) assert.match(gate, new RegExp(phrase));
  assert.doesNotMatch(gate, /昭梧不只給文字解讀/);
  assert.match(gate, /\{personal\}\{full\}<FiveToneGift/);
  assert.match(gate, /\{quick\}<FiveToneGift/);
  assert.match(gate, /<FiveToneGift[\s\S]*level=\{level\}/);
  assert.match(gate, /<FiveToneGift[\s\S]*level="quick"/);
  assert.match(gift, /loadOwnerMusic/);
  assert.match(gift, /data-background-music-control/);
  assert.match(gift, /不是按五行數量「缺什麼補什麼」/);
  assert.match(gift, /不替代醫療、心理治療或專業診斷/);
  assert.match(gift, /隨報告附贈 · 五音/);
  assert.match(gate, /不替代醫療、心理治療或專業診斷/);
  assert.match(css, /\.zhaowu-five-tone-gift/);
  assert.match(css, /\.zhaowu-report-pricing p \{[\s\S]*font-size: 14px/);
  assert.match(css, /\.zhaowu-report-pricing article > small \{[\s\S]*font-size: 12px/);
  assert.match(css, /grid-template-columns: 23px minmax\(0, 1fr\) 44px/);
  for (const surface of [specialist, palm, numerology, unified]) assert.match(surface, /birth=\{/);
});
