import type { Locale } from "@/lib/i18n";
import { l, tr } from "./-mythic-atlas-data";
import {
  GUAILI_ARTS, GUAILI_COPY, GUAILI_EIGHT, GUAILI_HOUSES,
  GUAILI_TWELVE, GUAILI_VOLUMES, GUAILI_YEARS, GUAILI_ZODIAC,
} from "./-mythic-atlas-guaili-data";

const simplifiedCurrents = ["同炉","仪光","祝骨","强郎","文卿","退奇","铜聋","耆耆","赤伯","东僧","天贼","是谁"];

export function GuailiBook({ locale }: { locale: Locale }) {
  return <>
    <section className="hq-section hq-guaili" id="guaili" aria-labelledby="hq-guaili-heading">
      <div className="hq-guaili-opening">
        <div className="hq-guaili-opening-copy">
          <p className="hq-kicker">{tr(GUAILI_COPY.eyebrow, locale)}</p>
          <h2 id="hq-guaili-heading">{tr(GUAILI_COPY.title, locale)}</h2>
          <p className="hq-guaili-subtitle">{tr(GUAILI_COPY.subtitle, locale)}</p>
          <p>{tr(GUAILI_COPY.intro, locale)}</p>
          <blockquote>{tr(GUAILI_COPY.principle, locale)}</blockquote>
        </div>
        <figure className="hq-guaili-opening-art">
          <img src="/mythic-atlas/originals/07-mountain-sea-bestiary.webp"
            alt={tr(l("昭梧原創《災異山海》圖版","昭梧原创《灾异山海》图版","Original STONE plate of Mountain and Sea calamities"), locale)}
            width={941} height={1672} loading="lazy" />
          <figcaption>{tr(l("《災異山海》｜沿用本館既有 STONE 原創圖錄，不冒稱新繪", "《灾异山海》｜沿用本馆既有 STONE 原创图录，不冒称新绘", "Mountain and Sea · An existing STONE original, reused here"), locale)}</figcaption>
        </figure>
      </div>
      <p className="hq-guaili-source-note">{tr(GUAILI_COPY.sourceNotice, locale)}</p>

      <div className="hq-guaili-subheading">
        <span>01</span><h3>{tr(GUAILI_COPY.volumes, locale)}</h3>
        <p>{tr(GUAILI_COPY.volumesLead, locale)}</p>
      </div>
      <div className="hq-guaili-volumes">
        {GUAILI_VOLUMES.map((volume, index) => <details key={volume.no} open={index === 6 ? true : undefined}>
          <summary><span className="hq-guaili-volume-number">{volume.no}</span><span className="hq-guaili-volume-title">{tr(volume.title, locale)}<small>{tr(volume.lead, locale)}</small></span></summary>
          <p>{tr(volume.text, locale)}</p>
        </details>)}
      </div>
    </section>

    <section className="hq-section hq-guaili" id="guaili-zodiac" aria-labelledby="hq-zodiac-heading">
      <div className="hq-guaili-subheading">
        <span>02</span><h2 id="hq-zodiac-heading">{tr(GUAILI_COPY.zodiac, locale)}</h2>
        <p>{tr(GUAILI_COPY.zodiacLead, locale)}</p>
      </div>
      <div className="hq-guaili-zodiac-list">
        {GUAILI_ZODIAC.map((path, index) => <details key={index}>
          <summary><span className="hq-guaili-zodiac-mark">{String(index + 1).padStart(2, "0")}</span><strong>{tr(path.earthly, locale)}</strong><span className="hq-guaili-zodiac-short">{tr(path.shadow, locale)}</span></summary>
          <dl>
            <div><dt>{tr(GUAILI_COPY.ordinary, locale)}</dt><dd>{tr(path.earthly, locale)}</dd></div>
            <div><dt>{tr(GUAILI_COPY.shadow, locale)}</dt><dd>{tr(path.shadow, locale)}</dd></div>
            <div><dt>{tr(GUAILI_COPY.beast, locale)}</dt><dd>{tr(path.beast, locale)}</dd></div>
            <div><dt>{tr(GUAILI_COPY.god, locale)}</dt><dd>{tr(path.god, locale)}</dd></div>
          </dl>
          <p className="hq-guaili-caveat">{tr(path.caveat, locale)}</p>
        </details>)}
      </div>

      <div className="hq-guaili-subheading hq-guaili-after-list">
        <span>03</span><h3>{tr(GUAILI_COPY.modern, locale)}</h3>
        <p>{tr(GUAILI_COPY.modernLead, locale)}</p>
      </div>
      <ol className="hq-guaili-currents">
        {GUAILI_TWELVE.map((name, index) => <li key={name}><span>{String(index + 1).padStart(2, "0")}</span><strong>{locale === "zh-Hans" ? simplifiedCurrents[index] : name}</strong></li>)}
      </ol>

      <details className="hq-guaili-reference">
        <summary>{tr(l("其他勢力與術法擴充索引", "其他势力与术法扩充索引", "Other lineages and practices · reference index"), locale)}</summary>
        <div className="hq-guaili-reference-body">
          {GUAILI_HOUSES.map((house, index) => <p key={index}>{tr(house, locale)}</p>)}
          <p>{tr(l("術法索引：", "术法索引：", "Practices (owner-supplied names): "), locale)}{GUAILI_ARTS.join("、")}</p>
        </div>
      </details>
    </section>

    <section className="hq-section hq-guaili" id="guaili-ending" aria-labelledby="hq-guaili-ending-heading">
      <div className="hq-guaili-subheading">
        <span>04</span><h2 id="hq-guaili-ending-heading">{tr(GUAILI_COPY.chronology, locale)}</h2>
        <p>{tr(GUAILI_COPY.chronologyLead, locale)}</p>
      </div>
      <ol className="hq-guaili-timeline">
        {GUAILI_YEARS.map((event, index) => <li key={index}>
          <span>{tr(event.year, locale)}</span><div><h3>{tr(event.name, locale)}</h3><p>{tr(event.detail, locale)}</p></div>
        </li>)}
      </ol>
      <details className="hq-guaili-reference">
        <summary>{tr(GUAILI_COPY.eight, locale)}</summary>
        <ul className="hq-guaili-eight">
          {GUAILI_EIGHT.map((item, index) => <li key={index}>{tr(item, locale)}</li>)}
        </ul>
      </details>

      <div className="hq-guaili-finale">
        <p className="hq-kicker">{tr(GUAILI_COPY.ending, locale)}</p>
        <p>{tr(GUAILI_COPY.ending1, locale)}</p>
        <p>{tr(GUAILI_COPY.ending2, locale)}</p>
        <p>{tr(GUAILI_COPY.ending3, locale)}</p>
        <blockquote>{tr(GUAILI_COPY.finalQuote, locale)}</blockquote>
        <p className="hq-guaili-signature">STONE Original · ZHAOWU</p>
      </div>

      <div className="hq-guaili-method" id="guaili-sources">
        <h3>{tr(GUAILI_COPY.method, locale)}</h3>
        <p>{tr(GUAILI_COPY.methodText, locale)}</p>
        <p>{tr(GUAILI_COPY.unresolved, locale)}</p>
        <p><a href="#sources">{tr(l("參閱本館來源分層","参阅本馆来源分层","See archive source classifications"), locale)}</a></p>
      </div>
    </section>
  </>;
}
