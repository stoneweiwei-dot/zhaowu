import { createFileRoute, Link } from "@tanstack/react-router";

/** A continuous reader for the series, not a second copy of the seven-volume source text. */
import { useI18n } from "@/lib/i18n";
import { GUAILI_PART_TWO, GUAILI_VOLUMES } from "./-mythic-atlas-guaili-data";
import { l, tr, type Localized } from "./-mythic-atlas-data";
import { mythicWebPlate } from "@/lib/mythic-web-assets";
import { MythicImageViewer } from "./-mythic-image-viewer";
import "./mythic-atlas.css";
import "./-mythic-atlas-guaili.css";
import "./guaili-luanshen.css";

export const Route = createFileRoute("/guaili-luanshen")({ component: GuailiReadingPage });

type ReadingChapter = {
  no: string;
  number: Localized;
  title: Localized;
  lead: Localized;
  text: Localized;
  anchor: string;
};

const ORIGINAL_CHAPTERS: ReadingChapter[] = GUAILI_VOLUMES.map((chapter, index) => ({
  ...chapter,
  number: l(`第${chapter.no}卷`, `第${chapter.no}卷`, `Volume ${index + 1}`),
  anchor: `guaili-volume-${index + 1}`,
}));

const CONTINUATION_CHAPTERS: ReadingChapter[] = GUAILI_PART_TWO.map((chapter) => ({
  ...chapter,
  number: chapter.no === "終"
    ? l("終章補記", "终章补记", "Afterword")
    : l(`第${chapter.no}卷`, `第${chapter.no}卷`, `Volume ${chapter.no}`),
  anchor: `guaili-part-two-${chapter.no === "終" ? "ending" : chapter.no}`,
}));

const ALL_CHAPTERS = [...ORIGINAL_CHAPTERS, ...CONTINUATION_CHAPTERS];
const ART_BY_CHAPTER: Record<string, { file: string; alt: Localized; caption: Localized }> = {
  "貳": {
    file: "05-ten-kings.png",
    alt: l("十王冥府原畫", "十王冥府原创画作", "Original painting of the Ten Kings' underworld court"),
    caption: l("卷二｜十王冥府圖：對應幽冥與輪迴秩序。館藏原畫重用，並非本卷新繪。", "卷二｜十王冥府图：对应幽冥与轮回秩序。馆藏原画复用，并非本卷新绘。", "Volume 2 · The Ten Kings' court: an existing archive painting reused for the underworld and rebirth thread."),
  },
  "8": {
    file: "03-celestial-court.png",
    alt: l("天界朝會原畫", "天界朝会原创画作", "Original painting of the celestial court"),
    caption: l("卷八｜天界朝會：對應天庭改制與各署爭權。館藏原畫重用。", "卷八｜天界朝会：对应天庭改制与各署争权。馆藏原画复用。", "Volume 8 · The celestial assembly: a visual match for Heaven's decree and offices competing for power."),
  },
  "13": {
    file: "06-nine-dragons.png",
    alt: l("九龍穿雲原畫", "九龙穿云原创画作", "Original painting of nine dragons crossing the clouds"),
    caption: l("卷十三｜九龍穿雲：對應水脈倒灌與龍族離心。館藏原畫重用。", "卷十三｜九龙穿云：对应水脉倒灌与龙族离心。馆藏原画复用。", "Volume 13 · Nine dragons cross the clouds: matched to the waterway crisis and dragon schism."),
  },
  "17": {
    file: "11-searching-the-mountain.png",
    alt: l("搜山緝妖原畫", "搜山缉妖原创画作", "Original painting of a mountain search"),
    caption: l("卷十七｜搜山與獵場：對應天庭追查、異獸獵場失控。此為館藏情境畫，不指認人物原型。", "卷十七｜搜山与猎场：对应天庭追查、异兽猎场失控。此为馆藏情境画，不指认人物原型。", "Volume 17 · The mountain search: an existing scene painting for the hunt and pursuit, not a literal portrait of the protagonists."),
  },
  "18": {
    file: "07-shanhaijing-atlas.png",
    alt: l("山海異獸原畫", "山海异兽原创画作", "Original painting of mountain-and-sea creatures"),
    caption: l("卷十八｜山海異獸圖：對應異獸流亡與生態災變。館藏原畫重用。", "卷十八｜山海异兽图：对应异兽流亡与生态灾变。馆藏原画复用。", "Volume 18 · Mountain-and-sea creatures: matched to the beast refugees and ecological calamity."),
  },
};

