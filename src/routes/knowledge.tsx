import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
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
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname.startsWith("/knowledge/")) return <Outlet />;

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
  const applications = [
    [tr(locale,"看自己","看自己","Understand yourself"), tr(locale,"看出你天生擅長什麼、最常在哪裡卡住或吃虧；也看見別人眼中的你，以及失控時容易出現的反應。","看出你天生擅长什么、最常在哪里卡住或吃亏；也看见别人眼中的你，以及失控时容易出现的反应。","See your natural strengths, recurring friction points, how others may read you, and the reactions that appear under pressure.")],
    [tr(locale,"看時機","看时机","Read timing"), tr(locale,"看懂當下的節奏、窗口與盲點；判斷今年、這個月更適合推進、守成，還是先調整。走運時用力，不順時修正，不是原地空等。","看懂当下的节奏、窗口与盲点；判断今年、这个月更适合推进、守成，还是先调整。走运时用力，不顺时修正，不是原地空等。","Read the current rhythm, opportunity window and blind spots, then decide whether to advance, protect, or adjust instead of simply waiting.")],
    [tr(locale,"看關係","看关系","Understand relationships"), tr(locale,"看你與另一半、家人或重要關係為什麼容易卡住；把命盤線索翻成可以改口、調整界線與減少內耗的做法。","看你与另一半、家人或重要关系为什么容易卡住；把命盘线索翻成可以改口、调整界线与减少内耗的做法。","Understand recurring friction with partners, family and important relationships, then translate the pattern into better wording, boundaries and less internal drain.")],
    [tr(locale,"看選擇","看选择","Make choices"), tr(locale,"看出較適合你的賽道、賺錢方式與高風險盲區。重要決定前，不只問吉凶，而是知道該衝、該守，還是先補條件。","看出较适合你的赛道、赚钱方式与高风险盲区。重要决定前，不只问吉凶，而是知道该冲、该守，还是先补条件。","Clarify better-fit paths, earning patterns and high-risk blind spots. Before a major choice, decide whether to push, hold, or strengthen the conditions first.")],
    [tr(locale,"看行動","看行动","Turn insight into action"), tr(locale,"把命盤轉化為決策與行動，逐步整理出你自己的分析框架，而不是只拿到一句答案。","把命盘转化为决策与行动，逐步整理出你自己的分析框架，而不是只拿到一句答案。","Turn the chart into decisions and actions, and gradually build your own way of reading the situation instead of receiving one isolated answer.")],
  ];
  const methodologies = [
    tr(locale,"十天干：陰陽 × 五行的天賦慣性與功能取象","十天干：阴阳 × 五行的天赋惯性与功能取象","Ten Heavenly Stems: yin-yang and five-element tendencies and functions"),
    tr(locale,"日主與四柱定位：先分清哪個字代表你，以及年、月、日、時各自承載的層次","日主与四柱定位：先分清哪个字代表你，以及年、月、日、时各自承载的层次","Day Master and Four Pillars: identify the self and what each pillar represents"),
    tr(locale,"五行生剋與過旺／不足：看力量如何流動，不把單一元素直接貼成好壞","五行生克与过旺／不足：看力量如何流动，不把单一元素直接贴成好坏","Five-element dynamics: read excess, weakness and flow without labelling one element as simply good or bad"),
    tr(locale,"身強身弱：綜合得令、得地、得勢，不用單一指標下結論","身强身弱：综合得令、得地、得势，不用单一指标下结论","Strength assessment: combine season, roots and support instead of relying on one indicator"),
    tr(locale,"大運流年：判斷結構何時被引動，以及不同階段的順逆與窗口","大运流年：判断结构何时被引动，以及不同阶段的顺逆与窗口","Luck cycles and annual timing: identify when chart structures are activated and when conditions shift"),
    tr(locale,"喜用神 × 顏色／行為：作為傳統轉譯與生活提示，不單獨拿來定吉凶","喜用神 × 颜色／行为：作为传统转译与生活提示，不单独拿来定吉凶","Useful elements, colour and behaviour correspondences: practical traditional translations, not standalone fate judgements"),
    tr(locale,"十神：理解十種互動角色，以及它們在不同結構裡如何改變功能","十神：理解十种互动角色，以及它们在不同结构里如何改变功能","Ten Gods: understand ten relational functions and how their roles change by structure"),
    tr(locale,"夫妻宮（日支）與合沖刑害：看關係模式與互動條件，不用一個符號直接判婚姻成敗","夫妻宫（日支）与合冲刑害：看关系模式与互动条件，不用一个符号直接判婚姻成败","Spouse palace and combinations/clashes: read relationship conditions without using one symbol to predict success or failure"),
    tr(locale,"六親定位：依命例、角色與關係情境辨別，不機械套用男女模板","六亲定位：依命例、角色与关系情境辨别，不机械套用男女模板","Family-role mapping: interpret roles from the actual chart and relationship context rather than mechanically applying gender templates"),
  ];

  return (
    <main className="mx-auto max-w-4xl space-y-5 pb-16">
      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <p className="text-xs tracking-[0.26em] text-cinnabar">{tr(locale,"昭梧 · 觀世錄","昭梧 · 观世录","ZHAOWU · NOTES ON LIFE")}</p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">{tr(locale,"觀世錄","观世录","Notes on Life")}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-soft">{tr(locale,"研究札記與站主文章都放在這裡。術數可以作分析工具，但不替人決定人生。","研究札记与站主文章都放在这里。术数可以作分析工具，但不替人决定人生。","Research notes and owner essays live here. Divination may support analysis, but it does not make the final decision.")}</p>
      </section>

      <section id="bazi-decision-tool" className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <p className="text-xs tracking-[0.22em] text-cinnabar">{tr(locale,"昭梧的八字立場","昭梧的八字立场","HOW ZHAOWU USES BAZI")}</p>
        <h2 className="mt-2 font-display text-3xl leading-tight text-ink">{tr(locale,"八字不是宿命，而是一套決策工具。","八字不是宿命，而是一套决策工具。","BaZi is not a sentence of fate. It is a framework for better decisions.")}</h2>
        <div className="mt-4 max-w-3xl space-y-3 text-[15px] leading-8 text-ink-soft">
          <p>{tr(locale,"昭梧不把命盤當成吉凶判決，而是陪你看懂自己的天賦慣性、卡點、時機與關係模式。看懂自己，是改變的起點。","昭梧不把命盘当成吉凶判决，而是陪你看懂自己的天赋惯性、卡点、时机与关系模式。看懂自己，是改变的起点。","Zhaowu does not treat a chart as a verdict of good or bad fortune. It uses it to help you understand strengths, recurring patterns, timing and relationships. Understanding yourself is where change begins.")}</p>
          <p>{tr(locale,"學會看命，不是為了認命，而是把命盤轉化為決策與行動。看懂這張命盤，從來不是為了算命，是為了你知道下一次，可以怎麼選。","学会看命，不是为了认命，而是把命盘转化为决策与行动。看懂这张命盘，从来不是为了算命，是为了你知道下一次，可以怎么选。","Learning to read a chart is not about surrendering to it. The point is to turn the chart into decisions and action, so that next time you face a choice, you can see your options more clearly.")}</p>
        </div>
        <blockquote className="mt-5 rounded-2xl border border-cinnabar/20 bg-cream px-5 py-4 font-display text-lg leading-8 text-ink">
          {tr(locale,"「八字幫我走出低谷，拿回人生主導權。這張盤從來不是來替我定命，而是在告訴我：我天生擅長什麼、又老是在哪裡卡住，下一次可以怎麼選。」","“八字帮我走出低谷，拿回人生主导权。这张盘从来不是来替我定命，而是在告诉我：我天生擅长什么、又老是在哪里卡住，下一次可以怎么选。”","“BaZi helped me climb out of a low point and regain agency in my life. The chart was never there to define my fate. It showed me what came naturally, where I kept getting stuck, and what I could choose differently next time.”")}
          <footer className="mt-2 text-xs tracking-[0.18em] text-cinnabar">STONE</footer>
        </blockquote>
      </section>

      <a href="/knowledge/shushu-boundary" className="seal-border group block overflow-hidden rounded-2xl bg-paper">
        <img src="/article-shushu-boundary.svg" alt={tr(locale,"《術數的邊界》文章主圖","《术数的边界》文章主图","Hero image for The Boundary of Divination")} className="aspect-video w-full object-cover" />
        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full border border-cinnabar/25 bg-cream px-3 py-1 text-xs text-cinnabar">{tr(locale,"最新文章","最新文章","Latest article")}</span>
            <span className="text-xs text-ink-mute">2026-09-13</span>
          </div>
          <h2 className="mt-3 font-display text-2xl leading-tight text-ink">{tr(locale,"術數的邊界：事實求真，模型求證，認知去執，決策自主","术数的边界：事实求真，模型求证，认知去执，决策自主","The boundary of divination: verify facts, test models, release fixation, keep agency")}</h2>
          <p className="mt-3 text-sm leading-7 text-ink-soft">{tr(locale,"從《荀子》「善為易者不占」出發，分清事實、模型、證據與選擇；術數可以作分析工具，但不替人決定人生。","从《荀子》“善为易者不占”出发，分清事实、模型、证据与选择；术数可以作分析工具，但不替人决定人生。","Starting from Xunzi, separate facts, models, evidence and choice. Divination may support analysis, but it does not make the final decision for a person.")}</p>
          <span className="mt-4 inline-flex text-sm text-cinnabar">{tr(locale,"閱讀全文","阅读全文","Read article")} →</span>
        </div>
      </a>

      <LifeViewHomeSection />

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <p className="text-xs tracking-[0.22em] text-cinnabar">{tr(locale,"實際用途","实际用途","PRACTICAL APPLICATIONS")}</p>
        <h2 className="mt-2 font-display text-2xl text-ink">{tr(locale,"八字學用來幹嘛？","八字学用来干嘛？","What can BaZi actually be used for?")}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {applications.map(([title, text], n) => (
            <article key={title} className={`rounded-xl border border-line bg-cream p-4 ${n === applications.length - 1 ? "sm:col-span-2" : ""}`}>
              <span className="text-xs font-semibold tracking-[0.12em] text-cinnabar">{String(n + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-xl text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <p className="text-xs tracking-[0.22em] text-cinnabar">{tr(locale,"核心方法","核心方法","CORE METHODOLOGIES")}</p>
        <h2 className="mt-2 font-display text-2xl text-ink">{tr(locale,"八字實際會碰到的內容","八字实际会碰到的内容","What the method actually examines")}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {methodologies.map((item, n) => (
            <article key={item} className="flex gap-3 rounded-xl border border-line bg-cream p-4">
              <span className="shrink-0 font-display text-xl text-earth">{String(n + 1).padStart(2, "0")}</span>
              <p className="text-sm leading-7 text-ink-soft">{item}</p>
            </article>
          ))}
        </div>
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

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <p className="text-xs tracking-[0.22em] text-cinnabar">{tr(locale,"一句話說清楚","一句话说清楚","IN ONE PARAGRAPH")}</p>
        <p className="mt-3 font-display text-xl leading-9 text-ink">{tr(locale,"八字學不是用來替你下宿命判決。它是一套看懂自己的決策工具，用來整理天賦慣性、能量狀態、卡點、時機與關係模式。學會看命，不是為了認命，而是為了在重要決定前，更知道該衝、該守，還是先調整。看懂這張命盤，從來不是為了算命，是為了你知道下一次，可以怎麼選。","八字学不是用来替你下宿命判决。它是一套看懂自己的决策工具，用来整理天赋惯性、能量状态、卡点、时机与关系模式。学会看命，不是为了认命，而是为了在重要决定前，更知道该冲、该守，还是先调整。看懂这张命盘，从来不是为了算命，是为了你知道下一次，可以怎么选。","BaZi is not used here to hand down a verdict about your fate. It is a decision framework for organising natural tendencies, current conditions, recurring friction, timing and relationship patterns. The point is not to surrender to a chart, but to make clearer choices about when to move, hold, or adjust. Reading the chart is ultimately about knowing what you can choose differently next time.")}</p>
      </section>

      <Link to="/numerology" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-cream px-5 py-4 text-sm text-ink"><span>{tr(locale,"回生命靈數","回生命灵数","Back to numerology")}</span><span className="text-cinnabar">→</span></Link>
    </main>
  );
}