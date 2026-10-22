import { useEffect, useMemo, useState } from "react";
import { ReportAccessGate } from "@/components/report-access-gate";
import { D60ReliabilityGate } from "@/components/d60-reliability-gate";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  formatSharedBirthRecord, readSharedBirthRecord, sharedBirthFromUnknown,
  writeSharedBirthRecord, type SharedBirthRecord,
} from "@/lib/shared-birth";
import { localBirthToUtc } from "@/lib/qizheng/engine";
import {
  GRAHAS, TIME_PRECISION_RULES, type TimePrecision,
  type BirthInput, type JyotishChartResult, type ChartPoint,
} from "@/lib/indian-astrology/parashari-engine";
import { calculateJyotishChart } from "@/lib/indian-astrology/parashari-engine";
import { createBrowserJyotishEphemeris } from "@/lib/indian-astrology/browser-ephemeris";
import {
  createParashariReading, findActivePeriods, indianGraha, indianSign,
} from "@/lib/indian-astrology/parashari-report";
import "@/specialist-system.css";

const I18N = {
  "zh-Hant": {
    title: "印度古法占星｜Parashari Jyotish", free: "免費排盤｜恆星黃道", pending: "計算本命盤與歲運中…",
    missing: "請先在首頁填寫生辰，再回到本頁排盤。", edit: "回首頁修改出生資料",
    scope: "採用傳統 Parashari Whole-sign 宮位，預設 Lahiri。行星位置來自本站天文引擎；Lahiri 採本站近似公式、羅睺用月球平均交點。並非 Swiss Ephemeris 校驗版；接近星座、月宿或分盤交界時應複核。",
    check: "時間精度與降級規則", precision: "你的出生時間可信程度",
    seconds: "秒級紀錄（目前表單未提供秒數）", sun: "D-1 本命盤", d12: "D-12 家族分盤", d6: "D-6 日常摩擦分盤",
    sav: "SAV 逐宮 Bindu", dasha: "Vimshottari 三層大運", lord: "十二宮主流向", health: "醫療與家庭安全界線",
    basic: "排盤資料全部免費；付費只解鎖個人白話解讀。", deep: "家族與人生敘事｜付費解讀", 
    unavailable: "不作判定", summary: "直接答案", next: "下一步", script: "家庭劇本底色", evidence: "命理依據", meaning: "白話表現",
    benefit: "有利面", imbalance: "失衡與限制", action: "實際建議", noData: "當前精度無法可靠計算，留白。",
    grace: "不能用星曜診斷疾病、指定父母人格、證明詛咒或保證事件。對應傳統象意，必須經本人真實經驗驗證。",
    storage: "命盤結果僅存本裝置 IndexedDB，不寫入昭梧 Supabase。",
    export: "匯出排盤 JSON", timeUnknown: "出生時間未知", localTime: "出生時間可能跨越日光節約時間邊界，請確認原始出生記錄。",
    noShadbala: "六力 Shadbala／IshtaPhala／KashtaPhala 尚無合格完整計算器，不顯示虛構分數。",
  },
  "zh-Hans": {
    title: "印度古法占星｜Parashari Jyotish", free: "免费排盘｜恒星黄道", pending: "正在计算本命盘与岁运…",
    missing: "请先在首页填写出生资料，再回到本页排盘。", edit: "回首页修改出生资料",
    scope: "采用传统 Parashari Whole-sign 宫位，预设 Lahiri。行星位置来自本站天文引擎；Lahiri 使用本站近似公式、罗睺使用月球平均交点。尚非 Swiss Ephemeris 校验版；临近边界时应复核。",
    check: "时间精度及降级规则", precision: "出生时间可信程度",
    seconds: "秒级记录（当前表单无秒数）", sun: "D-1 本命盘", d12: "D-12 家族分盘", d6: "D-6 日常分盘",
    sav: "SAV 逐宫 Bindu", dasha: "Vimshottari 三层大运", lord: "十二宫主流向", health: "医疗与家庭安全边界",
    basic: "排盘数据全部免费；付费仅解锁个人白话解读。", deep: "家庭与人生叙事｜付费解读",
    unavailable: "不作判定", summary: "直接答案", next: "下一步", script: "家庭剧本底色", evidence: "命理依据", meaning: "白话表现",
    benefit: "有利面", imbalance: "失衡与限制", action: "实际建议", noData: "当前精度无法可靠计算，留白。",
    grace: "不能用星曜诊断疾病、指定父母人格、证明诅咒或保证事件。传统象意需要本人真实经历验证。",
    storage: "命盘结果仅保存于本设备 IndexedDB，不写入昭梧 Supabase。",
    export: "导出排盘 JSON", timeUnknown: "出生时间未知", localTime: "出生时间可能处于夏令时边界，请确认原始记录。",
    noShadbala: "六力 Shadbala／IshtaPhala／KashtaPhala 尚无合格计算器，不显示虚构分数。",
  },
  en: {
    title: "Parashari Jyotish · Indian Astrology", free: "Free sidereal birth chart", pending: "Calculating natal chart and dashas…",
    missing: "Add your birth data on the homepage to calculate this chart.", edit: "Edit birth data",
    scope: "Parashari whole-sign houses; Lahiri default. Geocentric planetary positions use our self-hosted Astronomy Engine; Lahiri follows a project approximation and Rahu is the mean lunar node. Not Swiss-Ephemeris-certified; verify near sign, nakshatra or varga boundaries.",
    check: "Time-precision and downgrade policy", precision: "How accurate is the birth time?",
    seconds: "Recorded seconds (not in the current birth form)", sun: "D1 Natal chart", d12: "D12 Family chart", d6: "D6 Daily friction chart",
    sav: "Sarvashtakavarga by house", dasha: "Three-level Vimshottari Dasha", lord: "Twelfth-house lord", health: "Health and family interpretation boundary",
    basic: "Calculated data are free. Payment only unlocks the narrative interpretation.", deep: "Personal family and life report",
    unavailable: "Withheld", summary: "Direct answer", next: "Next action", script: "Family script", evidence: "Chart evidence", meaning: "Plain-language meaning",
    benefit: "Constructive use", imbalance: "Limits and risks", action: "Action to consider", noData: "Unstable at the selected time precision; left blank.",
    grace: "Astrology does not diagnose illness, determine parental personalities, prove curses or guarantee life events. Validate symbolic themes with actual experience.",
    storage: "Charts remain in this device's IndexedDB; no chart write to owner Supabase.",
    export: "Export chart JSON", timeUnknown: "Birth time unknown", localTime: "Birth time may be close to a DST transition; verify the original record.",
    noShadbala: "Complete Shadbala / IshtaPhala / KashtaPhala calculation is not available. No invented values.",
  },
} as const;

