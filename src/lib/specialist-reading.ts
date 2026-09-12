import { yearMonthPillars } from "@/lib/bazi/calendar";
import type { SharedBirthRecord } from "@/lib/shared-birth";
import type { Locale } from "@/lib/i18n";
import { calculateQizheng, localBirthToUtc } from "@/lib/qizheng/engine";
import { buildQizhengPlainSummary } from "@/lib/qizheng/plain-summary";
import { buildPalm } from "@/lib/palm/engine";
import { buildPalmSynthesis, presentPalmPalace, splitPalmMeaning } from "@/lib/palm/standalone-presentation";
import { buildZiweiCoreChart } from "@/lib/ziwei/core";
import { normalizeZiweiCalendarBirth } from "@/lib/ziwei/calendar-normalization";
import { buildZiweiPlainSummary } from "@/lib/ziwei/plain-summary";
import { buildZiweiTruthExtension } from "@/lib/ziwei/horoscope";
import { ZHAOWU_ZIWEI_CALCULATION_PROFILE } from "@/lib/ziwei/profiles";
import {
  computeAngles,
  decoratePosition,
  formatDegree,
  houseOf,
  computeHouses,
  julianDay,
} from "@/lib/western-astrology/engine";

export type SpecialistId = "indian" | "western" | "ziwei" | "qizheng" | "past" | "dharma";

export type SpecialistSection = { title: string; body: string; table?: { headers: string[]; rows: string[][] } };

export type SpecialistReading = {
  title: string;
  lead: string;
  warning?: string;
  sections: SpecialistSection[];
  chart?: { kind: "western"; bodies: NonNullable<ReturnType<typeof calculateQizheng>>["bodies"]; houses?: ReturnType<typeof computeHouses>; angles?: ReturnType<typeof computeAngles> } | { kind: "qizheng"; data: NonNullable<ReturnType<typeof calculateQizheng>> } | { kind: "ziwei"; data: ReturnType<typeof buildZiweiCoreChart> };
};

function gmstDegrees(date: Date) {
  const jd = julianDay(date);
  const t = (jd - 2_451_545.0) / 36_525;
  return ((280.46061837 + 360.98564736629 * (jd - 2_451_545.0) + 0.000387933 * t * t - (t ** 3) / 38_710_000) % 360 + 360) % 360;
}

function signLabel(sign: string, locale: Locale) {
  if (locale === "en") return sign;
  const map: Record<string, [string, string]> = {
    Aries: ["白羊", "白羊"], Taurus: ["金牛", "金牛"], Gemini: ["雙子", "双子"], Cancer: ["巨蟹", "巨蟹"],
    Leo: ["獅子", "狮子"], Virgo: ["處女", "处女"], Libra: ["天秤", "天秤"], Scorpio: ["天蠍", "天蝎"],
    Sagittarius: ["射手", "射手"], Capricorn: ["摩羯", "摩羯"], Aquarius: ["水瓶", "水瓶"], Pisces: ["雙魚", "双鱼"],
  };
  const pair = map[sign];
  return pair ? (locale === "zh-Hans" ? pair[1] : pair[0]) : sign;
}

