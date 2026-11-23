import { useDisplayLanguage } from "@/lib/display-language";
import { customerChrome } from "@/lib/customer-chrome";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BaziKnowledgeNotesSection } from "@/components/bazi-knowledge-notes-section";
import { ZiweiKnowledgeNotesSection } from "@/components/ziwei-knowledge-notes-section";
import { ZiweiHomeEnvironmentArticle } from "@/components/ziwei-home-environment-article";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
import { useI18n, type Locale } from "@/lib/i18n";
import { CuratedVideoShelf } from "@/components/curated-video-shelf";
import { RealityPatchSection } from "@/components/2012-reality-patch-section";
import { trackConversion } from "@/lib/observability/conversion-telemetry";

export const Route = createFileRoute("/knowledge")({ component: KnowledgePage });

function tr(_locale: Locale, hant: string, hans: string, en: string) {
  return customerChrome(hant, hans, en);
}

function KnowledgePage() {
  const { locale } = useI18n();
  useDisplayLanguage((state) => state.language);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isKnowledgeIndex = pathname === "/knowledge" || pathname === "/knowledge/";
  if (!isKnowledgeIndex) return <Outlet />;

  return (
    <main className="mx-auto max-w-4xl space-y-5 pb-16">
      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <p className="text-xs tracking-[0.26em] text-cinnabar">{tr(locale,"昭梧 · 知識庫","昭梧 · 知识库","ZHAOWU · KNOWLEDGE")}</p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">{tr(locale,"文章與命理小知識，分開看。","文章与命理小知识，分开看。","Articles and teaching notes, clearly separated.")}</h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-ink-soft">
          {tr(locale,"先選你要看的內容：文章區讀文章與短札；命理小知識查方法、術語與判讀規則。","先选你要看的内容：文章区读文章与短札；命理小知识查方法、术语与判读规则。","Choose what you need: Articles for essays and short reflections; Knowledge for methods, terms and reading rules.")}
        </p>

        <nav className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label={tr(locale,"知識庫分類","知识库分类","Knowledge sections")}>
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
        
          <a href="#reality-patch-archive" className="rounded-2xl border border-emerald-800/20 bg-paper px-5 py-4 transition hover:border-emerald-800/45">
            <span className="text-xs font-semibold tracking-[0.14em] text-emerald-800">{tr(locale,"觀世錄 · 特別專題","观世录 · 特别专题","NOTES ON LIFE · SPECIAL FEATURE")}</span>
            <strong className="mt-2 block font-display text-xl text-ink">{tr(locale,"2012 現實補丁檔案","2012 现实补丁档案","2012 Reality Patch Archive")}</strong>
            <span className="mt-2 block text-sm leading-6 text-ink-soft">{tr(locale,"互動時間線、自測與 Glitch 檔案。故事與事實分開看。","互动时间线、自测与 Glitch 档案。故事与事实分开看。","Interactive timeline, self-reflection and glitch files. Story and fact stay distinct.")}</span>
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

        <a href="/yunyi-shenxiang" className="seal-border flex min-h-[132px] items-center gap-4 rounded-xl border border-[#a3815940] bg-[#fffaf1]/90 p-4 shadow-sm transition hover:border-cinnabar/40 focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-6 sm:p-6">
          <img src="/articles/yunyi-shenxiang/01.webp" alt="" width={941} height={1672} fetchPriority="high" className="h-24 w-20 shrink-0 rounded-lg object-cover sm:h-32 sm:w-24" />
          <span className="min-w-0">
          <p className="text-xs tracking-[0.2em] text-cinnabar">{tr(locale,"昭梧原創圖志 · 三卷 75 圖","昭梧原创图志 · 三卷 75 图","ZHAOWU ORIGINAL ATLAS · 75 WORKS IN THREE VOLUMES")}</p>
          <h3 className="mt-1 font-display text-xl leading-snug text-ink sm:text-2xl">{tr(locale,"《雲衣神相》：封神、九歌與上古四時","《云衣神相》：封神、九歌与上古四时","Yunyi Shenxiang: Investiture, Nine Songs & the Four Seasons")}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{tr(locale,"三卷原創人物與神話畫作，附簡明故事和古典來源。","三卷原创人物与神话画作，附简明故事和古典来源。","Three volumes of original mythic portraits, with plain-language stories and source notes.")}</p>
          <span className="mt-2 inline-block text-sm text-cinnabar underline underline-offset-4">{tr(locale,"瀏覽 75 張作品 →","浏览 75 张作品 →","Explore all 75 artworks →")}</span>
          </span>
        </a>

        <LifeViewHomeSection archiveMode />
        <a href="/bajinggong" className="seal-border flex min-h-[132px] items-center gap-4 rounded-xl border border-[#a3815940] bg-[#fffaf1]/90 p-4 shadow-sm transition hover:border-cinnabar/40 focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-6 sm:p-6">
          <img src="/bajinggong/01-hanhai-cangming.webp" alt="" width={941} height={1672} loading="lazy" className="h-24 w-20 shrink-0 rounded-lg object-cover sm:h-32 sm:w-24" />
          <span className="min-w-0">
          <p className="text-xs tracking-[0.2em] text-cinnabar">{tr(locale,"文化考據 · 原創圖志","文化考据 · 原创图志","CULTURAL SOURCES · ORIGINAL ART")}</p>
          <h3 className="mt-2 font-display text-2xl text-ink">{tr(locale,"八景宮九景：古典仙境與當代藝術演繹","八景宫九景：古典仙境与当代艺术演绎","Nine Visions of Bajinggong")}</h3>
          <p className="mt-3 text-sm leading-7 text-ink-soft">{tr(locale,"九幅9:16原畫，逐景介紹畫風與意象，並區分古籍記載與現代整理。","九幅9:16原画，逐景介绍画风与意象，并区分古籍记载与现代整理。","Nine portrait paintings with descriptions and clear distinctions between classical sources and modern interpretations.")}</p>
          <span className="mt-2 inline-block text-sm text-cinnabar underline underline-offset-4">{tr(locale,"瀏覽九景圖志 →","浏览九景图志 →","Explore all nine visions →")}</span>
          </span>
        </a>
      </section>

      <RealityPatchSection />

      <BaziKnowledgeNotesSection />
      <ZiweiKnowledgeNotesSection />
      <ZiweiHomeEnvironmentArticle />

      <CuratedVideoShelf placement="knowledge" />

      <nav className="seal-border space-y-3 rounded-2xl bg-cream p-5 sm:p-8" aria-label={tr(locale,"知識文章","知识文章","Knowledge articles")}>
        <h2 className="font-display text-xl text-ink">{tr(locale,"知識文章","知识文章","Knowledge articles")}</h2>
        <ul className="space-y-3 text-sm leading-7 text-ink-soft">
          <li><Link className="underline underline-offset-4" to="/knowledge/five-elements-tone-qi">{tr(locale,"五行五色、五音與五氣","五行五色、五音与五气","Five Elements, colours, tones and qi")}</Link></li>
          <li><Link className="underline underline-offset-4" to="/knowledge/southern-hemisphere-bazi">{tr(locale,"南半球八字怎麼排：節氣、真太陽時與季節環境校正","南半球八字怎么排：节气、真太阳时与季节环境校正","Southern Hemisphere BaZi: solar terms, true solar time and seasonal calibration")}</Link></li>
          <li><Link className="underline underline-offset-4" to="/knowledge/nine-heavens-lamps">{tr(locale,"九重天外，無人掌燈 · 緣起四境","九重天外，无人掌灯 · 缘起四境","Beyond Nine Heavens · Four lamps and dependent origination")}</Link></li>
          <li><Link className="underline underline-offset-4" to="/knowledge/shushu-boundary">{tr(locale,"術數的邊界","术数的边界","The boundary of the divination arts")}</Link></li>
          <li><Link className="underline underline-offset-4" to="/knowledge/system-map">{tr(locale,"昭梧命理系統能力地圖","昭梧命理系统能力地图","Zhaowu system capability map")}</Link></li>
          <li><Link className="underline underline-offset-4" to="/knowledge/xiuxian-cultivation">{tr(locale,"修仙：把命運修在自己手裡","修仙：把命运修在自己手里","Cultivation: holding your destiny in your own hands")}</Link></li>
        </ul>
      </nav>

      <Link to="/knowledge/true-solar-time" className="seal-border block rounded-2xl bg-paper px-5 py-4 transition hover:border-cinnabar/40" data-true-solar-time-link>
        <span className="text-xs font-semibold tracking-[0.14em] text-cinnabar">{tr(locale,"計算說明","计算说明","HOW IT IS CALCULATED")}</span>
        <strong className="mt-2 block font-display text-xl text-ink">{tr(locale,"真太陽時怎麼算：經度差、均時差與夏令時","真太阳时怎么算：经度差、均时差与夏令时","How true solar time is calculated: longitude, equation of time and DST")}</strong>
        <span className="mt-2 block text-sm leading-6 text-ink-soft">{tr(locale,"公式、悉尼／台北／北京實例、對命盤的影響與誤差限制。","公式、悉尼／台北／北京实例、对命盘的影响与误差限制。","The formula, Sydney / Taipei / Beijing examples, what it changes in a chart, and its error limits.")}</span>
      </Link>

      <a href="/#birth-form" onClick={() => trackConversion("content_cta_clicked", { source: "knowledge", destination: "birth_form" })} className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-cream px-5 py-4 text-sm text-ink">
        <span>{tr(locale,"產生完整命盤","产生完整命盘","Create complete chart")}</span>
        <span className="text-cinnabar">→</span>
      </a>
    </main>
  );
}
