import type { AppLocale, Chart, Element } from "@/lib/bazi/types";

export type TasteAxis = "fresh" | "floral" | "roast" | "smoke" | "sweet" | "mineral" | "aged" | "umami" | "body";
export type TasteVector = Record<TasteAxis, number>;
export type TeaQuizAnswers = Record<string, string>;
export type LocalizedText = Record<AppLocale, string>;

export type TeaProfile = {
  id: string;
  tea: LocalizedText;
  guardian: LocalizedText;
  origin: LocalizedText;
  image: string;
  elements: Record<Element, number>;
  taste: TasteVector;
  traits: LocalizedText;
  note: LocalizedText;
};

export type TeaMatch = {
  tea: TeaProfile;
  score: number;
  destinyScore: number | null;
  tasteScore: number | null;
  reason: string;
};

export type TeaQuizOption = { id: string; label: LocalizedText; taste: Partial<TasteVector> };
export type TeaQuizQuestion = { id: string; question: LocalizedText; options: TeaQuizOption[] };

export const TEA_QUIZ_STORAGE_KEY = "zhaowu.teaQuiz.v1";

const t = (hant: string, hans: string, en: string): LocalizedText => ({ "zh-Hant": hant, "zh-Hans": hans, en });
const taste = (values: Partial<TasteVector>): TasteVector => ({
  fresh: 0, floral: 0, roast: 0, smoke: 0, sweet: 0, mineral: 0, aged: 0, umami: 0, body: 0,
  ...values,
});
const el = (木: number, 火: number, 土: number, 金: number, 水: number): Record<Element, number> => ({ 木, 火, 土, 金, 水 });

