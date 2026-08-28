import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { searchCities } from "@/lib/actions";
import { localizeCityHit, timezoneOffsetHours } from "@/lib/bazi/cities";
import { ganzhiOf } from "@/lib/bazi/calendar";
import { toTrueSolar } from "@/lib/bazi/solar-time";
import type { CityHit } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  buildZiweiCoreChart,
  buildZiweiTruthExtension,
  normalizeZiweiCalendarBirth,
  type EarthlyBranch,
  type HeavenlyStem,
  type ZiweiDirectionBasis,
  type ZiweiTruthExtension,
  type ZiweiCoreChart,
  type ZiweiNormalizedCalendarBirth,
} from "@/lib/ziwei";
import "@/ziwei.css";

export const Route = createFileRoute("/ziwei")({ component: ZiweiPage });

const ZHAOWU_PROFILE = {
  id: "zhaowu_default_v0.5",
  lateZiPolicy: "current_day",
  leapMonthPolicy: "same_month",
  yearBoundary: "lunar_new_year",
} as const;

const CHART_BRANCHES = [
  ["巳", "1 / 1"], ["午", "1 / 2"], ["未", "1 / 3"], ["申", "1 / 4"],
  ["辰", "2 / 1"], ["酉", "2 / 4"], ["卯", "3 / 1"], ["戌", "3 / 4"],
  ["寅", "4 / 1"], ["丑", "4 / 2"], ["子", "4 / 3"], ["亥", "4 / 4"],
] as const;

const PALACE_EN: Record<string, string> = {
  命: "Life", 兄弟: "Siblings", 夫妻: "Partner", 子女: "Children", 財帛: "Money", 疾厄: "Health",
  遷移: "Movement", 交友: "Network", 官祿: "Work", 田宅: "Home", 福德: "Inner life", 父母: "Parents",
};

const HANS: Record<string, string> = {
  財: "财", 遷: "迁", 祿: "禄", 貞: "贞", 機: "机", 陰: "阴", 貪: "贪", 門: "门", 殺: "杀",
  輔: "辅", 弼: "弼", 鉞: "钺", 馬: "马", 鸞: "鸾", 羅: "罗", 廟: "庙", 鈴: "铃", 權: "权",
};

function hans(value: string) {
  return Array.from(value).map((char) => HANS[char] ?? char).join("");
}

function localizedCanonical(value: string, locale: Locale) {
  return locale === "zh-Hans" ? hans(value) : value;
}

function palaceLabel(name: string, locale: Locale) {
  if (locale === "en") return PALACE_EN[name] ?? name;
  return localizedCanonical(name, locale);
}

function yearGanzhi(year: number): { stem: HeavenlyStem; branch: EarthlyBranch; ganzhi: string } {
  const index = ((year - 1984) % 60 + 60) % 60;
  const ganzhi = ganzhiOf(index);
  return { stem: ganzhi[0] as HeavenlyStem, branch: ganzhi[1] as EarthlyBranch, ganzhi };
}

type ResultState = {
  normalized: ZiweiNormalizedCalendarBirth;
  core: ZiweiCoreChart;
  extension: ZiweiTruthExtension;
  shiftMinutes: number;
  usedTrueSolar: boolean;
  targetYear: number;
  targetGanzhi: string;
  nominalAge: number;
  activeDecadalIndex: number | null;
};

