import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { searchCities } from "@/lib/actions";
import { localizeCityHit, timezoneOffsetHours } from "@/lib/bazi/cities";
import { ganzhiOf } from "@/lib/bazi/calendar";
import { toTrueSolar } from "@/lib/bazi/solar-time";
import type { CityHit } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { saveSpecialistHistory } from "@/lib/specialist-history";
import {
  buildZiweiCoreChart,
  buildZiweiPlainSummary,
  buildZiweiTruthExtension,
  normalizeZiweiCalendarBirth,
  type EarthlyBranch,
  type HeavenlyStem,
  type ZiweiCoreChart,
  type ZiweiDirectionBasis,
  type ZiweiNormalizedCalendarBirth,
  type ZiweiTruthExtension,
} from "@/lib/ziwei";
import "@/ziwei.css";
import "@/ziwei-summary.css";
import "@/ziwei-report-clean.css";

export const Route = createFileRoute("/ziwei")({ component: ZiweiPage });

const ZHAOWU_PROFILE = {
  id: "zhaowu_default_v0.5",
  lateZiPolicy: "current_day",
  leapMonthPolicy: "same_month",
  yearBoundary: "lunar_new_year",
} as const;

function yearGanzhi(year: number): { stem: HeavenlyStem; branch: EarthlyBranch; ganzhi: string } {
  const index = ((year - 1984) % 60 + 60) % 60;
  const ganzhi = ganzhiOf(index);
  return { stem: ganzhi[0] as HeavenlyStem, branch: ganzhi[1] as EarthlyBranch, ganzhi };
}

