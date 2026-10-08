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
    "id": "moon-occults-jupiter-2026-10-06",
    "published": "2026-10-08",
    "status": "active",
    "title": {
      "zh-Hant": "月掩木星：情緒衝擊擴張力",
      "zh-Hans": "月掩木星：情绪冲击扩张力",
      "en": "Moon Occults Jupiter: Emotional Surge Meets Expansion"
    },
    "subtitle": {
      "zh-Hant": "2026.10.06｜月球遮掩木星，本週天象精選",
      "zh-Hans": "2026.10.06｜月球遮掩木星，本周天象精选",
      "en": "6 Oct 2026 | Moon occults Jupiter — weekly sky highlight"
    },
    "facts": [
      {
        "date": "2026-10-06",
        "label": {
          "zh-Hant": "月球於金牛座遮掩木星（悉尼可見）",
          "zh-Hans": "月球于金牛座遮掩木星（悉尼可见）",
          "en": "Moon occults Jupiter in Taurus (visible from Sydney)"
        }
      }
    ],
    "science": {
      "zh-Hant": [
        "月掩木星：月球在軌道上行進時，從地球觀測角度恰好遮蔽木星的天文現象。",
        "此次遮掩發生於熱帶黃道金牛座區段，木星約位於金牛22°附近。",
        "遮掩持續時間依觀測地點而異，悉尼地區可觀察到完整遮掩過程。"
      ],
      "zh-Hans": [
        "月掩木星：月球在轨道上行进时，从地球观测角度恰好遮蔽木星的天文现象。",
        "此次遮掩发生于热带黄道金牛座区段，木星约位于金牛22°附近。",
        "遮掩持续时间依观测地点而异，悉尼地区可观察到完整遮掩过程。"
      ],
      "en": [
        "A lunar occultation of Jupiter occurs when the Moon passes directly in front of Jupiter as seen from Earth.",
        "This occultation takes place in tropical Taurus, with Jupiter near 22° Taurus.",
        "Duration varies by location; Sydney observers can witness the full ingress and egress."
      ]
    },
    "interpretation": {
      "zh-Hant": [
        "月亮象徵情緒、直覺與本能需求；木星象徵擴張、信念與成長衝動。",
        "月掩木星的象意：情緒浪潮短暫掩蓋宏觀視野，直覺主導而非理性判斷的短暫窗口。",
        "金牛座的底色：物質安全感、感官滿足、對改變的抵抗——擴張衝動在此需要穩固地基。",
        "此天象適合：重新感受自己對「夠了」的定義，而非繼續追加。"
      ],
      "zh-Hans": [
        "月亮象征情绪、直觉与本能需求；木星象征扩张、信念与成长冲动。",
        "月掩木星的象意：情绪浪潮短暂掩盖宏观视野，直觉主导而非理性判断的短暂窗口。",
        "金牛座的底色：物质安全感、感官满足、对改变的抵抗——扩张冲动在此需要稳固地基。",
        "此天象适合：重新感受自己对「够了」的定义，而非继续追加。"
      ],
      "en": [
        "The Moon symbolises emotion, intuition and instinctive needs; Jupiter represents expansion, belief and the urge to grow.",
        "A lunar occultation of Jupiter suggests: an emotional tide briefly eclipsing the big picture, a short window where gut feeling leads over rational planning.",
        "Taurus colouring: material security, sensory satisfaction, resistance to change — expansive impulses need solid ground here.",
        "A good moment to feel into your own definition of 'enough' rather than pushing for more."
      ]
    },
    "houses": [
      {
        "house": 2,
        "zh-Hant": "財務價值感：情緒影響對「夠了」的判斷",
        "zh-Hans": "财务价值感：情绪影响对「够了」的判断",
        "en": "Material values: emotions colour your sense of 'enough'"
      },
      {
        "house": 4,
        "zh-Hant": "家庭根基：對安全感的渴望被放大",
        "zh-Hans": "家庭根基：对安全感的渴望被放大",
        "en": "Home and roots: longing for security is amplified"
      },
      {
        "house": 9,
        "zh-Hant": "信念旅程：直覺引路，超越固有框架",
        "zh-Hans": "信念旅程：直觉引路，超越固有框架",
        "en": "Beliefs and journeys: intuition leads beyond familiar frameworks"
      }
    ],
    "sources": [
      {
        "label": "JPL Horizons — Moon occultation of Jupiter 2026-10-06",
        "url": "https://ssd.jpl.nasa.gov/horizons/"
      },
      {
        "label": "In-The-Sky.org — Moon occults Jupiter",
        "url": "https://in-the-sky.org/news.php?id=20261006_09_100"
      }
    ]
  },
  {
    "id": "mercury-venus-double-retrograde-2026",
    "published": "2026-10-03",
    "status": "active",
    "title": {
      "zh-Hant": "水星 × 金星雙重逆行：對話與價值的重新檢視",
      "zh-Hans": "水星 × 金星双重逆行：对话与价值的重新检视",
      "en": "Mercury and Venus retrograde: reviewing words and values"
    },
    "subtitle": {
      "zh-Hant": "2026.09.30–12.06｜可核對的星曆 × 占星象徵 × 悉尼日期",
      "zh-Hans": "2026.09.30–12.06｜可核对的星历 × 占星象征 × 悉尼日期",
      "en": "30 Sep–6 Dec 2026 | Ephemeris facts, symbolic astrology, and Sydney-local dates"
    },
    "facts": [
      {
        "date": "2026-09-30",
        "label": {
          "zh-Hant": "水星進入熱帶黃道天蠍區段（悉尼日期）",
          "zh-Hans": "水星进入热带黄道天蝎区段（悉尼日期）",
          "en": "Mercury enters tropical Scorpio (Sydney date)"
        }
      },
      {
        "date": "2026-10-03",
        "label": {
          "zh-Hant": "金星於天蠍約 8°29′開始視逆行",
          "zh-Hans": "金星于天蝎约 8°29′开始视逆行",
          "en": "Venus stations retrograde near 8°29′ Scorpio"
        }
      },
      {
        "date": "2026-10-24",
        "label": {
          "zh-Hant": "水星於天蠍約 20°59′開始視逆行",
          "zh-Hans": "水星于天蝎约 20°59′开始视逆行",
          "en": "Mercury stations retrograde near 20°59′ Scorpio"
        }
      },
      {
        "date": "2026-10-25",
        "label": {
          "zh-Hant": "金星逆行退回天秤",
          "zh-Hans": "金星逆行退回天秤",
          "en": "Retrograde Venus re-enters Libra"
        }
      },
      {
        "date": "2026-11-14",
        "label": {
          "zh-Hant": "水星於天蠍約 5°02′恢復順行（悉尼日期）",
          "zh-Hans": "水星于天蝎约 5°02′恢复顺行（悉尼日期）",
          "en": "Mercury stations direct near 5°02′ Scorpio (Sydney date)"
        }
      },
      {
        "date": "2026-11-14",
        "label": {
          "zh-Hant": "金星於天秤約 22°52′恢復順行（悉尼日期）",
          "zh-Hans": "金星于天秤约 22°52′恢复顺行（悉尼日期）",
          "en": "Venus stations direct near 22°52′ Libra (Sydney date)"
        }
      },
      {
        "date": "2026-12-06",
        "label": {
          "zh-Hant": "水星離開天蠍，進入射手",
          "zh-Hans": "水星离开天蝎，进入射手",
          "en": "Mercury leaves Scorpio and enters Sagittarius"
        }
      }
    ],
    "science": {
      "zh-Hant": [
        "水星與金星的「逆行」是地球觀測到的視運動方向改變，不代表行星真的沿軌道倒退。文中的星座採熱帶黃道座標，描述行星相對黃道的位置分區。",
        "日期統一換算為澳洲／悉尼當地日期。悉尼 10 月 3 日仍為 AEST（UTC+10），10 月 4 日起進入 AEDT（UTC+11）；因此部分英文星曆所列的 UTC 或北美日期會落在悉尼的不同日期。",
        "兩次恢復順行在悉尼都落於 11 月 14 日，但不是同一時刻：水星先轉順，金星約八個半小時後轉順。兩者的逆行重疊在悉尼時間 10 月 24 日開始，並於 11 月 14 日先後結束。"
      ],
      "zh-Hans": [
        "水星与金星的“逆行”是地球观测到的视运动方向改变，不代表行星真的沿轨道倒退。文中的星座采用热带黄道坐标，描述行星相对黄道的位置分区。",
        "日期统一换算为澳大利亚／悉尼当地日期。悉尼 10 月 3 日仍为 AEST（UTC+10），10 月 4 日起进入 AEDT（UTC+11）；因此部分英文星历所列的 UTC 或北美日期会落在悉尼的不同日期。",
        "两次恢复顺行在悉尼都落于 11 月 14 日，但不是同一时刻：水星先转顺，金星约八个半小时后转顺。两者的逆行重叠在悉尼时间 10 月 24 日开始，并于 11 月 14 日先后结束。"
      ],
      "en": [
        "Mercury's and Venus's retrogrades are apparent changes in direction as observed from Earth; neither planet literally reverses its orbit. Sign labels use tropical-zodiac coordinates for the planets' positions along the ecliptic.",
        "Dates are converted to Sydney local calendar dates. Sydney is on AEST (UTC+10) on 3 October and switches to AEDT (UTC+11) on 4 October, so UTC and North American calendar dates can differ from the Sydney date.",
        "Both direct stations fall on 14 November in Sydney, but not at the same moment: Mercury turns direct first, followed about eight and a half hours later by Venus. Their retrogrades overlap from 24 October in Sydney and end in sequence on 14 November."
      ]
    },
    "interpretation": {
      "zh-Hant": [
        "在傳統占星的象徵語言裡，水星逆行常用來回看訊息、判斷與尚未談清楚的事；金星逆行則常用來檢視關係、價值、吸引與交換。兩者重疊時，可把它當成重新確認「我真正想表達什麼、重視什麼」的提醒。",
        "水星於天蠍逆行；金星先在天蠍逆行、再退回天秤。象徵閱讀的焦點會從深層信任、界線與共享資源，延伸到互惠、承諾與關係協商。這是占星傳統的反思框架，不代表必然復合、爭吵、延誤或發生特定事件。",
        "可實際採取的做法：重要約定寫清楚、修改前後核對條件，談敏感議題時先分清已知事實與自己的推測。沒有必要只因逆行就延後重要決定。",
        "個人層面不能只看「天蠍座」或太陽星座；需先確認天蠍與天秤落入本命哪一宮，再核對行運金星、水星與本命行星的精確相位。"
      ],
      "zh-Hans": [
        "在传统占星的象征语言里，水星逆行常用于回看信息、判断与尚未谈清楚的事；金星逆行则常用于检视关系、价值、吸引与交换。两者重叠时，可把它当成重新确认“我真正想表达什么、重视什么”的提醒。",
        "水星在天蝎逆行；金星先在天蝎逆行，再退回天秤。象征阅读的焦点会从深层信任、界线与共享资源，延伸到互惠、承诺与关系协商。这是占星传统的反思框架，不代表必然复合、争吵、延误或发生特定事件。",
        "可实际采取的做法：重要约定写清楚、修改前后核对条件，谈敏感议题时先分清已知事实与自己的推测。没有必要只因逆行就延后重要决定。",
        "个人层面不能只看“天蝎座”或太阳星座；需先确认天蝎与天秤落入本命哪一宫，再核对行运金星、水星与本命行星的精确相位。"
      ],
      "en": [
        "In traditional astrological symbolism, Mercury retrograde is used to review messages, judgements, and unfinished conversations; Venus retrograde is used to reconsider relationships, values, attraction, and exchange. Their overlap can serve as a prompt to check what you truly want to say and what you value.",
        "Mercury retrogrades in Scorpio. Venus begins its retrograde there, then backs into Libra. Symbolically, the focus moves from trust, boundaries, and shared resources toward reciprocity, commitments, and relationship negotiation. This is a reflective framework, not a prediction of reunions, arguments, delays, or any specific event.",
        "Practical steps: put important agreements in writing, compare changed terms, and separate known facts from assumptions in sensitive conversations. There is no need to postpone a significant decision solely because a planet is retrograde.",
        "A personal reading cannot be based only on a Sun sign or the label 'Scorpio'. It requires the natal houses containing Scorpio and Libra, plus exact aspects from transiting Mercury and Venus to natal planets."
      ]
    },
    "houses": [
      {
        "house": 1,
        "zh-Hant": "自我表達、個人界線與被看見的方式",
        "zh-Hans": "自我表达、个人界线与被看见的方式",
        "en": "self-expression, boundaries, and visibility"
      },
      {
        "house": 2,
        "zh-Hant": "收入、自我價值與資源交換",
        "zh-Hans": "收入、自我价值与资源交换",
        "en": "income, self-worth, and exchange of resources"
      },
      {
        "house": 3,
        "zh-Hant": "訊息往來、對話、協商與手足關係",
        "zh-Hans": "信息往来、对话、协商与手足关系",
        "en": "messages, conversations, negotiation, and siblings"
      },
      {
        "house": 4,
        "zh-Hant": "家庭模式、居所與內在安全感",
        "zh-Hans": "家庭模式、居所与内在安全感",
        "en": "family patterns, home, and inner security"
      },
      {
        "house": 5,
        "zh-Hant": "戀愛、創作、愉悅與自我展現",
        "zh-Hans": "恋爱、创作、愉悦与自我展现",
        "en": "romance, creativity, pleasure, and self-expression"
      },
      {
        "house": 6,
        "zh-Hant": "日常工作、協作與照顧節奏",
        "zh-Hans": "日常工作、协作与照顾节奏",
        "en": "daily work, cooperation, and care routines"
      },
      {
        "house": 7,
        "zh-Hant": "伴侶、合約、互惠與關係協商",
        "zh-Hans": "伴侣、合约、互惠与关系协商",
        "en": "partnerships, contracts, reciprocity, and negotiation"
      },
      {
        "house": 8,
        "zh-Hant": "共有資源、債務、親密與依賴界線",
        "zh-Hans": "共有资源、债务、亲密与依赖界线",
        "en": "shared resources, debt, intimacy, and boundaries around dependence"
      },
      {
        "house": 9,
        "zh-Hant": "信念、學習、遠行與跨文化方向",
        "zh-Hans": "信念、学习、远行与跨文化方向",
        "en": "beliefs, study, travel, and cross-cultural direction"
      },
      {
        "house": 10,
        "zh-Hant": "事業、公開身分與合作關係",
        "zh-Hans": "事业、公开身份与合作关系",
        "en": "career, public identity, and professional alliances"
      },
      {
        "house": 11,
        "zh-Hant": "朋友、社群、共同目標與未來計畫",
        "zh-Hans": "朋友、社群、共同目标与未来计划",
        "en": "friends, communities, shared goals, and future plans"
      },
      {
        "house": 12,
        "zh-Hant": "私下情緒、未說出口的期待與休整",
        "zh-Hans": "私下情绪、未说出口的期待与休整",
        "en": "private feelings, unspoken expectations, and restoration"
      }
    ],
    "sources": [
      {
        "label": "NASA/JPL Horizons",
        "url": "https://ssd.jpl.nasa.gov/horizons/"
      },
      {
        "label": "Astrology.com · Mercury Retrograde in Scorpio 2026",
        "url": "https://www.astrology.com/article/mercury-retrograde-scorpio-2026/"
      },
      {
        "label": "Cafe Astrology · Venus Retrograde Cycle 2026",
        "url": "https://cafeastrology.com/events/venus-turns-retrograde-in-scorpio/"
      },
      {
        "label": "Cafe Astrology · 2026 Astrology Calendar",
        "url": "https://cafeastrology.com/astrology-calendars-events.html"
      },
      {
        "label": "AstroSynthesis Australia · 2026 Retrogrades (UTC table)",
        "url": "https://www.astrosynthesis.com.au/wp-content/uploads/2025/12/2026-Retrogrades.pdf"
      }
    ]
  },
  {
    id: "mars-aspect-cluster-2026-10",
    published: "2026-09-27",
    status: "active",
    title: {
      "zh-Hant": "火星週：三分海王（白羊）、四分水星、衝冥王的行動考驗",
      "zh-Hans": "火星周：三分海王（白羊）、四分水星、冲冥王的行动考验",
      en: "Mars week: a trine to Neptune (Aries), a square to Mercury, an opposition to Pluto"
    },
    subtitle: {
      "zh-Hant": "2026.09.28–10.03｜天文實況 × 火星相位叢集的占星象意",
      "zh-Hans": "2026.09.28–10.03｜天文实况 × 火星相位丛集的占星象意",
      en: "2026.09.28–10.03 | Astronomy × the symbolic astrology of a Mars aspect cluster"
    },
    facts: [
      { date: "2026-09-28", label: { "zh-Hant": "太陽（天秤）與天王星逆行（雙子）形成三分相", "zh-Hans": "太阳（天秤）与天王星逆行（双子）形成三分相", en: "Sun (Libra) trine retrograde Uranus (Gemini)" } },
      { date: "2026-10-01", label: { "zh-Hant": "水星進入熱帶黃道天蠍區段", "zh-Hans": "水星进入热带黄道天蝎区段", en: "Mercury enters tropical Scorpio" } },
      { date: "2026-10-02", label: { "zh-Hant": "火星（獅子）與水星（天蠍）形成四分相", "zh-Hans": "火星（狮子）与水星（天蝎）形成四分相", en: "Mars (Leo) square Mercury (Scorpio)" } },
      { date: "2026-10-02", label: { "zh-Hant": "火星（獅子）與海王星逆行（白羊）形成三分相", "zh-Hans": "火星（狮子）与海王星逆行（白羊）形成三分相", en: "Mars (Leo) trine retrograde Neptune (Aries)" } },
      { date: "2026-10-03", label: { "zh-Hant": "火星（獅子）與冥王星逆行（水瓶）形成對分相", "zh-Hans": "火星（狮子）与冥王星逆行（水瓶）形成对分相", en: "Mars (Leo) opposite retrograde Pluto (Aquarius)" } }
    ],
    science: {
      "zh-Hant": [
        "相位是以地心視黃經角距定義的幾何關係：三分相約 120°、四分相約 90°、對分相約 180°，皆可由星曆表精確驗證，屬於可測量的天體幾何事實。",
        "本週水星為順行入宮，不涉及逆行；冥王星自 2026 年稍早即持續逆行，本次對分只是火星移動到與其形成 180° 角的位置，並非冥王星本身有特殊動作。",
        "「獅子座火星」「天蠍座水星」等描述採本站慣用之熱帶黃道座標，指行星在地心視角下落入的分區，不主張行星物理進入同名恆星星座。"
      ],
      "zh-Hans": [
        "相位是以地心视黄经角距定义的几何关系：三分相约 120°、四分相约 90°、对分相约 180°，皆可由星历表精确验证，属于可测量的天体几何事实。",
        "本周水星为顺行入宫，不涉及逆行；冥王星自 2026 年稍早即持续逆行，本次对分只是火星移动到与其形成 180° 角的位置，并非冥王星本身有特殊动作。",
        "“狮子座火星”“天蝎座水星”等描述采本站惯用之热带黄道坐标，指行星在地心视角下落入的分区，不主张行星物理进入同名恒星星座。"
      ],
      en: [
        "An aspect is a geometric relationship defined by geocentric ecliptic angular distance: a trine is roughly 120°, a square roughly 90°, an opposition roughly 180°; all can be checked precisely against an ephemeris as measurable celestial geometry.",
        "Mercury's sign change this week is a direct-motion ingress, not a retrograde event; Pluto has been retrograde since earlier in 2026, so this opposition is simply Mars moving into a 180° relationship with it, not a new action by Pluto itself.",
        "Sign labels such as 'Mars in Leo' or 'Mercury in Scorpio' use this site's tropical-zodiac convention for the geocentric sector a planet occupies, not a claim that it physically enters the matching IAU constellation."
      ]
    },
    interpretation: {
      "zh-Hant": [
        "太陽三分天王星：傳統占星讀作自我表達與外在變動之間出現不費力的呼應，象徵一些長期被壓抑的想法或做法，忽然找到一個看似意外卻順暢的出口。",
        "水星入天蠍：象徵性地代表思考從交換表面訊息，轉向追問動機與底層意圖，適合深度調查、財務盡職審查或需要坦誠面對的對話；風險是過度懷疑滑向偏執。",
        "火星四分水星：傳統讀法認為行動與言語之間容易出現摩擦——常見情況是話還沒想清楚就先出口，或把情緒當成論點使用；可留意的練習是把「想說的」與「此刻是否該說」分開處理。",
        "火星三分海王星：象徵行動力與想像力、同理心之間罕見地順暢共振，利於創作、直覺判斷與非語言的默契溝通；風險是把強烈的渴望，誤認成已經核實的事實。",
        "火星衝冥王逆行：傳統讀法將此視為控制與被控制的張力浮上檯面，容易把眼前一件小摩擦，放大成整體「誰更有權力」的議題；值得先分辨——這是這件事本身的份量，還是舊有無力感被重新觸發。"
      ],
      "zh-Hans": [
        "太阳三分天王星：传统占星读作自我表达与外在变动之间出现不费力的呼应，象征一些长期被压抑的想法或做法，忽然找到一个看似意外却顺畅的出口。",
        "水星入天蝎：象征性地代表思考从交换表面讯息，转向追问动机与底层意图，适合深度调查、财务尽职审查或需要坦诚面对的对话；风险是过度怀疑滑向偏执。",
        "火星四分水星：传统读法认为行动与言语之间容易出现摩擦——常见情况是话还没想清楚就先出口，或把情绪当成论点使用；可留意的练习是把“想说的”与“此刻是否该说”分开处理。",
        "火星三分海王星：象征行动力与想象力、同理心之间罕见地顺畅共振，利于创作、直觉判断与非语言的默契沟通；风险是把强烈的渴望，误认成已经核实的事实。",
        "火星冲冥王逆行：传统读法将此视为控制与被控制的张力浮上台面，容易把眼前一件小摩擦，放大成整体“谁更有权力”的议题；值得先分辨——这是这件事本身的份量，还是旧有无力感被重新触发。"
      ],
      en: [
        "Sun trine Uranus: astrological tradition reads this as an easy resonance between self-expression and outer change — a long-suppressed idea or habit may suddenly find a surprising but smooth outlet.",
        "Mercury into Scorpio: symbolically, thinking shifts from surface information toward questioning motive and hidden intent — useful for research, financial due diligence, or conversations that need real honesty; the risk is that suspicion slides into paranoia.",
        "Mars square Mercury: tradition reads this as friction between action and speech — a common pattern is speaking before the thought is finished, or treating emotion as an argument; worth separating 'what I want to say' from 'whether now is the moment to say it.'",
        "Mars trine Neptune: a comparatively rare, smooth resonance between drive and imagination or empathy — good for creative work, intuitive judgement, and unspoken rapport; the risk is mistaking a strong wish for an already-verified fact.",
        "Mars opposite retrograde Pluto: tradition reads this as control-versus-being-controlled tension surfacing — a small friction can be inflated into a whole argument about 'who holds more power'; worth asking first whether the weight belongs to this moment, or to an old sense of powerlessness being re-triggered."
      ]
    },
    houses: [
      { house: 1, "zh-Hant": "自我展現、如何被看見、個人存在感", "zh-Hans": "自我展现、如何被看见、个人存在感", en: "self-presentation, visibility, personal presence" },
      { house: 2, "zh-Hant": "收入來源、個人資源展示、自信與金錢的連結", "zh-Hans": "收入来源、个人资源展示、自信与金钱的连结", en: "income, display of resources, confidence tied to money" },
      { house: 3, "zh-Hant": "表達欲、公開發言、手足與近距離社交場合", "zh-Hans": "表达欲、公开发言、手足与近距离社交场合", en: "self-expression, public speech, siblings, close social settings" },
      { house: 4, "zh-Hant": "家庭中的主導位置、居家風格的展示欲", "zh-Hans": "家庭中的主导位置、居家风格的展示欲", en: "leadership at home, wanting one's home style seen" },
      { house: 5, "zh-Hant": "戀愛、創作、子女與舞台性的自我表達", "zh-Hans": "恋爱、创作、子女与舞台性的自我表达", en: "romance, creativity, children, theatrical self-expression" },
      { house: 6, "zh-Hant": "工作表現欲、對日常事務的掌控感、身體活力", "zh-Hans": "工作表现欲、对日常事务的掌控感、身体活力", en: "wanting recognition at work, control over routine, physical vitality" },
      { house: 7, "zh-Hant": "伴侶關係中的主導權、公開合作場合", "zh-Hans": "伴侣关系中的主导权、公开合作场合", en: "leadership within partnership, public collaborations" },
      { house: 8, "zh-Hant": "危機中的領導欲、深層資源的掌控", "zh-Hans": "危机中的领导欲、深层资源的掌控", en: "wanting to lead in a crisis, control over shared resources" },
      { house: 9, "zh-Hant": "公開表達信念、跨文化舞台、教學與演說", "zh-Hans": "公开表达信念、跨文化舞台、教学与演说", en: "publicly stated beliefs, cross-cultural stage, teaching and speaking" },
      { house: 10, "zh-Hant": "事業舞台、公開身分、領導位置", "zh-Hans": "事业舞台、公开身份、领导位置", en: "career stage, public identity, leadership position" },
      { house: 11, "zh-Hant": "群體中的核心位置、社交圈的影響力", "zh-Hans": "群体中的核心位置、社交圈的影响力", en: "central position in a group, influence within a social circle" },
      { house: 12, "zh-Hant": "私下的表演欲、未被看見的自我肯定需求", "zh-Hans": "私下的表演欲、未被看见的自我肯定需求", en: "a private need for performance or unseen self-affirmation" }
    ],
    sources: [
      { label: "Astrology.com · Weekly Horoscope Sep 28 – Oct 4, 2026", url: "https://www.astrology.com/article/weekly-horoscope-september-28-2026-to-october-4-2026/" },
      { label: "Storm Cestavani · Sep 28 – Oct 4, 2026 astrology", url: "https://stormcestavani.com/september-28-october-4-2026-what-still-has-power-over-you/" },
      { label: "NASA/JPL Horizons", url: "https://ssd.jpl.nasa.gov/horizons/" }
    ]
  },
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

