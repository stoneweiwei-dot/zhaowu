import { CuratedVideoShelf } from "@/components/curated-video-shelf";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/mythic-atlas")({ component: MythicAtlasPage });

type Copy = {
  kicker: string; title: string; intro: string; sourceNote: string;
  tabs: { world: string; people: string; chapters: string };
  realmTitle: string; factionTitle: string; peopleTitle: string; chapterTitle: string;
  role: string; allegiance: string; story: string; source: string; selected: string;
  sourceBadge: string; sourceBody: string; originalLabel: string; back: string;
};
const COPY: Record<Locale, Copy> = {
  "zh-Hant": {
    kicker: "昭梧 · 異聞錄", title: "黃泉裂隙", intro: "一部以古籍、民間信仰與後世想像為靈感的原創神話幻想。當黃泉名冊出現空白，亡魂的歸路也隨之失序。",
    sourceNote: "本頁為跨文本的原創融合設定，不代表任何單一宗教教義或古籍原文。",
    tabs: { world: "天地圖譜", people: "人物名錄", chapters: "故事篇章" },
    realmTitle: "三界與歸路", factionTitle: "裂隙中的勢力", peopleTitle: "點選一位人物", chapterTitle: "選一段故事",
    role: "本作定位", allegiance: "所屬脈絡", story: "篇章", source: "來源標記", selected: "目前選讀",
    sourceBadge: "原典待校勘", sourceBody: "人物與典籍、地方信仰或現代二創的關係，需逐條核對後再補上具體書名、篇目與創作者授權資訊。此處的角色關係與情節均屬本作改編。",
    originalLabel: "原創融合設定", back: "回昭梧首頁",
  },
  "zh-Hans": {
    kicker: "昭梧 · 异闻录", title: "黄泉裂隙", intro: "一部以古籍、民间信仰与后世想象为灵感的原创神话幻想。当黄泉名册出现空白，亡魂的归路也随之失序。",
    sourceNote: "本页为跨文本的原创融合设定，不代表任何单一宗教教义或古籍原文。",
    tabs: { world: "天地图谱", people: "人物名录", chapters: "故事篇章" },
    realmTitle: "三界与归路", factionTitle: "裂隙中的势力", peopleTitle: "点选一位人物", chapterTitle: "选一段故事",
    role: "本作定位", allegiance: "所属脉络", story: "篇章", source: "来源标记", selected: "当前选读",
    sourceBadge: "原典待校勘", sourceBody: "人物与典籍、地方信仰或现代二创的关系，需逐条核对后再补上具体书名、篇目与创作者授权信息。此处的角色关系与情节均属本作改编。",
    originalLabel: "原创融合设定", back: "回昭梧首页",
  },
  en: {
    kicker: "ZHAOWU · TALES BEYOND THE VEIL", title: "The Rift of Yellow Springs", intro: "An original mythic fantasy inspired by classical texts, folk traditions and later imagination. When names vanish from the underworld register, the road of the dead begins to fail.",
    sourceNote: "This is an original crossover setting, not a statement of any single religion or classical text.",
    tabs: { world: "World map", people: "People", chapters: "Chapters" },
    realmTitle: "Realms and the crossing", factionTitle: "Powers within the rift", peopleTitle: "Choose a figure", chapterTitle: "Choose a chapter",
    role: "Role in this story", allegiance: "Story thread", story: "Chapter", source: "Source note", selected: "Now reading",
    sourceBadge: "Sources to verify", sourceBody: "Connections to classical texts, regional traditions or modern adaptations must be checked one by one before adding precise citations and creator permissions. Character relationships and plot here are original adaptations.",
    originalLabel: "Original crossover setting", back: "Back to ZHAOWU",
  },
};

type Localized = { hant: string; hans: string; en: string };
const text = (value: Localized, locale: Locale) => locale === "en" ? value.en : locale === "zh-Hans" ? value.hans : value.hant;

const REALMS: Array<{ mark: string; title: Localized; body: Localized }> = [
  { mark: "天", title: { hant: "天律", hans: "天律", en: "Heavenly order" }, body: { hant: "神職、山川與人間祭祀所維繫的秩序。", hans: "神职、山川与人间祭祀所维系的秩序。", en: "The order of divine offices, landscapes and human rites." } },
  { mark: "人", title: { hant: "人間", hans: "人间", en: "The living world" }, body: { hant: "眾生生活之地，也是裂隙最先顯形之處。", hans: "众生生活之地，也是裂隙最先显形之处。", en: "Where people live, and where the first signs appear." } },
  { mark: "泉", title: { hant: "黃泉", hans: "黄泉", en: "Yellow Springs" }, body: { hant: "收容亡魂、裁定因果的幽冥所在。", hans: "收容亡魂、裁定因果的幽冥所在。", en: "The underworld that receives the dead and weighs their deeds." } },
  { mark: "渡", title: { hant: "輪迴渡口", hans: "轮回渡口", en: "The crossing" }, body: { hant: "亡魂離開黃泉、走向下一程的關口；如今裂縫正在此處擴大。", hans: "亡魂离开黄泉、走向下一程的关口；如今裂隙正在此处扩大。", en: "The passage onward from the underworld, now widening into a rift." } },
];