export const TEA_PROFILES: TeaProfile[] = [
  {
    id: "anxi-tieguanyin",
    tea: t("安溪鐵觀音", "安溪铁观音", "Anxi Tieguanyin"),
    guardian: t("鐵觀音聖妙天尊", "铁观音圣妙天尊", "Sacred Tieguanyin Guardian"),
    origin: t("福建安溪", "福建安溪", "Anxi, Fujian"),
    image: "/tea-guardians/anxi-tieguanyin.webp",
    elements: el(.35, .10, .10, .30, .15),
    taste: taste({ fresh: 4, floral: 5, sweet: 3, mineral: 2, body: 3 }),
    traits: t("蘭香、觀音韻、清亮而有骨", "兰香、观音韵、清亮而有骨", "Orchid aroma, bright structure, lingering Guanyin resonance"),
    note: t("適合喜歡花香清晰、層次乾淨又不失回甘的人。", "适合喜欢花香清晰、层次干净又不失回甘的人。", "For people who like clear floral lift, clean structure and a lingering sweet finish."),
  },
  {
    id: "wuyi-dahongpao",
    tea: t("武夷大紅袍", "武夷大红袍", "Wuyi Dahongpao"),
    guardian: t("大紅袍玄岳帝君", "大红袍玄岳帝君", "Dahongpao Mountain-Fire Guardian"),
    origin: t("福建武夷山", "福建武夷山", "Wuyi Mountains, Fujian"),
    image: "/tea-guardians/wuyi-dahongpao.webp",
    elements: el(.10, .30, .30, .20, .10),
    taste: taste({ roast: 5, mineral: 5, body: 5, floral: 3, sweet: 3 }),
    traits: t("岩骨花香、焙火、厚實山場", "岩骨花香、焙火、厚实山场", "Rock structure, floral lift, roast depth and strong terroir"),
    note: t("適合偏好岩韻、焙火與有重量感茶湯的人。", "适合偏好岩韵、焙火与有重量感茶汤的人。", "For drinkers who want mineral depth, roast character and substantial liquor."),
  },
  {
    id: "zhengshan-xiaozhong",
    tea: t("武夷正山小種", "武夷正山小种", "Zhengshan Xiaozhong"),
    guardian: t("正山松煙大帝", "正山松烟大帝", "Pine-Smoke Tea Ancestor"),
    origin: t("福建桐木關", "福建桐木关", "Tongmu Pass, Fujian"),
    image: "/tea-guardians/zhengshan-xiaozhong.webp",
    elements: el(.25, .30, .20, .10, .15),
    taste: taste({ smoke: 5, roast: 4, sweet: 4, body: 4, aged: 2 }),
    traits: t("松煙、桂圓甜、暖厚紅湯", "松烟、桂圆甜、暖厚红汤", "Pine smoke, longan-like sweetness and warm red-tea body"),
    note: t("適合喜歡煙香、甜醇與溫暖厚度的人。", "适合喜欢烟香、甜醇与温暖厚度的人。", "For people drawn to smoke, mellow sweetness and a warm full-bodied cup."),
  },
  {
    id: "fuding-white",
    tea: t("福鼎白茶", "福鼎白茶", "Fuding White Tea"),
    guardian: t("白毫長生尊王", "白毫长生尊王", "White-Tea Time Guardian"),
    origin: t("福建福鼎太姥山", "福建福鼎太姥山", "Fuding, Fujian"),
    image: "/tea-guardians/fuding-white.webp",
    elements: el(.20, .05, .20, .30, .25),
    taste: taste({ fresh: 3, floral: 2, sweet: 4, aged: 5, body: 3 }),
    traits: t("素淡、毫香、歲月陳韻", "素淡、毫香、岁月陈韵", "Soft white-tea aroma, simplicity and age-developed depth"),
    note: t("適合喜歡不張揚、柔和、帶時間感風味的人。", "适合喜欢不张扬、柔和、带时间感风味的人。", "For people who prefer quiet, gentle flavours with a sense of age and restraint."),
  },
  {
    id: "wuyi-rougui",
    tea: t("武夷肉桂", "武夷肉桂", "Wuyi Rougui"),
    guardian: t("肉桂霸王尊王", "肉桂霸王尊王", "Rougui Overlord Guardian"),
    origin: t("福建武夷山", "福建武夷山", "Wuyi Mountains, Fujian"),
    image: "/tea-guardians/wuyi-rougui.webp",
    elements: el(.15, .35, .20, .25, .05),
    taste: taste({ roast: 5, mineral: 5, body: 5, sweet: 3, floral: 2 }),
    traits: t("辛桂高銳、岩骨、霸氣長韻", "辛桂高锐、岩骨、霸气长韵", "Sharp cinnamon-like spice, mineral backbone and forceful finish"),
    note: t("適合喜歡直接、強烈、辛香與岩韻的人。", "适合喜欢直接、强烈、辛香与岩韵的人。", "For drinkers who want intensity, spice, mineral force and a long commanding finish."),
  },
  {
    id: "baihao-yinzhen",
    tea: t("白毫銀針", "白毫银针", "Baihao Yinzhen"),
    guardian: t("銀針凌霜尊王", "银针凌霜尊王", "Silver-Needle Frost Guardian"),
    origin: t("福建福鼎", "福建福鼎", "Fuding, Fujian"),
    image: "/tea-guardians/baihao-yinzhen.webp",
    elements: el(.20, .05, .10, .35, .30),
    taste: taste({ fresh: 5, floral: 3, sweet: 4, body: 2, umami: 2 }),
    traits: t("銀毫、清甜、冷冽而純", "银毫、清甜、冷冽而纯", "Silver down, crystalline sweetness and high purity"),
    note: t("適合偏好極清、極細、低刺激感風味的人。", "适合偏好极清、极细、低刺激感风味的人。", "For people who enjoy very clean, delicate and restrained flavours."),
  },
  {
    id: "jinjunmei",
    tea: t("金駿眉", "金骏眉", "Jin Jun Mei"),
    guardian: t("金駿眉圓融尊王", "金骏眉圆融尊王", "Golden-Brow Harmony Guardian"),
    origin: t("福建桐木關", "福建桐木关", "Tongmu Pass, Fujian"),
    image: "/tea-guardians/jinjunmei.webp",
    elements: el(.25, .30, .20, .15, .10),
    taste: taste({ floral: 4, sweet: 5, body: 3, fresh: 3, roast: 2 }),
    traits: t("花果蜜香、春陽、細緻紅湯", "花果蜜香、春阳、细致红汤", "Floral-fruit honey aroma, spring warmth and refined red-tea texture"),
    note: t("適合喜歡甜香、細緻、柔順又明亮的人。", "适合喜欢甜香、细致、柔顺又明亮的人。", "For people who prefer aromatic sweetness, refinement and a smooth bright cup."),
  },
  {
    id: "wuyi-shuixian",
    tea: t("武夷水仙", "武夷水仙", "Wuyi Shuixian"),
    guardian: t("水仙醇骨尊王", "水仙醇骨尊王", "Shuixian Deep-Rhythm Guardian"),
    origin: t("福建武夷山", "福建武夷山", "Wuyi Mountains, Fujian"),
    image: "/tea-guardians/wuyi-shuixian.webp",
    elements: el(.30, .10, .20, .10, .30),
    taste: taste({ floral: 3, mineral: 3, aged: 4, body: 5, sweet: 3 }),
    traits: t("老欉木韻、水腔、醇厚包容", "老枞木韵、水腔、醇厚包容", "Old-bush wood character, fluid throat feel and mellow depth"),
    note: t("適合喜歡沉穩、木質、柔順厚實的人。", "适合喜欢沉稳、木质、柔顺厚实的人。", "For drinkers who value calm woody depth, smoothness and rounded body."),
  },
  {
    id: "fuzhou-jasmine",
    tea: t("福州茉莉花茶", "福州茉莉花茶", "Fuzhou Jasmine Tea"),
    guardian: t("茉莉天香天后", "茉莉天香天后", "Jasmine Celestial-Fragrance Guardian"),
    origin: t("福建福州", "福建福州", "Fuzhou, Fujian"),
    image: "/tea-guardians/fuzhou-jasmine.webp",
    elements: el(.35, .10, .10, .25, .20),
    taste: taste({ floral: 5, fresh: 5, sweet: 3, body: 2 }),
    traits: t("鮮靈茉莉、雙香入骨、清爽", "鲜灵茉莉、双香入骨、清爽", "Lifted jasmine fragrance, tea-flower integration and freshness"),
    note: t("適合把香氣辨識度放在第一位的人。", "适合把香气辨识度放在第一位的人。", "For people who put vivid fragrance and freshness first."),
  },
  {
    id: "bai-mudan",
    tea: t("白牡丹", "白牡丹", "White Peony"),
    guardian: t("白牡丹玲瓏尊王", "白牡丹玲珑尊王", "White-Peony Harmony Guardian"),
    origin: t("福建福鼎／政和", "福建福鼎／政和", "Fuding / Zhenghe, Fujian"),
    image: "/tea-guardians/bai-mudan.webp",
    elements: el(.30, .10, .15, .20, .25),
    taste: taste({ fresh: 4, floral: 4, sweet: 4, body: 3 }),
    traits: t("花香、毫香、中和玲瓏", "花香、毫香、中和玲珑", "Floral lift, white-tea aroma and balanced elegance"),
    note: t("適合喜歡平衡、不偏激、清雅又有甜度的人。", "适合喜欢平衡、不偏激、清雅又有甜度的人。", "For people who want balance, elegance and gentle sweetness without extremes."),
  },
  {
    id: "yongchun-foshou",
    tea: t("永春佛手", "永春佛手", "Yongchun Buddha's Hand"),
    guardian: t("永春佛手禪香尊王", "永春佛手禅香尊王", "Yongchun Zen-Fragrance Guardian"),
    origin: t("福建永春", "福建永春", "Yongchun, Fujian"),
    image: "/tea-guardians/yongchun-foshou.webp",
    elements: el(.35, .20, .20, .15, .10),
    taste: taste({ floral: 3, fresh: 3, sweet: 4, roast: 3, body: 3 }),
    traits: t("佛手柑、雪梨、禪茶清香", "佛手柑、雪梨、禅茶清香", "Buddha's-hand citrus, pear-like lift and calm Zen-tea fragrance"),
    note: t("適合喜歡果香轉甘、清靜但不單薄的人。", "适合喜欢果香转甘、清静但不单薄的人。", "For people who enjoy citrus-fruit lift turning to sweetness, with calm but sufficient body."),
  },
  {
    id: "tie-luohan",
    tea: t("武夷鐵羅漢", "武夷铁罗汉", "Wuyi Tie Luohan"),
    guardian: t("鐵羅漢丹藥尊王", "铁罗汉丹药尊王", "Tie Luohan Medicinal-Aroma Guardian"),
    origin: t("福建武夷山慧苑坑", "福建武夷山慧苑坑", "Huiyuan Valley, Wuyi Mountains"),
    image: "/tea-guardians/tie-luohan.webp",
    elements: el(.10, .30, .25, .25, .10),
    taste: taste({ roast: 5, mineral: 5, aged: 4, body: 5, smoke: 2 }),
    traits: t("藥香、重火、鐵骨岩韻", "药香、重火、铁骨岩韵", "Medicinal aroma, deep roast and iron-like rock structure"),
    note: t("適合喜歡厚、沉、重焙與特殊陳香的人。", "适合喜欢厚、沉、重焙与特殊陈香的人。", "For people who enjoy depth, heavy roast and distinctive mature aromatic character."),
  },
  {
    id: "bai-jiguan",
    tea: t("武夷白雞冠", "武夷白鸡冠", "Wuyi Bai Jiguan"),
    guardian: t("白雞冠雪冠尊王", "白鸡冠雪冠尊王", "White-Cockscomb Daoist Guardian"),
    origin: t("福建武夷山止止庵", "福建武夷山止止庵", "Zhizhi'an, Wuyi Mountains"),
    image: "/tea-guardians/bai-jiguan.webp",
    elements: el(.20, .10, .15, .30, .25),
    taste: taste({ fresh: 4, floral: 3, sweet: 4, mineral: 2, body: 2 }),
    traits: t("雪冠異芽、清甜、道家清氣", "雪冠异芽、清甜、道家清气", "Pale crown-like shoots, clear sweetness and airy refinement"),
    note: t("適合喜歡清透、少見、帶輕岩韻的人。", "适合喜欢清透、少见、带轻岩韵的人。", "For people who like rare, transparent teas with a light rock-tea signature."),
  },
  {
    id: "xihu-longjing",
    tea: t("西湖龍井", "西湖龙井", "West Lake Longjing"),
    guardian: t("龍井甘泉尊王", "龙井甘泉尊王", "Longjing Sweet-Spring Guardian"),
    origin: t("浙江杭州西湖獅峰", "浙江杭州西湖狮峰", "West Lake, Hangzhou"),
    image: "/tea-guardians/xihu-longjing.webp",
    elements: el(.40, .10, .10, .15, .25),
    taste: taste({ fresh: 5, floral: 2, sweet: 4, umami: 3, body: 2 }),
    traits: t("豆香、清鮮、甘泉般明淨", "豆香、清鲜、甘泉般明净", "Chestnut-bean fragrance, freshness and clean sweet clarity"),
    note: t("適合偏好乾淨鮮爽、清甜、節制感的人。", "适合偏好干净鲜爽、清甜、节制感的人。", "For people who prefer clean freshness, restrained sweetness and precision."),
  },
  {
    id: "old-banzhang",
    tea: t("老班章古樹生普", "老班章古树生普", "Lao Banzhang Ancient-Tree Sheng Pu'er"),
    guardian: t("老班章霸茶天王", "老班章霸茶天王", "Lao Banzhang Tea-King Guardian"),
    origin: t("雲南勐海布朗山", "云南勐海布朗山", "Bulang Mountain, Yunnan"),
    image: "/tea-guardians/old-banzhang.webp",
    elements: el(.25, .20, .25, .15, .15),
    taste: taste({ body: 5, aged: 4, mineral: 4, fresh: 2, sweet: 3 }),
    traits: t("山野氣、強勁苦底、猛烈回甘", "山野气、强劲苦底、猛烈回甘", "Mountain force, assertive bitterness and powerful returning sweetness"),
    note: t("適合能接受強度、苦底與厚重回甘的人。", "适合能接受强度、苦底与厚重回甘的人。", "For experienced drinkers comfortable with force, bitterness and a powerful returning sweetness."),
  },
  {
    id: "dongting-biluochun",
    tea: t("洞庭山碧螺春", "洞庭山碧螺春", "Dongting Biluochun"),
    guardian: t("碧螺春清韻尊王", "碧螺春清韵尊王", "Biluochun Clear-Rhyme Guardian"),
    origin: t("江蘇蘇州太湖洞庭山", "江苏苏州太湖洞庭山", "Dongting Mountain, Suzhou"),
    image: "/tea-guardians/dongting-biluochun.webp",
    elements: el(.40, .10, .10, .15, .25),
    taste: taste({ fresh: 5, floral: 4, sweet: 4, body: 2 }),
    traits: t("花果間作、捲曲如螺、江南清韻", "花果间作、卷曲如螺、江南清韵", "Fruit-garden terroir, spiral leaves and delicate Jiangnan freshness"),
    note: t("適合喜歡春日花果香、細嫩與清甜的人。", "适合喜欢春日花果香、细嫩与清甜的人。", "For people who like springlike floral-fruit lift, tenderness and clear sweetness."),
  },
  {
    id: "keemun",
    tea: t("祁門工夫紅茶", "祁门工夫红茶", "Keemun Gongfu Black Tea"),
    guardian: t("祁香工夫尊王", "祁香工夫尊王", "Keemun Fragrance Guardian"),
    origin: t("安徽祁門", "安徽祁门", "Qimen, Anhui"),
    image: "/tea-guardians/keemun.webp",
    elements: el(.20, .25, .20, .20, .15),
    taste: taste({ floral: 4, sweet: 4, body: 4, roast: 2, aged: 2 }),
    traits: t("祁門香、蘭蜜果香、紅湯醇雅", "祁门香、兰蜜果香、红汤醇雅", "Keemun fragrance, orchid-honey fruit tones and elegant red liquor"),
    note: t("適合喜歡經典紅茶、香氣複合而不粗重的人。", "适合喜欢经典红茶、香气复合而不粗重的人。", "For people who like classic black tea with layered aroma and polished body."),
  },
  {
    id: "xinyang-maojian",
    tea: t("信陽毛尖", "信阳毛尖", "Xinyang Maojian"),
    guardian: t("雲嶺清鋒尊王", "云岭清锋尊王", "Cloud-Ridge Clear-Edge Guardian"),
    origin: t("河南信陽", "河南信阳", "Xinyang, Henan"),
    image: "/tea-guardians/xinyang-maojian.webp",
    elements: el(.40, .10, .10, .15, .25),
    taste: taste({ fresh: 5, floral: 3, sweet: 3, body: 3, umami: 2 }),
    traits: t("細直如針、雲霧清鋒、鮮爽", "细直如针、云雾清锋、鲜爽", "Needle-like leaves, mountain freshness and crisp structure"),
    note: t("適合喜歡鮮爽明確、略帶力度的綠茶型人。", "适合喜欢鲜爽明确、略带力度的绿茶型人。", "For people who like precise freshness with a little more grip and structure."),
  },
  {
    id: "liuan-guapian",
    tea: t("六安瓜片", "六安瓜片", "Liu'an Guapian"),
    guardian: t("皖西火葉尊王", "皖西火叶尊王", "Western-Anhui Fire-Leaf Guardian"),
    origin: t("安徽大別山", "安徽大别山", "Dabie Mountains, Anhui"),
    image: "/tea-guardians/liuan-guapian.webp",
    elements: el(.30, .25, .15, .20, .10),
    taste: taste({ fresh: 4, roast: 4, sweet: 3, body: 4, mineral: 2 }),
    traits: t("單片無芽、拉老火、栗香厚實", "单片无芽、拉老火、栗香厚实", "Leaf-only form, finishing fire and chestnut-like depth"),
    note: t("適合想要綠茶鮮感、但又喜歡火工與厚度的人。", "适合想要绿茶鲜感、但又喜欢火工与厚度的人。", "For people who want green-tea freshness with more firecraft and body."),
  },
  {
    id: "junshan-yinzhen",
    tea: t("君山銀針", "君山银针", "Junshan Yinzhen"),
    guardian: t("洞庭黃芽尊王", "洞庭黄芽尊王", "Dongting Yellow-Bud Guardian"),
    origin: t("湖南岳陽君山", "湖南岳阳君山", "Junshan Island, Hunan"),
    image: "/tea-guardians/junshan-yinzhen.webp",
    elements: el(.25, .20, .30, .15, .10),
    taste: taste({ sweet: 4, umami: 3, body: 3, fresh: 3, floral: 2 }),
    traits: t("黃芽、悶黃、甘醇柔厚", "黄芽、闷黄、甘醇柔厚", "Yellow buds, mellowing process and soft rounded sweetness"),
    note: t("適合喜歡柔和、圓潤、少鋒芒但有層次的人。", "适合喜欢柔和、圆润、少锋芒但有层次的人。", "For people who prefer softness, roundness and layered flavour without sharp edges."),
  },
  {
    id: "uji-gyokuro",
    tea: t("日本・宇治玉露", "日本·宇治玉露", "Uji Gyokuro"),
    guardian: t("玉露天尊", "玉露天尊", "Gyokuro Jade-Dew Guardian"),
    origin: t("日本京都宇治", "日本京都宇治", "Uji, Kyoto, Japan"),
    image: "/tea-guardians/uji-gyokuro.webp",
    elements: el(.30, .10, .10, .20, .30),
    taste: taste({ umami: 5, fresh: 5, sweet: 4, body: 4, floral: 1 }),
    traits: t("覆下栽培、濃鮮旨味、玉露甘潤", "覆下栽培、浓鲜旨味、玉露甘润", "Shaded cultivation, intense umami and dense jade-green sweetness"),
    note: t("適合把鮮味、旨味與濃稠口感放在第一位的人。", "适合把鲜味、旨味与浓稠口感放在第一位的人。", "For people who prioritise umami, savoury sweetness and concentrated texture."),
  },
  {
    id: "darjeeling-second-flush",
    tea: t("印度・大吉嶺 Second Flush Muscatel", "印度·大吉岭 Second Flush Muscatel", "Darjeeling Second Flush Muscatel"),
    guardian: t("麝香葡萄妙香天女", "麝香葡萄妙香天女", "Muscatel Fragrance Guardian"),
    origin: t("印度西孟加拉大吉嶺", "印度西孟加拉大吉岭", "Darjeeling, India"),
    image: "/tea-guardians/darjeeling-second-flush.webp",
    elements: el(.30, .15, .10, .25, .20),
    taste: taste({ floral: 5, sweet: 4, body: 3, fresh: 3, mineral: 2 }),
    traits: t("麝香葡萄、花果香、山麓清亮", "麝香葡萄、花果香、山麓清亮", "Muscatel grape, floral-fruit lift and highland brightness"),
    note: t("適合喜歡香水感花果香、乾淨高揚的人。", "适合喜欢香水感花果香、干净高扬的人。", "For people drawn to lifted perfumed florals, fruit and highland clarity."),
  },
  {
    id: "dayuling-oolong",
    tea: t("中國台灣・大禹嶺高山烏龍", "中国台湾·大禹岭高山乌龙", "Dayuling High-Mountain Oolong"),
    guardian: t("大禹嶺高山清嵐尊王", "大禹岭高山清岚尊王", "Dayuling High-Mountain Guardian"),
    origin: t("台灣大禹嶺", "台湾大禹岭", "Dayuling, Taiwan"),
    image: "/tea-guardians/dayuling-oolong.webp",
    elements: el(.30, .10, .10, .20, .30),
    taste: taste({ floral: 5, fresh: 5, sweet: 4, body: 4, mineral: 2 }),
    traits: t("高山花香、冷冽山氣、醇厚", "高山花香、冷冽山气、醇厚", "High-mountain florals, cool alpine clarity and rich texture"),
    note: t("適合喜歡高山清香、乾淨又有厚度的人。", "适合喜欢高山清香、干净又有厚度的人。", "For people who want alpine clarity, fragrance and substantial texture together."),
  },
  {
    id: "taiping-houkui",
    tea: t("太平猴魁", "太平猴魁", "Taiping Houkui"),
    guardian: t("猴魁蘭鋒尊王", "猴魁兰锋尊王", "Houkui Orchid-Edge Guardian"),
    origin: t("安徽黃山猴坑", "安徽黄山猴坑", "Houkeng, Huangshan, Anhui"),
    image: "/tea-guardians/taiping-houkui.webp",
    elements: el(.40, .10, .10, .20, .20),
    taste: taste({ fresh: 5, floral: 4, sweet: 3, body: 3, mineral: 2 }),
    traits: t("兩葉抱芽、蘭香高長、猴韻", "两叶抱芽、兰香高长、猴韵", "Large leaf-and-bud form, long orchid aroma and distinctive Houkui character"),
    note: t("適合喜歡高香綠茶，但希望茶體比一般嫩芽茶更有存在感的人。", "适合喜欢高香绿茶，但希望茶体比一般嫩芽茶更有存在感的人。", "For people who like aromatic green tea with more structure than very delicate bud teas."),
  },
];

