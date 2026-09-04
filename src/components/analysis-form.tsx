import { useEffect, useMemo, useState, type FormEvent } from "react";
import { analyzeLife } from "@/lib/actions";
import type { AnalyzeInput, CityHit } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createEngineReportRecord, restoreSession, updateBirthData } from "@/lib/supabase-rest";
import { buildChart } from "@/lib/bazi/chart";
import { UNKNOWN_TIME_COPY } from "@/lib/bazi/presentation";
import { BaziChart } from "@/components/bazi-chart";
import { CityPicker } from "@/components/city-picker";

function asCity(value: unknown): CityHit | null {
  if (!value || typeof value !== "object") return null;
  const c = value as Partial<CityHit>;
  if (typeof c.display !== "string" || typeof c.name !== "string" || typeof c.timezone !== "string") return null;
  if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude)) return null;
  return c as CityHit;
}

export function AnalysisForm() {
  const { t, locale } = useI18n();
  const { user, profile, session } = useCurrentUserState();
  const setCurrent = useAppStore((s) => s.setCurrent);
  const setSavedId = useAppStore((s) => s.setSavedId);
  const reset = useAppStore((s) => s.reset);
  const current = useAppStore((s) => s.current);
  const [question, setQuestion] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [gender, setGender] = useState<AnalyzeInput["gender"]>("unspecified");
  const [relation, setRelation] = useState<AnalyzeInput["relation"]>("unset");
  const [birthCity, setBirthCity] = useState<CityHit | null>(null);
  const [liveCity, setLiveCity] = useState<CityHit | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remembered, setRemembered] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const compact = Boolean(current) && !detailsOpen;
  const compactCopy =
    locale === "en"
      ? { adjust: "Edit details", solar: "True solar time applied", zi: "Day changes at midnight" }
      : locale === "zh-Hans"
        ? { adjust: "调整资料", solar: "已套用真太阳时校正", zi: "子时不换日（以午夜为界）" }
        : { adjust: "調整資料", solar: "已套用真太陽時校正", zi: "子時不換日（以午夜為界）" };

  useEffect(() => {
    reset();
    const clear = () => reset();
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, [reset]);

  useEffect(() => {
    const raw = user?.birthData;
    if (!raw) return;
    const b = raw as Record<string, unknown>;
    setYear(b.year != null ? String(b.year) : "");
    setMonth(b.month != null ? String(b.month) : "");
    setDay(b.day != null ? String(b.day) : "");
    setHour(b.hour != null ? String(b.hour) : "");
    setMinute(b.minute != null ? String(b.minute) : "");
    setTimeUnknown(Boolean(b.timeUnknown));
    if (b.gender === "male" || b.gender === "female" || b.gender === "unspecified") setGender(b.gender);
    if (b.relation === "any" || b.relation === "hetero" || b.relation === "same" || b.relation === "unset") setRelation(b.relation);
    const bc = asCity(b.city);
    const lc = asCity(b.liveCity);
    if (bc) setBirthCity(bc);
    setLiveCity(lc);
    setRemembered(true);
  }, [user?.id, user?.birthData]);

  useEffect(() => {
    setDetailsOpen(!current);
  }, [current?.id]);

  const previewChart = useMemo(() => {
    if (current || !birthCity || !year || !month || !day || (!timeUnknown && !hour)) return null;
    const y = Number(year), m = Number(month), d = Number(day), h = Number(hour), min = Number(minute || 0);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (y < 1900 || y > 2100 || date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d || !Number.isInteger(h) || !Number.isInteger(min) || (!timeUnknown && (h < 0 || h > 23 || min < 0 || min > 59))) return null;
    try {
      return buildChart({ question, locale, year: y, month: m, day: d, hour: timeUnknown ? 12 : h, minute: timeUnknown ? 0 : min, timeUnknown, gender, relation, city: birthCity, liveCity, ziPolicy: "midnight", useTrueSolar: true });
    } catch {
      return null;
    }
  }, [current, birthCity, year, month, day, hour, minute, timeUnknown, gender, relation, liveCity, locale, question]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!birthCity) {
      setError(t("errCity"));
      return;
    }
    if (!question.trim()) {
      setError(t("errQuestion"));
      return;
    }
    setBusy(true);
    try {
      const payload: AnalyzeInput = {
        question: question.trim(),
        locale,
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: timeUnknown ? 12 : Number(hour),
        minute: timeUnknown ? 0 : Number(minute || 0),
        timeUnknown,
        gender,
        relation,
        city: birthCity,
        liveCity,
        ziPolicy: "midnight",
        useTrueSolar: true,
      };
      const result = await analyzeLife({ data: payload });
      setCurrent(result);

      // Auth bootstrap is deliberately non-blocking. A returning member can submit
      // before React has copied a still-valid stored session into context, so read
      // that same session once here rather than silently dropping the cloud save.
      const persistenceSession = session ?? await restoreSession();
      if (persistenceSession) {
        const { question: _question, ...birthData } = payload;

        // Free text delivery never waits for cloud persistence. Mark a report as saved
        // only after the engine snapshot POST has actually succeeded.
        void createEngineReportRecord({ session: persistenceSession, profile, result })
          .then((row) => setSavedId(row?.id ?? result.id))
          .catch(() => undefined);

        // Birth-profile persistence is independent of the report write. A failed
        // report sync must not prevent the remembered profile from refreshing.
        void updateBirthData(persistenceSession, birthData as unknown as Record<string, unknown>)
          .then(() => {
            window.dispatchEvent(new Event("zhaowu-auth-change"));
            setRemembered(true);
          })
          .catch(() => undefined);
      }

      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    } catch (err) {
      setError(locale === "en" ? t("errAnalyze") : err instanceof Error ? err.message : t("errAnalyze"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section id="analysisForm" className={`zhaowu-quiz-sheet seal-border rounded-xl bg-cream/95 p-5 sm:p-7 ${compact ? "is-compact" : ""}`}>
        <div className="zhaowu-analysis-heading">
          <div>
            {!compact ? (
              <p className="zhaowu-quiz-kicker text-xs tracking-[0.24em] text-cinnabar">
                ZHAOWU · {locale === "en" ? "LIFE PAPER" : locale === "zh-Hans" ? "人生试卷" : "人生試卷"}
              </p>
            ) : null}
            <h2 className={`${compact ? "" : "mt-2"} font-display text-2xl sm:text-3xl`}>{t("formTitle")}</h2>
          </div>
          {compact ? (
            <button type="button" className="zhaowu-analysis-edit" onClick={() => setDetailsOpen(true)}>
              <span aria-hidden>◎</span>
              {compactCopy.adjust}
            </button>
          ) : null}
        </div>

        {!compact ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">
            {locale === "en"
              ? "Write the question you actually want answered, then add birth details. You get the answer first; the full report comes after."
              : locale === "zh-Hans"
                ? "把真正想问的事直接写下，再填出生资料。交卷后先给答案，再生成完整报告。"
                : "把真正想問的事直接寫下，再填出生資料。交卷後先給答案，再生成完整報告。"}
          </p>
        ) : null}
        {!compact && remembered ? <p className="mt-2 text-xs text-wood">{t("remembered")}</p> : null}

        {compact ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink-mute" aria-label={locale === "en" ? "Calculation policy" : "排盤規則"}>
            <span className="rounded-full border border-line bg-paper/55 px-3 py-1.5">{compactCopy.solar}</span>
            <span className="rounded-full border border-line bg-paper/55 px-3 py-1.5">{compactCopy.zi}</span>
          </div>
        ) : null}

        <form className={compact ? "zhaowu-analysis-compact-form mt-4" : "mt-6 space-y-6"} onSubmit={(e) => void submit(e)}>
          {!compact ? (
            <>
              <div className="zhaowu-quiz-block">
                <label htmlFor="analysis-question" className="zhaowu-quiz-legend mb-2 block">
                  <em>01</em>
                  {t("question")}
                </label>
                <textarea id="analysis-question" value={question} maxLength={400} rows={3} required placeholder={t("qPh")} className="w-full resize-y rounded-md border border-line bg-cream px-4 py-3 text-base leading-7 outline-none transition focus:border-cinnabar" onChange={(e) => setQuestion(e.target.value)} />
                <p className="mt-1 text-right text-xs text-ink-mute">{question.length}/400</p>
              </div>

              <div className="zhaowu-analysis-core zhaowu-quiz-paper space-y-6">
                <div className="zhaowu-quiz-block">
                  <p className="zhaowu-quiz-legend">
                    <em>02</em>
                    {locale === "en" ? "Birth details for the chart" : locale === "zh-Hans" ? "排盘用的出生资料" : "排盤用的出生資料"}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {["year", "month", "day"].map((k) => {
                      const value = k === "year" ? year : k === "month" ? month : day;
                      const set = k === "year" ? setYear : k === "month" ? setMonth : setDay;
                      const label = t(k);
                      const ph = k === "year" ? "1988" : k === "month" ? "10" : "04";
                      const id = `birth-${k}`;
                      return <label key={k} className="block"><span className="mb-2 block text-sm text-ink-soft">{label}</span><input id={id} value={value} required inputMode="numeric" placeholder={ph} className="w-full rounded-md border border-line bg-cream px-3 py-3 text-base outline-none focus:border-cinnabar" onChange={(e) => set(e.target.value.replace(/\D/g, "").slice(0, 4))} /></label>;
                    })}
                  </div>
                  {!timeUnknown ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label><span className="mb-2 block text-sm text-ink-soft">{t("hour")}</span><input id="birth-hour" value={hour} required inputMode="numeric" placeholder="04" className="w-full rounded-md border border-line bg-cream px-3 py-3 text-base outline-none focus:border-cinnabar" onChange={(e) => setHour(e.target.value.replace(/\D/g, "").slice(0, 2))} /></label>
                      <label><span className="mb-2 block text-sm text-ink-soft">{t("minute")}</span><input id="birth-minute" value={minute} required inputMode="numeric" placeholder="40" className="w-full rounded-md border border-line bg-cream px-3 py-3 text-base outline-none focus:border-cinnabar" onChange={(e) => setMinute(e.target.value.replace(/\D/g, "").slice(0, 2))} /></label>
                    </div>
                  ) : null}
                  <label className="mt-3 flex items-start gap-3 rounded-md border border-line bg-paper/55 px-3 py-3 text-sm text-ink-soft"><input type="checkbox" checked={timeUnknown} className="mt-0.5" onChange={(e) => setTimeUnknown(e.target.checked)} /><span><strong className="block text-ink">{t("timeUnknown")}</strong><span className="mt-1 block text-xs leading-5 text-ink-mute">{UNKNOWN_TIME_COPY[locale]}</span></span></label>
                </div>

                <div className="zhaowu-quiz-block">
                  <p className="zhaowu-quiz-legend"><em>03</em>{t("birthCity")}</p>
                  <CityPicker id="birth-city" value={birthCity} onChange={setBirthCity} placeholder={t("birthCityPh")} />
                </div>

                <div className="zhaowu-quiz-block">
                  <p className="zhaowu-quiz-legend"><em>04</em>{t("gender")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["male", "female", "unspecified"] as const).map((value) => <button key={value} type="button" aria-pressed={gender === value} onClick={() => setGender(value)} className={`min-h-11 rounded-full border px-3 text-sm ${gender === value ? "border-wood bg-wood text-cream" : "border-line bg-cream text-ink-soft"}`}>{t(value)}</button>)}
                  </div>
                </div>

                <div className="zhaowu-quiz-block">
                  <p className="zhaowu-quiz-legend"><em>05</em>{t("relation")}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(["unset", "any", "hetero", "same"] as const).map((value) => <button key={value} type="button" aria-pressed={relation === value} onClick={() => setRelation(value)} className={`min-h-11 rounded-full border px-3 text-sm ${relation === value ? "border-wood bg-wood text-cream" : "border-line bg-cream text-ink-soft"}`}>{t(`relation_${value}`)}</button>)}
                  </div>
                </div>

                <div className="zhaowu-quiz-block">
                  <p className="zhaowu-quiz-legend"><em>06</em>{t("liveCity")}</p>
                  <CityPicker id="live-city" value={liveCity} onChange={setLiveCity} placeholder={t("liveCityPh")} optional />
                </div>
              </div>
            </>
          ) : null}

          <button type="submit" disabled={busy} className="zhaowu-quiz-submit w-full rounded-full bg-wood px-5 py-3 text-base font-semibold text-cream transition hover:bg-wood-light disabled:opacity-50">
            {busy ? t("processing") : current ? t("reanalyze") : t("submit")}
          </button>
        </form>
      </section>

      {previewChart && !current ? <BaziChart chart={previewChart} locale={locale} /> : null}
    </>
  );
}
