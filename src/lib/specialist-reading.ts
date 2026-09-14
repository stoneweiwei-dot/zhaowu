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
  calculateMajorAspects,
  computeAngles,
  computeHouses,
  decoratePosition,
  formatDegree,
  houseOf,
  julianDay,
  traditionalRuler,
} from "@/lib/western-astrology/engine";

export type SpecialistId = "indian" | "western" | "ziwei" | "qizheng" | "past" | "dharma";

export type SpecialistSection = { title: string; body: string; layout?: "description"; table?: { headers: string[]; rows: string[][] } };

export type SpecialistReading = {
  title: string;
  lead: string;
  warning?: string;
  sections: SpecialistSection[];
  chart?: { kind: "western"; bodies: NonNullable<ReturnType<typeof calculateQizheng>>["bodies"]; houses?: ReturnType<typeof computeHouses>; angles?: ReturnType<typeof computeAngles> } | { kind: "qizheng"; data: NonNullable<ReturnType<typeof calculateQizheng>> } | { kind: "ziwei"; data: ReturnType<typeof buildZiweiCoreChart> };
};

const WESTERN_BODY_KEYS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"] as const;
type WesternBodyKey = (typeof WESTERN_BODY_KEYS)[number];
const WESTERN_POINT_KEYS: Record<WesternBodyKey, "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn"> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
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

