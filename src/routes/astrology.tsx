import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { searchCities } from "@/lib/actions";
import { localizeCityHit } from "@/lib/bazi/cities";
import type { CityHit } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { localBirthToUtc } from "@/lib/qizheng/engine";
import {
  ZODIAC_SIGNS,
  calculateMajorAspects,
  computeAngles,
  computeHouses,
  decoratePosition,
  formatDegree,
  houseOf,
  meanLilith,
  meanNorthNode,
  solarAltitude,
  summarizeBalance,
  traditionalDignity,
  traditionalRuler,
  type Aspect,
  type ClassicalPlanetKey,
  type HouseChart,
  type ModernPlanetKey,
  type PointKey,
  type ZodiacPosition,
} from "@/lib/western-astrology/engine";

export const Route = createFileRoute("/astrology")({ component: WesternAstrologyPage });

const ASTRO_SCRIPT_ID = "zhaowu-astronomy-engine-western";
const ASTRO_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js";
const PROFILE = "ZW-WESTERN-TROPICAL-MULTI-LENS-1.0";
const PLANET_KEYS: ModernPlanetKey[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
const CLASSICAL_KEYS: ClassicalPlanetKey[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const PERSONAL_KEYS: PointKey[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Ascendant", "MC"];

interface AstronomyApi {
  GeoVector: (body: string, date: Date, aberration: boolean) => unknown;
  Ecliptic: (vector: unknown) => { elon: number };
  SiderealTime: (date: Date) => number;
}

type Result = {
  exactTime: boolean;
  utcIso: string;
  city: CityHit;
  planets: ZodiacPosition[];
  extras: ZodiacPosition[];
  ascendant?: ZodiacPosition;
  mc?: ZodiacPosition;
  placidus?: HouseChart;
  whole?: HouseChart;
  equal?: HouseChart;
  aspects: Aspect[];
  balance: ReturnType<typeof summarizeBalance>;
  sect?: "day" | "night";
  chartRuler?: ClassicalPlanetKey;
};

const COPY = {
  "zh-Hant": {
    kicker: "昭梧 · 西洋占星",
    title: "星座不是只看太陽",
    lead: "同一張西洋本命盤，現代心理占星、傳統／希臘化占星，以及不同宮制本來就會看出不同重點。昭梧分開運算，再列出共識、各自結論與分歧，不把不同流派硬揉成一套。",
    lenses: ["熱帶黃道本命盤", "現代心理占星", "傳統／希臘化占星", "Placidus × Whole Sign × Equal 宮制對照"],
    formTitle: "排西洋本命盤", formLead: "完整盤需要出生日期、出生地與分鐘級時間；不知道時間仍可看太陽與行星，但不判上升、宮位與日夜盤。",
    year: "年", month: "月", dateDay: "日", hour: "時", minute: "分", city: "出生地", cityPh: "搜尋城市",
    unknown: "不知道出生時間", submit: "生成多流派星盤", calculating: "正在計算…", needCity: "請先選擇出生地。", invalid: "請檢查出生日期與時間。", engineError: "天文計算模組暫時無法載入。",
    baseTitle: "本命盤骨架", noAsc: "未知出生時間：上升、MC、宮位與日夜盤不判。月亮按當地中午估算，若接近換座邊界不作硬結論。",
    psychTitle: "現代心理占星", psychLead: "重點放在內在動機、情緒需要、溝通、關係、行動，以及緊密相位形成的心理拉力。",
    traditionalTitle: "傳統／希臘化視角", traditionalLead: "同樣使用熱帶黃道，但以七曜、Whole Sign 宮、日夜盤、命主星與傳統尊貴／失勢狀態為重。",
    housesTitle: "宮制差異｜分歧直接列出", housesLead: "行星星座不因宮制改變，但它落入哪個人生領域可能不同。Placidus、Whole Sign、Equal 分開計算。",
    planet: "星體", placidus: "Placidus", whole: "Whole Sign", equal: "Equal", same: "三制一致", different: "宮位有分歧",
    aspectsTitle: "主要相位", aspectsLead: "現代層計算合、六合、刑、拱、沖，按固定允許度只列有效相位。",
    extensionsTitle: "現代延伸點", extensionsLead: "天王、海王、冥王作世代／深層背景；北交點採 Mean Node，Lilith 採 Mean Black Moon（平均月遠點）。",
    compareTitle: "多流派合看", consensus: "共同點", independent: "各自最強的地方", conflicts: "分歧", incomparable: "不可混算",
    consensusBody: "西洋各視角共用同一套熱帶黃道天文位置；行星落座不因宮制而改變。",
    independentBody: "心理占星讀內在模式與相位；傳統占星讀七曜、日夜盤、命主星與 Whole Sign 結構；宮制比較只判事情落在哪個人生領域。",
    noConflict: "目前列出的七曜在三種宮制下沒有出現宮位分歧。",
    incomparableBody: "印度 Jyotish 的 Lahiri 恆星黃道與 D1／D9／D60 保持獨立，不換算後強行併入這張熱帶黃道盤。",
    chartRuler: "命主星", sect: "日夜盤", sectDay: "日盤", sectNight: "夜盤", dominant: "主導元素／模式",
    profile: "計算規格", back: "回首頁", vedic: "前世今生 D60", boundary: "占星作為文化與自我觀察工具，不作科學診斷，也不作現實決策的唯一依據。",
  },
  "zh-Hans": {
    kicker: "昭梧 · 西洋占星",
    title: "星座不是只看太阳",
    lead: "同一张西洋本命盘，现代心理占星、传统／希腊化占星，以及不同宫制本来就会看出不同重点。昭梧分开运算，再列出共识、各自结论与分歧，不把不同流派硬揉成一套。",
    lenses: ["热带黄道本命盘", "现代心理占星", "传统／希腊化占星", "Placidus × Whole Sign × Equal 宫制对照"],
    formTitle: "排西洋本命盘", formLead: "完整盘需要出生日期、出生地与分钟级时间；不知道时间仍可看太阳与行星，但不判上升、宫位与日夜盘。",
    year: "年", month: "月", dateDay: "日", hour: "时", minute: "分", city: "出生地", cityPh: "搜索城市",
    unknown: "不知道出生时间", submit: "生成多流派星盘", calculating: "正在计算…", needCity: "请先选择出生地。", invalid: "请检查出生日期与时间。", engineError: "天文计算模块暂时无法加载。",
    baseTitle: "本命盘骨架", noAsc: "未知出生时间：上升、MC、宫位与日夜盘不判。月亮按当地中午估算，若接近换座边界不作硬结论。",
    psychTitle: "现代心理占星", psychLead: "重点放在内在动机、情绪需要、沟通、关系、行动，以及紧密相位形成的心理拉力。",
    traditionalTitle: "传统／希腊化视角", traditionalLead: "同样使用热带黄道，但以七曜、Whole Sign 宫、日夜盘、命主星与传统尊贵／失势状态为重。",
    housesTitle: "宫制差异｜分歧直接列出", housesLead: "行星星座不因宫制改变，但它落入哪个人生领域可能不同。Placidus、Whole Sign、Equal 分开计算。",
    planet: "星体", placidus: "Placidus", whole: "Whole Sign", equal: "Equal", same: "三制一致", different: "宫位有分歧",
    aspectsTitle: "主要相位", aspectsLead: "现代层计算合、六合、刑、拱、冲，按固定允许度只列有效相位。",
    extensionsTitle: "现代延伸点", extensionsLead: "天王、海王、冥王作世代／深层背景；北交点采用 Mean Node，Lilith 采用 Mean Black Moon（平均月远点）。",
    compareTitle: "多流派合看", consensus: "共同点", independent: "各自最强的地方", conflicts: "分歧", incomparable: "不可混算",
    consensusBody: "西洋各视角共用同一套热带黄道天文位置；行星落座不因宫制而改变。",
    independentBody: "心理占星读内在模式与相位；传统占星读七曜、日夜盘、命主星与 Whole Sign 结构；宫制比较只判断事情落在哪个人生领域。",
    noConflict: "目前列出的七曜在三种宫制下没有出现宫位分歧。",
    incomparableBody: "印度 Jyotish 的 Lahiri 恒星黄道与 D1／D9／D60 保持独立，不换算后强行并入这张热带黄道盘。",
    chartRuler: "命主星", sect: "日夜盘", sectDay: "日盘", sectNight: "夜盘", dominant: "主导元素／模式",
    profile: "计算规格", back: "回首页", vedic: "前世今生 D60", boundary: "占星作为文化与自我观察工具，不作科学诊断，也不作现实决定的唯一依据。",
  },
  en: {
    kicker: "Zhaowu · Western astrology",
    title: "A birth chart is more than a Sun sign",
    lead: "Modern psychological astrology, traditional/Hellenistic astrology and different house systems can legitimately emphasise different things in the same natal chart. Zhaowu calculates them separately, then shows agreement, independent conclusions and conflicts instead of forcing one blended answer.",
    lenses: ["Tropical natal chart", "Modern psychological astrology", "Traditional / Hellenistic astrology", "Placidus × Whole Sign × Equal-house comparison"],
    formTitle: "Calculate a Western natal chart", formLead: "A full chart needs date, birthplace and a birth time recorded to the minute. With unknown time, planetary signs remain available, but Ascendant, houses and sect are withheld.",
    year: "Year", month: "Month", dateDay: "Day", hour: "Hour", minute: "Minute", city: "Birthplace", cityPh: "Search city",
    unknown: "Birth time unknown", submit: "Generate multi-lens chart", calculating: "Calculating…", needCity: "Choose a birthplace first.", invalid: "Check the birth date and time.", engineError: "The astronomy module could not load.",
    baseTitle: "Natal chart structure", noAsc: "Unknown birth time: Ascendant, MC, houses and sect are withheld. The Moon is sampled at local noon and is not treated as definitive near a sign boundary.",
    psychTitle: "Modern psychological lens", psychLead: "Focuses on motivation, emotional needs, communication, relating, action and the psychological tension created by close aspects.",
    traditionalTitle: "Traditional / Hellenistic lens", traditionalLead: "Uses the same tropical zodiac but prioritises the seven classical planets, Whole Sign houses, sect, chart ruler and traditional dignity/debility.",
    housesTitle: "House-system differences", housesLead: "A planet's zodiac sign stays the same, but the life area it occupies can change. Placidus, Whole Sign and Equal houses are calculated separately.",
    planet: "Body", placidus: "Placidus", whole: "Whole Sign", equal: "Equal", same: "all three agree", different: "house conflict",
    aspectsTitle: "Major aspects", aspectsLead: "The modern layer calculates conjunction, sextile, square, trine and opposition using a fixed orb profile.",
    extensionsTitle: "Modern extensions", extensionsLead: "Uranus, Neptune and Pluto are treated as generational/deep-background factors. North Node is Mean Node; Lilith is Mean Black Moon (mean lunar apogee).",
    compareTitle: "Cross-reading", consensus: "Agreement", independent: "What each lens does best", conflicts: "Conflicts", incomparable: "Do not merge",
    consensusBody: "All Western lenses share the same tropical astronomical positions. Planetary signs do not change when the house system changes.",
    independentBody: "Psychological astrology reads inner patterns and aspects; traditional astrology reads the seven planets, sect, chart ruler and Whole Sign structure; house comparison only asks where a topic lands in life.",
    noConflict: "No house-system disagreement appears among the seven classical planets listed here.",
    incomparableBody: "Jyotish keeps its separate Lahiri sidereal framework. D1/D9/D60 are not converted and blended into this tropical chart.",
    chartRuler: "Chart ruler", sect: "Sect", sectDay: "Day chart", sectNight: "Night chart", dominant: "Dominant element / mode",
    profile: "Calculation profile", back: "Home", vedic: "Past & Present D60", boundary: "Astrology is presented as a cultural and self-reflection framework, not a scientific diagnosis or the sole basis for real-world decisions.",
  },
} as const;

const SIGN_NAMES = {
  "zh-Hant": ["白羊", "金牛", "雙子", "巨蟹", "獅子", "處女", "天秤", "天蠍", "射手", "摩羯", "水瓶", "雙魚"],
  "zh-Hans": ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"],
  en: [...ZODIAC_SIGNS],
} as const;

const SIGN_THEMES = {
  "zh-Hant": ["先行、直接、要自己開始", "穩定、價值、感官與耐性", "好奇、轉換、資訊與交流", "安全感、照顧、記憶與歸屬", "表達、自尊、創造與被看見", "分析、修正、服務與細節", "平衡、關係、審美與協商", "深度、界線、信任與轉化", "探索、信念、自由與遠景", "責任、結構、耐力與成果", "獨立、群體、創新與距離感", "共感、想像、流動與放下"],
  "zh-Hans": ["先行、直接、要自己开始", "稳定、价值、感官与耐性", "好奇、转换、信息与交流", "安全感、照顾、记忆与归属", "表达、自尊、创造与被看见", "分析、修正、服务与细节", "平衡、关系、审美与协商", "深度、界线、信任与转化", "探索、信念、自由与远景", "责任、结构、耐力与成果", "独立、群体、创新与距离感", "共感、想象、流动与放下"],
  en: ["initiative, directness and starting things yourself", "stability, values, the senses and patience", "curiosity, switching perspectives, information and exchange", "security, care, memory and belonging", "expression, pride, creativity and being seen", "analysis, refinement, service and detail", "balance, relationships, aesthetics and negotiation", "depth, boundaries, trust and transformation", "exploration, belief, freedom and long-range perspective", "responsibility, structure, endurance and results", "independence, groups, innovation and distance", "empathy, imagination, permeability and release"],
} as const;

const LABELS = {
  "zh-Hant": { Sun: "太陽", Moon: "月亮", Mercury: "水星", Venus: "金星", Mars: "火星", Jupiter: "木星", Saturn: "土星", Uranus: "天王星", Neptune: "海王星", Pluto: "冥王星", NorthNode: "北交點（Mean）", SouthNode: "南交點（Mean）", Lilith: "黑月莉莉絲（Mean）", Ascendant: "上升", MC: "天頂 MC" },
  "zh-Hans": { Sun: "太阳", Moon: "月亮", Mercury: "水星", Venus: "金星", Mars: "火星", Jupiter: "木星", Saturn: "土星", Uranus: "天王星", Neptune: "海王星", Pluto: "冥王星", NorthNode: "北交点（Mean）", SouthNode: "南交点（Mean）", Lilith: "黑月莉莉丝（Mean）", Ascendant: "上升", MC: "天顶 MC" },
  en: { Sun: "Sun", Moon: "Moon", Mercury: "Mercury", Venus: "Venus", Mars: "Mars", Jupiter: "Jupiter", Saturn: "Saturn", Uranus: "Uranus", Neptune: "Neptune", Pluto: "Pluto", NorthNode: "North Node (mean)", SouthNode: "South Node (mean)", Lilith: "Black Moon Lilith (mean)", Ascendant: "Ascendant", MC: "MC" },
} as const;

const ROLE_LABELS = {
  "zh-Hant": { Sun: "核心意志", Moon: "情緒需要", Ascendant: "第一反應", Mercury: "思考溝通", Venus: "關係與價值", Mars: "行動與界線" },
  "zh-Hans": { Sun: "核心意志", Moon: "情绪需要", Ascendant: "第一反应", Mercury: "思考沟通", Venus: "关系与价值", Mars: "行动与界线" },
  en: { Sun: "Core intent", Moon: "Emotional needs", Ascendant: "First response", Mercury: "Thinking and communication", Venus: "Relating and values", Mars: "Action and boundaries" },
} as const;

const ASPECT_LABELS = {
  "zh-Hant": { conjunction: "合", sextile: "六合", square: "刑", trine: "拱", opposition: "沖" },
  "zh-Hans": { conjunction: "合", sextile: "六合", square: "刑", trine: "拱", opposition: "冲" },
  en: { conjunction: "conjunction", sextile: "sextile", square: "square", trine: "trine", opposition: "opposition" },
} as const;

const DIGNITY_LABELS = {
  "zh-Hant": { domicile: "入廟／守護", exaltation: "擢升", detriment: "失勢", fall: "落陷", peregrine: "無主要本質尊貴" },
  "zh-Hans": { domicile: "入庙／守护", exaltation: "擢升", detriment: "失势", fall: "落陷", peregrine: "无主要本质尊贵" },
  en: { domicile: "domicile", exaltation: "exaltation", detriment: "detriment", fall: "fall", peregrine: "peregrine" },
} as const;

const BALANCE_LABELS = {
  "zh-Hant": { fire: "火", earth: "土", air: "風", water: "水", cardinal: "開創", fixed: "固定", mutable: "變動" },
  "zh-Hans": { fire: "火", earth: "土", air: "风", water: "水", cardinal: "开创", fixed: "固定", mutable: "变动" },
  en: { fire: "Fire", earth: "Earth", air: "Air", water: "Water", cardinal: "Cardinal", fixed: "Fixed", mutable: "Mutable" },
} as const;

let astronomyPromise: Promise<AstronomyApi> | null = null;
function loadAstronomy() {
  const browser = window as typeof window & { Astronomy?: AstronomyApi };
  if (browser.Astronomy) return Promise.resolve(browser.Astronomy);
  if (astronomyPromise) return astronomyPromise;
  astronomyPromise = new Promise<AstronomyApi>((resolve, reject) => {
    const existing = document.getElementById(ASTRO_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const finish = () => browser.Astronomy ? resolve(browser.Astronomy) : reject(new Error("astronomy-global"));
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => reject(new Error("astronomy-load")), { once: true });
    if (!existing) {
      script.id = ASTRO_SCRIPT_ID;
      script.src = ASTRO_SCRIPT_URL;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }).catch((error) => { astronomyPromise = null; throw error; });
  return astronomyPromise;
}

function bodyLongitude(api: AstronomyApi, key: ModernPlanetKey, date: Date) {
  return api.Ecliptic(api.GeoVector(key, date, true)).elon;
}

function calculatePlanet(api: AstronomyApi, key: ModernPlanetKey, date: Date) {
  const longitude = bodyLongitude(api, key, date);
  const later = bodyLongitude(api, key, new Date(date.getTime() + 6 * 60 * 60 * 1000));
  const delta = ((later - longitude + 540) % 360) - 180;
  return decoratePosition(key, longitude, delta < 0);
}

function signName(position: ZodiacPosition, locale: Locale) { return SIGN_NAMES[locale][position.signIndex]; }
function pointLabel(key: PointKey, locale: Locale) { return LABELS[locale][key]; }

function CityField({ locale, city, onSelect, label, placeholder }: { locale: Locale; city: CityHit | null; onSelect: (city: CityHit | null) => void; label: string; placeholder: string }) {
  const [query, setQuery] = useState(city?.display ?? "");
  const [hits, setHits] = useState<CityHit[]>([]);
  useEffect(() => { setQuery(city ? localizeCityHit(city, locale).display : ""); }, [city, locale]);
  useEffect(() => {
    const text = query.trim();
    if (city && text === localizeCityHit(city, locale).display) { setHits([]); return; }
    if (text.length < 2) { setHits([]); return; }
    let alive = true;
    const timer = window.setTimeout(() => {
      void searchCities({ data: text }).then((rows) => { if (alive) setHits(rows.map((row) => localizeCityHit(row, locale))); }).catch(() => { if (alive) setHits([]); });
    }, 220);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [city, locale, query]);
  return <label className="relative block text-sm font-medium text-ink">{label}
    <input value={query} onChange={(event) => { setQuery(event.target.value); if (city) onSelect(null); }} placeholder={placeholder} autoComplete="off" className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white/75 px-4 text-base outline-none focus:border-[#7e5268]" />
    {hits.length ? <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-line bg-[#fffaf0] p-1 shadow-xl">{hits.map((hit) => <button type="button" key={`${hit.latitude}-${hit.longitude}`} onClick={() => { onSelect(hit); setQuery(hit.display); setHits([]); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f1e3c9]"><b className="block text-sm text-ink">{hit.display}</b><small className="text-ink-mute">{hit.timezone}</small></button>)}</div> : null}
  </label>;
}

function houseDisplay(position: ZodiacPosition, chart: HouseChart | undefined, locale: Locale) {
  if (!chart) return "—";
  const house = houseOf(position.longitude, chart);
  return locale === "en" ? `H${house}` : `${house}宮`;
}

function WesternAstrologyPage() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [year, setYear] = useState(""); const [month, setMonth] = useState(""); const [day, setDay] = useState("");
  const [hour, setHour] = useState(""); const [minute, setMinute] = useState(""); const [unknownTime, setUnknownTime] = useState(false);
  const [city, setCity] = useState<CityHit | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [result, setResult] = useState<Result | null>(null);
  const maxYear = new Date().getFullYear();

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setResult(null);
    if (!city) { setError(copy.needCity); return; }
    const y = Number(year), m = Number(month), d = Number(day);
    const h = unknownTime ? 12 : Number(hour), min = unknownTime ? 0 : Number(minute);
    const civil = new Date(Date.UTC(y, m - 1, d, h, min));
    if (![y, m, d, h, min].every(Number.isFinite) || civil.getUTCFullYear() !== y || civil.getUTCMonth() !== m - 1 || civil.getUTCDate() !== d || h < 0 || h > 23 || min < 0 || min > 59) { setError(copy.invalid); return; }
    setBusy(true);
    try {
      const api = await loadAstronomy();
      const utc = localBirthToUtc({ year: y, month: m, day: d, hour: h, minute: min, timezone: city.timezone });
      const planets = PLANET_KEYS.map((key) => calculatePlanet(api, key, utc));
      const node = meanNorthNode(utc);
      const extras = [decoratePosition("NorthNode", node, true), decoratePosition("SouthNode", node + 180, true), decoratePosition("Lilith", meanLilith(utc))];
      let ascendant: ZodiacPosition | undefined; let mc: ZodiacPosition | undefined; let placidus: HouseChart | undefined; let whole: HouseChart | undefined; let equal: HouseChart | undefined; let sect: "day" | "night" | undefined; let chartRuler: ClassicalPlanetKey | undefined;
      const aspectPoints: ZodiacPosition[] = [...planets, ...extras];
      if (!unknownTime) {
        const angles = computeAngles({ date: utc, gmstDegrees: api.SiderealTime(utc) * 15, latitude: city.latitude, longitude: city.longitude });
        ascendant = decoratePosition("Ascendant", angles.ascendant); mc = decoratePosition("MC", angles.mc);
        placidus = computeHouses(angles, city.latitude, "placidus"); whole = computeHouses(angles, city.latitude, "whole"); equal = computeHouses(angles, city.latitude, "equal");
        chartRuler = traditionalRuler(ascendant.signIndex);
        const sun = planets.find((point) => point.key === "Sun")!;
        const altitude = solarAltitude({ sunLongitude: sun.longitude, localSiderealDegrees: angles.ramc, latitude: city.latitude, obliquity: angles.obliquity });
        sect = altitude > -0.833 ? "day" : "night";
        aspectPoints.push(ascendant, mc);
      }
      const aspects = calculateMajorAspects(aspectPoints).filter((aspect) => PERSONAL_KEYS.includes(aspect.a) || PERSONAL_KEYS.includes(aspect.b));
      const balance = summarizeBalance([...planets.filter((point) => ["Sun", "Moon", "Mercury", "Venus", "Mars"].includes(point.key)), ...(ascendant ? [ascendant] : [])]);
      setResult({ exactTime: !unknownTime, utcIso: utc.toISOString(), city, planets, extras, ascendant, mc, placidus, whole, equal, aspects, balance, sect, chartRuler });
      window.setTimeout(() => document.getElementById("western-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
    } catch { setError(copy.engineError); }
    finally { setBusy(false); }
  }

  const byKey = useMemo(() => Object.fromEntries((result?.planets ?? []).map((position) => [position.key, position])) as Partial<Record<ModernPlanetKey, ZodiacPosition>>, [result]);
  const bigSix = useMemo(() => {
    if (!result) return [];
    const keys: Array<"Sun" | "Moon" | "Ascendant" | "Mercury" | "Venus" | "Mars"> = ["Sun", "Moon", "Ascendant", "Mercury", "Venus", "Mars"];
    return keys.flatMap((key) => { const position = key === "Ascendant" ? result.ascendant : byKey[key]; return position ? [{ key, position }] : []; });
  }, [byKey, result]);
  const houseRows = useMemo(() => {
    if (!result?.placidus || !result.whole || !result.equal) return [];
    return CLASSICAL_KEYS.map((key) => { const position = byKey[key]!; const p = houseOf(position.longitude, result.placidus!); const w = houseOf(position.longitude, result.whole!); const e = houseOf(position.longitude, result.equal!); return { key, p, w, e, differs: new Set([p, w, e]).size > 1 }; });
  }, [byKey, result]);
  const conflicts = houseRows.filter((row) => row.differs);
  const topAspects = result?.aspects.slice(0, 12) ?? [];

  return <main className="mx-auto max-w-5xl space-y-6 pb-12 sm:space-y-8">
    <section className="relative overflow-hidden rounded-[2rem] border border-[#9f7b4d]/30 bg-[#f4ead6]/92 p-5 shadow-[0_24px_80px_rgba(68,49,30,.12)] sm:p-8">
      <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#7e5268]/12" /><div aria-hidden className="absolute right-7 top-7 text-5xl text-[#7e5268]/10">♎︎</div>
      <p className="relative text-[10px] font-semibold tracking-[0.24em] text-[#7e5268]">{copy.kicker}</p><h1 className="relative mt-3 max-w-3xl font-display text-3xl font-semibold tracking-[0.05em] text-ink sm:text-5xl">{copy.title}</h1><p className="relative mt-4 max-w-3xl text-sm leading-7 text-ink-soft sm:text-base sm:leading-8">{copy.lead}</p>
      <div className="relative mt-5 grid gap-2 sm:grid-cols-2">{copy.lenses.map((lens, index) => <div key={lens} className="rounded-xl border border-[#9f7b4d]/22 bg-white/45 px-3 py-2 text-xs leading-5 text-ink-soft"><b className="mr-2 text-[#7e5268]">{String(index + 1).padStart(2, "0")}</b>{lens}</div>)}</div>
    </section>

    <section className="rounded-[1.75rem] border border-[#9f7b4d]/28 bg-[#fffaf0]/92 p-4 shadow-[0_18px_52px_rgba(70,49,26,.09)] sm:p-6">
      <h2 className="font-display text-2xl font-semibold text-ink">{copy.formTitle}</h2><p className="mt-2 text-sm leading-7 text-ink-soft">{copy.formLead}</p>
      <form onSubmit={submit} className="mt-5 rounded-2xl border border-line bg-cream/80 p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{[[copy.year, year, setYear, 1900, maxYear], [copy.month, month, setMonth, 1, 12], [copy.dateDay, day, setDay, 1, 31], [copy.hour, hour, setHour, 0, 23], [copy.minute, minute, setMinute, 0, 59]].map(([label, value, setter, min, max], index) => <label key={`${String(label)}-${index}`} className={`text-xs font-medium text-ink ${unknownTime && index >= 3 ? "opacity-40" : ""}`}><span className="block pb-1">{label as string}</span><input required={!unknownTime || index < 3} disabled={unknownTime && index >= 3} type="number" inputMode="numeric" min={min as number} max={max as number} value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="min-h-12 w-full rounded-xl border border-line bg-white/75 px-2 text-base outline-none focus:border-[#7e5268] disabled:bg-black/[0.03]" /></label>)}</div>
        <div className="mt-4"><CityField locale={locale} city={city} onSelect={setCity} label={copy.city} placeholder={copy.cityPh} /></div>
        <label className="mt-4 flex items-center gap-2 rounded-xl border border-[#9f7b4d]/22 bg-white/45 px-3 py-3 text-sm text-ink-soft"><input type="checkbox" checked={unknownTime} onChange={(event) => setUnknownTime(event.target.checked)} className="h-4 w-4 accent-[#7e5268]" />{copy.unknown}</label>
        {error ? <p role="alert" className="mt-3 rounded-xl border border-cinnabar/25 bg-cinnabar/6 px-3 py-2 text-sm text-cinnabar-deep">{error}</p> : null}
        <button type="submit" disabled={busy} className="mt-5 min-h-13 w-full rounded-full bg-[#624b62] px-5 text-sm font-semibold tracking-[0.08em] text-[#fff8e8] disabled:opacity-55">{busy ? copy.calculating : copy.submit}</button>
      </form>
    </section>

    {result ? <section id="western-result" className="scroll-mt-20 space-y-5">
      <article className="rounded-[1.75rem] border border-[#9f7b4d]/28 bg-[#f7efdf]/95 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold tracking-[0.2em] text-[#7e5268]">TROPICAL NATAL CHART</p><h2 className="mt-1 font-display text-2xl font-semibold text-ink">{copy.baseTitle}</h2></div><span className="text-[10px] text-ink-mute">{result.city.display} · {result.city.timezone}</span></div>
        {!result.exactTime ? <p className="mt-4 rounded-xl border border-[#a57b3e]/25 bg-[#a57b3e]/6 px-3 py-2 text-xs leading-6 text-ink-soft">{copy.noAsc}</p> : null}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{bigSix.map(({ key, position }) => <div key={key} className="rounded-xl border border-[#9f7b4d]/22 bg-white/62 p-3"><p className="text-[10px] font-semibold tracking-[0.12em] text-ink-mute">{ROLE_LABELS[locale][key]}</p><p className="mt-1 font-display text-lg font-semibold text-[#624b62]">{pointLabel(key, locale)} · {signName(position, locale)}</p><p className="mt-1 text-xs text-ink-soft">{formatDegree(position)}{position.retrograde ? " ℞" : ""}</p></div>)}</div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{bigSix.map(({ key, position }) => <div key={`meaning-${key}`} className="rounded-xl border border-line/70 bg-white/42 px-4 py-3"><p className="text-[10px] font-semibold tracking-[0.12em] text-[#7e5268]">{ROLE_LABELS[locale][key]}</p><p className="mt-1 text-sm leading-6 text-ink-soft">{signName(position, locale)}：{SIGN_THEMES[locale][position.signIndex]}</p></div>)}</div>
      </article>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[#7e5268]/22 bg-[#f4ebdf]/92 p-4 sm:p-5"><p className="text-[10px] font-semibold tracking-[0.18em] text-[#7e5268]">MODERN</p><h3 className="mt-1 font-display text-xl font-semibold text-ink">{copy.psychTitle}</h3><p className="mt-2 text-sm leading-7 text-ink-soft">{copy.psychLead}</p><p className="mt-4 rounded-xl bg-white/50 px-3 py-2 text-sm text-ink-soft"><b className="text-ink">{copy.dominant}：</b>{BALANCE_LABELS[locale][result.balance.dominantElement]} × {BALANCE_LABELS[locale][result.balance.dominantModality]}</p><div className="mt-3 space-y-2">{topAspects.slice(0, 5).map((aspect) => <p key={`${aspect.a}-${aspect.b}-${aspect.type}`} className="rounded-xl border border-line/60 bg-white/44 px-3 py-2 text-xs leading-5 text-ink-soft"><b className="text-ink">{pointLabel(aspect.a, locale)} {ASPECT_LABELS[locale][aspect.type]} {pointLabel(aspect.b, locale)}</b> · orb {aspect.orb.toFixed(1)}°</p>)}</div></article>
        <article className="rounded-[1.5rem] border border-[#8b6a3d]/24 bg-[#f5ecd8]/92 p-4 sm:p-5"><p className="text-[10px] font-semibold tracking-[0.18em] text-[#8b6a3d]">TRADITIONAL</p><h3 className="mt-1 font-display text-xl font-semibold text-ink">{copy.traditionalTitle}</h3><p className="mt-2 text-sm leading-7 text-ink-soft">{copy.traditionalLead}</p>{result.chartRuler ? <p className="mt-4 rounded-xl bg-white/50 px-3 py-2 text-sm text-ink-soft"><b className="text-ink">{copy.chartRuler}：</b>{pointLabel(result.chartRuler, locale)} · <b className="ml-2 text-ink">{copy.sect}：</b>{result.sect === "day" ? copy.sectDay : copy.sectNight}</p> : null}<div className="mt-3 grid grid-cols-2 gap-2">{CLASSICAL_KEYS.map((key) => { const position = byKey[key]; if (!position) return null; const dignity = traditionalDignity(key, position.signIndex); return <div key={key} className="rounded-xl border border-line/60 bg-white/44 px-3 py-2 text-xs text-ink-soft"><b className="text-ink">{pointLabel(key, locale)}</b><span className="mt-1 block">{signName(position, locale)} · {DIGNITY_LABELS[locale][dignity]}</span></div>; })}</div></article>
      </div>

      {result.exactTime ? <article className="overflow-hidden rounded-[1.5rem] border border-[#9f7b4d]/28 bg-[#fffaf0]/94 p-4 sm:p-5"><h3 className="font-display text-xl font-semibold text-ink">{copy.housesTitle}</h3><p className="mt-2 text-sm leading-7 text-ink-soft">{copy.housesLead}</p>{result.placidus?.fallback ? <p className="mt-3 rounded-xl border border-cinnabar/20 bg-cinnabar/5 px-3 py-2 text-xs text-cinnabar-deep">{result.placidus.fallback}</p> : null}<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left text-xs"><thead><tr className="border-b border-line text-ink-mute"><th className="py-2 pr-3">{copy.planet}</th><th className="py-2 pr-3">{copy.placidus}</th><th className="py-2 pr-3">{copy.whole}</th><th className="py-2 pr-3">{copy.equal}</th><th className="py-2"> </th></tr></thead><tbody>{houseRows.map((row) => <tr key={row.key} className="border-b border-line/60"><td className="py-2.5 pr-3 font-medium text-ink">{pointLabel(row.key, locale)}</td><td className="py-2.5 pr-3">{locale === "en" ? `H${row.p}` : `${row.p}宮`}</td><td className="py-2.5 pr-3">{locale === "en" ? `H${row.w}` : `${row.w}宮`}</td><td className="py-2.5 pr-3">{locale === "en" ? `H${row.e}` : `${row.e}宮`}</td><td className={`py-2.5 ${row.differs ? "text-cinnabar" : "text-[#55735f]"}`}>{row.differs ? copy.different : copy.same}</td></tr>)}</tbody></table></div></article> : null}

      <article className="rounded-[1.5rem] border border-[#9f7b4d]/26 bg-[#f7efdf]/94 p-4 sm:p-5"><h3 className="font-display text-xl font-semibold text-ink">{copy.aspectsTitle}</h3><p className="mt-2 text-sm leading-7 text-ink-soft">{copy.aspectsLead}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{topAspects.map((aspect) => <div key={`all-${aspect.a}-${aspect.b}-${aspect.type}`} className="rounded-xl border border-line/60 bg-white/50 px-3 py-2 text-sm text-ink-soft"><b className="text-ink">{pointLabel(aspect.a, locale)} {ASPECT_LABELS[locale][aspect.type]} {pointLabel(aspect.b, locale)}</b><span className="ml-2 text-xs text-ink-mute">orb {aspect.orb.toFixed(1)}°</span></div>)}</div></article>

      <article className="rounded-[1.5rem] border border-[#6d7180]/22 bg-[#eef0e8]/82 p-4 sm:p-5"><h3 className="font-display text-xl font-semibold text-ink">{copy.extensionsTitle}</h3><p className="mt-2 text-sm leading-7 text-ink-soft">{copy.extensionsLead}</p><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">{[...result.planets.filter((position) => ["Uranus", "Neptune", "Pluto"].includes(position.key)), ...result.extras.filter((position) => position.key !== "SouthNode")].map((position) => <div key={position.key} className="rounded-xl border border-line/60 bg-white/48 p-3"><p className="text-[10px] font-semibold tracking-[0.08em] text-ink-mute">{pointLabel(position.key, locale)}</p><p className="mt-1 font-display text-base font-semibold text-[#4e5b67]">{signName(position, locale)}</p><p className="mt-1 text-[11px] text-ink-soft">{formatDegree(position)}{position.retrograde ? " ℞" : ""}{result.placidus ? ` · ${houseDisplay(position, result.placidus, locale)}` : ""}</p></div>)}</div></article>

      <article className="rounded-[1.5rem] border border-[#9f7b4d]/30 bg-[#fffaf0]/95 p-4 sm:p-5"><h3 className="font-display text-xl font-semibold text-ink">{copy.compareTitle}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[#55735f]/22 bg-[#55735f]/5 p-3"><b className="text-sm text-[#45604d]">{copy.consensus}</b><p className="mt-1 text-sm leading-6 text-ink-soft">{copy.consensusBody}</p></div><div className="rounded-xl border border-[#7e5268]/22 bg-[#7e5268]/5 p-3"><b className="text-sm text-[#624b62]">{copy.independent}</b><p className="mt-1 text-sm leading-6 text-ink-soft">{copy.independentBody}</p></div><div className="rounded-xl border border-cinnabar/20 bg-cinnabar/5 p-3"><b className="text-sm text-cinnabar">{copy.conflicts}</b><p className="mt-1 text-sm leading-6 text-ink-soft">{conflicts.length ? conflicts.map((row) => `${pointLabel(row.key, locale)}：${locale === "en" ? `Placidus H${row.p} / Whole H${row.w} / Equal H${row.e}` : `Placidus ${row.p}宮／Whole ${row.w}宮／Equal ${row.e}宮`}`).join("；") : copy.noConflict}</p></div><div className="rounded-xl border border-[#324b66]/20 bg-[#324b66]/5 p-3"><b className="text-sm text-[#324b66]">{copy.incomparable}</b><p className="mt-1 text-sm leading-6 text-ink-soft">{copy.incomparableBody}</p></div></div></article>

      <div className="rounded-xl border border-line bg-paper/70 px-4 py-3 text-[10px] leading-5 text-ink-mute"><p>{copy.profile}：{PROFILE}</p><p>UTC：{result.utcIso}</p><p>{copy.boundary}</p></div>
      <div className="grid gap-3 sm:grid-cols-2"><Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#624b62]/35 px-5 text-sm text-[#624b62]">{copy.back}</Link><Link to="/yizhangjing" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#624b62] px-5 text-sm text-[#fff8e8]">{copy.vedic}</Link></div>
    </section> : null}
  </main>;
}
