import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { calculateDualDestiny, buildDualFusion, type DualDestinyResult, type DualDirection } from "@/lib/dual-destiny";
import { searchCities } from "@/lib/actions";
import { toLunar } from "@/lib/bazi/calendar";
import { localizeCityHit, timezoneOffsetHours } from "@/lib/bazi/cities";
import { toTrueSolar } from "@/lib/bazi/solar-time";
import type { CityHit } from "@/lib/bazi/types";
import { presentLunarLabel, presentPalmPalace } from "@/lib/palm/standalone-presentation";
import { calculateTianjiXinggong, TIANJI_MONTHS, type TianjiCalendar, type TianjiPalace } from "@/lib/tianji-xinggong";
import { useI18n, type Locale } from "@/lib/i18n";
import "@/tianji-dual.css";

export const Route = createFileRoute("/tianji-dual")({ component: TianjiDualPage });

const PALACES: TianjiPalace[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const SOLAR_YEARS = Array.from({ length: 201 }, (_, index) => 2100 - index);
const LUNAR_YEARS = Array.from({ length: 200 }, (_, index) => 2099 - index);

const COPY = {
  "zh-Hant": {
    kicker: "昭梧 · 雙軌性格分析", title: "一次填寫，看看你給人的感覺和做決定的習慣", lead: "填入出生日期、準確時間和出生地。系統會先把出生時間校正好，再從兩個角度用白話整理你的性格與選擇習慣。",
    back: "返回昭梧", input: "出生資料", solar: "西曆", lunar: "農曆", year: "年", month: "月", day: "日", time: "出生時間", hour: "時", minute: "分", city: "出生地", cityPlaceholder: "輸入城市或國家", popularCities: "常用城市", direction: "傳統排法", male: "男命 · 順排", female: "女命 · 逆排", directionHint: "這只影響其中一項傳統計算，不代表性別認同。", auto: "系統會按出生地自動處理當地時區、夏令時與真太陽時，你不用自己換算。", submit: "開始分析", invalid: "出生資料無法換算，請檢查日期、時間與出生地後重試。", cityRequired: "請先選擇出生城市與國家，系統需要出生地來校正時間。", privacy: "出生時間在本機自動校正 · 不登入 · 不保存出生資料", corrected: "已按出生地校正", shift: "真太陽時偏移",
    result: "雙軌結果", outer: "軌道 A · 外在立足", inner: "軌道 B · 內在底色", palace: "命宮", star: "星曜", character: "性格主軸", four: "時 · 日 · 月 · 年四宮", lifePalace: "今生命宮", fusion: "融合星評", advice: "正向寄語", correction: "中氣修正", unchanged: "未過中氣，沿用原農曆月份。", advanced: "已過中氣，查表月份自動順延。", boundary: "兩套結果屬傳統文化與象徵性解讀，用於整理性格慣性，不是可驗證的前世事實，也不替代現實決策。",
  },
  "zh-Hans": {
    kicker: "昭梧 · 双轨性格分析", title: "一次填写，看看你给人的感觉和做决定的习惯", lead: "填入出生日期、准确时间和出生地。系统会先把出生时间校正好，再从两个角度用白话整理你的性格与选择习惯。",
    back: "返回昭梧", input: "出生资料", solar: "西历", lunar: "农历", year: "年", month: "月", day: "日", time: "出生时间", hour: "时", minute: "分", city: "出生地", cityPlaceholder: "输入城市或国家", popularCities: "常用城市", direction: "传统排法", male: "男命 · 顺排", female: "女命 · 逆排", directionHint: "这只影响其中一项传统计算，不代表性别认同。", auto: "系统会按出生地自动处理当地时区、夏令时和真太阳时，你不用自己换算。", submit: "开始分析", invalid: "出生资料无法换算，请检查日期、时间和出生地后重试。", cityRequired: "请先选择出生城市和国家，系统需要出生地来校正时间。", privacy: "出生时间在本机自动校正 · 不登录 · 不保存出生资料", corrected: "已按出生地校正", shift: "真太阳时偏移",
    result: "双轨结果", outer: "轨道 A · 外在立足", inner: "轨道 B · 内在底色", palace: "命宫", star: "星曜", character: "性格主轴", four: "时 · 日 · 月 · 年四宫", lifePalace: "今生命宫", fusion: "融合星评", advice: "正向寄语", correction: "中气修正", unchanged: "未过中气，沿用原农历月份。", advanced: "已过中气，查表月份自动顺延。", boundary: "两套结果属传统文化与象征性解读，用于整理性格惯性，不是可验证的前世事实，也不替代现实决策。",
  },
  en: {
    kicker: "ZHAOWU · TWO-ANGLE CHARACTER READING", title: "Enter your details once and see two sides of how you operate", lead: "Enter your birth date, exact time and birthplace. The system adjusts the birth time first, then gives you a plain-English view of how you come across and the habits that tend to drive your choices.",
    back: "Back to Zhaowu", input: "Birth details", solar: "Gregorian", lunar: "Lunar", year: "Year", month: "Month", day: "Day", time: "Birth time", hour: "Hour", minute: "Minute", city: "Birthplace", cityPlaceholder: "Type a city or country", popularCities: "Common cities", direction: "Traditional sequence", male: "Male chart · forward", female: "Female chart · reverse", directionHint: "This only changes one traditional calculation; it does not define gender identity.", auto: "The system automatically adjusts for the birthplace time zone, daylight saving and true solar time. You do not need to convert anything yourself.", submit: "Start analysis", invalid: "The birth details could not be converted. Check the date, time and birthplace and try again.", cityRequired: "Select the birth city and country first so the birth time can be adjusted correctly.", privacy: "Birth time is adjusted on this device · no login · birth data is not saved", corrected: "Birth time adjusted for", shift: "True-solar adjustment",
    result: "Dual result", outer: "Track A · outward stance", inner: "Track B · inner pattern", palace: "Life Palace", star: "Star", character: "Character axis", four: "Hour · day · month · year palaces", lifePalace: "Present-life palace", fusion: "Integrated reading", advice: "Constructive direction", correction: "Middle-qi correction", unchanged: "Before middle qi; the original lunar month was kept.", advanced: "After middle qi; the lookup month advanced automatically.", boundary: "Both results are traditional symbolic frameworks for organising character patterns. They are not verifiable past-life facts and do not replace real-world decisions.",
  },
} as const;

const TIANJI_CHARACTER: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "重情而有分寸，對人際細節敏銳。", "zh-Hans": "重情而有分寸，对人际细节敏锐。", en: "Warm, measured and attentive to social nuance." },
  丑: { "zh-Hant": "耐壓持久，常把難處熬成資歷。", "zh-Hans": "耐压持久，常把难处熬成资历。", en: "Patient under pressure, turning difficulty into durable experience." },
  寅: { "zh-Hant": "有主見、能掌局，也願意為結果負責。", "zh-Hans": "有主见、能掌局，也愿意为结果负责。", en: "Decisive, accountable and comfortable taking direction." },
  卯: { "zh-Hant": "爽快重義氣，善意有邊界時最有力量。", "zh-Hans": "爽快重义气，善意有边界时最有力量。", en: "Open and loyal, strongest when generosity has boundaries." },
  辰: { "zh-Hant": "擅長推演與變通，先定標準便不易反覆。", "zh-Hans": "擅长推演与变通，先定标准便不易反复。", en: "Adaptive and strategic, best when standards are set first." },
  巳: { "zh-Hant": "觀察細、理解快，重知識、審美與結構。", "zh-Hans": "观察细、理解快，重知识、审美与结构。", en: "Observant, quick to understand and sensitive to craft." },
  午: { "zh-Hant": "親和而有福氣感，懂得接住機會才能留福。", "zh-Hans": "亲和而有福气感，懂得接住机会才能留福。", en: "Approachable and fortunate, especially when opportunity is used well." },
  未: { "zh-Hant": "動中成事，跨環境發展反而容易打開機會。", "zh-Hans": "动中成事，跨环境发展反而容易打开机会。", en: "Progresses through movement, change and new environments." },
  申: { "zh-Hant": "獨立自持，能靠專注與判斷做到深處。", "zh-Hans": "独立自持，能靠专注与判断做到深处。", en: "Independent and capable of unusual depth through focus." },
  酉: { "zh-Hant": "深藏不露，觀察與判斷往往先於表態。", "zh-Hans": "深藏不露，观察与判断往往先于表态。", en: "Private and perceptive, forming judgement before revealing it." },
  戌: { "zh-Hant": "反應快、有技藝，適合把聰明沉澱成作品。", "zh-Hans": "反应快、有技艺，适合把聪明沉淀成作品。", en: "Quick and skilful, with talent that strengthens through finished work." },
  亥: { "zh-Hant": "感受力深、重公平，同理心需要配上邊界。", "zh-Hans": "感受力深、重公平，同理心需要配上边界。", en: "Emotionally perceptive and fair-minded, with a need for boundaries." },
};

