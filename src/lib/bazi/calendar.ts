import { toTrad } from "./constants";

export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export const NAYIN = [
  "海中金", "海中金", "爐中火", "爐中火", "大林木", "大林木", "路旁土", "路旁土", "劍鋒金", "劍鋒金",
  "山頭火", "山頭火", "澗下水", "澗下水", "城頭土", "城頭土", "白蠟金", "白蠟金", "楊柳木", "楊柳木",
  "泉中水", "泉中水", "屋上土", "屋上土", "霹靂火", "霹靂火", "松柏木", "松柏木", "長流水", "長流水",
  "沙中金", "沙中金", "山下火", "山下火", "平地木", "平地木", "壁上土", "壁上土", "金箔金", "金箔金",
  "覆燈火", "覆燈火", "天河水", "天河水", "大驛土", "大驛土", "釵釧金", "釵釧金", "桑柘木", "桑柘木",
  "大溪水", "大溪水", "沙中土", "沙中土", "天上火", "天上火", "石榴木", "石榴木", "大海水", "大海水",
] as const;

export const HIDDEN: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

const SHENG_YANG: Record<string, string> = {
  甲: "亥",
  丙: "寅",
  戊: "寅",
  庚: "巳",
  壬: "申",
};
const SHENG_YIN: Record<string, string> = {
  乙: "午",
  丁: "酉",
  己: "酉",
  辛: "子",
  癸: "卯",
};
const CHANGSHENG = ["長生", "沐浴", "冠帶", "臨官", "帝旺", "衰", "病", "死", "墓", "絕", "胎", "養"] as const;

const JIE_LONGITUDES = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285] as const;
const JIE_BRANCH = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"] as const;
const JIE_NAME = ["立春", "驚蟄", "清明", "立夏", "芒種", "小暑", "立秋", "白露", "寒露", "立冬", "大雪", "小寒"] as const;

export function ganzhiOf(index: number): string {
  const i = ((index % 60) + 60) % 60;
  return STEMS[i % 10] + BRANCHES[i % 12];
}

export function ganzhiIndex(gz: string): number {
  const s = STEMS.indexOf(gz[0] as (typeof STEMS)[number]);
  const b = BRANCHES.indexOf(gz[1] as (typeof BRANCHES)[number]);
  for (let i = 0; i < 60; i++) {
    if (i % 10 === s && i % 12 === b) return i;
  }
  return 0;
}

export function julianDay(y: number, m: number, d: number, hour = 12): number {
  let year = y;
  let month = m;
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + d + B - 1524.5 + (hour - 12) / 24;
}

export function dayGanzhi(y: number, m: number, d: number): string {
  const n = Math.floor(julianDay(y, m, d, 12) + 0.5);
  return ganzhiOf(n - 2415021 + 10);
}

function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = (M * Math.PI) / 180;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  const omega = 125.04 - 1934.136 * T;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin((omega * Math.PI) / 180);
  return ((lambda % 360) + 360) % 360;
}

function lonDiff(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

export function solarTermUtc(year: number, longitude: number): Date {
  const approxMonth = ((longitude + 90) / 30) % 12;
  let jd = julianDay(year, Math.floor(approxMonth) + 1, 5, 0);
  if (longitude >= 270 && longitude < 315) jd = julianDay(year, 1, 5, 0);
  if (longitude >= 315) jd = julianDay(year, 2, 3, 0);
  if (longitude < 15) jd = julianDay(year, 3, 20, 0);
  for (let i = 0; i < 12; i++) {
    const L = sunLongitude(jd);
    jd -= lonDiff(L, longitude) / 0.985647;
  }
  return new Date((jd - 2440587.5) * 86400000);
}

export function jieqiAround(at: Date): { prev: { name: string; branch: string; at: Date }; next: { name: string; branch: string; at: Date } } {
  const y = at.getUTCFullYear();
  const candidates: { name: string; branch: string; at: Date }[] = [];
  for (const year of [y - 1, y, y + 1]) {
    JIE_LONGITUDES.forEach((lon, i) => {
      candidates.push({ name: JIE_NAME[i], branch: JIE_BRANCH[i], at: solarTermUtc(year, lon) });
    });
  }
  candidates.sort((a, b) => a.at.getTime() - b.at.getTime());
  let prev = candidates[0];
  let next = candidates[candidates.length - 1];
  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i].at.getTime() <= at.getTime()) prev = candidates[i];
    if (candidates[i].at.getTime() > at.getTime()) {
      next = candidates[i];
      break;
    }
  }
  return { prev, next };
}

