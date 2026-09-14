import {
  BRANCH_ELEMENT,
  ELEMENT_GENERATES,
  ELEMENT_MOTHER,
  SEASON_OF_BRANCH,
  STEM_ELEMENT,
} from "./constants";
import { timezoneOffsetHours } from "./cities";
import { stamp, toTrueSolar } from "./solar-time";
import {
  addCivilDays,
  dayGanzhi,
  dayunPeriods,
  diShi,
  HIDDEN,
  hourPillar,
  jieqiAround,
  lunarDateLabel,
  mingGong,
  nayinOf,
  taiYuan,
  tenGod,
  xunKong,
  yearMonthPillars,
  yiJi,
} from "./calendar";
import type {
  AnalyzeInput,
  BirthTimeReview,
  Chart,
  DayunPeriod,
  Element,
  ElementScores,
  HiddenStem,
  Pillar,
  Strength,
} from "./types";

const EMPTY_ELEMENTS = (): ElementScores => ({ 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 });

function hideList(zhi: string, dayStem: string): HiddenStem[] {
  return (HIDDEN[zhi] ?? []).map((gan) => ({
    gan,
    shiShen: tenGod(dayStem, gan),
    element: STEM_ELEMENT[gan] ?? "土",
  }));
}

function makePillar(
  key: Pillar["key"],
  label: string,
  ganZhi: string,
  dayStem: string,
): Pillar {
  const gan = ganZhi[0];
  const zhi = ganZhi[1];
  return {
    key,
    label,
    gan,
    zhi,
    ganZhi,
    nayin: nayinOf(ganZhi),
    shiShenGan: key === "day" ? "日主" : tenGod(dayStem, gan),
    hide: hideList(zhi, dayStem),
    diShi: diShi(dayStem, zhi),
    xunKong: xunKong(ganZhi),
    ganElement: STEM_ELEMENT[gan] ?? "土",
    zhiElement: BRANCH_ELEMENT[zhi] ?? "土",
    ready: true,
  };
}

function blankTimePillar(): Pillar {
  return {
    key: "time",
    label: "時柱",
    gan: "",
    zhi: "",
    ganZhi: "未定",
    nayin: "—",
    shiShenGan: "—",
    hide: [],
    diShi: "—",
    xunKong: "—",
    ganElement: "土",
    zhiElement: "土",
    ready: false,
  };
}

/**
 * Descriptive inventory only. These values may be shown as raw chart data but
 * MUST NOT be used to decide strength, structure, disease/medicine or useful gods.
 */
function scoreElements(pillars: Pillar[]): ElementScores {
  const s = EMPTY_ELEMENTS();
  for (const p of pillars) {
    if (!p.ready) continue;
    s[p.ganElement] += 1;
    for (const h of p.hide) s[h.element] += 1;
  }
  return s;
}

function percents(scores: ElementScores): ElementScores {
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  if (!total) return EMPTY_ELEMENTS();
  const out = EMPTY_ELEMENTS();
  for (const element of Object.keys(out) as Element[]) {
    out[element] = Math.round((scores[element] / total) * 1000) / 10;
  }
  return out;
}

/**
 * R6.2.1 carrying-capacity baseline.
 * 旺衰的时令进退与承载分开表达，不再用「满足几个条件」的票数算法。
 */
function judgeStrength(dayEl: Element, monthZhi: string, pillars: Pillar[]): Strength {
  const monthEl = BRANCH_ELEMENT[monthZhi] ?? "土";
  const deLing = monthEl === dayEl || ELEMENT_GENERATES[monthEl] === dayEl;
  const known = pillars.filter((p) => p.ready);
  const deDi = known.some(
    (p) => p.zhiElement === dayEl || p.hide.some((h) => h.element === dayEl),
  );
  const deShi = known
    .filter((p) => p.key !== "day")
    .some((p) => p.ganElement === dayEl || p.ganElement === ELEMENT_MOTHER[dayEl]);

  let tendency: string;
  if (deLing && deDi) tendency = "得令有根，承載偏穩";
  else if (deLing && !deDi) tendency = "得令但根氣不足，承載未定";
  else if (!deLing && deDi && deShi) tendency = "失令有根有援，承載不弱";
  else if (!deLing && deDi) tendency = "失令有根，承載待制化";
  else tendency = "失令且根援不足，承載偏弱";

  const season = SEASON_OF_BRANCH[monthZhi] ?? "四季";
  const summary = `時令：${deLing ? "得令／得生" : "失令"}；根氣：${deDi ? "有根" : "根氣不足"}；透干援助：${deShi ? "可見" : "未見明確援助"}；月令屬${season}。承載結論為「${tendency}」。這不是五行計數，也不等同最終格局或用神，仍須經調候、格局、病藥、流通與有路判定。`;
  return { tendency, summary, deLing, deDi, deShi };
}

