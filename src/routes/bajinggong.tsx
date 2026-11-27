import { pageHead } from "@/lib/route-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";
import { MythicImageViewer } from "./-mythic-image-viewer";
import "./bajinggong.css";

export const Route = createFileRoute("/bajinggong")({ head: pageHead, component: BajinggongPage });

type Three = readonly [string, string, string];
const t = (value: Three, locale: Locale) => locale === "en" ? value[2] : locale === "zh-Hans" ? value[1] : value[0];

const SCENES: { id: string; image: string; original: string; title: Three; style: Three; description: Three }[] = [
  {
    id: "hanhai-cangming", image: "01-hanhai-cangming.webp", original: "01-hanhai-cangming.png",
    title: ["瀚海滄溟", "瀚海沧溟", "Boundless Azure Sea"],
    style: ["青綠海景 · 仙島晨光", "青绿海景 · 仙岛晨光", "Blue-green seascape · dawn"],
    description: ["萬里碧海吞吐天光，仙島在晨曦與浪濤間浮現。以海天無際的開闊，開啟九景之門。", "万里碧海吞吐天光，仙岛在晨曦与浪涛间浮现。以海天无际的开阔，开启九景之门。", "Endless waves meet the dawn; distant isles rise from the light. An oceanic threshold to the nine imagined realms."]
  },
  {
    id: "luansheng-kunyue", image: "02-luansheng-kunyue.webp", original: "02-luansheng-kunyue.png",
    title: ["巒勝崑嶽", "峦胜昆岳", "Majestic Kun Peaks"],
    style: ["北宋巨嶂 · 雲瀑層峰", "北宋巨嶂 · 云瀑层峰", "Monumental Song mountains"],
    description: ["峭壁拔地接天，雲瀑盤繞千峰。借崑嶽之名，描繪高山勝境的雄渾與清峻。", "峭壁拔地接天，云瀑盘绕千峰。借昆岳之名，描绘高山胜境的雄浑与清峻。", "Cliffs rise through cascading cloud and water, evoking the grandeur of an imagined sacred mountain."]
  },
  {
    id: "zhonghua-shenxiu", image: "03-zhonghua-shenxiu.webp", original: "03-zhonghua-shenxiu.png",
    title: ["鍾華神秀", "钟华神秀", "Garden of Divine Blossoms"],
    style: ["院體工筆 · 四時花苑", "院体工笔 · 四时花苑", "Fine-brush palace garden"],
    description: ["花木四時同芳，靈泉穿過深谷宮苑。以工筆花鳥與繁盛園林，寫自然造化之秀。", "花木四时同芳，灵泉穿过深谷宫苑。以工笔花鸟与繁盛园林，写自然造化之秀。", "Blossoms, spring water and hidden pavilions gather the abundance of all four seasons into one enchanted garden."]
  },
  {
    id: "yueyang-yaohui", image: "04-yueyang-yaohui.webp", original: "04-yueyang-yaohui.png",
    title: ["月陽曜輝", "月阳曜辉", "Radiance of Sun and Moon"],
    style: ["日月天宮 · 金碧重彩", "日月天宫 · 金碧重彩", "Celestial palace · gilded colour"],
    description: ["日月同輝，光照天闕，金色與月白交織。這是象徵性的仙境天象，並非真實天文記錄。", "日月同辉，光照天阙，金色与月白交织。这是象征性的仙境天象，并非真实天文记录。", "Sun and moon illuminate one celestial palace together: a symbolic vision, not a literal astronomical event."]
  },
  {
    id: "yaoguang-luohuan", image: "05-yaoguang-luohuan.webp", original: "05-yaoguang-luohuan.png",
    title: ["瑤光羅幻", "瑶光罗幻", "Illusions of Celestial Light"],
    style: ["星雲仙宮 · 藍金幻彩", "星云仙宫 · 蓝金幻彩", "Star palace · blue and gold"],
    description: ["瑤宮懸於星雲之間，光軌環繞玉闕。以虛實相映，表現天界難以捉摸的光景。", "瑶宫悬于星云之间，光轨环绕玉阙。以虚实相映，表现天界难以捉摸的光景。", "A luminous palace hangs amid star clouds, its paths of light weaving illusion into architecture."]
  },
  {
    id: "shuilan-yanxia", image: "06-shuilan-yanxia.webp", original: "06-shuilan-yanxia.png",
    title: ["水嵐煙霞", "水岚烟霞", "Water Mist and Evening Haze"],
    style: ["南宋水墨 · 暮色平遠", "南宋水墨 · 暮色平远", "Southern Song ink · quiet dusk"],
    description: ["遠水如練，煙霞低迴，草岸與群山漸隱。九景之中，以一卷靜謐留住江天呼吸。", "远水如练，烟霞低回，草岸与群山渐隐。九景之中，以一卷静谧留住江天呼吸。", "Reeds, distant hills and pale mist settle into the stillness of a Southern Song-inspired evening."]
  },
  {
    id: "yunni-hongyuan", image: "07-yunni-hongyuan.webp", original: "07-yunni-hongyuan.png",
    title: ["雲霓虹淵", "云霓虹渊", "Rainbow Veil Above the Abyss"],
    style: ["敦煌岩彩 · 虹霓天門", "敦煌岩彩 · 虹霓天门", "Mineral pigments · rainbow gate"],
    description: ["七彩雲霓跨越深淵，天門隱於飛瀑與霞光。以岩彩的流動色層，寫仙境奇變。", "七彩云霓跨越深渊，天门隐于飞瀑与霞光。以岩彩的流动色层，写仙境奇变。", "Rainbow clouds cross a deep gorge as a hidden gate glimmers among waterfalls and mineral colours."]
  },
  {
    id: "luoshi-xinghe", image: "08-luoshi-xinghe.webp", original: "08-luoshi-xinghe.png",
    title: ["落世星河", "落世星河", "River of Stars Descending"],
    style: ["星河夜景 · 幽藍銀瀑", "星河夜景 · 幽蓝银瀑", "Starlit mountains · silver cascade"],
    description: ["天河垂落山川，星瀑照亮深谷與溪流。以天地相接的瞬間，想像星光如何落入人間。", "天河垂落山川，星瀑照亮深谷与溪流。以天地相接的瞬间，想象星光如何落入人间。", "A river of stars descends over dark mountains, turning a mountain stream into a mirror of the sky."]
  },
  {
    id: "hundun-hongmeng", image: "09-hundun-hongmeng.webp", original: "09-hundun-hongmeng.png",
    title: ["混沌鴻蒙", "混沌鸿蒙", "Primordial Chaos"],
    style: ["鴻蒙潑墨 · 天地初判", "鸿蒙泼墨 · 天地初判", "Primordial ink and swirling light"],
    description: ["清濁未分，水雲交旋，光自渾茫中生。以潑墨與流動色氣，收束九景於天地初始的想像。", "清浊未分，水云交旋，光自浑茫中生。以泼墨与流动色气，收束九景于天地初始的想象。", "Water, cloud and light swirl before the world has taken form: a painterly meditation on beginnings."]
  }
];

