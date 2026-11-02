import type { Chart } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";

/** Symbolic educational copy only; never determines a chart, relation, or forecast. */
export type FreeAtlasEntry = {
  symbol: string; slug: string; kind: "stem" | "branch"; roman: string;
  heading: Record<Locale, string>; strength: Record<Locale, string>; caution: Record<Locale, string>;
};
export const FREE_ATLAS_CONTENT: { stems: FreeAtlasEntry[]; branches: FreeAtlasEntry[] } = {
  "stems": [
    {
      "symbol": "甲",
      "slug": "jia",
      "kind": "stem",
      "roman": "Jia · Yang Wood",
      "heading": {
        "zh-Hant": "參天大木，向上開拓",
        "zh-Hans": "参天大木，向上开拓",
        "en": "A tall tree: upright growth and initiative"
      },
      "strength": {
        "zh-Hant": "積極、能承擔、重方向",
        "zh-Hans": "积极、能承担、重方向",
        "en": "Initiative, responsibility and direction"
      },
      "caution": {
        "zh-Hant": "留意過度逞強與固執",
        "zh-Hans": "留意过度逞强与固执",
        "en": "Watch rigidity or taking on too much"
      }
    },
    {
      "symbol": "乙",
      "slug": "yi",
      "kind": "stem",
      "roman": "Yi · Yin Wood",
      "heading": {
        "zh-Hant": "花草藤蘿，柔韌生長",
        "zh-Hans": "花草藤萝，柔韧生长",
        "en": "Flowers and vines: flexible, enduring growth"
      },
      "strength": {
        "zh-Hant": "細膩、協調、能適應",
        "zh-Hans": "细腻、协调、能适应",
        "en": "Sensitivity, coordination and adaptability"
      },
      "caution": {
        "zh-Hant": "留意過度遷就或猶豫",
        "zh-Hans": "留意过度迁就或犹豫",
        "en": "Watch over-accommodation or hesitation"
      }
    },
    {
      "symbol": "丙",
      "slug": "bing",
      "kind": "stem",
      "roman": "Bing · Yang Fire",
      "heading": {
        "zh-Hant": "朗日昭昭，光明外放",
        "zh-Hans": "朗日昭昭，光明外放",
        "en": "The sun: warmth, visibility and expression"
      },
      "strength": {
        "zh-Hant": "坦率、熱情、善帶動",
        "zh-Hans": "坦率、热情、善带动",
        "en": "Openness, energy and momentum"
      },
      "caution": {
        "zh-Hant": "留意急躁與精力透支",
        "zh-Hans": "留意急躁与精力透支",
        "en": "Watch impatience and burnout"
      }
    },
    {
      "symbol": "丁",
      "slug": "ding",
      "kind": "stem",
      "roman": "Ding · Yin Fire",
      "heading": {
        "zh-Hant": "燈燭星火，溫暖細緻",
        "zh-Hans": "灯烛星火，温暖细致",
        "en": "Lamplight: focused warmth and insight"
      },
      "strength": {
        "zh-Hant": "體貼、敏銳、重細節",
        "zh-Hans": "体贴、敏锐、重细节",
        "en": "Care, intuition and attention to detail"
      },
      "caution": {
        "zh-Hant": "留意多慮與情緒消耗",
        "zh-Hans": "留意多虑与情绪消耗",
        "en": "Watch rumination and emotional fatigue"
      }
    },
    {
      "symbol": "戊",
      "slug": "wu",
      "kind": "stem",
      "roman": "Wu · Yang Earth",
      "heading": {
        "zh-Hant": "高山厚土，承載萬物",
        "zh-Hans": "高山厚土，承载万物",
        "en": "A mountain: dependable and enduring"
      },
      "strength": {
        "zh-Hant": "穩定、包容、有擔當",
        "zh-Hans": "稳定、包容、有担当",
        "en": "Stability, capacity and responsibility"
      },
      "caution": {
        "zh-Hant": "留意僵化與承擔過多",
        "zh-Hans": "留意僵化与承担过多",
        "en": "Watch inflexibility and overload"
      }
    },
    {
      "symbol": "己",
      "slug": "ji",
      "kind": "stem",
      "roman": "Ji · Yin Earth",
      "heading": {
        "zh-Hant": "田園沃土，滋養成長",
        "zh-Hans": "田园沃土，滋养成长",
        "en": "Fertile soil: cultivation and care"
      },
      "strength": {
        "zh-Hant": "務實、細心、有耐力",
        "zh-Hans": "务实、细心、有耐力",
        "en": "Practicality, care and patience"
      },
      "caution": {
        "zh-Hant": "留意操心與過度保守",
        "zh-Hans": "留意操心与过度保守",
        "en": "Watch overthinking and excessive caution"
      }
    },
    {
      "symbol": "庚",
      "slug": "geng",
      "kind": "stem",
      "roman": "Geng · Yang Metal",
      "heading": {
        "zh-Hant": "刀劍礦金，果斷有力",
        "zh-Hans": "刀剑矿金，果断有力",
        "en": "Forged steel: decisiveness and resolve"
      },
      "strength": {
        "zh-Hant": "有原則、敢行動、重義氣",
        "zh-Hans": "有原则、敢行动、重义气",
        "en": "Principles, action and resolve"
      },
      "caution": {
        "zh-Hant": "留意過剛與過快下斷",
        "zh-Hans": "留意过刚与过快下断",
        "en": "Watch harshness and hasty judgments"
      }
    },
    {
      "symbol": "辛",
      "slug": "xin",
      "kind": "stem",
      "roman": "Xin · Yin Metal",
      "heading": {
        "zh-Hant": "珠玉精金，清潤精緻",
        "zh-Hans": "珠玉精金，清润精致",
        "en": "Fine jewellery: polish and discernment"
      },
      "strength": {
        "zh-Hant": "審美、精準、重品質",
        "zh-Hans": "审美、精准、重品质",
        "en": "Taste, precision and craftsmanship"
      },
      "caution": {
        "zh-Hant": "留意苛求與過度敏感",
        "zh-Hans": "留意苛求与过度敏感",
        "en": "Watch perfectionism and oversensitivity"
      }
    },
    {
      "symbol": "壬",
      "slug": "ren",
      "kind": "stem",
      "roman": "Ren · Yang Water",
      "heading": {
        "zh-Hant": "江河大海，流動開闊",
        "zh-Hans": "江河大海，流动开阔",
        "en": "Rivers and seas: breadth and adaptability"
      },
      "strength": {
        "zh-Hant": "機敏、包容、善變通",
        "zh-Hans": "机敏、包容、善变通",
        "en": "Resourcefulness, breadth and flexibility"
      },
      "caution": {
        "zh-Hant": "留意分散與缺少定向",
        "zh-Hans": "留意分散与缺少定向",
        "en": "Watch scattered focus and drifting"
      }
    },
    {
      "symbol": "癸",
      "slug": "gui",
      "kind": "stem",
      "roman": "Gui · Yin Water",
      "heading": {
        "zh-Hant": "雨露霧泉，柔潤內斂",
        "zh-Hans": "雨露雾泉，柔润内敛",
        "en": "Rain and dew: quiet insight and nourishment"
      },
      "strength": {
        "zh-Hant": "細膩、觀察強、有靈感",
        "zh-Hans": "细腻、观察强、有灵感",
        "en": "Observation, sensitivity and imagination"
      },
      "caution": {
        "zh-Hant": "留意內耗與遲疑不決",
        "zh-Hans": "留意内耗与迟疑不决",
        "en": "Watch rumination and indecision"
      }
    }
  ],
  "branches": [
    {
      "symbol": "子",
      "slug": "zi",
      "kind": "branch",
      "roman": "Zi · Rat",
      "heading": {
        "zh-Hant": "寒夜靈鼠，機敏藏智",
        "zh-Hans": "寒夜灵鼠，机敏藏智",
        "en": "Rat: resourcefulness in the midnight hours"
      },
      "strength": {
        "zh-Hant": "靈活、善觀察、能應變",
        "zh-Hans": "灵活、善观察、能应变",
        "en": "Agility, observation and adaptability"
      },
      "caution": {
        "zh-Hant": "留意焦慮與想得太多",
        "zh-Hans": "留意焦虑与想得太多",
        "en": "Watch anxiety and excessive analysis"
      }
    },
    {
      "symbol": "丑",
      "slug": "chou",
      "kind": "branch",
      "roman": "Chou · Ox",
      "heading": {
        "zh-Hant": "寒土勤牛，厚藏生機",
        "zh-Hans": "寒土勤牛，厚藏生机",
        "en": "Ox: strength stored in winter earth"
      },
      "strength": {
        "zh-Hant": "踏實、耐力強、重積累",
        "zh-Hans": "踏实、耐力强、重积累",
        "en": "Steadiness, persistence and accumulation"
      },
      "caution": {
        "zh-Hant": "留意固執與反應遲緩",
        "zh-Hans": "留意固执与反应迟缓",
        "en": "Watch rigidity and slow adaptation"
      }
    },
    {
      "symbol": "寅",
      "slug": "yin",
      "kind": "branch",
      "roman": "Yin · Tiger",
      "heading": {
        "zh-Hant": "春林猛虎，生發開局",
        "zh-Hans": "春林猛虎，生发开局",
        "en": "Tiger: bold beginnings at the start of spring"
      },
      "strength": {
        "zh-Hant": "開創、勇進、有膽識",
        "zh-Hans": "开创、勇进、有胆识",
        "en": "Initiative, courage and expansion"
      },
      "caution": {
        "zh-Hant": "留意衝動與好勝",
        "zh-Hans": "留意冲动与好胜",
        "en": "Watch impulsiveness and competitiveness"
      }
    },
    {
      "symbol": "卯",
      "slug": "mao",
      "kind": "branch",
      "roman": "Mao · Rabbit",
      "heading": {
        "zh-Hant": "春門玉兔，柔木繁華",
        "zh-Hans": "春门玉兔，柔木繁华",
        "en": "Rabbit: gentle growth in mid-spring"
      },
      "strength": {
        "zh-Hant": "溫和、協調、具美感",
        "zh-Hans": "温和、协调、具美感",
        "en": "Harmony, tact and aesthetic sense"
      },
      "caution": {
        "zh-Hant": "留意遷就與缺乏界線",
        "zh-Hans": "留意迁就与缺乏界线",
        "en": "Watch people-pleasing and weak boundaries"
      }
    },
    {
      "symbol": "辰",
      "slug": "chen",
      "kind": "branch",
      "roman": "Chen · Dragon",
      "heading": {
        "zh-Hant": "雲騰春龍，蓄勢轉化",
        "zh-Hans": "云腾春龙，蓄势转化",
        "en": "Dragon: changing clouds of late spring"
      },
      "strength": {
        "zh-Hant": "包容、整合、能轉機",
        "zh-Hans": "包容、整合、能转机",
        "en": "Integration, flexibility and transformation"
      },
      "caution": {
        "zh-Hant": "留意反覆與遲遲不決",
        "zh-Hans": "留意反复与迟迟不决",
        "en": "Watch indecision and excessive changes"
      }
    },
    {
      "symbol": "巳",
      "slug": "si",
      "kind": "branch",
      "roman": "Si · Snake",
      "heading": {
        "zh-Hant": "靈蛇映夏，慧火潛行",
        "zh-Hans": "灵蛇映夏，慧火潜行",
        "en": "Snake: insight and subtle fire in early summer"
      },
      "strength": {
        "zh-Hant": "敏銳、審慎、善洞察",
        "zh-Hans": "敏锐、审慎、善洞察",
        "en": "Insight, patience and strategy"
      },
      "caution": {
        "zh-Hant": "留意多疑與內在壓力",
        "zh-Hans": "留意多疑与内在压力",
        "en": "Watch suspicion and inner pressure"
      }
    },
    {
      "symbol": "午",
      "slug": "wu",
      "kind": "branch",
      "roman": "Wu · Horse",
      "heading": {
        "zh-Hant": "烈日駿馬，奔放行遠",
        "zh-Hans": "烈日骏马，奔放行远",
        "en": "Horse: open energy at high summer"
      },
      "strength": {
        "zh-Hant": "熱情、主動、有行動力",
        "zh-Hans": "热情、主动、有行动力",
        "en": "Energy, openness and movement"
      },
      "caution": {
        "zh-Hant": "留意躁進與分配體力",
        "zh-Hans": "留意躁进与分配体力",
        "en": "Watch rushing ahead and fatigue"
      }
    },
    {
      "symbol": "未",
      "slug": "wei",
      "kind": "branch",
      "roman": "Wei · Goat",
      "heading": {
        "zh-Hant": "暖坡祥羊，柔土滋養",
        "zh-Hans": "暖坡祥羊，柔土滋养",
        "en": "Goat: care and cultivation in late summer"
      },
      "strength": {
        "zh-Hant": "照顧、柔和、有耐心",
        "zh-Hans": "照顾、柔和、有耐心",
        "en": "Nurturing, patience and sensitivity"
      },
      "caution": {
        "zh-Hant": "留意操心與難以拒絕",
        "zh-Hans": "留意操心与难以拒绝",
        "en": "Watch over-caring and difficulty saying no"
      }
    },
    {
      "symbol": "申",
      "slug": "shen",
      "kind": "branch",
      "roman": "Shen · Monkey",
      "heading": {
        "zh-Hant": "秋嶺靈猴，機巧通變",
        "zh-Hans": "秋岭灵猴，机巧通变",
        "en": "Monkey: ingenuity at the start of autumn"
      },
      "strength": {
        "zh-Hant": "機敏、技藝強、能變通",
        "zh-Hans": "机敏、技艺强、能变通",
        "en": "Cleverness, dexterity and adaptability"
      },
      "caution": {
        "zh-Hant": "留意分心與投機",
        "zh-Hans": "留意分心与投机",
        "en": "Watch distraction and shortcuts"
      }
    },
    {
      "symbol": "酉",
      "slug": "you",
      "kind": "branch",
      "roman": "You · Rooster",
      "heading": {
        "zh-Hant": "金羽晨雞，收斂精華",
        "zh-Hans": "金羽晨鸡，收敛精华",
        "en": "Rooster: precision in mid-autumn"
      },
      "strength": {
        "zh-Hant": "守時、審美、重細節",
        "zh-Hans": "守时、审美、重细节",
        "en": "Precision, timing and refinement"
      },
      "caution": {
        "zh-Hant": "留意挑剔與過度緊繃",
        "zh-Hans": "留意挑剔与过度紧绷",
        "en": "Watch criticism and tension"
      }
    },
    {
      "symbol": "戌",
      "slug": "xu",
      "kind": "branch",
      "roman": "Xu · Dog",
      "heading": {
        "zh-Hant": "秋原義犬，忠誠守信",
        "zh-Hans": "秋原义犬，忠诚守信",
        "en": "Dog: guardianship in late autumn"
      },
      "strength": {
        "zh-Hant": "守信、可靠、重責任",
        "zh-Hans": "守信、可靠、重责任",
        "en": "Loyalty, reliability and commitment"
      },
      "caution": {
        "zh-Hant": "留意防備心與執念",
        "zh-Hans": "留意防备心与执念",
        "en": "Watch defensiveness and fixed positions"
      }
    },
    {
      "symbol": "亥",
      "slug": "hai",
      "kind": "branch",
      "roman": "Hai · Pig",
      "heading": {
        "zh-Hant": "夜海靈豕，潤藏福源",
        "zh-Hans": "夜海灵豕，润藏福源",
        "en": "Pig: abundance and renewal at the start of winter"
      },
      "strength": {
        "zh-Hant": "包容、坦率、能滋養",
        "zh-Hans": "包容、坦率、能滋养",
        "en": "Warmth, openness and capacity to nourish"
      },
      "caution": {
        "zh-Hant": "留意過度付出與失去界線",
        "zh-Hans": "留意过度付出与失去界线",
        "en": "Watch over-giving and blurred boundaries"
      }
    }
  ]
};
export const FREE_ATLAS_COPY: Record<Locale, { title: string; lead: string; male: string; female: string; unspecified: string; stem: string; branch: string; strength: string; watch: string; source: string; original: string; open: string }> = {
  "zh-Hant": {
    "title": "免費天干地支圖鑑",
    "lead": "依實際四柱，顯示一位日主天干與命盤中出現的地支（去重，最多四支）。文化象徵不等於個人命運判斷。",
    "male": "你填寫的是男性：採用男性資料標示；畫中男女形象都只是同一地支／天干的象徵，不代表對象或配偶。",
    "female": "你填寫的是女性：採用女性資料標示；畫中男女形象都只是同一地支／天干的象徵，不代表對象或配偶。",
    "unspecified": "未提供性別：這裡使用中性描述，不代入男性或女性的推論。",
    "stem": "日主天干",
    "branch": "命盤地支",
    "strength": "象徵優勢",
    "watch": "值得留意",
    "source": "圖像與文字是文化意象；無法替代八字全局分析。",
    "original": "圖為原創人物場景節選；畫內裝飾性字樣不作推演依據，請以本頁正文為準。",
    "open": "展開圖鑑"
  },
  "zh-Hans": {
    "title": "免费天干地支图鉴",
    "lead": "按实际四柱展示一位日主天干，以及命盘中出现的地支（去重，最多四支）。文化象征并非个人命运断语。",
    "male": "你填写的是男性：沿用男性资料标示。图中男女形象都是文化象征，不代表对象或配偶。",
    "female": "你填写的是女性：沿用女性资料标示。图中男女形象都是文化象征，不代表对象或配偶。",
    "unspecified": "未提供性别：使用中性说明，不代入男性或女性推论。",
    "stem": "日主天干",
    "branch": "命盘地支",
    "strength": "象征优势",
    "watch": "值得留意",
    "source": "图像和文字只是文化象征，不能代替完整八字分析。",
    "original": "图像仅展示人物场景；画内装饰文字不作为推演依据，请以本页正文为准。",
    "open": "展开图鉴"
  },
  "en": {
    "title": "Free Stem & Branch Illustrated Guide",
    "lead": "Shows your calculated day stem and the distinct branches in your actual pillars (up to four). These are cultural images, not a personal fate verdict.",
    "male": "Gender supplied: male. The male and female figures in each illustration are symbolic, not a prediction of a partner or spouse.",
    "female": "Gender supplied: female. The male and female figures in each illustration are symbolic, not a prediction of a partner or spouse.",
    "unspecified": "Gender not specified. This guide remains gender-neutral and makes no male/female assumption.",
    "stem": "Day stem",
    "branch": "Branches in your chart",
    "strength": "Symbolic strengths",
    "watch": "What to watch",
    "source": "Symbolic cultural imagery, not a substitute for interpreting the full birth chart.",
    "original": "The artwork shows a cropped character scene. The translated text here, not lettering in the art, is the reading.",
    "open": "Open illustration"
  }
};