const FACTIONS: Array<{ name: Localized; note: Localized }> = [
  { name: { hant: "天界巡序", hans: "天界巡序", en: "Keepers of the heavens" }, note: { hant: "維護天律，卻未必認同彼此的管轄邊界。", hans: "维护天律，却未必认同彼此的管辖边界。", en: "They uphold heavenly order, while disputing its boundaries." } },
  { name: { hant: "五嶽封疆", hans: "五岳封疆", en: "Wardens of the sacred peaks" }, note: { hant: "鎮守山川界域，追查越界的異獸與妖邪。", hans: "镇守山川界域，追查越界的异兽与妖邪。", en: "They guard landscape borders and pursue those who cross them." } },
  { name: { hant: "幽冥官署", hans: "幽冥官署", en: "The underworld offices" }, note: { hant: "試圖修補亡魂名冊與引渡秩序。", hans: "试图修补亡魂名册与引渡秩序。", en: "They try to restore the register of the dead and its routes." } },
  { name: { hant: "山川異類", hans: "山川异类", en: "Beings of wild places" }, note: { hant: "有的趁亂擴張，有的只想找回失去的歸處。", hans: "有的趁乱扩张，有的只想找回失去的归处。", en: "Some exploit the chaos; others only seek a place to belong." } },
  { name: { hant: "外道與海上暗潮", hans: "外道与海上暗潮", en: "Outsiders and the sea's shadow" }, note: { hant: "彼此並非同盟，卻都在追逐裂隙帶來的力量。", hans: "彼此并非同盟，却都在追逐裂隙带来的力量。", en: "No single alliance, but each seeks power in the breach." } },
];

const PEOPLE: Array<{ name: Localized; role: Localized; thread: Localized; mark: string }> = [
  { name: { hant: "東皇太一", hans: "东皇太一", en: "Donghuang Taiyi" }, role: { hant: "天界古老秩序的象徵", hans: "天界古老秩序的象征", en: "A symbol of ancient celestial order" }, thread: { hant: "天律", hans: "天律", en: "Heavenly order" }, mark: "日" },
  { name: { hant: "二郎神", hans: "二郎神", en: "Erlang Shen" }, role: { hant: "奉命搜山、追查越界之物", hans: "奉命搜山、追查越界之物", en: "Sent to search the mountains and pursue fugitives" }, thread: { hant: "五嶽封疆", hans: "五岳封疆", en: "Sacred peak wardens" }, mark: "山" },
  { name: { hant: "后土娘娘", hans: "后土娘娘", en: "Houtu" }, role: { hant: "守望幽冥秩序與亡魂歸屬", hans: "守望幽冥秩序与亡魂归属", en: "A guardian of underworld order and the dead's passage" }, thread: { hant: "幽冥", hans: "幽冥", en: "The underworld" }, mark: "土" },
  { name: { hant: "金花聖母", hans: "金花圣母", en: "Golden Flower Matriarch" }, role: { hant: "五毒傳說在本作中的關鍵人物", hans: "五毒传说在本作中的关键人物", en: "A key figure in this story's Five Poisons thread" }, thread: { hant: "山川異類", hans: "山川异类", en: "Wild beings" }, mark: "花" },
  { name: { hant: "相柳", hans: "相柳", en: "Xiangliu" }, role: { hant: "上古洪災記憶的化身", hans: "上古洪灾记忆的化身", en: "An embodiment of ancient flood memory" }, thread: { hant: "上古災異", hans: "上古灾异", en: "Ancient calamities" }, mark: "水" },
  { name: { hant: "波旬", hans: "波旬", en: "Mara" }, role: { hant: "試圖誘惑亡魂偏離歸路", hans: "试图诱惑亡魂偏离归路", en: "A tempter drawing souls away from their path" }, thread: { hant: "外道暗潮", hans: "外道暗潮", en: "The outsiders' shadow" }, mark: "影" },
];

