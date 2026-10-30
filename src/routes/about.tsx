import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { stoneMark } from "@/lib/stone-mark";
import { useState, type CSSProperties } from "react";
import "@/about-zhaowu.css";

export const Route = createFileRoute("/about")({ component: AboutZhaowu });

type Feature = {
  label: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  foot?: string;
};

function content(locale: string) {
  if (locale === "en") return {
    eyebrow: "THE WORLD OF ZHAOWU",
    title: "Where the seasons have a form, and destiny becomes readable.",
    summary: "A living space for Eastern time culture, personal exploration and Song-inspired art. Here, the calendar, the sky, the place you are in and the way you read yourself belong to one story.",
    explore: "Discover what makes ZHAOWU different",
    returnLogin: "Back to sign-in",
    visit: "Enter ZHAOWU",
    footer: "Know your patterns, not to surrender to fate — but to meet life with composure.",
    limits: "Seasonal themes use a Sydney-based visual schedule. Traditional Chinese pentads are cultural imagery, not a local weather forecast. Only Frost's Descent currently has artwork created separately for its three pentads.",
    features: [
      { label: "01 / AESTHETIC", title: "A website shaped like a Song scroll", body: "Warm rice-paper surfaces, mineral blue-greens, fine ink lines, understated gold and spacious, readable typography. The art, colour, background and editorial layout form one visual language—not a lone decorative image.", image: "/theme-skins/reference-day-flute.webp", imageAlt: "A flute player in a traditional illustrated landscape" },
      { label: "02 / TIME", title: "24 solar terms · 72 pentads", body: "The seasonal mode follows the 24 traditional solar terms and their 72 pentads, showing the current name and symbolic scene with a Sydney-local calendar schedule. Accepted paintings are reused where a separate artwork has not yet been commissioned.", image: "/theme-skins/solar-frost-descent/hero-frost-descent.webp", imageAlt: "Frost's Descent seasonal painting" },
      { label: "03 / PLACE", title: "Today's weather, in your part of the world", body: "Today's guide can present local time, temperature, weather and the season of your hemisphere using browser permission or approximate location. Your actual weather and traditional Chinese seasonal imagery remain distinct.", image: "/theme-skins/song-gallery-frostleaf-art.webp", imageAlt: "Seasonal river landscape" },
      { label: "04 / ART", title: "A whole-site change of scenery", body: "Curated themes range from koi and lotus boats to bamboo rain and celestial dragons. The site owner publishes one coherent visual setting for the entire experience, with an optional seasonal automatic mode.", image: "/theme-skins/reference-koi.webp", imageAlt: "Illustrated koi painting" },
      { label: "05 / DESTINY", title: "One birth record, one personal destiny book", body: "Zi Ping BaZi anchors a structured reading: true solar time, solar-term months, the four pillars and changing luck cycles. Other traditions have their own sections; symbolic interpretation does not override calculated chart data.", image: "/theme-skins/moon-lotus-boat-art.webp", imageAlt: "Moonlit lotus-boat painting" },
      { label: "06 / TODAY", title: "The almanac beside the sky", body: "Daily almanac with do and avoid lists, calendar stems and branches, five-element colours, dressing suggestions, spirit slips and recent sky events meet in one guide. Verified astronomical information is kept separate from astrological symbolism.", image: "/theme-skins/verdant-pavilion-art.webp", imageAlt: "Green spring pavilion painting" },
      { label: "07 / CULTURE", title: "The details make the journey", body: "Essays, illustrated collections, tea, scent, self-discovery quizzes, quiet music and an on-site guide invite exploration beyond a single chart. Read on mobile, switch between Traditional Chinese, Simplified Chinese and English.", image: "/art/scene-osmanthus-tea-v1.webp", imageAlt: "Illustration of tea and osmanthus" },
      { label: "08 / BOUNDARY", title: "No sign-in to begin; rules come before symbolism", body: "Enter a birth date, time and place to chart without an account and read the free three-part core reading. Deeper luck-cycle, annual and monthly readings unlock once, with no automatic renewal. True solar time is optional. If you were born or live in the Southern Hemisphere, the site reads local season and daily rhythm only; it does not reverse the four pillars, the month pillar or the luck cycles.", image: "/theme-skins/bamboo-falls-art.webp", imageAlt: "Waterfall and bamboo ink-landscape painting" }
    ] satisfies Feature[],
  };
  if (locale === "zh-Hans") return {
    eyebrow: "走进昭梧 · ZHAOWU",
    title: "让天时有形，让命理可读。",
    summary: "一座随着时间流转的东方数字世界。宋式美学、节气物候、当地天气、天文知识与个人探索，在这里连成同一种体验。",
    explore: "昭梧有什么不同？",
    returnLogin: "返回登录",
    visit: "进入昭梧",
    footer: "知命，不为认命，是为从容。",
    limits: "节气主题采用悉尼当地的视觉排程。中国传统七十二候是文化物候意象，并非澳洲天气预报。目前仅霜降三候具有各自专门制作的画作，其他节气沿用既有画作。",
    features: [
      { label: "01 / 美学", title: "一座宋式画卷般的网站", body: "宣纸暖白、矿物青绿、细墨线与克制金线，结合远山、流水、留白与清晰的宋式排版。画作、背景、图标、颜色与阅读界面属于一套完整审美，不只是替换一张封面。", image: "/theme-skins/reference-day-flute.webp", imageAlt: "古风吹笛人物山水画" },
      { label: "02 / 时令", title: "二十四节气 × 七十二候", body: "启用节气自动模式后，依据悉尼日历日呈现节气与初、二、三候的传统物候名称和对应画境。尚无专属原画的节气继续使用已上架的完整主题。", image: "/theme-skins/solar-frost-descent/hero-frost-descent.webp", imageAlt: "霜降节气绘画" },
      { label: "03 / 所在地", title: "今天的天空，从你所在的地方开始", body: "今日指引可通过定位许可或概略所在地显示当地时间、气温、天气与南北半球季节。真实天气与传统中国节令分别展示，互不冒充。", image: "/theme-skins/song-gallery-frostleaf-art.webp", imageAlt: "秋日溪谷山水" },
      { label: "04 / 主题", title: "更换的不是图片，而是一整套画境", body: "锦鲤、荷舟、竹雨、云龙、凤凰等多套画境由站主发布，带动全站配色与背景统一变化；也可选择跟随节气的自动模式。", image: "/theme-skins/reference-koi.webp", imageAlt: "锦鲤绘画" },
      { label: "05 / 命书", title: "一份生辰，读成一本个人命书", body: "以子平八字为核心，从真太阳时、节气月令、四柱结构到大运流年依次展开。紫微、七政、西洋与印度占星另有独立领域，不用象征叙事覆盖计算结果。", image: "/theme-skins/moon-lotus-boat-art.webp", imageAlt: "月下荷舟绘画" },
      { label: "06 / 今日", title: "今日黄历，与今日星象并肩", body: "每日干支、宜忌、五行穿衣、色彩、灵签及近期天象集中阅读；可核对的天文事件与占星象征解释分别说明。", image: "/theme-skins/verdant-pavilion-art.webp", imageAlt: "春日亭台绘画" },
      { label: "07 / 细节", title: "茶香、音乐、文章，还有日常的小发现", body: "这里还有东方文化文章、茶与香气、人格探索、测验、画廊、背景音乐与站内导览。繁简中文与英语切换，按手机阅读节奏设计。", image: "/art/scene-osmanthus-tea-v1.webp", imageAlt: "桂花茶意境绘画" },
      { label: "08 / 边界", title: "免登录起步，规则先于象征", body: "输入出生年月日、时间与出生地即可排盘，免登录阅读三段式核心直断；更深入的大运、流年与流月为单次解锁，不设自动续费。真太阳时可选择是否采用。南半球出生或居住，只按当地季节与作息理解，不反转四柱、月令与大运。", image: "/theme-skins/bamboo-falls-art.webp", imageAlt: "飞瀑竹影水墨山水画" }
    ] satisfies Feature[],
  };
  return {
    eyebrow: "走進昭梧 · ZHAOWU",
    title: "讓天時有形，讓命理可讀。",
    summary: "一座隨時間流轉的東方數位世界。宋式美學、節氣物候、當地天氣、天文知識與個人探索，在這裡連成同一種體驗。",
    explore: "昭梧有什麼不同？",
    returnLogin: "返回登入",
    visit: "進入昭梧",
    footer: "知命，不為認命，是為從容。",
    limits: "節氣主題採用悉尼當地的視覺排程。中國傳統七十二候是文化物候意象，並非澳洲天氣預報。目前僅霜降三候具有各自專門製作的畫作，其他節氣沿用既有畫作。",
    features: [
      { label: "01 / 美學", title: "一座宋式畫卷般的網站", body: "宣紙暖白、礦物青綠、細墨線與克制金線，結合遠山、流水、留白與清晰的宋式排版。畫作、背景、圖示、顏色與閱讀介面屬於一套完整審美，不只是替換一張封面。", image: "/theme-skins/reference-day-flute.webp", imageAlt: "古風吹笛人物山水畫" },
      { label: "02 / 時令", title: "二十四節氣 × 七十二候", body: "啟用節氣自動模式後，依據悉尼日曆日呈現節氣與初、二、三候的傳統物候名稱和對應畫境。尚無專屬原畫的節氣繼續使用已上架的完整主題。", image: "/theme-skins/solar-frost-descent/hero-frost-descent.webp", imageAlt: "霜降節氣繪畫" },
      { label: "03 / 所在地", title: "今天的天空，從你所在的地方開始", body: "今日指引可透過定位許可或概略所在地顯示當地時間、氣溫、天氣與南北半球季節。真實天氣與傳統中國節令分別展示，互不冒充。", image: "/theme-skins/song-gallery-frostleaf-art.webp", imageAlt: "秋日溪谷山水" },
      { label: "04 / 主題", title: "更換的不是圖片，而是一整套畫境", body: "錦鯉、荷舟、竹雨、雲龍、鳳凰等多套畫境由站主發布，帶動全站配色與背景統一變化；也可選擇跟隨節氣的自動模式。", image: "/theme-skins/reference-koi.webp", imageAlt: "錦鯉繪畫" },
      { label: "05 / 命書", title: "一份生辰，讀成一本個人命書", body: "以子平八字為核心，從真太陽時、節氣月令、四柱結構到大運流年依次展開。紫微、七政、西洋與印度占星另有獨立領域，不用象徵敘事覆蓋計算結果。", image: "/theme-skins/moon-lotus-boat-art.webp", imageAlt: "月下荷舟繪畫" },
      { label: "06 / 今日", title: "今日黃曆，與今日星象並肩", body: "每日干支、宜忌、五行穿衣、色彩、靈籤及近期天象集中閱讀；可核對的天文事件與占星象徵解釋分別說明。", image: "/theme-skins/verdant-pavilion-art.webp", imageAlt: "春日亭臺繪畫" },
      { label: "07 / 細節", title: "茶香、音樂、文章，還有日常的小發現", body: "這裡還有東方文化文章、茶與香氣、人格探索、測驗、畫廊、背景音樂與站內導覽。繁簡中文與英語切換，按手機閱讀節奏設計。", image: "/art/scene-osmanthus-tea-v1.webp", imageAlt: "桂花茶意境繪畫" },
      { label: "08 / 邊界", title: "免登入起步，規則先於象徵", body: "輸入出生年月日、時間與出生地即可排盤，免登入閱讀三段式核心直斷；更深入的大運、流年與流月為單次解鎖，不設自動續費。真太陽時可選擇是否採用。南半球出生或居住，只按當地季節與作息理解，不反轉四柱、月令與大運。", image: "/theme-skins/bamboo-falls-art.webp", imageAlt: "飛瀑竹影水墨山水畫" }
    ] satisfies Feature[],
  };
}