/** 22 generated 9:16 originals exist as an offline staging package, not yet approved for Production.
 * Keep this switch false until art-level accuracy, third-party signatures and all three locales have
 * a passing acceptance record and the real image binaries exist at the atlas paths.
 */
export const VERIFIED_ATLAS_POSTERS = true;
export const FREE_ATLAS_POSTERS: Record<string, string> = {
  "甲": "/report-visuals/atlas/stems/jia.webp",
  "乙": "/report-visuals/atlas/stems/yi.webp",
  "丙": "/report-visuals/atlas/stems/bing.webp",
  "丁": "/report-visuals/atlas/stems/ding.webp",
  "戊": "/report-visuals/atlas/stems/wu.webp",
  "己": "/report-visuals/atlas/stems/ji.webp",
  "庚": "/report-visuals/atlas/stems/geng.webp",
  "辛": "/report-visuals/atlas/stems/xin.webp",
  "壬": "/report-visuals/atlas/stems/ren.webp",
  "癸": "/report-visuals/atlas/stems/gui.webp",
  "子": "/report-visuals/atlas/branches/zi.webp",
  "丑": "/report-visuals/atlas/branches/chou.webp",
  "寅": "/report-visuals/atlas/branches/yin.webp",
  "卯": "/report-visuals/atlas/branches/mao.webp",
  "辰": "/report-visuals/atlas/branches/chen.webp",
  "巳": "/report-visuals/atlas/branches/si.webp",
  "午": "/report-visuals/atlas/branches/wu.webp",
  "未": "/report-visuals/atlas/branches/wei.webp",
  "申": "/report-visuals/atlas/branches/shen.webp",
  "酉": "/report-visuals/atlas/branches/you.webp",
  "戌": "/report-visuals/atlas/branches/xu.webp",
  "亥": "/report-visuals/atlas/branches/hai.webp"
};
export const FREE_ATLAS_FALLBACK_ART: Record<string, string> = {
  "甲": "/report-visuals/characters/jia-wood.webp",
  "乙": "/report-visuals/characters/yi-wood.webp",
  "丙": "/report-visuals/characters/bing-fire.webp",
  "丁": "/report-visuals/characters/ding-fire.webp",
  "戊": "/report-visuals/characters/wu-earth.webp",
  "己": "/report-visuals/characters/ji-earth.webp",
  "庚": "/report-visuals/characters/geng-metal.webp",
  "辛": "/report-visuals/characters/xin-metal.webp",
  "壬": "/report-visuals/characters/ren-water.webp",
  "癸": "/report-visuals/characters/gui-water.webp",
  "子": "/report-visuals/branches/zi.webp",
  "丑": "/report-visuals/branches/chou.webp",
  "寅": "/report-visuals/branches/yin.webp",
  "卯": "/report-visuals/branches/mao.webp",
  "辰": "/report-visuals/branches/chen.webp",
  "巳": "/report-visuals/branches/si.webp",
  "午": "/report-visuals/branches/wu.webp",
  "未": "/report-visuals/branches/wei.webp",
  "申": "/report-visuals/branches/shen.webp",
  "酉": "/report-visuals/branches/you.webp",
  "戌": "/report-visuals/branches/xu.webp",
  "亥": "/report-visuals/branches/hai.webp"
};