function BajinggongPage() {
  const { locale } = useI18n();
  return <main className="bajinggong" data-bajinggong>
    <header className="bajinggong-hero">
      <p className="bajinggong-eyebrow">{t(["昭梧 · 原創仙境圖志", "昭梧 · 原创仙境图志", "ZHAOWU · ORIGINAL ART ATLAS"], locale)}</p>
      <h1>{t(["八景宮 · 九景圖志", "八景宫 · 九景图志", "Nine Visions of the Eight-Scenery Palace"], locale)}</h1>
      <p className="bajinggong-lead">{t(["九景九畫，九種筆意。從瀚海到鴻蒙，將傳說中的仙境逐幅展開。", "九景九画，九种笔意。从瀚海到鸿蒙，将传说中的仙境逐幅展开。", "Nine visions, nine distinct visual languages. From boundless seas to primordial mist."], locale)}</p>
      <nav className="bajinggong-nav" aria-label={t(["本頁導覽", "本页导航", "Page navigation"], locale)}>
        <a href="#nine-scenes">{t(["閱覽九景", "阅览九景", "Explore nine visions"], locale)}</a>
        <a href="#source-notes">{t(["來源辨識", "来源辨识", "Source notes"], locale)}</a>
        <a href="/mythic-atlas">{t(["返回幽明萬象錄", "返回幽明万象录", "Back to the mythic atlas"], locale)}</a>
      </nav>
    </header>
    <section id="nine-scenes" className="bajinggong-gallery" aria-label={t(["九景原畫", "九景原画", "Nine original artworks"], locale)}>
      {SCENES.map((scene, index) => <article className={"bajinggong-scene" + (index % 2 ? " is-reversed" : "")} id={scene.id} key={scene.id}>
        <figure className="bajinggong-figure">
          <div className="bajinggong-image-wrap">
            <MythicImageViewer
              src={"/bajinggong/originals/" + scene.original}
              label={t([`開啟${scene.title[0]}高清原圖`, `打开${scene.title[1]}高清原图`, `Open the full-resolution ${scene.title[2]} artwork`], locale)}
              locale={locale}
              className="bajinggong-image-link"
            >
              <img src={"/bajinggong/" + scene.image} alt={t(scene.title, locale) + " · " + t(scene.style, locale)} width={941} height={1672} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
            </MythicImageViewer>
            <span className="bajinggong-credit">昭梧.S 原創</span>
          </div>
        </figure>
        <div className="bajinggong-copy">
          <span className="bajinggong-number">{String(index + 1).padStart(2, "0")} / 09</span>
          <h2>{t(scene.title, locale)}</h2>
          <p className="bajinggong-style">{t(scene.style, locale)}</p>
          <p>{t(scene.description, locale)}</p>
          <a href={"/bajinggong/originals/" + scene.original} target="_blank" rel="noopener noreferrer">{t(["開啟完整 PNG 原畫", "打开完整 PNG 原画", "Open original PNG artwork"], locale)}</a>
        </div>
      </article>)}
    </section>
    <section className="bajinggong-sources" id="source-notes">
      <p className="bajinggong-eyebrow">{t(["考據與創作界線", "考据与创作界线", "SOURCE & INTERPRETATION"], locale)}</p>
      <h2>{t(["九景是藝術演繹，不是古籍原文名錄", "九景是艺术演绎，不是古籍原文名录", "An artistic interpretation, not a classical canon"], locale)}</h2>
      <p>{t(["「八景宮」等名稱可見於《封神演義》及後世仙道敘事；但此處的九景名稱、排序與具體景物，屬現代整理與昭梧的原創視覺推演。不能將這套九景當成《封神演義》逐條記載的原典設定。", "“八景宫”等名称可见于《封神演义》及后世仙道叙事；但此处的九景名称、排序与具体景物，属于现代整理与昭梧的原创视觉推演。不能将这套九景当成《封神演义》逐条记载的原典设定。", "The Eight-Scenery Palace appears in later literary and Daoist-inspired narratives, including Investiture of the Gods. These nine names, their order and their depicted landscapes are a modern compilation and original artistic interpretation, not a nine-part list quoted from the novel."], locale)}</p>
      <p>{t(["畫風分別借鑑宋畫、工筆、岩彩與山水意象；作品為當代創作，並非歷史古畫或宗教圖像的復原。", "画风分别借鉴宋画、工笔、岩彩与山水意象；作品为当代创作，并非历史古画或宗教图像的复原。", "The artworks draw on Song painting, fine-brush traditions, mineral pigments and landscape motifs. They are contemporary interpretations, not restored historical paintings."], locale)}</p>
      <p className="bajinggong-signoff">昭梧.S 原創 · ZHAOWU</p>
    </section>
    <footer className="bajinggong-footer"><a href="/knowledge">{t(["知識庫", "知识库", "Knowledge"], locale)}</a><a href="/mythic-atlas">{t(["幽明萬象錄", "幽明万象录", "Mythic Atlas"], locale)}</a><a href="/">{t(["昭梧首頁", "昭梧首页", "ZHAOWU Home"], locale)}</a></footer>
  </main>;
}
