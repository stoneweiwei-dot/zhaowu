// Independent-oracle accuracy regression for the BaZi calendar/chart engine.
//
// Oracles (none of them share code or formulas with src/lib/bazi):
//   sxtwl            – Xu Shi-ji SSQ astronomical calendar (solar terms, day/hour pillars)
//   astropy / ERFA   – apparent geocentric ecliptic longitude + GAST (solar terms, true solar time)
//   lunar-javascript – 6tail almanac (year/month/day pillars, 大運)
//   python zoneinfo  – tz offsets
// Fixtures + generators: scripts/fixtures/bazi-oracle/ (see README.md there).
//
// Policy: `test(...)` = must pass today (guards against regressions).
//         `test(..., { todo })` = KNOWN DEFECT vs the oracle; reported, does not fail the suite.
//         When the defect is fixed, the todo test will pass and must be flipped to a strict test.
import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, test } from "node:test";

import { dayGanzhi, dayunPeriods, hourPillar, solarTermUtc, yearMonthPillars } from "../src/lib/bazi/calendar.ts";
import { timezoneOffsetHours } from "../src/lib/bazi/cities.ts";
import { toTrueSolar } from "../src/lib/bazi/solar-time.ts";

const FX = new URL("./fixtures/bazi-oracle/", import.meta.url);
const load = (name) => JSON.parse(fs.readFileSync(new URL(name, FX), "utf8"));

const TERMS = load("solar-terms-1900-2100.json"); // {year:{term:[sxtwl_s, astropy_s]}}
const SOLAR_CASES = load("true-solar-cases.json");
const HOURS = load("hour-pillar-sxtwl.json");
const DAYS = load("day-pillar-sxtwl.json");
const DAYUN = load("dayun-cases.json");

const JIE = {
  小寒: [285, "丑"], 立春: [315, "寅"], 驚蟄: [345, "卯"], 清明: [15, "辰"], 立夏: [45, "巳"], 芒種: [75, "午"],
  小暑: [105, "未"], 立秋: [135, "申"], 白露: [165, "酉"], 寒露: [195, "戌"], 立冬: [225, "亥"], 大雪: [255, "子"],
};
const JIE_NAMES = Object.keys(JIE);
const sxtwl = (y, n) => TERMS[y][n][0];
const astro = (y, n) => TERMS[y][n][1];
const maxAbs = (arr) => arr.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

describe("oracle self-consistency (fixtures are trustworthy)", () => {
  const bands = [
    [1930, 2025, 20],
    [1900, 1929, 40],
    [2026, 2050, 60],
  ];
  for (const [lo, hi, tol] of bands) {
    test(`sxtwl vs astropy solar terms ${lo}-${hi} within ${tol}s`, () => {
      const d = [];
      for (let y = lo; y <= hi; y++) for (const n of JIE_NAMES) d.push(sxtwl(y, n) - astro(y, n));
      assert.ok(maxAbs(d) <= tol, `max |sxtwl-astropy| = ${maxAbs(d)}s`);
    });
  }
  test("fixture covers 201 years x 12 節", () => {
    assert.equal(Object.keys(TERMS).length, 201);
    for (const y of Object.keys(TERMS)) assert.equal(Object.keys(TERMS[y]).length, 12);
  });
});

describe("day pillar", () => {
  test("matches sxtwl on 1054 anchor dates (1900-2100, incl. leap days and year ends)", () => {
    for (const [y, m, d, gz] of DAYS) assert.equal(dayGanzhi(y, m, d), gz, `${y}-${m}-${d}`);
  });
  test("advances by exactly one 干支 per civil day, 1900-01-01..2100-12-31", () => {
    const order = new Map();
    const STEM = "甲乙丙丁戊己庚辛壬癸", BR = "子丑寅卯辰巳午未申酉戌亥";
    for (let i = 0; i < 60; i++) order.set(STEM[i % 10] + BR[i % 12], i);
    let prev = null;
    for (let t = Date.UTC(1900, 0, 1); t <= Date.UTC(2100, 11, 31); t += 86_400_000) {
      const dt = new Date(t);
      const idx = order.get(dayGanzhi(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()));
      if (prev !== null) assert.equal(idx, (prev + 1) % 60, dt.toISOString().slice(0, 10));
      prev = idx;
    }
  });
});