const CHAPTERS: Array<{ title: Localized; label: Localized; paragraphs: Record<Locale, string[]> }> = [
  { title: { hant: "名冊上的空白", hans: "名册上的空白", en: "A blank in the register" }, label: { hant: "序章 · 黃泉", hans: "序章 · 黄泉", en: "Prologue · Underworld" }, paragraphs: {
    "zh-Hant": ["使者捧著新抄的亡魂名冊走過渡口，紙上有一行名字被雨水洗去。那不是漏登，也不是筆誤——整個黃泉，沒有人記得那個亡魂曾經存在。", "當夜，另一端的輪迴燈火熄了一盞。後土沒有下令封關，只讓人把空白那頁送往人間。"],
    "zh-Hans": ["使者捧着新抄的亡魂名册走过渡口，纸上有一行名字被雨水洗去。那不是漏登，也不是笔误——整个黄泉，没有人记得那个亡魂曾经存在。", "当夜，另一端的轮回灯火熄了一盏。后土没有下令封关，只让人把空白那页送往人间。"],
    en: ["An envoy carried the newly copied register across the crossing. One name had been washed away—not misfiled, not misspelled. No one in the underworld remembered that soul at all.", "That night, one light on the far side of the cycle went dark. Houtu did not close the passage. She sent the blank page to the living world."],
  } },
  { title: { hant: "灌口搜山", hans: "灌口搜山", en: "The search at Guankou" }, label: { hant: "第一章 · 人間", hans: "第一章 · 人间", en: "Chapter I · The living world" }, paragraphs: {
    "zh-Hant": ["灌口山路上，二郎神看見草木間留下不屬於任何獸類的足印。足印一路朝北，卻在一座廢棄祭壇前突然折向黃泉。", "他沒有立刻追擊。若那逃亡者只是想回家，追捕便可能把它推進更深的裂縫。"],
    "zh-Hans": ["灌口山路上，二郎神看见草木间留下不属于任何兽类的足印。足印一路朝北，却在一座废弃祭坛前突然折向黄泉。", "他没有立刻追击。若那逃亡者只是想回家，追捕便可能把它推进更深的裂隙。"],
    en: ["On the mountain road at Guankou, Erlang Shen found tracks no known beast could have left. They ran north, then turned toward the underworld at an abandoned altar.", "He did not strike at once. If the fugitive was only trying to go home, the hunt might drive it deeper into the rift."],
  } },
  { title: { hant: "海上無燈", hans: "海上无灯", en: "No lanterns at sea" }, label: { hant: "第二章 · 東南海隅", hans: "第二章 · 东南海隅", en: "Chapter II · The southeastern coast" }, paragraphs: {
    "zh-Hant": ["東南海隅連著三夜不見漁火。岸上的祭壇收到陌生的祈詞，海霧裡卻傳來亡魂敲門的聲音。", "沿海諸神各自派人探查，沒有人承認自己打開了那條路。"],
    "zh-Hans": ["东南海隅连着三夜不见渔火。岸上的祭坛收到陌生的祈词，海雾里却传来亡魂敲门的声音。", "沿海诸神各自派人探查，没有人承认自己打开了那条路。"],
    en: ["For three nights, no fishing lanterns appeared along the southeastern shore. An unfamiliar prayer reached the altar; from the sea mist came the sound of the dead knocking.", "The coastal powers each sent an envoy. None admitted to opening the way."],
  } },
];

