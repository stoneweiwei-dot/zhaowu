/**
 * Optional literary afterword for a FUTURE, server-verified highest-tier report.
 *
 * This module is NOT an entitlement check, is NOT connected to the live report,
 * and never derives chart facts, fortune, or a literary theme from a stem/element.
 * The approved theme and final interpretation must come from the existing
 * canonical report and editorial review. Poems are literary parallels, not proof.
 */
export type PoeticLocale = "zh-Hant" | "zh-Hans" | "en";
export type PoeticTheme = "patience" | "resilience" | "turning-point" | "perspective" | "forward-motion";
type Trilingual = Record<PoeticLocale, string>;

export type VerifiedVerse = {
  id: string;
  theme: PoeticTheme;
  author: Trilingual;
  dynasty: Trilingual;
  work: Trilingual;
  line: Trilingual;
  originalChinese: string;
  explanation: Trilingual;
  sourceUrl: string;
  sourceLocator: string;
  /**
   * Manually collated against the linked literary text.
   * The record ID in chinese-poetry-api v0.6.0 has NOT yet been independently
   * checked; do not claim that API record or assign a fabricated ID.
   */
  apiRecordId: null;
  textualStatus: "literary_source_checked";
};

const VERSES: readonly VerifiedVerse[] = [
  {
    id: "wangwei-zhongnan-patience",
    theme: "patience",
    dynasty: { "zh-Hant": "唐", "zh-Hans": "唐", en: "Tang" },
    author: { "zh-Hant": "王維", "zh-Hans": "王维", en: "Wang Wei" },
    work: { "zh-Hant": "終南別業", "zh-Hans": "终南别业", en: "My Retreat at Mount Zhongnan" },
    line: { "zh-Hant": "行到水窮處，坐看雲起時。", "zh-Hans": "行到水穷处，坐看云起时。", en: "Where the stream ends, I sit and watch the clouds rise." },
    originalChinese: "行到水窮處，坐看雲起時。",
    explanation: {
      "zh-Hant": "這首詩寫行至水盡而坐觀雲起。可借以理解暫停、觀察與轉換視角，不等於事情必然迎來好運。",
      "zh-Hans": "这首诗写行至水尽而坐观云起。可借以理解暂停、观察与转换视角，不等于事情必然迎来好运。",
      en: "The poet pauses at the end of a stream and watches clouds rise: a metaphor for changing perspective, not a promise that fortune will improve.",
    },
    sourceUrl: "https://zh.wikisource.org/zh-hant/%E7%B5%82%E5%8D%97%E5%88%A5%E6%A5%AD",
    sourceLocator: "《全唐詩》卷126",
    apiRecordId: null, textualStatus: "literary_source_checked",
  },
  {
    id: "zhengxie-zhushi-resilience",
    theme: "resilience",
    dynasty: { "zh-Hant": "清", "zh-Hans": "清", en: "Qing" },
    author: { "zh-Hant": "鄭燮", "zh-Hans": "郑燮", en: "Zheng Xie" },
    work: { "zh-Hant": "竹石", "zh-Hans": "竹石", en: "Bamboo and Rock" },
    line: { "zh-Hant": "千磨萬擊還堅勁，任爾東西南北風。", "zh-Hans": "千磨万击还坚劲，任尔东西南北风。", en: "After countless blows, the bamboo stands firm in every wind." },
    originalChinese: "千磨萬擊還堅勁，任爾東西南北風。",
    explanation: {
      "zh-Hant": "竹扎根岩石而不因風動搖，是韌性與守住原則的象徵；並非要求人在不安全處境中硬撐。",
      "zh-Hans": "竹扎根岩石而不因风动摇，是韧性与守住原则的象征；并非要求人在不安全处境中硬撑。",
      en: "Rooted bamboo evokes resilience and principle. It does not mean someone should endure an unsafe situation.",
    },
    sourceUrl: "https://zh.wikisource.org/zh-hant/%E7%AB%B9%E7%9F%B3",
    sourceLocator: "《竹石》",
    apiRecordId: null, textualStatus: "literary_source_checked",
  },
  {
    id: "luyou-shanxi-turning-point",
    theme: "turning-point",
    dynasty: { "zh-Hant": "南宋", "zh-Hans": "南宋", en: "Southern Song" },
    author: { "zh-Hant": "陸游", "zh-Hans": "陆游", en: "Lu You" },
    work: { "zh-Hant": "遊山西村", "zh-Hans": "游山西村", en: "Visiting Shanxi Village" },
    line: { "zh-Hant": "山重水複疑無路，柳暗花明又一村。", "zh-Hans": "山重水复疑无路，柳暗花明又一村。", en: "Past winding hills and streams, another village appears." },
    originalChinese: "山重水複疑無路，柳暗花明又一村。",
    explanation: {
      "zh-Hant": "行至曲折處而見另一村，是重新觀察選項的文學意象；不能據此預告轉機必然出現。",
      "zh-Hans": "行至曲折处而见另一村，是重新观察选项的文学意象；不能据此预告转机必然出现。",
      en: "A new village appears after a winding path: an image of reconsidering options, not a prediction of certain success.",
    },
    sourceUrl: "https://zh.wikisource.org/zh-hant/%E6%B8%B8%E5%B1%B1%E8%A5%BF%E6%9D%91",
    sourceLocator: "《遊山西村》",
    apiRecordId: null, textualStatus: "literary_source_checked",
  },
  {
    id: "wanganshi-feilaifeng-perspective",
    theme: "perspective",
    dynasty: { "zh-Hant": "北宋", "zh-Hans": "北宋", en: "Northern Song" },
    author: { "zh-Hant": "王安石", "zh-Hans": "王安石", en: "Wang Anshi" },
    work: { "zh-Hant": "登飛來峰", "zh-Hans": "登飞来峰", en: "Climbing Feilai Peak" },
    line: { "zh-Hant": "不畏浮雲遮望眼，只緣身在最高層。", "zh-Hans": "不畏浮云遮望眼，只缘身在最高层。", en: "Clouds cannot obscure the view from higher ground." },
    originalChinese: "不畏浮雲遮望眼，只緣身在最高層。",
    explanation: {
      "zh-Hant": "登高看遠，比喻從較完整的視角辨認眼前障礙；不是宣稱命主必居人上。",
      "zh-Hans": "登高看远，比喻从较完整的视角辨认眼前障碍；不是宣称命主必居人上。",
      en: "The elevated view suggests broader perspective, not an assertion of superiority or destined status.",
    },
    sourceUrl: "https://zh.wikisource.org/zh-hant/%E7%99%BB%E9%A3%9B%E4%BE%86%E5%B3%B0",
    sourceLocator: "《王臨川集・登飛來峰》",
    apiRecordId: null, textualStatus: "literary_source_checked",
  },
  {
    id: "libai-xinglunan-forward-motion",
    theme: "forward-motion",
    dynasty: { "zh-Hant": "唐", "zh-Hans": "唐", en: "Tang" },
    author: { "zh-Hant": "李白", "zh-Hans": "李白", en: "Li Bai" },
    work: { "zh-Hant": "行路難・其一", "zh-Hans": "行路难・其一", en: "Hard Is the Road, No. 1" },
    line: { "zh-Hant": "長風破浪會有時，直掛雲帆濟滄海。", "zh-Hans": "长风破浪会有时，直挂云帆济沧海。", en: "A time may come to ride the wind and cross the open sea." },
    originalChinese: "長風破浪會有時，直掛雲帆濟滄海。",
    explanation: {
      "zh-Hant": "詩句表達遭逢艱難後仍保有志向；只能作行動與希望的比喻，不能推定一定發財或成功。",
      "zh-Hans": "诗句表达遭逢艰难后仍保有志向；只能作行动与希望的比喻，不能推定一定发财或成功。",
      en: "A declaration of resolve despite hardship, not a forecast of guaranteed wealth or achievement.",
    },
    sourceUrl: "https://zh.wikisource.org/zh-hant/%E8%A1%8C%E8%B7%AF%E9%9B%A3_%28%E6%9D%8E%E7%99%BD%29",
    sourceLocator: "《全唐詩》卷162・《行路難三首》其一",
    apiRecordId: null, textualStatus: "literary_source_checked",
  },
] as const;

