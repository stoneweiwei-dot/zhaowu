import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/knowledge")({ component: KnowledgePage });

type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";
type Stem = { key: string; element: ElementKey; image: [string, string, string]; words: [string[], string[], string[]] };

const ELEMENT_CLASS: Record<ElementKey, string> = {
  wood: "border-wood/30 bg-wood/5 text-wood",
  fire: "border-fire/30 bg-fire/5 text-fire",
  earth: "border-earth/30 bg-earth/5 text-earth",
  metal: "border-metal/30 bg-metal/5 text-metal",
  water: "border-water/30 bg-water/5 text-water",
};

const STEMS: Stem[] = [
  { key: "甲", element: "wood", image: ["喬木／參天大樹", "乔木／参天大树", "Tall tree"], words: [["向上","生長","骨架","承擔"],["向上","生长","骨架","承担"],["upward","growth","framework","carrying"]] },
  { key: "乙", element: "wood", image: ["藤蔓／花草", "藤蔓／花草", "Vine and flowers"], words: [["柔韌","依附","延展","適應"],["柔韧","依附","延展","适应"],["flexibility","attachment","extension","adaptation"]] },
  { key: "丙", element: "fire", image: ["太陽／日輪", "太阳／日轮", "Sun"], words: [["外放","照耀","公開","熱能"],["外放","照耀","公开","热能"],["radiance","visibility","openness","heat"]] },
  { key: "丁", element: "fire", image: ["燈燭／爐火", "灯烛／炉火", "Lamp and flame"], words: [["集中","文明","細緻","持續"],["集中","文明","细致","持续"],["focus","culture","refinement","continuity"]] },
  { key: "戊", element: "earth", image: ["山嶽／堤岸", "山岳／堤岸", "Mountain and bank"], words: [["承載","邊界","穩定","阻隔"],["承载","边界","稳定","阻隔"],["support","boundary","stability","containment"]] },
  { key: "己", element: "earth", image: ["田園／沃土", "田园／沃土", "Field and soil"], words: [["培養","吸收","整理","孕育"],["培养","吸收","整理","孕育"],["cultivation","absorption","ordering","nurture"]] },
  { key: "庚", element: "metal", image: ["礦鐵／刀斧", "矿铁／刀斧", "Iron and blade"], words: [["改革","切割","執行","剛健"],["改革","切割","执行","刚健"],["reform","cutting","execution","strength"]] },
  { key: "辛", element: "metal", image: ["珠玉／精金", "珠玉／精金", "Jewel and refined metal"], words: [["精煉","審美","標準","細節"],["精炼","审美","标准","细节"],["refinement","aesthetics","standards","detail"]] },
  { key: "壬", element: "water", image: ["江河／大海", "江河／大海", "River and sea"], words: [["流動","容量","連接","勢能"],["流动","容量","连接","势能"],["flow","capacity","connection","momentum"]] },
  { key: "癸", element: "water", image: ["雨露／泉滴", "雨露／泉滴", "Rain and spring drops"], words: [["滲透","滋潤","細微","隱性"],["渗透","滋润","细微","隐性"],["permeation","nourishment","subtlety","hidden action"]] },
];

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}
function indexFor(locale: Locale) { return locale === "en" ? 2 : locale === "zh-Hans" ? 1 : 0; }