const STORY_ARCS = [
  {
    id: "registers",
    label: l("第一部｜卷一至七", "第一部｜卷一至七", "Part One · Volumes 1–7"),
    title: l("失籍：黃泉秩序先裂開", "失籍：黄泉秩序先裂开", "The Broken Register"),
    bridge: l("先從神譜、名籍與輪迴規則讀起。亡魂失去歸處，幽冥與天庭的記錄逐漸對不上；災異不再只是傳聞，而成為制度裂縫的回聲。卷七收束為一份災異總覽，下一部才補出各方如何走到這一步。", "先从神谱、名籍与轮回规则读起。亡魂失去归处，幽冥与天庭的记录逐渐对不上；灾异不再只是传闻，而成为制度裂缝的回声。卷七收束为一份灾异总览，下一部才补出各方如何走到这一步。", "Begin with the registers and the rules of rebirth. The dead lose their passage, Heaven's records diverge from the underworld, and calamity echoes a deeper institutional fracture. Volume 7 closes with an overview; the continuation fills in how the factions reached that point."),
    chapters: ORIGINAL_CHAPTERS,
  },
  {
    id: "extraction",
    label: l("第二部・上｜卷八至十七", "第二部・上｜卷八至十七", "Part Two, I · Volumes 8–17"),
    title: l("枯竭：諸方開始爭奪生路", "枯竭：诸方开始争夺生路", "Extraction and Fracture"),
    bridge: l("卷八把靈炁收割令推上檯面，瘟部失衡、教團與外援相繼入局；水脈斷裂後，主角才在卷十四遇見被棄的守隙者。卷十七的獵場逃亡把線索交給卷十八：生態崩壞與異獸獵殺正式成為主線。", "卷八把灵炁收割令推上台面，瘟部失衡、教团与外援相继入局；水脉断裂后，主角才在卷十四遇见被弃的守隙者。卷十七的猎场逃亡把线索交给卷十八：生态崩坏与异兽猎杀正式成为主线。", "Volume 8 makes the extraction decree the hinge. Plague offices, a self-appointed sect and outside forces enter the struggle. When the waterways fail, the protagonist meets the abandoned breach-keepers. The escape in volume 17 leads directly into volume 18's ecological crisis and beast hunts."),
    chapters: CONTINUATION_CHAPTERS.filter((chapter) => Number(chapter.no) >= 8 && Number(chapter.no) <= 17),
  },
  {
    id: "false-auspices",
    label: l("第二部・中｜卷十八至二十四", "第二部・中｜卷十八至二十四", "Part Two, II · Volumes 18–24"),
    title: l("造假：祥瑞、災異與偽令", "造假：祥瑞、灾异与伪令", "False Auspices and Forged Orders"),
    bridge: l("妖獸被推作災禍替罪者，天庭再用假祥瑞遮掩真相。追查由獵場延伸到佛國邊境與地方假敕；卷二十二拆穿借用祇陀太子名號的偽令，卷二十三至二十四則把主角帶到另一種危險：以混亂反抗，是否會讓亡魂永遠無路可歸？", "妖兽被推作灾祸替罪者，天庭再用假祥瑞遮掩真相。追查由猎场延伸到佛国边境与地方假敕；卷二十二拆穿借用祇陀太子名号的伪令，卷二十三至二十四则把主角带到另一种危险：以混乱反抗，是否会让亡魂永远无路可归？", "Beasts are blamed for a crisis they did not create, while staged auspices conceal the damage. The investigation reaches a Buddhist frontier and local counterfeit decrees. Volume 22 exposes an order falsely using Prince Jeta's name; volumes 23–24 ask whether resistance through chaos would destroy the dead's last road home."),
    chapters: CONTINUATION_CHAPTERS.filter((chapter) => Number(chapter.no) >= 18 && Number(chapter.no) <= 24),
  },
  {
    id: "return",
    label: l("第二部・下｜卷二十五至二十七", "第二部・下｜卷二十五至二十七", "Part Two, III · Volumes 25–27"),
    title: l("回流：庇護所與最後潛入", "回流：庇护所与最后潜入", "The Refuge and the Final Infiltration"),
    bridge: l("卷二十四救出村民後，主角沿著被傾倒的丹渣追進地下墓地，才揭出卷二十五鼠王背後的煉丹廢料源頭。卷十六建立的臨時落腳處在卷二十六擴成庇護網；到卷二十七，散落的殘卷、口訣和實戰經驗才合為隱景八化，主角返回太一宮破壞偽鳳工程。終章補記保留關鍵未解：神籍焚毀，黃泉仍未修復。", "第二十四卷救出村民后，主角沿着被倾倒的丹渣追进地下墓地，才揭出第二十五卷鼠王背后的炼丹废料源头。第十六卷建立的临时落脚点在第二十六卷扩成庇护网；到第二十七卷，散落的残卷、口诀和实战经验才合为隐景八化，主角返回太一宫破坏伪凤工程。终章补记保留关键未解：神籍焚毁，黄泉仍未修复。", "After rescuing the village in volume 24, the protagonist follows dumped alchemical residue into the burial grounds and uncovers the waste behind the rat king in volume 25. The camp founded in volume 16 grows into a refuge in volume 26. By volume 27, scroll fragments, oral clues and field experience unite as the Eight Transformations, enabling the return to Taiyi Palace. The afterword keeps the central question open: the registers burn, but the Yellow Springs remain broken."),
    chapters: CONTINUATION_CHAPTERS.filter((chapter) => Number(chapter.no) >= 25 && Number(chapter.no) <= 27),
  },
];