export const TEA_QUIZ: TeaQuizQuestion[] = [
  {
    id: "aroma",
    question: t("你第一口最想先聞到什麼？", "你第一口最想先闻到什么？", "What do you most want to smell first?"),
    options: [
      { id: "floral", label: t("花香高揚", "花香高扬", "Lifted florals"), taste: { floral: 5, fresh: 2 } },
      { id: "green", label: t("清鮮嫩香", "清鲜嫩香", "Fresh green aroma"), taste: { fresh: 5, umami: 2 } },
      { id: "roast", label: t("焙火與熟香", "焙火与熟香", "Roast and warm aroma"), taste: { roast: 5, body: 2 } },
      { id: "smoke", label: t("煙香與深沉香", "烟香与深沉香", "Smoke and deep aroma"), taste: { smoke: 5, aged: 2 } },
    ],
  },
  {
    id: "body",
    question: t("你喜歡茶湯有多重？", "你喜欢茶汤有多重？", "How much body do you like in the cup?"),
    options: [
      { id: "light", label: t("輕盈清透", "轻盈清透", "Light and transparent"), taste: { fresh: 4, body: 1 } },
      { id: "balanced", label: t("中等、均衡", "中等、均衡", "Balanced"), taste: { body: 3, sweet: 2 } },
      { id: "full", label: t("醇厚有重量", "醇厚有重量", "Full and substantial"), taste: { body: 5, roast: 2 } },
      { id: "dense", label: t("濃稠、包覆感強", "浓稠、包覆感强", "Dense and coating"), taste: { body: 5, umami: 4 } },
    ],
  },
  {
    id: "finish",
    question: t("你最在意哪種尾韻？", "你最在意哪种尾韵？", "Which finish matters most to you?"),
    options: [
      { id: "clean", label: t("清甜生津", "清甜生津", "Clean sweetness"), taste: { fresh: 4, sweet: 4 } },
      { id: "honey", label: t("花果蜜甜", "花果蜜甜", "Floral-fruit honey"), taste: { floral: 3, sweet: 5 } },
      { id: "rock", label: t("岩韻與礦物感", "岩韵与矿物感", "Mineral rock finish"), taste: { mineral: 5, body: 3 } },
      { id: "old", label: t("木質、陳韻、深沉", "木质、陈韵、深沉", "Woody, aged and deep"), taste: { aged: 5, body: 3 } },
    ],
  },
  {
    id: "roast",
    question: t("你對焙火的接受度？", "你对焙火的接受度？", "How much roast do you enjoy?"),
    options: [
      { id: "none", label: t("幾乎不要", "几乎不要", "Almost none"), taste: { fresh: 5, roast: 0 } },
      { id: "light", label: t("輕火提香", "轻火提香", "Light roast"), taste: { roast: 2, floral: 2 } },
      { id: "medium", label: t("中火最舒服", "中火最舒服", "Medium roast"), taste: { roast: 4, body: 3 } },
      { id: "heavy", label: t("重火、炭焙都可以", "重火、炭焙都可以", "Heavy roast / charcoal"), taste: { roast: 5, smoke: 3, body: 4 } },
    ],
  },
  {
    id: "scene",
    question: t("哪個喝茶畫面最吸引你？", "哪个喝茶画面最吸引你？", "Which tea scene draws you most?"),
    options: [
      { id: "spring", label: t("春園花木", "春园花木", "Spring garden"), taste: { floral: 4, fresh: 4 } },
      { id: "cliff", label: t("丹霞岩壁與炭火", "丹霞岩壁与炭火", "Cliffs and charcoal fire"), taste: { mineral: 5, roast: 4 } },
      { id: "mist", label: t("高山雲霧與冷泉", "高山云雾与冷泉", "High mountain mist"), taste: { fresh: 4, floral: 3, umami: 2 } },
      { id: "old", label: t("古樹、舊木與歲月", "古树、旧木与岁月", "Ancient trees and age"), taste: { aged: 5, body: 4 } },
    ],
  },
  {
    id: "liquor",
    question: t("你直覺最想端起哪一杯？", "你直觉最想端起哪一杯？", "Which liquor colour do you instinctively reach for?"),
    options: [
      { id: "pale", label: t("淺綠清亮", "浅绿清亮", "Pale green"), taste: { fresh: 5, umami: 2 } },
      { id: "gold", label: t("金黃澄澈", "金黄澄澈", "Clear gold"), taste: { floral: 3, sweet: 4 } },
      { id: "amber", label: t("琥珀橙紅", "琥珀橙红", "Amber red"), taste: { sweet: 3, body: 4, roast: 2 } },
      { id: "deep", label: t("深橙紅、厚重", "深橙红、厚重", "Deep amber"), taste: { body: 5, aged: 4 } },
    ],
  },
  {
    id: "intensity",
    question: t("你能接受多強的苦、澀、辛與茶氣？", "你能接受多强的苦、涩、辛与茶气？", "How much bitterness, grip, spice or intensity do you enjoy?"),
    options: [
      { id: "soft", label: t("越柔越好", "越柔越好", "Keep it gentle"), taste: { sweet: 4, fresh: 3, body: 1 } },
      { id: "some", label: t("有一點才有層次", "有一点才有层次", "A little for structure"), taste: { body: 3, mineral: 2 } },
      { id: "strong", label: t("明顯一點更有趣", "明显一点更有趣", "Noticeable intensity"), taste: { body: 4, mineral: 4, roast: 2 } },
      { id: "very", label: t("越有衝擊越喜歡", "越有冲击越喜欢", "I like powerful tea"), taste: { body: 5, mineral: 5, aged: 3 } },
    ],
  },
  {
    id: "moment",
    question: t("你最想讓一杯茶帶來哪種狀態？", "你最想让一杯茶带来哪种状态？", "What mood do you want from a cup?"),
    options: [
      { id: "clear", label: t("清醒、乾淨、俐落", "清醒、干净、利落", "Clear and precise"), taste: { fresh: 5, umami: 2 } },
      { id: "fragrant", label: t("愉悅、香氣包圍", "愉悦、香气包围", "Fragrant and uplifting"), taste: { floral: 5, sweet: 3 } },
      { id: "warm", label: t("溫暖、放鬆、圓潤", "温暖、放松、圆润", "Warm and rounded"), taste: { sweet: 4, roast: 3, body: 3 } },
      { id: "deep", label: t("沉靜、專注、有儀式感", "沉静、专注、有仪式感", "Deep and ritual-like"), taste: { aged: 4, body: 4, mineral: 3 } },
    ],
  },
];