function KnowledgePage() {
  const { locale } = useI18n();
  const i = indexFor(locale);
  const steps = [
    [tr(locale,"概念","概念","Concept"),tr(locale,"先說它是什麼，不先下吉凶。","先说它是什么，不先下吉凶。","Define it before judging it.")],
    [tr(locale,"本象","本象","Image"),tr(locale,"用一個具象畫面理解性質。","用一个具象画面理解性质。","Use one concrete image to understand the quality.")],
    [tr(locale,"條件","条件","Conditions"),tr(locale,"回到月令、根氣、透藏、格局與制化。","回到月令、根气、透藏、格局与制化。","Return to season, roots, visibility, structure and interactions.")],
    [tr(locale,"歲運","岁运","Timing"),tr(locale,"再看大運流年是否真的把它引動。","再看大运流年是否真的把它引动。","Then see whether timing actually activates it.")],
    [tr(locale,"行動","行动","Action"),tr(locale,"最後才翻成今天可執行的提醒。","最后才翻成今天可执行的提醒。","Only then translate it into a practical next step.")],
  ];
  const shensha = [
    tr(locale,"八字主盤優先：神煞排在月令、根氣、透藏、格局、病藥、流通、承載、十神戰局與歲運主判之後。","八字主盘优先：神煞排在月令、根气、透藏、格局、病药、流通、承载、十神战局与岁运主判之后。","The BaZi structure comes first; auxiliary stars remain secondary to the main judgement."),
    tr(locale,"神煞只作取象與細節提示，可以補充線索，但不能單獨定吉凶。","神煞只作取象与细节提示，可以补充线索，但不能单独定吉凶。","Auxiliary stars may add imagery and detail, but cannot independently decide good or bad."),
    tr(locale,"同一神煞要看柱位、組合、合沖刑害與大運流年是否真正引動。","同一神煞要看柱位、组合、合冲刑害与大运流年是否真正引动。","Position, combinations and timing determine whether the signal is actually active."),
    tr(locale,"不能單憑華蓋、桃花、羊刃、亡神等直接判人格本質、宗教／通靈、婚姻、疾病、死亡或人生層級。","不能单凭华盖、桃花、羊刃、亡神等直接判人格本质、宗教／通灵、婚姻、疾病、死亡或人生层级。","Never use one auxiliary star to decide personality, religion, paranormal claims, marriage, illness, death or life rank."),
  ];

  return (
    <main className="mx-auto max-w-4xl space-y-5 pb-16">
      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <p className="text-xs tracking-[0.26em] text-cinnabar">{tr(locale,"昭梧知識圖鑑","昭梧知识图鉴","ZHAOWU FIELD NOTES")}</p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">{tr(locale,"看懂本象，不把比喻當命運","看懂本象，不把比喻当命运","Learn the symbols without turning metaphors into fate")}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-soft">{tr(locale,"把複雜術語先翻成人話，再標清楚它能用到哪裡、不能越過哪條線。","把复杂术语先翻成人话，再标清楚它能用到哪里、不能越过哪条线。","Translate technical ideas into plain language, then mark what they can and cannot be used to infer.")}</p>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{tr(locale,"十天干本象","十天干本象","Ten Heavenly Stems")}</h2>
        <p className="mt-3 rounded-xl border border-line bg-cream px-4 py-3 text-sm leading-6 text-ink-soft">{tr(locale,"此處為五行／天干本象的白話轉譯，用於理解性質，不可脫離月令、旺衰、格局、病藥、透藏與歲運而單獨斷命。","此处为五行／天干本象的白话转译，用于理解性质，不可脱离月令、旺衰、格局、病药、透藏与岁运而单独断命。","These are teaching metaphors, not standalone chart judgements. Season, strength, structure, remedy, visible/hidden stems and timing still come first.")}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {STEMS.map((stem) => <article key={stem.key} className="rounded-xl border border-line bg-cream p-4"><div className="flex items-center gap-4"><div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border font-display text-3xl ${ELEMENT_CLASS[stem.element]}`}>{stem.key}</div><div><h3 className="font-display text-lg text-ink">{stem.key} · {stem.image[i]}</h3><p className="mt-1 text-xs leading-5 text-ink-mute">{stem.words[i].join(" · ")}</p></div></div></article>)}
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{tr(locale,"一張知識卡怎麼讀","一张知识卡怎么读","How to read a knowledge card")}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-5">{steps.map(([title,text],n) => <article key={title} className="rounded-xl border border-line bg-cream p-4"><span className="text-xs text-cinnabar">{String(n+1).padStart(2,"0")}</span><h3 className="mt-2 font-display text-lg text-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p></article>)}</div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{tr(locale,"神煞到底怎麼用","神煞到底怎么用","How auxiliary stars are actually used")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{shensha.map((rule,n) => <article key={rule} className="rounded-xl border border-line bg-cream p-4"><span className="font-display text-xl text-earth">{String(n+1).padStart(2,"0")}</span><p className="mt-2 text-sm leading-6 text-ink-soft">{rule}</p></article>)}</div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
          <h2 className="font-display text-xl text-ink">{tr(locale,"古訓與網路整理要分開","古训与网络整理要分开","Separate classical quotations from modern summaries")}</h2>
          <div className="mt-4 flex gap-2"><span className="rounded-full border border-earth/30 bg-cream px-3 py-1 text-xs text-earth">{tr(locale,"古籍原文","古籍原文","Verified classical text")}</span><span className="rounded-full border border-line bg-cream px-3 py-1 text-xs text-ink-soft">{tr(locale,"今人整理／出處待考","今人整理／出处待考","Modern summary / source unverified")}</span></div>
          <p className="mt-4 text-sm leading-6 text-ink-soft">{tr(locale,"只有已確認原典、篇章或可靠文獻來源的文字，才標古籍原文；網路流傳句不為了效果冒充經典。","只有已确认原典、篇章或可靠文献来源的文字，才标古籍原文；网络流传句不为了效果冒充经典。","Only verified source text is labelled classical. Internet sayings are not upgraded into scripture for effect.")}</p>
        </article>
        <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
          <h2 className="font-display text-xl text-ink">{tr(locale,"趣味測驗另行","趣味测验另行","Fun quizzes stay separate")}</h2>
          <p className="mt-4 text-sm leading-6 text-ink-soft">{tr(locale,"趣味測驗可以觀察當下傾向，但不冒充命盤，也不拿「大神級／超神級」之類等級當人生層級。","趣味测验可以观察当下倾向，但不冒充命盘，也不拿“大神级／超神级”之类等级当人生层级。","Fun quizzes can reflect current tendencies, but they are not charts and do not rank a person's life level.")}</p>
          <Link to="/fun-tests" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink">{tr(locale,"去趣味測驗","去趣味测验","Open fun quizzes")} →</Link>
        </article>
      </section>

      <Link to="/numerology" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-cream px-5 py-4 text-sm text-ink"><span>{tr(locale,"回生命靈數","回生命灵数","Back to numerology")}</span><span className="text-cinnabar">→</span></Link>
    </main>
  );
}
