import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateDualDestiny, type DualDestinyResult, type DualDirection } from "@/lib/dual-destiny";
import { searchCities } from "@/lib/actions";
import { toLunar } from "@/lib/bazi/calendar";
import { localizeCityHit, timezoneOffsetHours } from "@/lib/bazi/cities";
import { toTrueSolar } from "@/lib/bazi/solar-time";
import type { CityHit } from "@/lib/bazi/types";
import { presentPalmPalace } from "@/lib/palm/standalone-presentation";
import { calculateTianjiXinggong, TIANJI_MONTHS, type TianjiCalendar, type TianjiPalace } from "@/lib/tianji-xinggong";
import { useI18n, type Locale } from "@/lib/i18n";
import "@/tianji-dual.css";

export const Route = createFileRoute("/tianji-dual")({ component: TianjiDualPage });

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const SOLAR_YEARS = Array.from({ length: 201 }, (_, index) => 2100 - index);
const LUNAR_YEARS = Array.from({ length: 200 }, (_, index) => 2099 - index);

const COPY = {
  "zh-Hant": {
    kicker: "昭梧 · 性格兩面",
    title: "一個人，兩種反應",
    lead: "看你平時怎樣做事，也看你遇到壓力時最自然的反應。",
    back: "返回昭梧", input: "填寫出生資料", solar: "西曆", lunar: "農曆", year: "年", month: "月", day: "日", time: "出生時間", hour: "時", minute: "分",
    city: "出生地", cityPlaceholder: "輸入城市或國家", popularCities: "常用城市", direction: "出生性別", male: "男", female: "女",
    auto: "時間會按出生地自動校正。", submit: "看結果", invalid: "資料無法換算，請檢查日期、時間和出生地。", cityRequired: "請先選擇出生城市與國家。",
    privacy: "不登入，也不保存出生資料。", corrected: "已按出生地校正",
    result: "你的兩種反應", outer: "平時怎樣做事", inner: "壓力來時的反應", details: "查看傳統盤面", outerChart: "外在盤面", innerChart: "內在盤面", palace: "宮位", star: "星曜",
  },
  "zh-Hans": {
    kicker: "昭梧 · 性格两面",
    title: "一个人，两种反应",
    lead: "看你平时怎样做事，也看你遇到压力时最自然的反应。",
    back: "返回昭梧", input: "填写出生资料", solar: "西历", lunar: "农历", year: "年", month: "月", day: "日", time: "出生时间", hour: "时", minute: "分",
    city: "出生地", cityPlaceholder: "输入城市或国家", popularCities: "常用城市", direction: "出生性别", male: "男", female: "女",
    auto: "时间会按出生地自动校正。", submit: "看结果", invalid: "资料无法换算，请检查日期、时间和出生地。", cityRequired: "请先选择出生城市和国家。",
    privacy: "不登录，也不保存出生资料。", corrected: "已按出生地校正",
    result: "你的两种反应", outer: "平时怎样做事", inner: "压力来时的反应", details: "查看传统盘面", outerChart: "外在盘面", innerChart: "内在盘面", palace: "宫位", star: "星曜",
  },
  en: {
    kicker: "ZHAOWU · TWO SIDES OF CHARACTER",
    title: "One person, two natural responses",
    lead: "See how you usually handle life, and what comes out first when pressure rises.",
    back: "Back to Zhaowu", input: "Birth details", solar: "Gregorian", lunar: "Lunar", year: "Year", month: "Month", day: "Day", time: "Birth time", hour: "Hour", minute: "Minute",
    city: "Birthplace", cityPlaceholder: "Type a city or country", popularCities: "Common cities", direction: "Sex at birth", male: "Male", female: "Female",
    auto: "Time is adjusted automatically for your birthplace.", submit: "See my result", invalid: "These details could not be converted. Check the date, time and birthplace.", cityRequired: "Select the birth city and country first.",
    privacy: "No login. Birth details are not saved.", corrected: "Adjusted for birthplace",
    result: "Your two responses", outer: "How you usually operate", inner: "What comes out under pressure", details: "View the traditional chart", outerChart: "Outward chart", innerChart: "Inner chart", palace: "Palace", star: "Star",
  },
} as const;

