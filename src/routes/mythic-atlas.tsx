import { CuratedVideoShelf } from "@/components/curated-video-shelf";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import { ARTWORKS, BRANCHES, CHRONICLES, COPY, l, OBSERVATION_CHAPTERS, ORDERS, REALMS, SOURCE_LABELS, tr, type Side, type SourceKind } from "./-mythic-atlas-data";
import { BorrowStarInterlude } from "./-mythic-atlas-borrow-star";
import { GuailiBook } from "./-mythic-atlas-guaili";
import "./-mythic-atlas-guaili.css";
import "./mythic-atlas.css";

export const Route = createFileRoute("/mythic-atlas")({ component: MythicAtlasPage });

function Plate({ index, locale, priority = false }: { index: number; locale: Locale; priority?: boolean }) {
  const art = ARTWORKS[index - 1];
  return <figure className="hq-plate">
    <div className="hq-image-frame">
      <a className="hq-full-plate" href={`/mythic-atlas/originals/${art.file}`} target="_blank" rel="noopener noreferrer" aria-label={tr(l("開啟完整 STONE 原創 PNG 原圖", "打开完整 STONE 原创 PNG 原图", "Open full-resolution STONE original PNG"), locale)}><img src={`/mythic-atlas/originals/${art.file}`} alt={tr(art.title, locale)} width={941} height={1672} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} /></a>
      <span className="hq-original-mark">STONE 原創</span>
    </div>
    <figcaption><strong>{String(index).padStart(2, "0")} · {tr(art.title, locale)}</strong><span>{tr(COPY.inspiredBy, locale)}：{tr(art.source, locale)}</span></figcaption>
  </figure>;
}

