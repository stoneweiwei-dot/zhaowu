import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { prepareWechatDraft, type WechatDraftFields } from "@/lib/wechat-draft";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

/** A safe, offline handoff until this specific WeChat account's draft API permissions are proven. */
export function WechatDraftPanel({ locale, fields, sourceId }: { locale: Locale; fields: WechatDraftFields; sourceId: string }) {
  const draft = useMemo(() => prepareWechatDraft(fields), [fields.title, fields.summary, fields.body]);
  const [notice, setNotice] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sourceReviewed, setSourceReviewed] = useState(false);
  const [privacyReviewed, setPrivacyReviewed] = useState(false);
  useEffect(() => {
    setNotice("");
    setSourceReviewed(false);
    setPrivacyReviewed(false);
  }, [sourceId, fields.title, fields.summary, fields.body]);
  async function copy(value: string, field: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(tr(locale, `已複製${field}；尚未傳送微信。`, `已复制${field}；尚未发送微信。`, `${field} copied; nothing sent to WeChat.`));
    } catch {
      setPreviewOpen(true);
      setNotice(tr(locale, "無法自動複製，請長按下方預覽文字選取。", "无法自动复制，请长按下方预览文字选取。", "Clipboard unavailable. Select the text in the preview below."));
    }
  }
  return (
    <aside className="mt-6 rounded-xl border border-line bg-cream/95 p-4" data-wechat-draft-panel>
      <p className="text-xs tracking-widest text-cinnabar">WECHAT · EDITORIAL HANDOFF</p>
      <h3 className="mt-2 font-display text-xl text-ink">{tr(locale, "昭梧觀象｜微信草稿準備", "昭梧观象｜微信草稿准备", "WeChat draft preparation")}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{tr(locale,
        "使用上方正在編輯的內容整理微信版本。這是本機複製流程，不會自動寫入微信草稿箱或群發；先在微信後台確認並預覽。",
        "使用上方正在编辑的内容整理微信版本。这是本机复制流程，不会自动写入微信草稿箱或群发；先在微信后台确认并预览。",
        "Prepare the current article for WeChat. This is a local copy workflow, not an API upload or a publication. Review it inside WeChat before posting.")}</p>
      {draft.warnings.length ? <p role="alert" className="mt-3 text-sm text-cinnabar">{tr(locale, "請先檢查標題、摘要長度及正文內容。", "请先检查标题、摘要长度及正文内容。", "Review the title, summary length, and body before copying.")} ({draft.warnings.join(", ")})</p> : null}
      <div className="mt-4 space-y-3 text-sm text-ink">
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={sourceReviewed} onChange={e => setSourceReviewed(e.target.checked)} />{tr(locale, "已核對引文、來源與內容", "已核对引文、来源与内容", "Sources and quotations checked")}</label>
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={privacyReviewed} onChange={e => setPrivacyReviewed(e.target.checked)} />{tr(locale, "已排除私人資料及未授權圖片", "已排除私人资料及未授权图片", "Private data and image rights checked")}</label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy(draft.title, tr(locale,"標題","标题","Title"))} disabled={!draft.title} className="min-h-11 rounded-lg border border-line bg-paper px-4 text-sm text-ink disabled:opacity-40">{tr(locale,"複製標題","复制标题","Copy title")}</button>
        <button type="button" onClick={() => void copy(draft.summary, tr(locale,"摘要","摘要","Summary"))} disabled={!draft.summary} className="min-h-11 rounded-lg border border-line bg-paper px-4 text-sm text-ink disabled:opacity-40">{tr(locale,"複製摘要","复制摘要","Copy summary")}</button>
        <button type="button" onClick={() => void copy(draft.formatted, tr(locale,"文章","文章","Article"))} disabled={!!draft.warnings.length || !sourceReviewed || !privacyReviewed} className="min-h-11 rounded-lg bg-wood px-4 text-sm text-cream disabled:opacity-40">{tr(locale,"複製微信文章","复制微信文章","Copy WeChat article")}</button>
        <button type="button" onClick={() => setPreviewOpen(v => !v)} className="min-h-11 rounded-lg border border-line px-4 text-sm text-ink" aria-expanded={previewOpen}>{tr(locale, "展開文字預覽", "展开文字预览", "Text preview")}</button>
      </div>
      {notice ? <p role="status" className="mt-3 text-sm text-ink">{notice}</p> : null}
      {previewOpen ? <label className="mt-4 block text-sm text-ink">{tr(locale,"微信文案（可長按複製）","微信文案（可长按复制）","Copyable WeChat text")}<textarea readOnly className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink" rows={12} value={draft.formatted} /></label> : null}
      <a href="https://mp.weixin.qq.com/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-line bg-paper px-4 text-sm text-ink">{tr(locale,"開啟微信公眾號後台","打开微信公众号后台","Open WeChat Official Accounts")}</a>
      <p className="mt-3 text-xs leading-5 text-ink-mute">{tr(locale,
        "狀態：僅本機待審草稿。封面請在微信後台使用已授權原圖；未經微信後台確認，不得標記已發佈。",
        "状态：仅本机待审草稿。封面请在微信后台使用已授权原图；未经微信后台确认，不得标记已发布。",
        "Status: local draft, pending review. Select an authorized cover inside WeChat. Not published.")}</p>
    </aside>
  );
}