const TIANJI_STARS: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "天貴星", "zh-Hans": "天贵星", en: "Celestial Noble Star" }, 丑: { "zh-Hant": "天厄星", "zh-Hans": "天厄星", en: "Celestial Trial Star" },
  寅: { "zh-Hant": "天權星", "zh-Hans": "天权星", en: "Celestial Authority Star" }, 卯: { "zh-Hant": "天赦星", "zh-Hans": "天赦星", en: "Celestial Mercy Star" },
  辰: { "zh-Hant": "天如星", "zh-Hans": "天如星", en: "Celestial Adaptation Star" }, 巳: { "zh-Hant": "天文星", "zh-Hans": "天文星", en: "Celestial Scholar Star" },
  午: { "zh-Hant": "天福星", "zh-Hans": "天福星", en: "Celestial Fortune Star" }, 未: { "zh-Hant": "天驛星", "zh-Hans": "天驿星", en: "Celestial Journey Star" },
  申: { "zh-Hant": "天孤星", "zh-Hans": "天孤星", en: "Celestial Solitary Star" }, 酉: { "zh-Hant": "天秘星", "zh-Hans": "天秘星", en: "Celestial Mystery Star" },
  戌: { "zh-Hant": "天藝星", "zh-Hans": "天艺星", en: "Celestial Arts Star" }, 亥: { "zh-Hant": "天壽星", "zh-Hans": "天寿星", en: "Celestial Longevity Star" },
};