/**
 * The featured sky event is the most recently published entry, not a fixed
 * array position. This lets a new weekly entry become the home-section and
 * /sky-events headline automatically once merged, without reordering older
 * entries or touching their display logic.
 */
export function getFeaturedSkyEvent(): SkyEvent {
  return [...SKY_EVENTS].sort((a, b) => b.published.localeCompare(a.published))[0];
}

export function getArchivedSkyEvents(): SkyEvent[] {
  const featured = getFeaturedSkyEvent();
  return [...SKY_EVENTS].filter((event) => event.id !== featured.id).sort((a, b) => b.published.localeCompare(a.published));
}

export const SKY_EVENT_CATEGORIES = [
  "行星換座 / Planetary ingress",
  "逆行、順行與停駐 / Stations",
  "重要相位 / Major aspects",
  "新月、滿月、日月食 / Lunations & eclipses",
  "行星合月、合相與觀測事件 / Conjunctions & observing events",
  "流星雨、彗星與特殊可見天象 / Meteor showers, comets & visible phenomena"
] as const;

/**
 * ── 今日星象卡（TODAY_SKY_CARDS） ──────────────────────────────────────────
 *
 * Design constraints this module deliberately satisfies (see
 * docs/change-reports for the audit that produced them):
 *
 * 1. No planetary position or aspect is invented. Every sign/degree used
 *    below was cross-checked against a published ephemeris (AstroAk /
 *    Cafe Astrology, cross-referenced against NASA/JPL Horizons) for the
 *    2026-09-28 → 2026-10-04 window before being written here. If the
 *    underlying SKY_EVENTS fact changes (a republish with corrected
 *    degrees), update the ASPECT_FACTS table below — never hand-edit
 *    affectedSigns, they are always derived.
 * 2. "affectedSigns" is never a natal-house guess (we have no birth data
 *    for readers). It is computed purely from classical modality/element
 *    geometry: a trine's third-party signs share the element triad, a
 *    square/opposition's third-party signs share the modality tetrad.
 *    That is exact zodiac arithmetic, not interpretive invention.
 * 3. "visibleToNakedEye" is only ever true for an event that is itself an
 *    observable phenomenon (e.g. Saturn near opposition, at its brightest
 *    and visible most of the night). A geometric aspect between two
 *    planets (a square, trine, opposition) is not itself something to
 *    look at in the sky and must never be marked visible.
 * 4. No fabricated clock time. Facts carry a calendar date only, because
 *    that is the precision the source ephemeris actually supports; a
 *    fake "06:34" reads as more precise than the underlying data.
 */

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
] as const;

