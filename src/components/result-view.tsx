import { useEffect, useState } from "react";
import { writeFullReport } from "@/lib/actions";
import type { AnalysisResult } from "@/lib/bazi/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { FocusedReportSections } from "@/components/paid-report-pages";
import { CharacterPanel } from "@/components/character-panel";
import { BaziChart } from "@/components/bazi-chart";
import { customerCopy, customerParagraphs } from "@/lib/report/customer-copy";
import { composeFocusedReport, renderFocusedReportText, type ReportSection } from "@/lib/report/focused-report";
import { buildDecisionReportModel } from "@/lib/report/decision-report-model";
import { buildWriterRequest, requestWrittenAnswer } from "@/lib/report/llm-answer";
import { buildComplexDeterministicAnswer, buildComplexReasoningRequest, requestComplexReasoning } from "@/lib/report/complex-reasoning";
import { buildPetDecision, isPetDecisionQuestion } from "@/lib/report/pet-decision";
import { generateDecreeImage, loadExistingDecreeImage } from "@/lib/bridge/decree-image";
import { patchReportRecord, saveReportRecord } from "@/lib/bridge/supabase-rest";
import {
  REPORT_ACCESS_PRODUCTS,
  resolveReportAccess,
  startReportCheckout,
  type ReportAccessLevel,
  type ReportAccessProduct,
} from "@/lib/report-access";
import { directAnswerCoversQuestion } from "@/lib/qa/answer-quality";

const RESULT_COPY = {
  "zh-Hant": { syncFailed: "內容已完成，但雲端同步暫時失敗；畫面內容不受影響。", fullFailed: "補充內容暫時未能生成。", saved: "完整報告已保存。", saveFailed: "保存失敗。", saving: "保存中…", updateSaved: "更新已保存報告", fullGenerate: "補充", fullGenerating: "整理中…", imageReady: "個人命象已生成並保存。", imageMatched: "已為你配對並保存圖庫命象。", imageLoadFailed: "命象圖未能載入；文字內容不受影響。", next: "下一步", evidence: "附註", evidenceLead: "", decree: "命理解讀" },
  "zh-Hans": { syncFailed: "内容已完成，但云端同步暂时失败；画面内容不受影响。", fullFailed: "补充内容暂时未能生成。", saved: "完整报告已保存。", saveFailed: "保存失败。", saving: "保存中…", updateSaved: "更新已保存报告", fullGenerate: "补充", fullGenerating: "整理中…", imageReady: "个人命象已生成并保存。", imageMatched: "已为你配对并保存图库命象。", imageLoadFailed: "命象图未能载入；文字内容不受影响。", next: "下一步", evidence: "附注", evidenceLead: "", decree: "命理解读" },
  en: { syncFailed: "The content is ready, but cloud sync failed temporarily. This page is still available.", fullFailed: "More detail could not be generated right now.", saved: "Report saved.", saveFailed: "Saving failed.", saving: "Saving…", updateSaved: "Update saved report", fullGenerate: "More", fullGenerating: "Preparing…", imageReady: "Your personal image has been generated and saved.", imageMatched: "Your matched gallery artwork has been saved.", imageLoadFailed: "The image could not be loaded. The written reading is unaffected.", next: "Next step", evidence: "Notes", evidenceLead: "", decree: "Reading" },
} as const;