const TIANJI_CHARACTER: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "待人溫和，很會留意別人的情緒。", "zh-Hans": "待人温和，很会留意别人的情绪。", en: "Warm with people and quick to notice how others are feeling." },
  丑: { "zh-Hant": "遇到難事先扛住，不輕易把壓力說出口。", "zh-Hans": "遇到难事先扛住，不轻易把压力说出口。", en: "Takes on hard things first and rarely shows the pressure early." },
  寅: { "zh-Hant": "習慣先定方向，事情一亂就會自然接手。", "zh-Hans": "习惯先定方向，事情一乱就会自然接手。", en: "Sets a direction quickly and naturally takes over when things become messy." },
  卯: { "zh-Hant": "爽快重情，對自己人通常很有義氣。", "zh-Hans": "爽快重情，对自己人通常很有义气。", en: "Open, loyal and generous with the people you consider your own." },
  辰: { "zh-Hant": "先看局勢再出手，想清楚才願意定案。", "zh-Hans": "先看局势再出手，想清楚才愿意定案。", en: "Reads the situation first and commits once the shape of it is clear." },
  巳: { "zh-Hant": "重細節和完成度，做事不喜歡馬虎。", "zh-Hans": "重细节和完成度，做事不喜欢马虎。", en: "Cares about detail and finish, and dislikes careless work." },
  午: { "zh-Hant": "親和好相處，也容易得到別人的照應。", "zh-Hans": "亲和好相处，也容易得到别人的照应。", en: "Easy to be around and often met with goodwill from others." },
  未: { "zh-Hant": "適應很快，換到新環境反而更容易打開局面。", "zh-Hans": "适应很快，换到新环境反而更容易打开局面。", en: "Adapts quickly and often does better when a new environment opens the field." },
  申: { "zh-Hant": "獨立有主見，重要的事更相信自己的判斷。", "zh-Hans": "独立有主见，重要的事更相信自己的判断。", en: "Independent and more likely to trust personal judgement on important matters." },
  酉: { "zh-Hant": "先觀察再表態，不會很快把心思全說出來。", "zh-Hans": "先观察再表态，不会很快把心思全说出来。", en: "Observes before speaking and does not reveal every thought at once." },
  戌: { "zh-Hant": "反應快、手上有本事，喜歡用結果說話。", "zh-Hans": "反应快、手上有本事，喜欢用结果说话。", en: "Quick and capable, preferring finished work over long explanations." },
  亥: { "zh-Hant": "感受很深，也很容易察覺別人的情緒。", "zh-Hans": "感受很深，也很容易察觉别人的情绪。", en: "Feels things deeply and easily picks up other people's moods." },
};

