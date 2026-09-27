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
    id: "mars-aspect-cluster-2026-10",
    published: "2026-09-27",
    status: "active",
    title: {
      "zh-Hant": "火星週：三分海王、四分水星、衝冥王的行動考驗",
      "zh-Hans": "火星周：三分海王、四分水星、冲冥王的行动考验",
      en: "Mars week: a trine to Neptune, a square to Mercury, an opposition to Pluto"
    },
    subtitle: {
      "zh-Hant": "2026.09.28–10.03｜天文實況 × 火星相位叢集的占星象意",
      "zh-Hans": "2026.09.28–10.03｜天文实况 × 火星相位丛集的占星象意",
      en: "2026.09.28–10.03 | Astronomy × the symbolic astrology of a Mars aspect cluster"
    },
    facts: [
      { date: "2026-09-28", label: { "zh-Hant": "太陽（天秤）與天王星（金牛）形成三分相", "zh-Hans": "太阳（天秤）与天王星（金牛）形成三分相", en: "Sun (Libra) trine Uranus (Taurus)" } },
      { date: "2026-09-30", label: { "zh-Hant": "水星進入熱帶黃道天蠍區段", "zh-Hans": "水星进入热带黄道天蝎区段", en: "Mercury enters tropical Scorpio" } },
      { date: "2026-10-02", label: { "zh-Hant": "火星（獅子）與水星（天蠍）形成四分相", "zh-Hans": "火星（狮子）与水星（天蝎）形成四分相", en: "Mars (Leo) square Mercury (Scorpio)" } },
      { date: "2026-10-02", label: { "zh-Hant": "火星（獅子）與海王星（雙魚）形成三分相", "zh-Hans": "火星（狮子）与海王星（双鱼）形成三分相", en: "Mars (Leo) trine Neptune (Pisces)" } },
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