function MythicAtlasPage() {
  const { locale } = useI18n();
  const [side, setSide] = useState<"all" | Side>("all");
  const [sourceKind, setSourceKind] = useState<"all" | SourceKind>("all");
  const [query, setQuery] = useState("");
  const [selectedPlate, setSelectedPlate] = useState(0);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredBranches = useMemo(() => BRANCHES.map((branch) => ({
    ...branch,
    members: branch.members.filter((member) => {
      const sideMatches = side === "all" || branch.side === side;
      const sourceMatches = sourceKind === "all" || member.sourceKind === sourceKind;
      const textMatches = !normalizedQuery || [member.name, member.role, member.source].some((value) => tr(value, locale).toLocaleLowerCase().includes(normalizedQuery));
      return sideMatches && sourceMatches && textMatches;
    }),
  })).filter((branch) => branch.members.length > 0), [locale, normalizedQuery, side, sourceKind]);
  const resultCount = filteredBranches.reduce((total, branch) => total + branch.members.length, 0);
  const filterButton = (active: boolean) => `hq-filter ${active ? "is-active" : ""}`;

  return <main className="huangquan" data-mythic-atlas>
    <header className="hq-hero">
      <div className="hq-hero-copy">
        <p className="hq-kicker">{tr(COPY.kicker, locale)}</p>
        <h1>{tr(COPY.title, locale)}</h1>
        <p className="hq-subtitle">{tr(COPY.subtitle, locale)}</p>
        <p className="hq-lead">{tr(COPY.intro, locale)}</p>
        <div className="hq-actions"><a className="hq-primary" href="#world">{tr(COPY.begin, locale)}</a><a className="hq-secondary" href="/">{tr(COPY.back, locale)}</a></div>
        <p className="hq-notice">{tr(COPY.notice, locale)}</p>
      </div>
      <Plate index={1} locale={locale} priority />
    </header>

    <nav className="hq-toc" aria-label={tr(COPY.contents, locale)}>
      <span>{tr(COPY.contents, locale)}</span><a href="#world">{tr(COPY.world, locale)}</a><a href="#atlas">{tr(COPY.atlas, locale)}</a><a href="#chronicle">{tr(COPY.chronicle, locale)}</a><a href="#huangquan-film">{tr(l("《幽明萬象錄》原版影片","《幽明万象录》原版影片","Original Chronicle Film"),locale)}</a><a href="/guaili-luanshen">{tr(l("《三界異聞錄》分組書目", "《三界异闻录》分组书目", "Tales of the Three Realms · Series Index"), locale)}</a><a href="#guaili">{tr(l("三界異聞錄・七卷", "三界异闻录・七卷", "Tales of the Three Realms · Seven Volumes"), locale)}</a><a href="#guaili-zodiac">{tr(l("十二地支四態", "十二地支四态", "Twelve Branches"), locale)}</a><a href="#guaili-ending">{tr(l("十年災異終局", "十年灾异终局", "Final Chronicle"), locale)}</a><a href="#paintings">{tr(COPY.paintings, locale)}</a><a href="#borrow-star">{locale === "en" ? "Borrowed Star" : locale === "zh-Hans" ? "借星" : "借星"}</a><a href="#observation">{tr(COPY.observation, locale)}</a><a href="#sources">{tr(COPY.sources, locale)}</a>
    </nav>

    <section className="hq-section" id="world">
      <div className="hq-section-heading"><span>卷一</span><h2>{tr(COPY.world, locale)}</h2></div>
      <div className="hq-world-layout">
        <Plate index={2} locale={locale} />
        <div><div className="hq-realms">{REALMS.map((realm) => <article key={realm.mark}><span>{realm.mark}</span><div><h3>{tr(realm.title, locale)}</h3><p>{tr(realm.text, locale)}</p></div></article>)}</div>
          <div className="hq-orders">{ORDERS.map((order) => <article key={order.side} data-side={order.side}><span>{order.seal}</span><h3>{tr(order.title, locale)}</h3><p>{tr(order.text, locale)}</p></article>)}</div>
        </div>
      </div>
    </section>

    <section className="hq-section" id="atlas">
      <div className="hq-section-heading"><span>卷二</span><h2>{tr(COPY.atlas, locale)}</h2><p>{tr(COPY.atlasLead, locale)}</p></div>
      <div className="hq-controls">
        <label><span className="sr-only">{tr(COPY.search, locale)}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tr(COPY.search, locale)} /></label>
        <div className="hq-filter-row" aria-label={tr(COPY.atlas, locale)}><button className={filterButton(side === "all")} type="button" aria-pressed={side === "all"} onClick={() => setSide("all")}>{tr(COPY.all, locale)}</button><button className={filterButton(side === "order")} type="button" aria-pressed={side === "order"} onClick={() => setSide("order")}>{tr(COPY.order, locale)}</button><button className={filterButton(side === "shadow")} type="button" aria-pressed={side === "shadow"} onClick={() => setSide("shadow")}>{tr(COPY.shadow, locale)}</button></div>
        <div className="hq-filter-row" aria-label={tr(COPY.sourceLegend, locale)}><button className={filterButton(sourceKind === "all")} type="button" aria-pressed={sourceKind === "all"} onClick={() => setSourceKind("all")}>{tr(COPY.all, locale)}</button>{(Object.keys(SOURCE_LABELS) as SourceKind[]).map((kind) => <button key={kind} className={filterButton(sourceKind === kind)} type="button" aria-pressed={sourceKind === kind} onClick={() => setSourceKind(kind)}>{tr(SOURCE_LABELS[kind], locale)}</button>)}</div>
        <p className="hq-count" aria-live="polite">{resultCount} {tr(COPY.figures, locale)}</p>
      </div>
      <div className="hq-branches">
        {filteredBranches.map((branch) => <article className="hq-branch" key={branch.id} data-side={branch.side}>
          <div className="hq-branch-art"><Plate index={branch.image} locale={locale} /></div>
          <div className="hq-branch-copy"><p className="hq-branch-side">{tr(branch.side === "order" ? COPY.order : COPY.shadow, locale)}</p><h3>{tr(branch.title, locale)}</h3><p className="hq-branch-subtitle">{tr(branch.subtitle, locale)}</p>
            <div className="hq-members">{branch.members.map((member) => <details key={member.name.en}><summary><span>{tr(member.name, locale)}</span><small data-kind={member.sourceKind}>{tr(SOURCE_LABELS[member.sourceKind], locale)}</small></summary><p>{tr(member.role, locale)}</p><p className="hq-member-source">{tr(member.source, locale)}</p></details>)}</div>
          </div>
        </article>)}
        {resultCount === 0 ? <p className="hq-empty">{tr(COPY.empty, locale)}</p> : null}
      </div>
    </section>

    <section className="hq-section" id="chronicle">
      <div className="hq-section-heading"><span>卷三</span><h2>{tr(COPY.chronicle, locale)}</h2></div>
      <div className="hq-chronicle-intro"><Plate index={11} locale={locale} /><div className="hq-chronicles">{CHRONICLES.map((chapter, chapterIndex) => <article key={chapter.no}><span>{chapter.no}</span><div><h3>{tr(chapter.title, locale)}</h3><strong>{tr(chapter.lead, locale)}</strong><p>{tr(chapter.text, locale)}</p><div className="hq-chronicle-art"><Plate index={([5, 11, 10, 12] as const)[chapterIndex]} locale={locale} /></div></div></article>)}</div></div>
      <figure className="hq-original-film" id="huangquan-film">
        <video controls playsInline preload="metadata" poster="/mythic-atlas/originals/01-skeleton-puppet.png" aria-label={tr(l("《幽明萬象錄》完整原版影片","《幽明万象录》完整原版影片","Full original film of the Chronicle of Hidden and Manifest Worlds"), locale)}>
          <source src="/mythic-atlas/films/huangquan-chronicles.mp4" type="video/mp4" />
          {tr(l("目前瀏覽器無法播放此影片。","当前浏览器无法播放此视频。","This browser cannot play the video."), locale)}
        </video>
        <figcaption><strong>{tr(l("《幽明萬象錄》｜原版動態圖志","《幽明万象录》｜原版动态图志","Chronicle of Hidden and Manifest Worlds · Original Film"),locale)}</strong>
        <span>{tr(l("九幕原創敘事：由九幽黃泉、幽都、輪迴斷路至上古災異與棄序之後。保留完整 MP4，未剪輯、未重編碼。","九幕原创叙事：由九幽黄泉、幽都、轮回断路至上古灾异与弃序之后。保留完整 MP4，未剪辑、未重新编码。","Nine illustrated chapters, from the Nine Springs and Broken Rebirth to ancient calamities. The complete MP4 is unedited and untranscoded."),locale)}</span></figcaption>
      </figure>
    </section>

    <GuailiBook locale={locale} />

    <section className="hq-section" id="paintings">
      <div className="hq-section-heading"><span>卷四</span><h2>{tr(COPY.paintings, locale)}</h2><p>{tr(COPY.imageNotice, locale)}</p></div>
      <div className="hq-gallery-feature"><Plate index={selectedPlate + 1} locale={locale} /><div><p className="hq-kicker">{tr(COPY.plate, locale)}</p><h3>{tr(ARTWORKS[selectedPlate].title, locale)}</h3><p>{tr(ARTWORKS[selectedPlate].note, locale)}</p><p className="hq-gallery-source">{tr(COPY.inspiredBy, locale)}：{tr(ARTWORKS[selectedPlate].source, locale)}</p></div></div>
      <div className="hq-thumbnails" aria-label={tr(COPY.selectPlate, locale)}>{ARTWORKS.map((art, index) => <button key={art.file} type="button" className={selectedPlate === index ? "is-active" : ""} aria-pressed={selectedPlate === index} onClick={() => setSelectedPlate(index)}><img src={`/mythic-atlas/originals/${art.file}`} alt="" width={94} height={167} loading="lazy" /><span>{String(index + 1).padStart(2, "0")}</span></button>)}</div>
    </section>

    <BorrowStarInterlude locale={locale} />

    <section className="hq-section" id="observation">
      <div className="hq-section-heading"><span>卷五</span><h2>{tr(COPY.observation, locale)}</h2><p>{tr(l("從神怪世界回到人的觀看方式：這一卷是現代認知與關係反思，不冒充古籍、宗教教義或可測量的「能量學」。", "从神怪世界回到人的观看方式：这一卷是现代认知与关系反思，不冒充古籍、宗教教义或可测量的“能量学”。", "This volume returns from myth to human perception. It is a modern reflection on judgement and relationships, not a classical source, religious doctrine or measurable energy theory."), locale)}</p></div>
      <div className="hq-chronicles">{OBSERVATION_CHAPTERS.map((chapter) => <article key={chapter.no}><span>{chapter.no}</span><div><h3>{tr(chapter.title, locale)}</h3><strong>{tr(chapter.lead, locale)}</strong><p>{tr(chapter.text, locale)}</p></div></article>)}</div>
    </section>

    <section className="hq-section hq-sources" id="sources">
      <div className="hq-section-heading"><span>卷六</span><h2>{tr(COPY.sources, locale)}</h2></div><p>{tr(COPY.methods, locale)}</p>
      <div className="hq-source-legend">{(Object.keys(SOURCE_LABELS) as SourceKind[]).map((kind) => <article key={kind} data-kind={kind}><span>{tr(SOURCE_LABELS[kind], locale)}</span><p>{kind === "tradition" ? tr(l("可追溯到古籍、宗教史或穩定民間傳統；本作職司仍另行註明。", "可追溯到古籍、宗教史或稳定民间传统；本作职司仍另行注明。", "Traceable to texts, religious history or stable folk traditions; story roles remain separately labelled."), locale) : kind === "modern" ? tr(l("來自近現代小說、地方敘事或待考線索，不倒灌為上古原典。", "来自近现代小说、地方叙事或待考线索，不倒灌为上古原典。", "Modern fiction, local narrative or unverified leads, never backdated into antiquity."), locale) : tr(l("人物關係、能力規則、陣營與主線由本作創作。", "人物关系、能力规则、阵营与主线由本作创作。", "Relationships, power rules, alliances and the central plot are original."), locale)}</p></article>)}</div>
    </section>

    <CuratedVideoShelf placement="mythic" />
    <footer className="hq-footer"><span>{tr(COPY.title, locale)} · {tr(COPY.subtitle, locale)}</span><strong>STONE 原創</strong><Link to="/">ZHAOWU 昭梧</Link></footer>
  </main>;
}