export function buildWesternReading(birth: SharedBirthRecord, locale: Locale): SpecialistReading {
  const hour = birth.timeUnknown ? 12 : birth.hour;
  const minute = birth.timeUnknown ? 0 : birth.minute;
  const qizheng = calculateQizheng({
    year: birth.year, month: birth.month, day: birth.day, hour, minute,
    timezone: birth.city.timezone, timeUnknown: false,
  });
  const utc = localBirthToUtc({
    year: birth.year, month: birth.month, day: birth.day, hour, minute,
    timezone: birth.city.timezone,
  });
  const sun = qizheng?.bodies.find((body) => body.key === "sun");
  const moon = qizheng?.bodies.find((body) => body.key === "moon");
  const planets = (qizheng?.bodies ?? []).filter((body) => ["mercury", "venus", "mars", "jupiter", "saturn"].includes(body.key));
  const sunPos = sun ? decoratePosition("Sun", sun.longitude) : null;
  const moonPos = moon ? decoratePosition("Moon", moon.longitude) : null;

  const timeNote = birth.timeUnknown
    ? (locale === "en"
      ? "Birth time is not complete, so Rising and houses are not judged."
      : locale === "zh-Hans"
        ? "出生时间不足，暂不判定上升与宫位。"
        : "出生時間不足，暫不判定上升與宮位。")
    : "";

  let chartHouses: ReturnType<typeof computeHouses> | undefined;
  let chartAngles: ReturnType<typeof computeAngles> | undefined;
  let rising = "";
  let houses = "";
  if (!birth.timeUnknown) {
    const angles = computeAngles({
      date: utc,
      gmstDegrees: gmstDegrees(utc),
      latitude: birth.city.latitude,
      longitude: birth.city.longitude,
    });
    const houseChart = computeHouses(angles, birth.city.latitude, "placidus");
    chartHouses = houseChart;
    chartAngles = angles;
    const asc = decoratePosition("Ascendant", angles.ascendant);
    rising = `${signLabel(asc.sign, locale)} ${formatDegree(asc)}`;
    if (sunPos) houses = locale === "en"
      ? `Sun in house ${houseOf(sunPos.longitude, houseChart)}`
      : locale === "zh-Hans" ? `太阳落在第 ${houseOf(sunPos.longitude, houseChart)} 宫` : `太陽落在第 ${houseOf(sunPos.longitude, houseChart)} 宮`;
  }

  const planetNames: Record<string, string> = { mercury: "水星", venus: "金星", mars: "火星", jupiter: "木星", saturn: "土星" };
  const planetRows = planets.map((body) => {
    const pos = decoratePosition("Sun", body.longitude);
    const name = locale === "en" ? body.key[0].toUpperCase() + body.key.slice(1) : planetNames[body.key];
    return [name, signLabel(pos.sign, locale), birth.timeUnknown ? "—" : formatDegree(pos), chartHouses ? String(houseOf(body.longitude, chartHouses)) : "—"];
  });
  const planetLine = planetRows.map(row => row.join(" · ")).join("\n");

  return {
    title: locale === "en" ? "Western astrology" : locale === "zh-Hans" ? "西洋星座" : "西洋星座",
    lead: locale === "en"
      ? "Sun, Moon and the main planets are read from the shared birth record. Houses wait for a documented birth time."
      : locale === "zh-Hans"
        ? "太阳、月亮与主要行星沿用同一份出生资料。宫位只在出生时间足够时判定。"
        : "太陽、月亮與主要行星沿用同一份出生資料。宮位只在出生時間足夠時判定。",
    warning: timeNote || undefined,
    chart: !birth.timeUnknown && qizheng ? { kind: "western", bodies: qizheng.bodies.filter(body => !body.virtual), houses: chartHouses, angles: chartAngles } : undefined,
    sections: [
      { title: locale === "en" ? "Sun" : locale === "zh-Hans" ? "太阳" : "太陽", body: sunPos ? `${signLabel(sunPos.sign, locale)} ${formatDegree(sunPos)}` : "—" },
      { title: locale === "en" ? "Moon" : locale === "zh-Hans" ? "月亮" : "月亮", body: birth.timeUnknown ? timeNote : (moonPos ? `${signLabel(moonPos.sign, locale)} ${formatDegree(moonPos)}` : "—") },
      { title: locale === "en" ? "Rising" : locale === "zh-Hans" ? "上升" : "上升", body: rising || timeNote || "—" },
      { title: locale === "en" ? "Main planets" : "主要行星", body: planetLine || "—", table: { headers: locale === "en" ? ["Planet", "Sign", "Degree", "House"] : ["行星", "星座", "度數", "落宮"], rows: planetRows } },
      { title: locale === "en" ? "Life areas" : locale === "zh-Hans" ? "人生领域" : "人生領域", body: houses || timeNote || "—" },
    ],
  };
}

