import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { writeFullReport } from "@/lib/actions";
import type { AnalysisResult } from "@/lib/bazi/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { FocusedReportSections } from "@/components/paid-report-pages";
import { customerDirectAnswer, customerParagraphs } from "@/lib/report/customer-copy";
import { composeFocusedReport, type ReportSection } from "@/lib/report/focused-report";
import { generateDecreeImage } from "@/lib/report/decree-image";
import { buildFreeDecreeCouplet } from "@/lib/report/decree-copy";
import { buildFreeDirectAnswer } from "@/lib/report/final-reading";
import { patchReportRecord, saveReportRecord } from "@/lib/supabase-rest";

const RESULT_COPY = {
  "zh-Hant": {
    syncFailed: "完整報告已整理完成，但雲端同步暫時失敗；畫面內容不受影響。",
    fullFailed: "完整報告暫時未能生成。",
    saved: "完整報告已保存到同一筆記錄。",
    saveFailed: "保存失敗。",
    saving: "保存中…",
    updateSaved: "更新已保存報告",
    fullGenerate: "查看完整報告",
    fullGenerating: "正在整理與這一問直接相關的內容…",
    imageGenerate: "生成個人命誥圖",
    imageGenerating: "命誥圖生成中…",
    imageReady: "個人命誥圖已生成並保存。",
    imageLoadFailed: "命誥圖未能載入；文字答案與完整報告不受影響。",
    imageAlt: "昭梧個人命誥圖",
  },
  "zh-Hans": {
    syncFailed: "完整报告已整理完成，但云端同步暂时失败；画面内容不受影响。",
    fullFailed: "完整报告暂时未能生成。",
    saved: "完整报告已保存到同一笔记录。",
    saveFailed: "保存失败。",
    saving: "保存中…",
    updateSaved: "更新已保存报告",
    fullGenerate: "查看完整报告",
    fullGenerating: "正在整理与你这一问直接相关的内容…",
    imageGenerate: "生成个人命诰图",
    imageGenerating: "命诰图生成中…",
    imageReady: "个人命诰图已生成并保存。",
    imageLoadFailed: "命诰图未能载入；文字答案与完整报告不受影响。",
    imageAlt: "昭梧个人命诰图",
  },
  en: {
    syncFailed: "The full report is ready, but cloud sync failed temporarily. The report remains available on this page.",
    fullFailed: "The full report could not be generated right now.",
    saved: "The full report has been saved to this record.",
    saveFailed: "Saving failed.",
    saving: "Saving…",
    updateSaved: "Update saved report",
    fullGenerate: "View full report",
    fullGenerating: "Organizing only what directly serves this question…",
    imageGenerate: "Generate personal decree image",
    imageGenerating: "Generating decree image…",
    imageReady: "Your personal decree image has been generated and saved.",
    imageLoadFailed: "The decree image could not be loaded. Your text answer and full report remain available.",
    imageAlt: "Zhaowu personal decree image",
  },
} as const;