// Portable ZIP 2026-10-28: exact four-section three-language editorial copy.
// Original eight illustrated features remain available in the expandable archive.
const EDITORIAL_COPY = {
  "zh-Hant": {
    "pageTitle": "關於昭梧",
    "opening": "讓天時有形，讓命理可讀。",
    "summary": "昭梧整理八字命盤、今日指引與東方文化文章，也以畫作呈現節氣的變化。你可以從出生資料開始認識自己的命盤，或讀一篇文章，看看今天的時令。",
    "sections": [
      [
        "昭梧在做什麼",
        "昭梧以子平八字為核心，將四柱、五行與大運流年的內容分層整理，讓第一次接觸命理的人也能逐步閱讀。計算依據與象徵解讀分別說明，讓你知道一段內容從何而來。"
      ],
      [
        "時間與畫面",
        "節氣與畫作是昭梧的另一條線索。不同時令帶來不同畫面，也讓日常閱讀有一些變化。傳統物候意象與你所在地的實際天氣分開呈現，不把畫中的季節當作天氣預報。"
      ],
      [
        "怎樣使用這裡",
        "第一次來，可以先排一份命盤，也可以直接閱讀文章或今日指引。輸入出生年月日、時間與出生地即可排盤，免登入閱讀三段式核心直斷；更深入的大運、流年與流月為單次解鎖，不設自動續費。"
      ],
      [
        "閱讀之前",
        "命理內容提供理解與思考的角度，不是事件預測，也不替你做決定。醫療、法律與投資等重要問題，仍應尋求相應的專業意見。"
      ]
    ],
    "home": "返回首頁",
    "articles": "閱讀文章",
    "deep": "深入認識昭梧的八個面向",
    "notes": "節氣與排盤說明",
    "calculations": "真太陽時可選擇是否採用。南半球出生或居住，只按當地季節與作息理解，不反轉四柱、月令與大運。"
  },
  "zh-Hans": {
    "pageTitle": "关于昭梧",
    "opening": "让天时有形，让命理可读。",
    "summary": "昭梧整理八字命盘、今日指引与东方文化文章，也以画作呈现节气的变化。你可以从出生资料开始认识自己的命盘，或读一篇文章，看看今天的时令。",
    "sections": [
      [
        "昭梧在做什么",
        "昭梧以子平八字为核心，将四柱、五行与大运流年的内容分层整理，让第一次接触命理的人也能逐步阅读。计算依据与象征解读分别说明，让你知道一段内容从何而来。"
      ],
      [
        "时间与画面",
        "节气与画作是昭梧的另一条线索。不同时令带来不同画面，也让日常阅读有一些变化。传统物候意象与你所在地的实际天气分开呈现，不把画中的季节当作天气预报。"
      ],
      [
        "怎样使用这里",
        "第一次来，可以先排一份命盘，也可以直接阅读文章或今日指引。输入出生年月日、时间与出生地即可排盘，免登录阅读三段式核心直断；更深入的大运、流年与流月为单次解锁，不设自动续费。"
      ],
      [
        "阅读之前",
        "命理内容提供理解与思考的角度，不是事件预测，也不替你做决定。医疗、法律与投资等重要问题，仍应寻求相应的专业意见。"
      ]
    ],
    "home": "返回首页",
    "articles": "阅读文章",
    "deep": "深入了解昭梧的八个面向",
    "notes": "节气与排盘说明",
    "calculations": "真太阳时可选择是否采用。南半球出生或居住，只按当地季节与作息理解，不反转四柱、月令与大运。"
  },
  "en": {
    "pageTitle": "About Zhaowu",
    "opening": "Where the seasons have a form, and destiny becomes readable.",
    "summary": "Zhaowu brings together BaZi charts, daily guidance and essays on Eastern culture, with paintings that reflect the changing seasons. Begin with your birth chart, read an essay, or explore today's seasonal guide.",
    "sections": [
      [
        "What Zhaowu does",
        "Zi Ping BaZi is the starting point. The four pillars, five elements and changing luck cycles are organised into layers, so first-time readers can follow them at their own pace. Calculation rules are kept separate from symbolic interpretation, making the basis of each reading clear."
      ],
      [
        "Time and paintings",
        "Seasons and paintings are another thread through Zhaowu. The scene changes with the season, bringing a little variety to everyday reading. Traditional seasonal imagery is shown separately from the actual weather where you are; a painted season is not a weather forecast."
      ],
      [
        "How to begin",
        "Create a chart, read an essay or look at today's guide. Enter a birth date, time and place to chart without an account and read the free three-part core reading. Deeper luck-cycle, annual and monthly readings unlock once, with no automatic renewal."
      ],
      [
        "Before you read",
        "Destiny readings offer a perspective for reflection, not an event prediction or a decision on your behalf. For medical, legal or investment matters, seek advice from the relevant qualified professional."
      ]
    ],
    "home": "Back to home",
    "articles": "Read the essays",
    "deep": "Explore eight sides of Zhaowu",
    "notes": "A note on seasons and charting",
    "calculations": "True solar time is optional. If you were born or live in the Southern Hemisphere, the site reads local season and daily rhythm only; it does not reverse the four pillars, the month pillar or the luck cycles."
  }
} as const;
type AboutLayout = "booklet" | "ink" | "worktable";
type AboutPalette = "paper" | "jade" | "mineral";
const ABOUT_PALETTES = {
  "paper": {
    "name": "暖紙／松綠",
    "paper": "#faf9f5",
    "ink": "#273b34",
    "muted": "#62675e",
    "line": "#dadcd3",
    "accent": "#345e50"
  },
  "jade": {
    "name": "青瓷／深墨",
    "paper": "#f3f7f1",
    "ink": "#214337",
    "muted": "#607068",
    "line": "#cbd9d0",
    "accent": "#2f6e59"
  },
  "mineral": {
    "name": "礦物／赭褐",
    "paper": "#f8f3eb",
    "ink": "#3d3831",
    "muted": "#766c60",
    "line": "#ded3c6",
    "accent": "#8a5a3d"
  }
} as const;
const ABOUT_LAYOUTS: Array<[AboutLayout,string,string]> = [
  ["booklet","文人冊頁","寬版軸線、宋體與自然留白"],
  ["ink","墨線展讀","加強標題軸線與細線節奏"],
  ["worktable","編輯工作台","較緊湊的段落密度"],
];
function AboutZhaowu() {
  const { locale } = useI18n();
  const detailed = content(locale);
  const editor = EDITORIAL_COPY[locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant"];
  const preview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("stylePreview") === "1";
  const [layout, setLayout] = useState<AboutLayout>("booklet");
  const [palette, setPalette] = useState<AboutPalette>("paper");
  const [controlsVisible, setControlsVisible] = useState(true);
  const swatches = ABOUT_PALETTES[palette];
  const vars = preview ? {
    "--about-paper": swatches.paper,
    "--about-ink": swatches.ink,
    "--about-muted": swatches.muted,
    "--about-line": swatches.line,
    "--about-accent": swatches.accent,
  } as CSSProperties : undefined;
  const reset = () => { setLayout("booklet"); setPalette("paper"); setControlsVisible(true); };
  return <main className="zw-about zw-about-story" data-zhaowu-features-page data-preview-layout={preview ? layout : "booklet"} data-preview-palette={preview ? palette : "paper"} style={vars} aria-labelledby="zw-about-title">
    {preview ? <div className="zw-about-preview-region">
      {controlsVisible ? <aside className="zw-about-preview-controls" aria-label="視覺與色彩設定">
        <details>
          <summary>視覺與色彩設定 <span aria-hidden="true">＋</span></summary>
          <p className="zw-about-preview-disclaimer">僅調整本頁的樣式試讀，不更改全站配色或站主主題。</p>
          <fieldset><legend>01 / 排版方向</legend>
            {ABOUT_LAYOUTS.map(([id, name, note]) => <button key={id} type="button" data-choice="layout" aria-pressed={layout===id} onClick={() => setLayout(id)}><strong>{name}</strong><small>{note}</small></button>)}
          </fieldset>
          <fieldset><legend>02 / 色彩配置</legend>
            {(Object.keys(ABOUT_PALETTES) as AboutPalette[]).map(id => <button key={id} type="button" data-choice="palette" aria-pressed={palette===id} onClick={() => setPalette(id)}><i style={{background:ABOUT_PALETTES[id].accent}} aria-hidden="true"/><strong>{ABOUT_PALETTES[id].name}</strong></button>)}
          </fieldset>
          <dl className="zw-about-preview-swatches">{(Object.keys(swatches).filter(x=>x!=="name") as Array<Exclude<keyof typeof swatches,"name">>).map(k=><div key={k}><dt>{k}</dt><dd>{swatches[k]}</dd></div>)}</dl>
          <div className="zw-about-preview-actions">
            <button type="button" onClick={()=>setControlsVisible(false)}>只看頁面</button>
            <button type="button" onClick={reset}>重設</button>
          </div>
        </details>
      </aside> : <button className="zw-about-preview-open" type="button" onClick={()=>setControlsVisible(true)}>開啟設定</button>}
    </div>:null}
    <header className="zw-about-opening">
      <h1 id="zw-about-title">{editor.pageTitle}</h1>
      <div className="zw-about-opening-copy">
        <p className="zw-about-lead">{editor.opening}</p>
        <p className="zw-about-intro">{editor.summary}</p>
        <figure className="zw-about-figure"><img src="/theme-skins/reference-day-flute.webp" alt={locale==="en"?"A flute player in an original Zhaowu landscape painting":locale==="zh-Hans"?"昭梧原有吹笛人物山水画":"昭梧原有吹笛人物山水畫"} width={1254} height={1254} decoding="async" fetchPriority="high"/></figure>
      </div>
    </header>
    <div className="zw-about-sections">
      {editor.sections.map(([heading, body],i)=><section className="zw-about-section" key={heading} aria-labelledby={`zw-about-section-${i}`}>
        <h2 id={`zw-about-section-${i}`}>{heading}</h2><p>{body}</p>
      </section>)}
    </div>
    <details id="features" className="zw-about-feature-archive">
      <summary>{editor.deep} <span aria-hidden="true">＋</span></summary>
      <div className="zw-about-feature-gallery">
        {detailed.features.map((feature,i)=><article className="zw-about-feature" key={feature.label} data-feature-number={i + 1}>
          <figure className="zw-about-feature-art"><img src={feature.image} alt={feature.imageAlt} width={720} height={720} loading="lazy" decoding="async"/></figure>
          <div className="zw-about-feature-copy"><span className="zw-about-feature-index">{feature.label}</span><h2>{feature.title}</h2><p>{feature.body}</p></div>
        </article>)}
      </div>
    </details>
    <footer className="zw-about-end">
      <nav className="zw-about-ctas" aria-label={editor.pageTitle}>
        <Link to="/">{editor.home}<span aria-hidden="true">↗</span></Link>
        <Link to="/knowledge">{editor.articles}<span aria-hidden="true">→</span></Link>
        <Link to="/login">{detailed.returnLogin}</Link>
      </nav>
      <details className="zw-about-notes"><summary>{editor.notes}</summary><p>{detailed.limits}</p><p>{editor.calculations}</p></details>
      <small>{stoneMark(locale)} · ZHAOWU</small>
    </footer>
  </main>;
}