export function ResultView({ result }: { result: AnalysisResult }) {
  const { t, locale } = useI18n();
  const copy = RESULT_COPY[locale];
  const { user, profile, session } = useCurrentUserState();
  const { fullReport, setFullReport, savedId, setSavedId, reset } = useAppStore();
  const [busy, setBusy] = useState<"full" | "save" | "image" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [reportSections, setReportSections] = useState<ReportSection[] | null>(null);
  const [reportSyncedId, setReportSyncedId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageReferenceAssetId, setImageReferenceAssetId] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<ReportAccessLevel>("none");
  const [purchasing, setPurchasing] = useState<ReportAccessProduct | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void resolveReportAccess("ziwei").then((acc) => {
      if (active) setAccessLevel(acc.level);
    });
    return () => { active = false; };
  }, []);

  async function handleUnlock(product: ReportAccessProduct) {
    setPurchasing(product);
    setPurchaseError(null);
    try {
      await startReportCheckout(product, "ziwei");
    } catch {
      setPurchaseError(locale === "en" ? "Checkout channel is not active yet. Pricing and boundary are locked." : "付款通道尚未啟用；價格與免費／付費邊界已經固定。");
      setPurchasing(null);
    }
  }
  const { chart, reading, question } = result;
  const petDecision = isPetDecisionQuestion(question) ? buildPetDecision(result, result.locale ?? locale) : null;
  const decisionModel = buildDecisionReportModel(result);
  const complexRule = !petDecision ? buildComplexDeterministicAnswer(result) : null;
  const [written, setWritten] = useState<{ key: string; answer: string; next: string; source: "reasoned" | "written" } | null>(null);
  const writerKey = `${result.id ?? ""}|${question}`;
  const lockDeterministicVerdict = Boolean(complexRule?.comparison);
  const writtenNow = !petDecision && !lockDeterministicVerdict && written?.key === writerKey ? written : null;
  const ruleAnswer = petDecision?.directAnswer ?? complexRule?.answer ?? decisionModel.directAnswer;
  const answer = writtenNow?.answer ?? ruleAnswer;
  const answerParagraphs = customerParagraphs(answer);
  const nextAction = petDecision ? customerCopy(reading.action) : writtenNow?.next ?? complexRule?.next ?? decisionModel.nextAction;

  useEffect(() => {
    // Rule answer is already on screen. Complex questions get one bounded reasoning
    // pass first; simpler eligible questions keep the cheaper wording-only writer.
    // Either path may replace the rule answer only after its client/server validators pass.
    if (petDecision || lockDeterministicVerdict) return;
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
  }, [writerKey, lockDeterministicVerdict]);
  const decreeCouplet = customerCopy(reading.decree);

  useEffect(() => {
    let cancelled = false;
    setImageUrl(null);
    setImageReferenceAssetId(null);
    if (!session || !user || !result.id) return () => { cancelled = true; };
    void loadExistingDecreeImage(session, result.id).then((out) => {
      if (cancelled) return;
      if (out.signedUrl) setImageUrl(out.signedUrl);
      setImageReferenceAssetId(out.galleryReferenceAssetId ?? null);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [result.id, session?.access_token, user?.id]);

  async function ensureFullReport() {
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
    const sections = reportSections ?? petDecision?.sections ?? composeFocusedReport(result);
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
    const sections = petDecision?.sections ?? composeFocusedReport(result);
    setReportSections(sections);
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

  async function onImage() {
    if (!session || !user) return;
    setBusy("image");
    setMsg(null);
    try {
      const reportId = await ensureSavedReport();
      const out = await generateDecreeImage(session, reportId, true);
      if (out.signedUrl) setImageUrl(out.signedUrl);
      setImageReferenceAssetId(out.galleryReferenceAssetId ?? null);
      setMsg(out.galleryDirect ? copy.imageMatched : copy.imageReady);
    } catch (err) { setMsg(err instanceof Error ? err.message : copy.fullFailed); }
    finally { setBusy(null); }
  }

  const hasDurableRecord = savedId === result.id || reportSyncedId === result.id;

  return (
    <section id="result" className="zhaowu-result-flow space-y-5" data-answer-first-r144="true">
      <article className="zhaowu-result-card seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.28em] text-cinnabar">{t("resultQ")}</p>
        <h2 className="mt-2 font-display text-2xl">{question}</h2>
        {!writtenNow && complexRule ? (
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
            {answerParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        )}
        {nextAction ? <aside className="zhaowu-result-next mt-5 border-t border-line/70 pt-4" data-next-action><strong className="text-sm text-ink">{copy.next}</strong><p className="mt-1 text-[14px] leading-7 text-ink-soft">{nextAction}</p></aside> : null}
      </article>

      <details className="zhaowu-result-evidence seal-border rounded-xl bg-cream/90" data-technical-evidence>
        <summary className="cursor-pointer list-none px-5 py-4 sm:px-6"><strong>{copy.evidence}</strong>{copy.evidenceLead ? <span className="mt-1 block text-xs leading-5 text-ink-mute">{copy.evidenceLead}</span> : null}</summary>
        <div className="space-y-5 border-t border-line/60 p-4 sm:p-6">
          <div className="zhaowu-answer-meta zhaowu-answer-meta--notes" data-answer-meta>
            <div data-evidence-status><span>{locale === "en" ? "Evidence status" : locale === "zh-Hans" ? "依据状态" : "依據狀態"}</span><b>{decisionModel.confidenceLabel}</b><small>{decisionModel.confidenceBasis}</small></div>
            <div data-biggest-variable><span>{locale === "en" ? "Biggest variable" : locale === "zh-Hans" ? "最大现实变量" : "最大現實變數"}</span><b>{decisionModel.biggestVariable}</b></div>
          </div>
          {decreeCouplet ? <div className="zhaowu-free-decree rounded-xl border border-line/60 p-4" data-free-decree><strong className="text-sm text-ink">{copy.decree}</strong><p className="mt-2 text-[14px] leading-7 text-ink-soft">{decreeCouplet}</p></div> : null}
          <BaziChart chart={chart} expandDetails={false} />
          <CharacterPanel chart={chart} question={question} portraitUrl={imageUrl} selectedAssetId={imageReferenceAssetId} onGenerate={session && user ? () => void onImage() : undefined} generating={busy === "image"} onImageError={() => { setImageUrl(null); setMsg(copy.imageLoadFailed); }} />
        </div>
      </details>

      {/* ── 付費命書內容邊界與進階解鎖入口 ── */}
      <section className="zhaowu-destiny-unlock-gate seal-border rounded-xl bg-cream/95 p-5 sm:p-7 mt-6" data-destiny-unlock-gate>
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <span className="text-xs font-semibold tracking-widest text-cinnabar uppercase">
            {locale === "en" ? "Paid Deep Reading" : locale === "zh-Hans" ? "付费进阶深批" : "付費進階深批"}
          </span>
          <span className="text-xs text-ink-mute">
            {accessLevel === "system" || accessLevel === "bundle"
              ? (locale === "en" ? "✓ Unlocked" : "✓ 已解鎖")
              : (locale === "en" ? "One-time unlock · No recurring fees" : "單次解鎖 · 不設自動續費")}
          </span>
        </div>

        <h3 className="mt-3 font-display text-xl text-ink">
          {locale === "en" ? "Unlock Full Destiny Book" : locale === "zh-Hans" ? "解锁昭梧深批命书" : "解鎖昭梧深批命書"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          {locale === "en"
            ? "Your 3-part direct verdict is free forever. To unlock deep 10-year luck cycles, monthly timing rhythms, full shensha stars, and multi-system synthesis, select a reading depth below:"
            : locale === "zh-Hans"
            ? "上方三段式核心直断永久免费。若需进一步推演十年大运起伏、流年逐月吉凶、完整神煞星曜与多流派合参，请选择下方深批规格："
            : "上方三段式核心直斷永久免費。若需進一步推演十年大運起伏、流年逐月吉凶、完整神煞星曜與多流派合參，請選擇下方深批規格："}
        </p>

        {/* 內容邊界清單 */}
        <ul className="my-4 space-y-2 rounded-lg bg-paper-clean/70 p-4 text-xs leading-5 text-ink-soft border border-line/40">
          <li className="flex items-start gap-2">
            <span className="text-cinnabar">✦</span>
            <span>{locale === "en" ? "10-Year Luck Cycle & Monthly Timing (Precise turning points)" : "十年大運起伏與流年逐月節奏（精準定位轉折時機）"}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cinnabar">✦</span>
            <span>{locale === "en" ? "Complete ShenSha Stars & Pattern Analysis (Personality & blind spots)" : "完整四柱神煞星曜與深層格局全解（性格盲區與潛在契機）"}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cinnabar">✦</span>
            <span>{locale === "en" ? "Multi-System Star Chart Synthesis (Ziwei & Qi Zheng overlay)" : "跨流派星象合參（紫微斗數命盤、七政四餘合照）"}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cinnabar">✦</span>
            <span>{locale === "en" ? "Five-Tone Harmonic Tuning & Personal Sacred Beast sequence" : "五音調和聆聽序列與專屬命象瑞獸圖譜"}</span>
          </li>
        </ul>

        {/* 新用戶福利：快速進階讀現已預設免費開放，不再是購買項目 */}
        <div className="my-4 flex items-start gap-2 rounded-lg border border-wood/30 bg-wood/5 p-3 text-xs leading-5 text-ink-soft">
          <span className="text-cinnabar">🎁</span>
          <span>
            {locale === "en"
              ? "New-user welcome gift: Quick Read (core cycle & first key observation) is now included for everyone at no cost — no purchase needed."
              : locale === "zh-Hans"
              ? "新用户的福利：快速进阶读（核心大运走势与第一关键留心点）现已对所有人免费开放，不需购买。"
              : "新用戶的福利：快速進階讀（核心大運走勢與第一關鍵留心點）現已對所有人免費開放，不需購買。"}
          </span>
        </div>

        {/* 價格階梯卡片 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 my-4">
          <div className="flex flex-col justify-between rounded-lg border-2 border-cinnabar/80 bg-cinnabar/5 p-4 text-center relative shadow-sm">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-cinnabar px-2 py-0.5 text-[10px] text-cream font-medium">
              {locale === "en" ? "Recommended" : "推薦深批"}
            </span>
            <div>
              <strong className="block text-sm text-ink">{locale === "en" ? "Full Destiny Book" : "完整單盤深批"}</strong>
              <span className="mt-1 block font-display text-lg text-cinnabar">{REPORT_ACCESS_PRODUCTS.system.price}</span>
              <p className="mt-1 text-xs text-ink-mute">{locale === "en" ? "Full multi-section report & personal profile" : "完整深批全段落與個人命格專頁"}</p>
            </div>
            <button
              type="button"
              disabled={purchasing !== null}
              onClick={() => void handleUnlock("system")}
              className="mt-3 w-full rounded-full bg-cinnabar py-2 text-xs font-medium text-cream hover:opacity-90 disabled:opacity-60"
            >
              {purchasing === "system" ? "…" : (locale === "en" ? `Unlock ${REPORT_ACCESS_PRODUCTS.system.price}` : `解鎖 ${REPORT_ACCESS_PRODUCTS.system.price}`)}
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-line/70 bg-cream p-4 text-center">
            <div>
              <strong className="block text-sm text-ink">{locale === "en" ? "6 Systems Bundle" : "全六盤典藏"}</strong>
              <span className="mt-1 block font-display text-lg text-cinnabar">{REPORT_ACCESS_PRODUCTS.bundle.price}</span>
              <p className="mt-1 text-xs text-ink-mute">{locale === "en" ? "All six astrology systems & full profile" : "六大術數流派合參與完整專頁"}</p>
            </div>
            <button
              type="button"
              disabled={purchasing !== null}
              onClick={() => void handleUnlock("bundle")}
              className="mt-3 w-full rounded-full border border-line py-2 text-xs font-medium text-ink hover:bg-paper-clean disabled:opacity-60"
            >
              {purchasing === "bundle" ? "…" : (locale === "en" ? `Unlock ${REPORT_ACCESS_PRODUCTS.bundle.price}` : `解鎖 ${REPORT_ACCESS_PRODUCTS.bundle.price}`)}
            </button>
          </div>
        </div>

        {purchaseError ? (
          <p className="mt-2 text-xs text-cinnabar" role="alert">{purchaseError}</p>
        ) : null}

        <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs text-ink-mute">
          <span>{locale === "en" ? "Free 3-part report remains accessible anytime" : "三段式免費報告隨時可查，無任何強制要求"}</span>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onFull()}
            className="text-xs text-cinnabar underline hover:opacity-80"
          >
            {reportSections ? (locale === "en" ? "Re-generate reading" : "重新排布報告") : (locale === "en" ? "Preview full reading" : "預覽深批內容")}
          </button>
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
      {reportSections ? <FocusedReportSections sections={reportSections} result={result} /> : null}
      <p className="text-xs leading-6 text-ink-mute mt-4">{t("disclaimer")}</p>
    </section>
  );
}