const selectValues: readonly TimePrecision[] = ["minute", "five_minutes", "fifteen_minutes", "two_hours", "unknown"];
const precisionEnglishDetail: Record<TimePrecision, string> = {
  second: "Second-level precision; D60 still requires an independent verified calculator.",
  minute: "Minute-level precision; D60 requires a ±2-minute stability check.",
  five_minutes: "Approximate five-minute record: rising degrees, houses and divisional signs may shift.",
  fifteen_minutes: "Approximate fifteen-minute record: Lagna, house boundaries and nakshatra can change.",
  two_hours: "Only stable planetary signs: Lagna, vargas, SAV and dasha are withheld.",
  unknown: "Only stable planetary signs across the local civil day are shown.",
};
const precisionExplanation = (precision: TimePrecision, locale: Locale) =>
  locale === "en" ? precisionEnglishDetail[precision] : TIME_PRECISION_RULES[precision].detail;

const precisionEnglish: Record<TimePrecision, string> = {
  second: "Recorded second", minute: "Recorded minute", five_minutes: "Within 5 minutes",
  fifteen_minutes: "Within 15 minutes", two_hours: "Within 2 hours", unknown: "Unknown",
};

function t(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function utcBirthInput(birth: SharedBirthRecord, precision: TimePrecision): BirthInput {
  const base = { latitude: birth.city.latitude, longitude: birth.city.longitude, precision, ayanamsa: "lahiri" as const };
  const timezone = birth.city.timezone;
  if (precision === "unknown" || birth.timeUnknown) {
    const first = localBirthToUtc({ year: birth.year, month: birth.month, day: birth.day, hour: 0, minute: 0, timezone });
    const next = new Date(Date.UTC(birth.year, birth.month - 1, birth.day + 1));
    const last = localBirthToUtc({ year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate(), hour: 0, minute: 0, timezone });
    return {
      ...base, precision: "unknown", birthLocalDate: [
        birth.year, String(birth.month).padStart(2, "0"), String(birth.day).padStart(2, "0"),
      ].join("-"), unknownLocalDayUtc: { startUtc: first.toISOString(), endUtc: last.toISOString() },
    };
  }
  const date = localBirthToUtc({
    year: birth.year, month: birth.month, day: birth.day, hour: birth.hour,
    minute: birth.minute, timezone,
  });
  const fields = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const parts = Object.fromEntries(fields.map(x => [x.type, x.value]));
  if (Number(parts.year) !== birth.year || Number(parts.month) !== birth.month ||
      Number(parts.day) !== birth.day || Number(parts.hour) !== birth.hour ||
      Number(parts.minute) !== birth.minute) {
    throw new Error("DST_LOCAL_TIME_UNRESOLVED");
  }
  return { ...base, birthUtc: date.toISOString() };
}

function persistChart(chart: JyotishChartResult) {
  if (typeof indexedDB === "undefined") return;
  try {
    const req = indexedDB.open("zhaowu.indian-astrology.v1", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("charts")) db.createObjectStore("charts");
    };
    req.onsuccess = () => {
      try {
        const db = req.result;
        const tx = db.transaction("charts", "readwrite");
        tx.objectStore("charts").put(chart, "last-chart");
        tx.oncomplete = () => db.close();
        tx.onerror = () => db.close();
      } catch { req.result.close(); }
    };
  } catch { /* storage is optional */ }
}

