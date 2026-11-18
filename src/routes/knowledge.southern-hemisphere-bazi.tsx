import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/knowledge/southern-hemisphere-bazi")({
  component: SouthernHemisphereBaziArticle,
});

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

const PILLAR_RULES = [
  {
    key: "four-pillars",
    label: ["四柱干支與月令", "四柱干支与月令", "Four Pillars & Month Branch"],
    rule: ["不反轉（依太陽黃經節氣時刻）", "不反转（依太阳黄经节气时刻）", "Not inverted (fixed by solar longitude instant)"],
    detail: [
      "二十四節氣由地球繞日軌道的太陽視黃經度數定義（例如立春為黃經 315°、立冬為 225°），全球在同一絕對 UTC 時刻交節，因此南半球出生者的年柱、月柱干支與大運順逆不因南北半球而倒轉半年。",
      "二十四节气由地球绕日轨道的太阳视黄经度数定义（例如立春为黄经 315°、立冬为 225°），全球在同一绝对 UTC 时刻交节，因此南半球出生者的年柱、月柱干支与大运顺逆不因南北半球而倒转半年。",
      "The 24 solar terms are defined by apparent geocentric solar ecliptic longitude (e.g. Start of Spring at 315°, Start of Winter at 225°). Because the astronomical transition occurs at the same global UTC instant, the year pillar, month branch and luck-cycle direction are never inverted by six months in the Southern Hemisphere.",
    ],
  },
  {
    key: "true-solar-time",
    label: ["日柱、時柱與真太陽時", "日柱、时柱与真太阳时", "Day/Hour Pillars & True Solar Time"],
    rule: ["公式相同（留意跨年夏令時）", "公式相同（留意跨年夏令时）", "Same formula (watch cross-year DST)"],
    detail: [
      "日柱與時柱取決於出生當地的太陽位置。經度差（每度 4 分鐘）與均時差公式全球通用；惟澳洲（如悉尼、墨爾本）夏令時落在 10 月至隔年 4 月（UTC+11），排盤時必須以出生當日的實際 UTC 偏移代入。",
      "日柱与时柱取决于出生当地的太阳位置。经度差（每度 4 分钟）与均时差公式全球通用；惟澳洲（如悉尼、墨尔本）夏令时落在 10 月至隔年 4 月（UTC+11），排盘时必须以出生当日的实际 UTC 偏移代入。",
      "The day and hour pillars depend on the local solar meridian. The longitude correction (4 minutes per degree) and equation of time apply identically worldwide, while Australian Daylight Saving Time runs across the calendar year-end (October to April, UTC+11) and must use the actual UTC offset of the birth date.",
    ],
  },
  {
    key: "climate-layer",
    label: ["現實季節、調候與生活作息", "现实季节、调候与生活作息", "Local Season, Climate & Daily Rhythm"],
    rule: ["列為環境校正旁證（不一刀切反轉五行）", "列为环境校正旁证（不一刀切反转五行）", "Environmental calibration layer (never a mechanical element flip)"],
    detail: [
      "南半球 11 月至隔年 2 月日照長、氣溫高，5 月至 8 月偏涼。昭梧在解讀居住或出生於悉尼、墨爾本、奧克蘭等地的命盤時，將當地寒暖燥濕與作息列為獨立的「環境校正層」，不把傳統月令直接改寫為對沖地支。",
      "南半球 11 月至隔年 2 月日照长、气温高，5 月至 8 月偏凉。昭梧在解读居住或出生于悉尼、墨尔本、奥克兰等地的命盘时，将当地寒暖燥湿与作息列为独立的“环境校正层”，不把传统月令直接改写为对冲地支。",
      "From November to February the Southern Hemisphere experiences longer daylight and warmer temperatures, while May to August is cooler. ZHAOWU treats local temperature, humidity and daily rhythm in cities such as Sydney, Melbourne and Auckland as an explicit environmental calibration layer without rewriting the natal month branch.",
    ],
  },
  {
    key: "sun-orientation",
    label: ["空間採光與居住方位", "空间采光与居住方位", "Sunlight Orientation & Living Space"],
    rule: ["區分傳統象義與實際日照路徑", "区分传统象义与实际日照路径", "Separate symbolic direction from actual solar path"],
    detail: [
      "南半球中緯度地區（如悉尼南緯 33.9°）正午太陽偏北，北向窗戶與院落全年得光最穩定。評估住宅與工作空間時，應分開檢視日照採光、海陸風場與傳統方位象徵，不機械套用北半球「坐北朝南才有陽氣」的單一規則。",
      "南半球中纬度地区（如悉尼南纬 33.9°）正午太阳偏北，北向窗户与院落全年得光最稳定。评估住宅与工作空间时，应分开检视日照采光、海陆风场与传统方位象征，不机械套用北半球“坐北朝南才有阳气”的单一规则。",
      "At Southern Hemisphere mid-latitudes (such as Sydney at 33.9°S), the midday Sun transits to the north, making north-facing rooms the primary source of steady daylight. Spatial evaluation separates actual daylight, coastal wind flow and humidity from northern-hemisphere rules of thumb.",
    ],
  },
] as const;