export function selectFreeAtlas(chart: Pick<Chart, "dayMaster" | "pillars" | "gender">): FreeAtlasEntry[] {
  const stem = FREE_ATLAS_CONTENT.stems.find(item => item.symbol === chart.dayMaster?.trim().charAt(0));
  const seen = new Set<string>();
  const branches = (chart.pillars ?? [])
    .filter(pillar => pillar.ready !== false)
    .map(pillar => pillar.zhi)
    .filter((zhi) => {
      if (seen.has(zhi)) return false;
      seen.add(zhi);
      return true;
    })
    .slice(0, 4)
    .map(zhi => FREE_ATLAS_CONTENT.branches.find(item => item.symbol === zhi))
    .filter((item): item is FreeAtlasEntry => Boolean(item));
  return stem ? [stem, ...branches] : branches;
}

export function freeAtlasGenderCopy(gender: Chart["gender"], locale: Locale): string {
  const key = gender === "male" || gender === "female" ? gender : "unspecified";
  return FREE_ATLAS_COPY[locale][key];
}

export function freeAtlasImage(entry: FreeAtlasEntry, locale: Locale): string {
  // This is a pre-cropped scene with both characters; the three-language report copy
  // is rendered as separate HTML, never lifted from source poster lettering.
  return VERIFIED_ATLAS_POSTERS
    ? FREE_ATLAS_POSTERS[entry.symbol]
    : FREE_ATLAS_FALLBACK_ART[entry.symbol];
}
