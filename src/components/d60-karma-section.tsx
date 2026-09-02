import { useEffect, useMemo, useState, type FormEvent } from "react";
import { searchCities } from "@/lib/actions";
import { localizeCityHit } from "@/lib/bazi/cities";
import type { CityHit } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { localBirthToUtc } from "@/lib/qizheng/engine";

const ASTRO_SCRIPT_ID = "zhaowu-astronomy-engine-d60";
const ASTRO_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js";
const D60_PROFILE = "ZW-D60-LAHIRI-AE2.1.19-1.0";

const SIGNS = [
  ["Aries", "白羊", "白羊"], ["Taurus", "金牛", "金牛"], ["Gemini", "雙子", "双子"], ["Cancer", "巨蟹", "巨蟹"],
  ["Leo", "獅子", "狮子"], ["Virgo", "處女", "处女"], ["Libra", "天秤", "天秤"], ["Scorpio", "天蠍", "天蝎"],
  ["Sagittarius", "射手", "射手"], ["Capricorn", "摩羯", "摩羯"], ["Aquarius", "水瓶", "水瓶"], ["Pisces", "雙魚", "双鱼"],
] as const;

const BODY_KEYS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
type BodyKey = (typeof BODY_KEYS)[number];

type AstronomyApi = {
  EclipticLongitude: (body: string, date: Date) => number;
  SiderealTime: (date: Date) => number;
};

type D60Placement = {
  key: "Ascendant" | BodyKey;
  siderealLongitude: number;
  d60Sign: number;
  segment: number;
};

type D60Result = {
  utcIso: string;
  ayanamsa: number;
  placements: D60Placement[];
  stableMinus2: boolean;
  stablePlus2: boolean;
};