describe("hour pillar", () => {
  const STEM = "甲乙丙丁戊己庚辛壬癸";
  test("matches sxtwl (plain 子時 mode) for every day-stem x hour 0-23", () => {
    for (let s = 0; s < 10; s++)
      for (let h = 0; h < 24; h++) assert.equal(hourPillar(STEM[s] + "子", h), HOURS.plain[`${s}-${h}`], `stem ${s} hour ${h}`);
  });
  test("convention gap vs 晚子時 mode is exactly hour 23 (documented, owner-locked ziPolicy 'midnight')", () => {
    const diff = new Set();
    for (let s = 0; s < 10; s++)
      for (let h = 0; h < 24; h++) if (hourPillar(STEM[s] + "子", h) !== HOURS.zaowan[`${s}-${h}`]) diff.add(h);
    assert.deepEqual([...diff], [23]);
  });
});

describe("solar terms (節) vs sxtwl", () => {
  const rows = [];
  for (let y = 1930; y <= 2050; y++)
    for (const n of JIE_NAMES) rows.push({ y, n, d: solarTermUtc(y, JIE[n][0]).getTime() / 1000 - sxtwl(y, n) });

  test("every 節 1930-2050 within 15 min of sxtwl (guard for the analytic fallback)", () => {
    assert.ok(maxAbs(rows.map((r) => r.d)) <= 15 * 60, `max ${maxAbs(rows.map((r) => r.d))}s`);
  });
  test("no systematic drift: mean error within ±5 min", () => {
    const mean = rows.reduce((s, r) => s + r.d, 0) / rows.length;
    assert.ok(Math.abs(mean) <= 300, `mean ${mean}s`);
  });
  test("every 節 1930-2050 within 90 s of sxtwl", () => {
    const worst = rows.reduce((a, r) => (Math.abs(r.d) > Math.abs(a.d) ? r : a));
    assert.ok(Math.abs(worst.d) <= 90, `worst ${worst.y}${worst.n} ${worst.d.toFixed(0)}s`);
  });
});

describe("year / month pillar at 節 boundaries", () => {
  const BR = (n) => JIE[n][1];
  const prevName = (n) => JIE_NAMES[(JIE_NAMES.indexOf(n) + 11) % 12];
  const gzIdx = (gz) => { for (let i = 0; i < 60; i++) if ("甲乙丙丁戊己庚辛壬癸"[i % 10] === gz[0] && "子丑寅卯辰巳午未申酉戌亥"[i % 12] === gz[1]) return i; };

  function probe(offsetSec, lo, hi) {
    const miss = [];
    for (let y = lo; y <= hi; y++)
      for (const n of JIE_NAMES) {
        const t = sxtwl(y, n) + offsetSec;
        const r = yearMonthPillars(new Date(t * 1000));
        const wantBranch = offsetSec < 0 ? BR(prevName(n)) : BR(n);
        if (r.month[1] !== wantBranch) miss.push(`${y}${n}${offsetSec > 0 ? "+" : ""}${offsetSec}`);
        if (n === "立春") {
          const wantYear = (((offsetSec < 0 ? y - 1 : y) - 1984) % 60 + 60) % 60;
          if (gzIdx(r.year) !== wantYear) miss.push(`${y}立春年柱${offsetSec}`);
        }
      }
    return miss;
  }
  for (const off of [-1200, 1200, -3600, 3600])
    test(`month + 立春 year pillar correct at 節 ${off > 0 ? "+" : ""}${off / 60} min, 1930-2050`, () => {
      const miss = probe(off, 1930, 2050);
      assert.equal(miss.length, 0, miss.slice(0, 5).join(", "));
    });
  for (const off of [-120, 120])
    test(`month + 立春 year pillar correct at 節 ${off > 0 ? "+" : ""}${off} s, 1930-2050`, () => {
      const miss = probe(off, 1930, 2050);
      assert.equal(miss.length, 0, `${miss.length} wrong, e.g. ${miss.slice(0, 5).join(", ")}`);
    });
});