export function yearMonthPillars(at: Date): { year: string; month: string; jieName: string } {
  const y = at.getUTCFullYear();
  const lichun = solarTermUtc(y, 315);
  const yearNum = at.getTime() >= lichun.getTime() ? y : y - 1;
  const yearIdx = ((yearNum - 1984) % 60 + 60) % 60;
  const year = ganzhiOf(yearIdx);
  const { prev } = jieqiAround(at);
  const monthBranch = prev.branch;
  const yearStem = STEMS.indexOf(year[0] as (typeof STEMS)[number]);
  const firstStem = [2, 4, 6, 8, 0][yearStem % 5];
  const monthBranchIdx = BRANCHES.indexOf(monthBranch as (typeof BRANCHES)[number]);
  const offsetFromYin = (monthBranchIdx - 2 + 12) % 12;
  const monthStem = STEMS[(firstStem + offsetFromYin) % 10];
  return { year, month: monthStem + monthBranch, jieName: prev.name };
}

export function hourPillar(dayGz: string, hour: number, nextDayGz: string): string {
  const branchIdx = hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;
  const stemDay = hour === 23 ? nextDayGz : dayGz;
  const dayStem = STEMS.indexOf(stemDay[0] as (typeof STEMS)[number]);
  const hourStem = STEMS[((dayStem % 5) * 2 + branchIdx) % 10];
  return hourStem + BRANCHES[branchIdx];
}

export function tenGod(dayStem: string, other: string): string {
  if (dayStem === other) return "日主";
  const dayEl = "木木火火土土金金水水"[STEMS.indexOf(dayStem as (typeof STEMS)[number])];
  const otherEl = "木木火火土土金金水水"[STEMS.indexOf(other as (typeof STEMS)[number])];
  const dayYang = STEMS.indexOf(dayStem as (typeof STEMS)[number]) % 2 === 0;
  const otherYang = STEMS.indexOf(other as (typeof STEMS)[number]) % 2 === 0;
  const same = dayYang === otherYang;
  if (dayEl === otherEl) return same ? "比肩" : "劫財";
  const produces: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  if (produces[dayEl] === otherEl) return same ? "食神" : "傷官";
  if (produces[otherEl] === dayEl) return same ? "偏印" : "正印";
  const controls: Record<string, string> = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
  if (controls[dayEl] === otherEl) return same ? "偏財" : "正財";
  return same ? "七殺" : "正官";
}

export function diShi(dayStem: string, branch: string): string {
  const yang = STEMS.indexOf(dayStem as (typeof STEMS)[number]) % 2 === 0;
  const start = yang ? SHENG_YANG[dayStem] : SHENG_YIN[dayStem];
  const startIdx = BRANCHES.indexOf(start as (typeof BRANCHES)[number]);
  const bIdx = BRANCHES.indexOf(branch as (typeof BRANCHES)[number]);
  const steps = yang ? (bIdx - startIdx + 12) % 12 : (startIdx - bIdx + 12) % 12;
  return CHANGSHENG[steps];
}

export function xunKong(gz: string): string {
  const idx = ganzhiIndex(gz);
  const lastBranch = (Math.floor(idx / 10) * 10 + 9) % 12;
  return BRANCHES[(lastBranch + 1) % 12] + BRANCHES[(lastBranch + 2) % 12];
}

