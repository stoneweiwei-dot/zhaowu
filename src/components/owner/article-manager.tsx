import { useEffect, useMemo, useState } from "react";
import { ARTICLE_CATALOG } from "@/components/life-view-home-section";
import { applyArticleOverrides, type ArticleOverride } from "@/lib/article-overrides";
import { ownerData } from "@/lib/owner-data-client";
import type { Locale } from "@/lib/i18n";
import type { LifeViewArticle } from "@/lib/life-view";

type Fields = Pick<LifeViewArticle, "title" | "summary" | "body">;
type ListReply = { ok: boolean; articles: ArticleOverride[] };
type WriteReply = { ok: boolean; article: ArticleOverride };
const LANGUAGES: { code: Locale; name: string }[] = [
  { code: "zh-Hant", name: "繁體中文" },
  { code: "zh-Hans", name: "简体中文" },
  { code: "en", name: "English" },
];
function t(locale: Locale, zh: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : zh;
}
const inputClass = "w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink";
function initialSelection() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("edit") || "";
}
export function OwnerArticleManager({ locale }: { locale: Locale }) {
  const [rows, setRows] = useState<ArticleOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(initialSelection);
  const [editorLanguage, setEditorLanguage] = useState<Locale>(locale);
  const [form, setForm] = useState<Fields | null>(null);

  const entries = useMemo(() => ARTICLE_CATALOG.map((base) => {
    const override = rows.find((row) => row.id === base.id);
    const merged = applyArticleOverrides([base], override && !override.archived ? [override] : [])[0];
    return { base, article: merged, archived: Boolean(override?.archived), changed: Boolean(override?.body || override?.title || override?.summary) };
  }), [rows]);
  const selected = entries.find((item) => item.base.id === selectedId);
  const filtered = entries.filter((entry) => {
    const q = search.trim().toLowerCase();
    return !q || entry.article.title[locale].toLowerCase().includes(q) || entry.base.id.includes(q);
  });

  useEffect(() => {
    let active = true;
    void ownerData<ListReply>("article.list").then((res) => {
      if (!active) return;
      setRows(res.articles ?? []);
    }).catch((e) => { if (active) setError(e instanceof Error ? e.message : "Article loading failed"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selected) { setForm(null); return; }
    const article = selected.article;
    setForm({
      title: { ...article.title },
      summary: { ...article.summary },
      body: { ...article.body },
    });
  }, [selectedId, rows]);

  function choose(id: string) {
    setSelectedId(id);
    setMessage("");
    setError("");
  }
  async function changeArchive(id: string, archived: boolean) {
    const article = entries.find((e) => e.base.id === id);
    if (!article) return;
    if (archived && !window.confirm(t(locale,
      `將「${article.article.title[locale]}」從公開網站下架？可在此還原。`,
      `将「${article.article.title[locale]}」从公开网站下架？可以还原。`,
      `Remove “${article.article.title[locale]}” from the public site? You can restore it.`))) return;
    setBusyId(id); setError(""); setMessage("");
    try {
      const res = await ownerData<WriteReply>("article.archive", { id, archived });
      setRows((current) => [...current.filter((row) => row.id !== id), res.article]);
      setMessage(t(locale, archived ? "已下架文章。" : "已還原文章。", archived ? "文章已下架。" : "文章已还原。", archived ? "Article unpublished." : "Article restored."));
    } catch (e) { setError(e instanceof Error ? e.message : "Action failed"); }
    finally { setBusyId(null); }
  }
  async function save() {
    if (!form || !selected) return;
    if (LANGUAGES.some(({ code }) => !form.title[code].trim() || !form.summary[code].trim() || !form.body[code].trim())) {
      setError(t(locale, "三種語言的標題、摘要及內文均不得空白。", "三种语言的标题、摘要及正文均不能为空。", "Titles, summaries and bodies are required in all three languages."));
      return;
    }
    setBusyId(selected.base.id); setError(""); setMessage("");
    try {
      const res = await ownerData<WriteReply>("article.save", { id: selected.base.id, ...form });
      setRows((current) => [...current.filter((row) => row.id !== selected.base.id), res.article]);
      setMessage(t(locale, "已保存，公開文章同步更新。", "已保存，公开文章同步更新。", "Saved. Public article updated."));
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setBusyId(null); }
  }
  async function reset() {
    if (!selected || !window.confirm(t(locale, "恢復此篇文章原始版本？所有後台編輯與下架設定都會清除。", "恢复这篇文章的原始版本？所有后台编辑和下架设置都会清除。", "Reset this article to its original version, including its published status?"))) return;
    setBusyId(selected.base.id); setError(""); setMessage("");
    try {
      await ownerData("article.reset", { id: selected.base.id });
      setRows((current) => current.filter((row) => row.id !== selected.base.id));
      setMessage(t(locale, "已還原原始版本。", "已恢复原始版本。", "Original restored."));
    } catch (e) { setError(e instanceof Error ? e.message : "Reset failed"); }
    finally { setBusyId(null); }
  }
  function update(field: keyof Fields, value: string) {
    if (!form) return;
    setForm((current) => current ? { ...current, [field]: { ...current[field], [editorLanguage]: value } } : null);
  }

  return (
    <section className="seal-border rounded-xl bg-cream/95 p-4 sm:p-7" data-owner-articles>
      <p className="text-xs tracking-[0.22em] text-cinnabar">ARTICLES · EDITOR</p>
      <h2 className="mt-2 font-display text-2xl text-ink">{t(locale, "文章管理", "文章管理", "Article management")}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{t(locale,
        "每篇文章可編輯繁中、簡中與英文，或暫時下架；下架不會刪除歷史原稿。",
        "每篇文章可编辑繁中、简中与英文，或暂时下架；下架不会删除历史原稿。",
        "Edit all three languages or unpublish an article. Unpublishing keeps the original.")}</p>
      {error ? <p role="alert" className="mt-3 rounded-xl border border-cinnabar/30 p-3 text-sm text-cinnabar">{error}</p> : null}
      {message ? <p role="status" className="mt-3 text-sm text-ink">{message}</p> : null}
      {loading ? <p role="status" className="mt-4 text-sm text-ink-soft">Loading articles…</p> : (
        <>
          <label className="mt-5 block text-sm text-ink">
            {t(locale, "搜尋文章", "搜索文章", "Search articles")}
            <input className={inputClass + " mt-2"} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t(locale,"輸入標題或文章 ID","输入标题或文章 ID","Title or article ID")} />
          </label>
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto" data-article-list>
            {filtered.map(({ base, article, archived, changed }) => (
              <div key={base.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line/70 bg-paper p-3">
                <div className="min-w-0 flex-1 text-sm text-ink">
                  <p className="font-semibold">{article.title[locale]}</p>
                  <p className="mt-1 text-xs text-ink-mute">{archived ? t(locale,"已下架","已下架","Unpublished") : changed ? t(locale,"已編輯","已编辑","Edited") : t(locale,"原始文章","原始文章","Original")}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="min-h-11 rounded-full border border-line px-3 text-xs text-ink" onClick={() => choose(base.id)}>{t(locale,"編輯","编辑","Edit")}</button>
                  <button type="button" disabled={busyId !== null} className="min-h-11 rounded-full border border-cinnabar/30 px-3 text-xs text-cinnabar disabled:opacity-40" onClick={() => void changeArchive(base.id, !archived)}>
                    {archived ? t(locale,"還原","还原","Restore") : t(locale,"刪除","删除","Remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {selected && form ? (
        <div className="mt-6 rounded-xl border border-line bg-paper/75 p-4" data-article-editor={selected.base.id}>
          <h3 className="font-display text-xl text-ink">{selected.article.title[locale]}</h3>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Article language">
            {LANGUAGES.map(({ code, name }) => <button type="button" key={code} aria-pressed={editorLanguage === code} onClick={() => setEditorLanguage(code)}
              className={`min-h-11 rounded-full border px-4 text-sm ${editorLanguage === code ? "border-wood bg-wood text-cream" : "border-line text-ink"}`}>{name}</button>)}
          </div>
          <label className="mt-4 block text-sm text-ink">{t(locale,"標題","标题","Title")}
            <input className={inputClass + " mt-2"} maxLength={240} value={form.title[editorLanguage]} onChange={(e) => update("title",e.target.value)} />
          </label>
          <label className="mt-4 block text-sm text-ink">{t(locale,"摘要","摘要","Summary")}
            <textarea className={inputClass + " mt-2"} rows={3} maxLength={1500} value={form.summary[editorLanguage]} onChange={(e) => update("summary",e.target.value)} />
          </label>
          <label className="mt-4 block text-sm text-ink">{t(locale,"文章內文（以空行分段）","文章正文（空行分段）","Body (blank lines separate paragraphs)")}
            <textarea className={inputClass + " mt-2"} rows={12} maxLength={80000} value={form.body[editorLanguage]} onChange={(e) => update("body",e.target.value)} />
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" disabled={busyId !== null} onClick={() => void save()} className="min-h-11 rounded-full bg-wood px-5 text-sm text-cream disabled:opacity-50">{t(locale,"保存全部語言","保存全部语言","Save all languages")}</button>
            <button type="button" disabled={busyId !== null} onClick={() => void reset()} className="min-h-11 rounded-full border border-line px-4 text-sm text-ink disabled:opacity-50">{t(locale,"還原原文","恢复原文","Reset original")}</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