describe("timezone offsets (Intl/ICU vs python zoneinfo, 1930-2026)", () => {
  test("all fixture cases agree", () => {
    const bad = SOLAR_CASES.filter((c) => timezoneOffsetHours(c.tz, new Date(c.utcMs)) !== c.offsetHours);
    assert.equal(bad.length, 0, bad.slice(0, 3).map((c) => `${c.tz} ${c.civil.join("-")}`).join("; "));
  });
});

describe("true solar time vs astropy/ERFA apparent-sun hour angle (1930-2026, 14 cities)", () => {
  const err = SOLAR_CASES.map((c) => {
    const [year, month, day, hour, minute] = c.civil;
    const r = toTrueSolar({ year, month, day, hour, minute, longitude: c.lon, tzOffsetHours: c.offsetHours });
    return { c, e: r.shiftMinutes - c.oracleShiftMin };
  });
  test("|shift error| ≤ 3.5 min on every case (measured max ≈ 2.3 min)", () => {
    const w = err.reduce((a, x) => (Math.abs(x.e) > Math.abs(a.e) ? x : a));
    assert.ok(Math.abs(w.e) <= 3.5, `worst ${w.e.toFixed(2)} min @ ${w.c.place} ${w.c.civil.join("-")}`);
  });
  test("no bias: mean error within ±0.5 min", () => {
    const mean = err.reduce((s, x) => s + x.e, 0) / err.length;
    assert.ok(Math.abs(mean) <= 0.5, `mean ${mean.toFixed(3)} min`);
  });
});

describe("大運 vs lunar-javascript (400 seeded charts, Beijing clock 1930-2010)", () => {
  const run = (c) => {
    const [Y, M, D, h, mi] = c.birthBJT;
    const birth = new Date(Date.UTC(Y, M - 1, D, h - 8, mi));
    return { birth, out: dayunPeriods({ yearGz: c.year, monthGz: c.month, gender: c.gender, birth }) };
  };
  test("year / month / day pillars equal lunar-javascript", () => {
    const bad = [];
    for (const c of DAYUN) {
      const [Y, M, D, h, mi] = c.birthBJT;
      const r = yearMonthPillars(new Date(Date.UTC(Y, M - 1, D, h - 8, mi)));
      if (r.year !== c.year || r.month !== c.month || dayGanzhi(Y, M, D) !== c.day) bad.push(c.birthBJT.join("-"));
    }
    assert.equal(bad.length, 0, bad.slice(0, 5).join("; "));
  });
  test("direction + first 大運 pillar equal lunar-javascript", () => {
    const bad = DAYUN.filter((c) => run(c).out[0].ganZhi !== c.firstGz);
    assert.equal(bad.length, 0, bad.slice(0, 5).map((c) => c.birthBJT.join("-") + c.gender).join("; "));
  });
  test("first 大運 startYear within ±1 year of lunar-javascript", () => {
    const bad = DAYUN.filter((c) => Math.abs(run(c).out[0].startYear - c.startYear) > 1);
    assert.equal(bad.length, 0, `${bad.length} charts differ by >1y`);
  });
  test("first 大運 startYear equals lunar-javascript exactly", { todo: "FINDING: rounding rule (days/3 → Math.round(frac*12) month offset, cursor on civil month/day) differs from almanac in ≈2% of charts, always by 1 year" }, () => {
    const bad = DAYUN.filter((c) => run(c).out[0].startYear !== c.startYear);
    assert.equal(bad.length, 0, `${bad.length}/${DAYUN.length} differ`);
  });
});
