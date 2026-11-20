import test from "node:test";
import assert from "node:assert/strict";

const {
  getChinaPlaces,
  searchChinaPlaces,
  fuzzyChinaPlaces,
  nearestPlace,
  isKnownPlace,
  localizeChinaPlace,
} = await import("../src/lib/geo/china-places.ts");

const places = getChinaPlaces();
const byName = (name) => places.find((p) => p.name === name);

test("gazetteer covers every prefecture-level division with unique keys", () => {
  const pref = places.filter((p) => p.kind === "prefecture");
  assert.ok(pref.length >= 330, `prefecture entries: ${pref.length}`);
  assert.ok(places.filter((p) => p.kind === "county").length >= 150);
  assert.equal(places.filter((p) => p.kind === "taiwan").length, 22);
  assert.equal(new Set(places.map((p) => p.key)).size, places.length, "keys unique");
  assert.equal(
    new Set(places.map((p) => `${p.latitude},${p.longitude}`)).size,
    places.length,
    "coordinates unique (localisation is keyed by coordinate)",
  );
});

test("every entry has plausible coordinates, timezone, pinyin and display", () => {
  const allowed = new Set(["Asia/Shanghai", "Asia/Taipei", "Asia/Hong_Kong", "Asia/Macau"]);
  for (const p of places) {
    assert.ok(p.latitude >= 16 && p.latitude <= 54, `${p.key} lat`);
    assert.ok(p.longitude >= 73 && p.longitude <= 136, `${p.key} lon`);
    assert.ok(allowed.has(p.timezone), `${p.key} timezone`);
    assert.match(p.pinyin, /^[a-z]+$/, `${p.key} pinyin`);
    assert.equal(p.hit.timezone, p.timezone);
    assert.ok(p.display.length > 0 && p.hans.length > 0);
  }
  assert.equal(byName("臺北市").timezone, "Asia/Taipei");
  assert.equal(byName("香港").timezone, "Asia/Hong_Kong");
  assert.equal(byName("澳門").timezone, "Asia/Macau");
  assert.equal(byName("烏魯木齊").timezone, "Asia/Shanghai");
});

test("10 spot-checks within 0.15 degrees", () => {
  const spots = [
    ["洛陽", 34.62, 112.45], ["徐州", 34.26, 117.18], ["汕頭", 23.35, 116.68], ["贛州", 25.83, 114.93],
    ["蘭州", 36.06, 103.83], ["烏魯木齊", 43.83, 87.62], ["拉薩", 29.65, 91.12], ["呼和浩特", 40.84, 111.75],
    ["桂林", 25.27, 110.29], ["宜昌", 30.69, 111.29],
  ];
  for (const [name, lat, lon] of spots) {
    const p = byName(name);
    assert.ok(p, name);
    assert.ok(Math.abs(p.latitude - lat) <= 0.15 && Math.abs(p.longitude - lon) <= 0.15, name);
  }
});

test("search by Simplified, Traditional, pinyin and partial name returns the right city first", () => {
  const first = (q) => searchChinaPlaces(q)[0];
  for (const q of ["洛阳", "洛陽", "luoyang", "Luo Yang", "洛阳市", "河南洛阳"]) assert.equal(first(q)?.name, "洛陽", q);
  for (const q of ["徐州", "xuzhou"]) assert.equal(first(q)?.name, "徐州", q);
  for (const q of ["汕頭", "汕头", "shantou"]) assert.equal(first(q)?.name, "汕頭", q);
  for (const q of ["赣州", "贛州", "ganzhou"]) assert.equal(first(q)?.name, "贛州", q);
  assert.equal(first("乌鲁木齐")?.name, "烏魯木齊");
  assert.equal(first("urumqi")?.name, "烏魯木齊");
  assert.equal(first("台北")?.name, "臺北市");
  assert.equal(first("臺北市")?.name, "臺北市");
  assert.equal(first("昆山")?.name, "昆山");
  assert.equal(first("义乌")?.name, "義烏");
  assert.equal(first("延吉")?.name, "延邊");
  const hit = first("洛阳");
  assert.equal(hit.display, "洛陽，河南，中國");
  assert.equal(hit.timezone, "Asia/Shanghai");
  assert.equal(first("上海").display, "上海，中國");
  assert.equal(first("香港").display, "香港");
});

test("fuzzy fallback always offers selectable options for near-miss input", () => {
  assert.equal(fuzzyChinaPlaces("洛楊")[0]?.name, "洛陽");
  assert.equal(fuzzyChinaPlaces("徐洲")[0]?.name, "徐州");
  assert.equal(fuzzyChinaPlaces("luoyan")[0]?.name, "洛陽");
  assert.ok(fuzzyChinaPlaces("我出生在洛阳市区").some((h) => h.name === "洛陽"));
  assert.deepEqual(searchChinaPlaces("zzzzqq"), []);
});

test("nearestPlace uses haversine over the gazetteer", () => {
  const near = nearestPlace(34.5, 112.4);
  assert.equal(near.hit.name, "洛陽");
  assert.ok(near.distanceKm < 30);
  assert.equal(nearestPlace(30.25, 120.15).hit.name, "杭州");
  assert.equal(nearestPlace(34.5, 112.4, 1), null);
  assert.equal(nearestPlace(Number.NaN, 1), null);
});

test("isKnownPlace recognises remote restatements but not distant namesakes", () => {
  assert.ok(isKnownPlace("洛阳市", 34.66, 112.43));
  assert.ok(isKnownPlace("Luoyang", 34.66, 112.43));
  assert.ok(!isKnownPlace("洛陽", 10, 10));
  assert.ok(!isKnownPlace("孟津", 34.83, 112.43));
});

test("localised display for Simplified and English", () => {
  const luoyang = byName("洛陽");
  assert.equal(localizeChinaPlace(luoyang, "zh-Hans"), "洛阳，河南，中国");
  assert.equal(localizeChinaPlace(luoyang, "en"), "Luoyang, Henan, China");
  assert.equal(localizeChinaPlace(luoyang, "zh-Hant"), "洛陽，河南，中國");
  assert.equal(localizeChinaPlace({ latitude: 1, longitude: 1 }, "en"), null);
});
