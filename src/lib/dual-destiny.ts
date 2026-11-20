import type { Gender } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";
import { buildPalm } from "@/lib/palm/engine";
import { presentPalmPalace } from "@/lib/palm/standalone-presentation";
import {
  resolveTianjiBirth,
  type TianjiBirthInput,
  type TianjiBirthResolution,
  type TianjiPalace,
} from "@/lib/tianji-xinggong";
import type { PalmReading } from "@/lib/core/types";

export type DualDirection = Extract<Gender, "male" | "female">;

export type DualDestinyResult = {
  tianji: TianjiBirthResolution;
  palm: PalmReading;
};

const OUTER_TRAITS: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "待人溫和、重情也重分寸", "zh-Hans": "待人温和、重情也重分寸", en: "warm, considerate and attentive to social nuance" },
  丑: { "zh-Hant": "耐壓、能熬，也習慣先處理難題", "zh-Hans": "耐压、能熬，也习惯先处理难题", en: "resilient, patient and willing to face difficult work first" },
  寅: { "zh-Hant": "有主見、重掌控，願意為結果負責", "zh-Hans": "有主见、重掌控，愿意为结果负责", en: "decisive, accountable and comfortable taking direction" },
  卯: { "zh-Hant": "爽快重義氣，願意給人空間與機會", "zh-Hans": "爽快重义气，愿意给人空间与机会", en: "open, loyal and generous with room and opportunity" },
  辰: { "zh-Hant": "擅長推演複雜局面，會隨情勢調整", "zh-Hans": "擅长推演复杂局面，会随情势调整", en: "adaptive and skilled at modelling complicated situations" },
  巳: { "zh-Hant": "觀察細、理解快，重知識與完成度", "zh-Hans": "观察细、理解快，重知识与完成度", en: "observant, quick to understand and attentive to craft" },
  午: { "zh-Hant": "親和、有福氣感，也容易得到人情助力", "zh-Hans": "亲和、有福气感，也容易得到人情助力", en: "approachable, optimistic and naturally supported by others" },
  未: { "zh-Hant": "適應力強，越在變動中越能打開局面", "zh-Hans": "适应力强，越在变动中越能打开局面", en: "adaptable and increasingly effective in changing environments" },
  申: { "zh-Hant": "獨立自持，習慣靠自己的判斷站穩", "zh-Hans": "独立自持，习惯靠自己的判断站稳", en: "independent, self-contained and guided by personal judgement" },
  酉: { "zh-Hant": "深藏不露，觀察通常比表態更早", "zh-Hans": "深藏不露，观察通常比表态更早", en: "reserved, perceptive and slower to reveal a position than to form one" },
  戌: { "zh-Hant": "反應快、手上有技藝，能把想法做成作品", "zh-Hans": "反应快、手上有技艺，能把想法做成作品", en: "quick, skilful and able to turn ideas into finished work" },
  亥: { "zh-Hant": "感受力深，能理解他人的情緒與處境", "zh-Hans": "感受力深，能理解他人的情绪与处境", en: "emotionally perceptive and sensitive to other people's circumstances" },
};

const GUIDANCE_BY_DAO = {
  佛道: { "zh-Hant": "善意要有邊界，福氣才留得住。", "zh-Hans": "善意要有边界，福气才留得住。", en: "Give kindness a boundary so good fortune has somewhere to stay." },
  仙道: { "zh-Hant": "把靈感做成作品，才情才有落點。", "zh-Hans": "把灵感做成作品，才情才有落点。", en: "Give inspiration a finished form so talent has somewhere to land." },
  人道: { "zh-Hant": "責任要分清歸屬，不必靠多扛來證明能力。", "zh-Hans": "责任要分清归属，不必靠多扛来证明能力。", en: "Separate responsibility from over-carrying; competence needs no extra burden as proof." },
  修羅道: { "zh-Hant": "把勝負心用在精進，不必把每個局面都變成戰場。", "zh-Hans": "把胜负心用在精进，不必把每个局面都变成战场。", en: "Use competitive force for mastery without turning every room into a contest." },
  鬼道: { "zh-Hant": "先安頓自己，再處理別人的壓力與暗處。", "zh-Hans": "先安顿自己，再处理别人的压力与暗处。", en: "Settle yourself before carrying other people's pressure and hidden pain." },
  畜生道: { "zh-Hant": "韌性用來重建，不用來維持無效消耗。", "zh-Hans": "韧性用来重建，不用来维持无效消耗。", en: "Use resilience to rebuild, not to preserve needless depletion." },
} as const;