function MythicAtlasPage() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [tab, setTab] = useState<"world" | "people" | "chapters">("world");
  const [person, setPerson] = useState(0);
  const [chapter, setChapter] = useState(0);

  const tabClass = (active: boolean) => `min-h-11 rounded-full px-4 text-sm transition-colors ${active ? "bg-[#35594e] text-[#fffdf7]" : "border border-[#d9ceb8] bg-[#fffdf7]/80 text-[#455148] hover:border-[#789080]"}`;

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 pb-16 pt-2 sm:px-6" data-mythic-atlas>
      <header className="relative overflow-hidden rounded-[28px] border border-[#d9ceb8] bg-[#fbf8f0] p-6 shadow-[0_18px_50px_rgba(62,45,24,.07)] sm:p-10">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border border-[#6e8a76]/20" />
        <div aria-hidden className="pointer-events-none absolute -right-2 -top-8 h-40 w-40 rounded-full border border-[#6e8a76]/20" />
        <p className="text-xs tracking-[0.28em] text-[#7b4938]">{copy.kicker}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-[#25382f] sm:text-6xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#59645b]">{copy.intro}</p>
        <a href="/" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[#d9ceb8] px-4 text-sm text-[#455148] hover:bg-white/70">{copy.back}</a>
        <p className="mt-4 border-l-2 border-[#a87954] pl-3 text-xs leading-6 text-[#766b5c]">{copy.sourceNote}</p>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label={copy.kicker}>
        {(["world", "people", "chapters"] as const).map((key) => (
          <button key={key} type="button" className={tabClass(tab === key)} aria-pressed={tab === key} onClick={() => setTab(key)}>{copy.tabs[key]}</button>
        ))}
      </nav>

      {tab === "world" ? <div className="space-y-5">
        <section className="rounded-2xl border border-[#d9ceb8] bg-[#fffdf7]/90 p-5 sm:p-7">
          <p className="text-xs tracking-[0.2em] text-[#7b4938]">01 · {copy.realmTitle}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {REALMS.map((realm) => <article key={realm.mark} className="flex gap-4 rounded-xl border border-[#e2d8c5] bg-[#fbf8f0] p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#79917d]/50 font-display text-xl text-[#35594e]">{realm.mark}</span>
              <div><h2 className="font-display text-lg text-[#293a31]">{text(realm.title, locale)}</h2><p className="mt-1 text-sm leading-6 text-[#62665e]">{text(realm.body, locale)}</p></div>
            </article>)}
          </div>
        </section>
        <section className="rounded-2xl border border-[#d9ceb8] bg-[#fffdf7]/90 p-5 sm:p-7">
          <p className="text-xs tracking-[0.2em] text-[#7b4938]">02 · {copy.factionTitle}</p>
          <div className="mt-4 divide-y divide-[#e2d8c5]">
            {FACTIONS.map((faction) => <article key={faction.name.en} className="py-3 first:pt-0 last:pb-0">
              <h3 className="font-display text-lg text-[#293a31]">{text(faction.name, locale)}</h3><p className="mt-1 text-sm leading-6 text-[#62665e]">{text(faction.note, locale)}</p>
            </article>)}
          </div>
        </section>
      </div> : null}

      {tab === "people" ? <section className="rounded-2xl border border-[#d9ceb8] bg-[#fffdf7]/90 p-5 sm:p-7">
        <p className="text-xs tracking-[0.2em] text-[#7b4938]">03 · {copy.peopleTitle}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PEOPLE.map((entry, index) => <button key={entry.name.en} type="button" aria-pressed={person === index} onClick={() => setPerson(index)} className={`min-h-28 rounded-xl border p-4 text-left transition ${person === index ? "border-[#557461] bg-[#eef1e9]" : "border-[#e2d8c5] bg-[#fbf8f0] hover:border-[#9ead9b]"}`}>
            <span className="flex items-start justify-between gap-2"><strong className="font-display text-lg text-[#293a31]">{text(entry.name, locale)}</strong><span aria-hidden className="text-lg text-[#8c7050]">{entry.mark}</span></span>
            <span className="mt-2 block text-sm leading-6 text-[#62665e]">{text(entry.role, locale)}</span>
          </button>)}
        </div>
        <article className="mt-4 rounded-xl border-l-2 border-[#7d9881] bg-[#f6f4ec] p-4 sm:p-5" aria-live="polite">
          <p className="text-xs tracking-[0.18em] text-[#7b4938]">{copy.selected}</p>
          <h2 className="mt-2 font-display text-2xl text-[#293a31]">{text(PEOPLE[person].name, locale)}</h2>
          <p className="mt-2 text-sm leading-6 text-[#62665e]"><strong>{copy.role}：</strong>{text(PEOPLE[person].role, locale)}</p>
          <p className="mt-1 text-sm leading-6 text-[#62665e]"><strong>{copy.allegiance}：</strong>{text(PEOPLE[person].thread, locale)}</p>
          <p className="mt-3 inline-flex rounded-full bg-[#e9e2d4] px-3 py-1 text-xs text-[#675c4d]">{copy.source} · {copy.sourceBadge}</p>
        </article>
      </section> : null}

      {tab === "chapters" ? <section className="rounded-2xl border border-[#d9ceb8] bg-[#fffdf7]/90 p-5 sm:p-7">
        <p className="text-xs tracking-[0.2em] text-[#7b4938]">04 · {copy.chapterTitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CHAPTERS.map((item, index) => <button key={item.title.en} type="button" aria-pressed={chapter === index} onClick={() => setChapter(index)} className={tabClass(chapter === index)}>{text(item.title, locale)}</button>)}
        </div>
        <article className="mt-5 rounded-xl bg-[#fbf8f0] p-5 sm:p-7" aria-live="polite">
          <p className="text-xs tracking-[0.18em] text-[#7b4938]">{text(CHAPTERS[chapter].label, locale)}</p>
          <h2 className="mt-2 font-display text-2xl text-[#293a31]">{text(CHAPTERS[chapter].title, locale)}</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-8 text-[#4f5a52]">{CHAPTERS[chapter].paragraphs[locale].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <p className="mt-5 border-t border-[#e2d8c5] pt-4 text-xs leading-6 text-[#766b5c]">{copy.story}：{copy.originalLabel}</p>
        </article>
      </section> : null}

      <CuratedVideoShelf placement="mythic" />

      <footer className="rounded-2xl border border-[#d9ceb8] bg-[#f3efe4] p-5 sm:p-6">
        <p className="font-display text-lg text-[#293a31]">{copy.source} · {copy.sourceBadge}</p>
        <p className="mt-2 text-sm leading-7 text-[#62665e]">{copy.sourceBody}</p>
      </footer>
    </main>
  );
}