const AXES: TasteAxis[] = ["fresh", "floral", "roast", "smoke", "sweet", "mineral", "aged", "umami", "body"];

export function quizComplete(answers: TeaQuizAnswers): boolean {
  return TEA_QUIZ.every((q) => Boolean(answers[q.id]));
}

export function tasteFromQuiz(answers: TeaQuizAnswers): TasteVector | null {
  const sums = taste({});
  let count = 0;
  for (const q of TEA_QUIZ) {
    const option = q.options.find((candidate) => candidate.id === answers[q.id]);
    if (!option) continue;
    count += 1;
    for (const axis of AXES) sums[axis] += option.taste[axis] ?? 0;
  }
  if (!count) return null;
  const max = Math.max(...AXES.map((axis) => sums[axis]), 1);
  for (const axis of AXES) sums[axis] = (sums[axis] / max) * 5;
  return sums;
}

function cosineSimilarity(a: TasteVector, b: TasteVector): number {
  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (const axis of AXES) {
    dot += a[axis] * b[axis];
    aa += a[axis] * a[axis];
    bb += b[axis] * b[axis];
  }
  if (!aa || !bb) return 0;
  return dot / Math.sqrt(aa * bb);
}

function destinyFit(chart: Chart, profile: TeaProfile): number {
  const useful = chart.useful.length ? chart.useful : [chart.dayMasterElement];
  const usefulLoad = useful.reduce((sum, element) => sum + profile.elements[element], 0) / useful.length;
  const drain = chart.drain ?? [];
  const drainLoad = drain.length ? drain.reduce((sum, element) => sum + profile.elements[element], 0) / drain.length : 0;
  const usefulScore = Math.min(100, (usefulLoad / .40) * 100);
  const penalty = Math.min(22, (drainLoad / .35) * 22);
  return Math.max(0, Math.min(100, usefulScore - penalty));
}

