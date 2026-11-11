import { useI18n, type Locale } from "@/lib/i18n";

const tr = (locale: Locale, hant: string, hans: string, en: string) =>
  locale === "en" ? en : locale === "zh-Hans" ? hans : hant;

/** Editorial synthesis only: does not change the BaZi engine or assert unverified quotations. */
export function FourClassicsMethodSection() {
  const { locale } = useI18n();
  const books = [
    {
      name: tr(locale, "《淵海子平》", "《渊海子平》", "Yuanhai Ziping"),
      purpose: tr(locale, "立基礎：四柱干支、十神、格局與彼此關係，不能只靠一句詩訣斷命。", "立基础：四柱干支、十神、格局与彼此关系，不能只靠一句诗诀断命。", "Establish the fundamentals: four pillars, relationships and chart structure. No single verse determines an entire life."),
      note: tr(locale, "傳世本屢經合編、增補，引用須辨版本。", "传世本屡经合编、增补，引用须辨版本。", "Surviving editions contain later compilation and additions."),
      href: "https://www.donglishuzhai.net/books/111.html",
    },
    {
      name: tr(locale, "《三命通會》", "《三命通会》", "Sanming Tonghui"),
      purpose: tr(locale, "廣參證：比較不同條件、傳統案例與例外，避免單一規則過度推斷。", "广参证：比较不同条件、传统案例与例外，避免单一规则过度推断。", "Compare conditions, historical examples and exceptions rather than extrapolating from one rule."),
      note: tr(locale, "神煞與舊命例屬輔助，不能取代子平主判。", "神煞与旧命例属辅助，不能取代子平主判。", "Auxiliary signs and old cases do not override the primary chart reading."),
      href: "https://zh.wikisource.org/wiki/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83",
    },
    {
      name: tr(locale, "《子平真詮》", "《子平真诠》", "Ziping Zhenquan"),
      purpose: tr(locale, "抓主線：以月令立格，察成敗、順逆、制化、相神與救應。", "抓主线：以月令立格，察成败、顺逆、制化、相神与救应。", "Begin with the birth-month governing factor, then examine structure, support, restraint and recovery."),
      note: tr(locale, "格局用神與扶抑喜用的定義不應混淆。", "格局用神与扶抑喜用的定义不应混淆。", "Its structure-based key factor is not identical to strength-balancing methods."),
      href: "https://libokang.com/zh-hant/classics/bazi/%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%A9%AE%E5%8E%9F%E6%96%87/",
    },
    {
      name: tr(locale, "《滴天髓》", "《滴天髓》", "Di Tian Sui"),
      purpose: tr(locale, "觀氣勢：看清濁、源流、調候與病藥，判斷結構能否流通。", "观气势：看清浊、源流、调候与病药，判断结构能否流通。", "Consider clarity, energy flow, seasonal conditions and whether strain can be resolved."),
      note: tr(locale, "正文與後世評註分開；「有病有藥」不代表缺陷必然成貴。", "正文与后世评注分开；“有病有药”不代表缺陷必然成贵。", "Separate original verses from later commentaries; difficulties do not guarantee success."),
      href: "https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93",
    },
  ];
  const stages = [
    [tr(locale, "01 校正出生資料", "01 校正出生资料", "01 Verify the birth record"), tr(locale, "確認時間、出生地、時區、夏令時與節氣；不確定的時辰不臆補。", "确认时间、出生地、时区、夏令时与节气；不确定的时辰不臆补。", "Check birth time, location, time zone, daylight saving and solar terms; do not invent missing time data.")],
    [tr(locale, "02 審月令與根氣", "02 审月令与根气", "02 Establish the seasonal context"), tr(locale, "綜合透干、藏干、得令、得地、得勢，不用五行數量直接決定喜忌。", "综合透干、藏干、得令、得地、得势，不用五行数量直接决定喜忌。", "Check visible and hidden factors, roots and support. Element counts alone do not decide what helps.")],
    [tr(locale, "03 辨格局成敗", "03 辨格局成败", "03 Test the chart structure"), tr(locale, "區分候選、成格、破格與救應，說清條件，不只給格局名稱。", "区分候选、成格、破格与救应，说清条件，不只给格局名称。", "Distinguish candidate, established and broken structures, with reasons and possible recovery.")],
    [tr(locale, "04 看清濁與流通", "04 看清浊与流通", "04 Examine the dynamics"), tr(locale, "合看旺衰、調候、源流、病藥，辨別作用與承載能力。", "合看旺衰、调候、源流、病药，辨别作用与承载能力。", "Read strength, climate, flow, strain and carrying capacity together.")],
    [tr(locale, "05 核對學派分歧", "05 核对学派分歧", "05 Check competing interpretations"), tr(locale, "格局、扶抑與調候意見不同時，先釐清各自用途；仍矛盾則標未定。", "格局、扶抑与调候意见不同时，先厘清各自用途；仍矛盾则标未定。", "Give each approach its proper role; show unresolved disagreements rather than hiding them.")],
    [tr(locale, "06 參看大運流年", "06 参看大运流年", "06 Read changing conditions"), tr(locale, "原局為基礎，觀察大運、流年與流月可能引動的條件，不用單字預言事件。", "原局为基础，观察大运、流年与流月可能引动的条件，不用单字预言事件。", "Use the natal chart as baseline and examine later cycles without claiming a single symbol predicts an event.")],
    [tr(locale, "07 轉成現實選擇", "07 转成现实选择", "07 Turn insight into a choice"), tr(locale, "先給白話結論，再列依據、風險、反證、需要確認的現實條件與下一步。", "先给白话结论，再列依据、风险、反证、需要确认的现实条件与下一步。", "Lead with the conclusion, then explain reasons, risks, counterevidence, real-world checks and the next step.")],
  ];
  return (
    <section id="zhaowu-four-classics" data-four-classics className="seal-border scroll-mt-24 rounded-2xl bg-paper p-5 sm:p-8">
      <p className="text-xs tracking-[0.22em] text-cinnabar">{tr(locale, "昭梧 · 四書合參", "昭梧 · 四书合参", "ZHAOWU · FOUR CLASSICAL SOURCES")}</p>
      <h2 className="mt-2 font-display text-2xl leading-tight text-ink sm:text-3xl">{tr(locale, "四大經典，如何化為現代判讀", "四大经典，如何化为现代判读", "Four classical sources, one practical framework")}</h2>
      <p className="mt-4 text-[15px] leading-8 text-ink-soft">{tr(locale, "四書並非一套完全相同的算法。昭梧以《淵海子平》定基礎、《三命通會》參條件、《子平真詮》辨格局、《滴天髓》觀氣勢，整理成現代七步判讀。這是今人的整合，不是四書原文。", "四书并非一套完全相同的算法。昭梧以《渊海子平》定基础、《三命通会》参条件、《子平真诠》辨格局、《滴天髓》观气势，整理成现代七步判读。这是今人的整合，不是四书原文。", "The four books do not present one identical algorithm. Zhaowu draws on their complementary approaches to fundamentals, context, structure and dynamics. The seven-step framework below is a modern synthesis, not a quotation.")}</p>
      <h3 className="mt-7 font-display text-xl text-ink">{tr(locale, "四書各有所長", "四书各有所长", "What each source contributes")}</h3>
      <dl className="mt-2 divide-y divide-line">
        {books.map((book) => (
          <div key={book.name} className="py-4">
            <dt className="font-display text-lg text-ink">{book.name}</dt>
            <dd className="mt-2 text-sm leading-7 text-ink-soft">{book.purpose}</dd>
            <dd className="mt-1 text-sm leading-7 text-ink-mute">{book.note}</dd>
            <dd className="mt-1"><a href={book.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-pine underline underline-offset-4">{tr(locale, "查閱數位參考本", "查阅数字参考本", "Read source reference")}</a></dd>
          </div>
        ))}
      </dl>
      <h3 className="mt-7 font-display text-xl text-ink">{tr(locale, "七步判讀：從命盤到選擇", "七步判读：从命盘到选择", "Seven steps from chart to choice")}</h3>
      <ol className="mt-2 divide-y divide-line">
        {stages.map(([heading, detail]) => (
          <li key={heading} className="py-3">
            <h4 className="font-display text-base text-ink">{heading}</h4>
            <p className="mt-1 text-sm leading-7 text-ink-soft">{detail}</p>
          </li>
        ))}
      </ol>
      <p className="mt-5 border-t border-line pt-5 text-sm leading-8 text-ink-soft">{tr(locale, "交付原則：直接答案 → 盤面理由 → 風險與反證 → 現實核對 → 下一步。資料不足就明說，不將吉凶當作不可改變的命運。", "交付原则：直接答案 → 盘面理由 → 风险与反证 → 现实核对 → 下一步。资料不足就明说，不将吉凶当作不可改变的命运。", "Delivery: clear answer → supporting factors → risks and counterevidence → real-world checks → next action. Uncertainty is stated rather than disguised as fate.")}</p>
      <details className="mt-5 border-t border-line pt-3">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-ink">{tr(locale, "來源、版本與實作邊界", "来源、版本与实作边界", "Sources and limits")}</summary>
        <p className="mt-2 text-sm leading-7 text-ink-soft">{tr(locale, "以上是現代整理，並非四書逐句引文；原文、後世評註與今人推論不得混寫。所附數位資料只供參考，尚非逐頁校勘。網站引擎只採用已實作並可校驗的判讀規則；未完成的精細格局、病藥判斷不能假稱已生效。傳統象義亦非科學確立的事件預測。", "以上是现代整理，并非四书逐句引文；原文、后世评注与今人推论不得混写。所附数字资料只供参考，尚非逐页校勘。网站引擎只采用已实作并可校验的判读规则；未完成的精细格局、病药判断不能假称已生效。传统象义亦非科学确立的事件预测。", "These are editorial summaries, not verified verbatim quotations. Original texts, later annotations and modern inferences must be distinguished. The linked versions are references rather than completed critical editions. The site only asserts calculations it actually implements and validates; detailed structure-and-remedy judgements not yet implemented remain withheld. Traditional symbolism is not a scientifically established event forecast.")}</p>
      </details>
    </section>
  );
}
