import { useEffect, useMemo, useState, type FormEvent } from "react";
import { analyzeLife } from "@/lib/actions";
import type { AnalyzeInput, CityHit } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createEngineReportRecord, updateBirthData } from "@/lib/supabase-rest";
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

      if (session) {
        const { question: _question, ...birthData } = payload;

        // Free text delivery never waits for cloud persistence. Mark a report as saved
        // only after the engine snapshot POST has actually succeeded.
        void createEngineReportRecord({ session, profile, result })
          .then((row) => setSavedId(row?.id ?? result.id))
          .catch(() => undefined);

        // Birth-profile persistence is independent of the report write. A failed
        // report sync must not prevent the remembered profile from refreshing.
        void updateBirthData(session, birthData as unknown as Record<string, unknown>)
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
                    {[
                      { id: "birth-year", label: t("year"), value: year, set: setYear, min: 1900, max: 2100 },
                      { id: "birth-month", label: t("month"), value: month, set: setMonth, min: 1, max: 12 },
                      { id: "birth-day", label: t("day"), value: day, set: setDay, min: 1, max: 31 },
                    ].map((f) => (
                      <label htmlFor={f.id} key={f.id} className="text-sm text-ink-soft">
                        <span className="mb-2 block">{f.label}</span>
                        <input id={f.id} type="number" inputMode="numeric" min={f.min} max={f.max} required value={f.value} onChange={(e) => f.set(e.target.value)} className="h-12 w-full rounded-md border border-line bg-cream px-3 text-base outline-none focus:border-cinnabar" />
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 rounded-lg border border-line bg-paper/45 p-4">
                    <div className="grid gap-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
                      <p className="text-sm text-ink-soft">{t("time")}</p>
                      <label htmlFor="time-unknown" className="flex min-h-11 items-center gap-2 text-xs leading-5 text-ink-mute">
                        <input id="time-unknown" aria-describedby="time-importance" type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
                        {t("timeUnknown")}
                      </label>
                    </div>
                    <p id="time-importance" className="zhaowu-time-warning">{UNKNOWN_TIME_COPY[locale]}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <input id="birth-hour" aria-label={t("hourPh")} type="number" inputMode="numeric" min={0} max={23} required={!timeUnknown} disabled={timeUnknown} value={hour} placeholder={t("hourPh")} onChange={(e) => setHour(e.target.value)} className="h-12 min-w-0 rounded-md border border-line bg-cream px-3 text-base outline-none disabled:opacity-40 focus:border-cinnabar" />
                      <input id="birth-minute" aria-label={t("minutePh")} type="number" inputMode="numeric" min={0} max={59} disabled={timeUnknown} value={minute} placeholder={t("minutePh")} onChange={(e) => setMinute(e.target.value)} className="h-12 min-w-0 rounded-md border border-line bg-cream px-3 text-base outline-none disabled:opacity-40 focus:border-cinnabar" />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label htmlFor="birth-gender" className="text-sm text-ink-soft">
                      <span className="mb-2 block">{t("gender")}</span>
                      <select id="birth-gender" value={gender} onChange={(e) => setGender(e.target.value as AnalyzeInput["gender"])} className="h-12 w-full rounded-md border border-line bg-cream px-3 text-base outline-none focus:border-cinnabar">
                        <option value="unspecified">{t("unset")}</option>
                        <option value="male">{t("male")}</option>
                        <option value="female">{t("female")}</option>
                      </select>
                    </label>
                    <label htmlFor="relationship-preference" className="text-sm text-ink-soft">
                      <span className="mb-2 block">{t("relation")}</span>
                      <select id="relationship-preference" value={relation} onChange={(e) => setRelation(e.target.value as AnalyzeInput["relation"])} className="h-12 w-full rounded-md border border-line bg-cream px-3 text-base outline-none focus:border-cinnabar">
                        <option value="unset">{t("unset")}</option>
                        <option value="any">{t("relAny")}</option>
                        <option value="hetero">{t("relHet")}</option>
                        <option value="same">{t("relSame")}</option>
                      </select>
                      <span className="mt-1 block text-xs leading-5 text-ink-mute">{t("relHint")}</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          <div className={compact ? "zhaowu-analysis-cities grid gap-4" : "space-y-6"}>
            <CityPicker id="birth-city" label={t("city")} placeholder={t("cityPh")} optionalLabel={t("optional")} popularLabel={t("popularCities")} locale={locale} value={birthCity} onSelect={setBirthCity} />
            <CityPicker id="current-city" label={t("liveCity")} placeholder={t("liveCity")} optional optionalLabel={t("optional")} popularLabel={t("popularCities")} locale={locale} value={liveCity} onSelect={setLiveCity} />
            {!compact ? <p className="-mt-4 text-xs leading-5 text-ink-mute">{t("liveHint")}</p> : null}
          </div>

          {error ? (
            <p role="alert" className="rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm leading-6 text-cinnabar-deep">
              {error}
            </p>
          ) : null}

          {!compact ? (
            <button type="submit" disabled={busy} className="h-12 w-full rounded-full bg-cinnabar px-6 text-base font-medium text-cream disabled:opacity-55">
              {busy ? (locale === "en" ? "Reading your paper…" : locale === "zh-Hans" ? "正在阅卷…" : "正在閱卷…") : locale === "en" ? "Hand in the paper" : "交卷，看答案"}
            </button>
          ) : null}
        </form>
      </section>
      {!current && previewChart ? <BaziChart chart={previewChart} /> : null}
    </>
  );
}