function localizedElementList(elements: Element[], locale: AppLocale): string {
  if (!elements.length) return locale === "en" ? "the current chart balance" : "目前命局平衡";
  if (locale === "en") {
    const map: Record<Element, string> = { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" };
    return elements.map((e) => map[e]).join(" / ");
  }
  return elements.join("、");
}

function topTasteAxes(v: TasteVector, locale: AppLocale): string {
  const map: Record<TasteAxis, LocalizedText> = {
    fresh: t("清鮮", "清鲜", "freshness"), floral: t("花香", "花香", "floral aroma"), roast: t("焙火", "焙火", "roast"), smoke: t("煙香", "烟香", "smoke"),
    sweet: t("甜潤", "甜润", "sweetness"), mineral: t("岩礦感", "岩矿感", "mineral character"), aged: t("陳韻", "陈韵", "aged depth"), umami: t("旨味", "旨味", "umami"), body: t("厚度", "厚度", "body"),
  };
  return [...AXES].sort((a, b) => v[b] - v[a]).slice(0, 2).map((axis) => map[axis][locale]).join(locale === "en" ? " + " : "、");
}

function reasonFor(profile: TeaProfile, chart: Chart | null, preference: TasteVector | null, locale: AppLocale): string {
  const bits: string[] = [];
  if (chart) {
    const useful = chart.useful.length ? chart.useful : [chart.dayMasterElement];
    const elementText = localizedElementList(useful, locale);
    bits.push(locale === "en"
      ? `Symbolically, its tea profile aligns most closely with the chart's current ${elementText} support.`
      : locale === "zh-Hant"
        ? `命理象徵上，這款茶的五行氣質與目前命局較需要的${elementText}最接近。`
        : `命理象征上，这款茶的五行气质与目前命局较需要的${elementText}最接近。`);
  }
  if (preference) {
    const axes = topTasteAxes(preference, locale);
    bits.push(locale === "en"
      ? `Your quiz leans toward ${axes}, which this tea expresses strongly.`
      : locale === "zh-Hant"
        ? `你的口味答案偏向${axes}，而它正好把這兩項表現得很明顯。`
        : `你的口味答案偏向${axes}，而它正好把这两项表现得很明显。`);
  }
  bits.push(profile.traits[locale]);
  return bits.join(" ");
}

export function matchTeaGuardians(args: { chart?: Chart | null; answers?: TeaQuizAnswers | null; locale?: AppLocale; limit?: number }): TeaMatch[] {
  const locale = args.locale ?? "zh-Hans";
  const chart = args.chart ?? null;
  const preference = args.answers ? tasteFromQuiz(args.answers) : null;
  const limit = Math.max(1, Math.min(args.limit ?? 3, TEA_PROFILES.length));

  return TEA_PROFILES.map((profile) => {
    const destinyScore = chart ? destinyFit(chart, profile) : null;
    const tasteScore = preference ? Math.round(cosineSimilarity(preference, profile.taste) * 100) : null;
    let score: number;
    if (destinyScore !== null && tasteScore !== null) score = destinyScore * .62 + tasteScore * .38;
    else if (destinyScore !== null) score = destinyScore;
    else if (tasteScore !== null) score = tasteScore;
    else score = 0;
    return {
      tea: profile,
      score: Math.round(score),
      destinyScore: destinyScore === null ? null : Math.round(destinyScore),
      tasteScore,
      reason: reasonFor(profile, chart, preference, locale),
    };
  }).sort((a, b) => b.score - a.score || a.tea.id.localeCompare(b.tea.id)).slice(0, limit);
}

export function readTeaQuizAnswers(): TeaQuizAnswers {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TEA_QUIZ_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).filter(([, value]) => typeof value === "string")) as TeaQuizAnswers;
  } catch {
    return {};
  }
}

export function saveTeaQuizAnswers(answers: TeaQuizAnswers) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TEA_QUIZ_STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* local preference storage is optional */
  }
}