const COPY = {
  "zh-Hant": {
    eyebrow: "印度占星 · D60 SHASHTIAMSA", title: "D60 業力細分層", badge: "高精度時間限定",
    lead: "作為「前世今生」的第二視角，D60 用來觀察更細的業力傾向、慣性與今生容易反覆遇到的課題；它不取代子平八字，也不把象徵解讀說成可驗證的前世史實。",
    precisionTitle: "出生時間必須非常準確", precisionBody: "D60 把每個 30° 星座再切成 60 份，每份只有 0.5°。尤其 D60 上升點對時間極敏感；請優先使用出生證明、醫院紀錄或其他可核對到分鐘的紀錄。",
    exact: "可用：出生日期＋出生地＋可核對到分鐘的出生時間", uncertain: "不直接下結論：家人回憶、只知道時辰、四捨五入到 5／10／15 分鐘、時間不確定",
    formTitle: "排你的 D60", formLead: "只有在時間來源可靠時才計算。昭梧會同時做 ±2 分鐘敏感度檢查。",
    year: "年", month: "月", day: "日", hour: "時", minute: "分", city: "出生地", cityPh: "搜尋城市",
    source: "出生時間來源", recorded: "出生證明／醫院紀錄／可核對到分鐘", remembered: "家人回憶或大概時間", confirm: "我確認這個時間不是估算或四捨五入值",
    submit: "生成 D60 業力層", calculating: "正在排 D60…", needCity: "請選擇出生地。", needExact: "D60 已跳過：這個出生時間不是可核對到分鐘的可靠紀錄。", invalid: "請檢查出生日期與時間。", engineError: "D60 天文計算暫時無法載入；一掌經與其他報告不受影響。",
    resultTitle: "你的 D60 業力骨架", resultLead: "以下顯示 D60 上升點與七曜落座。它讀的是反覆模式，不是具體前世故事。", lagna: "D60 上升", segment: "第 {n} 細分", sidereal: "Lahiri 恆星黃道", profile: "計算規格", sensitivity: "時間敏感度",
    stable: "±2 分鐘內 D60 上升仍在同一星座；仍只代表這個小範圍內較穩定。", unstable: "±2 分鐘內 D60 上升已換星座；這張 D60 對出生分鐘高度敏感，解讀必須保守。",
    themeTitle: "業力主題合看", core: "核心慣性", emotion: "情緒殘留", duty: "反覆責任", resource: "可帶走的資源", action: "行動課題", relation: "關係價值", mind: "思考習性",
    rulesTitle: "使用邊界", rules: ["只讀業力主題、反覆模式與今生傾向；不編造前世姓名、身份、年代或具體事件。", "時間精度不足時直接跳過，不用猜測時間硬排。", "D60 是印度 Jyotish 輔助層；昭梧的人生節奏與選擇主判仍以子平八字為核心。"],
    footer: "Shashtiamsa · Lahiri sidereal · symbolic karmic layer",
  },
  "zh-Hans": {
    eyebrow: "印度占星 · D60 SHASHTIAMSA", title: "D60 业力细分层", badge: "高精度时间限定",
    lead: "作为“前世今生”的第二视角，D60 用来观察更细的业力倾向、惯性与今生容易反复遇到的课题；它不取代子平八字，也不把象征解读说成可验证的前世史实。",
    precisionTitle: "出生时间必须非常准确", precisionBody: "D60 把每个 30° 星座再切成 60 份，每份只有 0.5°。尤其 D60 上升点对时间极敏感；请优先使用出生证明、医院记录或其他可核对到分钟的记录。",
    exact: "可用：出生日期＋出生地＋可核对到分钟的出生时间", uncertain: "不直接下结论：家人回忆、只知道时辰、四舍五入到 5／10／15 分钟、时间不确定",
    formTitle: "排你的 D60", formLead: "只有在时间来源可靠时才计算。昭梧会同时做 ±2 分钟敏感度检查。",
    year: "年", month: "月", day: "日", hour: "时", minute: "分", city: "出生地", cityPh: "搜索城市",
    source: "出生时间来源", recorded: "出生证明／医院记录／可核对到分钟", remembered: "家人回忆或大概时间", confirm: "我确认这个时间不是估算或四舍五入值",
    submit: "生成 D60 业力层", calculating: "正在排 D60…", needCity: "请选择出生地。", needExact: "D60 已跳过：这个出生时间不是可核对到分钟的可靠记录。", invalid: "请检查出生日期与时间。", engineError: "D60 天文计算暂时无法加载；一掌经与其他报告不受影响。",
    resultTitle: "你的 D60 业力骨架", resultLead: "以下显示 D60 上升点与七曜落座。它读的是反复模式，不是具体前世故事。", lagna: "D60 上升", segment: "第 {n} 细分", sidereal: "Lahiri 恒星黄道", profile: "计算规格", sensitivity: "时间敏感度",
    stable: "±2 分钟内 D60 上升仍在同一星座；仍只代表这个小范围内较稳定。", unstable: "±2 分钟内 D60 上升已换星座；这张 D60 对出生分钟高度敏感，解读必须保守。",
    themeTitle: "业力主题合看", core: "核心惯性", emotion: "情绪残留", duty: "反复责任", resource: "可带走的资源", action: "行动课题", relation: "关系价值", mind: "思考习性",
    rulesTitle: "使用边界", rules: ["只读业力主题、反复模式与今生倾向；不编造前世姓名、身份、年代或具体事件。", "时间精度不足时直接跳过，不用猜测时间硬排。", "D60 是印度 Jyotish 辅助层；昭梧的人生节奏与选择主判仍以子平八字为核心。"],
    footer: "Shashtiamsa · Lahiri sidereal · symbolic karmic layer",
  },
  en: {
    eyebrow: "VEDIC ASTROLOGY · D60 SHASHTIAMSA", title: "D60 karmic layer", badge: "PRECISION-TIME ONLY",
    lead: "A second lens inside Past & Present. D60 is used for subtle karmic themes, persistent patterns and tendencies carried into the present. It does not replace BaZi, and it is not presented as proof of a literal past-life biography.",
    precisionTitle: "Birth time must be highly reliable", precisionBody: "D60 divides each 30° zodiac sign into 60 sections of only 0.5° each. The D60 Ascendant is especially time-sensitive. Prefer a birth certificate, hospital record or another source recorded to the minute.",
    exact: "Usable: birth date + birthplace + a recorded birth time to the minute", uncertain: "No definitive reading: family memory, only a two-hour birth branch, a time rounded to 5/10/15 minutes, or an uncertain time",
    formTitle: "Calculate your D60", formLead: "Calculation opens only for a reliable recorded time. Zhaowu also checks the D60 Ascendant at ±2 minutes.",
    year: "Year", month: "Month", day: "Day", hour: "Hour", minute: "Minute", city: "Birthplace", cityPh: "Search city",
    source: "Birth-time source", recorded: "Birth certificate / hospital record / verified to the minute", remembered: "Family memory or approximate time", confirm: "I confirm this time is not estimated or rounded",
    submit: "Generate D60 layer", calculating: "Calculating D60…", needCity: "Choose a birthplace.", needExact: "D60 skipped: this birth time is not a reliable minute-level record.", invalid: "Check the birth date and time.", engineError: "The D60 astronomy engine could not load. The Palm reading and other reports remain available.",
    resultTitle: "Your D60 karmic structure", resultLead: "This shows the D60 Ascendant and seven classical planets. It describes recurring patterns, not a literal past-life story.", lagna: "D60 Ascendant", segment: "segment {n}", sidereal: "Lahiri sidereal zodiac", profile: "Calculation profile", sensitivity: "Time sensitivity",
    stable: "The D60 Ascendant stays in the same sign at ±2 minutes. That only indicates relative stability inside this narrow window.", unstable: "The D60 Ascendant changes sign within ±2 minutes. This chart is highly birth-minute sensitive and should be read conservatively.",
    themeTitle: "Combined karmic themes", core: "Core pattern", emotion: "Emotional residue", duty: "Repeated duty", resource: "Carried resource", action: "Action lesson", relation: "Relationship values", mind: "Mental habit",
    rulesTitle: "Reading boundary", rules: ["Read karmic themes, repeated patterns and present-life tendencies only; never invent past-life names, identities, dates or specific events.", "If birth-time quality is insufficient, D60 is skipped rather than forcing a chart from guessed data.", "D60 is an auxiliary Jyotish layer. Zhaowu keeps classical BaZi as the primary framework for life rhythm and choice analysis."],
    footer: "Shashtiamsa · Lahiri sidereal · symbolic karmic layer",
  },
} as const satisfies Record<Locale, Record<string, string | readonly string[]>>;