function civilToUtc(y: number, m: number, d: number, h: number, min: number, tzOffsetHours: number): Date {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tzOffsetHours * 3_600_000);
}

function buildBirthTimeReview(input: AnalyzeInput, corrected: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timeGz: string;
  usedTrueSolar: boolean;
}): BirthTimeReview {
  if (input.timeUnknown || !corrected.usedTrueSolar) {
    return {
      status: "not-needed",
      required: false,
      crossesShichenBoundary: false,
      crossesDayBoundary: false,
      reason: null,
      civil: null,
      trueSolar: null,
    };
  }

  const civilDayGz = dayGanzhi(input.year, input.month, input.day);
  const civilTimeGz = hourPillar(civilDayGz, input.hour);
  const correctedDayGz = dayGanzhi(corrected.year, corrected.month, corrected.day);
  const crossesShichenBoundary = civilTimeGz[1] !== corrected.timeGz[1];
  const crossesDayBoundary =
    input.year !== corrected.year || input.month !== corrected.month || input.day !== corrected.day;
  const required = crossesShichenBoundary || crossesDayBoundary;

  return {
    status: required ? "needs-verification" : "not-needed",
    required,
    crossesShichenBoundary,
    crossesDayBoundary,
    reason: crossesDayBoundary
      ? "true-solar-crosses-day"
      : crossesShichenBoundary
        ? "true-solar-crosses-shichen"
        : null,
    civil: {
      source: "civil",
      stamp: stamp(input.year, input.month, input.day, input.hour, input.minute),
      dayGanZhi: civilDayGz,
      timeGanZhi: civilTimeGz,
    },
    trueSolar: {
      source: "true-solar",
      stamp: stamp(corrected.year, corrected.month, corrected.day, corrected.hour, corrected.minute),
      dayGanZhi: correctedDayGz,
      timeGanZhi: corrected.timeGz,
    },
  };
}

