import { pageHead } from "@/lib/route-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import "./yunyi-shenxiang.css";
import "./-mythic-image-viewer.css";

export const Route = createFileRoute("/yunyi-shenxiang")({ head: pageHead, component: YunyiShenxiangPage });

type Copy = readonly [string, string, string];
type Work = { n: number; title: Copy; note?: Copy; variants?: number[]; id?: string };
const c = (value: Copy, locale: Locale) => value[locale === "en" ? 2 : locale === "zh-Hans" ? 1 : 0];
const work = (n: number, hant: string, hans = hant, en = hant, note?: Copy, variants?: number[], id?: string): Work => ({ n, title: [hant, hans, en], note, variants, id });
const tomes: { id: string; title: Copy; intro: Copy; works: Work[] }[] = [
  { id: "volume-1", title: ["封神人物", "封神人物", "Investiture of the Gods"], intro: ["人物異版仍歸在同一條目；畫像意象與小說情節分開閱讀。", "人物异版仍归在同一条目；画像意象与小说情节分开阅读。", "Related versions stay together. Artistic imagery is distinguished from the novel's events."], works: [
    work(1,"陸壓道人・雲天金影","陆压道人·云天金影","Lu Ya · Golden Figure in the Clouds",["原創演繹：箭書與飛刃並置，呼應不同情節，並非小說中的同時出手。","原创演绎：箭书与飞刃并置，呼应不同情节，并非小说中的同时出手。","Original interpretation: the arrow text and flying blade refer to separate episodes, not simultaneous actions."],[],"lu-ya"),
    work(2,"鴻鈞道人・礦彩天界聖像","鸿钧道人·矿彩天界圣像","Hongjun · Mineral-colour celestial icon"), work(3,"太上老君・太極入雲","太上老君·太极入云","Laozi · Taiji among clouds"), work(4,"元始天尊・崑崙法相","元始天尊·昆仑法相","Primordial Lord · Kunlun image"), work(5,"通天教主・截教神威","通天教主·截教神威","Tongtian · Power of the Jie School"), work(6,"女媧娘娘・天工聖影","女娲娘娘·天工圣影","Nüwa · Sacred image of creation"), work(7,"昊天上帝・天庭之主","昊天上帝·天庭之主","Jade Emperor · Lord of Heaven"), work(8,"接引道人・雲海渡緣","接引道人·云海渡缘","Amitabha · Crossing the cloud sea"), work(9,"准提道人・七寶妙樹","准提道人·七宝妙树","Zhunti · Seven-jeweled tree"),
    work(10,"柏鑑","柏鉴","Bojian",undefined,[12]), work(11,"炳靈公・三山曙光","炳灵公·三山曙光","Bingling · Dawn over three peaks"), work(12,"黃飛虎","黄飞虎","Huang Feihu",undefined,[52]), work(13,"崇黑虎","崇黑虎","Chong Heihu"), work(14,"北嶽大帝","北岳大帝","Northern Peak Emperor"), work(15,"中嶽大帝","中岳大帝","Central Peak Emperor"), work(16,"西嶽大帝","西岳大帝","Western Peak Emperor"), work(17,"聞仲","闻仲","Wen Zhong"), work(18,"鄧忠","邓忠","Deng Zhong"), work(19,"金靈聖母・斗府御星","金灵圣母·斗府御星","Golden Spirit · Star court"), work(20,"魯雄","鲁雄","Lu Xiong"), work(21,"王魔","王魔","Wang Mo"), work(22,"楊任","杨任","Yang Ren",["異版：具面與無面畫像並置。","异版：具面与无面画像并置。","Variants: the face and faceless versions are shown together."],[31]), work(23,"呂岳","吕岳","Lü Yue",["異版：具面與無面畫像並置。","异版：具面与无面画像并置。","Variants: the face and faceless versions are shown together."],[30]), work(24,"楊森","杨森","Yang Sen"), work(25,"殷郊","殷郊","Yin Jiao"), work(26,"羅宣","罗宣","Luo Xuan",["異版：紅金火雲與不同面相。","异版：红金火云与不同面相。","Variants retain the red and gold flames with differing faces."],[29]), work(27,"伯邑考","伯邑考","Bo Yikao",undefined,[32]), work(28,"趙公明","赵公明","Zhao Gongming",["原著線索：第四十九回寫陸壓之計後趙公明身亡。圖像採受封後玄壇真君意象，與征戰時點不同。","原著线索：第四十九回写陆压之计后赵公明身亡。图像采用受封后玄坛真君意象，与征战时点不同。","Classical source: chapter 49 recounts Zhao Gongming's death after Lu Ya's stratagem. The image shows his later deified form."],[],"plate-28"), work(29,"余化龍","余化龙","Yu Hualong"), work(30,"魔禮青","魔礼青","Mo Liqing"), work(31,"魔禮海","魔礼海","Mo Lihai"), work(32,"魔禮紅","魔礼红","Mo Lihong"), work(33,"魔禮壽","魔礼寿","Mo Lishou"), work(34,"金氏衛房聖母","金氏卫房圣母","Holy Mother of the Jin Household"), work(35,"雲霄娘娘","云霄娘娘","Yunxiao",["原著故事：姊妹展開兄長遺袍，看見未歸的金蛟剪。","原著故事：姊妹展开兄长遗袍，看见未归的金蛟剪。","Story: the sisters open their brother's robe and find the Golden Scissors he never returned."],[],"plate-35"), work(36,"瓊霄娘娘","琼霄娘娘","Qiongxiao",undefined,[],"plate-36"), work(37,"碧霄娘娘","碧霄娘娘","Bixiao",undefined,[],"plate-37"), work(38,"申公豹","申公豹","Shen Gongbao"), work(39,"伏羲：河圖八卦初演","伏羲：河图八卦初演","Fuxi · First performance of the River Map"), work(40,"神農炎帝","神农炎帝","Shennong, the Flame Emperor"), work(41,"軒轅黃帝","轩辕黄帝","Xuanyuan, the Yellow Emperor"), work(42,"哪吒","哪吒","Nezha"), work(43,"楊戩","杨戬","Yang Jian"), work(44,"雷震子","雷震子","Lei Zhenzi"), work(45,"姜子牙","姜子牙","Jiang Ziya"), work(46,"龍吉公主・瑤池月劍","龙吉公主·瑶池月剑","Princess Longji · Moonlit sword"),
  ]},
  { id: "volume-2", title: ["楚辭九歌", "楚辞九歌", "Nine Songs of Chu"], intro: ["以《楚辭·九歌》神靈為題的群像與人物畫。", "以《楚辞·九歌》神灵为题的群像与人物画。", "Portraits and a group scene inspired by the deities in the Nine Songs."], works: [work(47,"九歌神靈群像","九歌神灵群像","Nine Songs · Assembly of deities"),work(48,"東皇太一","东皇太一","Taiyi, the Eastern Sovereign",undefined,[62]),work(49,"湘君","湘君","Lord of the Xiang",undefined,[63]),work(50,"湘夫人","湘夫人","Lady of the Xiang",undefined,[64]),work(51,"大司命","大司命","Great Controller of Fate",undefined,[65]),work(52,"少司命","少司命","Lesser Controller of Fate",undefined,[68,70,71]),work(53,"東君","东君","Lord of the East",undefined,[66]),work(54,"河伯","河伯","River Earl",undefined,[67]),work(55,"山鬼","山鬼","Mountain Spirit",undefined,[69])]},
  { id: "volume-3", title: ["上古四時", "上古四时", "Ancient Four Seasons"], intro: ["四時意象供選閱，不判定所在地吉凶，也不更動曆法日期。", "四时意象供选阅，不判定所在地吉凶，也不更动历法日期。", "Seasonal imagery for reading; it does not determine local auspiciousness or alter calendar dates."], works: [work(56,"蓐收：秋山金雲","蓐收：秋山金云","Rongshou · Golden clouds over autumn peaks"),work(57,"句芒","句芒","Goumang"),work(58,"玄冥・霜雪神境","玄冥·霜雪神境","Xuanming · Frost and snow realm"),work(59,"祝融","祝融","Zhurong")]},
];

