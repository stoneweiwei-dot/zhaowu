import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
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
      { label: "06 / TODAY", title: "The almanac beside the sky", body: "Daily almanac, calendar stems and branches, five-element colours, dressing suggestions, spirit slips and recent sky events meet in one guide. Verified astronomical information is kept separate from astrological symbolism.", image: "/theme-skins/verdant-pavilion-art.webp", imageAlt: "Green spring pavilion painting" },
      { label: "07 / CULTURE", title: "The details make the journey", body: "Essays, illustrated collections, tea, scent, self-discovery quizzes, quiet music and an on-site guide invite exploration beyond a single chart. Read on mobile, switch between Traditional Chinese, Simplified Chinese and English.", image: "/art/scene-osmanthus-tea-v1.webp", imageAlt: "Illustration of tea and osmanthus" }
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
      { label: "07 / 细节", title: "茶香、音乐、文章，还有日常的小发现", body: "这里还有东方文化文章、茶与香气、人格探索、测验、画廊、背景音乐与站内导览。繁简中文与英语切换，按手机阅读节奏设计。", image: "/art/scene-osmanthus-tea-v1.webp", imageAlt: "桂花茶意境绘画" }
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
      { label: "07 / 細節", title: "茶香、音樂、文章，還有日常的小發現", body: "這裡還有東方文化文章、茶與香氣、人格探索、測驗、畫廊、背景音樂與站內導覽。繁簡中文與英語切換，按手機閱讀節奏設計。", image: "/art/scene-osmanthus-tea-v1.webp", imageAlt: "桂花茶意境繪畫" }
    ] satisfies Feature[],
  };
}

function AboutZhaowu() {
  const { locale } = useI18n();
  const copy = content(locale);
  return <main className="zw-about" aria-labelledby="zw-about-title" data-zhaowu-features-page>
    <header className="zw-about-hero">
      <img src="/theme-skins/reference-day-flute.webp" alt="" width={1248} height={1248} fetchPriority="high" />
      <div className="zw-about-hero-content">
        <p className="zw-about-eyebrow">{copy.eyebrow}</p>
        <h1 id="zw-about-title">{copy.title}</h1>
        <p className="zw-about-intro">{copy.summary}</p>
        <a className="zw-about-down" href="#features">{copy.explore} <span aria-hidden>↓</span></a>
      </div>
    </header>
    <section id="features" className="zw-about-body" aria-label={copy.explore}>
      {copy.features.map((feature, index) => (
        <article className="zw-about-feature" key={feature.label} data-feature-number={index + 1}>
          <div className="zw-about-feature-art">
            <img src={feature.image} alt={feature.imageAlt} loading="lazy" decoding="async" width={720} height={720}/>
          </div>
          <div className="zw-about-feature-copy">
            <span className="zw-about-feature-index">{feature.label}</span>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </div>
        </article>
      ))}
      <p className="zw-about-note">{copy.limits}</p>
    </section>
    <footer className="zw-about-end">
      <p>{copy.footer}</p>
      <div className="zw-about-ctas">
        <Link to="/" className="zw-about-enter">{copy.visit} <span aria-hidden>→</span></Link>
        <Link to="/login" className="zw-about-back">{copy.returnLogin}</Link>
      </div>
      <small>STONE 原創 · ZHAOWU</small>
    </footer>
  </main>;
}