const SIGN_THEMES = {
  "zh-Hant": ["先行、開創、自己扛起第一步", "守成、價值、資源與安全感", "學習、轉譯、雙向溝通", "照顧、歸屬、情緒記憶", "自我表達、榮譽、創造", "修正、服務、秩序與技藝", "關係、公平、協商與取捨", "深層轉化、界線、信任與控制", "信念、遠行、教導與視野", "責任、結構、耐力與成就", "群體、制度更新、獨立思考", "慈悲、想像、界線溶解與放下"],
  "zh-Hans": ["先行、开创、自己扛起第一步", "守成、价值、资源与安全感", "学习、转译、双向沟通", "照顾、归属、情绪记忆", "自我表达、荣誉、创造", "修正、服务、秩序与技艺", "关系、公平、协商与取舍", "深层转化、界线、信任与控制", "信念、远行、教导与视野", "责任、结构、耐力与成就", "群体、制度更新、独立思考", "慈悲、想象、界线溶解与放下"],
  en: ["initiative, beginnings and taking the first step", "stability, values, resources and security", "learning, translation and two-way communication", "care, belonging and emotional memory", "self-expression, pride and creation", "refinement, service, order and craft", "relationships, fairness, negotiation and choice", "deep change, boundaries, trust and control", "belief, travel, teaching and perspective", "duty, structure, endurance and achievement", "community, reform and independent thought", "compassion, imagination, porous boundaries and release"],
} as const satisfies Record<Locale, readonly string[]>;