export function ResultView({ result }: { result: AnalysisResult }) {
  const { t, locale } = useI18n();
  const copy = RESULT_COPY[locale];
  const { user, profile, session, isPending } = useCurrentUserState();
  const { fullReport, setFullReport, savedId, setSavedId, reset } = useAppStore();
  const [busy, setBusy] = useState<"full" | "save" | "image" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [reportSections, setReportSections] = useState<ReportSection[] | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { chart, reading, question } = result;
  const answer = customerDirectAnswer(question, buildFreeDirectAnswer(question, chart, reading, locale));
  const answerParagraphs = customerParagraphs(answer);
  const decreeCouplet = buildFreeDecreeCouplet(chart, locale);

  async function ensureFullReport() {
    if (fullReport) return fullReport;
    const out = await writeFullReport({ data: { question, chart, reading, palm: result.palm ?? null, locale: result.locale ?? locale } });
    setFullReport(out.text);
    return out.text;
  }

  async function ensureSavedReport() {
    if (!session || !user) throw new Error(t("needLogin"));
    const reportText = await ensureFullReport();
    const sections = reportSections ?? composeFocusedReport(result);
    setReportSections(sections);
    const row = await saveReportRecord({
      session,
      profile,
      result,
      fullReport: reportText,
      // Legacy field name in the persistence adapter; content is the new dynamic section schema.
      ninePages: sections,
    });
    setSavedId(row?.id ?? result.id);
    return row?.id ?? result.id;
  }

  async function onFull() {
    setBusy("full");
    setMsg(null);
    try {
      const sections = composeFocusedReport(result);
      const text = await ensureFullReport();
      setReportSections(sections);
      if (session && user) {
        try {
          await patchReportRecord({
            session,
            profile,
            result,
            status: "report_ready",
            fullReport: text,
            ninePages: sections,
          });
          setSavedId(result.id);
        } catch {
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
    if (!session || !user) {
      setMsg(t("needLogin"));
      return;
    }
    setBusy("save");
    setMsg(null);
    try {
      await ensureSavedReport();
      setMsg(copy.saved);
    } catch (err) {
      setMsg(err instanceof Error && locale !== "en" ? err.message : copy.saveFailed);
    } finally {
      setBusy(null);
    }
  }

  async function onImage() {
    if (!session || !user) {
      setMsg(t("needLogin"));
      return;
    }
    setBusy("image");
    setMsg(null);
    try {
      const reportId = await ensureSavedReport();
      const out = await generateDecreeImage(session, reportId);
      if (out.signedUrl) setImageUrl(out.signedUrl);
      setMsg(copy.imageReady);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : copy.fullFailed);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section id="result" className="space-y-5">
      <article className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.28em] text-cinnabar">{t("resultQ")}</p>
        <h2 className="mt-2 font-display text-2xl">{question}</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-8 text-ink-soft">
          {answerParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </article>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" disabled={busy !== null} onClick={() => void onFull()} className="h-12 min-w-[180px] flex-1 rounded-full bg-cinnabar px-5 text-cream disabled:opacity-60">
          {busy === "full" ? copy.fullGenerating : copy.fullGenerate}
        </button>
        {isPending ? <span className="h-12 flex-1 animate-pulse rounded-full bg-paper-deep" /> : user ? (
          <>
            <button type="button" disabled={busy !== null} onClick={() => void onSave()} className="h-12 min-w-[150px] flex-1 rounded-full border border-line bg-cream px-5 text-ink disabled:opacity-60">
              {busy === "save" ? copy.saving : savedId ? copy.updateSaved : t("save")}
            </button>
            <button type="button" disabled={busy !== null} onClick={() => void onImage()} className="h-12 min-w-[180px] flex-1 rounded-full border border-cinnabar/35 bg-cinnabar/5 px-5 text-cinnabar disabled:opacity-60">
              {busy === "image" ? copy.imageGenerating : copy.imageGenerate}
            </button>
          </>
        ) : <Link to="/login" className="grid h-12 min-w-[150px] flex-1 place-items-center rounded-full border border-line bg-cream px-5">{t("needLogin")}</Link>}
        <button type="button" onClick={() => reset()} className="h-12 rounded-full px-5 text-ink-soft">{t("reset")}</button>
      </div>

      {msg ? <p className="text-sm text-cinnabar">{msg}</p> : null}
      <article className="seal-border rounded-xl bg-cream/95 p-4 sm:p-6">
        <blockquote className="mx-auto max-w-sm whitespace-pre-line text-center font-display text-lg leading-8 tracking-[0.08em] text-ink">
          {decreeCouplet}
        </blockquote>
      </article>
      {imageUrl ? (
        <article className="seal-border rounded-xl bg-cream/95 p-4 sm:p-6">
          <div className="mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-xl border border-line bg-paper-deep shadow-sm">
            <img src={imageUrl} alt={copy.imageAlt} className="h-full w-full object-cover" onError={() => { setImageUrl(null); setMsg(copy.imageLoadFailed); }} />
          </div>
        </article>
      ) : null}
      {reportSections ? <FocusedReportSections sections={reportSections} /> : null}
      <p className="text-xs leading-6 text-ink-mute">{t("disclaimer")}</p>
    </section>
  );
}
