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
  buildZiweiPlainSummary,
  buildZiweiTruthExtension,
  normalizeZiweiCalendarBirth,
  type EarthlyBranch,
  type HeavenlyStem,
  type ZiweiCoreChart,
  type ZiweiDirectionBasis,
  type ZiweiNormalizedCalendarBirth,
  type ZiweiTruthExtension,
  type ZiweiTransformation,
} from "@/lib/ziwei";
import "@/ziwei.css";
import "@/ziwei-summary.css";

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
  命: "Self", 兄弟: "Peers", 夫妻: "Partner", 子女: "Projects", 財帛: "Money", 疾厄: "Pace",
  遷移: "Environment", 交友: "Network", 官祿: "Work", 田宅: "Home", 福德: "Inner life", 父母: "Family",
};

const BRANCH_EN: Record<string, string> = {
  子: "Rat", 丑: "Ox", 寅: "Tiger", 卯: "Rabbit", 辰: "Dragon", 巳: "Snake",
  午: "Horse", 未: "Goat", 申: "Monkey", 酉: "Rooster", 戌: "Dog", 亥: "Pig",
};

const STAR_EN: Record<string, string> = {
  紫微: "Leadership", 天機: "Strategy", 太陽: "Visibility", 武曲: "Practicality", 天同: "Ease", 廉貞: "Boundaries",
  天府: "Stability", 太陰: "Sensitivity", 貪狼: "Exploration", 巨門: "Analysis", 天相: "Coordination", 天梁: "Responsibility",
  七殺: "Decisiveness", 破軍: "Reinvention", 天魁: "Support", 天鉞: "Support", 文昌: "Writing", 文曲: "Expression",
  祿存: "Resources", 擎羊: "Friction", 陀羅: "Delay", 火星: "Urgency", 鈴星: "Pressure", 地空: "Distance", 地劫: "Disruption",
  天馬: "Movement", 紅鸞: "Attraction", 天喜: "Celebration", 年解: "Resolution", 左輔: "Support", 右弼: "Support",
};

const HANS: Record<string, string> = {
  財: "财", 遷: "迁", 祿: "禄", 貞: "贞", 機: "机", 陰: "阴", 貪: "贪", 門: "门", 殺: "杀",
  輔: "辅", 鉞: "钺", 馬: "马", 鸞: "鸾", 羅: "罗", 廟: "庙", 鈴: "铃", 權: "权", 體: "体",
};

function hans(value: string) {
  return Array.from(value).map((char) => HANS[char] ?? char).join("");
}

function starLabel(value: string, locale: Locale) {
  if (locale === "en") return STAR_EN[value] ?? "Chart factor";
  return locale === "zh-Hans" ? hans(value) : value;
}

function branchLabel(value: string, locale: Locale) {
  if (locale === "en") return BRANCH_EN[value] ?? value;
  return value;
}

function palaceLabel(name: string, locale: Locale) {
  if (locale === "en") return PALACE_EN[name] ?? name;
  return locale === "zh-Hans" ? hans(name) : name;
}

