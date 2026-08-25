import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type CSSProperties } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  calculateTianjiXinggong,
  TIANJI_HOURS,
  TIANJI_MONTHS,
  type TianjiHour,
  type TianjiMonth,
  type TianjiPalace,
} from "@/lib/tianji-xinggong";
import "@/tianji-xinggong.css";

export const Route = createFileRoute("/tianji-xinggong")({ component: TianjiXinggongPage });

const PALACE_ORDER: TianjiPalace[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const UI = {
  "zh-Hant": {
    kicker: "天機星宮 · V2.0",
    title: "十二宮照見你的天機星",
    lead: "以農曆月份與出生時辰推命宮；若出生已過當月中氣，月份順延一位後再查表。全程本機固定規則計算，不調用 AI。",
    back: "返回昭梧",
    inputTitle: "輸入出生條件",
    month: "農曆月份",
    hour: "出生時辰",
    middleQi: "出生時間已過當月中氣",
    middleQiHint: "例如處暑之後，月份按下一個月計算。這裡只勾選「中氣」之後，不是遇到任何節氣都勾。",
    calculate: "排出我的天機星宮",
    method: "規則：以寅=1、卯=2…丑=12；命宮數 = 26 −（月份數〔過中氣加一〕＋時辰數），大於 12 再減 12。",
    resultTitle: "你的星宮結果",
    lunarTime: "1. 農曆月份與時辰",
    palace: "2. 你的命宮",
    star: "3. 對應的八字星座",
    personality: "4. 星宿性格",
    destiny: "命運寄語",
    correction: "已按中氣規則修正月份",
    monthSuffix: "月",
    hourSuffix: "時",
    palaceSuffix: "宮",
  },
  "zh-Hans": {
    kicker: "天机星宫 · V2.0",
    title: "十二宫照见你的天机星",
    lead: "以农历月份与出生时辰推命宫；若出生已过当月中气，月份顺延一位后再查表。全程本机固定规则计算，不调用 AI。",
    back: "返回昭梧",
    inputTitle: "输入出生条件",
    month: "农历月份",
    hour: "出生时辰",
    middleQi: "出生时间已过当月中气",
    middleQiHint: "例如处暑之后，月份按下一个月计算。这里只勾选“中气”之后，不是遇到任何节气都勾。",
    calculate: "排出我的天机星宫",
    method: "规则：以寅=1、卯=2…丑=12；命宫数 = 26 −（月份数〔过中气加一〕＋时辰数），大于 12 再减 12。",
    resultTitle: "你的星宫结果",
    lunarTime: "1. 农历月份与时辰",
    palace: "2. 你的命宫",
    star: "3. 对应的八字星座",
    personality: "4. 星宿性格",
    destiny: "命运寄语",
    correction: "已按中气规则修正月份",
    monthSuffix: "月",
    hourSuffix: "时",
    palaceSuffix: "宫",
  },
  en: {
    kicker: "TIANJI STAR PALACE · V2.0",
    title: "Find the star that rules your Life Palace",
    lead: "This deterministic lookup uses the traditional lunar month and birth-hour branch. If birth occurs after that month's middle qi, the month advances by one before calculation. No AI is used.",
    back: "Back to Zhaowu",
    inputTitle: "Birth conditions",
    month: "Lunar month",
    hour: "Birth hour branch",
    middleQi: "Birth occurred after the month's middle qi",
    middleQiHint: "For example, after Chushu, advance the month by one. This applies to the middle qi specifically, not every solar-term boundary.",
    calculate: "Calculate my Star Palace",
    method: "Rule: Yin=1, Mao=2 … Chou=12. Palace number = 26 − (month number [plus one after middle qi] + hour number); subtract 12 when the result exceeds 12.",
    resultTitle: "Your Star Palace",
    lunarTime: "1. Lunar month and birth hour",
    palace: "2. Life Palace",
    star: "3. BaZi star archetype",
    personality: "4. Star character",
    destiny: "Destiny note",
    correction: "Month corrected by the middle-qi rule",
    monthSuffix: " month",
    hourSuffix: " hour",
    palaceSuffix: " Palace",
  },
} as const;

const STAR_COPY: Record<TianjiPalace, Record<Locale, { star: string; brief: string; description: string; message: string }>> = {
  子: {
    "zh-Hant": { star: "天貴星", brief: "文雅多情", description: "氣質溫雅，重情也重分寸，對人際關係有細膩的感受力。通常願意顧及舊情與承諾，但在重大選擇上也容易因理想標準較高而堅持己見。", message: "你的柔軟不是退讓。把情分留給值得的人，把原則留給真正重要的事。" },
    "zh-Hans": { star: "天贵星", brief: "文雅多情", description: "气质温雅，重情也重分寸，对人际关系有细腻的感受力。通常愿意顾及旧情与承诺，但在重大选择上也容易因理想标准较高而坚持己见。", message: "你的柔软不是退让。把情分留给值得的人，把原则留给真正重要的事。" },
    en: { star: "Celestial Noble Star", brief: "Graceful and affectionate", description: "Refined, relationship-aware and attentive to emotional nuance. Loyalty matters, though strong personal standards can make you hold your ground firmly when a choice feels important.", message: "Keep your gentleness for people who value it, and your principles for choices that truly matter." },
  },
  丑: {
    "zh-Hant": { star: "天厄星", brief: "先苦後甘", description: "早期往往較容易感到責任重、進展慢，很多成果需要靠耐性一點點累積。真正的優勢在於抗壓與韌性，越能建立穩定節奏，後程越容易把困難變成資歷。", message: "慢不是落後。你真正的運勢，常在別人放棄之後才開始顯形。" },
    "zh-Hans": { star: "天厄星", brief: "先苦后甘", description: "早期往往较容易感到责任重、进展慢，很多成果需要靠耐性一点点累积。真正的优势在于抗压与韧性，越能建立稳定节奏，后程越容易把困难变成资历。", message: "慢不是落后。你真正的运势，常在别人放弃之后才开始显形。" },
    en: { star: "Celestial Trial Star", brief: "Hard first, easier later", description: "Progress may feel earned rather than granted, especially early on. Your strength is endurance: with stable routines, obstacles can become experience and later-life leverage.", message: "Slow progress is still progress. Your advantage often appears after others stop." },
  },
  寅: {
    "zh-Hant": { star: "天權星", brief: "大器晚成", description: "重判斷、重掌控，也願意為結果負責。能力往往不是一開始就全部顯露，而是隨經驗逐步形成決策力與領導感；越到後期，越容易在專業或位置上形成話語權。", message: "不必急著證明自己。真正屬於你的權柄，來自長期累積後無需解釋的能力。" },
    "zh-Hans": { star: "天权星", brief: "大器晚成", description: "重判断、重掌控，也愿意为结果负责。能力往往不是一开始就全部显露，而是随经验逐步形成决策力与领导感；越到后期，越容易在专业或位置上形成话语权。", message: "不必急着证明自己。真正属于你的权柄，来自长期累积后无需解释的能力。" },
    en: { star: "Celestial Authority Star", brief: "Late-blooming authority", description: "You value judgement, control and accountability. Leadership tends to mature through experience rather than arrive instantly, giving you stronger authority as expertise compounds.", message: "You do not need to prove yourself early. Durable authority is built until it no longer needs explanation." },
  },
  卯: {
    "zh-Hant": { star: "天赦星", brief: "慷慨大方", description: "待人爽快，重義氣，願意給別人空間與機會。優點是胸襟開、行動乾脆；需要留意的是慷慨不要變成無邊界，否則容易在人情與資源分配上消耗過多。", message: "善意要有方向。你的慷慨一旦有了邊界，就不再是消耗，而是力量。" },
    "zh-Hans": { star: "天赦星", brief: "慷慨大方", description: "待人爽快，重义气，愿意给别人空间与机会。优点是胸襟开、行动干脆；需要留意的是慷慨不要变成无边界，否则容易在人情与资源分配上消耗过多。", message: "善意要有方向。你的慷慨一旦有了边界，就不再是消耗，而是力量。" },
    en: { star: "Celestial Mercy Star", brief: "Generous and open", description: "Direct, loyal and willing to give others room. Generosity is a strength, but it works best with boundaries so that goodwill does not become chronic over-giving.", message: "Give with direction. Boundaries turn generosity from depletion into strength." },
  },
  辰: {
    "zh-Hant": { star: "天如星", brief: "事多反覆", description: "思路靈活，遇事會反覆推演，不容易只看表面。這使你擅長處理複雜局面，但也可能因選項太多而來回修正；把判斷標準先定清楚，反而能發揮你的機變。", message: "反覆不是缺點，沒有標準的反覆才是。先定尺度，再讓你的變通成為優勢。" },
    "zh-Hans": { star: "天如星", brief: "事多反复", description: "思路灵活，遇事会反复推演，不容易只看表面。这使你擅长处理复杂局面，但也可能因选项太多而来回修正；把判断标准先定清楚，反而能发挥你的机变。", message: "反复不是缺点，没有标准的反复才是。先定尺度，再让你的变通成为优势。" },
    en: { star: "Celestial Adaptation Star", brief: "Changeable, strategically flexible", description: "You tend to model several possibilities before committing. That helps with complexity, though too many options can create repeated revisions; clear criteria make your adaptability far more powerful.", message: "Reconsidering is useful when it serves a standard. Set the standard first, then let flexibility work for you." },
  },
  巳: {
    "zh-Hant": { star: "天文星", brief: "思慮縝密", description: "觀察細、理解快，對文字、結構、知識與審美通常有較強感受。做事傾向先想清楚再落子，因此品質往往高於速度；若能避免過度推敲，才華更容易被看見。", message: "你的細緻本來就是天賦。別讓完美主義替它上鎖，完成比無限修正更接近命運的出口。" },
    "zh-Hans": { star: "天文星", brief: "思虑缜密", description: "观察细、理解快，对文字、结构、知识与审美通常有较强感受。做事倾向先想清楚再落子，因此质量往往高于速度；若能避免过度推敲，才华更容易被看见。", message: "你的细致本来就是天赋。别让完美主义替它上锁，完成比无限修正更接近命运的出口。" },
    en: { star: "Celestial Scholar Star", brief: "Precise and thoughtful", description: "Observant, fast to understand structure, and often sensitive to language, knowledge or aesthetics. Quality tends to outrank speed; avoiding endless refinement helps your talent become visible.", message: "Precision is already a gift. Do not let perfectionism lock it away; finished work opens more doors than endless revision." },
  },
  午: {
    "zh-Hant": { star: "天福星", brief: "意志非凡", description: "內在有明確的自我驅動，通常不喜歡長期被動等待。你更適合把目標變成可執行的節奏，靠持續推進形成局面；真正的福氣往往來自能力與選擇彼此配合。", message: "運氣不是坐等而來。當你的意志有了方向，福氣才有地方落腳。" },
    "zh-Hans": { star: "天福星", brief: "意志非凡", description: "内在有明确的自我驱动，通常不喜欢长期被动等待。你更适合把目标变成可执行的节奏，靠持续推进形成局面；真正的福气往往来自能力与选择彼此配合。", message: "运气不是坐等而来。当你的意志有了方向，福气才有地方落脚。" },
    en: { star: "Celestial Fortune Star", brief: "Strong-willed", description: "Self-directed and uncomfortable with prolonged passivity. You do best when goals become executable rhythms; good fortune tends to appear where competence and choice reinforce each other.", message: "Luck needs somewhere to land. Give your will a direction and build that landing place." },
  },
  未: {
    "zh-Hant": { star: "天驛星", brief: "奔波勞碌", description: "人生節奏往往帶有移動、變化、跨環境發展的特質。你不一定適合把穩定理解成原地不動，反而可能在轉換城市、圈層、工作方式或角色後打開局面。", message: "有些人的安定來自不動，你的安定可能來自知道何時該走。移動本身，也能成為歸途。" },
    "zh-Hans": { star: "天驿星", brief: "奔波劳碌", description: "人生节奏往往带有移动、变化、跨环境发展的特质。你不一定适合把稳定理解成原地不动，反而可能在转换城市、圈层、工作方式或角色后打开局面。", message: "有些人的安定来自不动，你的安定可能来自知道何时该走。移动本身，也能成为归途。" },
    en: { star: "Celestial Traveller Star", brief: "Movement and effort", description: "Life may develop through movement, changing environments or shifting roles. Stability does not always mean staying still; new settings can unlock opportunities that fixed routines cannot.", message: "Some people find stability by staying. Yours may come from knowing when to move." },
  },
  申: {
    "zh-Hant": { star: "天孤星", brief: "雙重個性", description: "外在可以理性獨立，內在卻未必真的疏離，常有一部分自己不輕易示人。你需要的不是大量關係，而是能理解你不同層次的人；獨處若有目的，會轉化成高度專注。", message: "不必把所有人都帶進內心。真正理解你的人不需要很多，但你也不必把自己永遠關在門後。" },
    "zh-Hans": { star: "天孤星", brief: "双重个性", description: "外在可以理性独立，内在却未必真的疏离，常有一部分自己不轻易示人。你需要的不是大量关系，而是能理解你不同层次的人；独处若有目的，会转化成高度专注。", message: "不必把所有人都带进内心。真正理解你的人不需要很多，但你也不必把自己永远关在门后。" },
    en: { star: "Celestial Solitary Star", brief: "Dual-layered personality", description: "You can appear highly independent while keeping a more private inner layer hidden. A few deep relationships matter more than many shallow ones, and purposeful solitude can become intense focus.", message: "Not everyone needs access to your inner world, but the door does not have to stay locked forever." },
  },
  酉: {
    "zh-Hant": { star: "天秘星", brief: "剛直善良", description: "是非感較強，說話做事講原則，不太喜歡模糊地帶。這種直接能建立可信度，但若把每件事都處理成對錯題，也容易形成摩擦；保留原則，同時留一點轉圜，力量會更穩。", message: "正直不是把世界切成黑白。守住底線，也給自己留下理解複雜人性的餘地。" },
    "zh-Hans": { star: "天秘星", brief: "刚直善良", description: "是非感较强，说话做事讲原则，不太喜欢模糊地带。这种直接能建立可信度，但若把每件事都处理成对错题，也容易形成摩擦；保留原则，同时留一点转圜，力量会更稳。", message: "正直不是把世界切成黑白。守住底线，也给自己留下理解复杂人性的余地。" },
    en: { star: "Celestial Integrity Star", brief: "Direct and kind-hearted", description: "Principled, clear about right and wrong, and uncomfortable with needless ambiguity. Directness builds trust, but leaving room for complexity can prevent avoidable friction.", message: "Integrity does not require turning the world into black and white. Keep the boundary and leave room for nuance." },
  },
  戌: {
    "zh-Hant": { star: "天藝星", brief: "伶俐果斷", description: "反應快，學習與轉化能力強，往往能把想法迅速變成具體做法。適合需要創意、技術、審美或臨場決斷的領域；真正要避免的是興趣過散，讓天分被過多方向稀釋。", message: "天分不是越多越好，能集中才會成名。選一兩件值得長做的事，讓聰明沉澱成作品。" },
    "zh-Hans": { star: "天艺星", brief: "伶俐果断", description: "反应快，学习与转化能力强，往往能把想法迅速变成具体做法。适合需要创意、技术、审美或临场决断的领域；真正要避免的是兴趣过散，让天分被过多方向稀释。", message: "天分不是越多越好，能集中才会成名。选一两件值得长做的事，让聪明沉淀成作品。" },
    en: { star: "Celestial Arts Star", brief: "Quick and decisive", description: "Fast to learn and translate ideas into action. Creative, technical or judgement-heavy work can suit you well; the main risk is scattering talent across too many directions.", message: "Talent becomes reputation through concentration. Choose what deserves years, not merely what catches your eye today." },
  },
  亥: {
    "zh-Hant": { star: "天壽星", brief: "情感豐富", description: "感受力深，容易理解他人的情緒與處境，也重公平與人情。若長期承接過多他人的問題，自己反而容易疲憊；把同理心和清楚邊界放在一起，才是最長久的善意。", message: "你的感受力能照亮別人，但不必燃盡自己。留一部分光給自己，路才走得長。" },
    "zh-Hans": { star: "天寿星", brief: "情感丰富", description: "感受力深，容易理解他人的情绪与处境，也重公平与人情。若长期承接过多他人的问题，自己反而容易疲惫；把同理心和清楚边界放在一起，才是最长久的善意。", message: "你的感受力能照亮别人，但不必燃尽自己。留一部分光给自己，路才走得长。" },
    en: { star: "Celestial Longevity Star", brief: "Emotionally rich", description: "Deeply perceptive of other people's feelings and circumstances, with a strong sense of fairness. Empathy lasts longer when paired with boundaries rather than endless emotional carrying.", message: "Your sensitivity can light the way for others without consuming you. Keep some of that light for yourself." },
  },
};

function monthLabel(month: TianjiMonth, locale: Locale) {
  if (locale === "en") {
    const index = TIANJI_MONTHS.indexOf(month) + 1;
    return `Lunar month ${index}`;
  }
  if (locale === "zh-Hant") return month === "腊" ? "臘月" : `${month}月`;
  return `${month}月`;
}

function hourLabel(hour: TianjiHour, locale: Locale) {
  return locale === "en" ? `${hour} branch` : `${hour}${locale === "zh-Hant" ? "時" : "时"}`;
}

function TianjiXinggongPage() {
  const { locale } = useI18n();
  const copy = UI[locale];
  const [month, setMonth] = useState<TianjiMonth>("正");
  const [hour, setHour] = useState<TianjiHour>("子");
  const [afterMiddleQi, setAfterMiddleQi] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => calculateTianjiXinggong(month, hour, afterMiddleQi), [month, hour, afterMiddleQi]);
  const starCopy = STAR_COPY[result.palace][locale];

  return (
    <main className="tianji-page" aria-labelledby="tianji-title">
      <div className="tianji-shell">
        <div className="flex items-center justify-between gap-3">
          <p className="tianji-kicker">{copy.kicker}</p>
          <Link to="/" className="rounded-full border border-white/15 px-3 py-2 text-xs text-white/70 transition hover:border-white/30 hover:text-white">
            {copy.back}
          </Link>
        </div>

        <h1 id="tianji-title" className="tianji-title">{copy.title}</h1>
        <p className="tianji-lead">{copy.lead}</p>

        <div className="tianji-grid">
          <section className="tianji-panel" aria-labelledby="tianji-input-title">
            <h2 id="tianji-input-title">{copy.inputTitle}</h2>

            <div className="tianji-field">
              <label htmlFor="tianji-month">{copy.month}</label>
              <select id="tianji-month" className="tianji-select" value={month} onChange={(event) => { setMonth(event.target.value as TianjiMonth); setSubmitted(false); }}>
                {TIANJI_MONTHS.map((value) => <option key={value} value={value}>{monthLabel(value, locale)}</option>)}
              </select>
            </div>

            <div className="tianji-field">
              <label htmlFor="tianji-hour">{copy.hour}</label>
              <select id="tianji-hour" className="tianji-select" value={hour} onChange={(event) => { setHour(event.target.value as TianjiHour); setSubmitted(false); }}>
                {TIANJI_HOURS.map((value) => <option key={value} value={value}>{hourLabel(value, locale)}</option>)}
              </select>
            </div>

            <label className="tianji-toggle">
              <input type="checkbox" checked={afterMiddleQi} onChange={(event) => { setAfterMiddleQi(event.target.checked); setSubmitted(false); }} />
              <span>
                <strong>{copy.middleQi}</strong>
                <span>{copy.middleQiHint}</span>
              </span>
            </label>

            <button type="button" className="tianji-button" onClick={() => setSubmitted(true)}>{copy.calculate}</button>
            <p className="tianji-method">{copy.method}</p>
          </section>

          <section className="tianji-panel" aria-live="polite" aria-labelledby="tianji-result-title">
            <h2 id="tianji-result-title">{copy.resultTitle}</h2>

            <div className="tianji-orbit" aria-hidden="true">
              <div className="tianji-orbit-ring" />
              <div className="tianji-core">
                <div>
                  <b>{submitted ? starCopy.star : "天機"}</b>
                  <span>{submitted ? starCopy.brief : "十二星宮"}</span>
                </div>
              </div>
              {PALACE_ORDER.map((palace, index) => {
                const angle = (index / PALACE_ORDER.length) * 360 - 90;
                const style = { transform: `rotate(${angle}deg) translate(136px) rotate(${-angle}deg)` } as CSSProperties;
                return <span key={palace} className="tianji-node" style={style} data-active={submitted && result.palace === palace}>{palace}</span>;
              })}
            </div>

            {submitted ? (
              <div className="tianji-result" key={`${month}-${hour}-${afterMiddleQi}`}>
                <div className="tianji-result-list">
                  <div className="tianji-result-row">
                    <div className="tianji-result-label">{copy.lunarTime}</div>
                    <div className="tianji-result-value">{monthLabel(result.originalMonth, locale)} · {hourLabel(result.hour, locale)}</div>
                    {result.afterMiddleQi ? <div className="tianji-correction">{copy.correction}：{monthLabel(result.originalMonth, locale)} → {monthLabel(result.correctedMonth, locale)}</div> : null}
                  </div>
                  <div className="tianji-result-row">
                    <div className="tianji-result-label">{copy.palace}</div>
                    <div className="tianji-result-value">{locale === "en" ? `${result.palace}${copy.palaceSuffix}` : `${result.palace}${copy.palaceSuffix}`}</div>
                  </div>
                  <div className="tianji-result-row">
                    <div className="tianji-result-label">{copy.star}</div>
                    <div className="tianji-star">{starCopy.star}</div>
                    <div className="tianji-result-value">{starCopy.brief}</div>
                  </div>
                  <div className="tianji-result-row">
                    <div className="tianji-result-label">{copy.personality}</div>
                    <div className="tianji-result-value">{starCopy.description}</div>
                  </div>
                </div>
                <div className="tianji-destiny">
                  <small>{copy.destiny}</small>
                  <p>{starCopy.message}</p>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-7 text-white/55">{copy.lead}</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
