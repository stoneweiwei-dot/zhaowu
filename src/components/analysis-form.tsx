import { useEffect, useMemo, useState, type FormEvent } from "react";
import { analyzeLife } from "@/lib/actions";
import type { AnalyzeInput, CityHit } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createEngineReportRecord, updateBirthData } from "@/lib/supabase-rest";
import { UNKNOWN_TIME_COPY } from "@/lib/bazi/presentation";
import {
  formatSharedBirthRecord,
  readSharedBirthRecord,
  sharedBirthFromUnknown,
  writeSharedBirthRecord,
  type SharedBirthRecord,
} from "@/lib/shared-birth";
import { CityPicker } from "@/components/city-picker";
import { BaziChart } from "@/components/bazi-chart";
import { buildChart } from "@/lib/bazi/chart";
import { analyzeStructure } from "@/lib/bazi/structure";
import { chartTerm } from "@/lib/bazi/presentation";
import { UnifiedBirthReport } from "@/components/unified-birth-report";

const EN_STRENGTH: Record<string, string> = {
  "偏旺": "Relatively strong",
  "中和偏旺或中和": "Balanced to moderately strong",
  "偏弱": "Relatively weak",
};

const EN_COMPLETION: Record<string, string> = {
  "格局未定": "Not yet determined",
  "格局方向": "Structural direction only",
  "成格有條件": "Conditional formation",
  "成格可用": "Usable formation",
  "結構完成度高": "High structural completion",
};

const EN_PATTERN: Record<string, string> = {
  "殺印相生": "Challenge supported by resource",
  "食神制殺的可見條件": "Visible conditions for expression regulating challenge",
  "傷官配印的可見條件": "Visible conditions for independent expression supported by resource",
  "官殺配印的可見主線": "Responsibility and challenge supported by resource",
  "財生官殺的可見主線": "Resources feeding responsibility and challenge",
  "食傷生財的可見主線": "Expression generating resources",
  "殺印相生的可見主線": "Challenge supported by resource",
};