const EXAMPLES = [
  {
    id: "sydney-summer-dst",
    place: ["悉尼（夏令時 UTC+11）", "悉尼（夏令时 UTC+11）", "Sydney (Summer DST · UTC+11)"],
    civil: "1990-01-15 12:00",
    solarTerm: ["小寒後・丑月（不反轉為未月）", "小寒后・丑月（不反转为未月）", "After Minor Cold · Chou month (not flipped)"],
    shift: "−65 min → 10:55",
    climateNote: ["當地盛夏晝長溫高，環境層按夏令作息調適", "当地盛夏昼长温高，环境层按夏令作息调适", "Local mid-summer warmth noted in lifestyle guidance"],
  },
  {
    id: "sydney-winter-std",
    place: ["悉尼（標準時 UTC+10）", "悉尼（标准时 UTC+10）", "Sydney (Standard Time · UTC+10)"],
    civil: "1990-07-15 12:00",
    solarTerm: ["小暑後・未月（不反轉為丑月）", "小暑后・未月（不反转为丑月）", "After Minor Heat · Wei month (not flipped)"],
    shift: "−1 min → 11:59",
    climateNote: ["當地仲冬日照較短，環境層留意保暖與節奏收斂", "当地仲冬日照较短，环境层留意保暖与节奏收敛", "Local winter daylight noted for rest and pacing"],
  },
] as const;

const FAQ_ITEMS = [
  [
    "為什麼昭梧不把南半球的八字月柱直接對沖反轉（例如寅月改申月、子月改午月）？",
    "因為干支紀月錨定的是地球公轉軌道上的太陽黃經交節時刻，這是一個全球同步的天文座標；而南北半球的四季冷暖差異來自地軸傾角造成的日照入射角不同。若把月柱硬性對沖改寫，會同時破壞節氣曆法、藏干結構與大運起運計算，令命盤失去可驗證的單一基準。因此昭梧保留四柱原局不變，將當地季節氣候放在環境校正層獨立說明。",
    "为什么昭梧不把南半球的八字月柱直接对冲反转（例如寅月改申月、子月改午月）？",
    "因为干支纪月锚定的是地球公转轨道上的太阳黄经交节时刻，这是一个全球同步的天文坐标；而南北半球的四季冷暖差异来自地轴倾角造成的日照入射角不同。若把月柱硬性对冲改写，会同时破坏节气历法、藏干结构与大运起运计算，令命盘失去可验证的单一基准。因此昭梧保留四柱原局不变，将当地季节气候放在环境校正层独立说明。",
    "Why doesn't ZHAOWU invert the BaZi month branch by six months for Southern Hemisphere births?",
    "Because the sexagenary month pillar is anchored to solar ecliptic longitude—a globally simultaneous orbital coordinate—whereas seasonal warmth and coolness arise from axial tilt and solar incidence angle. Rewriting the month branch into its opposite sign breaks the calendar boundary, hidden stems and luck-pillar calculation. ZHAOWU therefore keeps the Four Pillars invariant and records local seasonal climate in a separate environmental calibration layer.",
  ],
  [
    "北半球出生、後來移居澳洲或紐西蘭生活，看流年與日常建議時要怎麼看？",
    "本命四柱與大運仍按出生地的真太陽時與交節時刻排定；而在閱讀日常作息、空間採光與當季身體提醒時，則以目前實際居住地（如悉尼、墨爾本、布里斯本）的季節、日照與氣候為準，不把搬家當成改寫生辰八字。",
    "北半球出生、后来移居澳洲或新西兰生活，看流年与日常建议时要怎么看？",
    "本命四柱与大运仍按出生地的真太阳时与交节时刻排定；而在阅读日常作息、空间采光与当季身体提醒时，则以目前实际居住地（如悉尼、墨尔本、布里斯本）的季节、日照与气候为准，不把搬家当成改写生辰八字。",
    "If I was born in the Northern Hemisphere and now live in Australia or New Zealand, how should I read my chart?",
    "Your natal Four Pillars and luck cycles remain fixed by your birthplace's true solar time and solar-term instant. Daily rhythm, spatial daylight and seasonal wellbeing notes follow your current city of residence (such as Sydney, Melbourne or Brisbane) without altering your birth chart.",
  ],
  [
    "網路上常見「南半球火氣折減係數」或「科里奧利力改寫五行」可以採信嗎？",
    "昭梧不採用任何未經公開推導與實測驗證的偽造常數。天文座標（太陽黃經、均時差、經度時差、太陽仰角）屬於可驗證的天文事實；子平十神與旺衰屬於傳統命理模型；居住地的溫度、濕度與採光則是生活環境條件。三者分層標示，不混充科學定律。",
    "网络上常见“南半球火气折减系数”或“科里奥利力改写五行”可以采信吗？",
    "昭梧不采用任何未经公开推导与实测验证的伪造常数。天文坐标（太阳黄经、均时差、经度时差、太阳仰角）属于可验证的天文事实；子平十神与旺衰属于传统命理模型；居住地的温度、湿度与采光则是生活环境条件。三者分层标示，不混充科学定律。",
    "Are online claims about 'Southern Hemisphere fire-element discount coefficients' or Coriolis-force element flips reliable?",
    "ZHAOWU rejects unverified numerical coefficients that dress up symbolism as physics. Astronomical coordinates (solar longitude, equation of time, solar altitude) are verifiable facts; Ziping ten-gods and element balance are traditional interpretive models; local temperature, humidity and daylight are practical environmental conditions. Keeping these three layers distinct prevents pseudoscientific confusion.",
  ],
] as const;

