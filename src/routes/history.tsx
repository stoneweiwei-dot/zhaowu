import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  clearSpecialistHistory,
  deleteSpecialistHistory,
  readSpecialistHistory,
  type SpecialistHistoryEntry,
  type SpecialistHistoryKind,
} from "@/lib/specialist-history";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function kindLabel(kind: SpecialistHistoryKind, locale: Locale) {
  if (kind === "qizheng") return tr(locale, "七政四餘", "七政四余", "Seven Luminaries");
  if (kind === "ziwei") return tr(locale, "紫微斗數", "紫微斗数", "Zi Wei Dou Shu");
  if (kind === "fun-five-element") return tr(locale, "五行功能測驗", "五行功能测验", "Five-Element Function Test");
  return tr(locale, "前世今生・達摩一掌經", "前世今生・达摩一掌经", "Past & Present · Dharma Palm");
}

function HistoryPage() {
  const { locale } = useI18n();
  const [entries, setEntries] = useState<SpecialistHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(readSpecialistHistory());
  }, []);

  const copy = useMemo(() => ({
    back: tr(locale, "返回昭梧", "返回昭梧", "Back to Zhaowu"),
    kicker: tr(locale, "昭梧 · 個人紀錄", "昭梧 · 个人记录", "ZHAOWU · MY HISTORY"),
    title: tr(locale, "我的紀錄", "我的记录", "My history"),
    lead: tr(locale,
      "七政、紫微、前世今生與五行功能測驗會自動保存在這台裝置。點開任何一筆，就能重看當時的完整結果。",
      "七政、紫微、前世今生与五行功能测验会自动保存在这台设备。点开任何一条，就能重看当时的完整结果。",
      "Your Seven Luminaries, Zi Wei, Past & Present and Five-Element Function results are saved automatically on this device. Open any entry to read it again."),
    local: tr(locale, "僅保存在這台裝置", "仅保存在这台设备", "Saved on this device only"),
    cloudTitle: tr(locale, "八字提問與雲端報告", "八字提问与云端报告", "BaZi questions and cloud reports"),
    cloudBody: tr(locale,
      "登入後產生的八字提問與完整報告，繼續保存在「我的昭梧」。",
      "登录后产生的八字提问与完整报告，继续保存在“我的昭梧”。",
      "BaZi questions and full reports created while signed in remain in My Zhaowu."),
    cloudCta: tr(locale, "查看我的昭梧", "查看我的昭梧", "Open My Zhaowu"),
    empty: tr(locale, "還沒有紀錄。完成一次分析或測驗後，結果會自動出現在這裡。", "还没有记录。完成一次分析或测验后，结果会自动出现在这里。", "No saved results yet. Complete an analysis or test and it will appear here automatically."),
    generated: tr(locale, "生成時間", "生成时间", "Created"),
    open: tr(locale, "展開完整內容", "展开完整内容", "Open full result"),
    close: tr(locale, "收起內容", "收起内容", "Collapse result"),
    again: tr(locale, "再做一次", "再做一次", "Run again"),
    remove: tr(locale, "刪除這筆", "删除这条", "Delete"),
    clear: tr(locale, "清除全部本機紀錄", "清除全部本机记录", "Clear local history"),
    confirmOne: tr(locale, "確定刪除這筆紀錄？", "确定删除这条记录？", "Delete this history entry?"),
    confirmAll: tr(locale, "確定清除這台裝置上的全部本機紀錄？此動作無法復原。", "确定清除这台设备上的全部本机记录？此操作无法恢复。", "Clear all local history from this device? This cannot be undone."),
    start: tr(locale, "開始新的分析或測驗", "开始新的分析或测验", "Start a new analysis or test"),
  }), [locale]);

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
      <section className="history-cloud-card"><div><p>MY ZHAOWU</p><h2>{copy.cloudTitle}</h2><span>{copy.cloudBody}</span></div><Link to="/account">{copy.cloudCta}<b aria-hidden>→</b></Link></section>
      {!entries.length ? (
        <section className="history-empty">
          <span aria-hidden>記</span><h2>{copy.empty}</h2><p>{copy.start}</p>
          <div><Link to="/qizheng">{kindLabel("qizheng", locale)}</Link><Link to="/ziwei">{kindLabel("ziwei", locale)}</Link><Link to="/yizhangjing">{kindLabel("yizhangjing", locale)}</Link><Link to="/fun-tests">{kindLabel("fun-five-element", locale)}</Link></div>
        </section>
      ) : (
        <section className="history-list" aria-label={copy.title}>
          {entries.map((entry) => (
            <details key={entry.id} className="history-entry">
              <summary><span className={`history-kind is-${entry.kind}`}>{kindLabel(entry.kind, locale)}</span><h2>{entry.title}</h2><p>{entry.inputSummary}</p><small>{copy.generated} · {new Date(entry.createdAt).toLocaleString(locale === "en" ? "en-AU" : locale === "zh-Hans" ? "zh-CN" : "zh-TW")}</small><b className="history-toggle"><span className="is-open">{copy.open}</span><span className="is-close">{copy.close}</span><i aria-hidden>＋</i></b></summary>
              <div className="history-entry-report">
                {entry.sections.map((section, index) => <article key={`${entry.id}-${index}`}><i aria-hidden>{String(index + 1).padStart(2, "0")}</i><div><h3>{section.title}</h3><p>{section.body}</p></div></article>)}
                {entry.closing ? <blockquote>{entry.closing}</blockquote> : null}
                <div className="history-entry-actions"><Link to={entry.sourcePath}>{copy.again}</Link><button type="button" onClick={() => removeEntry(entry.id)}>{copy.remove}</button></div>
              </div>
            </details>
          ))}
          <button type="button" className="history-clear" onClick={clearAll}>{copy.clear}</button>
        </section>
      )}
    </main>
  );
}
