import type { Locale } from "@/lib/i18n";
import { l, tr } from "./-mythic-atlas-data";
import {
  GUAILI_ARTS, GUAILI_COPY, GUAILI_EIGHT, GUAILI_HOUSES,
  GUAILI_TWELVE, GUAILI_VOLUMES, GUAILI_YEARS, GUAILI_ZODIAC,
} from "./-mythic-atlas-guaili-data";
import { ZODIAC_PLATES } from "./-mythic-atlas-zodiac-essay";

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
          <img src="/mythic-atlas/originals/07-shanhaijing-atlas.png"
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
        {GUAILI_VOLUMES.map((volume, index) => <details key={volume.no} id={`guaili-volume-${index+1}`} open={index === 6 ? true : undefined}>
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
      <article className="hq-zodiac-essay" aria-label={tr(l("十二地支三界進化圖譜", "十二地支三界进化图谱", "The twelve branches across three realms"), locale)}>
        <p className="hq-zodiac-lead">{tr(l("地支定其根，凡體顯其形，凶煞承其劫，神獸窮其變，神格掌其法。天籍可以除名，命數不可憑空抹去。", "地支定其根，凡体显其形，凶煞承其劫，神兽穷其变，神格掌其法。天籍可以除名，命数不可凭空抹去。", "The branch is the root; mortal form gives it shape, calamity its shadow, beast form its transformation, and divine office its law. A register may erase a name, but not an existence."), locale)}</p>
        <p>{tr(l("本篇是《怪力亂神》七卷中的圖文專章。天界授神職，人間作選擇，幽冥收容與裁定亡魂；輪迴渡口另司轉生。黃泉空懸後，四種名籍互不相符：天籍記神職，生籍記生命，幽籍記亡魂，輪籍記待渡者。正統與編外是登記地位，不等同善惡。", "本篇是《怪力乱神》七卷中的图文专章。天界授神职，人间作选择，幽冥收容与裁定亡魂；轮回渡口另司转生。黄泉空悬后，四种名籍互不相符：天籍记神职，生籍记生命，幽籍记亡魂，轮籍记待渡者。正统与编外是登记地位，不等同善恶。", "This illustrated chapter belongs to the seven-volume chronicle. Heaven grants offices, mortals choose, the underworld receives and judges the dead, while the crossing governs rebirth. After the Yellow Springs empty, four registers cease to agree: divine offices, the living, the dead and those awaiting passage. Registration is a legal status, not a measure of good or evil."), locale)}</p>
        <p>{tr(l("每幅畫由下而上讀：凡體、陰影凶煞、神獸形貌、神格象徵。這是同一地支的四種敘事視角，不是動物依次變成既有神明，也不是命盤吉凶或戰力排名。畫內文字保留原始繁體，另以三語註解校正畫中簡寫與古籍邊界。", "每幅画由下而上读：凡体、阴影凶煞、神兽形貌、神格象征。这是同一地支的四种叙事视角，不是动物依次变成既有神明，也不是命盘吉凶或战力排名。画内文字保留原始繁体，另以三语注解校正画中简写与古籍边界。", "Read each plate from bottom to top: mortal creature, calamity, mythic beast and divine motif. These are four narrative views of a branch, not a literal evolution into a named deity, a chart judgement or a power ranking. Original Traditional Chinese lettering remains in the art; the notes below clarify the sources."), locale)}</p>
      </article>
      <div className="hq-guaili-zodiac-list">
        {GUAILI_ZODIAC.map((path, index) => <details key={index} id={`guaili-${ZODIAC_PLATES[index].branch}`}>
          <summary><span className="hq-guaili-zodiac-mark">{String(index + 1).padStart(2, "0")}</span><strong>{tr(path.earthly, locale)}</strong><span className="hq-guaili-zodiac-short">{tr(path.shadow, locale)}</span></summary>
          <figure className="hq-guaili-plate">
            <a href={`/mythic-atlas/zodiac/${ZODIAC_PLATES[index].image}`} target="_blank" rel="noopener noreferrer" aria-label={tr(l(`開啟${tr(path.earthly, "zh-Hant")}原圖`, `打开${tr(path.earthly, "zh-Hans")}原图`, `Open original plate: ${tr(path.earthly, "en")}`), locale)}>
              <img src={`/mythic-atlas/zodiac/${ZODIAC_PLATES[index].image}`} width={941} height={1672} loading="lazy" decoding="async" alt={tr(l(`${tr(path.earthly, "zh-Hant")}四態原創畫作：凡體、${tr(path.shadow, "zh-Hant")}、${tr(path.beast, "zh-Hant")}、${tr(path.god, "zh-Hant")}`, `${tr(path.earthly, "zh-Hans")}四态原创画作：凡体、${tr(path.shadow, "zh-Hans")}、${tr(path.beast, "zh-Hans")}、${tr(path.god, "zh-Hans")}`, `Original four-aspect plate of ${tr(path.earthly, "en")}`), locale)} />
            </a>
            <figcaption>{tr(l("STONE 原創 · 941 × 1672 原圖，點圖放大；圖中文字為繁體中文", "STONE 原创 · 941 × 1672 原图，点图放大；图中文字为繁体中文", "STONE Original · 941 × 1672 original; tap to enlarge. Lettering remains in Traditional Chinese."), locale)}</figcaption>
          </figure>
          <dl>
            <div><dt>{tr(GUAILI_COPY.ordinary, locale)}</dt><dd>{tr(path.earthly, locale)}</dd></div>
            <div><dt>{tr(GUAILI_COPY.shadow, locale)}</dt><dd>{tr(path.shadow, locale)}</dd></div>
            <div><dt>{tr(GUAILI_COPY.beast, locale)}</dt><dd>{tr(path.beast, locale)}</dd></div>
            <div><dt>{tr(GUAILI_COPY.god, locale)}</dt><dd>{tr(path.god, locale)}</dd></div>
          </dl>
          <p className="hq-guaili-law"><strong>{tr(ZODIAC_PLATES[index].calamity, locale)}</strong> · {tr(ZODIAC_PLATES[index].law, locale)}</p>
          <p className="hq-guaili-story">{tr(ZODIAC_PLATES[index].story, locale)}</p>
          <p className="hq-guaili-caveat">{tr(path.caveat, locale)}</p>
        </details>)}
      </div>
      <div className="hq-zodiac-essay hq-zodiac-afterword">
        <h3>{tr(l("五毒侵蝕，八災顯形", "五毒侵蚀，八灾显形", "Five vectors, eight consequences"), locale)}</h3>
        <p>{tr(l("十二地支指出異變發生的支脈；五毒是傳播介質，八災是現世後果。以民俗蛇、蠍、蜈蚣、蟾蜍、守宮作視覺原型，本作另擬蝕命、蝕魂、蝕形、蝕地、蝕憶五種污染；並將疫、荒、旱、洪、焚、兵、魘、裂暫列為八種後果。這套能力與分類是昭梧原創，不冒稱古代統一名錄。", "十二地支指出异变发生的支脉；五毒是传播介质，八灾是现世后果。以民俗蛇、蝎、蜈蚣、蟾蜍、守宫作视觉原型，本作另拟蚀命、蚀魂、蚀形、蚀地、蚀忆五种污染；并将疫、荒、旱、洪、焚、兵、魇、裂暂列为八种后果。这套能力与分类是昭梧原创，不冒称古代统一名录。", "The twelve branches locate the disturbance; five venom motifs describe how it spreads, and eight calamities describe the outcome. Snake, scorpion, centipede, toad and gecko inspire five fictional corruptions of life, soul, body, land and memory. Pestilence, famine, drought, flood, fire, war, nightmare and rupture are this work's provisional outcomes, not a single historical canon."), locale)}</p>
        <h3>{tr(l("獸身與法權，兩條不能混同的路", "兽身与法权，两条不能混同的路", "Two paths: form and authority"), locale)}</h3>
        <p>{tr(l("神獸之道把血脈、形貌與元素推至極致；神格之道關乎修行、名號、被承認的位格與實際法權。強大的神獸未必能修改天律，遭除名的神祇也未必失去力量。極少數雙軌共鳴者可同時承載兩者，但不會因此取代女媧、燭龍等既有神明。", "神兽之道把血脉、形貌与元素推至极致；神格之道关乎修行、名号、被承认的位格与实际法权。强大的神兽未必能修改天律，遭除名的神祇也未必失去力量。极少数双轨共鸣者可同时承载两者，但不会因此取代女娲、烛龙等既有神明。", "The beast path intensifies body and element. The divine path concerns cultivation, title, recognized status and actual jurisdiction. A mighty beast may have no authority over celestial law; an erased god may retain power. Even a rare bearer of both paths does not replace Nüwa or Torch Dragon."), locale)}</p>
        <p>{tr(l("故事從楊玉環失去歸籍的小說異常起，經十二陰潮、五毒八災與雙軌分歧，追至天籍被人挪用的隱藏夾層。它接入本館既有十年編年：焚籍之後災厄未止、輪迴未復；此處只補上追查線索，不改寫七卷的未解終局。", "故事从杨玉环失去归籍的小说异常起，经十二阴潮、五毒八灾与双轨分歧，追至天籍被人挪用的隐藏夹层。它接入本馆既有十年编年：焚籍之后灾厄未止、轮回未复；此处只补上追查线索，不改写七卷的未解终局。", "The story begins with a fictional anomaly in Yang Guifei's register, passes through twelve shadow tides and the five vectors, and follows a hidden transfer of souls. It joins the existing ten-year chronicle: the ledgers burn, calamity persists and rebirth remains broken. The ending is not rewritten."), locale)}</p>
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
        {GUAILI_YEARS.map((event, index) => <li key={index} id={`guaili-year-${index+1}`}>
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
