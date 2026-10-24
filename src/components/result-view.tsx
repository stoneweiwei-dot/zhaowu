import { toSimplifiedCustomerText } from "@/lib/report/reading-locale";
import { useEffect, useState } from "react";
import { writeFullReport } from "@/lib/actions";
import type { AnalysisResult } from "@/lib/bazi/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { oncePerSession, trackConversion } from "@/lib/observability/conversion-telemetry";
import { PurchaseConsent, usePurchaseConsent } from "@/components/purchase-consent";
import { DataGradeFooter } from "@/components/data-grade-footer";
import { MobileReadingGuide } from "@/components/mobile-reading-guide";
import { FocusedReportSections } from "@/components/paid-report-pages";
import { FollowUpBox } from "@/components/follow-up-box";
import { CharacterPanel } from "@/components/character-panel";
import { BaziChart } from "@/components/bazi-chart";
import { ReportTimingGuide } from "@/components/report-timing-guide";
import { customerCopy, customerParagraphs } from "@/lib/report/customer-copy";
import { composeFocusedReport, renderFocusedReportText, type ReportSection } from "@/lib/report/focused-report";
import { buildDecisionReportModel } from "@/lib/report/decision-report-model";
import { buildWriterRequest, requestWrittenAnswer } from "@/lib/report/llm-answer";
import { buildComplexDeterministicAnswer, buildComplexReasoningRequest, requestComplexReasoning } from "@/lib/report/complex-reasoning";
import { buildPetDecision, isPetDecisionQuestion } from "@/lib/report/pet-decision";
import { patchReportRecord, saveReportRecord } from "@/lib/bridge/supabase-rest";
import {
  reportAccessPrice,
  resolveReportAccess,
  startReportCheckout,
  type ReportAccessLevel,
  type ReportAccessProduct,
} from "@/lib/report-access";
import { directAnswerCoversQuestion } from "@/lib/qa/answer-quality";
import { foodPreferenceAnswer } from "@/lib/report/food-preference-answer";

const RESULT_COPY = {
  "zh-Hant": { syncFailed: "內容已完成，但雲端同步暫時失敗；畫面內容不受影響。", fullFailed: "補充內容暫時未能生成。", saved: "完整報告已保存。", saveFailed: "保存失敗。", saving: "保存中…", updateSaved: "更新已保存報告", fullGenerate: "補充", fullGenerating: "整理中…", imageReady: "個人命象已生成並保存。", imageMatched: "已為你配對並保存圖庫命象。", imageLoadFailed: "命象圖未能載入；文字內容不受影響。", next: "下一步", evidence: "命盤與天干地支圖", evidenceLead: "", decree: "命理解讀", chartDetail: "展開命盤與人物詳解" },
  "zh-Hans": { syncFailed: "内容已完成，但云端同步暂时失败；画面内容不受影响。", fullFailed: "补充内容暂时未能生成。", saved: "完整报告已保存。", saveFailed: "保存失败。", saving: "保存中…", updateSaved: "更新已保存报告", fullGenerate: "补充", fullGenerating: "整理中…", imageReady: "个人命象已生成并保存。", imageMatched: "已为你配对并保存图库命象。", imageLoadFailed: "命象图未能载入；文字内容不受影响。", next: "下一步", evidence: "命盘与天干地支图", evidenceLead: "", decree: "命理解读", chartDetail: "展开命盘与人物详解" },
  en: { syncFailed: "The content is ready, but cloud sync failed temporarily. This page is still available.", fullFailed: "More detail could not be generated right now.", saved: "Report saved.", saveFailed: "Saving failed.", saving: "Saving…", updateSaved: "Update saved report", fullGenerate: "More", fullGenerating: "Preparing…", imageReady: "Your personal image has been generated and saved.", imageMatched: "Your matched gallery artwork has been saved.", imageLoadFailed: "The image could not be loaded. The written reading is unaffected.", next: "Next step", evidence: "Chart and artwork", evidenceLead: "", decree: "Reading", chartDetail: "Expand chart & character detail" },
} as const;

