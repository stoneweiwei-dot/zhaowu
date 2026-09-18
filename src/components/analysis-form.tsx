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
        customerTitle: "Your birth details",
        customerLead: "Saved on this phone so you do not need an account before asking a question.",
        birthReady: "Birth record ready",
        birthReadyLead: "This phone will reuse the same record across personal readings.",
        edit: "Edit details",
        birthData: "Birth record",
        next: "Save and generate my chart",
        saving: "Saving…",
        saved: "Birth record saved on this phone.",
        chartKicker: "STEP 2 · FOUR PILLARS",
        chartTitle: "Your Four Pillars chart",
        chartLead: "Generated from the birth record above with Zhaowu's existing chart engine.",
        chartPending: "Save a complete birth record to generate the year, month, day and hour pillars here.",
        foundation: "Chart foundation",
        dayMaster: "Day master",
        monthOrder: "Month command",
        strength: "Strength baseline",
        structure: "Structure direction",
        features: "Main structural feature",
        noFeature: "No secondary pattern is stated beyond the primary structure yet.",
        usefulBoundary: "Flow candidates are not presented here as confirmed useful gods.",
        questionKicker: "STEP 3 · YOUR QUESTION",
        questionTitle: "What do you actually want answered?",
        questionLead: "Ask one real question in your own words. The answer will lead with the conclusion and only show evidence that helps answer it.",
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
          customerTitle: "客人资料",
          customerLead: "资料保存在这台手机，不需要先注册账号就能提问。",
          birthReady: "生辰已准备好",
          birthReadyLead: "这台手机会在各个人分析中沿用同一份资料。",
          edit: "修改资料",
          birthData: "出生资料",
          next: "保存并排出四柱命盘",
          saving: "正在保存…",
          saved: "生辰已保存在这台手机。",
          chartKicker: "第二步 · 四柱命盘",
          chartTitle: "你的四柱八字命盘",
          chartLead: "使用上方出生资料与昭梧现有排盘引擎即时生成。",
          chartPending: "先保存完整出生资料，这里会立即显示年、月、日、时四柱。",
          foundation: "基础解释",
          dayMaster: "日主",
          monthOrder: "月令",
          strength: "旺衰底盘",
          structure: "格局方向",
          features: "主要结构特点",
          noFeature: "目前只陈述主格方向，不追加第二个复合格局。",
          usefulBoundary: "流通候选不在这里冒充正式喜用神。",
          questionKicker: "第三步 · 提问",
          questionTitle: "你真正想问的是什么？",
          questionLead: "直接写你现在最想解决的一个真实问题。答案先说结论，只保留和这个问题有关的依据与行动。",
          questionLabel: "你的问题",
          questionPlaceholder: "例如：这份工作该继续还是离开？未来半年最大的变化在哪里？",
          promise: ["直接结论", "相关依据", "现实下一步"],
          analyze: "开始分析这个问题",
          analysing: "正在推演…",
          editBirth: "出生资料",
        }
      : {
          customerKicker: "第一步 · 出生資料",
          customerTitle: "客人資料",
          customerLead: "資料保存在這台手機，不需要先註冊帳號就能提問。",
          birthReady: "生辰已準備好",
          birthReadyLead: "這台手機會在各個人分析中沿用同一份資料。",
          edit: "修改資料",
          birthData: "出生資料",
          next: "保存並排出四柱命盤",
          saving: "正在保存…",
          saved: "生辰已保存在這台手機。",
          chartKicker: "第二步 · 四柱命盤",
          chartTitle: "你的四柱八字命盤",
          chartLead: "使用上方出生資料與昭梧現有排盤引擎即時生成。",
          chartPending: "先保存完整出生資料，這裡會立即顯示年、月、日、時四柱。",
          foundation: "基礎解釋",
          dayMaster: "日主",
          monthOrder: "月令",
          strength: "旺衰底盤",
          structure: "格局方向",
          features: "主要結構特點",
          noFeature: "目前只陳述主格方向，不追加第二個複合格局。",
          usefulBoundary: "流通候選不在這裡冒充正式喜用神。",
          questionKicker: "第三步 · 提問",
          questionTitle: "你真正想問的是什麼？",
          questionLead: "直接寫你現在最想解決的一個真實問題。答案先說結論，只保留和這個問題有關的依據與行動。",
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