function YunyiShenxiangPage() {
  const { locale } = useI18n();
  const [selected, setSelected] = useState<{src:string; label:string} | null>(null);
  const [wallVisible, setWallVisible] = useState(false);
  const viewer = useRef<HTMLDialogElement>(null);
  const wallRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const dialog = viewer.current;
    if (selected && dialog && !dialog.open) dialog.showModal();
    document.documentElement.classList.toggle("yunyi-viewer-open", Boolean(selected));
    return () => document.documentElement.classList.remove("yunyi-viewer-open");
  }, [selected]);
  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setWallVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "900px 0px" });
    observer.observe(wall);
    return () => observer.disconnect();
  }, []);
  const text = (a: string,b: string,e: string) => c([a,b,e],locale);
  return <main className="yunyi-page">
    <header className="yunyi-hero" id="knowledge">
      <a className="yunyi-back" href="/knowledge#guanshilu-articles">{text("← 返回文章區","← 返回文章区","← Back to articles")}</a>
      <p className="yunyi-kicker">{text("昭梧原創圖志　｜　封神、九歌與四時","昭梧原创图志　｜　封神、九歌与四时","ZHAOWU ORIGINAL ATLAS · INVESTITURE, NINE SONGS & SEASONS")}</p>
      <h1>{text("《雲衣神相》","《云衣神相》","Yunyi Shenxiang")}</h1>
      <p className="yunyi-lead">{text("從陸壓道人翻開封神世界。三卷收錄 75 張完整畫作，人物異版並列，古典來源與原創演繹分開讀。","从陆压道人翻开封神世界。三卷收录 75 张完整画作，人物异版并列，古典来源与原创演绎分开读。","Enter the world of Investiture through Lu Ya. Three volumes gather 75 complete artworks, related variants and notes that separate classical sources from original interpretation.")}</p>
      <nav className="yunyi-nav" aria-label={text("本頁導覽","本页导航","Page navigation")}><a href="#gallery">{text("直接看 75 張作品","直接看 75 张作品","Jump to all 75 artworks")}</a><a href="#story-sanxiao">{text("金蛟剪未歸","金蛟剪未归","The Scissors Never Returned")}</a><a href="#seasonal-reading">{text("四時讀圖","四时读图","Seasonal reading")}</a></nav>
    </header>
    <section id="story-sanxiao" className="yunyi-story">
      <p className="yunyi-kicker">{text("故事線一　｜　封神人物","故事线一　｜　封神人物","STORY THREAD · INVESTITURE")}</p><h2>{text("金蛟剪未歸","金蛟剪未归","The Golden Scissors Never Returned")}</h2>
      <p>{text("趙公明借剪入戰，卻沒能親手還剪。交回三仙島姊妹手上的，是一件故人的道袍，裡面包著他借走的金蛟剪。三霄原可不下山，故事轉向，恰恰就在她們打開那件衣裳之後。","赵公明借剪入战，却没能亲手还剪。交回三仙岛姐妹手上的，是一件故人的道袍，里面包着他借走的金蛟剪。三霄原可不下山，故事转向，恰恰就在她们打开那件衣裳之后。","Zhao Gongming borrowed the Golden Scissors for battle but never returned them himself. His sisters receive his robe, with the borrowed treasure wrapped inside. Their story turns when they unfold it.")}</p>
      <div className="yunyi-story-links"><a href="#lu-ya">{text("陸壓獻計","陆压献计","Lu Ya's stratagem")}</a><a href="#plate-28">{text("趙公明借剪","赵公明借剪","Zhao Gongming borrows the scissors")}</a><a href="#plate-35">{text("雲霄至商營","云霄至商营","Yunxiao arrives")}</a><a href="#plate-36">{text("瓊霄入戰","琼霄入战","Qiongxiao enters battle")}</a><a href="#plate-37">{text("碧霄守陣","碧霄守阵","Bixiao holds the formation")}</a><a href="#story-sanxiao-end">{text("尾聲","尾声","Aftermath")}</a></div>
    </section>
    <nav id="gallery" className="yunyi-volumes" aria-label={text("三卷目錄","三卷目录","Three volumes")}>
      {tomes.map(t => <a href={`#${t.id}`} key={t.id}>{c(t.title,locale)}</a>)}
    </nav>
    <section ref={wallRef} className="yunyi-wall" aria-label={text("75 張作品縮圖牆","75 张作品缩略图墙","Wall of all 75 artworks")}>
      <h2>{text("三卷作品一覽","三卷作品一览","All works at a glance")}</h2>
      <p>{text("點選任一縮圖，可開啟完整畫幅。","点击任一缩略图，可打开完整画幅。","Select any thumbnail to open the full artwork.")}</p>
      <div className="yunyi-wall-grid">{Array.from({ length: 75 }, (_, index) => {
        const n = index + 1, nn = String(n).padStart(2,"0"), src = `/articles/yunyi-shenxiang/${nn}.webp`;
        const item = tomes.flatMap(t => t.works).find(w => w.n === n);
        const label = item ? c(item.title,locale) : nn;
        const thumbSrc = `/articles/yunyi-shenxiang/thumbs/${nn}.webp`;
        return <button key={n} type="button" className="yunyi-wall-thumb" aria-label={text(`開啟 ${label}`,`打开 ${label}`,`Open ${label}`)} onClick={() => setSelected({src,label})}><img src={thumbSrc} alt={label} width={240} height={428} loading={wallVisible ? "eager" : "lazy"} decoding="async" /><span>{nn}</span></button>;
      })}</div>
    </section>
    {tomes.map((tome, ti) => <section className="yunyi-tome" id={tome.id} key={tome.id}>
      <header><p className="yunyi-kicker">{text(`第 ${ti+1} 卷`,`第 ${ti+1} 卷`,`VOLUME ${ti+1}`)} · {tome.works.length} {text("條目","条目","entries")}</p><h2>{c(tome.title,locale)}</h2><p>{c(tome.intro,locale)}</p></header>
      <div className="yunyi-grid">{tome.works.map((item, index) => {
        const images = [item.n, ...(item.variants ?? [])];
        return <article className="yunyi-card" id={item.id ?? `plate-${item.n}`} key={item.n}>
          <div className="yunyi-art-grid">{images.map((artNo, version) => {
            const nn = String(artNo).padStart(2,"0"), src = `/articles/yunyi-shenxiang/${nn}.webp`;
            const label = `${c(item.title,locale)}${images.length > 1 ? ` · ${text("版本","版本","version")} ${version+1}` : ""}`;
            return <figure key={artNo}><button type="button" className="yunyi-image-link" aria-label={text(`開啟${label}完整畫幅`,`打开${label}完整画幅`,`Open full artwork: ${label}`)} onClick={() => setSelected({src,label})}><img src={src} alt={label} width={941} height={1672} loading={ti === 0 && index === 0 && version === 0 ? "eager" : "lazy"} decoding="async" /></button>{images.length > 1 && <figcaption>{text(`版本 ${version+1}`,`版本 ${version+1}`,`Version ${version+1}`)}</figcaption>}</figure>;
          })}</div>
          <div className="yunyi-caption"><span>{String(item.n).padStart(2,"0")}{images.length > 1 ? ` · ${images.length} ${text("版本","版本","versions")}` : ""}</span><h3>{c(item.title,locale)}</h3>{item.note && <p>{c(item.note,locale)}</p>}<span className="yunyi-credit">昭梧・S 原創</span></div>
        </article>;
      })}</div>
    </section>)}
    <section className="yunyi-season" id="seasonal-reading"><p className="yunyi-kicker">{text("四時意象","四时意象","SEASONAL IMAGERY")}</p><h2>{text("四時讀圖","四时读图","Reading the seasons")}</h2><p>{text("四張畫供選閱。南北半球可依所在地季節閱讀；此處不判定訪客位置，不把畫作象徵當成今日吉凶，也不更動黃曆或節氣日期。","四张画供选阅。南北半球可依所在地季节阅读；此处不判定访客位置，不把画作象征当成今日吉凶，也不更动黄历或节气日期。","Explore these four works by the season where you live. They do not detect location, predict auspiciousness or change calendar dates.")}</p><div>{[57,59,56,58].map(n => <a href={`#plate-${n}`} key={n}>{c(tomes[2].works.find(w=>w.n===n)!.title,locale)}</a>)}</div></section>
    <footer className="yunyi-footer"><p>{text("站用完整畫幅為 WebP；原始圖名溯源見《原圖總目》。","站用完整画幅为 WebP；原始图名溯源见《原图总目》。","Complete WebP artworks for the site. Original image titles are documented in the source catalogue.")}</p><p>昭梧・S 原創</p><a href="/knowledge#guanshilu-articles">{text("返回文章區","返回文章区","Back to articles")}</a></footer>
    <dialog ref={viewer} className="hq-image-viewer yunyi-viewer" aria-label={selected?.label ?? text("作品全圖","作品全图","Full artwork")} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <button type="button" className="hq-image-viewer-close" onClick={() => viewer.current?.close()}>{text("關閉圖片","关闭图片","Close image")} <span aria-hidden="true">×</span></button>
      {selected && <><a className="hq-image-viewer-original" href={selected.src} target="_blank" rel="noopener noreferrer">{text("查看原圖","查看原图","Full size")}</a><img src={selected.src} alt={selected.label} /></>}
    </dialog>
  </main>;
}