function SouthernHemisphereBaziArticle() {
  const { locale } = useI18n();

  return (
    <main className="mx-auto max-w-4xl space-y-5 pb-16" data-southern-hemisphere-bazi-page>
      <article className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <Link to="/knowledge" className="text-sm text-cinnabar">
          {tr(locale, "← 返回昭梧 · 知識庫", "← 返回昭梧 · 知识库", "← Back to ZHAOWU Knowledge")}
        </Link>
        <p className="mt-5 text-xs tracking-[0.24em] text-cinnabar">
          {tr(locale, "昭梧 · 南半球專題與判讀邊界", "昭梧 · 南半球专题与判读边界", "ZHAOWU · SOUTHERN HEMISPHERE BAZI GUIDE")}
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
          {tr(
            locale,
            "南半球八字怎麼排？澳洲／紐西蘭節氣、真太陽時與季節環境校正",
            "南半球八字怎么排？澳洲／新西兰节气、真太阳时与季节环境校正",
            "Southern Hemisphere BaZi: Solar Terms, True Solar Time and Seasonal Calibration",
          )}
        </h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-ink-soft">
          {tr(
            locale,
            "在悉尼、墨爾本、布里斯本或奧克蘭出生與生活的人，排八字時最常遇到兩個疑問：月令要不要倒轉半年？夏令時怎麼算？本頁把「全球同步的天文交節時刻」、「當地經度與夏令時的真太陽時校正」以及「南半球實際四季作息的環境校正」三層規則分開說明。",
            "在悉尼、墨尔本、布里斯本或奥克兰出生与生活的人，排八字时最常遇到两个疑问：月令要不要倒转半年？夏令时怎么算？本页把“全球同步的天文交节时刻”、“当地经度与夏令时的真太阳时校正”以及“南半球实际四季作息的环境校正”三层规则分开说明。",
            "For anyone born or living in Sydney, Melbourne, Brisbane or Auckland, two questions arise repeatedly: should the BaZi month pillar be flipped by six months, and how does southern Daylight Saving Time affect the hour pillar? This guide separates global solar-term instants, local true solar time, and practical seasonal calibration.",
          )}
        </p>
      </article>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {tr(locale, "一、四條核心判讀原則", "一、四条核心判读原则", "1. Four Core Rules in ZHAOWU")}
        </h2>
        <div className="mt-4 space-y-3">
          {PILLAR_RULES.map((item, idx) => (
            <div key={item.key} className="rounded-xl border border-earth/25 bg-paper px-4 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-ink">
                  <span className="mr-2 text-cinnabar">{idx + 1}.</span>
                  {tr(locale, item.label[0], item.label[1], item.label[2])}
                </h3>
                <span className="rounded-full border border-cinnabar/30 bg-cream px-3 py-0.5 text-xs font-medium text-cinnabar">
                  {tr(locale, item.rule[0], item.rule[1], item.rule[2])}
                </span>
              </div>
              <p className="mt-2 text-[15px] leading-7 text-ink-soft">
                {tr(locale, item.detail[0], item.detail[1], item.detail[2])}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {tr(locale, "二、悉尼冬夏實例對照（151.21°E）", "二、悉尼冬夏实例对照（151.21°E）", "2. Sydney Summer vs Winter Worked Comparison (151.21°E)")}
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">
          {tr(
            locale,
            "以下對照同在悉尼（東經 151.21°）、同樣手錶正午 12:00 出生的兩個案例，呈現真太陽時偏移、傳統節氣月柱與當地季節環境層的分工：",
            "以下对照同在悉尼（东经 151.21°）、同样手表正午 12:00 出生的两个案例，呈现真太阳时偏移、传统节气月柱与当地季节环境层的分工：",
            "Comparing two noon births at the same Sydney longitude (151.21°E) shows how true solar time, the traditional solar-term month branch, and local seasonal context work together without conflict:",
          )}
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-earth/25 bg-cream">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-earth/25 text-xs text-ink-soft">
                <th scope="col" className="px-3 py-2.5 font-medium">{tr(locale, "案例與時區", "案例与时区", "Case & Timezone")}</th>
                <th scope="col" className="px-3 py-2.5 font-medium">{tr(locale, "民用鐘點", "民用钟点", "Civil Clock")}</th>
                <th scope="col" className="px-3 py-2.5 font-medium">{tr(locale, "真太陽時校正", "真太阳时校正", "True Solar Shift")}</th>
                <th scope="col" className="px-3 py-2.5 font-medium">{tr(locale, "節氣與月令規則", "节气与月令规则", "Solar Term & Month Branch")}</th>
                <th scope="col" className="px-3 py-2.5 font-medium">{tr(locale, "南半球環境校正層", "南半球环境校正层", "Southern Environment Layer")}</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLES.map((row) => (
                <tr key={row.id} className="border-b border-earth/15 last:border-0">
                  <th scope="row" className="px-3 py-2.5 font-medium text-ink">{tr(locale, row.place[0], row.place[1], row.place[2])}</th>
                  <td className="px-3 py-2.5 tabular-nums text-ink-soft">{row.civil}</td>
                  <td className="px-3 py-2.5 tabular-nums font-semibold text-cinnabar">{row.shift}</td>
                  <td className="px-3 py-2.5 text-ink-soft">{tr(locale, row.solarTerm[0], row.solarTerm[1], row.solarTerm[2])}</td>
                  <td className="px-3 py-2.5 text-ink-soft">{tr(locale, row.climateNote[0], row.climateNote[1], row.climateNote[2])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8" data-faq>
        <h2 className="font-display text-2xl text-ink">
          {tr(locale, "三、常見問題與方法邊界", "三、常见问题与方法边界", "3. Frequently Asked Questions & Methodological Boundaries")}
        </h2>
        <div className="mt-4 space-y-4">
          {FAQ_ITEMS.map(([qHant, aHant, qHans, aHans, qEn, aEn]) => (
            <div key={qHant} className="rounded-xl border border-earth/25 bg-paper px-4 py-4">
              <h3 className="text-base font-semibold text-ink">{tr(locale, qHant, qHans, qEn)}</h3>
              <p className="mt-2 text-[15px] leading-7 text-ink-soft">{tr(locale, aHant, aHans, aEn)}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <a href="/#birth-form" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-cream px-5 py-4 text-sm text-ink">
          <span>{tr(locale, "免費排盤（支援南半球城市）", "免费排盘（支持南半球城市）", "Free chart (Southern cities supported)")}</span>
          <span className="text-cinnabar">→</span>
        </a>
        <Link to="/knowledge/true-solar-time" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-paper px-5 py-4 text-sm text-ink">
          <span>{tr(locale, "查看真太陽時完整公式", "查看真太阳时完整公式", "True Solar Time formula & examples")}</span>
          <span className="text-cinnabar">→</span>
        </Link>
        <Link to="/knowledge" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-paper px-5 py-4 text-sm text-ink">
          <span>{tr(locale, "返回知識庫總覽", "返回知识库总览", "Back to Knowledge Base")}</span>
          <span className="text-cinnabar">→</span>
        </Link>
      </div>
    </main>
  );
}
