import { buildDecisionReportModel } from "@/lib/report/decision-report-model";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandIcon } from "@/components/brand-icon";
import { readLocalReports, removeLocalReport, REPORT_HISTORY_EVENT, type LocalReport } from "@/lib/local-report-history";
import { readSharedBirthRecord } from "@/lib/shared-birth";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  clearSpecialistHistory,
  deleteSpecialistHistory,
  readSpecialistHistory,
  touchSpecialistHistoryOpened,
  type SpecialistHistoryEntry,
  type SpecialistHistoryKind,
} from "@/lib/specialist-history";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function kindLabel(kind: SpecialistHistoryKind, locale: Locale) {
  if (kind === "fun-five-element") return tr(locale, "五行功能測驗", "五行功能测验", "Five-Element Function Test");
  return tr(locale, "完整命盤紀錄", "完整命盘记录", "Complete chart record");
}

function HistoryPage() {
  const { locale } = useI18n();
  const [entries, setEntries] = useState<SpecialistHistoryEntry[]>([]);
  const publicEntries = entries;
  const [reports, setReports] = useState<LocalReport[]>([]);
  const [hasBirth, setHasBirth] = useState(false);
  useEffect(() => {
    const refresh = () => { setReports(readLocalReports()); setHasBirth(Boolean(readSharedBirthRecord())); };
    refresh();
    window.addEventListener(REPORT_HISTORY_EVENT, refresh);
    return () => window.removeEventListener(REPORT_HISTORY_EVENT, refresh);
  }, []);

  useEffect(() => {
    setEntries(readSpecialistHistory());
  }, []);

  const copy = useMemo(() => ({
    back: tr(locale, "返回昭梧", "返回昭梧", "Back to Zhaowu"),
    kicker: tr(locale, "昭梧 · 個人紀錄", "昭梧 · 个人记录", "ZHAOWU · MY HISTORY"),
    title: tr(locale, "我的報告", "我的报告", "My reports"),
    lead: tr(locale,
      "你建立的命書與提問報告會加密保存在這台裝置；無需註冊，隨時可以回來重看。",
      "你建立的命书与提问报告会加密保存在这台设备；无需注册，随时可以回来重看。",
      "Your charts and question reports are encrypted and saved on this device. No registration is required."),
    local: tr(locale, "僅保存在這台裝置", "仅保存在这台设备", "Saved on this device only"),
    empty: tr(locale, "還沒有報告", "还没有报告", "No reports yet"),
    generated: tr(locale, "生成時間", "生成时间", "Created"),
    open: tr(locale, "展開完整內容", "展开完整内容", "Open full result"),
    close: tr(locale, "收起內容", "收起内容", "Collapse result"),
    again: tr(locale, "再做一次", "再做一次", "Run again"),
    remove: tr(locale, "刪除這筆", "删除这条", "Delete"),
    clear: tr(locale, "清除全部本機紀錄", "清除全部本机记录", "Clear local history"),
    confirmOne: tr(locale, "確定刪除這筆紀錄？", "确定删除这条记录？", "Delete this history entry?"),
    confirmAll: tr(locale, "確定清除這台裝置上的全部本機紀錄？此動作無法復原。", "确定清除这台设备上的全部本机记录？此操作无法恢复。", "Clear all local history from this device? This cannot be undone."),
    start: tr(locale, "建立第一份命書後，報告會自動保存在這台裝置。", "建立第一份命书后，报告会自动保存在这台设备。", "Create your first chart and its report will be saved on this device."),
    createFirst: tr(locale, "建立第一份命書", "建立第一份命书", "Create my first chart"),
  }), [locale]);

  function markOpened(id: string, open: boolean) {
    if (!open) return;
    touchSpecialistHistoryOpened(id);
  }

  function removeEntry(id: string) {
    if (!window.confirm(copy.confirmOne)) return;
    deleteSpecialistHistory(id);
    setEntries(readSpecialistHistory());
  }

  function clearAll() {
    if (!window.confirm(copy.confirmAll)) return;
    clearSpecialistHistory();
    setEntries([]);
  }

  return (
    <main className="history-page">
      <div className="history-topline"><Link to="/">← {copy.back}</Link><span>{copy.local}</span></div>
      <section className="history-hero"><p>{copy.kicker}</p><h1>{copy.title}</h1><p>{copy.lead}</p></section>
      {hasBirth ? <section className="zw-saved-report-card"><h2>{tr(locale, "已保存的出生資料", "已保存的出生资料", "Saved birth details")}</h2><p>{tr(locale, "可繼續查看命盤，或用這份生辰提出新問題。", "可继续查看命盘，或用这份生辰提出新问题。", "Continue to your chart or ask a new question using these details.")}</p><a href="/#birth-form">{tr(locale, "查看命盤／繼續提問", "查看命盘／继续提问", "Open chart / ask a question")}</a></section> : null}
      {reports.map(({ result, savedAt, cloudSaved }) => <article key={result.id} className="zw-saved-report-card">
        <small>{new Date(savedAt).toLocaleString()} · {cloudSaved ? tr(locale, "已安全備份", "已安全备份", "Securely backed up") : copy.local}</small>
        <h2>{result.question}</h2>
        <p>{buildDecisionReportModel(result).directAnswer}</p>
        <button type="button" onClick={() => { window.location.assign(`/?report=${encodeURIComponent(result.id)}#report`); }}>{tr(locale, "閱讀報告", "阅读报告", "Read report")}</button>
        <button type="button" onClick={() => { if (window.confirm(copy.confirmOne)) { removeLocalReport(result.id); setReports(readLocalReports()); } }}>{copy.remove}</button>
      </article>)}
      {!publicEntries.length && !reports.length && !hasBirth ? (
        <section className="history-empty">
          <BrandIcon name="reports" size="lg" />
          <h2>{copy.empty}</h2>
          <p>{copy.start}</p>
          <div><a href="/#birth-form">{copy.createFirst}</a></div>
        </section>
      ) : (
        <section className="history-list" aria-label={copy.title}>
          {publicEntries.map((entry) => (
            <details key={entry.id} className="history-entry" onToggle={(event) => markOpened(entry.id, event.currentTarget.open)}>
              <summary><span className={`history-kind is-${entry.kind}`}>{kindLabel(entry.kind, locale)}</span><h2>{entry.title}</h2><p>{entry.inputSummary}</p><small>{copy.generated} · {new Date(entry.createdAt).toLocaleString(locale === "en" ? "en-AU" : locale === "zh-Hans" ? "zh-CN" : "zh-TW")}</small><b className="history-toggle"><span className="is-open">{copy.open}</span><span className="is-close">{copy.close}</span><i aria-hidden>＋</i></b></summary>
              <div className="history-entry-report">
                {entry.sections.map((section, index) => <article key={`${entry.id}-${index}`}><i aria-hidden>{String(index + 1).padStart(2, "0")}</i><div><h3>{section.title}</h3><p>{section.body}</p></div></article>)}
                {entry.closing ? <blockquote>{entry.closing}</blockquote> : null}
                <div className="history-entry-actions"><a href={entry.sourcePath}>{copy.again}</a><button type="button" onClick={() => removeEntry(entry.id)}>{copy.remove}</button></div>
              </div>
            </details>
          ))}
          <button type="button" className="history-clear" onClick={clearAll}>{copy.clear}</button>
        </section>
      )}
    </main>
  );
}