type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

const SIGN_NAMES: Record<ZodiacSign, { "zh-Hant": string; "zh-Hans": string; en: string }> = {
  Aries: { "zh-Hant": "白羊座", "zh-Hans": "白羊座", en: "Aries" },
  Taurus: { "zh-Hant": "金牛座", "zh-Hans": "金牛座", en: "Taurus" },
  Gemini: { "zh-Hant": "雙子座", "zh-Hans": "双子座", en: "Gemini" },
  Cancer: { "zh-Hant": "巨蟹座", "zh-Hans": "巨蟹座", en: "Cancer" },
  Leo: { "zh-Hant": "獅子座", "zh-Hans": "狮子座", en: "Leo" },
  Virgo: { "zh-Hant": "處女座", "zh-Hans": "处女座", en: "Virgo" },
  Libra: { "zh-Hant": "天秤座", "zh-Hans": "天秤座", en: "Libra" },
  Scorpio: { "zh-Hant": "天蠍座", "zh-Hans": "天蝎座", en: "Scorpio" },
  Sagittarius: { "zh-Hant": "射手座", "zh-Hans": "射手座", en: "Sagittarius" },
  Capricorn: { "zh-Hant": "摩羯座", "zh-Hans": "摩羯座", en: "Capricorn" },
  Aquarius: { "zh-Hant": "水瓶座", "zh-Hans": "水瓶座", en: "Aquarius" },
  Pisces: { "zh-Hant": "雙魚座", "zh-Hans": "双鱼座", en: "Pisces" }
};

