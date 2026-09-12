export type SkyEvent = {
  id: string;
  published: string;
  title: { "zh-Hant": string; "zh-Hans": string; en: string };
  subtitle: { "zh-Hant": string; "zh-Hans": string; en: string };
  status: "active" | "upcoming" | "archive";
  facts: Array<{ date: string; label: { "zh-Hant": string; "zh-Hans": string; en: string } }>;
  science: { "zh-Hant": string[]; "zh-Hans": string[]; en: string[] };
  interpretation: { "zh-Hant": string[]; "zh-Hans": string[]; en: string[] };
  houses: Array<{ house: number; "zh-Hant": string; "zh-Hans": string; en: string }>;
  sources: Array<{ label: string; url: string }>;
};

export const SKY_EVENTS: SkyEvent[] = [
  {
    id: "venus-scorpio-2026",
    published: "2026-09-12",
    status: "active",
    title: { "zh-Hant": "金星進天蠍：四個月的深度循環", "zh-Hans": "金星进天蝎：四个月的深度循环", en: "Venus in Scorpio: a four-month depth cycle" },
    subtitle: { "zh-Hant": "天文實況與星象解讀分層呈現", "zh-Hans": "天文实况与星象解读分层呈现", en: "Astronomical facts and astrological interpretation, clearly separated" },
    facts: [
      { date: "2026-09-10", label: { "zh-Hant": "金星進入熱帶黃道天蠍區段", "zh-Hans": "金星进入热带黄道天蝎区段", en: "Venus enters tropical Scorpio" } },
      { date: "2026-10-03", label: { "zh-Hant": "金星於天蠍 8°30′附近視逆行停駐", "zh-Hans": "金星于天蝎 8°30′附近视逆行停驻", en: "Venus stations retrograde near 8°30′ Scorpio" } },
      { date: "2026-10-25", label: { "zh-Hant": "逆行退回天秤", "zh-Hans": "逆行退回天秤", en: "Retrogrades back into Libra" } },
      { date: "2026-11-13", label: { "zh-Hant": "於天秤 22°52′附近恢復順行", "zh-Hans": "于天秤 22°52′附近恢复顺行", en: "Stations direct near 22°52′ Libra" } },
      { date: "2026-12-04", label: { "zh-Hant": "再次進入天蠍", "zh-Hans": "再次进入天蝎", en: "Re-enters Scorpio" } },
      { date: "2026-12-15", label: { "zh-Hant": "離開本次逆行後陰影區", "zh-Hans": "离开本次逆行后阴影区", en: "Leaves the post-retrograde shadow zone" } },
      { date: "2027-01-07", label: { "zh-Hant": "離開天蠍、進入射手", "zh-Hans": "离开天蝎、进入射手", en: "Leaves Scorpio and enters Sagittarius" } }
    ],
    science: {
      "zh-Hant": [
        "「進入某星座」在這裡是熱帶黃道座標的分區描述；它不是說金星物理上進入同名恆星星座。",
        "「逆行」是從地球觀測造成的視運動反轉，不代表金星真正倒著繞太陽。",
        "本站天文層只發布可由星曆、視黃經、停駐時刻、食相或觀測資料驗證的事件。"
      ],
      "zh-Hans": [
        "“进入某星座”在这里是热带黄道坐标的分区描述；不是说金星物理上进入同名恒星星座。",
        "“逆行”是从地球观测造成的视运动反转，不代表金星真正倒着绕太阳。",
        "本站天文层只发布可由星历、视黄经、停驻时刻、食相或观测资料验证的事件。"
      ],
      en: [
        "A sign ingress here is a tropical-zodiac coordinate convention, not a claim that Venus physically enters the matching IAU constellation.",
        "Retrograde motion is an apparent reversal seen from Earth; Venus does not literally orbit the Sun backwards.",
        "The astronomy layer publishes only events that can be checked against ephemerides, apparent longitude, station times, eclipse geometry, or observing data."
      ]
    },
    interpretation: {
      "zh-Hant": [
        "占星象徵層的主題集中在價值、關係、信任、慾望、共享資源與界線。",
        "逆行段適合回看反覆出現的關係模式與價值選擇；這是傳統占星的象徵性閱讀，不是科學因果結論。",
        "判讀時先看天蠍落入本命第幾宮，再看金星與本命行星形成的精確相位。"
      ],
      "zh-Hans": [
        "占星象征层的主题集中在价值、关系、信任、欲望、共享资源与界线。",
        "逆行段适合回看反复出现的关系模式与价值选择；这是传统占星的象征性阅读，不是科学因果结论。",
        "判断时先看天蝎落入本命第几宫，再看金星与本命行星形成的精确相位。"
      ],
      en: [
        "The symbolic astrology layer focuses on values, relationships, trust, desire, shared resources, and boundaries.",
        "The retrograde phase is traditionally used to revisit recurring relationship and value patterns; this is symbolic interpretation, not a scientific causal claim.",
        "For personal reading, first locate Scorpio by natal house, then check exact aspects from transiting Venus to natal planets."
      ]
    },
    houses: [
      { house: 1, "zh-Hant": "自我形象、身體感、被看見的方式", "zh-Hans": "自我形象、身体感、被看见的方式", en: "identity, body image, visibility" },
      { house: 2, "zh-Hant": "收入、價碼、自我價值與付出", "zh-Hans": "收入、价码、自我价值与付出", en: "money, pricing, self-worth" },
      { house: 3, "zh-Hant": "訊息、對話、手足與近距離關係", "zh-Hans": "讯息、对话、手足与近距离关系", en: "messages, conversations, siblings" },
      { house: 4, "zh-Hant": "家、同住、根源與家庭模式", "zh-Hans": "家、同住、根源与家庭模式", en: "home, roots, family patterns" },
      { house: 5, "zh-Hant": "戀愛、吸引力、性、創作與子女", "zh-Hans": "恋爱、吸引力、性、创作与子女", en: "romance, attraction, creativity, children" },
      { house: 6, "zh-Hant": "日常、工作協作、照顧與身體節律", "zh-Hans": "日常、工作协作、照顾与身体节律", en: "routine, work, care, body rhythms" },
      { house: 7, "zh-Hant": "伴侶、合約、談判與關係定義", "zh-Hans": "伴侣、合约、谈判与关系定义", en: "partners, contracts, negotiation" },
      { house: 8, "zh-Hant": "共有財務、債務、性、依賴與排他性", "zh-Hans": "共有财务、债务、性、依赖与排他性", en: "shared money, debt, intimacy, dependency" },
      { house: 9, "zh-Hant": "世界觀、遠行、跨文化與共同方向", "zh-Hans": "世界观、远行、跨文化与共同方向", en: "worldview, travel, cross-cultural direction" },
      { house: 10, "zh-Hant": "事業、公開身分、上司客戶與結盟", "zh-Hans": "事业、公开身份、上司客户与结盟", en: "career, public identity, alliances" },
      { house: 11, "zh-Hant": "朋友、群體位置與未來藍圖", "zh-Hans": "朋友、群体位置与未来蓝图", en: "friends, groups, future plans" },
      { house: 12, "zh-Hant": "隱藏情緒、獨處、未說出口的關係", "zh-Hans": "隐藏情绪、独处、未说出口的关系", en: "private feelings, solitude, unspoken bonds" }
    ],
    sources: [
      { label: "NASA/JPL Horizons", url: "https://ssd.jpl.nasa.gov/horizons/" },
      { label: "Swiss Ephemeris", url: "https://www.astro.com/swisseph/" },
      { label: "2026 Venus station cross-check", url: "https://cafeastrology.com/retrogrades.html" }
    ]
  }
];

export const SKY_EVENT_CATEGORIES = [
  "行星換座 / Planetary ingress",
  "逆行、順行與停駐 / Stations",
  "重要相位 / Major aspects",
  "新月、滿月、日月食 / Lunations & eclipses",
  "行星合月、合相與觀測事件 / Conjunctions & observing events",
  "流星雨、彗星與特殊可見天象 / Meteor showers, comets & visible phenomena"
] as const;