function westernPlanetLabel(key: WesternBodyKey, locale: Locale) {
  if (locale === "en") {
    const en: Record<WesternBodyKey, string> = { sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars", jupiter: "Jupiter", saturn: "Saturn" };
    return en[key];
  }
  const zhHant: Record<WesternBodyKey, string> = { sun: "太陽", moon: "月亮", mercury: "水星", venus: "金星", mars: "火星", jupiter: "木星", saturn: "土星" };
  const zhHans: Record<WesternBodyKey, string> = { sun: "太阳", moon: "月亮", mercury: "水星", venus: "金星", mars: "火星", jupiter: "木星", saturn: "土星" };
  return locale === "zh-Hans" ? zhHans[key] : zhHant[key];
}

function westernPlanetFocus(key: WesternBodyKey, locale: Locale) {
  const en: Record<WesternBodyKey, string> = {
    sun: "identity, will and visibility",
    moon: "emotional needs, habits and felt safety",
    mercury: "thinking, learning and communication",
    venus: "values, attraction, aesthetics and relating",
    mars: "drive, assertion and action",
    jupiter: "growth, meaning and expansion",
    saturn: "responsibility, boundaries and long-term structure",
  };
  const zhHant: Record<WesternBodyKey, string> = {
    sun: "核心意志、自我認同與展現方式",
    moon: "情緒需要、習慣反應與安全感",
    mercury: "思考、學習與溝通方式",
    venus: "價值感、吸引力、審美與關係偏好",
    mars: "行動力、主張與競爭方式",
    jupiter: "成長、信念與擴張方式",
    saturn: "責任、界線與長期結構",
  };
  const zhHans: Record<WesternBodyKey, string> = {
    sun: "核心意志、自我认同与展现方式",
    moon: "情绪需要、习惯反应与安全感",
    mercury: "思考、学习与沟通方式",
    venus: "价值感、吸引力、审美与关系偏好",
    mars: "行动力、主张与竞争方式",
    jupiter: "成长、信念与扩张方式",
    saturn: "责任、界线与长期结构",
  };
  return locale === "en" ? en[key] : locale === "zh-Hans" ? zhHans[key] : zhHant[key];
}

function westernSignTone(sign: string, locale: Locale) {
  const en: Record<string, string> = {
    Aries: "direct, initiating and fast-moving",
    Taurus: "steady, tangible and security-minded",
    Gemini: "curious, verbal and adaptable",
    Cancer: "protective, feeling-led and memory-oriented",
    Leo: "expressive, creative and self-directed",
    Virgo: "analytical, practical and improvement-oriented",
    Libra: "relational, balancing and comparison-aware",
    Scorpio: "intense, private and depth-seeking",
    Sagittarius: "exploratory, candid and meaning-seeking",
    Capricorn: "structured, disciplined and goal-focused",
    Aquarius: "independent, systemic and group-aware",
    Pisces: "receptive, imaginative and boundary-softening",
  };
  const zhHant: Record<string, string> = {
    Aries: "直接、先行與快速啟動",
    Taurus: "穩定、具體與重視安全感",
    Gemini: "好奇、善於交換資訊與靈活切換",
    Cancer: "保護、感受導向與重視記憶",
    Leo: "表達、創造與自我主導",
    Virgo: "分析、實用與持續修正",
    Libra: "關係、平衡與比較協調",
    Scorpio: "深入、私密與高強度投入",
    Sagittarius: "探索、直率與追尋意義",
    Capricorn: "結構、紀律與目標導向",
    Aquarius: "獨立、系統思考與群體視角",
    Pisces: "感受、想像與邊界較柔軟",
  };
  const zhHans: Record<string, string> = {
    Aries: "直接、先行与快速启动",
    Taurus: "稳定、具体与重视安全感",
    Gemini: "好奇、善于交换信息与灵活切换",
    Cancer: "保护、感受导向与重视记忆",
    Leo: "表达、创造与自我主导",
    Virgo: "分析、实用与持续修正",
    Libra: "关系、平衡与比较协调",
    Scorpio: "深入、私密与高强度投入",
    Sagittarius: "探索、直率与追寻意义",
    Capricorn: "结构、纪律与目标导向",
    Aquarius: "独立、系统思考与群体视角",
    Pisces: "感受、想象与边界较柔软",
  };
  return locale === "en" ? en[sign] : locale === "zh-Hans" ? zhHans[sign] : zhHant[sign];
}

function westernHouseTopics(locale: Locale) {
  if (locale === "en") return [
    "self-presentation and first impressions",
    "personal resources and values",
    "communication and everyday learning",
    "home and family roots",
    "creativity, enjoyment and romance",
    "daily work, health habits and routines",
    "close partnerships and cooperation",
    "shared resources, intimacy and obligations",
    "higher learning, travel and beliefs",
    "career, vocation and public role",
    "friendships, groups and shared goals",
    "solitude, reflection and private life",
  ];
  if (locale === "zh-Hans") return [
    "自我展现与第一印象",
    "个人资源、金钱与价值观",
    "沟通、手足与日常学习",
    "家庭、居所与成长根基",
    "创作、乐趣、恋爱与自我表达",
    "日常工作、健康习惯与生活秩序",
    "亲密关系、伴侣与合作",
    "共同资源、亲密、债务与责任",
    "进修、远行、信念与世界观",
    "事业、志业与社会角色",
    "朋友、群体、社群与共同目标",
    "独处、反思、隐退与内在生活",
  ];
  return [
    "自我展現與第一印象",
    "個人資源、金錢與價值觀",
    "溝通、手足與日常學習",
    "家庭、居所與成長根基",
    "創作、樂趣、戀愛與自我表達",
    "日常工作、健康習慣與生活秩序",
    "親密關係、伴侶與合作",
    "共同資源、親密、債務與責任",
    "進修、遠行、信念與世界觀",
    "事業、志業與社會角色",
    "朋友、群體、社群與共同目標",
    "獨處、反思、隱退與內在生活",
  ];
}

function westernHouseLabel(house: number, locale: Locale) {
  if (locale === "en") return `House ${house}`;
  return locale === "zh-Hans" ? `第 ${house} 宫` : `第 ${house} 宮`;
}

function westernAspectLabel(type: "conjunction" | "sextile" | "square" | "trine" | "opposition", locale: Locale) {
  const en = { conjunction: "conjunction", sextile: "sextile", square: "square", trine: "trine", opposition: "opposition" } as const;
  const zhHant = { conjunction: "合相", sextile: "六合", square: "刑相", trine: "拱相", opposition: "對分" } as const;
  const zhHans = { conjunction: "合相", sextile: "六合", square: "刑相", trine: "拱相", opposition: "对分" } as const;
  return locale === "en" ? en[type] : locale === "zh-Hans" ? zhHans[type] : zhHant[type];
}

function westernAspectMeaning(type: "conjunction" | "sextile" | "square" | "trine" | "opposition", locale: Locale) {
  const en = {
    conjunction: "The two functions are fused and tend to act together.",
    sextile: "The two functions can support one another when deliberately used.",
    square: "The two functions create friction that asks for adjustment and skill.",
    trine: "The two functions tend to flow easily and can become an automatic strength.",
    opposition: "The two functions pull toward opposite poles and need conscious balancing.",
  } as const;
  const zhHant = {
    conjunction: "兩股功能彼此疊加，往往需要一起看。",
    sextile: "兩股功能較容易互相支援，但仍需要主動運用。",
    square: "兩股功能較容易形成拉扯，重點在調整節奏與用法。",
    trine: "兩股功能較容易自然流通，也可能因太順而被忽略。",
    opposition: "兩股功能分居兩端，課題在協調、取捨與平衡。",
  } as const;
  const zhHans = {
    conjunction: "两股功能彼此叠加，往往需要一起看。",
    sextile: "两股功能较容易互相支援，但仍需要主动运用。",
    square: "两股功能较容易形成拉扯，重点在调整节奏与用法。",
    trine: "两股功能较容易自然流通，也可能因太顺而被忽略。",
    opposition: "两股功能分居两端，课题在协调、取舍与平衡。",
  } as const;
  return locale === "en" ? en[type] : locale === "zh-Hans" ? zhHans[type] : zhHant[type];
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
  const classicalBodies = (qizheng?.bodies ?? []).filter((body) =>
    !body.virtual && WESTERN_BODY_KEYS.includes(body.key as WesternBodyKey),
  );
  const topics = westernHouseTopics(locale);

  const timeNote = birth.timeUnknown
    ? (locale === "en"
      ? "Birth time is not complete, so Rising, houses, angles and house-based interpretation are not judged."
      : locale === "zh-Hans"
        ? "出生时间不足，暂不判定上升、十二宫、四轴与落宫解读。"
        : "出生時間不足，暫不判定上升、十二宮、四軸與落宮解讀。")
    : "";

  let chartHouses: ReturnType<typeof computeHouses> | undefined;
  let chartAngles: ReturnType<typeof computeAngles> | undefined;
  if (!birth.timeUnknown) {
    const angles = computeAngles({
      date: utc,
      gmstDegrees: gmstDegrees(utc),
      latitude: birth.city.latitude,
      longitude: birth.city.longitude,
    });
    chartHouses = computeHouses(angles, birth.city.latitude, "placidus");
    chartAngles = angles;
  }

  const planetRows = classicalBodies.map((body) => {
    const key = body.key as WesternBodyKey;
    const pos = decoratePosition(WESTERN_POINT_KEYS[key], body.longitude, body.retrograde);
    const house = chartHouses ? houseOf(body.longitude, chartHouses) : null;
    const movement = body.retrograde
      ? (locale === "en" ? "Retrograde" : locale === "zh-Hans" ? "逆行" : "逆行")
      : (locale === "en" ? "Direct" : locale === "zh-Hans" ? "顺行" : "順行");
    const interpretation = house
      ? (locale === "en"
        ? `${westernPlanetFocus(key, locale)} is expressed in a ${westernSignTone(pos.sign, locale)} style, with its main life-area emphasis in ${westernHouseLabel(house, locale)}: ${topics[house - 1]}.`
        : locale === "zh-Hans"
          ? `${westernPlanetFocus(key, locale)}以「${westernSignTone(pos.sign, locale)}」的方式表现，主要落在${westernHouseLabel(house, locale)}的「${topics[house - 1]}」领域。`
          : `${westernPlanetFocus(key, locale)}以「${westernSignTone(pos.sign, locale)}」的方式表現，主要落在${westernHouseLabel(house, locale)}的「${topics[house - 1]}」領域。`)
      : timeNote;
    return [
      westernPlanetLabel(key, locale),
      `${signLabel(pos.sign, locale)} ${birth.timeUnknown ? "—" : formatDegree(pos)}`,
      house ? westernHouseLabel(house, locale) : "—",
      movement,
      interpretation || "—",
    ];
  });

  const houseRows = chartHouses ? chartHouses.cusps.map((cusp, index) => {
    const house = index + 1;
    const cuspPos = decoratePosition("Ascendant", cusp);
    const ruler = traditionalRuler(cuspPos.signIndex);
    const rulerKey = ruler.toLowerCase() as WesternBodyKey;
    const rulerBody = classicalBodies.find((body) => body.key === rulerKey);
    const rulerHouse = rulerBody ? houseOf(rulerBody.longitude, chartHouses!) : null;
    const occupants = classicalBodies.filter((body) => houseOf(body.longitude, chartHouses!) === house);
    const occupantNames = occupants.map((body) => westernPlanetLabel(body.key as WesternBodyKey, locale));
    const occupantFocus = occupants.map((body) => westernPlanetFocus(body.key as WesternBodyKey, locale));
    const rulerName = westernPlanetLabel(rulerKey, locale);
    const cuspTone = westernSignTone(cuspPos.sign, locale);

    const interpretation = locale === "en"
      ? occupants.length
        ? `${topics[index]} is directly occupied by ${occupantNames.join(", ")}; the active functions here are ${occupantFocus.join("; ")}. The ${signLabel(cuspPos.sign, locale)} cusp gives the area a ${cuspTone} style, while traditional ruler ${rulerName}${rulerHouse ? ` in ${westernHouseLabel(rulerHouse, locale)}` : ""} links this house to another life area.`
        : `${topics[index]} is an empty house, which does not mean the topic is absent. The ${signLabel(cuspPos.sign, locale)} cusp gives it a ${cuspTone} style, and traditional ruler ${rulerName}${rulerHouse ? ` in ${westernHouseLabel(rulerHouse, locale)}` : ""} is the main route used to connect the topic elsewhere in the chart.`
      : locale === "zh-Hans"
        ? occupants.length
          ? `「${topics[index]}」有${occupantNames.join("、")}直接落入；重点同时参考${occupantFocus.join("、")}。宫头${signLabel(cuspPos.sign, locale)}让这一领域偏向「${cuspTone}」的运作方式，传统主星${rulerName}${rulerHouse ? `落${westernHouseLabel(rulerHouse, locale)}` : ""}，形成进一步联动。`
          : `「${topics[index]}」为空宫，不等于这个领域不存在。宫头${signLabel(cuspPos.sign, locale)}让它偏向「${cuspTone}」的运作方式；传统主星${rulerName}${rulerHouse ? `落${westernHouseLabel(rulerHouse, locale)}` : ""}，是这个宫位与其他生活领域连接的主要线索。`
        : occupants.length
          ? `「${topics[index]}」有${occupantNames.join("、")}直接落入；重點同時參考${occupantFocus.join("、")}。宮頭${signLabel(cuspPos.sign, locale)}讓這一領域偏向「${cuspTone}」的運作方式，傳統主星${rulerName}${rulerHouse ? `落${westernHouseLabel(rulerHouse, locale)}` : ""}，形成進一步聯動。`
          : `「${topics[index]}」為空宮，不等於這個領域不存在。宮頭${signLabel(cuspPos.sign, locale)}讓它偏向「${cuspTone}」的運作方式；傳統主星${rulerName}${rulerHouse ? `落${westernHouseLabel(rulerHouse, locale)}` : ""}，是這個宮位與其他生活領域連接的主要線索。`;

    return [
      westernHouseLabel(house, locale),
      `${signLabel(cuspPos.sign, locale)} ${formatDegree(cuspPos)}`,
      `${rulerName}${rulerHouse ? ` · ${westernHouseLabel(rulerHouse, locale)}` : ""}`,
      occupantNames.join("、") || (locale === "en" ? "Empty" : locale === "zh-Hans" ? "空宫" : "空宮"),
      topics[index],
      interpretation,
    ];
  }) : [];

  const angleRows = chartAngles ? [
    ["ASC", chartAngles.ascendant, locale === "en" ? "self-presentation and first approach" : locale === "zh-Hans" ? "自我呈现与第一反应" : "自我呈現與第一反應"],
    ["DSC", chartAngles.descendant, locale === "en" ? "partnership and the other person" : locale === "zh-Hans" ? "伴侣、合作与他人" : "伴侶、合作與他人"],
    ["MC", chartAngles.mc, locale === "en" ? "public role, vocation and visibility" : locale === "zh-Hans" ? "社会角色、志业与可见度" : "社會角色、志業與可見度"],
    ["IC", chartAngles.ic, locale === "en" ? "home, roots and private foundation" : locale === "zh-Hans" ? "家庭、根基与私人基础" : "家庭、根基與私人基礎"],
  ].map(([label, longitude, theme]) => {
    const pos = decoratePosition("Ascendant", Number(longitude));
    const tone = westernSignTone(pos.sign, locale);
    return [
      String(label),
      `${signLabel(pos.sign, locale)} ${formatDegree(pos)}`,
      String(theme),
      locale === "en"
        ? `${String(theme)} tends to be approached in a ${tone} style.`
        : locale === "zh-Hans"
          ? `${String(theme)}较常以「${tone}」的方式展开。`
          : `${String(theme)}較常以「${tone}」的方式展開。`,
    ];
  }) : [];

  const aspectPoints = !birth.timeUnknown
    ? classicalBodies.map((body) => {
      const key = body.key as WesternBodyKey;
      return decoratePosition(WESTERN_POINT_KEYS[key], body.longitude, body.retrograde);
    })
    : [];
  const aspectRows = calculateMajorAspects(aspectPoints).map((aspect) => {
    const aKey = aspect.a.toLowerCase() as WesternBodyKey;
    const bKey = aspect.b.toLowerCase() as WesternBodyKey;
    return [
      `${westernPlanetLabel(aKey, locale)} ${westernAspectLabel(aspect.type, locale)} ${westernPlanetLabel(bKey, locale)}`,
      `${aspect.orb.toFixed(1)}°`,
      locale === "en"
        ? `${westernPlanetFocus(aKey, locale)} meets ${westernPlanetFocus(bKey, locale)}. ${westernAspectMeaning(aspect.type, locale)}`
        : locale === "zh-Hans"
          ? `${westernPlanetFocus(aKey, locale)}与${westernPlanetFocus(bKey, locale)}发生互动。${westernAspectMeaning(aspect.type, locale)}`
          : `${westernPlanetFocus(aKey, locale)}與${westernPlanetFocus(bKey, locale)}發生互動。${westernAspectMeaning(aspect.type, locale)}`,
    ];
  });

  const sections: SpecialistSection[] = [
    {
      title: locale === "en" ? "Seven planets · signs and houses" : locale === "zh-Hans" ? "七曜星座与落宫解读" : "七曜星座與落宮解讀",
      body: "",
      table: {
        headers: locale === "en"
          ? ["Planet", "Sign / degree", "House", "Motion", "Interpretation"]
          : locale === "zh-Hans"
            ? ["行星", "星座／度分", "落宫", "运行", "解读"]
            : ["行星", "星座／度分", "落宮", "運行", "解讀"],
        rows: planetRows,
      },
    },
  ];

  if (chartHouses) {
    sections.push({
      title: locale === "en" ? "All twelve houses" : locale === "zh-Hans" ? "十二宫完整解读" : "十二宮完整解讀",
      body: "",
      table: {
        headers: locale === "en"
          ? ["House", "Cusp", "Traditional ruler", "Planets inside", "Life topic", "Interpretation"]
          : locale === "zh-Hans"
            ? ["宫位", "宫头", "传统主星", "宫内行星", "生活主题", "解读"]
            : ["宮位", "宮頭", "傳統主星", "宮內行星", "生活主題", "解讀"],
        rows: houseRows,
      },
    });
  }

  if (chartAngles) {
    sections.push({
      title: locale === "en" ? "Four angles" : locale === "zh-Hans" ? "四轴解读" : "四軸解讀",
      body: "",
      table: {
        headers: locale === "en" ? ["Angle", "Position", "Theme", "Interpretation"] : locale === "zh-Hans" ? ["四轴", "位置", "主题", "解读"] : ["四軸", "位置", "主題", "解讀"],
        rows: angleRows,
      },
    });
  }

  if (!birth.timeUnknown) {
    sections.push({
      title: locale === "en" ? "Major aspects" : locale === "zh-Hans" ? "主要相位" : "主要相位",
      body: "",
      table: {
        headers: locale === "en" ? ["Aspect", "Orb", "Interpretation"] : locale === "zh-Hans" ? ["相位", "容许度", "解读"] : ["相位", "容許度", "解讀"],
        rows: aspectRows.length
          ? aspectRows
          : [[
            "—",
            "—",
            locale === "en"
              ? "No major aspect falls inside the current orb settings."
              : locale === "zh-Hans"
                ? "目前设定的容许度内没有检测到主要相位。"
                : "目前設定的容許度內沒有偵測到主要相位。",
          ]],
      },
    });
  }

  return {
    title: locale === "en" ? "Western astrology" : "西洋星座",
    lead: locale === "en"
      ? "This page no longer isolates one Sun-house line. With a documented birth time it reads the seven classical planets by sign and house, all twelve houses, the four angles and the major aspects together."
      : locale === "zh-Hans"
        ? "本页不再只抽一个太阳落宫。出生时间完整时，会一起看七曜星座与落宫、十二宫宫头与传统主星、四轴和主要相位。"
        : "本頁不再只抽一個太陽落宮。出生時間完整時，會一起看七曜星座與落宮、十二宮宮頭與傳統主星、四軸和主要相位。",
    warning: timeNote || undefined,
    chart: !birth.timeUnknown && qizheng ? { kind: "western", bodies: classicalBodies, houses: chartHouses, angles: chartAngles } : undefined,
    sections,
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
      ? "This page reuses the shared birth record. After you confirm the recorded minute, D60 generates its own grouping here. If ±2 minutes would change the rising subdivision, the grouping is still shown as weak supporting evidence and is never used to rectify time."
      : locale === "zh-Hans"
        ? "本页沿用同一份出生资料。确认出生分钟后，D60 会在本卷生成自己的分组；若前后 ±2 分钟会改上升细分，仍输出盘面，只作弱旁证，不用 D60 反向考时。"
        : "本頁沿用同一份出生資料。確認出生分鐘後，D60 會在本卷生成自己的分組；若前後 ±2 分鐘會改上升細分，仍輸出盤面，只作弱旁證，不用 D60 反向考時。",
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