const INNER_CHARACTER: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "心軟，遇事會先想到別人的感受。", "zh-Hans": "心软，遇事会先想到别人的感受。", en: "You soften first and instinctively consider other people's feelings." },
  丑: { "zh-Hant": "先忍、先撐，通常到最後才說自己累。", "zh-Hans": "先忍、先撑，通常到最后才说自己累。", en: "You endure first and usually admit you are tired only much later." },
  寅: { "zh-Hant": "一有壓力就想把局面抓回手裡。", "zh-Hans": "一有压力就想把局面抓回手里。", en: "Pressure makes you want to take the situation back into your own hands." },
  卯: { "zh-Hant": "不服輸，跌倒後會很快重新站起來。", "zh-Hans": "不服输，跌倒后会很快重新站起来。", en: "You resist defeat and tend to get back up quickly after a setback." },
  辰: { "zh-Hant": "警覺高，碰到不合理的事會立刻反應。", "zh-Hans": "警觉高，碰到不合理的事会立刻反应。", en: "You become highly alert and react quickly when something feels wrong." },
  巳: { "zh-Hant": "需要自己想清楚，不喜歡被人催著決定。", "zh-Hans": "需要自己想清楚，不喜欢被人催着决定。", en: "You need to think it through yourself and dislike being pushed into a decision." },
  午: { "zh-Hant": "希望大家都好，容易把別人的需要也扛起來。", "zh-Hans": "希望大家都好，容易把别人的需要也扛起来。", en: "You want everyone to be all right and can end up carrying their needs too." },
  未: { "zh-Hant": "先適應再找出路，忙起來容易忘了照顧自己。", "zh-Hans": "先适应再找出路，忙起来容易忘了照顾自己。", en: "You adapt first and find a way through, sometimes forgetting your own needs." },
  申: { "zh-Hant": "會先退開一點，自己消化和判斷。", "zh-Hans": "会先退开一点，自己消化和判断。", en: "You step back, process privately and make your own judgement." },
  酉: { "zh-Hant": "判斷快、動作直接，最怕事情拖著不處理。", "zh-Hans": "判断快、动作直接，最怕事情拖着不处理。", en: "You decide quickly and would rather act than leave a problem hanging." },
  戌: { "zh-Hant": "不愛多解釋，會用做出來的結果證明自己。", "zh-Hans": "不爱多解释，会用做出来的结果证明自己。", en: "You explain little and prefer the finished result to make the point." },
  亥: { "zh-Hant": "需要時間和空間消化情緒，緩過來才會重新靠近。", "zh-Hans": "需要时间和空间消化情绪，缓过来才会重新靠近。", en: "You need time and space to settle your feelings before reconnecting." },
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
    if (localized && value && localized.display !== value.display) onSelect(localized);
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
      <label htmlFor="dual-birth-city" className="mb-2 block text-xs text-[#6e6256]">{copy.city}</label>
      <input
        id="dual-birth-city"
        value={query}
        placeholder={copy.cityPlaceholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls="dual-birth-city-results"
        aria-expanded={hits.length > 0}
        className="h-[3.15rem] w-full rounded-[.9rem] border border-[#ccb999] bg-[#fffaf0]/80 px-3 text-base text-[#2f2923] outline-none placeholder:text-[#9b8f82] focus:border-[#a33a2e]"
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
        <div id="dual-birth-city-results" role="listbox" className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-[.9rem] border border-[#ccb999] bg-[#fffaf0] shadow-2xl">
          {query.trim().length < 2 ? <p className="border-b border-[#ded0ba] px-3 py-2 text-[.68rem] tracking-[.12em] text-[#8c7d6c]">{copy.popularCities}</p> : null}
          {hits.map((city) => (
            <button
              key={`${city.display}-${city.latitude}-${city.longitude}`}
              type="button"
              role="option"
              aria-selected={value?.display === city.display}
              className="block w-full border-b border-[#ded0ba] px-3 py-3 text-left last:border-0 hover:bg-[#f3eadb]"
              onClick={() => {
                setQuery(city.display);
                setHits([]);
                onSelect(city);
              }}
            >
              <span className="block text-sm text-[#2f2923]">{city.display}</span>
              <span className="mt-1 block text-[.68rem] text-[#8c7d6c]">{city.timezone}</span>
            </button>
          ))}
        </div>
      ) : null}
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
  const [timeNote, setTimeNote] = useState("");
  const resultRef = useRef<HTMLElement>(null);
  const lunarMonths = useMemo(() => getLunarMonths(year), [year]);
  const selectedLunarMonth = lunarMonths.find((item) => `${item.month}:${Number(item.isLeap)}` === lunarMonthKey);
  const maxDay = calendar === "solar" ? daysInMonth(year, month) : (selectedLunarMonth?.days ?? 30);

  useEffect(() => { if (day > maxDay) setDay(maxDay); }, [day, maxDay]);
  useEffect(() => {
    if (calendar !== "lunar" || lunarMonths.some((item) => `${item.month}:${Number(item.isLeap)}` === lunarMonthKey)) return;
    if (lunarMonths[0]) setLunarMonthKey(`${lunarMonths[0].month}:${Number(lunarMonths[0].isLeap)}`);
  }, [calendar, lunarMonthKey, lunarMonths]);

  function clear() { setResult(null); setError(""); setTimeNote(""); }
  function calculate() {
    if (!birthCity) {
      setResult(null);
      setTimeNote("");
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
      setTimeNote(`${copy.corrected} ${birthCity.display} · ${formatClock(trueSolar.hour, trueSolar.minute)}`);
      setResult(next);
      setError("");
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    } catch {
      setResult(null);
      setTimeNote("");
      setError(copy.invalid);
    }
  }

  const latest = result?.palm.latest ? presentPalmPalace(result.palm.latest, locale) : null;

  return (
    <main className="dual-page" aria-labelledby="dual-title">
      <div className="dual-shell">
        <div className="dual-topbar"><p>{copy.kicker}</p><Link to="/">{copy.back}</Link></div>
        <header className="dual-hero">
          <span className="dual-seal" aria-hidden="true">{locale === "en" ? "II" : "兩面"}</span>
          <p className="dual-kicker">{copy.kicker}</p>
          <h1 id="dual-title">{copy.title}</h1>
          <p>{copy.lead}</p>
        </header>

        <section className="dual-input-card" aria-labelledby="dual-input-title">
          <div className="dual-section-title"><h2 id="dual-input-title">{copy.input}</h2></div>
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
          <fieldset className="dual-direction"><legend>{copy.direction}</legend><div><button type="button" aria-pressed={direction === "male"} onClick={() => { setDirection("male"); clear(); }}>{copy.male}</button><button type="button" aria-pressed={direction === "female"} onClick={() => { setDirection("female"); clear(); }}>{copy.female}</button></div></fieldset>
          <div className="dual-auto"><i>✓</i><span>{copy.auto}</span></div>
          {timeNote ? <p className="dual-time-note">{timeNote}</p> : null}
          {error ? <p className="dual-error" role="alert">{error}</p> : null}
          <button className="dual-submit" type="button" onClick={calculate}>{copy.submit}</button>
          <p className="dual-privacy">{copy.privacy}</p>
        </section>

        {result && latest ? (
          <section ref={resultRef} className="dual-results" aria-labelledby="dual-result-title" aria-live="polite">
            <div className="dual-section-title"><h2 id="dual-result-title">{copy.result}</h2></div>
            <div className="dual-side-grid">
              <article className="dual-side-card">
                <span className="dual-side-number" aria-hidden="true">一</span>
                <div>
                  <h3>{copy.outer}</h3>
                  <p>{TIANJI_CHARACTER[result.tianji.result.palace][locale]}</p>
                </div>
              </article>
              <article className="dual-side-card">
                <span className="dual-side-number" aria-hidden="true">二</span>
                <div>
                  <h3>{copy.inner}</h3>
                  <p>{INNER_CHARACTER[result.palm.latest!.zhi as TianjiPalace][locale]}</p>
                </div>
              </article>
            </div>
            <details className="dual-details">
              <summary>{copy.details}</summary>
              <dl>
                <div><dt>{copy.outerChart}</dt><dd>{locale === "en" ? EN_BRANCH[result.tianji.result.palace] : result.tianji.result.palace} · {TIANJI_STARS[result.tianji.result.palace][locale]}</dd></div>
                <div><dt>{copy.innerChart}</dt><dd>{latest.zhi} · {latest.star}</dd></div>
              </dl>
            </details>
          </section>
        ) : null}
      </div>
    </main>
  );
}
