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
      "命書與提問報告加密保存在目前瀏覽器。請使用原裝置與原瀏覽器重看；清除網站資料或結束無痕瀏覽可能遺失紀錄。",
      "命书与提问报告加密保存在当前浏览器。请使用原设备与原浏览器重看；清除网站数据或结束无痕浏览可能丢失记录。",
      "Charts and question reports are encrypted in this browser. Return using the same device and browser; clearing site data or ending private browsing may erase them."),
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
      {hasBirth ? <section className="zw-saved-report-card"><h2>{tr(locale, "已保存的出生資料", "已保存的出生资料", "Saved birth details")}</h2><p>{tr(locale, "可繼續查看命盤，或用這份生辰提出新問題。", "可继续查看命盘，或用这份生辰提出新问题。", "Continue to your chart or ask a new question using these details.")}</p><Link to="/" hash="birth-form">{tr(locale, "查看命盤／繼續提問", "查看命盘／继续提问", "Open chart / ask a question")}</Link></section> : null}
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
          <div><Link to="/" hash="birth-form">{copy.createFirst}</Link></div>
          <details className="mt-5 text-sm leading-7">
            <summary className="min-h-11 cursor-pointer">{tr(locale, "之前建立過或已付款，卻找不到報告？", "之前建立过或已付款，却找不到报告？", "Created or paid for a report before?")}</summary>
            <p>{tr(locale, "請先回到購買時的裝置與瀏覽器（包括當時使用的 App 內建瀏覽器），不要再次付款。會員登入目前不會自動同步或還原報告。請保留付款收據與原有報告連結，以便核對購買權限。", "请先回到购买时的设备与浏览器（包括当时使用的 App 内置浏览器），不要再次付款。会员登录目前不会自动同步或恢复报告。请保留付款收据与原有报告链接，以便核对购买权限。", "Return to the device and browser used for purchase, including an in-app browser if applicable. Do not pay again. Signing in does not currently sync or restore reports. Keep your receipt and original report link for purchase verification.")}</p>
          </details>
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
