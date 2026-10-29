import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BaziKnowledgeNotesSection } from "@/components/bazi-knowledge-notes-section";
import { ZiweiKnowledgeNotesSection } from "@/components/ziwei-knowledge-notes-section";
import { ZiweiHomeEnvironmentArticle } from "@/components/ziwei-home-environment-article";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
import { useI18n, type Locale } from "@/lib/i18n";
import { CuratedVideoShelf } from "@/components/curated-video-shelf";

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
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">{tr(locale,"文章與命理小知識，分開看。","文章与命理小知识，分开看。","Articles and teaching notes, clearly separated.")}</h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-ink-soft">
          {tr(locale,"先選你要看的內容：文章區讀文章與短札；命理小知識查方法、術語與判讀規則。","先选你要看的内容：文章区读文章与短札；命理小知识查方法、术语与判读规则。","Choose what you need: Articles for essays and short reflections; Knowledge for methods, terms and reading rules.")}
        </p>

        <nav className="mt-6 grid gap-3 sm:grid-cols-2" aria-label={tr(locale,"知識庫分類","知识库分类","Knowledge sections")}>
          <a href="#guanshilu-articles" className="rounded-2xl border border-cinnabar/20 bg-paper px-5 py-4 transition hover:border-cinnabar/40">
            <span className="text-xs font-semibold tracking-[0.14em] text-cinnabar">{tr(locale,"文章","文章","ARTICLES")}</span>
            <strong className="mt-2 block font-display text-xl text-ink">{tr(locale,"文章與短札","文章与短札","Essays & reflective notes")}</strong>
            <span className="mt-2 block text-sm leading-6 text-ink-soft">{tr(locale,"觀點、研究與生活短札。","观点、研究与生活短札。","Editorial writing, research and reflections.")}</span>
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
          <p className="text-xs tracking-[0.22em] text-cinnabar">{tr(locale,"文章","文章","NOTES ON LIFE · EDITORIAL")}</p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-ink">{tr(locale,"文章、研究札記與短札","文章、研究札记与短札","Essays, research notes and short reflections")}</h2>
          <p className="mt-3 text-sm leading-7 text-ink-soft">
            {tr(locale,"這裡只放文章與短札；命理小知識另行整理。","这里只放文章与短札；命理小知识另行整理。","This list contains editorial content only. Long-form pieces are labelled Article; shorter reflections are labelled Short note. Teaching cards do not enter this list.")}
          </p>
        </div>

        <LifeViewHomeSection archiveMode />
      </section>

      <BaziKnowledgeNotesSection />
      <ZiweiKnowledgeNotesSection />
      <ZiweiHomeEnvironmentArticle />

      <CuratedVideoShelf placement="knowledge" />

      <nav className="seal-border space-y-3 rounded-2xl bg-cream p-5 sm:p-8" aria-label={tr(locale,"知識文章","知识文章","Knowledge articles")}>
        <h2 className="font-display text-xl text-ink">{tr(locale,"知識文章","知识文章","Knowledge articles")}</h2>
        <ul className="space-y-3 text-sm leading-7 text-ink-soft">
          <li><Link className="underline underline-offset-4" to="/knowledge/five-elements-tone-qi">{tr(locale,"五行五色、五音與五氣","五行五色、五音与五气","Five Elements, colours, tones and qi")}</Link></li>
          <li><Link className="underline underline-offset-4" to="/knowledge/shushu-boundary">{tr(locale,"術數的邊界","术数的边界","The boundary of the divination arts")}</Link></li>
          <li><Link className="underline underline-offset-4" to="/knowledge/system-map">{tr(locale,"昭梧命理系統能力地圖","昭梧命理系统能力地图","Zhaowu system capability map")}</Link></li>
        </ul>
      </nav>

      <Link to="/knowledge/true-solar-time" className="seal-border block rounded-2xl bg-paper px-5 py-4 transition hover:border-cinnabar/40" data-true-solar-time-link>
        <span className="text-xs font-semibold tracking-[0.14em] text-cinnabar">{tr(locale,"計算說明","计算说明","HOW IT IS CALCULATED")}</span>
        <strong className="mt-2 block font-display text-xl text-ink">{tr(locale,"真太陽時怎麼算：經度差、均時差與夏令時","真太阳时怎么算：经度差、均时差与夏令时","How true solar time is calculated: longitude, equation of time and DST")}</strong>
        <span className="mt-2 block text-sm leading-6 text-ink-soft">{tr(locale,"公式、悉尼／台北／北京實例、對命盤的影響與誤差限制。","公式、悉尼／台北／北京实例、对命盘的影响与误差限制。","The formula, Sydney / Taipei / Beijing examples, what it changes in a chart, and its error limits.")}</span>
      </Link>

      <a href="/#birth-form" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-cream px-5 py-4 text-sm text-ink">
        <span>{tr(locale,"產生完整命盤","产生完整命盘","Create complete chart")}</span>
        <span className="text-cinnabar">→</span>
      </a>
    </main>
  );
}