const AFTERWORD = CONTINUATION_CHAPTERS.find((chapter) => chapter.no === "終")!;

function GuailiReadingPage() {
  const { locale } = useI18n();
  const currentIndex = (anchor: string) => ALL_CHAPTERS.findIndex((chapter) => chapter.anchor === anchor);
  const artLabel = tr(l("開啟原畫", "打开原画", "Open original artwork"), locale);
  return <main className="huangquan hqc-index hqr-reader" data-guaili-collection>
    <nav className="hqc-breadcrumb" aria-label={tr(l("所在位置", "所在位置", "Breadcrumb"), locale)}>
      <Link to="/">{tr(l("昭梧", "昭梧", "ZHAOWU"), locale)}</Link>
      <span aria-hidden="true">/</span>
      <Link to="/mythic-atlas">{tr(l("幽明萬象錄", "幽明万象录", "Mythic Archive"), locale)}</Link>
      <span aria-hidden="true">/</span>
      <span>{tr(l("三界異聞錄・黃泉紀", "三界异闻录・黄泉纪", "Tales of the Three Realms · Yellow Springs"), locale)}</span>
    </nav>

    <header className="hqr-opening">
      <p className="hqr-kicker">{tr(l("昭梧原創神話・連續故事線", "昭梧原创神话・连续故事线", "ZHAOWU Original Myth · Connected Story"), locale)}</p>
      <h1>{tr(l("三界異聞錄", "三界异闻录", "Tales of the Three Realms"), locale)}</h1>
      <p className="hqr-deck">{tr(l("從失籍開始，沿黃泉裂隙讀到隱景八化。", "从失籍开始，沿黄泉裂隙读到隐景八化。", "From the broken registers to the Eight Transformations."), locale)}</p>
      <p className="hqr-intro">{tr(l(
        "卷一至二十七與終章補記，現在沿同一條主線排列。每卷會保留前因、接續和下一步線索；點選卷名只在本書內前後移動，不會跳進另一篇孤立設定。以下是目前收錄的故事提要與插圖導讀，並非完整小說正文。",
        "卷一至二十七与终章补记，现在沿同一条主线排列。每卷保留前因、接续和下一步线索；点击卷名只在本书内前后移动，不会跳进另一篇孤立设定。以下是目前收录的故事提要与插图导读，并非完整小说正文。",
        "Volumes 1–27 and the afterword now follow one story line. Each entry keeps its cause, continuation and next clue in view; choosing a volume moves within this same book. The material below is the currently collected story outline with illustrations, not complete novel prose."
      ), locale)}</p>
      <div className="hqr-stats" aria-label={tr(l("故事卷數", "故事卷数", "Reading scope"), locale)}>
        <span>{tr(l("原書 7 卷", "原书 7 卷", "Original 7 volumes"), locale)}</span>
        <span>{tr(l("續卷 20 卷", "续卷 20 卷", "Continuation 20 volumes"), locale)}</span>
        <span>{tr(l("終章補記", "终章补记", "Afterword"), locale)}</span>
      </div>
      <a className="hqr-start" href="#hqr-arc-registers">{tr(l("從第一卷開始讀", "从第一卷开始读", "Begin with volume 1"), locale)} <span aria-hidden="true">↓</span></a>
    </header>

    <nav className="hqr-toc" aria-label={tr(l("故事卷目", "故事卷目", "Story contents"), locale)}>
      <p>{tr(l("故事順序", "故事顺序", "Story order"), locale)}</p>
      {STORY_ARCS.map((arc) => <section key={arc.id} aria-labelledby={`hqr-toc-${arc.id}`}>
        <div id={`hqr-toc-${arc.id}`} className="hqr-toc-heading">
          <strong>{tr(arc.label, locale)}</strong><span>{tr(arc.title, locale)}</span>
        </div>
        <ol>
          {arc.chapters.map((chapter) => <li key={chapter.anchor}>
            <Link to="/guaili-luanshen" hash={chapter.anchor}>
              <span>{tr(chapter.number, locale)}</span><strong>{tr(chapter.title, locale)}</strong><i aria-hidden="true">↓</i>
            </Link>
          </li>)}
        </ol>
      </section>)}
      <Link className="hqr-afterword-link" to="/guaili-luanshen" hash={AFTERWORD.anchor}>
        {tr(l("卷末｜終章補記", "卷末｜终章补记", "Afterword"), locale)} ↓
      </Link>
    </nav>

    <div className="hqr-reading-note">
      <span aria-hidden="true">—</span>
      <p>{tr(l("卷間因果以同一條黃泉裂隙串起；地支圖鑑、十年編年與來源考據另留在《幽明萬象錄》資料頁。", "卷间因果以同一条黄泉裂隙串起；地支图鉴、十年编年与来源考据另留在《幽明万象录》资料页。", "The same breach links the volumes. Zodiac plates, the reference chronology and source notes remain in the Mythic Archive."), locale)}</p>
    </div>

    {STORY_ARCS.map((arc) => <section key={arc.id} id={`hqr-arc-${arc.id}`} className="hqr-arc" aria-labelledby={`hqr-heading-${arc.id}`}>
      <header className="hqr-arc-opening">
        <span>{tr(arc.label, locale)}</span>
        <h2 id={`hqr-heading-${arc.id}`}>{tr(arc.title, locale)}</h2>
        <p>{tr(arc.bridge, locale)}</p>
      </header>
      <div className="hqr-chapters">
        {arc.chapters.map((chapter) => {
          const artwork = ART_BY_CHAPTER[chapter.no];
          const index = currentIndex(chapter.anchor);
          const previous = ALL_CHAPTERS[index - 1];
          const next = ALL_CHAPTERS[index + 1];
          return <article className="hqr-chapter" id={chapter.anchor} key={chapter.anchor}>
            <div className="hqr-chapter-heading">
              <span>{tr(chapter.number, locale)}</span>
              <h3>{tr(chapter.title, locale)}</h3>
              <p>{tr(chapter.lead, locale)}</p>
            </div>
            {artwork && <figure className="hqr-artwork">
              <MythicImageViewer src={`/mythic-atlas/originals/${artwork.file}`} locale={locale} label={artLabel}>
                <img src={mythicWebPlate("originals", artwork.file)} width={941} height={1672} loading="lazy" decoding="async" alt={tr(artwork.alt, locale)} />
              </MythicImageViewer>
              <figcaption>{tr(artwork.caption, locale)}</figcaption>
            </figure>}
            <p className="hqr-chapter-text">{tr(chapter.text, locale)}</p>
            <nav className="hqr-next-prev" aria-label={tr(l("卷間導覽", "卷间导航", "Chapter navigation"), locale)}>
              {previous ? <Link to="/guaili-luanshen" hash={previous.anchor}><span aria-hidden="true">←</span>{tr(previous.number, locale)}</Link> : <span />}
              {next && <Link to="/guaili-luanshen" hash={next.anchor}>{tr(next.number, locale)}<span aria-hidden="true">→</span></Link>}
            </nav>
          </article>;
        })}
      </div>
    </section>)}

    <section className="hqr-afterword" id={AFTERWORD.anchor} aria-labelledby="hqr-afterword-heading">
      <p className="hqr-kicker">{tr(l("卷末補記", "卷末补记", "Afterword"), locale)}</p>
      <h2 id="hqr-afterword-heading">{tr(AFTERWORD.title, locale)}</h2>
      <p className="hqr-afterword-lead">{tr(AFTERWORD.lead, locale)}</p>
      <p>{tr(AFTERWORD.text, locale)}</p>
      <Link className="hqr-return" to="/mythic-atlas" hash="guaili">{tr(l("返回幽明萬象錄資料頁", "返回幽明万象录资料页", "Return to the Mythic Archive"), locale)} ↗</Link>
    </section>
    <footer className="hqc-footer">
      <p>{tr(l("創作界線：天庭官僚、黃泉裂隙、人物陣營與術法效果屬昭梧架空敘事。宗教人物、神獸名號與古籍線索須分層閱讀；未考定處不冒稱史實或教義。", "创作边界：天庭官僚、黄泉裂隙、人物阵营与术法效果属昭梧架空叙事。宗教人物、神兽名号与古籍线索须分层阅读；未考定处不冒称史实或教义。", "Heaven's bureaucracy, the broken crossing, factions and magical effects belong to ZHAOWU fiction. Religious figures, beast names and classical references are kept distinct; uncertain claims are not presented as history or doctrine."), locale)}</p>
      <p>STONE Original · ZHAOWU</p>
    </footer>
  </main>;
}
