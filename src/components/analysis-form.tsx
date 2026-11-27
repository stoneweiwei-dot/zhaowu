import { toSimplifiedCustomerText } from "@/lib/report/reading-locale";
import { publicShareUrl } from "@/lib/share-url";
import "./result-page.css";
import { BaziReadingUnlock, useBaziReadingAccess } from "@/components/bazi-reading-unlock";
import { FreeSummaryEmail } from "@/components/free-summary-email";
import { JourneySteps } from "@/components/journey-steps";
import { currentJourneyStep, type JourneyStep } from "@/lib/site-journey";
import { CharacterPanel } from "@/components/character-panel";
import { FreeStemBranchAtlas } from "@/components/free-stem-branch-atlas";
import { BirthDataNotice } from "@/components/birth-data-notice";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { analyzeLife } from "@/lib/actions";
import type { AnalyzeInput, BirthTimeSource, CityHit } from "@/lib/bazi/types";
import { assessBirthRecord } from "@/lib/bazi/data-grade";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { oncePerSession, trackConversion } from "@/lib/observability/conversion-telemetry";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createEngineReportRecord, saveVisitorChart, updateBirthData } from "@/lib/supabase-rest";
import {
  formatSharedBirthRecord,
  readSharedBirthRecord,
  sharedBirthFromUnknown,
  validDate,
  writeSharedBirthRecord,
  type SharedBirthRecord,
} from "@/lib/shared-birth";
import { CityPicker } from "@/components/city-picker";
import { BaziChart } from "@/components/bazi-chart";
import { buildChart } from "@/lib/bazi/chart";
import { analyzeStructure } from "@/lib/bazi/structure";
import { chartTerm, pillarName, ganzhiLabel, UNKNOWN_TIME_COPY } from "@/lib/bazi/presentation";
import { UnifiedBirthReport } from "@/components/unified-birth-report";
import { ChartTrustPanel, copyPlainText } from "@/components/chart-trust-panel";
import { buildPlainChartSummary } from "@/lib/bazi/plain-summary";

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
  const { unlocked: readingUnlocked, pending: readingPaymentPending } = useBaziReadingAccess();
  const { user, profile, session } = useCurrentUserState();
  const setCurrent = useAppStore((s) => s.setCurrent);
  const setSavedId = useAppStore((s) => s.setSavedId);

  const [question, setQuestion] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [timeSource, setTimeSource] = useState<BirthTimeSource>("family-memory");
  const [gender, setGender] = useState<AnalyzeInput["gender"] | "">("");
  const [relation, setRelation] = useState<AnalyzeInput["relation"]>("unset");
  const [birthCity, setBirthCity] = useState<CityHit | null>(null);
  const [liveCity, setLiveCity] = useState<CityHit | null>(null);
  const [dateError, setDateError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberedRecord, setRememberedRecord] = useState<SharedBirthRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [actionStatus, setActionStatus] = useState("");
  const [questionOpen, setQuestionOpen] = useState(false);

  const copy = locale === "en"
    ? {
        customerKicker: "STEP 1 · BIRTH RECORD",
        customerTitle: "Enter your birth record",

        birthReady: "Birth record ready",

        edit: "Edit details",
        birthData: "Birth record",
        calibrationTitle: "Time correction is automatic",
        calibrationBody: "Enter the local time shown on the birth certificate and select the birthplace. Longitude, historical time zone, daylight saving and true solar time are handled automatically. If place search is unavailable, try again or select a matching offline city. Confirm the birthplace and time zone before continuing.",
        next: "Generate my Destiny Book",
        saving: "Saving…",
        saved: "Birth record saved on this phone.",
        saveError: "Could not save the birth record. Please try again.",
        chartTitle: "My BaZi chart",
        core: "Your core reading",
        reading: "Your chart interpretation",
        atlas: "Your illustrated atlas",
        deep: "Read your Destiny Book",
        nextSteps: "Next steps",
        artwork: "Original stem and branch artwork",
        full: "View full Destiny Book",
        share: "Share Destiny Book",
        copyChart: "Copy chart",
        unknownHour: "Unknown",
        copied: "Copied",
        failed: "Could not copy",
        ask: "Ask a question",


        foundation: "Technical terms",
        dayMaster: "Day master",
        monthOrder: "Month command",
        strength: "Strength baseline",
        structure: "Structure direction",
        features: "Main structural feature",
        noFeature: "—",

        questionKicker: "STEP 3 · ASK YOUR DESTINY BOOK",
        questionTitle: "Ask a question (optional)",

        questionLabel: "Your question",
        questionPlaceholder: "For example: Should I stay in this job or leave? What changes most over the next six months?",
        quickPrompts: [
          "What should I eat today?",
          "Should I change jobs?",
          "How can I communicate better in my relationship?",
        ],
        quickPromptsLabel: "Quick questions",

        analyze: "Analyse this question",
        analysing: "Analysing…",
        editBirth: "Birth record",
      }
    : locale === "zh-Hans"
      ? {
          customerKicker: "第一步 · 出生资料",
          customerTitle: "录入生辰",

          birthReady: "生辰已准备好",

          edit: "修改资料",
          birthData: "出生资料",
          calibrationTitle: "时间校正由系统自动完成",
          calibrationBody: "只需填写出生证明上的当地时间并选择出生城市；经度、历史时区、夏令时与真太阳时由系统自动处理。若地点搜索暂时不可用，请重试或选择匹配的离线城市；确认出生地与时区后再继续排盘。",
          next: "生成我的命书",
          saving: "正在保存…",
          saved: "生辰已保存在这台手机。",
          saveError: "保存失败，请再试一次。",
          chartTitle: "我的八字命盘",
          core: "你的核心命辞",
          reading: "你的命盘解读",
          atlas: "你的专属命理图鉴",
          deep: "深入阅读命书",
          nextSteps: "下一步",
          artwork: "天干地支原画",
          full: "查看完整命书",
          share: "分享命书",
          copyChart: "复制命盘",
          unknownHour: "时辰未知",
          copied: "已复制",
          failed: "复制失败",
          ask: "继续问问题",


          foundation: "术语版",
          dayMaster: "日主",
          monthOrder: "月令",
          strength: "旺衰底盘",
          structure: "格局方向",
          features: "主要结构特点",
          noFeature: "—",

          questionKicker: "第三步 · 命书问答",
          questionTitle: "问个问题（选填）",

          questionLabel: "你的问题",
          questionPlaceholder: "例如：这份工作该继续还是离开？未来半年最大的变化在哪里？",
          quickPrompts: [
            "我今天适合吃什么？",
            "这份工作该不该换？",
            "感情沟通卡住了怎么办？",
          ],
          quickPromptsLabel: "快捷问题",

          analyze: "开始分析这个问题",
          analysing: "正在推演…",
          editBirth: "出生资料",
        }
      : {
          customerKicker: "第一步 · 出生資料",
          customerTitle: "錄入生辰",

          birthReady: "生辰已準備好",

          edit: "修改資料",
          birthData: "出生資料",
          calibrationTitle: "時間校正由系統自動完成",
          calibrationBody: "只需填寫出生證明上的當地時間並選擇出生城市；經度、歷史時區、夏令時與真太陽時由系統自動處理。若地點搜尋暫時不可用，請重試或選擇匹配的離線城市；確認出生地與時區後再繼續排盤。",
          next: "生成我的命書",
          saving: "正在保存…",
          saved: "生辰已保存在這台手機。",
          saveError: "保存失敗，請再試一次。",
          chartTitle: "我的八字命盤",
          core: "你的核心命辭",
          reading: "你的命盤解讀",
          atlas: "你的專屬命理圖鑑",
          deep: "深入閱讀命書",
          nextSteps: "下一步",
          artwork: "天干地支原畫",
          full: "查看完整命書",
          share: "分享命書",
          copyChart: "複製命盤",
          unknownHour: "時辰未知",
          copied: "已複製",
          failed: "複製失敗",
          ask: "繼續問問題",


          foundation: "術語版",
          dayMaster: "日主",
          monthOrder: "月令",
          strength: "旺衰底盤",
          structure: "格局方向",
          features: "主要結構特點",
          noFeature: "—",

          questionKicker: "第三步 · 命書問答",
          questionTitle: "問個問題（選填）",

          questionLabel: "你的問題",
          questionPlaceholder: "例如：這份工作該繼續還是離開？未來半年最大的變化在哪裡？",
          quickPrompts: [
            "我今天適合吃什麼？",
            "這份工作該不該換？",
            "感情溝通卡住了怎麼辦？",
          ],
          quickPromptsLabel: "快捷問題",

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
    setTimeSource(record.timeSource === "certificate" ? "certificate" : "family-memory");
    setGender(record.gender);
    setRelation(record.relation);
    setBirthCity(record.city);
    setLiveCity(record.liveCity ?? null);
  }

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

  useEffect(() => {
    // Funnel step 1: the birth form is shown. Once per session, so a
    // remount or a return visit does not inflate the count.
    if (oncePerSession("form:bazi")) trackConversion("zhaowu_form_opened", { system: "bazi" });
  }, []);

  const draftBirth = useMemo(() => gender && birthCity && !birthCity.standardTimeFallback ? sharedBirthFromUnknown({
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
    timeSource: timeUnknown ? undefined : timeSource,
  }) : null, [year, month, day, hour, minute, timeUnknown, timeSource, gender, relation, birthCity, liveCity]);

  async function saveBirthAndContinue(record: SharedBirthRecord) {
    writeSharedBirthRecord(record);
    setRememberedRecord(record);
    setDetailsOpen(false);
    setQuestionOpen(false);
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
      if (!gender) {
        setError(locale === "en" ? "Choose a traditional chart option, or select Not specified." : locale === "zh-Hans" ? "请先选择性别排运选项，也可以选择不提供。" : "請先選擇性別排運選項，也可以選擇不提供。");
        document.getElementById("birth-gender")?.focus();
        return;
      }
      if (!birthCity || birthCity.standardTimeFallback || !birthCity.timezone) {
        setError(locale === "en" ? "Please select your birth city and confirm its time zone before continuing." : locale === "zh-Hans" ? "请先从列表选择出生城市并确认时区，再继续排盘。" : "請先從列表選擇出生城市並確認時區，再繼續排盤。");
        document.getElementById("birth-city")?.focus();
        return;
      }
      if (!draftBirth) {
        setError(null);
        const dateInvalid = Boolean(year) && Boolean(month) && Boolean(day)
          && !validDate(Number(year), Number(month), Number(day));
        if (dateInvalid) {
          setDateError(true);
          setDetailsOpen(true);
          window.setTimeout(() => {
            const dayInput = document.getElementById("birth-day");
            dayInput?.scrollIntoView({ behavior: "smooth", block: "center" });
            dayInput?.focus();
          }, 0);
          return;
        }
        setDetailsOpen(true);
        return;
      }
      setDateError(false);
      setBusy(true);
      try {
        await saveBirthAndContinue(draftBirth);
      } catch (err) {
        setError(locale === "en" ? copy.saveError : err instanceof Error ? err.message : copy.saveError);
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
      trackConversion("chart_started", { system: "bazi", locale });
      trackConversion("zhaowu_birth_submitted", { system: "bazi" });
      const result = await analyzeLife({ data: payload });
      setCurrent(result);
      // Persistence is deliberately best effort: a backend outage must not interrupt chart delivery.
      void saveVisitorChart({ result, birth: payload }).catch(() => undefined);
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
  const rememberedGrade = useMemo(() => (rememberedRecord ? assessBirthRecord(rememberedRecord) : null), [rememberedRecord]);
  const structure = useMemo(() => {
    if (!previewChart) return null;
    try { return analyzeStructure(previewChart); } catch { return null; }
  }, [previewChart]);
  const plainItems = useMemo(() => {
    if (!previewChart) return [];
    try { return buildPlainChartSummary(previewChart, locale); } catch { return []; }
  }, [previewChart, locale]);
  const chartText = (value: string) => locale === "zh-Hans" ? toSimplifiedCustomerText(value) : value;
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
          monthOrder: chartText(`${previewChart.monthBranch} · ${structure.monthMainStem}${structure.monthTenGod}`),
          strength: chartText(`${previewChart.strength.tendency} · ${previewChart.strength.summary}`),
          structure: chartText(`${structure.label}${structure.established ? "" : "方向"} · ${structure.completion.label}`),
          features: chartText(structure.supportingPattern ?? copy.noFeature),
        }
    : null;

  async function handleChartAction(action: "share" | "copy") {
    if (!previewChart) return;
    setActionStatus("");
    try {
      if (action === "share" && navigator.share) {
        try {
          await navigator.share({ title: copy.chartTitle, url: publicShareUrl() });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
        }
      }
      const summary = previewChart.pillars.map(pillar => {
        const value = pillar.ready && !(previewChart.timeUnknown && pillar.key === "time")
          ? ganzhiLabel(pillar.ganZhi, locale) : copy.unknownHour;
        return pillarName(pillar.key, locale) + " · " + value;
      }).join("\n");
      await copyPlainText(action === "share" ? publicShareUrl() : summary);
      setActionStatus(copy.copied);
    } catch {
      setActionStatus(copy.failed);
    }
  }

  function selectStep(step: JourneyStep) {
    if (step > 1 && (!rememberedRecord || detailsOpen)) return;
    setError(null);
    setActionStatus("");
    setDetailsOpen(step === 1);
    setQuestionOpen(step === 3);
    window.requestAnimationFrame(() => {
      const id = step === 1 ? "birth-year" : step === 2 ? "bazi" : "analysis-question";
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (step !== 2) target?.focus({ preventScroll: true });
    });
  }

  return (
    <form id="birth-form" data-legacy-id="analysisForm" className="zhaowu-analysis-flow" onSubmit={(event) => void submit(event)} data-device-first-flow="true">
      <JourneySteps locale={locale} current={currentJourneyStep(Boolean(rememberedRecord), detailsOpen, questionOpen)} hasBirth={Boolean(rememberedRecord) && !detailsOpen} onSelect={selectStep} />
      <section id="customer-record" className="zhaowu-customer-record" aria-labelledby="zhaowu-customer-title">
        <header className="zhaowu-customer-head">
          <div>
            <p className="zhaowu-section-kicker">{copy.customerKicker}</p>
            <h2 id="zhaowu-customer-title">{copy.customerTitle}</h2>
          </div>
          {rememberedRecord && !detailsOpen ? (
            <button type="button" className="zhaowu-birth-edit" onClick={() => { setDetailsOpen(true); setError(null); }}>{copy.edit}</button>
          ) : null}
        </header>

        {rememberedRecord && !detailsOpen ? (
          <div className="zhaowu-birth-summary" aria-label={copy.birthReady}>
            <span>{copy.birthReady}</span>
            {questionOpen ? <strong>{formatSharedBirthRecord(rememberedRecord, locale)}</strong> : null}
          </div>
        ) : (
          <div className="zhaowu-birth-fields">
            <BirthDataNotice locale={locale} variant="birth" />
            <div className="zhaowu-time-calibration-note" data-auto-time-calibration="true">
              <strong>{copy.calibrationTitle}</strong>
              <details><summary>{locale === "en" ? "How time is corrected" : locale === "zh-Hans" ? "校时说明" : "校時說明"}</summary><span>{copy.calibrationBody}</span></details>
            </div>
            <div className="zhaowu-birth-date-grid" data-invalid={dateError ? "true" : undefined}>
              {[
                { id: "birth-year", label: t("year"), value: year, set: setYear, min: 1900, max: 2100 },
                { id: "birth-month", label: t("month"), value: month, set: setMonth, min: 1, max: 12 },
                { id: "birth-day", label: t("day"), value: day, set: setDay, min: 1, max: 31 },
              ].map((field) => (
                <label htmlFor={field.id} key={field.id}>
                  <span>{field.label}</span>
                  <input
                    id={field.id}
                    type="number"
                    inputMode="numeric"
                    min={field.min}
                    max={field.max}
                    required
                    aria-invalid={dateError || undefined}
                    value={field.value}
                    onChange={(event) => {
                      field.set(event.target.value);
                      if (dateError) setDateError(false);
                    }}
                  />
                </label>
              ))}
            </div>
            {dateError ? <p role="alert" className="mt-2 text-sm text-cinnabar">{t("errDate")}</p> : null}

            <div className="zhaowu-birth-select-grid">
              <label htmlFor="birth-gender">
                <span>{t("gender")}</span>
                <div className="zhaowu-gender-capsules" role="radiogroup" aria-label={t("gender")}>
                  <button
                    type="button"
                    className={`zhaowu-gender-capsule ${gender === "male" ? "is-active" : ""}`}
                    onClick={() => setGender("male")}
                  >
                    {locale === "en" ? "Male (Qian)" : locale === "zh-Hans" ? "乾造 (男)" : "乾造 (男)"}
                  </button>
                  <button
                    type="button"
                    className={`zhaowu-gender-capsule ${gender === "female" ? "is-active" : ""}`}
                    onClick={() => setGender("female")}
                  >
                    {locale === "en" ? "Female (Kun)" : locale === "zh-Hans" ? "坤造 (女)" : "坤造 (女)"}
                  </button>
                </div>
                <select id="birth-gender" required value={gender} onChange={(event) => setGender(event.target.value as AnalyzeInput["gender"])} className="sr-only">
                  <option value="" disabled>{locale === "en" ? "Choose an option" : locale === "zh-Hans" ? "请选择" : "請選擇"}</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                  <option value="unspecified">{t("unset")}</option>
                </select>
                <small>{locale === "en" ? "Used for traditional luck-cycle direction and certain family readings. Basic Four Pillars remain available." : locale === "zh-Hans" ? "用于传统大运顺逆及部分六亲判断。基本四柱仍可排出。" : "用於傳統大運順逆及部分六親判斷。基本四柱仍可排出。"}</small>
              </label>
            </div>

            <div className="zhaowu-birth-time-block">
              <div className="zhaowu-birth-time-line">
                <span>{t("time")}</span>
                <label htmlFor="time-unknown">
                  <input id="time-unknown" aria-describedby="time-importance" type="checkbox" checked={timeUnknown} onChange={(event) => setTimeUnknown(event.target.checked)} />
                  {t("timeUnknown")}
                </label>
              </div>
              <p id="time-importance" className="zhaowu-time-warning">{timeUnknown ? UNKNOWN_TIME_COPY[locale] : locale === "en" ? "If you do not know the time, or only roughly, tick the box above." : locale === "zh-Hans" ? "不知道或只记得大概时间，请勾选后继续。" : "不知道或只記得大概時間，請勾選後繼續。"}</p>
              <div className="zhaowu-birth-time-grid">
                <input id="birth-hour" aria-label={t("hourPh")} type="number" inputMode="numeric" min={0} max={23} required={!timeUnknown} disabled={timeUnknown} value={hour} placeholder={t("hourPh")} onChange={(event) => setHour(event.target.value)} />
                <input id="birth-minute" aria-label={t("minutePh")} type="number" inputMode="numeric" min={0} max={59} disabled={timeUnknown} value={minute} placeholder={t("minutePh")} onChange={(event) => setMinute(event.target.value)} />
              </div>
              {timeUnknown ? null : (
                <label className="zhaowu-birth-time-source" htmlFor="birth-time-source">
                  <span>{locale === "en" ? "Where does this birth time come from?" : locale === "zh-Hans" ? "这个出生时间从哪里来？" : "這個出生時間從哪裡來？"}</span>
                  <select id="birth-time-source" value={timeSource} onChange={(event) => setTimeSource(event.target.value === "certificate" ? "certificate" : "family-memory")}>
                    <option value="certificate">{locale === "en" ? "Birth certificate or hospital record (to the minute)" : locale === "zh-Hans" ? "出生证明或医院记录（精确到分钟）" : "出生證明或醫院紀錄（精確到分鐘）"}</option>
                    <option value="family-memory">{locale === "en" ? "Family memory (to the two-hour period)" : locale === "zh-Hans" ? "家人记忆（精确到时辰）" : "家人記憶（精確到時辰）"}</option>
                  </select>
                </label>
              )}
            </div>

            <div className="zhaowu-birth-cities">
              <CityPicker id="birth-city" label={t("city")} placeholder={t("cityPh")} optionalLabel={t("optional")} popularLabel={t("popularCities")} locale={locale} value={birthCity} onSelect={(city) => { setBirthCity(city); if (city) setError(null); }} />

            </div>
            <details className="zw-flow-optional">
              <summary>{locale === "en" ? "Optional details" : locale === "zh-Hans" ? "补充资料（选填）" : "補充資料（選填）"}</summary>
              <div className="zhaowu-birth-select-grid">                <label htmlFor="relationship-preference">
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
                <CityPicker id="current-city" label={t("liveCity")} placeholder={t("liveCity")} optional optionalLabel={t("optional")} popularLabel={t("popularCities")} locale={locale} value={liveCity} onSelect={setLiveCity} />
              </div>
            </details>
            <div className="zhaowu-analysis-submit-wrap" data-analysis-stage="birth">
              <button type="submit" disabled={busy}>{busy ? copy.saving : copy.next}</button>
              {rememberedRecord ? <button type="button" className="zhaowu-birth-edit" onClick={() => { applyBirth(rememberedRecord); setDetailsOpen(false); setQuestionOpen(false); setError(null); }}>{locale === "en" ? "Cancel edits" : locale === "zh-Hans" ? "取消修改" : "取消修改"}</button> : null}
            </div>
          </div>
        )}
      </section>

      {showQuestion && !questionOpen ? <section id="bazi" className="zhaowu-bazi-stage zw-result-v2" aria-label={copy.chartTitle}>
        {previewChart && rememberedRecord ? (
          <div className="zw-result-paper">
            <section data-result-section="01" aria-labelledby="bazi-title-01">
              <h2 id="bazi-title-01"><span className="zw-result-number">01</span>{copy.chartTitle}</h2>
              <p>{formatSharedBirthRecord(rememberedRecord, locale)}</p>
              {previewChart.locationFallback || rememberedRecord.city.standardTimeFallback ? <p className="zhaowu-time-warning" data-location-fallback>{locale === "en" ? "Birthplace was not verified. This chart uses Beijing standard time (UTC+8) and has not been corrected to true solar time." : locale === "zh-Hans" ? "出生地未确认：本盘暂按北京时间（UTC+8）计算，未校正真太阳时。" : "出生地未確認：本盤暫按北京標準時間（UTC+8）計算，未校正真太陽時。"}</p> : null}
              <div className="zw-result-pillars" data-bazi-chart>
                {previewChart.pillars.map(pillar => (
                  <div key={pillar.key} data-pillar={pillar.key}>
                    <b>{pillarName(pillar.key, locale)}</b>
                    {pillar.ready && !(previewChart.timeUnknown && pillar.key === "time") ? (
                      <strong aria-label={ganzhiLabel(pillar.ganZhi, locale)}>
                        <span data-ganzhi-part="stem" data-element={pillar.ganElement}>{chartTerm(pillar.gan, locale).split(" · ")[0]}</span>
                        <span data-ganzhi-part="branch" data-element={pillar.zhiElement}>{chartTerm(pillar.zhi, locale).split(" · ")[0]}</span>
                      </strong>
                    ) : <span>{copy.unknownHour}</span>}
                  </div>
                ))}
              </div>
              <dl className="zw-result-facts">
                <div><dt>{copy.dayMaster}</dt><dd data-element={previewChart.dayMasterElement}>{foundationValues?.dayMaster ?? chartTerm(previewChart.dayMaster, locale)}</dd></div>
                <div><dt>{copy.monthOrder}</dt><dd data-element={previewChart.pillars.find(pillar => pillar.key === "month")?.zhiElement}>{chartTerm(previewChart.monthBranch, locale)}</dd></div>
              </dl>
            </section>
            <section data-result-section="02" data-home-bazi-explanation data-plain-summary aria-labelledby="bazi-title-02">
              <h2 id="bazi-title-02"><span className="zw-result-number">02</span>{copy.core}</h2>
              {plainItems.slice(0, 1).map(item => (
                <div key={item.key} data-plain-item={item.key}><strong>{item.title}</strong><p>{item.body}</p></div>
              ))}
            </section>
            <section data-result-section="03" aria-labelledby="bazi-title-03">
              <h2 id="bazi-title-03"><span className="zw-result-number">03</span>{copy.reading}</h2>
              {plainItems.slice(1, 2).map(item => (
                <div key={item.key} data-plain-item={item.key}><strong>{item.title}</strong><p>{item.body}</p></div>
              ))}
              {readingUnlocked ? plainItems.slice(2).map(item => (
                <div key={item.key} data-plain-item={item.key}><strong>{item.title}</strong><p>{item.body}</p></div>
              )) : null}
            </section>
            <section data-result-section="04" aria-labelledby="bazi-title-04">
              <h2 id="bazi-title-04"><span className="zw-result-number">04</span>{copy.atlas}</h2>
              <FreeStemBranchAtlas chart={previewChart} embedded />
              <details><summary>{copy.artwork}</summary><CharacterPanel chart={previewChart} /></details>
            </section>
            <section data-result-section="05" id="bazi-reading" tabIndex={-1} aria-labelledby="bazi-title-05">
              <h2 id="bazi-title-05"><span className="zw-result-number">05</span>{copy.deep}</h2>
              {readingUnlocked ? <>
                {foundationValues ? <UnifiedBirthReport birth={rememberedRecord} locale={locale} foundation={foundationValues} dayMaster={previewChart.dayMaster} termsLabel={copy.foundation} terms={
                  <dl data-report-mode="terms" className="zw-result-facts">
                    <div><dt>{copy.dayMaster}</dt><dd>{foundationValues.dayMaster}</dd></div>
                    <div><dt>{copy.monthOrder}</dt><dd>{foundationValues.monthOrder}</dd></div>
                    <div><dt>{copy.strength}</dt><dd>{foundationValues.strength}</dd></div>
                    <div><dt>{copy.structure}</dt><dd>{foundationValues.structure}</dd></div>
                    <div><dt>{copy.features}</dt><dd>{foundationValues.features}</dd></div>
                  </dl>
                } /> : null}
                <ChartTrustPanel chart={previewChart} locale={locale} />
              </> : <BaziReadingUnlock locale={locale} grade={rememberedGrade} pending={readingPaymentPending} />}
              <BaziChart chart={previewChart} showHeader={false} expandDetails={false} referenceOnly />
            </section>
            <section data-result-section="06" aria-labelledby="bazi-title-06">
              <h2 id="bazi-title-06"><span className="zw-result-number">06</span>{copy.nextSteps}</h2>
              <div className="zw-result-actions">
                <button type="button" className="zw-flow-next" onClick={() => selectStep(3)}>{copy.ask}</button>
                <a href="#bazi-reading">{copy.full}</a>
                <button type="button" onClick={() => void handleChartAction("share")}>{copy.share}</button>
                <button type="button" onClick={() => void handleChartAction("copy")}>{copy.copyChart}</button>
              </div>
              <span role="status">{actionStatus}</span>
              <FreeSummaryEmail locale={locale} />
            </section>
          </div>
        ) : <p role="status">{locale === "en" ? "Your chart could not be shown. Edit your birth details to try again." : locale === "zh-Hans" ? "命盘暂时无法显示，请修改出生资料后重试。" : "命盤暫時無法顯示，請修改出生資料後重試。"}</p>}
      </section> : null}

      {showQuestion && questionOpen ? (
        <section id="question-stage" className="zhaowu-question-sheet zhaowu-question-stage" aria-labelledby="zhaowu-question-title">
          <div className="zhaowu-question-stage-head">
            <div>
              <p className="zhaowu-section-kicker">{copy.questionKicker}</p>
              <h2 id="zhaowu-question-title">{copy.questionTitle}</h2>
            </div>
            <button type="button" className="zhaowu-question-birth-edit" onClick={() => { setDetailsOpen(true); setError(null); }}>{copy.editBirth}</button>
          </div>
          <label htmlFor="analysis-question" className="zhaowu-question-label">{copy.questionLabel}</label>
          <div className="zhaowu-quick-prompts" data-quick-prompts>
            <span className="zhaowu-quick-prompts-label">{copy.quickPromptsLabel}</span>
            <div className="zhaowu-quick-prompts-list">
              {copy.quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="zhaowu-quick-prompt-chip"
                  onClick={() => { setQuestion(prompt); document.getElementById("analysis-question")?.focus(); }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
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
          <BirthDataNotice locale={locale} variant="question" />
          <div className="zhaowu-question-meta">
            <span>{rememberedRecord ? formatSharedBirthRecord(rememberedRecord, locale) : ""}</span>
            <span>{question.length}/400</span>
          </div>
        </section>
      ) : null}

      {error ? <p role="alert" className="zhaowu-analysis-error">{error}</p> : null}
      {showQuestion && questionOpen ? (
        <div className="zhaowu-analysis-submit-wrap" data-analysis-stage="question">
          <button type="submit" disabled={busy}>{busy ? copy.analysing : copy.analyze}</button>
        </div>
      ) : null}
    </form>
  );
}