export function ResultView({ result }: { result: AnalysisResult }) {
  const { t, locale } = useI18n();
  const copy = RESULT_COPY[locale];
  const { user, profile, session } = useCurrentUserState();
  const { fullReport, setFullReport, savedId, setSavedId, reset } = useAppStore();
  const [busy, setBusy] = useState<"full" | "save" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [reportSections, setReportSections] = useState<ReportSection[] | null>(null);
  const [reportSyncedId, setReportSyncedId] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<ReportAccessLevel>("none");
  const [ownerAccess, setOwnerAccess] = useState(false);
  const [purchasing, setPurchasing] = useState<ReportAccessProduct | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const consent = usePurchaseConsent(result.dataGrade);

  useEffect(() => {
    let active = true;
    void resolveReportAccess("bazi").then((acc) => {
      if (!active) return;
      setAccessLevel(acc.level);
      setOwnerAccess(Boolean(acc.owner));
      if (!acc.owner && acc.level !== "system" && oncePerSession("paywall:bazi")) {
        trackConversion("zhaowu_paywall_viewed", { system: "bazi", level: acc.level });
      }
    }).catch(() => { if (active) { setAccessLevel("none"); setOwnerAccess(false); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (oncePerSession(`answer-shown:${result.id ?? ""}`)) trackConversion("zhaowu_answer_shown", { system: "bazi" });
  }, [result.id]);

  async function handleUnlock(product: ReportAccessProduct) {
    if (!consent.require()) return;
    setPurchasing(product);
    setPurchaseError(null);
    try {
      await startReportCheckout(product, "bazi", result.id);
    } catch {
      setPurchaseError(locale === "en" ? "Checkout channel is not active yet. Pricing and boundary are locked." : locale === "zh-Hans" ? toSimplifiedCustomerText("付款通道尚未啟用；價格與免費／付費邊界已經固定。") : "付款通道尚未啟用；價格與免費／付費邊界已經固定。");
      setPurchasing(null);
    }
  }
  const unlocked = accessLevel === "system";
  const { chart, reading, question } = result;
  const foodAnswer = foodPreferenceAnswer(question, result.locale ?? locale);
  const foodSections: ReportSection[] = foodAnswer ? foodAnswer.detail.map((body, index) => ({ sectionNo: index + 1, pageNo: index + 1, key: `food-${index + 1}` as ReportSection["key"], title: index === 0 ? (locale === "en" ? "Start with one meal" : locale === "zh-Hans" ? "先从一餐开始" : "先從一餐開始") : (locale === "en" ? "Practical choices" : locale === "zh-Hans" ? "实际选择" : "實際選擇"), body: [body], optional: false, evidence: { facts: [], conditions: [], limits: [], checks: [] } })) : [];
  const petDecision = !foodAnswer && isPetDecisionQuestion(question) ? buildPetDecision(result, result.locale ?? locale) : null;
  const decisionModel = buildDecisionReportModel(result);
  const complexRule = !foodAnswer && !petDecision ? buildComplexDeterministicAnswer(result) : null;
  const [written, setWritten] = useState<{ key: string; answer: string; next: string; source: "reasoned" | "written" } | null>(null);
  const writerKey = `${result.id ?? ""}|${question}`;
  const lockDeterministicVerdict = Boolean(foodAnswer || complexRule?.comparison);
  const writtenNow = unlocked && !foodAnswer && !petDecision && !lockDeterministicVerdict && written?.key === writerKey ? written : null;
  const ruleAnswer = foodAnswer?.answer ?? petDecision?.directAnswer ?? complexRule?.answer ?? decisionModel.directAnswer;
  const answer = writtenNow?.answer ?? ruleAnswer;
  const answerParagraphs = customerParagraphs(answer);
  const nextAction = foodAnswer?.nextAction ?? (petDecision ? customerCopy(reading.action) : writtenNow?.next ?? complexRule?.next ?? decisionModel.nextAction);

  useEffect(() => {
    // Rule answer is already on screen. Complex questions get one bounded reasoning
    // pass first; simpler eligible questions keep the cheaper wording-only writer.
    // Either path may replace the rule answer only after its client/server validators pass.
    if (!unlocked || foodAnswer || petDecision || lockDeterministicVerdict) return;
    let cancelled = false;

    const runWriter = async () => {
      const req = buildWriterRequest(result);
      if (!req) return;
      const out = await requestWrittenAnswer(req);
      if (!cancelled && out && directAnswerCoversQuestion(question, out.answer)) {
        setWritten({ key: writerKey, ...out, source: "written" });
      }
    };

    const complex = buildComplexReasoningRequest(result);
    if (complex) {
      void requestComplexReasoning(complex)
        .then((out) => {
          if (!cancelled && out && directAnswerCoversQuestion(question, out.answer)) {
            setWritten({ key: writerKey, answer: out.answer, next: out.next, source: "reasoned" });
          } else if (!cancelled) {
            void runWriter();
          }
        })
        .catch(() => { if (!cancelled) void runWriter(); });
    } else {
      void runWriter();
    }

    return () => { cancelled = true; };
  }, [writerKey, lockDeterministicVerdict, unlocked, foodAnswer]);
  const decreeCouplet = customerCopy(reading.decree);



  async function ensureFullReport() {
    if (foodAnswer) return renderFocusedReportText(foodSections, result.locale ?? locale);
    // The three free sections may be saved, but full paid text must never be
    // requested or persisted before a server-verified purchase or owner access.
    if (accessLevel !== "system") {
      return renderFocusedReportText(foodAnswer ? foodSections : petDecision?.sections ?? composeFocusedReport(result), result.locale ?? locale);
    }
    if (fullReport) return fullReport;
    if (petDecision) {
      const text = renderFocusedReportText(petDecision.sections, result.locale ?? locale);
      setFullReport(text);
      return text;
    }
    const out = await writeFullReport({ data: { question, chart, reading, palm: result.palm ?? null, locale: result.locale ?? locale } });
    setFullReport(out.text);
    return out.text;
  }

  async function ensureSavedReport() {
    if (!session || !user) throw new Error(t("needLogin"));
    const reportText = await ensureFullReport();
    const sections = foodAnswer ? foodSections : reportSections ?? petDecision?.sections ?? composeFocusedReport(result);
    setReportSections(sections);
    const row = await saveReportRecord({ session, profile, result, fullReport: reportText, ninePages: sections });
    const reportId = row?.id ?? result.id;
    setSavedId(reportId);
    setReportSyncedId(reportId);
    return reportId;
  }

  async function onFull() {
    setBusy("full");
    setMsg(null);
    const sections = foodAnswer ? foodSections : petDecision?.sections ?? composeFocusedReport(result);
    setReportSections(sections);
    if (accessLevel !== "system") {
      setBusy(null); // Free preview is built locally; no paid full-report request.
      return;
    }
    try {
      const text = await ensureFullReport();
      if (session && user) {
        try {
          const row = await patchReportRecord({ session, profile, result, status: "report_ready", fullReport: text, ninePages: sections });
          const reportId = row?.id ?? result.id;
          setSavedId(reportId);
          setReportSyncedId(reportId);
        } catch {
          setReportSyncedId(null);
          setMsg(copy.syncFailed);
        }
      }
    } catch (err) {
      setMsg(err instanceof Error && locale !== "en" ? err.message : copy.fullFailed);
    } finally {
      setBusy(null);
    }
  }

  async function onSave() {
    if (!session || !user) return;
    setBusy("save");
    setMsg(null);
    try { await ensureSavedReport(); setMsg(copy.saved); }
    catch (err) { setReportSyncedId(null); setMsg(err instanceof Error && locale !== "en" ? err.message : copy.saveFailed); }
    finally { setBusy(null); }
  }

  const hasDurableRecord = savedId === result.id || reportSyncedId === result.id;

  return (
    <section id="result" className="zhaowu-result-flow space-y-5" data-answer-first-r144="true">
      <article className="zhaowu-result-card seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.28em] text-cinnabar">{t("resultQ")}</p>
        <h2 className="mt-2 font-display text-2xl">{question}</h2>
        {unlocked && !writtenNow && complexRule ? (
          <div className="zhaowu-answer-steps" data-primary-answer data-answer-source="rule" data-complex-answer="true">
            <section className="zhaowu-answer-step">
              <span>{locale === "en" ? "01 · ANSWER" : locale === "zh-Hans" ? "01 · 直接结论" : "01 · 直接結論"}</span>
              <strong data-decision-verdict>{complexRule.verdict}</strong>
              {complexRule.basisNote ? <p data-answer-basis={complexRule.verdictBasis}>{complexRule.basisNote}</p> : null}
            </section>
            <section className="zhaowu-answer-step">
              <span>{locale === "en" ? "02 · WHY" : locale === "zh-Hans" ? "02 · 为什么" : "02 · 為什麼"}</span>
              <p>{complexRule.reason}</p>
            </section>
            {complexRule.comparison ? (
              <section className="zhaowu-answer-step">
                <span>{locale === "en" ? "03 · COMPARE" : locale === "zh-Hans" ? "03 · 放在同一张表比较" : "03 · 放在同一張表比較"}</span>
                <div className="zhaowu-answer-compare">
                  <div><b>{complexRule.comparison.leftLabel}</b>{complexRule.comparison.left}</div>
                  <div><b>{complexRule.comparison.rightLabel}</b>{complexRule.comparison.right}</div>
                </div>
              </section>
            ) : null}
            {complexRule.timing ? (
              <section className="zhaowu-answer-step">
                <span>{locale === "en" ? "04 · TIMING" : locale === "zh-Hans" ? "04 · 时间窗口" : "04 · 時間窗口"}</span>
                <p>{complexRule.timing}</p>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-[15px] leading-8 text-ink-soft transition-opacity duration-300" data-primary-answer data-answer-source={writtenNow?.source ?? "rule"}>
            {(unlocked ? answerParagraphs : answerParagraphs.slice(0, 2)).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        )}
        {unlocked && nextAction ? <aside className="zhaowu-result-next mt-5 border-t border-line/70 pt-4" data-next-action><strong className="text-sm text-ink">{copy.next}</strong><p className="mt-1 text-[14px] leading-7 text-ink-soft">{nextAction}</p></aside> : null}
      </article>

      {unlocked ? <>
        <div className="seal-border rounded-xl bg-cream/95 p-5" data-answer-detail>
          <MobileReadingGuide model={decisionModel} locale={locale} showPrimary={false} narrative={reportSections?.find((section) => section.narrative)?.narrative} />
        </div>
        <FollowUpBox result={result} />
      </> : <p className="text-sm leading-6 text-ink-soft" data-follow-up-locked>{locale === "en" ? "This is a short preview. Unlock below for the full answer and follow-up questions." : locale === "zh-Hans" ? "当前为简短试读；完整答案与连续追问，解锁后开放。" : "目前為簡短試讀；完整答案與連續追問，解鎖後開放。"}</p>}

      <details className="zhaowu-result-evidence seal-border rounded-xl bg-cream/90" data-technical-evidence>
        <summary className="cursor-pointer list-none px-5 py-4 sm:px-6"><strong>{copy.evidence}</strong>{copy.evidenceLead ? <span className="mt-1 block text-xs leading-5 text-ink-mute">{copy.evidenceLead}</span> : null}</summary>
        <div className="space-y-5 border-t border-line/60 p-4 sm:p-6">
          <p className="zhaowu-answer-meta zhaowu-answer-meta--line text-xs leading-6 text-ink-mute" data-answer-meta>
            <span data-evidence-status>{locale === "en" ? "Evidence" : locale === "zh-Hans" ? "依据" : "依據"}{locale === "en" ? ": " : "："}{decisionModel.confidenceLabel}</span>
            {decisionModel.biggestVariable ? <><br /><span data-biggest-variable>{locale === "en" ? "Key variable" : locale === "zh-Hans" ? "关键变数" : "關鍵變數"}{locale === "en" ? ": " : "："}{decisionModel.biggestVariable}</span></> : null}
          </p>
          <div className="zhaowu-result-evidence-chart" data-evidence-chart-detail>
            <div className="space-y-5 border-t border-line/40 p-4">
              {decreeCouplet ? <div className="zhaowu-free-decree rounded-xl border border-line/60 p-4" data-free-decree><strong className="text-sm text-ink">{copy.decree}</strong><p className="mt-2 text-[14px] leading-7 text-ink-soft">{decreeCouplet}</p></div> : null}
              <BaziChart chart={chart} expandDetails={false} />
              <CharacterPanel chart={chart} question={question} />
            </div>
          </div>
        </div>
      </details>

      {unlocked ? <ReportTimingGuide chart={chart} unlocked /> : null}
      {unlocked ? <DataGradeFooter grade={result.dataGrade} locale={locale} /> : null}

      {/* ── 付費命書內容邊界與進階解鎖入口 ── */}
      <section className="zhaowu-destiny-unlock-gate seal-border rounded-xl bg-cream/95 p-5 sm:p-7 mt-6" data-destiny-unlock-gate>
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <span className="text-xs font-semibold tracking-widest text-cinnabar uppercase">
            {locale === "en" ? "Paid Deep Reading" : locale === "zh-Hans" ? "付费进阶深批" : "付費進階深批"}
          </span>
          <span className="text-xs text-ink-mute">
            {accessLevel === "system"
              ? (locale === "en" ? "✓ Unlocked" : locale === "zh-Hans" ? toSimplifiedCustomerText("✓ 已解鎖") : "✓ 已解鎖")
              : (locale === "en" ? "One-time unlock · No recurring fees" : locale === "zh-Hans" ? toSimplifiedCustomerText("單次解鎖 · 不設自動續費") : "單次解鎖 · 不設自動續費")}
          </span>
        </div>

        <h3 className="mt-3 font-display text-xl text-ink">
          {locale === "en" ? "Unlock Full Destiny Book" : locale === "zh-Hans" ? "解锁昭梧深批命书" : "解鎖昭梧深批命書"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          {locale === "en"
            ? "Your basic chart and short preview are free. Unlock the full BaZi reading, detailed timing, reasons and follow-up questions below:"
            : locale === "zh-Hans"
            ? "基本排盘与简短试读免费；完整解读、详细时运、判断依据与连续追问，解锁后开放。"
            : "基本排盤與簡短試讀免費；完整解讀、詳細時運、判斷依據與連續追問，解鎖後開放。"}
        </p>

        {/* 內容邊界清單 */}
        <ul className="my-4 space-y-2 rounded-lg bg-paper-clean/70 p-4 text-xs leading-5 text-ink-soft border border-line/40">
          <li className="flex items-start gap-2">
            <span className="text-cinnabar">✦</span>
            <span>{locale === "en" ? "10-Year Luck Cycle & Monthly Timing (Conditions and timing)" : locale === "zh-Hans" ? toSimplifiedCustomerText("十年大運起伏與流年逐月節奏（整理轉折條件與時機）") : "十年大運起伏與流年逐月節奏（整理轉折條件與時機）"}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cinnabar">✦</span>
            <span>{locale === "en" ? "Complete ShenSha Stars & Pattern Analysis (Personality & blind spots)" : locale === "zh-Hans" ? toSimplifiedCustomerText("完整四柱神煞星曜與深層格局全解（性格盲區與潛在契機）") : "完整四柱神煞星曜與深層格局全解（性格盲區與潛在契機）"}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cinnabar">✦</span>
            <span>{locale === "en" ? "BaZi luck-cycle and chart-pattern evidence" : locale === "zh-Hans" ? toSimplifiedCustomerText("八字大運、流年與格局依據的交叉解讀") : "八字大運、流年與格局依據的交叉解讀"}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cinnabar">✦</span>
            <span>{locale === "en" ? "Ten-Stem portrait and the branch scenery found in your chart" : locale === "zh-Hans" ? toSimplifiedCustomerText("十天干日主圖與命盤中實際出現的地支景色") : "十天干日主圖與命盤中實際出現的地支景色"}</span>
          </li>
        </ul>

        {/* 價格卡：站主 2026-10-11 決定首頁只賣八字命書；六盤合購方案不在首頁出現（六盤頁面各自有入口）。
            站主登入（伺服器驗證的 owner session）一律免費，不顯示購買按鈕。 */}
        {ownerAccess ? (
          <p className="my-4 rounded-lg border border-wood/30 bg-wood/5 p-3 text-center text-xs leading-5 text-ink-soft" data-owner-free-access>
            {locale === "en" ? "Owner signed in: every reading is free — nothing to buy." : locale === "zh-Hans" ? "站主已登入：全部内容免费阅读，无需购买。" : "站主已登入：全部內容免費閱讀，無需購買。"}
          </p>
        ) : (
        <div className="mx-auto my-4 grid max-w-sm grid-cols-1 gap-3">
          <div className="flex flex-col justify-between rounded-lg border-2 border-cinnabar/80 bg-cinnabar/5 p-4 text-center relative shadow-sm">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-cinnabar px-2 py-0.5 text-[10px] text-cream font-medium">
              {locale === "en" ? "Recommended" : locale === "zh-Hans" ? toSimplifiedCustomerText("推薦深批") : "推薦深批"}
            </span>
            <div>
              <strong className="block text-sm text-ink">{locale === "en" ? "BaZi Full Reading" : locale === "zh-Hans" ? "八字命书完整深批" : "八字命書完整深批"}</strong>
              <span className="mt-1 block font-display text-lg text-cinnabar">{reportAccessPrice("system", "bazi").price}</span>
              <p className="mt-1 text-xs text-ink-mute">{locale === "en" ? "Full BaZi reading, luck cycles and monthly guidance" : locale === "zh-Hans" ? "八字命书完整解读、大运流年与流月指引" : "八字命書完整解讀、大運流年與流月指引"}</p>
            </div>
            <button
              type="button"
              disabled={purchasing !== null}
              onClick={() => void handleUnlock("system")}
              className="mt-3 w-full rounded-full bg-cinnabar py-2 text-xs font-medium text-cream hover:opacity-90 disabled:opacity-60"
            >
              {purchasing === "system" ? "…" : (locale === "en" ? `Unlock ${reportAccessPrice("system", "bazi").price}` : `解鎖 ${reportAccessPrice("system", "bazi").price}`)}
            </button>
          </div>

        </div>
        )}

        <PurchaseConsent locale={locale} checked={consent.checked} needed={consent.needed} onChange={consent.toggle} grade={result.dataGrade} gradeAck={consent.gradeAck} gradeNeeded={consent.gradeNeeded} onGradeChange={consent.toggleGrade} />

        {purchaseError ? (
          <p className="mt-2 text-xs text-cinnabar" role="alert">{purchaseError}</p>
        ) : null}

        <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs text-ink-mute">
          <span>{locale === "en" ? "Your short preview remains available" : locale === "zh-Hans" ? toSimplifiedCustomerText("簡短試讀可隨時重看") : "簡短試讀可隨時重看"}</span>
          {unlocked ? <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onFull()}
            className="text-xs text-cinnabar underline hover:opacity-80"
          >
            {reportSections ? (locale === "en" ? "Re-generate reading" : locale === "zh-Hans" ? toSimplifiedCustomerText("重新排布報告") : "重新排布報告") : (locale === "en" ? (accessLevel === "system" ? "View full reading" : "View free 3-part summary") : locale === "zh-Hans" ? toSimplifiedCustomerText(accessLevel === "system" ? "查看完整深批" : "查看免費三段摘要") : (accessLevel === "system" ? "查看完整深批" : "查看免費三段摘要"))}
          </button> : null}
        </div>
      </section>

      {/* ── 操作按鈕組 ── */}
      <div className="zhaowu-result-actions flex flex-col gap-3 mt-6">
        {session && user ? (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onSave()}
            className="zhaowu-result-secondary h-12 rounded-full border border-line bg-cream px-5 text-ink disabled:opacity-60"
          >
            {busy === "save" ? copy.saving : hasDurableRecord ? copy.updateSaved : t("save")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          className="zhaowu-result-reset h-12 rounded-full px-5 text-ink-soft hover:text-ink"
        >
          {t("reset")}
        </button>
      </div>

      {msg ? <p className="zhaowu-result-message text-sm text-cinnabar mt-2">{msg}</p> : null}
      {unlocked && reportSections ? <FocusedReportSections sections={reportSections} result={result} showChartArtwork={false} showReadingGuide={false} /> : null}
      <p className="text-xs leading-6 text-ink-mute mt-4">{t("disclaimer")}</p>
    </section>
  );
}
