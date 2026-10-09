import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { BaziKnowledgeNotesSection } from "@/components/bazi-knowledge-notes-section";
import { ZiweiKnowledgeNotesSection } from "@/components/ziwei-knowledge-notes-section";
import { ZiweiHomeEnvironmentArticle } from "@/components/ziwei-home-environment-article";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/knowledge")({ component: KnowledgePage });

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function KnowledgePage() {
  const { locale } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname.startsWith("/knowledge/")) return <Outlet />;

  return (
    <main className="mx-auto max-w-4xl space-y-5 pb-16">
      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <p className="text-xs tracking-[0.26em] text-cinnabar">{tr(locale,"昭梧 · 知識庫","昭梧 · 知识库","ZHAOWU · KNOWLEDGE")}</p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">{tr(locale,"觀世錄與命理小知識，分開看。","观世录与命理小知识，分开看。","Essays and teaching notes, clearly separated.")}</h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-ink-soft">
          {tr(locale,"先選你要看的內容：觀世錄讀文章與短札；命理小知識查方法、術語與判讀規則。","先选你要看的内容：观世录读文章与短札；命理小知识查方法、术语与判读规则。","Choose what you need: Notes on Life for essays and short reflections; Knowledge for methods, terms and reading rules.")}
        </p>

        <nav className="mt-6 grid gap-3 sm:grid-cols-2" aria-label={tr(locale,"知識庫分類","知识库分类","Knowledge sections")}>
          <a href="#guanshilu-articles" className="rounded-2xl border border-cinnabar/20 bg-paper px-5 py-4 transition hover:border-cinnabar/40">
            <span className="text-xs font-semibold tracking-[0.14em] text-cinnabar">{tr(locale,"觀世錄","观世录","NOTES ON LIFE")}</span>
            <strong className="mt-2 block font-display text-xl text-ink">{tr(locale,"文章與觀世短札","文章与观世短札","Essays & reflective notes")}</strong>
            <span className="mt-2 block text-sm leading-6 text-ink-soft">{tr(locale,"觀點、研究、長文、短札。","观点、研究、长文、短札。","Editorial writing, research and reflections.")}</span>
          </a>

          <a href="#mingli-knowledge" className="rounded-2xl border border-earth/25 bg-paper px-5 py-4 transition hover:border-earth/45">
            <span className="text-xs font-semibold tracking-[0.14em] text-earth">{tr(locale,"昭梧 · 命理小知識","昭梧 · 命理小知识","ZHAOWU · BAZI KNOWLEDGE")}</span>
            <strong className="mt-2 block font-display text-xl text-ink">{tr(locale,"方法與教學卡","方法与教学卡","Methods & teaching cards")}</strong>
            <span className="mt-2 block text-sm leading-6 text-ink-soft">{tr(locale,"八字與紫微的用途、基礎概念、判讀步驟與來源辨識。","八字与紫微的用途、基础概念、判读步骤与来源辨识。","BaZi and Zi Wei basics, reading methods and source checks.")}</span>
          </a>
        </nav>
      </section>

      <section id="guanshilu-articles" className="scroll-mt-20 space-y-5">
        <div className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
          <p className="text-xs tracking-[0.22em] text-cinnabar">{tr(locale,"觀世錄 · 文章","观世录 · 文章","NOTES ON LIFE · EDITORIAL")}</p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-ink">{tr(locale,"文章、研究札記與短札","文章、研究札记与短札","Essays, research notes and short reflections")}</h2>
          <p className="mt-3 text-sm leading-7 text-ink-soft">
            {tr(locale,"這裡只放觀點內容。長文標「文章」，較短的觀點內容標「短札」；命理知識卡不進這個列表。","这里只放观点内容。长文标“文章”，较短的观点内容标“短札”；命理知识卡不进这个列表。","This list contains editorial content only. Long-form pieces are labelled Article; shorter reflections are labelled Short note. Teaching cards do not enter this list.")}
          </p>
        </div>

        <LifeViewHomeSection archiveMode />
      </section>

      <BaziKnowledgeNotesSection />
      <ZiweiKnowledgeNotesSection />
      <ZiweiHomeEnvironmentArticle />

      <a href="/#birth-form" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-cream px-5 py-4 text-sm text-ink">
        <span>{tr(locale,"產生完整命盤","产生完整命盘","Create complete chart")}</span>
        <span className="text-cinnabar">→</span>
      </a>
    </main>
  );
}