function exportChart(chart: JyotishChartResult) {
  const data = new Blob([JSON.stringify({ schema: "zhaowu.indian-astrology.v1", chart }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "zhaowu-jyotish-chart.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ChartArea({ chart, locale }: { chart: JyotishChartResult; locale: Locale }) {
  const copy = I18N[locale];
  const d1 = chart.d1;
  const showPoints: Array<readonly [string, ChartPoint]> = d1 ? ([
    ["Lagna", d1.lagna],
    ...GRAHAS.map(p => [p, d1.planets[p]] as const),
  ]) : [];
  const active = findActivePeriods(chart);
  return (
    <section className="space-y-4" data-indian-free-chart>
      <div className="rounded-xl border border-line bg-paper/80 p-4">
        <h2 className="font-display text-lg text-ink">{copy.sun}</h2>
        {d1 && d1.lagna.sign != null ? (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2" data-indian-d1>
            {showPoints.map(([key, point]) => (
              <div key={key} className="rounded-lg border border-line/60 px-3 py-2 text-sm">
                <strong>{key === "Lagna" ? "Lagna" : indianGraha(key as typeof GRAHAS[number], locale)}</strong>
                <span className="ml-2">{indianSign(point.sign, locale)}</span>
                <span className="ml-2 text-ink-soft">{point.degreeInSign == null ? "—" : `${point.degreeInSign.toFixed(2)}°`}</span>
                {point.house ? <span className="ml-2">H{point.house}</span> : null}
                <p className="mt-1 text-xs text-ink-soft">{point.nakshatra ? `${point.nakshatra.name} · Pada ${point.nakshatra.pada}` : "Nakshatra —"}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-sm leading-7 text-ink-soft">
            <p>{chart.moduleStatus.D1.reason}</p>
            {GRAHAS.map(p => <p key={p}>{indianGraha(p,locale)} · {indianSign(chart.planetsBySign[p], locale)}</p>)}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(["d12","d6"] as const).map((name) => {
          const varga = chart[name];
          return <section key={name} className="rounded-xl border border-line bg-paper/80 p-4" data-indian-varga={name}>
            <h2 className="font-display text-lg text-ink">{name === "d12" ? copy.d12 : copy.d6}</h2>
            {varga ? <div className="mt-2 text-sm leading-7">
              <p>Lagna · {indianSign(varga.lagna, locale)}</p>
              {GRAHAS.map(g => <p key={g}>{indianGraha(g,locale)} · {indianSign(varga.planets[g], locale)}</p>)}
            </div> : <p className="mt-2 text-sm text-ink-soft">{chart.moduleStatus[name === "d12" ? "D12" : "D6"].reason}</p>}
          </section>;
        })}
      </div>
      <section className="rounded-xl border border-line bg-paper/80 p-4">
        <h2 className="font-display text-lg text-ink">{copy.sav}</h2>
        {chart.sav ? <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" data-indian-sav>
          {chart.sav.byHouse.map((v,i) => <div key={i} className="rounded-lg border border-line/60 p-2 text-center text-sm">
            <div className="text-xs text-ink-soft">H{i+1}</div><strong>{v}</strong>
          </div>)}
          <p className="col-span-3 text-xs text-ink-soft sm:col-span-4">337 Bindu · Unrectified</p>
        </div> : <p className="mt-2 text-sm text-ink-soft">{chart.moduleStatus.SAV.reason}</p>}
      </section>
      <section className="rounded-xl border border-line bg-paper/80 p-4" data-indian-dasha>
        <h2 className="font-display text-lg text-ink">{copy.dasha}</h2>
        {active.length ? <div className="mt-3 space-y-2">
          {active.map(period => <p className="text-sm" key={period.level}>
            <strong>{period.level.toUpperCase()} · {indianGraha(period.lord, locale)}</strong>
            <span className="block text-xs text-ink-soft">{period.startMonth ?? period.startRangeUtc[0].slice(0,7)+"~"}
              {" → "}{period.endMonth ?? period.endRangeUtc[1].slice(0,7)+"~"} · {period.monthStable ? "month stable" : "date range uncertain"}</span>
          </p>)}
          <p className="text-xs text-ink-soft">{t(locale,"大運採 365.25 日年制，年月穩定性取決於出生時間精度。","大运采用 365.25 日年制，年月稳定性取决于出生时间精度。","Dasha year = 365.25 days; month dates depend on time reliability.")}</p>
        </div> : <p className="mt-2 text-sm text-ink-soft">{chart.moduleStatus.Dasha.reason}</p>}
      </section>
      <p className="text-sm text-ink-soft">{copy.noShadbala}</p>
    </section>
  );
}

function ReadingContent({ chart, locale }: { chart: JyotishChartResult; locale: Locale }) {
  const report = useMemo(() => createParashariReading(chart, locale), [chart, locale]);
  const copy = I18N[locale];
  return <div className="mt-5 space-y-5" data-indian-full-report>
    <h2 className="font-display text-xl text-ink">{copy.deep}</h2>
    {report.units.map(unit => <article key={unit.title} className="rounded-xl border border-line bg-paper/80 p-4">
      <h3 className="font-display text-lg text-ink">{unit.title}</h3>
      <dl className="mt-3 space-y-3 text-sm leading-7">
        {([
          [copy.evidence, unit.evidence],
          [copy.meaning, unit.meaning],
          [copy.benefit, unit.benefit],
          [copy.imbalance, unit.imbalance],
          [copy.action, unit.action],
        ] as const).map(([label, value]) => <div key={label}><dt className="font-semibold text-ink">{label}</dt><dd className="text-ink-soft">{value}</dd></div>)}
      </dl>
    </article>)}
    <p className="text-xs leading-6 text-ink-soft">{copy.grace}</p>
  </div>;
}

export function IndianAstrologyPage() {
  const { locale } = useI18n();
  const copy = I18N[locale];
  const { user } = useCurrentUserState();
  const [birth, setBirth] = useState<SharedBirthRecord | null>(() => readSharedBirthRecord());
  const [precision, setPrecision] = useState<TimePrecision>("fifteen_minutes");
  const [chart, setChart] = useState<JyotishChartResult | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const fromServer = sharedBirthFromUnknown(user?.birthData);
    const next = fromServer ?? readSharedBirthRecord();
    setBirth(next);
    if (fromServer) writeSharedBirthRecord(fromServer);
  }, [user?.id, user?.birthData]);
  const effectivePrecision = birth?.timeUnknown ? "unknown" : precision;

  useEffect(() => {
    let cancelled = false;
    if (!birth) { setChart(null); return; }
    setRunning(true); setError(""); setChart(null);
    void (async () => {
      const ephemeris = await createBrowserJyotishEphemeris();
      const input = utcBirthInput(birth, effectivePrecision);
      const computed = await calculateJyotishChart(input, ephemeris);
      if (cancelled) return;
      setChart(computed);
      persistChart(computed);
    })().catch((e: unknown) => {
      if (cancelled) return;
      setError(e instanceof Error && e.message === "DST_LOCAL_TIME_UNRESOLVED"
        ? copy.localTime : e instanceof Error ? e.message : "Astronomical calculation unavailable");
    }).finally(() => { if (!cancelled) setRunning(false); });
    return () => { cancelled = true; };
  }, [birth, effectivePrecision, copy.localTime]);

  const report = useMemo(() => chart ? createParashariReading(chart, locale) : null, [chart, locale]);
  const d60Birth = birth && !birth.timeUnknown && effectivePrecision === "minute"
    ? { year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute, city: birth.city }
    : null;

  return <main className="zhaowu-specialist-page" data-specialist-report="indian">
    <section className="zhaowu-specialist-sheet">
      <header className="zhaowu-specialist-hero">
        <p className="zhaowu-specialist-kicker">INDEPENDENT PARASHARI JYOTISH</p>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.scope}</p>
      </header>
      {birth ? <div className="zhaowu-specialist-birth"><span>{copy.free}</span>
        <strong>{formatSharedBirthRecord(birth, locale)}</strong></div> : <p className="zhaowu-specialist-warning">{copy.missing}</p>}
      <p><a href="/#bazi" className="underline">{copy.edit}</a></p>
      {birth ? <>
        <section className="my-4 rounded-xl border border-line bg-paper/80 p-4" data-indian-time-notice>
          <h2 className="font-display text-lg text-ink">{copy.check}</h2>
          <label className="mt-3 block text-sm font-semibold text-ink" htmlFor="indian-precision">{copy.precision}</label>
          <select id="indian-precision" className="mt-2 w-full rounded-lg border border-line bg-paper p-3 text-ink" value={effectivePrecision}
            disabled={birth.timeUnknown} onChange={e => setPrecision(e.target.value as TimePrecision)}>
            {selectValues.map(key => <option key={key} value={key}>{locale === "en" ? precisionEnglish[key] : TIME_PRECISION_RULES[key].label}</option>)}
          </select>
          {birth.timeUnknown ? <p className="mt-2 text-sm text-ink-soft">{copy.timeUnknown}</p> : null}
          <p className="mt-3 text-sm leading-7 text-ink-soft">{precisionExplanation(effectivePrecision, locale)}</p>
          <details className="mt-2 text-xs leading-6 text-ink-soft"><summary>{copy.check}</summary>
            <ul className="mt-2 list-disc pl-5">{Object.entries(TIME_PRECISION_RULES).map(([key,v]) =>
              <li key={key}>{locale === "en" ? precisionEnglish[key as TimePrecision] : v.label} · {v.reliability} · {precisionExplanation(key as TimePrecision, locale)}</li>)}</ul>
          </details>
          <p className="mt-2 text-xs text-ink-soft">Ayanamsa: Lahiri (project approximation). Raman / KP: {copy.unavailable}.</p>
        </section>
        {running ? <p role="status" aria-live="polite">{copy.pending}</p> : null}
        {error ? <p className="zhaowu-specialist-warning" role="alert">{error}</p> : null}
        {chart ? <>
          <p className="my-3 text-sm leading-7 text-ink-soft">{copy.basic} {copy.storage}</p>
          <p className="text-xs text-ink-soft">Reliability: {chart.reliability} · {chart.provenance}</p>
          <ChartArea chart={chart} locale={locale}/>
          <section className="my-5 rounded-xl border border-line bg-paper/80 p-4" data-indian-quick-report>
            <h2 className="font-display text-xl text-ink">{copy.summary}</h2>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{report?.directAnswer}</p>
            <h3 className="mt-3 font-semibold text-ink">{copy.next}</h3>
            <p className="text-sm leading-7 text-ink-soft">{report?.nextStep}</p>
            <h3 className="mt-3 font-semibold text-ink">{copy.script}</h3>
            <p className="text-sm leading-7 text-ink-soft">{report?.scriptTone}</p>
          </section>
          <button type="button" className="my-4 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink" onClick={() => exportChart(chart)}>{copy.export}</button>
          <ReportAccessGate system="indian" locale={locale} birth={birth} preview={report?.directAnswer}
            poeticContext={report?.directAnswer && report?.nextStep ? { conclusion: report.directAnswer, action: report.nextStep } : undefined}
            quick={<D60ReliabilityGate depth="quick" reportBirth={d60Birth}/>} 
            full={<>
              <ReadingContent chart={chart} locale={locale}/>
              <div className="mt-6"><D60ReliabilityGate reportBirth={d60Birth}/></div>
            </>}
          />
        </> : null}
      </> : null}
    </section>
  </main>;
}