// Classical triplicities (element) and quadruplicities (modality). Two
// signs 120° apart always share a triplicity; two signs 90°/180° apart
// always share a quadruplicity. This is zodiac geometry, not opinion.
const ELEMENT_OF: Record<ZodiacSign, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water"
};

const MODALITY_OF: Record<ZodiacSign, "cardinal" | "fixed" | "mutable"> = {
  Aries: "cardinal", Cancer: "cardinal", Libra: "cardinal", Capricorn: "cardinal",
  Taurus: "fixed", Leo: "fixed", Scorpio: "fixed", Aquarius: "fixed",
  Gemini: "mutable", Virgo: "mutable", Sagittarius: "mutable", Pisces: "mutable"
};

export type AspectKind = "conjunction" | "sextile" | "square" | "trine" | "opposition";

/**
 * Returns the zodiac signs meaningfully touched by an aspect between two
 * transiting planets, given only the sign each planet occupies (not a
 * birth chart). Pure and deterministic: same inputs, same output, always.
 *
 * - conjunction: just the (single, shared) sign.
 * - trine: the full element triplicity of the two signs (their own
 *   element, since a true trine only occurs between signs of one element).
 * - square / opposition: the full modality quadruplicity of the two
 *   signs (their own modality, since square/opposition only occur within
 *   one modality).
 * - sextile: the two signs themselves plus their two complementary
 *   ("supportive") element-pair signs are not derived generically here —
 *   sextiles are not used in TODAY_SKY_CARDS below, so this case simply
 *   returns the two input signs.
 */
