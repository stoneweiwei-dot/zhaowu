import type { Locale } from "@/lib/i18n";

/**
 * Twelve earthly-branch "heaven & earth scenery" plates (report-only, symbolic).
 * Scenes are weather/landscape only — never animals, never a verdict. Titles and copy live here
 * as text; the images in /report-visuals/branches/ carry no lettering.
 */
export type BranchKey = "zi" | "chou" | "yin" | "mao" | "chen" | "si" | "wu" | "wei" | "shen" | "you" | "xu" | "hai";

type L3 = { "zh-Hant": string; "zh-Hans": string; en: string };
export type BranchScenery = {
  key: BranchKey;
  zhi: string;
  roman: string;
  sky: L3;
  land: L3;
  line: L3;
  alt: L3;
};

const t = (a: string, b: string, c: string): L3 => ({ "zh-Hant": a, "zh-Hans": b, en: c });

export const BRANCH_SCENERY: Record<string, BranchScenery> = {
  子: { key: "zi", zhi: "子", roman: "ZI", sky: t("寒夜 · 月色 · 北斗 · 靜星", "寒夜 · 月色 · 北斗 · 静星", "Cold night · moon · Dipper · still stars"), land: t("深流 · 暗河 · 蘆岸 · 夜潮", "深流 · 暗河 · 芦岸 · 夜潮", "Deep current · dark river · reed bank · night tide"), line: t("夜最深，水最靜，但流動沒有停。", "夜最深，水最静，但流动没有停。", "The night is deepest and the water stillest, yet the current never stops."), alt: t("子：星夜、北斗與靜水", "子：星夜、北斗与静水", "Zi: a starry night over still water") },
  丑: { key: "chou", zhi: "丑", roman: "CHOU", sky: t("將明未明 · 寒霧未散", "将明未明 · 寒雾未散", "Before dawn · lingering cold mist"), land: t("濕土 · 凍田 · 舊埂 · 庫藏", "湿土 · 冻田 · 旧埂 · 库藏", "Damp earth · frozen field · old ridge · storehouse"), line: t("能裝、能忍、能扛，厚地藏物。", "能装、能忍、能扛，厚地藏物。", "Able to hold, to endure, to carry — thick earth that stores."), alt: t("丑：冬末薄霧中的田野", "丑：冬末薄雾中的田野", "Chou: late-winter fields in thin mist") },
  寅: { key: "yin", zhi: "寅", roman: "YIN", sky: t("破曉 · 春雷初動 · 陽氣抬頭", "破晓 · 春雷初动 · 阳气抬头", "Daybreak · first spring thunder · yang rising"), land: t("山林 · 長坡 · 松根 · 初生木氣", "山林 · 长坡 · 松根 · 初生木气", "Forest · long slope · pine roots · young wood"), line: t("冬天的冰剛裂，萬物正要出發。", "冬天的冰刚裂，万物正要出发。", "The winter ice has just cracked; everything is about to set out."), alt: t("寅：破曉的松根與遠雷", "寅：破晓的松根与远雷", "Yin: pine roots at daybreak, thunder far off") },
  卯: { key: "mao", zhi: "卯", roman: "MAO", sky: t("清晨 · 春光 · 朝露 · 東方明亮", "清晨 · 春光 · 朝露 · 东方明亮", "Morning · spring light · dew · bright east"), land: t("花枝 · 園圃 · 柔木 · 門庭", "花枝 · 园圃 · 柔木 · 门庭", "Blossom branch · garden · supple wood · courtyard"), line: t("春意最整齊的那一下，柔美而秀。", "春意最整齐的那一下，柔美而秀。", "The moment spring is most in order — soft and fine."), alt: t("卯：晨露花枝與庭院欄杆", "卯：晨露花枝与庭院栏杆", "Mao: dewy blossom and a courtyard balustrade") },
  辰: { key: "chen", zhi: "辰", roman: "CHEN", sky: t("雲氣翻動 · 雷後濕潤 · 天光未定", "云气翻动 · 雷后湿润 · 天光未定", "Rolling cloud · damp after thunder · unsettled light"), land: t("濕土 · 水庫 · 河床 · 原野交界", "湿土 · 水库 · 河床 · 原野交界", "Damp earth · reservoir · riverbed · where field meets water"), line: t("萬物已被喚醒，但還帶著濕氣與過渡感。", "万物已被唤醒，但还带着湿气与过渡感。", "Everything is awake, still carrying damp and a sense of transition."), alt: t("辰：雷後河灘與翻湧雲氣", "辰：雷后河滩与翻涌云气", "Chen: river flats and rolling cloud after thunder") },
  巳: { key: "si", zhi: "巳", roman: "SI", sky: t("陽光升高 · 熱意聚集 · 光開始烈", "阳光升高 · 热意聚集 · 光开始烈", "Sun climbing · warmth gathering · light sharpening"), land: t("山坡 · 暖石 · 香草 · 細路", "山坡 · 暖石 · 香草 · 细路", "Hillside · warm rock · herbs · narrow path"), line: t("陽光升高，熱開始明顯起來。", "阳光升高，热开始明显起来。", "The sun climbs, and the warmth begins to show."), alt: t("巳：向陽暖坡與細路", "巳：向阳暖坡与细路", "Si: a sunlit slope and a narrow path") },
  午: { key: "wu", zhi: "午", roman: "WU", sky: t("正午 · 烈日 · 中天", "正午 · 烈日 · 中天", "Noon · blazing sun · high overhead"), land: t("大道 · 開闊平野 · 旌旗", "大道 · 开阔平野 · 旌旗", "Open road · wide plain · banners"), line: t("正中央、最外放、最明亮的時刻。", "正中央、最外放、最明亮的时刻。", "The centre, the most outward, the brightest moment."), alt: t("午：正午烈日下的筆直大道", "午：正午烈日下的笔直大道", "Wu: a straight road under the noon sun") },
  未: { key: "wei", zhi: "未", roman: "WEI", sky: t("午後柔光 · 暑氣漸緩 · 光沉", "午后柔光 · 暑气渐缓 · 光沉", "Soft afternoon light · heat easing · light settling"), land: t("田園 · 草坡 · 牧地 · 熟土", "田园 · 草坡 · 牧地 · 熟土", "Farmland · grass slope · pasture · ripened soil"), line: t("熟、養、緩、收，大地開始包容。", "熟、养、缓、收，大地开始包容。", "Ripe, nourishing, unhurried — the earth begins to hold everything."), alt: t("未：午後柔光中的草坡與穀田", "未：午后柔光中的草坡与谷田", "Wei: grass slopes and grain fields in afternoon light") },
  申: { key: "shen", zhi: "申", roman: "SHEN", sky: t("秋氣起 · 天高 · 風清 · 光轉硬", "秋气起 · 天高 · 风清 · 光转硬", "Autumn rising · high sky · clear wind · harder light"), land: t("石谷 · 金聲 · 果實 · 峽道", "石谷 · 金声 · 果实 · 峡道", "Stone valley · metallic ring · fruit · gorge"), line: t("氣開始往收斂、效率、結果去。", "气开始往收敛、效率、结果去。", "Energy turns toward gathering in, efficiency and results."), alt: t("申：秋日石谷與清冷光線", "申：秋日石谷与清冷光线", "Shen: an autumn stone valley in cool light") },
  酉: { key: "you", zhi: "酉", roman: "YOU", sky: t("暮色 · 落日餘暉 · 秋月 · 清露", "暮色 · 落日余晖 · 秋月 · 清露", "Dusk · afterglow · autumn moon · clear dew"), land: t("庭院 · 白花 · 金玉 · 井然收束", "庭院 · 白花 · 金玉 · 井然收束", "Courtyard · white blossom · gold and jade · everything in order"), line: t("乾淨、漂亮，帶著收束的完成度。", "干净、漂亮，带着收束的完成度。", "Clean and lovely, with the finish of something completed."), alt: t("酉：新月、白菊與庭院石井", "酉：新月、白菊与庭院石井", "You: a new moon, white chrysanthemum and a stone well") },
  戌: { key: "xu", zhi: "戌", roman: "XU", sky: t("日將盡 · 燥氣 · 殘霞 · 守夜前夕", "日将尽 · 燥气 · 残霞 · 守夜前夕", "Day ending · dry air · last glow · eve of the night watch"), land: t("高岡 · 燥土 · 城垣 · 守望", "高冈 · 燥土 · 城垣 · 守望", "High ridge · dry earth · city wall · lookout"), line: t("守門、定界，燥土藏火。", "守门、定界，燥土藏火。", "Guarding the gate, fixing the boundary — dry earth holding fire."), alt: t("戌：殘霞、燥土與城垣", "戌：残霞、燥土与城垣", "Xu: the last glow over dry earth and a wall") },
  亥: { key: "hai", zhi: "亥", roman: "HAI", sky: t("深夜 · 夜雨 · 遠天 · 寒雲", "深夜 · 夜雨 · 远天 · 寒云", "Deep night · night rain · far sky · cold cloud"), land: t("江灣 · 澤國 · 竹影 · 深林", "江湾 · 泽国 · 竹影 · 深林", "River bay · wetlands · bamboo shadow · deep forest"), line: t("夜深水大，萬物歸藏，回到本源。", "夜深水大，万物归藏，回到本源。", "Deep night, wide water — all things return to their source."), alt: t("亥：夜雨江灣與竹影", "亥：夜雨江湾与竹影", "Hai: a rainy night bay with bamboo") },
};