const EN_BRANCH: Record<TianjiPalace, string> = { 子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai" };

function daysInMonth(year: number, month: number) { return new Date(Date.UTC(year, month, 0)).getUTCDate(); }

function lunarMonthLabel(month: number, isLeap: boolean, locale: Locale) {
  if (locale === "en") return `${isLeap ? "Leap " : ""}month ${month}`;
  const names = locale === "zh-Hant" ? ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "臘"] : ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
  return `${isLeap ? (locale === "zh-Hant" ? "閏" : "闰") : ""}${names[month - 1]}月`;
}

function getLunarMonths(year: number) {
  const found = new Map<string, { month: number; isLeap: boolean; days: number }>();
  for (let cursor = Date.UTC(year, 0, 1); cursor <= Date.UTC(year + 1, 11, 31); cursor += 86400000) {
    const date = new Date(cursor);
    const lunar = toLunar(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    if (!lunar || lunar.year !== year) continue;
    const key = `${lunar.month}:${Number(lunar.isLeap)}`;
    const current = found.get(key);
    if (!current || lunar.day > current.days) found.set(key, { month: lunar.month, isLeap: lunar.isLeap, days: lunar.day });
  }
  return [...found.values()].sort((a, b) => a.month - b.month || Number(a.isLeap) - Number(b.isLeap));
}

function zonedCivilInstant(city: CityHit, year: number, month: number, day: number, hour: number, minute: number) {
  const wall = Date.UTC(year, month - 1, day, hour, minute, 0);
  let instantMs = wall;
  let offset = timezoneOffsetHours(city.timezone, new Date(instantMs));
  for (let i = 0; i < 3; i += 1) {
    const next = wall - offset * 3_600_000;
    if (Math.abs(next - instantMs) < 1_000) {
      instantMs = next;
      break;
    }
    instantMs = next;
    offset = timezoneOffsetHours(city.timezone, new Date(instantMs));
  }
  offset = timezoneOffsetHours(city.timezone, new Date(instantMs));
  return { instant: new Date(instantMs), offsetHours: offset };
}

function formatClock(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function CityPicker({ locale, copy, value, onSelect, onClear }: { locale: Locale; copy: (typeof COPY)[Locale]; value: CityHit | null; onSelect: (city: CityHit) => void; onClear: () => void }) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<CityHit[]>([]);

  useEffect(() => {
    const localized = value ? localizeCityHit(value, locale) : null;
    setQuery(localized?.display ?? "");
  }, [locale, value?.display, value?.latitude, value?.longitude]);

  useEffect(() => {
    const q = query.trim();
    if (value?.display === q || q.length < 2) {
      setHits([]);
      return;
    }
    let alive = true;
    const timer = window.setTimeout(() => {
      void searchCities({ data: q })
        .then((rows) => { if (alive) setHits(rows.map((city) => localizeCityHit(city, locale))); })
        .catch(() => { if (alive) setHits([]); });
    }, 220);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [locale, query, value?.display]);

  return (
    <div className="relative mt-4">
      <label htmlFor="dual-birth-city" className="mb-2 block text-xs text-[#cbbbd6]">{copy.city}</label>
      <input
        id="dual-birth-city"
        value={query}
        placeholder={copy.cityPlaceholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls="dual-birth-city-results"
        aria-expanded={hits.length > 0}
        className="h-[3.15rem] w-full rounded-[.9rem] border border-white/20 bg-black/25 px-3 text-base text-white outline-none placeholder:text-white/35 focus:border-[#dfbd7c]"
        onFocus={() => {
          if (value || query.trim().length >= 2) return;
          void searchCities({ data: "" })
            .then((rows) => setHits(rows.map((city) => localizeCityHit(city, locale))))
            .catch(() => setHits([]));
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          if (value) onClear();
        }}
      />
      {hits.length ? (
        <div id="dual-birth-city-results" role="listbox" className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-[.9rem] border border-white/15 bg-[#160b24] shadow-2xl">
          {query.trim().length < 2 ? <p className="border-b border-white/10 px-3 py-2 text-[.68rem] tracking-[.12em] text-white/45">{copy.popularCities}</p> : null}
          {hits.map((city) => (
            <button
              key={`${city.display}-${city.latitude}-${city.longitude}`}
              type="button"
              role="option"
              aria-selected={value?.latitude === city.latitude && value?.longitude === city.longitude}
              className="block w-full border-b border-white/10 px-3 py-3 text-left last:border-0 hover:bg-white/5"
              onClick={() => {
                setQuery(city.display);
                setHits([]);
                onSelect(city);
              }}
            >
              <span className="block text-sm text-white">{city.display}</span>
              <span className="mt-1 block text-[.68rem] text-white/45">{city.timezone}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Orbit({ active, centre, locale, reverse = false }: { active: string; centre: string; locale: Locale; reverse?: boolean }) {
  const activeLabel = locale === "en" ? (EN_BRANCH[active as TianjiPalace] ?? active) : active;
  return (
    <div className={`dual-orbit${reverse ? " is-reverse" : ""}${locale === "en" ? " is-en" : ""}`} aria-hidden="true">
      <div className="dual-orbit-ring" />
      <div className="dual-orbit-core"><b>{activeLabel}</b><span>{centre}</span></div>
      {PALACES.map((palace, index) => {
        const angle = (index / 12) * 360 - 90;
        const style = { transform: `rotate(${angle}deg) translate(112px) rotate(${-angle}deg)` } as CSSProperties;
        return <span key={palace} className="dual-orbit-node" style={style} data-active={palace === active}>{locale === "en" ? EN_BRANCH[palace] : palace}</span>;
      })}
    </div>
  );
}

function TianjiDualPage() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [calendar, setCalendar] = useState<TianjiCalendar>("solar");
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [birthCity, setBirthCity] = useState<CityHit | null>(null);
  const [lunarMonthKey, setLunarMonthKey] = useState("1:0");
  const [direction, setDirection] = useState<DualDirection>("male");
  const [result, setResult] = useState<DualDestinyResult | null>(null);
  const [error, setError] = useState("");
  const [timeNote, setTimeNote] = useState<{ hour: number; minute: number; shiftMinutes: number } | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const lunarMonths = useMemo(() => getLunarMonths(year), [year]);
  const selectedLunarMonth = lunarMonths.find((item) => `${item.month}:${Number(item.isLeap)}` === lunarMonthKey);
  const maxDay = calendar === "solar" ? daysInMonth(year, month) : (selectedLunarMonth?.days ?? 30);
  const fusion = result ? buildDualFusion(result, locale) : null;

  useEffect(() => { if (day > maxDay) setDay(maxDay); }, [day, maxDay]);
  useEffect(() => {
    if (calendar !== "lunar" || lunarMonths.some((item) => `${item.month}:${Number(item.isLeap)}` === lunarMonthKey)) return;
    if (lunarMonths[0]) setLunarMonthKey(`${lunarMonths[0].month}:${Number(lunarMonths[0].isLeap)}`);
  }, [calendar, lunarMonthKey, lunarMonths]);

  function clear() { setResult(null); setError(""); setTimeNote(null); }
  function calculate() {
    if (!birthCity) {
      setResult(null);
      setTimeNote(null);
      setError(copy.cityRequired);
      return;
    }
    try {
      const [lunarMonth, leap] = lunarMonthKey.split(":").map(Number);
      const raw = { calendar, year, month: calendar === "solar" ? month : lunarMonth, day, hour, isLeap: calendar === "lunar" && leap === 1, direction } as const;
      const civilResult = calculateDualDestiny(raw);
      const solarDate = civilResult.tianji.solar;
      const local = zonedCivilInstant(birthCity, solarDate.year, solarDate.month, solarDate.day, hour, minute);
      const trueSolar = toTrueSolar({
        year: solarDate.year,
        month: solarDate.month,
        day: solarDate.day,
        hour,
        minute,
        longitude: birthCity.longitude,
        tzOffsetHours: local.offsetHours,
      });
      const correctedBase = calculateDualDestiny({
        calendar: "solar",
        year: trueSolar.year,
        month: trueSolar.month,
        day: trueSolar.day,
        hour: trueSolar.hour,
        isLeap: false,
        direction,
      });
      const actualAfterMiddleQi = Boolean(correctedBase.tianji.middleQi && local.instant.getTime() >= correctedBase.tianji.middleQi.at.getTime());
      const correctedMonth = TIANJI_MONTHS[correctedBase.tianji.lunar.month - 1]!;
      const correctedTianji = calculateTianjiXinggong(correctedMonth, correctedBase.tianji.hourBranch, actualAfterMiddleQi);
      const next: DualDestinyResult = {
        ...correctedBase,
        tianji: {
          ...correctedBase.tianji,
          result: correctedTianji,
        },
      };
      setTimeNote({ hour: trueSolar.hour, minute: trueSolar.minute, shiftMinutes: trueSolar.shiftMinutes });
      setResult(next);
      setError("");
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    } catch {
      setResult(null);
      setTimeNote(null);
      setError(copy.invalid);
    }
  }

  const latest = result?.palm.latest ? presentPalmPalace(result.palm.latest, locale) : null;
  const reversedPalaces = result ? [...result.palm.palaces].reverse().map((item) => presentPalmPalace(item, locale)) : [];

  return (
    <main className="dual-page" aria-labelledby="dual-title">
      <div className="dual-shell">
        <div className="dual-topbar"><p>{copy.kicker}</p><Link to="/">{copy.back}</Link></div>
        <header className="dual-hero">
          <div><span>{locale === "en" ? "A" : locale === "zh-Hans" ? "双" : "雙"}</span><span>{locale === "en" ? "B" : locale === "zh-Hans" ? "轨" : "軌"}</span></div>
          <h1 id="dual-title">{copy.title}</h1><p>{copy.lead}</p>
        </header>

        <section className="dual-input-card" aria-labelledby="dual-input-title">
          <div className="dual-section-title"><span>01</span><h2 id="dual-input-title">{copy.input}</h2></div>
          <div className="dual-tabs" role="tablist">
            <button type="button" aria-selected={calendar === "solar"} onClick={() => { setCalendar("solar"); if (year > 2100) setYear(2100); clear(); }}>{copy.solar}</button>
            <button type="button" aria-selected={calendar === "lunar"} onClick={() => { setCalendar("lunar"); if (year > 2099) setYear(2099); clear(); }}>{copy.lunar}</button>
          </div>
          <div className="dual-fields">
            <label><span>{copy.year}</span><select value={year} onChange={(event) => { setYear(Number(event.target.value)); clear(); }}>{(calendar === "solar" ? SOLAR_YEARS : LUNAR_YEARS).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label><span>{copy.month}</span>{calendar === "solar" ? <select value={month} onChange={(event) => { setMonth(Number(event.target.value)); clear(); }}>{Array.from({ length: 12 }, (_, i) => i + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select> : <select value={lunarMonthKey} onChange={(event) => { setLunarMonthKey(event.target.value); clear(); }}>{lunarMonths.map((value) => <option key={`${value.month}:${Number(value.isLeap)}`} value={`${value.month}:${Number(value.isLeap)}`}>{lunarMonthLabel(value.month, value.isLeap, locale)}</option>)}</select>}</label>
            <label><span>{copy.day}</span><select value={day} onChange={(event) => { setDay(Number(event.target.value)); clear(); }}>{Array.from({ length: maxDay }, (_, i) => i + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label><span>{copy.time}</span><span className="grid grid-cols-2 gap-2"><select aria-label={copy.hour} value={hour} onChange={(event) => { setHour(Number(event.target.value)); clear(); }}>{HOURS.map((value) => <option key={value} value={value}>{String(value).padStart(2, "0")}</option>)}</select><select aria-label={copy.minute} value={minute} onChange={(event) => { setMinute(Number(event.target.value)); clear(); }}>{MINUTES.map((value) => <option key={value} value={value}>{String(value).padStart(2, "0")}</option>)}</select></span></label>
          </div>
          <CityPicker locale={locale} copy={copy} value={birthCity} onSelect={(city) => { setBirthCity(city); clear(); }} onClear={() => { setBirthCity(null); clear(); }} />
          <fieldset className="dual-direction"><legend>{copy.direction}</legend><div><button type="button" aria-pressed={direction === "male"} onClick={() => { setDirection("male"); clear(); }}>{copy.male}</button><button type="button" aria-pressed={direction === "female"} onClick={() => { setDirection("female"); clear(); }}>{copy.female}</button></div><p>{copy.directionHint}</p></fieldset>
          <div className="dual-auto"><i>✓</i><span>{copy.auto}</span></div>
          {timeNote && birthCity ? <p className="mt-2 text-xs leading-5 text-[#b9ded8]">{copy.corrected} {localizeCityHit(birthCity, locale).display} · {formatClock(timeNote.hour, timeNote.minute)} · {copy.shift} {timeNote.shiftMinutes > 0 ? "+" : ""}{timeNote.shiftMinutes} min</p> : null}
          {error ? <p className="dual-error" role="alert">{error}</p> : null}
          <button className="dual-submit" type="button" onClick={calculate}>{copy.submit}</button>
          <p className="dual-privacy">{copy.privacy}</p>
        </section>

        {result && latest && fusion ? (
          <section ref={resultRef} className="dual-results" aria-labelledby="dual-result-title" aria-live="polite">
            <div className="dual-section-title"><span>02</span><h2 id="dual-result-title">{copy.result}</h2></div>
            <div className="dual-engine-grid">
              <article className="dual-engine-card is-tianji">
                <p className="dual-engine-label">{copy.outer}</p>
                <Orbit active={result.tianji.result.palace} centre={TIANJI_STARS[result.tianji.result.palace][locale]} locale={locale} />
                <dl><div><dt>{copy.palace}</dt><dd>{locale === "en" ? EN_BRANCH[result.tianji.result.palace] : `${result.tianji.result.palace}${locale === "zh-Hans" ? "宫" : "宮"}`}</dd></div><div><dt>{copy.star}</dt><dd>{TIANJI_STARS[result.tianji.result.palace][locale]}</dd></div></dl>
                <div className="dual-reading"><small>{copy.character}</small><p>{TIANJI_CHARACTER[result.tianji.result.palace][locale]}</p></div>
                <p className="dual-lunar">{presentLunarLabel(result.palm.lunarLabel, locale)}</p>
                <p className="dual-correction"><b>{copy.correction}</b>{result.tianji.result.afterMiddleQi ? copy.advanced : copy.unchanged}</p>
              </article>
              <article className="dual-engine-card is-palm">
                <p className="dual-engine-label">{copy.inner}</p>
                <Orbit active={result.palm.latest!.zhi} centre={latest.star} locale={locale} reverse />
                <dl><div><dt>{copy.lifePalace}</dt><dd>{latest.zhi}</dd></div><div><dt>{copy.star}</dt><dd>{latest.star} · {latest.dao}</dd></div></dl>
                <div className="dual-reading"><small>{copy.character}</small><p>{latest.meaning}</p></div>
                <div className="dual-four"><small>{copy.four}</small><div>{reversedPalaces.map((item) => <span key={item.key}><b>{item.zhi}</b><em>{item.star}</em></span>)}</div></div>
              </article>
            </div>
            <article className="dual-fusion"><span>{locale === "en" ? "AB" : "合"}</span><div><small>{copy.fusion}</small><h3>{fusion.title}</h3><p>{fusion.body}</p><blockquote><b>{copy.advice}</b>{fusion.guidance}</blockquote></div></article>
            <p className="dual-boundary">{copy.boundary}</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
