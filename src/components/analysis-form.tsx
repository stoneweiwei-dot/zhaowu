import { useEffect, useMemo, useState, type FormEvent } from "react";
import { analyzeLife } from "@/lib/actions";
import type { AnalyzeInput, CityHit } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createEngineReportRecord, updateBirthData } from "@/lib/supabase-rest";
import { buildChart } from "@/lib/bazi/chart";
import { UNKNOWN_TIME_COPY } from "@/lib/bazi/presentation";
import {
  formatSharedBirthRecord,
  readSharedBirthRecord,
  sharedBirthFromUnknown,
  writeSharedBirthRecord,
  type SharedBirthRecord,
} from "@/lib/shared-birth";
import { BaziChart } from "@/components/bazi-chart";
import { CityPicker } from "@/components/city-picker";

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
  const [rememberedRecord, setRememberedRecord] = useState<SharedBirthRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const copy = locale === "en"
    ? {
        questionKicker: "ZHAOWU · BAZI DECISION ANALYSIS",
        questionTitle: "Ask the question that actually matters.",
        questionLead: "Zhaowu uses BaZi as the primary system: first a direct answer, then your chart structure and timing. Enter your birth record once, then ask what you actually need to decide.",
        promiseLabel: "What Zhaowu gives you",
        promise: ["Direct answer first", "BaZi structure", "Timing & decision rhythm"],
        baziKicker: "ZHAOWU · FOUR PILLARS",
        baziTitle: "Four Pillars of Destiny",
        baziLead: "Enter birth details once. Zhaowu reuses this same record for other birth-based systems, so you do not have to type it again.",
        birthReady: "Birth record saved",
        birthReadyLead: "This record will be reused across Zhaowu. Edit it only when the birth details themselves need changing.",
        edit: "Edit birth record",
        useRecord: "Using this birth record",
        submit: "Start BaZi analysis · See answer",
        busy: "Analysing…",
        birthData: "Birth record",
      }
    : locale === "zh-Hans"
      ? {
          questionKicker: "昭梧 · 子平八字命理分析",
          questionTitle: "把你真正想问的事，直接拿来分析",
          questionLead: "昭梧以子平四柱为主判：先回答你真正的问题，再展开命局结构与大运节奏。生辰只填一次，之后直接问事。",
          promiseLabel: "你会得到",
          promise: ["问题直答", "命局结构", "大运节奏"],
          baziKicker: "昭梧 · 子平四柱",
          baziTitle: "四柱八字",
          baziLead: "出生资料只填一次。昭梧会把同一份生辰资料沿用到其他需要排盘的系统，不再每个页面重新问你一遍。",
          birthReady: "出生资料已记住",
          birthReadyLead: "之后其他命理分区直接使用这份资料；只有出生资料本身要改时才需要编辑。",
          edit: "修改出生资料",
          useRecord: "正在使用这份出生资料",
          submit: "开始命理分析 · 看答案",
          busy: "正在推演…",
          birthData: "出生资料",
        }
      : {
          questionKicker: "昭梧 · 子平八字命理分析",
          questionTitle: "把你真正想問的事，直接拿來分析",
          questionLead: "昭梧以子平四柱為主判：先回答你真正的問題，再展開命局結構與大運節奏。生辰只填一次，之後直接問事。",
          promiseLabel: "你會得到",
          promise: ["問題直答", "命局結構", "大運節奏"],
          baziKicker: "昭梧 · 子平四柱",
          baziTitle: "四柱八字",
          baziLead: "出生資料只填一次。昭梧會把同一份生辰資料沿用到其他需要排盤的系統，不再每個頁面重新問你一遍。",
          birthReady: "出生資料已記住",
          birthReadyLead: "之後其他命理分區直接使用這份資料；只有出生資料本身要改時才需要編輯。",
          edit: "修改出生資料",
          useRecord: "正在使用這份出生資料",
          submit: "開始命理分析 · 看答案",
          busy: "正在推演…",
          birthData: "出生資料",
        };

  function applyBirth(record: SharedBirthRecord) {
    setYear(String(record.year));
    setMonth(String(record.month));
    setDay(String(record.day));
    setHour(record.timeUnknown ? "" : String(record.hour));
    setMinute(record.timeUnknown ? "" : String(record.minute));
    setTimeUnknown(record.timeUnknown);
    setGender(record.gender);
    setRelation(record.relation);
    setBirthCity(record.city);
    setLiveCity(record.liveCity ?? null);
  }

  useEffect(() => {
    reset();
    const clear = () => reset();
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, [reset]);

  useEffect(() => {
    const serverRecord = sharedBirthFromUnknown(user?.birthData);
    const record = serverRecord ?? readSharedBirthRecord();
    if (!record) return;
    applyBirth(record);
    setRememberedRecord(record);
    setDetailsOpen(false);
    if (serverRecord) writeSharedBirthRecord(serverRecord);
  }, [user?.id, user?.birthData]);

  const draftBirth = useMemo(() => sharedBirthFromUnknown({
    year,
    month,
    day,
    hour: timeUnknown ? 12 : hour,
    minute: timeUnknown ? 0 : minute || 0,
    timeUnknown,
    gender,
    relation,
    city: birthCity,
    liveCity,
    ziPolicy: "midnight",
    useTrueSolar: true,
  }), [year, month, day, hour, minute, timeUnknown, gender, relation, birthCity, liveCity]);

  const previewChart = useMemo(() => {
    if (current || !draftBirth) return null;
    try {
      return buildChart({ ...draftBirth, question, locale });
    } catch {
      return null;
    }
  }, [current, draftBirth, question, locale]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!birthCity || !draftBirth) {
      setError(t("errCity"));
      setDetailsOpen(true);
      return;
    }
    if (!question.trim()) {
      setError(t("errQuestion"));
      return;
    }

    writeSharedBirthRecord(draftBirth);
    setRememberedRecord(draftBirth);
    setDetailsOpen(false);
    setBusy(true);

    try {
      const payload: AnalyzeInput = { ...draftBirth, question: question.trim(), locale };
      const result = await analyzeLife({ data: payload });
      setCurrent(result);
      if (session) {
        setSavedId(result.id);
        const { question: _question, locale: _locale, ...birthData } = payload;
        void Promise.allSettled([
          createEngineReportRecord({ session, profile, result }),
          updateBirthData(session, birthData as unknown as Record<string, unknown>),
        ]).then(() => window.dispatchEvent(new Event("zhaowu-auth-change")));
      }
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    } catch (err) {
      setError(locale === "en" ? t("errAnalyze") : err instanceof Error ? err.message : t("errAnalyze"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form id="analysisForm" className="zhaowu-analysis-flow" onSubmit={(event) => void submit(event)}>
      <section className="zhaowu-question-sheet" aria-labelledby="zhaowu-question-title">
        <p className="zhaowu-section-kicker">{copy.questionKicker}</p>
        <h2 id="zhaowu-question-title">{copy.questionTitle}</h2>
        <p className="zhaowu-section-lead">{copy.questionLead}</p>
        <div className="zhaowu-question-promise" aria-label={copy.promiseLabel}>
          {copy.promise.map((item) => <span key={item}>{item}</span>)}
        </div>
        <label htmlFor="analysis-question" className="zhaowu-question-label">{t("question")}</label>
        <textarea
          id="analysis-question"
          value={question}
          maxLength={400}
          rows={4}
          required
          placeholder={t("qPh")}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <span className="zhaowu-question-count">{question.length}/400</span>
      </section>

      <section id="bazi" className="zhaowu-bazi-hub" aria-labelledby="zhaowu-bazi-title">
        <header className="zhaowu-bazi-head">
          <div>
            <p className="zhaowu-section-kicker">{copy.baziKicker}</p>
            <h2 id="zhaowu-bazi-title">{copy.baziTitle}</h2>
            <p className="zhaowu-section-lead">{copy.baziLead}</p>
          </div>
          {rememberedRecord && !detailsOpen ? (
            <button type="button" className="zhaowu-birth-edit" onClick={() => setDetailsOpen(true)}>{copy.edit}</button>
          ) : null}
        </header>

        {rememberedRecord && !detailsOpen ? (
          <div className="zhaowu-birth-summary" aria-label={copy.birthReady}>
            <span>{copy.birthReady}</span>
            <strong>{formatSharedBirthRecord(rememberedRecord, locale)}</strong>
            <p>{copy.birthReadyLead}</p>
          </div>
        ) : (
          <div className="zhaowu-birth-fields">
            <p className="zhaowu-birth-fields-title">{copy.birthData}</p>
            <div className="zhaowu-birth-date-grid">
              {[
                { id: "birth-year", label: t("year"), value: year, set: setYear, min: 1900, max: 2100 },
                { id: "birth-month", label: t("month"), value: month, set: setMonth, min: 1, max: 12 },
                { id: "birth-day", label: t("day"), value: day, set: setDay, min: 1, max: 31 },
              ].map((field) => (
                <label htmlFor={field.id} key={field.id}>
                  <span>{field.label}</span>
                  <input id={field.id} type="number" inputMode="numeric" min={field.min} max={field.max} required value={field.value} onChange={(event) => field.set(event.target.value)} />
                </label>
              ))}
            </div>

            <div className="zhaowu-birth-time-block">
              <div className="zhaowu-birth-time-line">
                <span>{t("time")}</span>
                <label htmlFor="time-unknown">
                  <input id="time-unknown" aria-describedby="time-importance" type="checkbox" checked={timeUnknown} onChange={(event) => setTimeUnknown(event.target.checked)} />
                  {t("timeUnknown")}
                </label>
              </div>
              <p id="time-importance" className="zhaowu-time-warning">{UNKNOWN_TIME_COPY[locale]}</p>
              <div className="zhaowu-birth-time-grid">
                <input id="birth-hour" aria-label={t("hourPh")} type="number" inputMode="numeric" min={0} max={23} required={!timeUnknown} disabled={timeUnknown} value={hour} placeholder={t("hourPh")} onChange={(event) => setHour(event.target.value)} />
                <input id="birth-minute" aria-label={t("minutePh")} type="number" inputMode="numeric" min={0} max={59} disabled={timeUnknown} value={minute} placeholder={t("minutePh")} onChange={(event) => setMinute(event.target.value)} />
              </div>
            </div>

            <div className="zhaowu-birth-select-grid">
              <label htmlFor="birth-gender">
                <span>{t("gender")}</span>
                <select id="birth-gender" value={gender} onChange={(event) => setGender(event.target.value as AnalyzeInput["gender"])}>
                  <option value="unspecified">{t("unset")}</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                </select>
              </label>
              <label htmlFor="relationship-preference">
                <span>{t("relation")}</span>
                <select id="relationship-preference" value={relation} onChange={(event) => setRelation(event.target.value as AnalyzeInput["relation"])}>
                  <option value="unset">{t("unset")}</option>
                  <option value="any">{t("relAny")}</option>
                  <option value="hetero">{t("relHet")}</option>
                  <option value="same">{t("relSame")}</option>
                </select>
                <small>{t("relHint")}</small>
              </label>
            </div>

            <div className="zhaowu-birth-cities">
              <CityPicker id="birth-city" label={t("city")} placeholder={t("cityPh")} optionalLabel={t("optional")} popularLabel={t("popularCities")} locale={locale} value={birthCity} onSelect={setBirthCity} />
              <CityPicker id="current-city" label={t("liveCity")} placeholder={t("liveCity")} optional optionalLabel={t("optional")} popularLabel={t("popularCities")} locale={locale} value={liveCity} onSelect={setLiveCity} />
              <p>{t("liveHint")}</p>
            </div>
          </div>
        )}

        {!current && previewChart ? <div className="zhaowu-bazi-preview"><BaziChart chart={previewChart} /></div> : null}
      </section>

      {error ? <p role="alert" className="zhaowu-analysis-error">{error}</p> : null}
      <div className="zhaowu-analysis-submit-wrap">
        <p>{rememberedRecord ? copy.useRecord : copy.baziLead}</p>
        <button type="submit" disabled={busy}>{busy ? copy.busy : copy.submit}</button>
      </div>
    </form>
  );
}