const BODY_LABELS = {
  "zh-Hant": { Ascendant: "上升", Sun: "太陽", Moon: "月亮", Mercury: "水星", Venus: "金星", Mars: "火星", Jupiter: "木星", Saturn: "土星" },
  "zh-Hans": { Ascendant: "上升", Sun: "太阳", Moon: "月亮", Mercury: "水星", Venus: "金星", Mars: "火星", Jupiter: "木星", Saturn: "土星" },
  en: { Ascendant: "Ascendant", Sun: "Sun", Moon: "Moon", Mercury: "Mercury", Venus: "Venus", Mars: "Mars", Jupiter: "Jupiter", Saturn: "Saturn" },
} as const;

function normalize(value: number) { return ((value % 360) + 360) % 360; }
function wrap180(value: number) { return ((value + 180) % 360 + 360) % 360 - 180; }
function toRad(value: number) { return value * Math.PI / 180; }

function lahiriAyanamsa(date: Date) {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5;
  const t = (jd - 2_451_545.0) / 36_525;
  const initial = 23 * 3600 + 51 * 60 + 25.532;
  return (initial + 5029.0966 * t + 1.11161 * t * t) / 3600;
}

function meanObliquity(date: Date) {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5;
  const t = (jd - 2_451_545.0) / 36_525;
  return 23 + 26 / 60 + 21.448 / 3600 - (46.815 * t + 0.00059 * t * t - 0.001813 * t * t * t) / 3600;
}

function tropicalAscendant(api: AstronomyApi, date: Date, latitude: number, longitude: number) {
  const lst = normalize(api.SiderealTime(date) * 15 + longitude);
  const eps = toRad(meanObliquity(date));
  const phi = toRad(latitude);
  const altitudeTerm = (lambda: number) => {
    const lam = toRad(normalize(lambda));
    const ra = normalize(Math.atan2(Math.sin(lam) * Math.cos(eps), Math.cos(lam)) * 180 / Math.PI);
    const dec = Math.asin(Math.sin(lam) * Math.sin(eps));
    const hourAngle = wrap180(lst - ra);
    const h = toRad(hourAngle);
    const altitude = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(h);
    return { altitude, hourAngle };
  };

  const roots: number[] = [];
  let previousX = 0;
  let previous = altitudeTerm(previousX).altitude;
  for (let x = 0.5; x <= 360; x += 0.5) {
    const current = altitudeTerm(x % 360).altitude;
    if (previous === 0 || previous * current < 0) {
      let low = previousX, high = x;
      for (let i = 0; i < 36; i += 1) {
        const mid = (low + high) / 2;
        const lowValue = altitudeTerm(low % 360).altitude;
        const midValue = altitudeTerm(mid % 360).altitude;
        if (lowValue * midValue <= 0) high = mid;
        else low = mid;
      }
      const root = normalize((low + high) / 2);
      if (altitudeTerm(root).hourAngle < 0) roots.push(root);
    }
    previousX = x;
    previous = current;
  }
  if (!roots.length) throw new Error("ascendant");
  return roots[0];
}

function d60Placement(key: D60Placement["key"], siderealLongitude: number): D60Placement {
  const lon = normalize(siderealLongitude);
  const natalSign = Math.floor(lon / 30);
  const within = lon % 30;
  const part = Math.min(59, Math.floor(within / 0.5));
  return { key, siderealLongitude: lon, d60Sign: (natalSign + part) % 12, segment: part + 1 };
}

function calculateD60(api: AstronomyApi, date: Date, city: CityHit): D60Result {
  const ayanamsa = lahiriAyanamsa(date);
  const ascTropical = tropicalAscendant(api, date, city.latitude, city.longitude);
  const asc = d60Placement("Ascendant", normalize(ascTropical - ayanamsa));
  const planets = BODY_KEYS.map((key) => d60Placement(key, normalize(api.EclipticLongitude(key, date) - ayanamsa)));

  const lagnaAt = (deltaMinutes: number) => {
    const shifted = new Date(date.getTime() + deltaMinutes * 60_000);
    const aya = lahiriAyanamsa(shifted);
    return d60Placement("Ascendant", normalize(tropicalAscendant(api, shifted, city.latitude, city.longitude) - aya)).d60Sign;
  };

  return {
    utcIso: date.toISOString(), ayanamsa, placements: [asc, ...planets],
    stableMinus2: lagnaAt(-2) === asc.d60Sign,
    stablePlus2: lagnaAt(2) === asc.d60Sign,
  };
}