export function nayinOf(gz: string): string {
  return toTrad(NAYIN[ganzhiIndex(gz)]);
}

export function addCivilDays(y: number, m: number, d: number, days: number) {
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0,
  0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54,
  0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7,
  0x0c950, 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, 0x06ca0, 0x0b550,
  0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570,
  0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540,
  0x0b6a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5,
  0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50,
  0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, 0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0,
  0x15176, 0x052b0, 0x0a930, 0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2,
  0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6,
  0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, 0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0,
  0x055d4, 0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, 0x0b273, 0x06930,
  0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, 0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0,
  0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, 0x0d520,
];

function leapMonth(y: number) {
  return LUNAR_INFO[y - 1900] & 0xf;
}
function leapDays(y: number) {
  return leapMonth(y) ? (LUNAR_INFO[y - 1900] & 0x10000 ? 30 : 29) : 0;
}
function yearDays(y: number) {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) sum += LUNAR_INFO[y - 1900] & i ? 1 : 0;
  return sum + leapDays(y);
}
function monthDays(y: number, m: number) {
  return LUNAR_INFO[y - 1900] & (0x10000 >> m) ? 30 : 29;
}

const CN_NUM = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
function cnYear(y: number) {
  return String(y)
    .split("")
    .map((c) => CN_NUM[Number(c)])
    .join("");
}
function cnMonth(m: number) {
  if (m === 1) return "正";
  if (m === 11) return "冬";
  if (m === 12) return "臘";
  if (m <= 10) return CN_NUM[m];
  return "十" + CN_NUM[m - 10];
}
function cnDay(d: number) {
  if (d <= 10) return "初" + CN_NUM[d];
  if (d < 20) return "十" + CN_NUM[d - 10];
  if (d === 20) return "二十";
  if (d < 30) return "廿" + CN_NUM[d - 20];
  return "三十";
}

export type LunarDate = {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
};

export function toLunar(y: number, m: number, d: number): LunarDate | null {
  if (y < 1900 || y > 2100) return null;
  let offset = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000);
  let year = 1900;
  let days = yearDays(year);
  while (year < 2100 && offset >= days) {
    offset -= days;
    year += 1;
    days = yearDays(year);
  }
  const leap = leapMonth(year);
  let month = 1;
  let isLeap = false;
  while (month <= 12) {
    const thisDays = isLeap ? leapDays(year) : monthDays(year, month);
    if (offset < thisDays) break;
    offset -= thisDays;
    if (!isLeap && month === leap) {
      isLeap = true;
    } else {
      isLeap = false;
      month += 1;
    }
  }
  return { year, month, day: offset + 1, isLeap };
}

export function lunarYearBranch(lunarYear: number): (typeof BRANCHES)[number] {
  return BRANCHES[(((lunarYear - 4) % 12) + 12) % 12];
}

export function hourBranchOf(hour: number): (typeof BRANCHES)[number] {
  return BRANCHES[Math.floor(((hour + 1) % 24) / 2)];
}

export function lunarDateLabel(y: number, m: number, d: number): string {
  const lunar = toLunar(y, m, d);
  if (!lunar) return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return `農曆${cnYear(lunar.year)}年${lunar.isLeap ? "閏" : ""}${cnMonth(lunar.month)}月${cnDay(lunar.day)}`;
}