export function buildQizhengReading(birth: SharedBirthRecord, locale: Locale): SpecialistReading {
  if (birth.timeUnknown) {
    return {
      title: locale === "en" ? "Seven Luminaries" : locale === "zh-Hans" ? "七政四余" : "七政四餘",
      lead: locale === "en"
        ? "This page is open. Precise sky timing stays withheld until a birth hour is added."
        : locale === "zh-Hans"
          ? "入口可以进入。需要精确时辰的天象层暂不判定，主报告不受影响。"
          : "入口可以進入。需要精確時辰的天象層暫不判定，主報告不受影響。",
      warning: locale === "en" ? "Birth time is not complete, so this sky-layer reading is limited." : locale === "zh-Hans" ? "出生时间不足，暂不判定需要时辰的部分。" : "出生時間不足，暫不判定需要時辰的部分。",
      sections: [],
    };
  }
  const chart = calculateQizheng({
    year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute,
    timezone: birth.city.timezone,
  });
  if (!chart) {
    return {
      title: locale === "en" ? "Seven Luminaries" : locale === "zh-Hans" ? "七政四余" : "七政四餘",
      lead: locale === "en" ? "The sky layer could not be calculated from this record." : locale === "zh-Hans" ? "这份资料暂时无法计算七政。" : "這份資料暫時無法計算七政。",
      sections: [],
    };
  }
  const summary = buildQizhengPlainSummary(chart, locale);
  return {
    title: summary.title,
    chart: { kind: "qizheng", data: chart },
    lead: summary.lead,
    sections: summary.sections.map((section) => ({ title: section.title, body: section.body })),
  };
}

export function buildZiweiReading(birth: SharedBirthRecord, locale: Locale): SpecialistReading {
  if (birth.timeUnknown) {
    return {
      title: locale === "en" ? "Zi Wei Dou Shu" : locale === "zh-Hans" ? "紫微斗数" : "紫微斗數",
      lead: locale === "en"
        ? "The page is open. Life Palace and time-sensitive palaces are not judged without a birth hour."
        : locale === "zh-Hans"
          ? "紫微斗数高度依赖出生时辰，目前无法确定命宫及部分宫位。"
          : "紫微斗數高度依賴出生時辰，目前無法確定命宮及部分宮位。",
      warning: locale === "en" ? "Birth time is not complete, so the chart is not fabricated." : locale === "zh-Hans" ? "不填写假盘。需要时辰的部分暂不判定。" : "不填寫假盤。需要時辰的部分暫不判定。",
      sections: [],
    };
  }

  const normalized = normalizeZiweiCalendarBirth({
    civilDate: { year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute },
    timeConfidence: "certain",
    profile: {
      id: ZHAOWU_ZIWEI_CALCULATION_PROFILE.id,
      lateZiPolicy: ZHAOWU_ZIWEI_CALCULATION_PROFILE.calendar.lateZiPolicy,
      leapMonthPolicy: ZHAOWU_ZIWEI_CALCULATION_PROFILE.calendar.leapMonthPolicy,
      yearBoundary: ZHAOWU_ZIWEI_CALCULATION_PROFILE.calendar.yearBoundary,
    },
  });
  if (!normalized.coreInput) {
    return {
      title: locale === "en" ? "Zi Wei Dou Shu" : locale === "zh-Hans" ? "紫微斗数" : "紫微斗數",
      lead: locale === "en" ? "This birth record could not be converted into a Zi Wei chart." : locale === "zh-Hans" ? "这份出生资料暂时无法排出紫微命盘。" : "這份出生資料暫時無法排出紫微命盤。",
      sections: [],
    };
  }
  const chart = buildZiweiCoreChart(normalized.coreInput, {
    mutagenProfile: ZHAOWU_ZIWEI_CALCULATION_PROFILE.mutagen,
    kuiYueProfile: ZHAOWU_ZIWEI_CALCULATION_PROFILE.kuiYue,
  });
  const yearPillar = yearMonthPillars(new Date(Date.UTC(new Date().getUTCFullYear(), 5, 1)));
  const extension = buildZiweiTruthExtension({
    chart,
    directionBasis: birth.gender === "female" ? "female" : "male",
    targetYear: { year: new Date().getUTCFullYear(), stem: yearPillar.year[0] as "甲", branch: yearPillar.year[1] as "子" },
    activeDecadalIndex: 0,
  });
  const summary = buildZiweiPlainSummary({
    chart,
    extension,
    locale,
    activeDecadalIndex: 0,
    targetYear: new Date().getUTCFullYear(),
  });
  return {
    title: summary.title,
    chart: { kind: "ziwei", data: chart },
    lead: summary.paragraphs[0] ?? "",
    sections: summary.paragraphs.slice(1).map((body, index) => ({ title: `${index + 1}`, body })),
  };
}

