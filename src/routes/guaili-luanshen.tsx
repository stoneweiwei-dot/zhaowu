import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { GUAILI_COPY, GUAILI_VOLUMES, GUAILI_ZODIAC, GUAILI_YEARS } from "./-mythic-atlas-guaili-data";
import { l, tr } from "./-mythic-atlas-data";
import { ZODIAC_PLATES } from "./-mythic-atlas-zodiac-essay";
import "./mythic-atlas.css";
import "./-mythic-atlas-guaili.css";
import "./guaili-luanshen.css";

export const Route = createFileRoute("/guaili-luanshen")({ component: GuailiCollectionPage });

/** A new series bookshelf, not a second copy of the seven-volume source text. */
function GuailiCollectionPage() {
  const { locale } = useI18n();
  const group = l("昭梧・黃泉紀｜獨立系列書目", "昭梧・黄泉纪｜独立系列书目", "ZHAOWU · YELLOW SPRINGS · SERIES INDEX");
  const read = l("進入正文", "进入正文", "Read the text");
  const refer = l("本書所有卷目共用已發布的《幽明萬象錄》資料，書目不另存一份原稿。點選卷名可直接抵達原卷。", "本书所有卷目共用已发布的《幽明万象录》资料，书目不另存一份原稿。点选卷名可直接抵达原卷。", "All chapters point to the published Chronicle of Hidden and Manifest Worlds. This index does not create another version of the manuscript.");
  return <main className="huangquan hqc-index" data-guaili-collection>
    <nav className="hqc-breadcrumb" aria-label={tr(l("所在位置","所在位置","Breadcrumb"), locale)}>
      <a href="/">{tr(l("昭梧","昭梧","ZHAOWU"), locale)}</a>
      <span aria-hidden="true">/</span>
      <a href="/mythic-atlas">{tr(l("幽明萬象錄","幽明万象录","Mythic Archive"), locale)}</a>
      <span aria-hidden="true">/</span>
      <span>{tr(l("怪力亂神","怪力乱神","Strange Powers"), locale)}</span>
    </nav>
    <header className="hqc-opening">
      <div className="hqc-opening-copy">
        <p className="hq-kicker">{tr(group, locale)}</p>
        <h1>{tr(GUAILI_COPY.title, locale)}</h1>
        <p className="hqc-deck">{tr(GUAILI_COPY.subtitle, locale)}</p>
        <p className="hqc-lead">{tr(GUAILI_COPY.intro, locale)}</p>
        <p className="hqc-axiom">{tr(GUAILI_COPY.principle, locale)}</p>
        <a className="hqc-reading-link" href="/mythic-atlas#guaili">{tr(read, locale)} <span aria-hidden="true">›</span></a>
      </div>
      <figure className="hqc-painting">
        <img src="/mythic-atlas/originals/07-mountain-sea-bestiary.webp" width={941} height={1672} alt={tr(l("災異山海・STONE 原創圖", "灾异山海・STONE 原创图", "Mountain and Sea Calamities, original STONE artwork"), locale)} />
        <figcaption>{tr(l("《災異山海》｜沿用既有原創畫作", "《灾异山海》｜沿用既有原创画作", "Mountain and Sea · Existing original artwork"), locale)} · STONE Original</figcaption>
      </figure>
    </header>
    <nav className="hqc-jump" aria-label={tr(l("專題分組","专题分组","Collection sections"),locale)}>
      <a href="#volumes">{tr(GUAILI_COPY.volumes, locale)}</a>
      <a href="#zodiac">{tr(GUAILI_COPY.zodiac, locale)}</a>
      <a href="#chronicle">{tr(GUAILI_COPY.chronology, locale)}</a>
    </nav>
    <section id="volumes" className="hqc-section" aria-labelledby="hqc-volumes-heading">
      <div className="hqc-section-intro">
        <span>01 / 03</span>
        <h2 id="hqc-volumes-heading">{tr(GUAILI_COPY.volumes, locale)}</h2>
        <p>{tr(refer, locale)}</p>
      </div>
      <ol className="hqc-booklist">
        {GUAILI_VOLUMES.map((chapter, i) => <li key={chapter.no}>
          <a href={`/mythic-atlas#guaili-volume-${i+1}`}>
            <span className="hqc-number">{chapter.no}</span>
            <span className="hqc-mainline"><strong>{tr(chapter.title, locale)}</strong><small>{tr(chapter.lead, locale)}</small></span>
            <span className="hqc-arrow" aria-hidden="true">↗</span>
          </a>
        </li>)}
      </ol>
    </section>
    <section id="zodiac" className="hqc-section" aria-labelledby="hqc-zodiac-heading">
      <div className="hqc-section-intro">
        <span>02 / 03</span>
        <h2 id="hqc-zodiac-heading">{tr(GUAILI_COPY.zodiac, locale)}</h2>
        <p>{tr(GUAILI_COPY.zodiacLead, locale)}</p>
      </div>
      <ol className="hqc-zodiac">
        {GUAILI_ZODIAC.map((branch, i) => <li key={i}>
          <a href={`/mythic-atlas#guaili-${ZODIAC_PLATES[i].branch}`}>
            <img src={`/mythic-atlas/zodiac/${ZODIAC_PLATES[i].image}`} alt="" width={941} height={1672} loading="lazy" decoding="async" />
            <span>{String(i+1).padStart(2,"0")}</span>
            <strong>{tr(branch.earthly,locale)}</strong>
            <small>{tr(branch.shadow,locale)}</small>
          </a>
        </li>)}
      </ol>
    </section>
    <section id="chronicle" className="hqc-section" aria-labelledby="hqc-chronicle-heading">
      <div className="hqc-section-intro">
        <span>03 / 03</span>
        <h2 id="hqc-chronicle-heading">{tr(GUAILI_COPY.chronology, locale)}</h2>
        <p>{tr(GUAILI_COPY.chronologyLead, locale)}</p>
      </div>
      <ol className="hqc-years">
        {GUAILI_YEARS.map((event,i) => <li key={i}>
          <a href={`/mythic-atlas#guaili-year-${i+1}`}>
            <span>{tr(event.year,locale)}</span><strong>{tr(event.name,locale)}</strong><span aria-hidden="true">↗</span>
          </a>
        </li>)}
      </ol>
      <blockquote className="hqc-final-line">{tr(GUAILI_COPY.finalQuote,locale)}</blockquote>
    </section>
    <footer className="hqc-footer">
      <p>{tr(GUAILI_COPY.sourceNotice, locale)}</p>
      <a href="/mythic-atlas#guaili-sources">{tr(l("考據與創作界線", "考据与创作界线", "Sources and authorship boundaries"),locale)}</a>
      <p>STONE Original · ZHAOWU</p>
    </footer>
  </main>;
}