export function buildChart(input: AnalyzeInput): Chart {
  const timeUnknown = input.timeUnknown;
  let y = input.year;
  let m = input.month;
  let d = input.day;
  let h = timeUnknown ? 12 : input.hour;
  let min = timeUnknown ? 0 : input.minute;

  const civilUtc = Date.UTC(y, m - 1, d, h, min);
  let tzOff = timezoneOffsetHours(input.city.timezone, new Date(civilUtc));
  tzOff = timezoneOffsetHours(input.city.timezone, new Date(civilUtc - tzOff * 3_600_000));
  const instant = civilToUtc(y, m, d, h, min, tzOff);
  let shiftMinutes = 0;
  let usedTrueSolar = false;

  if (input.useTrueSolar && !timeUnknown) {
    const ts = toTrueSolar({
      year: y,
      month: m,
      day: d,
      hour: h,
      minute: min,
      longitude: input.city.longitude,
      tzOffsetHours: tzOff,
    });
    y = ts.year;
    m = ts.month;
    d = ts.day;
    h = ts.hour;
    min = ts.minute;
    shiftMinutes = ts.shiftMinutes;
    usedTrueSolar = true;
  }

  const dayGz = dayGanzhi(y, m, d);
  const timeGz = timeUnknown ? "" : hourPillar(dayGz, h);
  const birthTimeReview = buildBirthTimeReview(input, {
    year: y,
    month: m,
    day: d,
    hour: h,
    minute: min,
    timeGz,
    usedTrueSolar,
  });

  const ym = yearMonthPillars(instant);

  const dayStem = dayGz[0];
  const pillars: Pillar[] = [
    makePillar("year", "年柱", ym.year, dayStem),
    makePillar("month", "月柱", ym.month, dayStem),
    makePillar("day", "日柱", dayGz, dayStem),
    timeUnknown || !timeGz ? blankTimePillar() : makePillar("time", "時柱", timeGz, dayStem),
  ];

  const dayMaster = dayStem;
  const dayMasterElement = STEM_ELEMENT[dayMaster] ?? "土";
  const monthBranch = ym.month[1];
  const elements = scoreElements(pillars);
  const strength = judgeStrength(dayMasterElement, monthBranch, pillars);

  const useful: Element[] = [];
  const drain: Element[] = [];

  const nowYear = new Date().getFullYear();
  let dayun: DayunPeriod[] = [];
  if (input.gender !== "unspecified" && !timeUnknown) {
    dayun = dayunPeriods({
      yearGz: ym.year,
      monthGz: ym.month,
      gender: input.gender,
      birth: instant,
    }).map((item) => ({
      ...item,
      current: nowYear >= item.startYear && nowYear <= item.endYear,
    }));
  }
  const currentDayun = dayun.find((x) => x.current) ?? null;
  const civilStamp = timeUnknown
    ? `${input.year}-${String(input.month).padStart(2, "0")}-${String(input.day).padStart(2, "0")} 時辰未定`
    : stamp(input.year, input.month, input.day, input.hour, input.minute);
  const trueSolarStamp = timeUnknown ? "時辰未定，真太陽時不作校正" : stamp(y, m, d, h, min);
  const minggong = timeUnknown || !timeGz ? "未定" : mingGong(ym.year, monthBranch, timeGz[1]);
  const reviewNote = birthTimeReview.required && birthTimeReview.civil && birthTimeReview.trueSolar
    ? ` 民用候選日/時柱 ${birthTimeReview.civil.dayGanZhi}/${birthTimeReview.civil.timeGanZhi} 與真太陽候選 ${birthTimeReview.trueSolar.dayGanZhi}/${birthTimeReview.trueSolar.timeGanZhi} 不同，已啟動出生時辰候選驗證；主盤暫按真太陽時，正式定盤須以出生記錄與有明確年份的已發生事件反證，不得只憑性格描述選盤。`
    : "";
  const provenance = timeUnknown
    ? `時辰未定：年月柱按當日正午取節氣，日柱按公曆日，時柱、命宮、大運起運留白，不偽造午時柱。子時政策不套用。`
    : usedTrueSolar
      ? `民用時間 ${stamp(input.year, input.month, input.day, input.hour, input.minute)}（${input.city.timezone}）經經度 ${input.city.longitude.toFixed(2)}°、均時差與時區校正，真太陽時 ${stamp(y, m, d, h, min)}，偏移約 ${shiftMinutes} 分鐘。節氣取太陽黃經，換日固定以真太陽時午夜為界。${reviewNote}`
      : `按出生地民用時間排盤，換日固定以午夜為界。`;

  return {
    pillars,
    dayMaster,
    dayMasterElement,
    monthBranch,
    lunarDate: lunarDateLabel(input.year, input.month, input.day),
    civilStamp,
    trueSolarStamp,
    timezone: input.city.timezone,
    cityLabel: input.city.display,
    liveCityLabel: input.liveCity?.display ?? null,
    longitude: input.city.longitude,
    hemisphere: input.city.latitude < 0 ? "S" : "N",
    ziPolicy: "midnight",
    usedTrueSolar,
    timeUnknown,
    birthTimeReview,
    gender: input.gender,
    elements,
    elementPercents: percents(elements),
    strength,
    useful,
    drain,
    usefulProvisional: true,
    dayun,
    currentDayun,
    currentYear: yearMonthPillars(new Date()).year,
    taiyuan: taiYuan(ym.month),
    minggong,
    provenance,
  };
}

export function currentAlmanac(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const day = dayGanzhi(y, m, d);
  const ym = yearMonthPillars(now);
  const info = yiJi(day[1], ym.month[1]);
  const { prev } = jieqiAround(now);
  return {
    solar: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    year: ym.year,
    month: ym.month,
    day,
    lunar: lunarDateLabel(y, m, d),
    yi: info.yi,
    ji: info.ji,
    chong: `${info.chong}`,
    sha: info.sha,
    jieqi: prev.name,
  };
}
