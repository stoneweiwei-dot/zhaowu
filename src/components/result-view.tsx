import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { writeFullReport } from "@/lib/actions";
import type { AnalysisResult } from "@/lib/bazi/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { PaidReportPages } from "@/components/paid-report-pages";
import { customerDirectAnswer, customerParagraphs } from "@/lib/report/customer-copy";
import { composeNinePages, type NinePage } from "@/lib/report/nine-page";
import { patchReportRecord, saveReportRecord } from "@/lib/supabase-rest";

export function ResultView({ result }: { result: AnalysisResult }) {
  const { t } = useI18n();
  const { user, profile, session, isPending } = useCurrentUserState();
  const { fullReport, setFullReport, savedId, setSavedId, reset } = useAppStore();
  const [busy, setBusy] = useState<"full" | "save" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [ninePages, setNinePages] = useState<NinePage[] | null>(null);
  const { chart, reading, question } = result;
  const answer = customerDirectAnswer(question, reading.directAnswer);
  const answerParagraphs = customerParagraphs(answer);

  async function ensureFullReport() {
    if (fullReport) return fullReport;
    const out = await writeFullReport({ data: { question, chart, reading, palm: result.palm ?? null } });
    setFullReport(out.text);
    return out.text;
  }

  async function onFull() {
    setBusy("full");
    setMsg(null);
    try {
      const pages = composeNinePages(result);
      const text = await ensureFullReport();
      setNinePages(pages);
      if (session && user) {
        try {
          await patchReportRecord({
            session,
            profile,
            result,
            status: "report_ready",
            fullReport: text,
            ninePages: pages,
          });
          setSavedId(result.id);
        } catch {
          setMsg("完整報告已整理完成，但雲端同步暫時失敗；畫面內容不受影響。");
        }
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "完整報告暫時未能生成。");
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
      const reportText = await ensureFullReport();
      const pages = ninePages ?? composeNinePages(result);
      setNinePages(pages);
      const row = await saveReportRecord({
        session,
        profile,
        result,
        fullReport: reportText,
        ninePages: pages,
      });
      setSavedId(row?.id ?? result.id);
      setMsg("完整九頁報告已保存到同一筆記錄。");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "保存失敗。");
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

      <article className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.28em] text-cinnabar">{t("chart")}</p>
            <h3 className="mt-1 font-display text-xl">{t("dayMaster")} {chart.dayMaster}{chart.dayMasterElement} · {t("monthLing")} {chart.monthBranch}</h3>
          </div>
          <p className="text-sm text-ink-mute">{chart.lunarDate}</p>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {chart.pillars.map((pillar) => {
            const ready = pillar.ready !== false && pillar.ganZhi !== "未定" && Boolean(pillar.gan);
            return (
              <div key={pillar.key} className="rounded-md border border-line bg-paper/50 px-2 py-3 text-center">
                <p className="text-[10px] tracking-[0.12em] text-ink-mute">{pillar.label}</p>
                <p className="mt-1 font-display text-xl tracking-[0.08em] sm:text-2xl">{ready ? pillar.ganZhi : "未定"}</p>
              </div>
            );
          })}
        </div>
      </article>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" disabled={busy !== null} onClick={() => void onFull()} className="h-12 min-w-[180px] flex-1 rounded-full bg-cinnabar px-5 text-cream disabled:opacity-60">
          {busy === "full" ? t("generating") : t("genFull")}
        </button>
        {isPending ? <span className="h-12 flex-1 animate-pulse rounded-full bg-paper-deep" /> : user ? (
          <button type="button" disabled={busy !== null} onClick={() => void onSave()} className="h-12 min-w-[150px] flex-1 rounded-full border border-line bg-cream px-5 text-ink disabled:opacity-60">
            {busy === "save" ? "保存中…" : savedId ? "更新已保存報告" : t("save")}
          </button>
        ) : <Link to="/login" className="grid h-12 min-w-[150px] flex-1 place-items-center rounded-full border border-line bg-cream px-5">{t("needLogin")}</Link>}
        <button type="button" onClick={() => reset()} className="h-12 rounded-full px-5 text-ink-soft">{t("reset")}</button>
      </div>

      {msg ? <p className="text-sm text-cinnabar">{msg}</p> : null}
      {ninePages ? <PaidReportPages pages={ninePages} /> : null}
      <p className="text-xs leading-6 text-ink-mute">{t("disclaimer")}</p>
    </section>
  );
}