export function getAspectAffectedSigns(signA: ZodiacSign, signB: ZodiacSign, aspect: AspectKind): ZodiacSign[] {
  if (aspect === "conjunction") {
    return signA === signB ? [signA] : [signA, signB];
  }
  if (aspect === "trine") {
    const element = ELEMENT_OF[signA];
    return ZODIAC_SIGNS.filter((sign) => ELEMENT_OF[sign] === element);
  }
  if (aspect === "square" || aspect === "opposition") {
    const modality = MODALITY_OF[signA];
    return ZODIAC_SIGNS.filter((sign) => MODALITY_OF[sign] === modality);
  }
  return [signA, signB];
}

function signImpactList(
  signs: ZodiacSign[],
  note: { "zh-Hant": string; "zh-Hans": string; en: string }
): Array<{ sign: { "zh-Hant": string; "zh-Hans": string; en: string }; note: { "zh-Hant": string; "zh-Hans": string; en: string } }> {
  return signs.map((sign) => ({ sign: SIGN_NAMES[sign], note }));
}

export type SkyImpactCard = {
  id: string;
  date: string;
  grade: "A" | "B";
  visibleToNakedEye: boolean;
  glyph: string;
  title: { "zh-Hant": string; "zh-Hans": string; en: string };
  scienceLine: { "zh-Hant": string; "zh-Hans": string; en: string };
  theme: { "zh-Hant": string; "zh-Hans": string; en: string };
  affectedSigns: Array<{
    sign: { "zh-Hant": string; "zh-Hans": string; en: string };
    note: { "zh-Hant": string; "zh-Hans": string; en: string };
  }>;
};