export function dayunPeriods(input: {
  yearGz: string;
  monthGz: string;
  gender: "male" | "female";
  birth: Date;
}): { ganZhi: string; startYear: number; endYear: number; startAge: number; endAge: number }[] {
  const yearStem = STEMS.indexOf(input.yearGz[0] as (typeof STEMS)[number]);
  const yangYear = yearStem % 2 === 0;
  const forward = (yangYear && input.gender === "male") || (!yangYear && input.gender === "female");
  const { prev, next } = jieqiAround(input.birth);
  const ms = forward ? next.at.getTime() - input.birth.getTime() : input.birth.getTime() - prev.at.getTime();
  const days = Math.max(0, ms / 86400000);
  const startAgeYears = days / 3;
  const startYear = input.birth.getUTCFullYear() + Math.floor(startAgeYears);
  const startMonthOffset = Math.round((startAgeYears - Math.floor(startAgeYears)) * 12);
  let cursor = new Date(Date.UTC(startYear, input.birth.getUTCMonth() + startMonthOffset, input.birth.getUTCDate()));
  const monthIdx = ganzhiIndex(input.monthGz);
  const out = [];
  for (let i = 0; i < 8; i++) {
    const idx = forward ? monthIdx + 1 + i : monthIdx - 1 - i;
    const begin = cursor.getUTCFullYear();
    const end = begin + 9;
    const age0 = begin - input.birth.getUTCFullYear() + 1;
    out.push({
      ganZhi: ganzhiOf(idx),
      startYear: begin,
      endYear: end,
      startAge: Math.max(1, age0),
      endAge: age0 + 9,
    });
    cursor = new Date(Date.UTC(end + 1, 0, 1));
  }
  return out;
}

export function taiYuan(monthGz: string): string {
  const s = (STEMS.indexOf(monthGz[0] as (typeof STEMS)[number]) + 1) % 10;
  const b = (BRANCHES.indexOf(monthGz[1] as (typeof BRANCHES)[number]) + 3) % 12;
  return STEMS[s] + BRANCHES[b];
}

export function mingGong(yearGz: string, monthBranch: string, hourBranch: string): string {
  const m = BRANCHES.indexOf(monthBranch as (typeof BRANCHES)[number]);
  const h = BRANCHES.indexOf(hourBranch as (typeof BRANCHES)[number]);
  const branch = BRANCHES[(16 - m - h + 12) % 12];
  const yearStem = STEMS.indexOf(yearGz[0] as (typeof STEMS)[number]);
  const firstStem = [2, 4, 6, 8, 0][yearStem % 5];
  const offsetFromYin = (BRANCHES.indexOf(branch) - 2 + 12) % 12;
  return STEMS[(firstStem + offsetFromYin) % 10] + branch;
}

export function yiJi(dayBranch: string, monthBranch: string) {
  const jian = BRANCHES.indexOf(monthBranch as (typeof BRANCHES)[number]);
  const day = BRANCHES.indexOf(dayBranch as (typeof BRANCHES)[number]);
  const step = (day - jian + 12) % 12;
  const names = ["建", "除", "滿", "平", "定", "執", "破", "危", "成", "收", "開", "閉"];
  const star = names[step];
  const yiMap: Record<string, string[]> = {
    建: ["出行", "上任", "會友"],
    除: ["掃除", "沐浴", "療病"],
    滿: ["祈福", "祭祀", "嫁娶"],
    平: ["修造", "安床", "交易"],
    定: ["入宅", "開市", "立券"],
    執: ["捕捉", "收納", "種植"],
    破: ["破土", "求醫"],
    危: ["安床", "掛匾"],
    成: ["嫁娶", "開市", "出行"],
    收: ["收穫", "進倉", "立券"],
    開: ["開業", "求學", "出行"],
    閉: ["齋戒", "休息", "守成"],
  };
  const jiMap: Record<string, string[]> = {
    建: ["動土", "開倉"],
    除: ["嫁娶", "開市"],
    滿: ["動土", "安葬"],
    平: ["開市", "出行"],
    定: ["訴訟", "出行"],
    執: ["嫁娶", "開市"],
    破: ["開市", "嫁娶", "入宅"],
    危: ["出行", "登高"],
    成: ["訴訟", "詞訟"],
    收: ["安葬", "出行"],
    開: ["安葬", "動土"],
    閉: ["開市", "出行", "嫁娶"],
  };
  const chong = BRANCHES[(day + 6) % 12];
  const shaDir = ["南", "東", "北", "西"][day % 4];
  return { star, yi: yiMap[star], ji: jiMap[star], chong, sha: shaDir };
}