function CityField({ locale, city, onSelect, label, placeholder }: {
  locale: Locale;
  city: CityHit | null;
  onSelect: (city: CityHit | null) => void;
  label: string;
  placeholder: string;
}) {
  const [query, setQuery] = useState(city?.display ?? "");
  const [hits, setHits] = useState<CityHit[]>([]);

  useEffect(() => {
    setQuery(city ? localizeCityHit(city, locale).display : "");
  }, [city?.display, city?.latitude, city?.longitude, locale]);

  useEffect(() => {
    const trimmed = query.trim();
    if (city && trimmed === localizeCityHit(city, locale).display) {
      setHits([]);
      return;
    }
    if (trimmed.length < 2) return;
    let alive = true;
    const timer = window.setTimeout(() => {
      void searchCities({ data: trimmed })
        .then((rows) => { if (alive) setHits(rows.map((row) => localizeCityHit(row, locale))); })
        .catch(() => { if (alive) setHits([]); });
    }, 220);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [city, locale, query]);

  return (
    <label className="ziwei-field ziwei-city-field">
      <span>{label}</span>
      <input
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          if (query.trim().length >= 2) return;
          void searchCities({ data: "" })
            .then((rows) => setHits(rows.map((row) => localizeCityHit(row, locale))))
            .catch(() => setHits([]));
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          if (city) onSelect(null);
        }}
      />
      {hits.length ? (
        <div className="ziwei-city-results" role="listbox">
          {hits.map((hit) => (
            <button
              type="button"
              key={`${hit.latitude}-${hit.longitude}`}
              onClick={() => { onSelect(hit); setQuery(hit.display); setHits([]); }}
            >
              <b>{hit.display}</b><small>{hit.timezone}</small>
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}

function ZiweiPage() {
  const { locale } = useI18n();
  const now = new Date();
  const copy = locale === "en"
    ? {
        back: "Back to Zhaowu", kicker: "ZHAOWU · ZI WEI DOU SHU", title: "Deterministic 12-palace chart",
        lead: "The chart engine calculates palace positions, the 14 major stars, transformations, supporting stars, 10-year cycles and an annual overlay before any interpretation is written.",
        trust: "Calculation layer v0.5.3 · star positions are deterministic", input: "Birth details", year: "Year", month: "Month", day: "Day", hour: "Hour", minute: "Minute",
        city: "Birthplace", cityPh: "Search city", basis: "Cycle direction rule", male: "Male rule", female: "Female rule",
        trueSolar: "Apply true solar time", trueSolarHint: "Uses birthplace longitude, local time zone and daylight-saving offset.", targetYear: "Annual overlay year",
        calculate: "Build my Zi Wei chart", error: "Check the birth date, time and birthplace.", result: "Calculated chart", life: "Life Palace", body: "Body Palace", bureau: "Five-element bureau", yearGz: "Birth year",
        chart: "12-palace chart", major: "14 major stars", cycles: "10-year cycles", annual: "Annual overlay",
        source: "Engine status", sourceBody: "The calculation data is verified for production use. School-dependent rules such as brightness and moving-star sets are explicitly version-locked; primary-source traditions still differ, so the engine does not pretend there is one universal historical table.",
        active: "Active for selected year", noActive: "Before the first 10-year cycle", nominal: "Nominal age", corrected: "Time used", civil: "Civil time", solar: "True solar", shift: "shift",
        annualStars: "Annual moving stars", factsOnly: "Calculation facts only · no medical or fortune diagnosis here",
      }
    : locale === "zh-Hans"
      ? {
          back: "返回昭梧", kicker: "昭梧 · 紫微斗数", title: "紫微斗数・十二宫真值命盘",
          lead: "命宫、身宫、十四主星、四化、辅煞、大限与流年先由固定算法排出，再交给解释层；这里不让 AI 自己猜星位。",
          trust: "计算层 v0.5.3 · 星位由固定算法计算", input: "出生资料", year: "年", month: "月", day: "日", hour: "时", minute: "分",
          city: "出生地", cityPh: "搜索城市", basis: "大限顺逆规则", male: "男命规则", female: "女命规则",
          trueSolar: "使用真太阳时", trueSolarHint: "按出生地经度、当地时区与夏令时校正。", targetYear: "查看流年",
          calculate: "排出我的紫微命盘", error: "请检查出生日期、时间和出生地。", result: "计算结果", life: "命宫", body: "身宫", bureau: "五行局", yearGz: "生年干支",
          chart: "十二宫盘", major: "十四主星", cycles: "十二步大限", annual: "流年叠盘",
          source: "引擎状态", sourceBody: "计算资料已通过验证，可正式使用。庙旺表、流曜等存在流派差异的规则已锁定版本；原典之间仍有差异，因此不会伪装成唯一历史真值。",
          active: "所选年份所在大限", noActive: "尚未进入第一大限", nominal: "虚岁", corrected: "实际排盘时间", civil: "民用时间", solar: "真太阳时", shift: "偏移",
          annualStars: "流年流曜", factsOnly: "这里只给计算事实 · 不做医疗或吉凶诊断",
        }
      : {
          back: "返回昭梧", kicker: "昭梧 · 紫微斗數", title: "紫微斗數・十二宮真值命盤",
          lead: "命宮、身宮、十四主星、四化、輔煞、大限與流年先由固定算法排出，再交給解釋層；這裡不讓 AI 自己猜星位。",
          trust: "計算層 v0.5.3 · 星位由固定算法計算", input: "出生資料", year: "年", month: "月", day: "日", hour: "時", minute: "分",
          city: "出生地", cityPh: "搜尋城市", basis: "大限順逆規則", male: "男命規則", female: "女命規則",
          trueSolar: "使用真太陽時", trueSolarHint: "按出生地經度、當地時區與夏令時校正。", targetYear: "查看流年",
          calculate: "排出我的紫微命盤", error: "請檢查出生日期、時間和出生地。", result: "計算結果", life: "命宮", body: "身宮", bureau: "五行局", yearGz: "生年干支",
          chart: "十二宮盤", major: "十四主星", cycles: "十二步大限", annual: "流年疊盤",
          source: "引擎狀態", sourceBody: "計算資料已通過驗證，可正式使用。廟旺表、流曜等存在流派差異的規則已鎖定版本；原典之間仍有差異，因此不會偽裝成唯一歷史真值。",
          active: "所選年份所在大限", noActive: "尚未進入第一大限", nominal: "虛歲", corrected: "實際排盤時間", civil: "民用時間", solar: "真太陽時", shift: "偏移",
          annualStars: "流年流曜", factsOnly: "這裡只給計算事實 · 不做醫療或吉凶診斷",
        };

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("0");
  const [city, setCity] = useState<CityHit | null>(null);
  const [basis, setBasis] = useState<ZiweiDirectionBasis>("male");
  const [useTrueSolar, setUseTrueSolar] = useState(true);
  const [targetYear, setTargetYear] = useState(String(now.getFullYear()));
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      if (!city) throw new Error("city");
      const y = Number(year), m = Number(month), d = Number(day), h = Number(hour), min = Number(minute || 0), ty = Number(targetYear);
      if (![y, m, d, h, min, ty].every(Number.isFinite)) throw new Error("number");
      const civilCheck = new Date(Date.UTC(y, m - 1, d));
      if (civilCheck.getUTCFullYear() !== y || civilCheck.getUTCMonth() !== m - 1 || civilCheck.getUTCDate() !== d) throw new Error("date");
      const at = new Date(Date.UTC(y, m - 1, d, h, min));
      const tzOffset = timezoneOffsetHours(city.timezone, at);
      const solar = useTrueSolar
        ? toTrueSolar({ year: y, month: m, day: d, hour: h, minute: min, longitude: city.longitude, tzOffsetHours: tzOffset })
        : { year: y, month: m, day: d, hour: h, minute: min, shiftMinutes: 0 };
      const normalized = normalizeZiweiCalendarBirth({
        civilDate: { year: solar.year, month: solar.month, day: solar.day, hour: solar.hour, minute: solar.minute },
        timeConfidence: "certain",
        profile: ZHAOWU_PROFILE,
      });
      if (!normalized.coreInput) throw new Error("normalization");
      const core = buildZiweiCoreChart(normalized.coreInput, { mutagenProfile: "south_iztro_v1" });
      const target = yearGanzhi(ty);
      const nominalAge = ty - normalized.sourceLunarDate.year + 1;
      const firstAge = core.fiveElementsBureau.number;
      const rawDecadalIndex = nominalAge >= firstAge ? Math.floor((nominalAge - firstAge) / 10) : -1;
      const activeDecadalIndex = rawDecadalIndex >= 0 && rawDecadalIndex < 12 ? rawDecadalIndex : null;
      const extension = buildZiweiTruthExtension({ chart: core, directionBasis: basis, targetYear: { year: ty, stem: target.stem, branch: target.branch }, activeDecadalIndex });
      setResult({ normalized, core, extension, shiftMinutes: solar.shiftMinutes, usedTrueSolar: useTrueSolar, targetYear: ty, targetGanzhi: target.ganzhi, nominalAge, activeDecadalIndex });
      window.setTimeout(() => document.getElementById("ziwei-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
    } catch {
      setError(copy.error);
    }
  }

  const majorSet = useMemo(() => new Set(Object.keys(result?.core.majorStars ?? {})), [result]);
  const starsByBranch = useMemo(() => {
    const map = new Map<string, ZiweiTruthExtension["natalStars"]>();
    if (!result) return map;
    for (const star of result.extension.natalStars) {
      const current = map.get(star.branch) ?? [];
      current.push(star);
      map.set(star.branch, current);
    }
    return map;
  }, [result]);
  const activeDecadal = result?.activeDecadalIndex == null ? null : result.extension.decadals[result.activeDecadalIndex] ?? null;

  return (
    <main className="ziwei-page">
      <div className="ziwei-topline"><Link to="/" className="ziwei-back">← {copy.back}</Link><span>{copy.trust}</span></div>
      <section className="ziwei-hero"><p>{copy.kicker}</p><h1>{copy.title}</h1><div className="ziwei-hero-rule" aria-hidden><i /><b>紫</b><i /></div><p className="ziwei-hero-lead">{copy.lead}</p></section>
      <section className="ziwei-form-card">
        <header><p>ZHAOWU · INPUT</p><h2>{copy.input}</h2></header>
        <form onSubmit={submit}>
          <div className="ziwei-date-grid">
            {[[copy.year,year,setYear,1900,2100],[copy.month,month,setMonth,1,12],[copy.day,day,setDay,1,31],[copy.hour,hour,setHour,0,23],[copy.minute,minute,setMinute,0,59]].map(([label,value,setter,min,max]) => (
              <label className="ziwei-field" key={String(label)}><span>{label as string}</span><input required type="number" inputMode="numeric" min={min as number} max={max as number} value={value as string} onChange={(e) => (setter as (value:string)=>void)(e.target.value)} /></label>
            ))}
          </div>
          <CityField locale={locale} city={city} onSelect={setCity} label={copy.city} placeholder={copy.cityPh} />
          <div className="ziwei-options-grid">
            <label className="ziwei-field"><span>{copy.basis}</span><select value={basis} onChange={(e)=>setBasis(e.target.value as ZiweiDirectionBasis)}><option value="male">{copy.male}</option><option value="female">{copy.female}</option></select></label>
            <label className="ziwei-field"><span>{copy.targetYear}</span><input type="number" min={1900} max={2200} value={targetYear} onChange={(e)=>setTargetYear(e.target.value)} /></label>
          </div>
          <label className="ziwei-check"><input type="checkbox" checked={useTrueSolar} onChange={(e)=>setUseTrueSolar(e.target.checked)} /><span><b>{copy.trueSolar}</b><small>{copy.trueSolarHint}</small></span></label>
          {error ? <p className="ziwei-error">{error}</p> : null}
          <button className="ziwei-submit" type="submit">{copy.calculate}<b aria-hidden>→</b></button>
        </form>
      </section>

      {result ? (
        <section id="ziwei-result" className="ziwei-result">
          <header className="ziwei-result-heading"><div><p>ZHAOWU · CALCULATED</p><h2>{copy.result}</h2></div><span>{copy.factsOnly}</span></header>
          <div className="ziwei-summary-grid">
            <article><small>{copy.life}</small><b>{result.core.soulPalace}</b><span>{result.core.soulPalaceStem}{result.core.soulPalace}</span></article>
            <article><small>{copy.body}</small><b>{result.core.bodyPalace}</b><span>{palaceLabel(result.core.palaces.find((p)=>p.isBodyPalace)?.name ?? "",locale)}</span></article>
            <article><small>{copy.bureau}</small><b className="is-wide">{localizedCanonical(result.core.fiveElementsBureau.name,locale)}</b><span>{result.core.fiveElementsBureau.number}</span></article>
            <article><small>{copy.yearGz}</small><b>{localizedCanonical(result.normalized.effectiveYearGanzhi ?? "—",locale)}</b><span>{result.normalized.profile.id}</span></article>
          </div>
          <div className="ziwei-time-note"><span>{copy.corrected}</span><b>{result.usedTrueSolar?copy.solar:copy.civil}</b><i>{result.normalized.civilDate.year}-{String(result.normalized.civilDate.month).padStart(2,"0")}-{String(result.normalized.civilDate.day).padStart(2,"0")} {String(result.normalized.civilDate.hour??0).padStart(2,"0")}:{String(result.normalized.civilDate.minute??0).padStart(2,"0")}</i>{result.usedTrueSolar?<em>{copy.shift} {result.shiftMinutes>=0?"+":""}{result.shiftMinutes} min</em>:null}</div>
          <section className="ziwei-chart-section">
            <div className="ziwei-section-title"><p>12 PALACES</p><h3>{copy.chart}</h3></div>
            <div className="ziwei-chart-board">
              {CHART_BRANCHES.map(([branch,gridArea])=>{const palace=result.core.palaces.find((item)=>item.branch===branch);const stars=starsByBranch.get(branch)??[];const majors=stars.filter((star)=>majorSet.has(star.star));const auxiliary=stars.filter((star)=>!majorSet.has(star.star)).slice(0,3);return <article key={branch} style={{gridArea}} className={`${palace?.branch===result.core.soulPalace?"is-life ":""}${palace?.isBodyPalace?"is-body":""}`}><header><b>{palace?.stem}{branch}</b><span>{palaceLabel(palace?.name??"",locale)}</span></header><div className="ziwei-major-list">{majors.map((star)=><strong key={star.star}>{localizedCanonical(star.star,locale)}{star.brightness?<small>{localizedCanonical(star.brightness,locale)}</small>:null}</strong>)}</div><div className="ziwei-aux-list">{auxiliary.map((star)=><span key={star.star}>{localizedCanonical(star.star,locale)}</span>)}</div></article>;})}
              <div className="ziwei-chart-center"><p>{result.normalized.sourceLunarDate.isLeap?(locale==="en"?"Leap lunar month":locale==="zh-Hans"?"闰月":"閏月"):"LUNAR"}</p><b>{result.normalized.sourceLunarDate.month}月{result.normalized.sourceLunarDate.day}日</b><span>{localizedCanonical(result.core.fiveElementsBureau.name,locale)}</span><div className="ziwei-center-mutagens">{result.extension.natalMutagens.map((item)=><i key={item.transformation}>{localizedCanonical(item.transformation,locale)} · {localizedCanonical(item.targetStar,locale)}</i>)}</div></div>
            </div>
          </section>
          <section className="ziwei-lists-section"><div className="ziwei-section-title"><p>14 MAJOR STARS</p><h3>{copy.major}</h3></div><div className="ziwei-major-table">{result.extension.natalStars.filter((star)=>majorSet.has(star.star)).map((star)=><article key={star.star}><b>{localizedCanonical(star.star,locale)}</b><span>{star.branch}</span><i>{star.brightness?localizedCanonical(star.brightness,locale):"—"}</i></article>)}</div></section>
          <section className="ziwei-cycle-section"><div className="ziwei-section-title"><p>10-YEAR CYCLES</p><h3>{copy.cycles}</h3></div><div className="ziwei-cycle-strip">{result.extension.decadals.map((item)=><article key={item.index} className={item.index===result.activeDecadalIndex?"is-active":""}><small>{item.ageStart}–{item.ageEnd}</small><b>{item.stem}{item.branch}</b><span>{item.direction===1?"順":"逆"}</span></article>)}</div><p className="ziwei-active-note">{copy.nominal} {result.nominalAge} · {activeDecadal?`${copy.active}: ${activeDecadal.ageStart}–${activeDecadal.ageEnd} · ${activeDecadal.stem}${activeDecadal.branch}`:copy.noActive}</p></section>
          {result.extension.yearly?<section className="ziwei-annual-section"><div className="ziwei-section-title"><p>YEARLY OVERLAY · {result.targetYear}</p><h3>{copy.annual}</h3></div><div className="ziwei-annual-head"><b>{result.targetYear} · {localizedCanonical(result.targetGanzhi,locale)}</b><span>{copy.life}: {result.extension.yearly.lifeBranch}</span></div><div className="ziwei-transform-grid">{result.extension.yearly.mutagens.map((event)=><article key={event.transformation}><small>化{localizedCanonical(event.transformation,locale)}</small><b>{localizedCanonical(event.targetStar,locale)}</b><span>{event.branch??"—"} · {event.natalPalaceName?palaceLabel(event.natalPalaceName,locale):"—"}</span></article>)}</div><p className="ziwei-subhead">{copy.annualStars}</p><div className="ziwei-moving-stars">{result.extension.yearly.movingStars.map((star)=><span key={star.star}><b>{localizedCanonical(star.star,locale)}</b>{star.branch}</span>)}</div></section>:null}
          <section className="ziwei-engine-note"><p>{copy.source}</p><strong>{result.extension.calculationProfileId}</strong><span>{copy.sourceBody}</span><code>iztro 2.6.0 · 1ba89cca…</code></section>
        </section>
      ):null}
    </main>
  );
}