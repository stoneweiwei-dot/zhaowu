import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { searchCities } from "@/lib/actions";
import { localizeCityHit } from "@/lib/bazi/cities";
import type { CityHit } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { calculateQizheng } from "@/lib/qizheng/engine";
import { buildQizhengPlainSummary, type QizhengPlainSummary } from "@/lib/qizheng/plain-summary";
import { saveSpecialistHistory } from "@/lib/specialist-history";
import "@/qizheng-home.css";

export const Route = createFileRoute("/qizheng")({ component: QizhengPage });

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
    if (trimmed.length < 2) {
      setHits([]);
      return;
    }
    let alive = true;
    const timer = window.setTimeout(() => {
      void searchCities({ data: trimmed })
        .then((rows) => { if (alive) setHits(rows.map((row) => localizeCityHit(row, locale))); })
        .catch(() => { if (alive) setHits([]); });
    }, 220);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [city, locale, query]);

  return (
    <label className="qz-field qz-city-field">
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
        <div className="qz-city-results" role="listbox">
          {hits.map((hit) => (
            <button type="button" key={hit.latitude + "-" + hit.longitude} onClick={() => { onSelect(hit); setQuery(hit.display); setHits([]); }}>
              <b>{hit.display}</b><small>{hit.timezone}</small>
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}

function QizhengPage() {
  const { locale } = useI18n();
  const copy = locale === "en"
    ? {
        back: "Back to Zhaowu", kicker: "ZHAOWU · SEVEN LUMINARIES", title: "Your Seven Luminaries report",
        lead: "See your temperament, emotional rhythm, action under pressure, relationship values and the pattern that becomes strongest over time.",
        input: "Birth details", year: "Year", month: "Month", day: "Day", hour: "Hour", minute: "Minute",
        city: "Birthplace", cityPh: "Search city", submit: "Generate my report", error: "Check the birth date, time and birthplace.",
        result: "Your personal reading", note: "Traditional interpretation for self-reflection",
        saved: "Saved automatically on this device.", saveFailed: "The report is ready, but this browser blocked local storage.", history: "View my history",
      }
    : locale === "zh-Hans"
      ? {
          back: "返回昭梧", kicker: "昭梧 · 七政四余", title: "你的七政命局报告",
          lead: "专看你的性情底色、情绪节奏、压力反应、关系取向，以及哪一种惯性在命局里被加强。",
          input: "出生资料", year: "年", month: "月", day: "日", hour: "时", minute: "分",
          city: "出生地", cityPh: "搜索城市", submit: "生成我的报告", error: "请检查出生日期、时间和出生地。",
          result: "你的个人报告", note: "传统文化解读，用于自我观察",
          saved: "已自动保存在这台设备。", saveFailed: "报告已生成，但浏览器阻止了本地保存。", history: "查看我的记录",
        }
      : {
          back: "返回昭梧", kicker: "昭梧 · 七政四餘", title: "你的七政命局報告",
          lead: "專看你的性情底色、情緒節奏、壓力反應、關係取向，以及哪一種慣性在命局裡被加強。",
          input: "出生資料", year: "年", month: "月", day: "日", hour: "時", minute: "分",
          city: "出生地", cityPh: "搜尋城市", submit: "生成我的報告", error: "請檢查出生日期、時間和出生地。",
          result: "你的個人報告", note: "傳統文化解讀，用於自我觀察",
          saved: "已自動保存在這台裝置。", saveFailed: "報告已生成，但瀏覽器阻止了本機保存。", history: "查看我的紀錄",
        };

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("0");
  const [city, setCity] = useState<CityHit | null>(null);
  const [report, setReport] = useState<QizhengPlainSummary | null>(null);
  const [historySaved, setHistorySaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      if (!city) throw new Error("city");
      const y = Number(year), m = Number(month), d = Number(day), h = Number(hour), min = Number(minute || 0);
      if (![y, m, d, h, min].every(Number.isFinite)) throw new Error("number");
      const civilCheck = new Date(Date.UTC(y, m - 1, d));
      if (civilCheck.getUTCFullYear() !== y || civilCheck.getUTCMonth() !== m - 1 || civilCheck.getUTCDate() !== d) throw new Error("date");
      const chart = calculateQizheng({ year: y, month: m, day: d, hour: h, minute: min, timezone: city.timezone });
      if (!chart) throw new Error("chart");
      const nextReport = buildQizhengPlainSummary(chart, locale);
      setReport(nextReport);
      const savedEntry = saveSpecialistHistory({
        kind: "qizheng",
        locale,
        sourcePath: "/qizheng",
        title: nextReport.title,
        inputSummary: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} · ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")} · ${localizeCityHit(city, locale).display}`,
        sections: nextReport.sections.map((section) => ({ title: section.title, body: section.body })),
        closing: nextReport.closing,
      });
      setHistorySaved(Boolean(savedEntry));
      window.setTimeout(() => document.getElementById("qizheng-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
    } catch {
      setError(copy.error);
    }
  }

  return (
    <main className="qz-page">
      <div className="qz-topline"><Link to="/" className="qz-back">← {copy.back}</Link><span>{copy.kicker}</span></div>
      <section className="qz-hero">
        <p>{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <div className="qz-hero-mark" aria-hidden><i /><b>曜</b><i /></div>
        <p className="qz-hero-lead">{copy.lead}</p>
      </section>

      <section className="qz-form-card">
        <header><p>ZHAOWU · INPUT</p><h2>{copy.input}</h2></header>
        <form onSubmit={submit}>
          <div className="qz-date-grid">
            {[[copy.year, year, setYear, 1900, 2100], [copy.month, month, setMonth, 1, 12], [copy.day, day, setDay, 1, 31], [copy.hour, hour, setHour, 0, 23], [copy.minute, minute, setMinute, 0, 59]].map(([label, value, setter, min, max]) => (
              <label className="qz-field" key={String(label)}><span>{label as string}</span><input required type="number" inputMode="numeric" min={min as number} max={max as number} value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} /></label>
            ))}
          </div>
          <CityField locale={locale} city={city} onSelect={setCity} label={copy.city} placeholder={copy.cityPh} />
          {error ? <p className="qz-error">{error}</p> : null}
          <button className="qz-submit" type="submit">{copy.submit}<b aria-hidden>→</b></button>
        </form>
      </section>

      {report ? (
        <section id="qizheng-result" className="qz-report">
          <header className="qz-report-heading"><div><p>ZHAOWU · READ</p><h2>{copy.result}</h2></div><span>{copy.note}</span></header>
          <div className="qz-report-paper">
            <div className="qz-report-seal" aria-hidden>曜</div>
            <header><p>{copy.kicker}</p><h3>{report.title}</h3><span>{report.lead}</span></header>
            <div className="qz-report-sections">{report.sections.map((section, index) => (
              <article key={section.key}><i aria-hidden>{String(index + 1).padStart(2, "0")}</i><div><h4>{section.title}</h4><p>{section.body}</p></div></article>
            ))}</div>
            <blockquote>{report.closing}</blockquote>
            <div className="qz-report-history"><span>{historySaved ? copy.saved : copy.saveFailed}</span>{historySaved ? <Link to="/history">{copy.history}<b aria-hidden>→</b></Link> : null}</div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