export const POETIC_AFTERWORD_LIBRARY: readonly VerifiedVerse[] = VERSES;

export type PoeticAfterwordInput = {
  locale: PoeticLocale;
  /** Set by the reviewed report's interpretation layer, not by a single stem/element. */
  theme: PoeticTheme | null;
  /** The final, already-approved report conclusion; never regenerated here. */
  finalInterpretation: string;
  /** Existing real-world action from the same report. */
  realWorldAction: string;
  /** Editorial/source approval only; NOT permission to view premium content. */
  editorialApproved: boolean;
};

export type PoeticAfterword = {
  heading: string;
  attribution: string;
  quote: string;
  originalChinese: string;
  connection: string;
  finalInterpretation: string;
  realWorldAction: string;
  evidenceBoundary: string;
  sourceUrl: string;
  sourceLocator: string;
  verseId: string;
};

export function buildPoeticAfterword(input: PoeticAfterwordInput): PoeticAfterword | null {
  if (!input.editorialApproved || !input.theme || !input.finalInterpretation.trim() || !input.realWorldAction.trim()) return null;
  const verse = VERSES.find((entry) => entry.theme === input.theme);
  if (!verse || verse.textualStatus !== "literary_source_checked") return null;
  const locale = input.locale;
  const heading = { "zh-Hant": "詩證天機・命書收卷", "zh-Hans": "诗证天机・命书收卷", en: "Poetic Reflections · Closing Note" };
  const boundary = {
    "zh-Hant": "詩句僅為文學呼應，不是排盤依據、命運預測或吉凶保證。",
    "zh-Hans": "诗句仅为文学呼应，不是排盘依据、命运预测或吉凶保证。",
    en: "This verse is a literary reflection, not chart evidence, a prediction or a guarantee.",
  };
  return {
    heading: heading[locale],
    attribution: verse.dynasty[locale] + " · " + verse.author[locale] + " · " + verse.work[locale],
    quote: verse.line[locale],
    originalChinese: verse.originalChinese,
    connection: verse.explanation[locale],
    finalInterpretation: input.finalInterpretation.trim(),
    realWorldAction: input.realWorldAction.trim(),
    evidenceBoundary: boundary[locale],
    sourceUrl: verse.sourceUrl,
    sourceLocator: verse.sourceLocator,
    verseId: verse.id,
  };
}