const TIANJI_STAR_NAMES: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "天貴星", "zh-Hans": "天贵星", en: "Celestial Noble Star" },
  丑: { "zh-Hant": "天厄星", "zh-Hans": "天厄星", en: "Celestial Trial Star" },
  寅: { "zh-Hant": "天權星", "zh-Hans": "天权星", en: "Celestial Authority Star" },
  卯: { "zh-Hant": "天赦星", "zh-Hans": "天赦星", en: "Celestial Mercy Star" },
  辰: { "zh-Hant": "天如星", "zh-Hans": "天如星", en: "Celestial Adaptation Star" },
  巳: { "zh-Hant": "天文星", "zh-Hans": "天文星", en: "Celestial Scholar Star" },
  午: { "zh-Hant": "天福星", "zh-Hans": "天福星", en: "Celestial Fortune Star" },
  未: { "zh-Hant": "天驛星", "zh-Hans": "天驿星", en: "Celestial Journey Star" },
  申: { "zh-Hant": "天孤星", "zh-Hans": "天孤星", en: "Celestial Solitary Star" },
  酉: { "zh-Hant": "天秘星", "zh-Hans": "天秘星", en: "Celestial Mystery Star" },
  戌: { "zh-Hant": "天藝星", "zh-Hans": "天艺星", en: "Celestial Arts Star" },
  亥: { "zh-Hant": "天壽星", "zh-Hans": "天寿星", en: "Celestial Longevity Star" },
};

export function calculateDualDestiny(input: TianjiBirthInput & { direction: DualDirection }): DualDestinyResult {
  const tianji = resolveTianjiBirth(input);
  const palm = buildPalm({
    year: tianji.solar.year,
    month: tianji.solar.month,
    day: tianji.solar.day,
    hour: tianji.solar.hour,
    timeUnknown: false,
    gender: input.direction,
  });

  if (!palm.ready || !palm.latest) throw new Error("Unable to resolve Dharma Palm chart");
  return { tianji, palm };
}

export function buildDualFusion(result: DualDestinyResult, locale: Locale) {
  const outer = OUTER_TRAITS[result.tianji.result.palace][locale];
  const inner = presentPalmPalace(result.palm.latest!, locale);
  const samePalace = result.tianji.result.palace === result.palm.latest!.zhi;
  const star = TIANJI_STAR_NAMES[result.tianji.result.palace][locale];

  if (locale === "en") {
    return {
      title: samePalace ? "One pattern, expressed inside and out" : "A complementary outer and inner pattern",
      body: `Your ${star} pattern presents as ${outer}. Beneath that, the Dharma Palm hour palace falls in ${inner.zhi} · ${inner.star} (${inner.dao}). ${inner.meaning} ${samePalace ? "Because both systems land on the same branch, this quality is unusually consistent between first impression and private motivation." : "The difference between the two does not cancel either result: one describes how you establish yourself outwardly, while the other describes the inner habit that keeps driving the same choices."}`,
      guidance: GUIDANCE_BY_DAO[result.palm.latest!.dao].en,
    };
  }

  const hant = locale === "zh-Hant";
  return {
    title: samePalace ? (hant ? "內外同宮，性格主軸集中" : "内外同宫，性格主轴集中") : (hant ? "外在立足與內在底色互補" : "外在立足与内在底色互补"),
    body: `${hant ? "天機命宮" : "天机命宫"}落${result.tianji.result.palace}${hant ? "宮" : "宫"}・${star}，你在人前通常${outer}。${hant ? "一掌經時宮" : "一掌经时宫"}落${inner.zhi}・${inner.star}（${inner.dao}）。${inner.meaning}${samePalace ? (hant ? "兩套系統落在同一地支，表示第一印象與私下動機較為一致，優點與盲點都會被放大。" : "两套系统落在同一地支，表示第一印象与私下动机较为一致，优点与盲点都会被放大。") : (hant ? "兩者不同不是互相推翻：前者讀你如何在現實中立足，後者讀反覆驅動選擇的內在習氣。" : "两者不同不是互相推翻：前者读你如何在现实中立足，后者读反复驱动选择的内在习气。")}`,
    guidance: GUIDANCE_BY_DAO[result.palm.latest!.dao][locale],
  };
}