export function branchSceneryUrl(key: BranchKey) {
  return `/report-visuals/branches/${key}.webp`;
}

/** Distinct branches present in the chart, in pillar order, capped so the report never becomes a gallery. */
export function branchesInChart(zhis: string[], max = 4): BranchScenery[] {
  const seen = new Set<string>();
  const out: BranchScenery[] = [];
  for (const zhi of zhis) {
    const scene = BRANCH_SCENERY[zhi];
    if (!scene || seen.has(zhi)) continue;
    seen.add(zhi);
    out.push(scene);
    if (out.length >= max) break;
  }
  return out;
}

export const BRANCH_COPY: Record<Locale, { eyebrow: string; heading: string; sky: string; land: string; note: string; unavailable: string }> = {
  "zh-Hant": { eyebrow: "昭梧 · 十二地支景象", heading: "命盤中的天地景象", sky: "在天", land: "在地", note: "僅展示地支的文化意象；具體命局仍需綜合四柱分析。", unavailable: "景象圖暫無法顯示，命書文字與推算結果不受影響。" },
  "zh-Hans": { eyebrow: "昭梧 · 十二地支景象", heading: "命盘中的天地景象", sky: "在天", land: "在地", note: "仅展示地支的文化意象；具体命局仍需综合四柱分析。", unavailable: "景象图暂无法显示，命书文字与推算结果不受影响。" },
  en: { eyebrow: "ZHAOWU · TWELVE BRANCHES", heading: "Heaven and earth in your chart", sky: "Sky", land: "Earth", note: "Cultural imagery of each branch only; the actual reading still depends on all four pillars.", unavailable: "Scenery unavailable. Your chart and written reading are unaffected." },
};
