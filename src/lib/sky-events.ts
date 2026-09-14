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
    id: "saturn-opposition-2026",
    published: "2026-09-15",
    status: "upcoming",
    title: {
      "zh-Hant": "土星衝｜當人生的舊結構，再也無法靠修補維持",
      "zh-Hans": "土星冲｜当人生的旧结构，再也无法靠修补维持",
      en: "Saturn at opposition | When the old structure can no longer be patched"
    },
    subtitle: {
      "zh-Hant": "2026.10.04｜天文現象 × 土星逆行白羊的占星象意",
      "zh-Hans": "2026.10.04｜天文现象 × 土星逆行白羊的占星象意",
      en: "2026.10.04 | Astronomy × the symbolic astrology of Saturn retrograde in Aries"
    },
    facts: [
      { date: "2026-02-13", label: { "zh-Hant": "土星再次進入熱帶黃道白羊座", "zh-Hans": "土星再次进入热带黄道白羊座", en: "Saturn re-enters tropical Aries" } },
      { date: "2026-02-20", label: { "zh-Hant": "土星與海王星於白羊約 0°45′合相", "zh-Hans": "土星与海王星于白羊约 0°45′合相", en: "Saturn conjuncts Neptune near 0°45′ Aries" } },
      { date: "2026-07-26", label: { "zh-Hant": "土星於白羊約 14°45′開始視逆行", "zh-Hans": "土星于白羊约 14°45′开始视逆行", en: "Saturn stations retrograde near 14°45′ Aries" } },
      { date: "2026-08-31", label: { "zh-Hant": "土星與木星形成三分相", "zh-Hans": "土星与木星形成三分相", en: "Saturn forms a trine with Jupiter" } },
      { date: "2026-10-04", label: { "zh-Hant": "土星衝；悉尼約 23:21 AEDT，接近全年最佳觀測期", "zh-Hans": "土星冲；悉尼约 23:21 AEDT，接近全年最佳观测期", en: "Saturn reaches opposition; about 23:21 AEDT in Sydney, near its best observing period of the year" } },
      { date: "2026-12-10", label: { "zh-Hant": "土星於白羊約 7°56′恢復順行", "zh-Hans": "土星于白羊约 7°56′恢复顺行", en: "Saturn stations direct near 7°56′ Aries" } }
    ],
    science: {
      "zh-Hant": [
        "「土星衝」是可驗證的天文幾何事件：從地球看，土星位於接近太陽正對面的天空方向，地球大致位於太陽與土星之間。",
        "衝日前後土星接近本年度距離地球最近、視直徑較大與亮度較高的觀測階段，視星等約 0.3，幾乎整夜可見。",
        "「土星在白羊座」在本站占星語境指熱帶黃道座標；逆行是地球觀測造成的視運動現象，不代表土星真的倒著繞太陽。"
      ],
      "zh-Hans": [
        "“土星冲”是可验证的天文几何事件：从地球看，土星位于接近太阳正对面的天空方向，地球大致位于太阳与土星之间。",
        "冲日前后土星接近本年度距离地球最近、视直径较大与亮度较高的观测阶段，视星等约 0.3，几乎整夜可见。",
        "“土星在白羊座”在本站占星语境指热带黄道坐标；逆行是地球观测造成的视运动现象，不代表土星真的倒着绕太阳。"
      ],
      en: [
        "Saturn at opposition is a verifiable astronomical geometry: from Earth, Saturn appears nearly opposite the Sun in the sky, with Earth roughly between the Sun and Saturn.",
        "Around opposition Saturn is near its closest, largest-looking and brightest observing phase of the year, around magnitude 0.3, and is visible for almost the whole night.",
        "‘Saturn in Aries’ here refers to the tropical-zodiac coordinate convention. Retrograde is apparent motion as seen from Earth, not Saturn literally orbiting backwards."
      ]
    },
    interpretation: {
      "zh-Hant": [
        "占星傳統把土星與結構、責任、界線、時間、限制、承諾及長期建設聯繫；白羊座則涉及開始、主體性、行動與自我意志。",
        "把兩者放在一起，可作為一個象徵性提問：你正在維持的人生，是自己真正選擇的，還是照著別人留下的藍圖繼續施工？",
        "土星逆行更適合被理解成回顧既有結構，而不是預告懲罰。重點是辨認哪些問題只是換了外殼，底層選擇模式卻沒有改。"
      ],
      "zh-Hans": [
        "占星传统把土星与结构、责任、界线、时间、限制、承诺及长期建设联系；白羊座则涉及开始、主体性、行动与自我意志。",
        "把两者放在一起，可作为一个象征性提问：你正在维持的人生，是自己真正选择的，还是照着别人留下的蓝图继续施工？",
        "土星逆行更适合被理解成回顾既有结构，而不是预告惩罚。重点是辨认哪些问题只是换了外壳，底层选择模式却没有改。"
      ],
      en: [
        "Astrological tradition links Saturn with structure, responsibility, boundaries, time, limits, commitments and long-term construction; Aries with initiation, agency, action and personal will.",
        "Together they offer a symbolic question: is the life you are maintaining genuinely chosen by you, or are you still building from a blueprint inherited from someone else?",
        "Saturn retrograde is more useful here as a symbol for reviewing existing structures than as a prediction of punishment. The key is to notice problems whose surface changed while the underlying choice pattern did not."
      ]
    },
    houses: [],
    sources: [
      { label: "In-The-Sky.org · Saturn at opposition 2026", url: "https://in-the-sky.org/news.php?id=20261004_12_100" },
      { label: "Cafe Astrology · Saturn in Aries transit", url: "https://cafeastrology.com/saturn-aries-transit.html" },
      { label: "Cafe Astrology · Astrology of 2026", url: "https://cafeastrology.com/astrology-of-2026.html" },
      { label: "Cafe Astrology · Saturn retrograde 2026", url: "https://cafeastrology.com/events/saturn-turns-retrograde-in-aries-2026/" }
    ]
  },
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