function transformLabel(value: ZiweiTransformation, locale: Locale) {
  if (locale === "en") return ({ 祿: "Support", 權: "Responsibility", 科: "Recognition", 忌: "Pressure" } as const)[value];
  const prefix = locale === "zh-Hans" ? "化" : "化";
  return `${prefix}${locale === "zh-Hans" ? hans(value) : value}`;
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
        back: "Back to Zhaowu", kicker: "ZHAOWU · ZI WEI", title: "Your Zi Wei reading",
        lead: "We calculate the chart first, then translate the useful patterns into plain English. You get the explanation before the technical chart.",
        trust: "Deterministic calculation · plain-language interpretation", input: "Birth details", year: "Year", month: "Month", day: "Day", hour: "Hour", minute: "Minute",
        city: "Birthplace", cityPh: "Search city", basis: "Cycle direction rule", male: "Male rule", female: "Female rule",
        trueSolar: "Apply true solar time", trueSolarHint: "Uses birthplace longitude, local time zone and daylight-saving offset.", targetYear: "Year to review",
        calculate: "Read my Zi Wei chart", error: "Check the birth date, time and birthplace.", result: "Your result", life: "Core position", body: "Action focus", bureau: "Chart rhythm", yearGz: "Birth year",
        summaryKicker: "PLAIN-LANGUAGE READING", technical: "View technical chart details", chart: "12-position chart", major: "14 major factors", cycles: "10-year cycles", annual: "Yearly overlay",
        source: "Engine status", sourceBody: "Calculation facts are version-locked. The customer explanation is generated only from those facts and never changes star positions.",
        active: "Active longer phase", noActive: "Before the first 10-year cycle", nominal: "Nominal age", corrected: "Time used", civil: "Civil time", solar: "True solar", shift: "shift",
        annualStars: "Yearly moving factors", factsOnly: "Traditional interpretive framework · not medical or financial diagnosis",
      }
    : locale === "zh-Hans"
      ? {
          back: "返回昭梧", kicker: "昭梧 · 紫微斗数", title: "你的紫微白话解读",
          lead: "先把命盘算准，再把真正有用的部分翻译成白话。客人先看到解释，专业命盘放在后面。",
          trust: "固定算法排盘 · 白话解释", input: "出生资料", year: "年", month: "月", day: "日", hour: "时", minute: "分",
          city: "出生地", cityPh: "搜索城市", basis: "大限顺逆规则", male: "男命规则", female: "女命规则",
          trueSolar: "使用真太阳时", trueSolarHint: "按出生地经度、当地时区与夏令时校正。", targetYear: "想查看的年份",
          calculate: "生成我的紫微解读", error: "请检查出生日期、时间和出生地。", result: "你的结果", life: "核心位置", body: "行动重心", bureau: "命盘节奏", yearGz: "生年干支",
          summaryKicker: "白话总解", technical: "查看专业命盘资料", chart: "十二宫盘", major: "十四主星", cycles: "十二步大限", annual: "流年叠盘",
          source: "引擎状态", sourceBody: "排盘事实已锁定版本；白话解释只读取这些事实，不会反向修改星位。",
          active: "当前十年阶段", noActive: "尚未进入第一大限", nominal: "虚岁", corrected: "实际排盘时间", civil: "民用时间", solar: "真太阳时", shift: "偏移",
          annualStars: "流年变化因素", factsOnly: "传统文化解释 · 不作医疗或投资诊断",
        }
      : {
          back: "返回昭梧", kicker: "昭梧 · 紫微斗數", title: "你的紫微白話解讀",
          lead: "先把命盤算準，再把真正有用的部分翻譯成白話。客人先看到解釋，專業命盤放在後面。",
          trust: "固定算法排盤 · 白話解釋", input: "出生資料", year: "年", month: "月", day: "日", hour: "時", minute: "分",
          city: "出生地", cityPh: "搜尋城市", basis: "大限順逆規則", male: "男命規則", female: "女命規則",
          trueSolar: "使用真太陽時", trueSolarHint: "按出生地經度、當地時區與夏令時校正。", targetYear: "想查看的年份",
          calculate: "生成我的紫微解讀", error: "請檢查出生日期、時間和出生地。", result: "你的結果", life: "核心位置", body: "行動重心", bureau: "命盤節奏", yearGz: "生年干支",
          summaryKicker: "白話總解", technical: "查看專業命盤資料", chart: "十二宮盤", major: "十四主星", cycles: "十二步大限", annual: "流年疊盤",
          source: "引擎狀態", sourceBody: "排盤事實已鎖定版本；白話解釋只讀取這些事實，不會反向修改星位。",
          active: "當前十年階段", noActive: "尚未進入第一大限", nominal: "虛歲", corrected: "實際排盤時間", civil: "民用時間", solar: "真太陽時", shift: "偏移",
          annualStars: "流年變化因素", factsOnly: "傳統文化解釋 · 不作醫療或投資診斷",
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
            <label className="ziwei-field"><span>{copy.targetYear}</span><input type="number" min={1900} max={2200} value={targetYear} onChange={(e)=>setTargetYear(e.target.value)} /></label>
          </div>
          <label className="ziwei-check"><input type="checkbox" checked={useTrueSolar} onChange={(e)=>setUseTrueSolar(e.target.checked)} /><span><b>{copy.trueSolar}</b><small>{copy.trueSolarHint}</small></span></label>
          {error ? <p className="ziwei-error">{error}</p> : null}
          <button className="ziwei-submit" type="submit">{copy.calculate}<b aria-hidden>→</b></button>
        </form>
      </section>

      {result && plainSummary ? (
        <section id="ziwei-result" className="ziwei-result">
          <header className="ziwei-result-heading"><div><p>ZHAOWU · READ</p><h2>{copy.result}</h2></div><span>{copy.factsOnly}</span></header>
          <div className="ziwei-summary-grid">
            <article><small>{copy.life}</small><b>{branchLabel(result.core.soulPalace, locale)}</b><span>{locale === 'en' ? 'calculated' : `${result.core.soulPalaceStem}${result.core.soulPalace}`}</span></article>
            <article><small>{copy.body}</small><b>{branchLabel(result.core.bodyPalace, locale)}</b><span>{palaceLabel(result.core.palaces.find((p)=>p.isBodyPalace)?.name ?? "",locale)}</span></article>
            <article><small>{copy.bureau}</small><b className="is-wide">{locale === 'en' ? `Level ${result.core.fiveElementsBureau.number}` : locale === 'zh-Hans' ? hans(result.core.fiveElementsBureau.name) : result.core.fiveElementsBureau.name}</b><span>{result.core.fiveElementsBureau.number}</span></article>
            <article><small>{copy.yearGz}</small><b>{locale === 'en' ? result.normalized.sourceLunarDate.year : locale === 'zh-Hans' ? hans(result.normalized.effectiveYearGanzhi ?? "—") : result.normalized.effectiveYearGanzhi ?? "—"}</b><span>{result.normalized.profile.id}</span></article>
          </div>
          <div className="ziwei-time-note"><span>{copy.corrected}</span><b>{result.usedTrueSolar?copy.solar:copy.civil}</b><i>{result.normalized.civilDate.year}-{String(result.normalized.civilDate.month).padStart(2,"0")}-{String(result.normalized.civilDate.day).padStart(2,"0")} {String(result.normalized.civilDate.hour??0).padStart(2,"0")}:{String(result.normalized.civilDate.minute??0).padStart(2,"0")}</i>{result.usedTrueSolar?<em>{copy.shift} {result.shiftMinutes>=0?"+":""}{result.shiftMinutes} min</em>:null}</div>

          <section className="ziwei-plain-report" aria-labelledby="ziwei-plain-title">
            <div className="ziwei-plain-seal" aria-hidden>梧</div>
            <header><p>{copy.summaryKicker}</p><h3 id="ziwei-plain-title">{plainSummary.title}</h3></header>
            <div className="ziwei-plain-body">{plainSummary.paragraphs.map((paragraph, index)=><p key={index}>{paragraph}</p>)}</div>
            <blockquote>{plainSummary.closing}</blockquote>
          </section>

          <details className="ziwei-technical">
            <summary>{copy.technical}<span aria-hidden>＋</span></summary>
            <div className="ziwei-technical-inner">
              <section className="ziwei-chart-section">
                <div className="ziwei-section-title"><p>12</p><h3>{copy.chart}</h3></div>
                <div className="ziwei-chart-board">
                  {CHART_BRANCHES.map(([branch,gridArea])=>{const palace=result.core.palaces.find((item)=>item.branch===branch);const stars=starsByBranch.get(branch)??[];const majors=stars.filter((star)=>majorSet.has(star.star));const auxiliary=stars.filter((star)=>!majorSet.has(star.star)).slice(0,3);return <article key={branch} style={{gridArea}} className={`${palace?.branch===result.core.soulPalace?"is-life ":""}${palace?.isBodyPalace?"is-body":""}`}><header><b>{locale==='en'?branchLabel(branch,locale):`${palace?.stem}${branch}`}</b><span>{palaceLabel(palace?.name??"",locale)}</span></header><div className="ziwei-major-list">{majors.map((star)=><strong key={star.star}>{starLabel(star.star,locale)}{star.brightness && locale!=='en'?<small>{locale==='zh-Hans'?hans(star.brightness):star.brightness}</small>:null}</strong>)}</div><div className="ziwei-aux-list">{auxiliary.map((star)=><span key={star.star}>{starLabel(star.star,locale)}</span>)}</div></article>;})}
                  <div className="ziwei-chart-center"><p>{result.normalized.sourceLunarDate.isLeap?(locale==="en"?"Leap lunar month":locale==="zh-Hans"?"闰月":"閏月"):"LUNAR"}</p><b>{locale==='en'?`${result.normalized.sourceLunarDate.month}/${result.normalized.sourceLunarDate.day}`:`${result.normalized.sourceLunarDate.month}月${result.normalized.sourceLunarDate.day}日`}</b><span>{locale==='en'?`Level ${result.core.fiveElementsBureau.number}`:locale==='zh-Hans'?hans(result.core.fiveElementsBureau.name):result.core.fiveElementsBureau.name}</span></div>
                </div>
              </section>
              <section className="ziwei-lists-section"><div className="ziwei-section-title"><p>14</p><h3>{copy.major}</h3></div><div className="ziwei-major-table">{result.extension.natalStars.filter((star)=>majorSet.has(star.star)).map((star)=><article key={star.star}><b>{starLabel(star.star,locale)}</b><span>{branchLabel(star.branch,locale)}</span><i>{locale==='en'?'—':star.brightness?(locale==='zh-Hans'?hans(star.brightness):star.brightness):"—"}</i></article>)}</div></section>
              <section className="ziwei-cycle-section"><div className="ziwei-section-title"><p>10Y</p><h3>{copy.cycles}</h3></div><div className="ziwei-cycle-strip">{result.extension.decadals.map((item)=><article key={item.index} className={item.index===result.activeDecadalIndex?"is-active":""}><small>{item.ageStart}–{item.ageEnd}</small><b>{locale==='en'?branchLabel(item.branch,locale):`${item.stem}${item.branch}`}</b><span>{item.direction===1?(locale==='en'?'forward':locale==='zh-Hans'?'顺':'順'):(locale==='en'?'reverse':locale==='zh-Hans'?'逆':'逆')}</span></article>)}</div><p className="ziwei-active-note">{copy.nominal} {result.nominalAge} · {activeDecadal?`${copy.active}: ${activeDecadal.ageStart}–${activeDecadal.ageEnd}`:copy.noActive}</p></section>
              {result.extension.yearly?<section className="ziwei-annual-section"><div className="ziwei-section-title"><p>{result.targetYear}</p><h3>{copy.annual}</h3></div><div className="ziwei-annual-head"><b>{locale==='en'?result.targetYear:`${result.targetYear} · ${result.targetGanzhi}`}</b><span>{copy.life}: {branchLabel(result.extension.yearly.lifeBranch,locale)}</span></div><div className="ziwei-transform-grid">{result.extension.yearly.mutagens.map((event)=><article key={event.transformation}><small>{transformLabel(event.transformation,locale)}</small><b>{starLabel(event.targetStar,locale)}</b><span>{event.natalPalaceName?palaceLabel(event.natalPalaceName,locale):"—"}</span></article>)}</div><p className="ziwei-subhead">{copy.annualStars}</p><div className="ziwei-moving-stars">{result.extension.yearly.movingStars.map((star)=><span key={star.star}><b>{starLabel(star.star,locale)}</b>{branchLabel(star.branch,locale)}</span>)}</div></section>:null}
              <section className="ziwei-engine-note"><p>{copy.source}</p><strong>{result.extension.calculationProfileId}</strong><span>{copy.sourceBody}</span><code>iztro 2.6.0 · 1ba89cca…</code></section>
            </div>
          </details>
        </section>
      ):null}
    </main>
  );
}