export function AnalysisForm() {
  const { t, locale } = useI18n();
  const { user, profile, session } = useCurrentUserState();
  const setCurrent = useAppStore((s) => s.setCurrent);
  const setSavedId = useAppStore((s) => s.setSavedId);
  const reset = useAppStore((s) => s.reset);

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
        customerKicker: "STEP 1 · BIRTH RECORD",
        customerTitle: "Enter your birth record",
        customerLead: "Enter it once. It stays on this phone, generates your chart and Destiny Book, and does not require an account first.",
        birthReady: "Birth record ready",
        birthReadyLead: "The same record is reused for your chart, Destiny Book and follow-up questions.",
        edit: "Edit details",
        birthData: "Birth record",
        next: "Save and generate my Destiny Book",
        saving: "Saving…",
        saved: "Birth record saved on this phone.",
        chartKicker: "STEP 2 · ZHAOWU DESTINY BOOK",
        chartTitle: "Your Four Pillars and ZHAOWU Destiny Book",
        chartLead: "A rule-based engine calculates the Four Pillars once. Zi Ping provides the primary structural judgement; specialist layers only cross-check in the background before one continuous plain-language reading is shown.",
        chartPending: "Save a complete birth record to generate the Four Pillars and begin your ZHAOWU Destiny Book here.",
        foundation: "Chart foundation",
        dayMaster: "Day master",
        monthOrder: "Month command",
        strength: "Strength baseline",
        structure: "Structure direction",
        features: "Main structural feature",
        noFeature: "No secondary pattern is stated beyond the primary structure yet.",
        usefulBoundary: "Flow candidates are not presented here as confirmed useful gods.",
        questionKicker: "STEP 3 · ASK YOUR DESTINY BOOK",
        questionTitle: "Continue from your Destiny Book",
        questionLead: "Ask one real question in your own words. The answer starts with the conclusion and uses only the evidence relevant to that question.",
        questionLabel: "Your question",
        questionPlaceholder: "For example: Should I stay in this job or leave? What changes most over the next six months?",
        promise: ["Direct answer", "Relevant evidence", "Practical next step"],
        analyze: "Analyse this question",
        analysing: "Analysing…",
        editBirth: "Birth record",
      }
    : locale === "zh-Hans"
      ? {
          customerKicker: "第一步 · 出生资料",
          customerTitle: "录入生辰",
          customerLead: "生辰只需填写一次，保存在这台手机；先排盘，再生成昭梧命书，不需要先注册。",
          birthReady: "生辰已准备好",
          birthReadyLead: "同一份生辰会沿用于命盘、昭梧命书与后续提问，不必重复填写。",
          edit: "修改资料",
          birthData: "出生资料",
          next: "保存并生成昭梧命书",
          saving: "正在保存…",
          saved: "生辰已保存在这台手机。",
          chartKicker: "第二步 · 昭梧命书",
          chartTitle: "你的四柱命盘与昭梧命书",
          chartLead: "先由规则引擎排出四柱，再以子平作结构主判；其他专项只在后台旁证，最后合成一份连续白话命书。",
          chartPending: "先保存完整出生资料，这里会立即显示四柱，并开始生成昭梧命书。",
          foundation: "基础解释",
          dayMaster: "日主",
          monthOrder: "月令",
          strength: "旺衰底盘",
          structure: "格局方向",
          features: "主要结构特点",
          noFeature: "目前只陈述主格方向，不追加第二个复合格局。",
          usefulBoundary: "流通候选不在这里冒充正式喜用神。",
          questionKicker: "第三步 · 命书问答",
          questionTitle: "沿着这份命书，继续问你真正关心的事",
          questionLead: "直接写一个你现在真正要解决的问题。答案先说结论，只保留与这个问题有关的依据、时间与行动。",
          questionLabel: "你的问题",
          questionPlaceholder: "例如：这份工作该继续还是离开？未来半年最大的变化在哪里？",
          promise: ["直接结论", "相关依据", "现实下一步"],
          analyze: "开始分析这个问题",
          analysing: "正在推演…",
          editBirth: "出生资料",
        }
      : {
          customerKicker: "第一步 · 出生資料",
          customerTitle: "錄入生辰",
          customerLead: "生辰只需填寫一次，保存在這台手機；先排盤，再生成昭梧命書，不需要先註冊。",
          birthReady: "生辰已準備好",
          birthReadyLead: "同一份生辰會沿用於命盤、昭梧命書與後續提問，不必重複填寫。",
          edit: "修改資料",
          birthData: "出生資料",
          next: "保存並生成昭梧命書",
          saving: "正在保存…",
          saved: "生辰已保存在這台手機。",
          chartKicker: "第二步 · 昭梧命書",
          chartTitle: "你的四柱命盤與昭梧命書",
          chartLead: "先由規則引擎排出四柱，再以子平作結構主判；其他專項只在後台旁證，最後合成一份連續白話命書。",
          chartPending: "先保存完整出生資料，這裡會立即顯示四柱，並開始生成昭梧命書。",
          foundation: "基礎解釋",
          dayMaster: "日主",
          monthOrder: "月令",
          strength: "旺衰底盤",
          structure: "格局方向",
          features: "主要結構特點",
          noFeature: "目前只陳述主格方向，不追加第二個複合格局。",
          usefulBoundary: "流通候選不在這裡冒充正式喜用神。",
          questionKicker: "第三步 · 命書問答",
          questionTitle: "沿著這份命書，繼續問你真正關心的事",
          questionLead: "直接寫一個你現在真正要解決的問題。答案先說結論，只保留與這個問題有關的依據、時間與行動。",
          questionLabel: "你的問題",
          questionPlaceholder: "例如：這份工作該繼續還是離開？未來半年最大的變化在哪裡？",
          promise: ["直接結論", "相關依據", "現實下一步"],
          analyze: "開始分析這個問題",
          analysing: "正在推演…",
          editBirth: "出生資料",
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
    const localRecord = readSharedBirthRecord();
    const serverRecord = sharedBirthFromUnknown(user?.birthData);
    const record = localRecord ?? serverRecord;
    if (!record) return;
    applyBirth(record);
    setRememberedRecord(record);
    setDetailsOpen(false);
    if (!localRecord && serverRecord) writeSharedBirthRecord(serverRecord);
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

  async function saveBirthAndContinue(record: SharedBirthRecord) {
    writeSharedBirthRecord(record);
    setRememberedRecord(record);
    setDetailsOpen(false);
    if (session) {
      void updateBirthData(session, record as unknown as Record<string, unknown>)
        .then(() => window.dispatchEvent(new Event("zhaowu-auth-change")))
        .catch(() => undefined);
    }
    window.setTimeout(() => document.getElementById("bazi")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (detailsOpen || !rememberedRecord) {
      if (!birthCity || !draftBirth) {
        setError(t("errCity"));
        setDetailsOpen(true);
        return;
      }
      setBusy(true);
      try {
        await saveBirthAndContinue(draftBirth);
      } catch (err) {
        setError(locale === "en" ? "Could not save the birth record." : err instanceof Error ? err.message : copy.saved);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!question.trim()) {
      setError(t("errQuestion"));
      return;
    }

    setBusy(true);
    try {
      const payload: AnalyzeInput = { ...rememberedRecord, question: question.trim(), locale };
      const result = await analyzeLife({ data: payload });
      setCurrent(result);
      if (session) {
        setSavedId(result.id);
        void createEngineReportRecord({ session, profile, result })
          .then(() => window.dispatchEvent(new Event("zhaowu-auth-change")))
          .catch(() => undefined);
      }
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } catch (err) {
      setError(locale === "en" ? t("errAnalyze") : err instanceof Error ? err.message : t("errAnalyze"));
    } finally {
      setBusy(false);
    }
  }

  const showQuestion = Boolean(rememberedRecord && !detailsOpen);
  const previewChart = useMemo(() => {
    if (!showQuestion || !rememberedRecord) return null;
    try {
      return buildChart({ ...rememberedRecord, question: "", locale });
    } catch {
      return null;
    }
  }, [locale, rememberedRecord, showQuestion]);
  const structure = useMemo(() => previewChart ? analyzeStructure(previewChart) : null, [previewChart]);
  const foundationValues = previewChart && structure
    ? locale === "en"
      ? {
          dayMaster: chartTerm(previewChart.dayMaster, locale),
          monthOrder: `${chartTerm(previewChart.monthBranch, locale)} · ${chartTerm(structure.monthMainStem, locale)} / ${chartTerm(structure.monthTenGod, locale)}`,
          strength: `${EN_STRENGTH[previewChart.strength.tendency] ?? "Baseline not determined"}. Seasonal support: ${previewChart.strength.deLing ? "present" : "limited"}; root support: ${previewChart.strength.deDi ? "present" : "limited"}; visible support: ${previewChart.strength.deShi ? "present" : "limited"}. This is a strength baseline, not a complete verdict.`,
          structure: `${chartTerm(structure.monthTenGod, locale)} structure${structure.established ? "" : " direction"} · ${EN_COMPLETION[structure.completion.label] ?? "Conditional"}`,
          features: structure.supportingPattern ? (EN_PATTERN[structure.supportingPattern] ?? copy.noFeature) : copy.noFeature,
        }
      : {
          dayMaster: `${previewChart.dayMaster}${previewChart.dayMasterElement}`,
          monthOrder: `${previewChart.monthBranch} · ${structure.monthMainStem}${structure.monthTenGod}`,
          strength: `${previewChart.strength.tendency} · ${previewChart.strength.summary}`,
          structure: `${structure.label}${structure.established ? "" : "方向"} · ${structure.completion.label}`,
          features: structure.supportingPattern ?? copy.noFeature,
        }
    : null;

  return (
    <form id="analysisForm" className="zhaowu-analysis-flow" onSubmit={(event) => void submit(event)} data-device-first-flow="true">
      <section id="customer-record" className="zhaowu-customer-record" aria-labelledby="zhaowu-customer-title">
        <header className="zhaowu-customer-head">
          <div>
            <p className="zhaowu-section-kicker">{copy.customerKicker}</p>
            <h2 id="zhaowu-customer-title">{copy.customerTitle}</h2>
            <p className="zhaowu-section-lead">{copy.customerLead}</p>
          </div>
          {rememberedRecord && !detailsOpen ? (
            <button type="button" className="zhaowu-birth-edit" onClick={() => { setDetailsOpen(true); setError(null); }}>{copy.edit}</button>
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
      </section>

      <section id="bazi" className="zhaowu-bazi-stage" aria-labelledby="zhaowu-bazi-title" aria-live="polite">
        <header className="zhaowu-bazi-stage-head">
          <p className="zhaowu-section-kicker">{copy.chartKicker}</p>
          <h2 id="zhaowu-bazi-title">{copy.chartTitle}</h2>
          <p className="zhaowu-section-lead">{copy.chartLead}</p>
        </header>
        {previewChart && structure && foundationValues ? (
          <div className="zhaowu-bazi-preview">
            <BaziChart chart={previewChart} showHeader={false} expandDetails />
            <section className="zhaowu-bazi-foundation" data-home-bazi-explanation aria-labelledby="zhaowu-bazi-foundation-title">
              <h3 id="zhaowu-bazi-foundation-title">{copy.foundation}</h3>
              <dl>
                <div><dt>{copy.dayMaster}</dt><dd>{foundationValues.dayMaster}</dd></div>
                <div><dt>{copy.monthOrder}</dt><dd>{foundationValues.monthOrder}</dd></div>
                <div><dt>{copy.strength}</dt><dd>{foundationValues.strength}</dd></div>
                <div><dt>{copy.structure}</dt><dd>{foundationValues.structure}</dd></div>
                <div><dt>{copy.features}</dt><dd>{foundationValues.features}</dd></div>
              </dl>
              <p className="zhaowu-useful-boundary">{copy.usefulBoundary}</p>
            </section>
            <UnifiedBirthReport birth={rememberedRecord!} locale={locale} foundation={foundationValues} />
          </div>
        ) : (
          <div className="zhaowu-bazi-pending">
            <p>{copy.chartPending}</p>
            <button type="submit" disabled={busy}>{busy ? copy.saving : copy.next}</button>
          </div>
        )}
      </section>

      {showQuestion ? (
        <section id="question-stage" className="zhaowu-question-sheet zhaowu-question-stage" aria-labelledby="zhaowu-question-title">
          <div className="zhaowu-question-stage-head">
            <div>
              <p className="zhaowu-section-kicker">{copy.questionKicker}</p>
              <h2 id="zhaowu-question-title">{copy.questionTitle}</h2>
              <p className="zhaowu-section-lead">{copy.questionLead}</p>
            </div>
            <button type="button" className="zhaowu-question-birth-edit" onClick={() => { setDetailsOpen(true); setError(null); }}>{copy.editBirth}</button>
          </div>
          <div className="zhaowu-question-promise" aria-label={copy.questionTitle}>
            {copy.promise.map((item) => <span key={item}>{item}</span>)}
          </div>
          <label htmlFor="analysis-question" className="zhaowu-question-label">{copy.questionLabel}</label>
          <textarea
            id="analysis-question"
            value={question}
            maxLength={400}
            rows={5}
            required
            autoFocus={false}
            placeholder={copy.questionPlaceholder}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <div className="zhaowu-question-meta">
            <span>{formatSharedBirthRecord(rememberedRecord!, locale)}</span>
            <span>{question.length}/400</span>
          </div>
        </section>
      ) : null}

      {error ? <p role="alert" className="zhaowu-analysis-error">{error}</p> : null}
      {showQuestion ? (
        <div className="zhaowu-analysis-submit-wrap" data-analysis-stage="question">
          <button type="submit" disabled={busy}>{busy ? copy.analysing : copy.analyze}</button>
        </div>
      ) : null}
    </form>
  );
}