type ResultState = {
  normalized: ZiweiNormalizedCalendarBirth;
  core: ZiweiCoreChart;
  extension: ZiweiTruthExtension;
  targetYear: number;
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
            <button type="button" key={`${hit.latitude}-${hit.longitude}`} onClick={() => { onSelect(hit); setQuery(hit.display); setHits([]); }}>
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
        back: "Back to Zhaowu", kicker: "ZHAOWU · ZI WEI DOU SHU", title: "Your Zi Wei report",
        lead: "A direct reading of your character, working style, money habits, relationship pattern, pressure points and current longer phase.",
        trust: "Zi Wei specialist report", input: "Birth details", year: "Year", month: "Month", day: "Day", hour: "Hour", minute: "Minute",
        city: "Birthplace", cityPh: "Search city", basis: "Sex at birth", male: "Male", female: "Female",
        calculate: "Generate my report", error: "Check the birth date, time and birthplace.", result: "Your Zi Wei report",
        summaryKicker: "YOUR READING", factsOnly: "Traditional interpretation for self-reflection",
        sections: ["Character", "Work and strengths", "Money pattern", "Relationships", "Pressure and recovery", "Current life phase"],
        saved: "Saved automatically on this device.", saveFailed: "The report is ready, but this browser blocked local storage.", history: "View my history",
      }
    : locale === "zh-Hans"
      ? {
          back: "返回昭梧", kicker: "昭梧 · 紫微斗数", title: "你的紫微报告",
          lead: "直接看你的性格底色、做事方式、财务习惯、关系模式、压力来源，以及当前十年最重要的课题。",
          trust: "紫微斗数专题报告", input: "出生资料", year: "年", month: "月", day: "日", hour: "时", minute: "分",
          city: "出生地", cityPh: "搜索城市", basis: "出生性别", male: "男", female: "女",
          calculate: "生成我的报告", error: "请检查出生日期、时间和出生地。", result: "你的紫微报告",
          summaryKicker: "个人报告", factsOnly: "传统文化解读，用于自我观察",
          sections: ["性格底色", "事业与做事方式", "财务习惯", "关系模式", "压力与恢复", "当前人生阶段"],
          saved: "已自动保存在这台设备。", saveFailed: "报告已生成，但浏览器阻止了本地保存。", history: "查看我的记录",
        }
      : {
          back: "返回昭梧", kicker: "昭梧 · 紫微斗數", title: "你的紫微報告",
          lead: "直接看你的性格底色、做事方式、財務習慣、關係模式、壓力來源，以及當前十年最重要的課題。",
          trust: "紫微斗數專題報告", input: "出生資料", year: "年", month: "月", day: "日", hour: "時", minute: "分",
          city: "出生地", cityPh: "搜尋城市", basis: "出生性別", male: "男", female: "女",
          calculate: "生成我的報告", error: "請檢查出生日期、時間和出生地。", result: "你的紫微報告",
          summaryKicker: "個人報告", factsOnly: "傳統文化解讀，用於自我觀察",
          sections: ["性格底色", "事業與做事方式", "財務習慣", "關係模式", "壓力與恢復", "當前人生階段"],
          saved: "已自動保存在這台裝置。", saveFailed: "報告已生成，但瀏覽器阻止了本機保存。", history: "查看我的紀錄",
        };

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("0");
  const [city, setCity] = useState<CityHit | null>(null);
  const [basis, setBasis] = useState<ZiweiDirectionBasis>("male");
  const [result, setResult] = useState<ResultState | null>(null);
  const [historySaved, setHistorySaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      if (!city) throw new Error("city");
      const y = Number(year), m = Number(month), d = Number(day), h = Number(hour), min = Number(minute || 0), ty = now.getFullYear();
      if (![y, m, d, h, min, ty].every(Number.isFinite)) throw new Error("number");
      const civilCheck = new Date(Date.UTC(y, m - 1, d));
      if (civilCheck.getUTCFullYear() !== y || civilCheck.getUTCMonth() !== m - 1 || civilCheck.getUTCDate() !== d) throw new Error("date");
      const at = new Date(Date.UTC(y, m - 1, d, h, min));
      const tzOffset = timezoneOffsetHours(city.timezone, at);
      const solar = toTrueSolar({ year: y, month: m, day: d, hour: h, minute: min, longitude: city.longitude, tzOffsetHours: tzOffset });
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
      const nextResult = { normalized, core, extension, targetYear: ty, activeDecadalIndex };
      const nextSummary = buildZiweiPlainSummary({ chart: core, extension, locale, activeDecadalIndex, targetYear: ty });
      setResult(nextResult);
      const savedEntry = saveSpecialistHistory({
        kind: "ziwei",
        locale,
        sourcePath: "/ziwei",
        title: nextSummary.title,
        inputSummary: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} · ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")} · ${localizeCityHit(city, locale).display}`,
        sections: nextSummary.paragraphs.map((paragraph, index) => ({ title: copy.sections[index] ?? copy.result, body: paragraph })),
        closing: nextSummary.closing,
      });
      setHistorySaved(Boolean(savedEntry));
      window.setTimeout(() => document.getElementById("ziwei-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
    } catch {
      setError(copy.error);
    }
  }

  const plainSummary = useMemo(() => result ? buildZiweiPlainSummary({ chart: result.core, extension: result.extension, locale, activeDecadalIndex: result.activeDecadalIndex, targetYear: result.targetYear }) : null, [result, locale]);

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
          </div>
          {error ? <p className="ziwei-error">{error}</p> : null}
          <button className="ziwei-submit" type="submit">{copy.calculate}<b aria-hidden>→</b></button>
        </form>
      </section>

      {result && plainSummary ? (
        <section id="ziwei-result" className="ziwei-result">
          <header className="ziwei-result-heading"><div><p>ZHAOWU · READ</p><h2>{copy.result}</h2></div><span>{copy.factsOnly}</span></header>
          <section className="ziwei-plain-report" aria-labelledby="ziwei-plain-title">
            <div className="ziwei-plain-seal" aria-hidden>梧</div>
            <header><p>{copy.summaryKicker}</p><h3 id="ziwei-plain-title">{plainSummary.title}</h3></header>
            <div className="ziwei-plain-body ziwei-report-sections">{plainSummary.paragraphs.map((paragraph, index)=><article key={copy.sections[index] ?? index}><h4>{copy.sections[index]}</h4><p>{paragraph}</p></article>)}</div>
            <blockquote>{plainSummary.closing}</blockquote>
            <div className="ziwei-report-history"><span>{historySaved ? copy.saved : copy.saveFailed}</span>{historySaved ? <Link to="/history">{copy.history}<b aria-hidden>→</b></Link> : null}</div>
          </section>
        </section>
      ):null}
    </main>
  );
}