let astronomyPromise: Promise<AstronomyApi> | null = null;
function loadAstronomy() {
  const w = window as typeof window & { Astronomy?: AstronomyApi };
  if (w.Astronomy) return Promise.resolve(w.Astronomy);
  if (astronomyPromise) return astronomyPromise;
  astronomyPromise = new Promise<AstronomyApi>((resolve, reject) => {
    const existing = document.getElementById(ASTRO_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const finish = () => w.Astronomy ? resolve(w.Astronomy) : reject(new Error("astronomy-global"));
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

function signName(index: number, locale: Locale) {
  const row = SIGNS[index];
  return locale === "en" ? row[0] : locale === "zh-Hans" ? row[2] : row[1];
}

function CityField({ locale, city, onSelect, label, placeholder }: { locale: Locale; city: CityHit | null; onSelect: (city: CityHit | null) => void; label: string; placeholder: string }) {
  const [query, setQuery] = useState(city?.display ?? "");
  const [hits, setHits] = useState<CityHit[]>([]);
  useEffect(() => { setQuery(city ? localizeCityHit(city, locale).display : ""); }, [city, locale]);
  useEffect(() => {
    const trimmed = query.trim();
    if (city && trimmed === localizeCityHit(city, locale).display) { setHits([]); return; }
    if (trimmed.length < 2) { setHits([]); return; }
    let alive = true;
    const timer = window.setTimeout(() => {
      void searchCities({ data: trimmed }).then((rows) => { if (alive) setHits(rows.map((row) => localizeCityHit(row, locale))); }).catch(() => { if (alive) setHits([]); });
    }, 220);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [city, locale, query]);
  return (
    <label className="relative block text-sm font-medium text-ink">
      {label}
      <input value={query} placeholder={placeholder} autoComplete="off" className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white/75 px-4 text-base outline-none focus:border-[#8e4538]" onChange={(event) => { setQuery(event.target.value); if (city) onSelect(null); }} />
      {hits.length ? <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-line bg-[#fffaf0] p-1 shadow-xl">{hits.map((hit) => <button type="button" key={`${hit.latitude}-${hit.longitude}`} onClick={() => { onSelect(hit); setQuery(hit.display); setHits([]); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f1e3c9]"><b className="block text-sm text-ink">{hit.display}</b><small className="text-ink-mute">{hit.timezone}</small></button>)}</div> : null}
    </label>
  );
}

export function D60KarmaSection() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [year, setYear] = useState(""); const [month, setMonth] = useState(""); const [day, setDay] = useState("");
  const [hour, setHour] = useState(""); const [minute, setMinute] = useState(""); const [city, setCity] = useState<CityHit | null>(null);
  const [source, setSource] = useState<"recorded" | "remembered">("recorded"); const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [result, setResult] = useState<D60Result | null>(null);
  const labels = BODY_LABELS[locale];
  const maxYear = new Date().getFullYear();

  const themes = useMemo(() => {
    if (!result) return [];
    const byKey = Object.fromEntries(result.placements.map((p) => [p.key, p])) as Partial<Record<D60Placement["key"], D60Placement>>;
    const rows: Array<[string, D60Placement["key"]]> = [[copy.core as string, "Ascendant"], [copy.emotion as string, "Moon"], [copy.duty as string, "Saturn"], [copy.resource as string, "Jupiter"], [copy.action as string, "Mars"], [copy.relation as string, "Venus"], [copy.mind as string, "Mercury"]];
    return rows.map(([title, key]) => ({ title, key, placement: byKey[key]! }));
  }, [copy, result]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setResult(null);
    if (!city) { setError(copy.needCity as string); return; }
    if (source !== "recorded" || !confirmed) { setError(copy.needExact as string); return; }
    const y = Number(year), m = Number(month), d = Number(day), h = Number(hour), min = Number(minute);
    const civil = new Date(Date.UTC(y, m - 1, d, h, min));
    if (![y, m, d, h, min].every(Number.isFinite) || civil.getUTCFullYear() !== y || civil.getUTCMonth() !== m - 1 || civil.getUTCDate() !== d || h < 0 || h > 23 || min < 0 || min > 59) { setError(copy.invalid as string); return; }
    setBusy(true);
    try {
      const api = await loadAstronomy();
      const utc = localBirthToUtc({ year: y, month: m, day: d, hour: h, minute: min, timezone: city.timezone });
      setResult(calculateD60(api, utc, city));
      window.setTimeout(() => document.getElementById("d60-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
    } catch { setError(copy.engineError as string); }
    finally { setBusy(false); }
  }

  const isStable = result ? result.stableMinus2 && result.stablePlus2 : false;

  return (
    <section id="d60-karma" className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
      <div className="relative overflow-hidden rounded-[28px] border border-[#b99755]/35 bg-[#f5ead6]/88 p-5 shadow-[0_18px_55px_rgba(70,55,35,0.08)] sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#a94639]/15" />
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#324b66]/15" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[10px] font-semibold tracking-[0.2em] text-[#6f523b]">{copy.eyebrow}</p><span className="rounded-full border border-[#8e4538]/25 bg-[#8e4538]/5 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#8e4538]">{copy.badge}</span></div>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-[0.06em] text-ink sm:text-3xl">{copy.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft">{copy.lead}</p>

          <div className="mt-6 rounded-2xl border border-[#8e4538]/25 bg-[#fff8ea]/82 p-4 sm:p-5">
            <h3 className="font-display text-lg font-semibold text-[#8e4538]">{copy.precisionTitle}</h3><p className="mt-2 text-sm leading-7 text-ink-soft">{copy.precisionBody}</p>
            <div className="mt-4 grid gap-2 text-xs leading-6 sm:grid-cols-2"><p className="rounded-xl border border-[#55735f]/25 bg-[#55735f]/7 px-3 py-2 text-ink-soft">✓ {copy.exact}</p><p className="rounded-xl border border-[#8e4538]/20 bg-[#8e4538]/5 px-3 py-2 text-ink-soft">× {copy.uncertain}</p></div>
          </div>

          <form onSubmit={submit} className="mt-6 rounded-2xl border border-[#b99755]/30 bg-paper/65 p-4 sm:p-5">
            <h3 className="font-display text-xl font-semibold text-ink">{copy.formTitle}</h3><p className="mt-1 text-xs leading-6 text-ink-soft sm:text-sm">{copy.formLead}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {[[copy.year, year, setYear, 1900, maxYear], [copy.month, month, setMonth, 1, 12], [copy.day, day, setDay, 1, 31], [copy.hour, hour, setHour, 0, 23], [copy.minute, minute, setMinute, 0, 59]].map(([label, value, setter, min, max]) => <label key={String(label)} className="text-xs font-medium text-ink"><span className="block pb-1">{label as string}</span><input required type="number" inputMode="numeric" min={min as number} max={max as number} value={value as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} className="min-h-12 w-full rounded-xl border border-line bg-white/75 px-2 text-base outline-none focus:border-[#8e4538]" /></label>)}
            </div>
            <div className="mt-4"><CityField locale={locale} city={city} onSelect={setCity} label={copy.city as string} placeholder={copy.cityPh as string} /></div>
            <fieldset className="mt-4"><legend className="text-sm font-medium text-ink">{copy.source}</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{(["recorded", "remembered"] as const).map((value) => <label key={value} className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-xs leading-5 ${source === value ? "border-[#8e4538]/50 bg-[#8e4538]/6" : "border-line bg-white/50"}`}><input type="radio" name="d60-source" checked={source === value} onChange={() => { setSource(value); if (value === "remembered") setConfirmed(false); }} className="accent-[#8e4538]" /><span>{value === "recorded" ? copy.recorded : copy.remembered}</span></label>)}</div></fieldset>
            <label className={`mt-4 flex items-start gap-2 rounded-xl border px-3 py-3 text-xs leading-5 ${source === "recorded" ? "border-[#55735f]/25 bg-[#55735f]/5" : "border-line bg-black/[0.02] opacity-60"}`}><input type="checkbox" disabled={source !== "recorded"} checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#55735f]" /><span>{copy.confirm}</span></label>
            {error ? <p role="alert" className="mt-3 rounded-xl border border-[#8e4538]/25 bg-[#8e4538]/6 px-3 py-2 text-xs leading-6 text-[#7a342e]">{error}</p> : null}
            <button type="submit" disabled={busy} className="mt-5 min-h-13 w-full rounded-full bg-[#7f352d] px-5 text-sm font-semibold tracking-[0.08em] text-[#fff8e8] disabled:opacity-55">{busy ? copy.calculating : copy.submit}</button>
          </form>

          {result ? <div id="d60-result" className="mt-6 scroll-mt-20 rounded-2xl border border-[#324b66]/25 bg-[#f7f0df]/92 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold tracking-[0.18em] text-[#324b66]">D60 · SHASHTIAMSA</p><h3 className="mt-1 font-display text-xl font-semibold text-ink">{copy.resultTitle}</h3></div><span className="rounded-full bg-[#324b66]/8 px-3 py-1 text-[10px] font-semibold text-[#324b66]">{copy.sidereal}</span></div>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{copy.resultLead}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{result.placements.map((p) => <article key={p.key} className="rounded-xl border border-[#b99755]/25 bg-white/62 p-3"><p className="text-[10px] font-semibold tracking-[0.12em] text-ink-mute">{p.key === "Ascendant" ? copy.lagna : labels[p.key]}</p><p className="mt-1 font-display text-lg font-semibold text-[#7f352d]">{signName(p.d60Sign, locale)}</p><p className="mt-1 text-[11px] text-ink-soft">{(copy.segment as string).replace("{n}", String(p.segment))}</p></article>)}</div>
            <article className={`mt-4 rounded-xl border p-3 ${isStable ? "border-[#55735f]/25 bg-[#55735f]/6" : "border-[#8e4538]/30 bg-[#8e4538]/6"}`}><p className="text-[10px] font-semibold tracking-[0.12em] text-ink-mute">{copy.sensitivity}</p><p className="mt-1 text-sm leading-6 text-ink-soft">{isStable ? copy.stable : copy.unstable}</p></article>
            <div className="mt-5"><h4 className="font-display text-lg font-semibold text-ink">{copy.themeTitle}</h4><div className="mt-3 grid gap-2 sm:grid-cols-2">{themes.map(({ title, key, placement }) => <article key={key} className="rounded-xl border border-[#b99755]/25 bg-white/55 p-3"><p className="text-[10px] font-semibold tracking-[0.12em] text-[#7f352d]">{title} · {key === "Ascendant" ? labels.Ascendant : labels[key]}</p><p className="mt-1 text-sm leading-6 text-ink-soft">{signName(placement.d60Sign, locale)}：{SIGN_THEMES[locale][placement.d60Sign]}</p></article>)}</div></div>
            <div className="mt-4 border-t border-[#b99755]/20 pt-3 text-[10px] leading-5 text-ink-mute"><p>{copy.profile}：{D60_PROFILE}</p><p>UTC：{result.utcIso}</p><p>Ayanamsa：{result.ayanamsa.toFixed(6)}°</p></div>
          </div> : null}

          <div className="mt-6"><h3 className="font-display text-lg font-semibold tracking-[0.04em] text-ink">{copy.rulesTitle}</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{(copy.rules as readonly string[]).map((rule, index) => <article key={rule} className="rounded-2xl border border-[#b99755]/25 bg-paper/55 p-4"><span className="text-[10px] font-semibold tracking-[0.16em] text-[#8e4538]">{String(index + 1).padStart(2, "0")}</span><p className="mt-2 text-sm leading-6 text-ink-soft">{rule}</p></article>)}</div></div>
          <p className="mt-5 text-[10px] tracking-[0.14em] text-ink-mute">{copy.footer}</p>
        </div>
      </div>
    </section>
  );
}
