import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LIFE_VIEW_LONG_FORM_ARTICLES } from "@/lib/life-view-long-form";

export const Route = createFileRoute("/knowledge/southern-hemisphere-bazi-reading")({ component: ArticlePage });
function ArticlePage() {
  const { locale } = useI18n();
  const article = LIFE_VIEW_LONG_FORM_ARTICLES.find((item) => item.id === "southern-hemisphere-bazi-reading");
  if (!article) return null;
  return <main className="mx-auto max-w-3xl px-5 pb-16 pt-8" data-merged-article="southern-hemisphere-bazi-reading">
    <Link to="/knowledge" className="text-sm text-cinnabar underline">← {locale === "en" ? "Knowledge" : "返回知識庫"}</Link>
    <article className="seal-border mt-5 rounded-2xl bg-paper p-6 sm:p-10">
      <p className="text-xs tracking-[0.2em] text-cinnabar">ZHAOWU · {locale === "en" ? "ESSAY" : "觀世錄文章"}</p>
      <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">{article.title[locale]}</h1>
      <p className="mt-4 text-sm leading-7 text-ink-soft">{article.summary[locale]}</p>
      <div className="mt-8 whitespace-pre-wrap text-[15px] leading-8 text-ink">{article.body[locale]}</div>
    </article>
  </main>;
}