export function buildPalmReading(birth: SharedBirthRecord, locale: Locale): SpecialistReading {
  if (birth.gender === "unspecified") {
    return {
      title: locale === "en" ? "Dharma One-Palm Classic" : locale === "zh-Hans" ? "达摩一掌经" : "達摩一掌經",
      lead: locale === "en"
        ? "Birth date is reused. The traditional sequence still needs male/female calculation direction."
        : locale === "zh-Hans"
          ? "出生日期已沿用。一掌经还需要顺逆参数，不会要求你重填整份生日。"
          : "出生日期已沿用。一掌經還需要順逆參數，不會要求你重填整份生日。",
      warning: locale === "en" ? "Choose the traditional sequence on this page, then start the reading." : locale === "zh-Hans" ? "请在本页选择顺逆后开始分析。" : "請在本頁選擇順逆後開始分析。",
      sections: [],
    };
  }
  const palm = buildPalm({
    year: birth.year, month: birth.month, day: birth.day, hour: birth.hour,
    timeUnknown: birth.timeUnknown, gender: birth.gender,
  });
  const synthesis = palm.palaces.length ? buildPalmSynthesis(palm.palaces, locale) : null;
  return {
    title: locale === "en" ? "Past and present" : locale === "zh-Hans" ? "前世今生" : "前世今生",
    lead: locale === "en"
      ? "The four-life trail is read from the same birth record. Indian D60 is only a supporting note when the minute is documented."
      : locale === "zh-Hans"
        ? "前四世象意与反复习性沿用同一份出生资料。印度古法占星只在时间足够时作旁证。"
        : "前四世象意與反覆習性沿用同一份出生資料。印度古法占星只在時間足夠時作旁證。",
    warning: birth.timeUnknown
      ? (locale === "en" ? "Hour palace stays blank because birth time is unknown." : locale === "zh-Hans" ? "时辰未知，时宫／最近一世暂不判定。" : "時辰未知，時宮／最近一世暫不判定。")
      : undefined,
    sections: [
      ...palm.palaces.map((palace) => {
        const item = presentPalmPalace(palace, locale);
        const meaning = splitPalmMeaning(item.meaning, locale);
        return { title: `${item.lifeLabel} · ${item.dao}`, body: `${meaning.trait}\n${meaning.habit}` };
      }),
      ...(synthesis ? [
        { title: synthesis.repeatedTitle, body: synthesis.repeatedBody },
        { title: synthesis.presentTitle, body: synthesis.presentBody },
        { title: synthesis.directionTitle, body: synthesis.directionBody },
      ] : []),
    ],
  };
}

export function buildIndianReading(birth: SharedBirthRecord, locale: Locale): SpecialistReading {
  const precise = !birth.timeUnknown;
  return {
    title: locale === "en" ? "Classical Indian astrology" : locale === "zh-Hans" ? "印度古法占星" : "印度古法占星",
    lead: locale === "en"
      ? "This page reuses the shared birth record. D60 is only generated when the birth minute is documented."
      : locale === "zh-Hans"
        ? "本页沿用同一份出生资料。D60 对出生分钟非常敏感，时间不足时不生成 D60 结论。"
        : "本頁沿用同一份出生資料。D60 對出生分鐘非常敏感，時間不足時不生成 D60 結論。",
    warning: precise
      ? undefined
      : (locale === "en"
        ? "D60 is highly sensitive to birth time. The current time is not precise enough, so no D60 conclusion is generated."
        : locale === "zh-Hans"
          ? "D60 对出生时间非常敏感；目前出生时间精度不足，因此不生成 D60 结论。"
          : "D60 對出生時間非常敏感；目前出生時間精度不足，因此不生成 D60 結論。"),
    sections: precise ? [] : [],
  };
}