const cardierNote = {
  cardinal: { "zh-Hant": "行動與新開端的張力，容易被推著立刻做決定。", "zh-Hans": "行动与新开端的张力，容易被推着立刻做决定。", en: "Tension around initiating and deciding — a pull to act right now." },
  fixed: { "zh-Hant": "持有與放手的拉扯，容易在「該不該堅持」上內耗。", "zh-Hans": "持有与放手的拉扯，容易在“该不该坚持”上内耗。", en: "A pull between holding on and letting go — friction over whether to keep insisting." },
  fireTrine: { "zh-Hant": "行動力與直覺、信念順暢共振，適合起步而非等待。", "zh-Hans": "行动力与直觉、信念顺畅共振，适合起步而非等待。", en: "Drive resonates easily with instinct and conviction — better for starting than waiting." },
  airTrine: { "zh-Hant": "表達與思考找到不費力的出口，適合說出來、寫下來。", "zh-Hans": "表达与思考找到不费力的出口，适合说出来、写下来。", en: "Expression and thought find an easy outlet — a good window to speak or write it down." }
};

/**
 * Hand-verified against AstroAk's September/October 2026 ephemeris
 * (astroak.com) and cross-checked date-for-date against the SKY_EVENTS
 * "mars-aspect-cluster-2026-10" facts above and NASA/JPL Horizons. Signs
 * are the actual tropical placements on the stated date — Uranus in
 * Gemini and Neptune in Aries in this window, not their pre-2025 signs.
 */
