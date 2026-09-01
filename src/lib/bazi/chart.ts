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

function judgeStrength(dayEl: Element, monthZhi: string, pillars: Pillar[]): Strength {
  const monthEl = BRANCH_ELEMENT[monthZhi] ?? "土";
  const deLing = monthEl === dayEl || ELEMENT_GENERATES[monthEl] === dayEl;
  const known = pillars.filter((p) => p.ready);
  const dayP = known.find((p) => p.key === "day");
  const deDi = Boolean(
    dayP && (dayP.zhiElement === dayEl || dayP.hide.some((h) => h.element === dayEl)),
  );
  const helpers = known
    .filter((p) => p.key !== "day")
    .filter((p) => p.ganElement === dayEl || p.ganElement === ELEMENT_MOTHER[dayEl]).length;
  const deShi = helpers >= 2;
  const hits = [deLing, deDi, deShi].filter(Boolean).length;
  const tendency = hits >= 2 ? "偏旺" : hits === 1 ? "中和偏旺或中和" : "偏弱";
  const season = SEASON_OF_BRANCH[monthZhi] ?? "四季";
  const summary = `日主得令${deLing ? "成立" : "不足"}、得地${deDi ? "成立" : "不足"}、得勢${deShi ? "成立" : "不足"}；月令屬${season}。此為旺衰底盤，不是完整子平，仍須看調候、格局與流通。`;
  return { tendency, summary, deLing, deDi, deShi };
}

function usefulElements(dayEl: Element, monthZhi: string, strength: Strength): { useful: Element[]; drain: Element[] } {
  const season = SEASON_OF_BRANCH[monthZhi];
  let useful: Element[] = [];
  if (season === "冬" && (dayEl === "水" || dayEl === "金")) useful = ["火", "木"];
  else if (season === "夏" && (dayEl === "火" || dayEl === "木")) useful = ["水", "金"];
  else if (season === "秋" && dayEl === "金") useful = ["水", "木"];
  else if (season === "春" && dayEl === "木") useful = ["火", "水"];
  else if (strength.tendency === "偏旺") useful = [ELEMENT_GENERATES[dayEl], ELEMENT_GENERATES[ELEMENT_GENERATES[dayEl]]];
  else useful = [ELEMENT_MOTHER[dayEl], dayEl];
  const drain = (["木", "火", "土", "金", "水"] as Element[]).filter((e) => !useful.includes(e)).slice(-2);
  return { useful, drain };
}

function civilToUtc(y: number, m: number, d: number, h: number, min: number, tzOffsetHours: number): Date {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tzOffsetHours * 3_600_000);
}

export function buildChart(input: AnalyzeInput): Chart {
  const timeUnknown = input.timeUnknown;
  let y = input.year;
  let m = input.month;
  let d = input.day;
  let h = timeUnknown ? 12 : input.hour;
  let min = timeUnknown ? 0 : input.minute;

  // Resolve civil time without depending on the browser/server's own timezone.
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

  // True-solar correction above may cross midnight. The corrected civil date is
  // authoritative: 23:xx stays on that date and 00:xx belongs to the next date.
  const dayGz = dayGanzhi(y, m, d);
  const timeGz = timeUnknown ? "" : hourPillar(dayGz, h);

  // Solar terms are astronomical instants; longitude/equation-of-time correction
  // changes the local day/hour clock, never the instant used for year/month or luck onset.
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
  const { useful, drain } = usefulElements(dayMasterElement, monthBranch, strength);

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
  const provenance = timeUnknown
    ? `時辰未定：年月柱按當日正午取節氣，日柱按公曆日，時柱、命宮、大運起運留白，不偽造午時柱。子時政策不套用。`
    : usedTrueSolar
      ? `民用時間 ${stamp(input.year, input.month, input.day, input.hour, input.minute)}（${input.city.timezone}）經經度 ${input.city.longitude.toFixed(2)}°、均時差與時區校正，真太陽時 ${stamp(y, m, d, h, min)}，偏移約 ${shiftMinutes} 分鐘。節氣取太陽黃經，換日固定以真太陽時午夜為界。`
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
