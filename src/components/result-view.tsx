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
import { buildPetDecision, isPetDecisionQuestion } from "@/lib/report/pet-decision";
import { generateDecreeImage, loadExistingDecreeImage } from "@/lib/bridge/decree-image";
import { patchReportRecord, saveReportRecord } from "@/lib/bridge/supabase-rest";

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
  const { chart, reading, question } = result;
  const petDecision = isPetDecisionQuestion(question) ? buildPetDecision(result, result.locale ?? locale) : null;
  const decisionModel = buildDecisionReportModel(result);
  const answer = petDecision?.directAnswer ?? decisionModel.directAnswer;
  const answerParagraphs = customerParagraphs(answer);
  const nextAction = customerCopy(reading.action);
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
        <div className="mt-4 space-y-3 text-[15px] leading-8 text-ink-soft" data-primary-answer>
          {answerParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
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

      <div className="zhaowu-result-actions flex flex-col gap-3">
        <button type="button" disabled={busy !== null} onClick={() => void onFull()} className="zhaowu-result-primary h-12 rounded-full bg-cinnabar px-5 text-cream disabled:opacity-60">{busy === "full" ? copy.fullGenerating : copy.fullGenerate}</button>
        {session && user ? <button type="button" disabled={busy !== null} onClick={() => void onSave()} className="zhaowu-result-secondary h-12 rounded-full border border-line bg-cream px-5 text-ink disabled:opacity-60">{busy === "save" ? copy.saving : hasDurableRecord ? copy.updateSaved : t("save")}</button> : null}
        <button type="button" onClick={() => reset()} className="zhaowu-result-reset h-12 rounded-full px-5 text-ink-soft">{t("reset")}</button>
      </div>

      {msg ? <p className="zhaowu-result-message text-sm text-cinnabar">{msg}</p> : null}
      {reportSections ? <FocusedReportSections sections={reportSections} result={result} /> : null}
      <p className="text-xs leading-6 text-ink-mute">{t("disclaimer")}</p>
    </section>
  );
}