const ASPECT_FACTS: Array<{
  id: string;
  date: string;
  grade: "A" | "B";
  visibleToNakedEye: boolean;
  glyph: string;
  signA: ZodiacSign;
  signB: ZodiacSign;
  aspect: AspectKind;
  title: { "zh-Hant": string; "zh-Hans": string; en: string };
  scienceLine: { "zh-Hant": string; "zh-Hans": string; en: string };
  theme: { "zh-Hant": string; "zh-Hans": string; en: string };
  note: { "zh-Hant": string; "zh-Hans": string; en: string };
}> = [
  {
    id: "sun-trine-uranus-2026-09-28",
    date: "2026-09-28",
    grade: "B",
    visibleToNakedEye: false,
    glyph: "☉△♅",
    signA: "Libra",
    signB: "Gemini",
    aspect: "trine",
    title: {
      "zh-Hant": "太陽三分逆行天王星",
      "zh-Hans": "太阳三分逆行天王星",
      en: "Sun trine retrograde Uranus"
    },
    scienceLine: {
      "zh-Hant": "太陽（天秤 4–5°）與天王星（雙子 5–6°，逆行）地心視黃經角距約 119°，屬三分相，可由星曆精確驗證。",
      "zh-Hans": "太阳（天秤 4–5°）与天王星（双子 5–6°，逆行）地心视黄经角距约 119°，属三分相，可由星历精确验证。",
      en: "Sun (4–5° Libra) and Uranus (5–6° Gemini, retrograde) are about 119° apart in geocentric ecliptic longitude — a trine, verifiable against an ephemeris."
    },
    theme: { "zh-Hant": "被壓抑的想法找到順暢出口", "zh-Hans": "被压抑的想法找到顺畅出口", en: "A suppressed idea finds a smooth outlet" },
    note: cardierNote.airTrine
  },
  {
    id: "mercury-into-scorpio-2026-10-01",
    date: "2026-10-01",
    grade: "B",
    visibleToNakedEye: false,
    glyph: "☿→♏",
    signA: "Scorpio",
    signB: "Scorpio",
    aspect: "conjunction",
    title: { "zh-Hant": "水星進入天蠍座", "zh-Hans": "水星进入天蝎座", en: "Mercury enters Scorpio" },
    scienceLine: {
      "zh-Hant": "水星於 9/30 仍在天秤 29°附近，10/1 已進入天蠍 0°40′，屬熱帶黃道換座，可由星曆直接讀出換座時刻。",
      "zh-Hans": "水星于 9/30 仍在天秤 29°附近，10/1 已进入天蝎 0°40′，属热带黄道换座，可由星历直接读出换座时刻。",
      en: "Mercury was still near 29° Libra on 9/30 and had reached 0°40′ Scorpio by 10/1 — a tropical-zodiac ingress, its crossing time readable directly from an ephemeris."
    },
    theme: { "zh-Hant": "思考從交換訊息轉向追問動機", "zh-Hans": "思考从交换讯息转向追问动机", en: "Thinking shifts from swapping information to questioning motive" },
    note: { "zh-Hant": "適合深度調查、財務盡職審查；風險是過度懷疑滑向偏執。", "zh-Hans": "适合深度调查、财务尽职审查；风险是过度怀疑滑向偏执。", en: "Good for research and financial due diligence; the risk is suspicion sliding into paranoia." }
  },
  {
    id: "mars-square-mercury-2026-10-02",
    date: "2026-10-02",
    grade: "B",
    visibleToNakedEye: false,
    glyph: "♂□☿",
    signA: "Leo",
    signB: "Scorpio",
    aspect: "square",
    title: { "zh-Hant": "火星四分水星", "zh-Hans": "火星四分水星", en: "Mars square Mercury" },
    scienceLine: {
      "zh-Hant": "火星（獅子 2°16′）與水星（天蠍 1°59′）地心視黃經角距約 90°，屬四分相，幾乎精確。",
      "zh-Hans": "火星（狮子 2°16′）与水星（天蝎 1°59′）地心视黄经角距约 90°，属四分相，几乎精确。",
      en: "Mars (2°16′ Leo) and Mercury (1°59′ Scorpio) are about 90° apart geocentrically — a square, almost exact."
    },
    theme: { "zh-Hant": "行動與言語之間的摩擦", "zh-Hans": "行动与言语之间的摩擦", en: "Friction between action and speech" },
    note: cardierNote.fixed
  },
  {
    id: "mars-trine-neptune-2026-10-02",
    date: "2026-10-02",
    grade: "B",
    visibleToNakedEye: false,
    glyph: "♂△♆",
    signA: "Leo",
    signB: "Aries",
    aspect: "trine",
    title: { "zh-Hant": "火星三分逆行海王星", "zh-Hans": "火星三分逆行海王星", en: "Mars trine retrograde Neptune" },
    scienceLine: {
      "zh-Hant": "火星（獅子 2°16′）與海王星（白羊 2°50′，逆行）地心視黃經角距約 119°，屬三分相，接近精確。",
      "zh-Hans": "火星（狮子 2°16′）与海王星（白羊 2°50′，逆行）地心视黄经角距约 119°，属三分相，接近精确。",
      en: "Mars (2°16′ Leo) and Neptune (2°50′ Aries, retrograde) are about 119° apart — a trine, close to exact."
    },
    theme: { "zh-Hant": "行動力與想像力罕見地順暢共振", "zh-Hans": "行动力与想象力罕见地顺畅共振", en: "Drive resonates rarely-smoothly with imagination" },
    note: cardierNote.fireTrine
  },
  {
    id: "mars-opposite-pluto-2026-10-03",
    date: "2026-10-03",
    grade: "B",
    visibleToNakedEye: false,
    glyph: "♂☍♇",
    signA: "Leo",
    signB: "Aquarius",
    aspect: "opposition",
    title: { "zh-Hant": "火星衝逆行冥王星", "zh-Hans": "火星冲逆行冥王星", en: "Mars opposite retrograde Pluto" },
    scienceLine: {
      "zh-Hant": "火星（獅子 2°51′）與冥王星（水瓶 3°06′，逆行）地心視黃經角距約 180°，屬對分相，幾乎精確。",
      "zh-Hans": "火星（狮子 2°51′）与冥王星（水瓶 3°06′，逆行）地心视黄经角距约 180°，属对分相，几乎精确。",
      en: "Mars (2°51′ Leo) and Pluto (3°06′ Aquarius, retrograde) are about 180° apart — an opposition, almost exact."
    },
    theme: { "zh-Hant": "控制與被控制的張力浮上檯面", "zh-Hans": "控制与被控制的张力浮上台面", en: "Control-versus-being-controlled tension surfaces" },
    note: cardierNote.fixed
  },
  {
    id: "saturn-opposition-2026-10-04",
    date: "2026-10-04",
    grade: "A",
    visibleToNakedEye: true,
    glyph: "♄",
    signA: "Aries",
    signB: "Libra",
    aspect: "opposition",
    title: { "zh-Hant": "土星衝（今年最佳觀測期）", "zh-Hans": "土星冲（今年最佳观测期）", en: "Saturn at opposition (year's best viewing window)" },
    scienceLine: {
      "zh-Hant": "土星（白羊約 11°，逆行）與太陽形成地心對分（約 180°），約在悉尼時間 10/4 深夜前後，視星等約 0.3，幾乎整夜可見，是可驗證的天文幾何事件，非占星象徵。",
      "zh-Hans": "土星（白羊约 11°，逆行）与太阳形成地心对分（约 180°），约在悉尼时间 10/4 深夜前后，视星等约 0.3，几乎整夜可见，是可验证的天文几何事件，非占星象征。",
      en: "Saturn (about 11° Aries, retrograde) reaches geocentric opposition to the Sun (about 180° apart), around late evening Sydney time on 10/4, at roughly magnitude 0.3 and visible almost all night — a verifiable astronomical geometry event, not a symbolic one."
    },
    theme: { "zh-Hant": "舊結構的壓力測試", "zh-Hans": "旧结构的压力测试", en: "A stress test for old structures" },
    note: cardierNote.cardinal
  }
];

export const TODAY_SKY_CARDS: SkyImpactCard[] = ASPECT_FACTS.map((fact) => ({
  id: fact.id,
  date: fact.date,
  grade: fact.grade,
  visibleToNakedEye: fact.visibleToNakedEye,
  glyph: fact.glyph,
  title: fact.title,
  scienceLine: fact.scienceLine,
  theme: fact.theme,
  affectedSigns: signImpactList(getAspectAffectedSigns(fact.signA, fact.signB, fact.aspect), fact.note)
}));

export function getTodaySkyCards(): SkyImpactCard[] {
  return TODAY_SKY_CARDS;
}

export function getTodaySkyUpdatedDate(): string {
  return [...TODAY_SKY_CARDS].sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? "";
}
