import { useI18n, type Locale } from "@/lib/i18n";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

type Triple = readonly [string, string, string];

const ENVIRONMENT_SYMBOLS: readonly {
  star: Triple;
  examples: Triple;
  explanation: Triple;
}[] = [
  {
    star: ["紫微", "紫微", "Zi Wei"],
    examples: ["行政機關、高樓、較正式的商業場所", "行政机关、高楼、较正式的商业场所", "Government offices, high-rises and formal commercial districts"],
    explanation: ["取統領、中心與高位之象。", "取统领、中心与高位之象。", "An image of authority, centrality and prominence."],
  },
  {
    star: ["天機", "天机", "Tian Ji"],
    examples: ["園林、樹木、道路與交通流動地帶", "园林、树木、道路与交通流动地带", "Gardens, trees, roads and active transport routes"],
    explanation: ["取機巧、變動與枝葉之象；不同流派對地物的對應並不一致。", "取机巧、变动与枝叶之象；不同流派对地物的对应并不一致。", "Movement, branching and change; schools differ on specific places."],
  },
  {
    star: ["太陽", "太阳", "Tai Yang"],
    examples: ["學校、電器設施、明亮或開闊地帶", "学校、电器设施、明亮或开阔地带", "Schools, electrical facilities and bright open areas"],
    explanation: ["取光明、外顯與公共活動之象。", "取光明、外显与公共活动之象。", "Visibility, light and public activity."],
  },
  {
    star: ["武曲", "武曲", "Wu Qu"],
    examples: ["金融機構、五金商店、警政設施", "金融机构、五金商店、警政设施", "Financial offices, hardware shops and police facilities"],
    explanation: ["取金屬、規範及財務管理之象。", "取金属、规范及财务管理之象。", "Metalwork, discipline and financial management."],
  },
  {
    star: ["天同", "天同", "Tian Tong"],
    examples: ["小吃店、休憩場所、小池塘", "小吃店、休憩场所、小池塘", "Casual eateries, leisure spaces and small ponds"],
    explanation: ["取日常生活、舒適與柔和水景之象。", "取日常生活、舒适与柔和水景之象。", "Everyday comfort and gentle waterside imagery."],
  },
  {
    star: ["廉貞", "廉贞", "Lian Zhen"],
    examples: ["軍警或受管理的公共設施、果園", "军警或受管理的公共设施、果园", "Regulated public facilities, military/police sites and orchards"],
    explanation: ["部分現代取象涉及管理、秩序及受限制場域；不據此推斷治安好壞。", "部分现代取象涉及管理、秩序及受限制场域；不据此推断治安好坏。", "Some modern mappings concern regulated spaces; this is not a crime or safety forecast."],
  },
  {
    star: ["天府", "天府", "Tian Fu"],
    examples: ["山坡、高樓、金融或集中儲藏設施", "山坡、高楼、金融或集中储藏设施", "Hillsides, tall buildings, finance and storage sites"],
    explanation: ["取庫藏、承載與穩定資源之象。", "取库藏、承载与稳定资源之象。", "Storage, resources and containment."],
  },
  {
    star: ["太陰", "太阴", "Tai Yin"],
    examples: ["庭園、水塘、旅館與較幽靜住宅", "庭园、水塘、旅馆与较幽静住宅", "Gardens, ponds, accommodation and quieter housing"],
    explanation: ["取陰柔、內聚、水與居住空間之象。", "取阴柔、内聚、水与居住空间之象。", "Privacy, water and domestic space."],
  },
  {
    star: ["貪狼", "贪狼", "Tan Lang"],
    examples: ["大樹、餐飲娛樂場所、夜間商圈", "大树、餐饮娱乐场所、夜间商圈", "Large trees, entertainment venues and nightlife areas"],
    explanation: ["取生發、社交與熱鬧活動之象。", "取生发、社交与热闹活动之象。", "Growth, social life and lively activity."],
  },
  {
    star: ["巨門", "巨门", "Ju Men"],
    examples: ["醫院、藥局、工地、鐵路與暗渠", "医院、药房、工地、铁路与暗渠", "Hospitals, pharmacies, building sites, rail and drainage channels"],
    explanation: ["取出入口、遮蔽、溝通及大型構造之象；不可用來推斷疾病。", "取出入口、遮蔽、沟通及大型构造之象；不可用来推断疾病。", "Passages, concealed structures and communication; not a health prediction."],
  },
  {
    star: ["天相", "天相", "Tian Xiang"],
    examples: ["較講究的餐廳、服飾商店、噴泉", "较讲究的餐厅、服饰商店、喷泉", "Restaurants, fashion shops and fountains"],
    explanation: ["取服務、陳設、協調與儀式感之象。", "取服务、陈设、协调与仪式感之象。", "Service, presentation and orderly surroundings."],
  },
  {
    star: ["天梁", "天梁", "Tian Liang"],
    examples: ["老樹、寺廟、傳統建築或公共服務場所", "老树、寺庙、传统建筑或公共服务场所", "Mature trees, temples, heritage buildings and public services"],
    explanation: ["取庇護、長久、長者與傳統之象。", "取庇护、长久、长者与传统之象。", "Protection, longevity and tradition."],
  },
  {
    star: ["七殺", "七杀", "Qi Sha"],
    examples: ["較高地勢、鐵路、軍警設施、市集", "较高地势、铁路、军警设施、市集", "Elevated ground, railways, military/police sites and markets"],
    explanation: ["取剛硬、行動、交通及管制之象。", "取刚硬、行动、交通及管制之象。", "Movement, hard infrastructure and control."],
  },
  {
    star: ["破軍", "破军", "Po Jun"],
    examples: ["海岸、大排水道、碼頭、市場與貨櫃區", "海岸、大排水道、码头、市场与货柜区", "Coasts, drains, ports, markets and container yards"],
    explanation: ["取水勢、拆舊更新、流動與重整之象。", "取水势、拆旧更新、流动与重整之象。", "Water, disruption and renewal."],
  },
];

export function ZiweiHomeEnvironmentArticle() {
  const { locale } = useI18n();

  return (
    <section id="ziwei-home-environment" className="seal-border rounded-2xl bg-paper p-5 sm:p-8" aria-labelledby="ziwei-home-environment-title">
      <p className="text-xs tracking-[0.22em] text-cinnabar">
        {tr(locale, "紫微斗數 · 田宅宮專題", "紫微斗数 · 田宅宫专题", "ZI WEI · HOME & SURROUNDINGS")}
      </p>
      <h2 id="ziwei-home-environment-title" className="mt-2 font-display text-2xl leading-tight text-ink sm:text-3xl">
        {tr(locale, "住家附近有什麼？十四主星的環境取象", "住家附近有什么？十四主星的环境取象", "What is near your home? The 14 major stars")}
      </h2>
      <p className="mt-3 text-[15px] leading-7 text-ink-soft">
        {tr(
          locale,
          "田宅宮傳統上關乎家宅、土地與家業；將主星延伸到附近的學校、銀行、樹木、水道等，是近現代流派的環境取象。這些對應可以拿來觀察、記錄，不能憑單星認定附近一定有某類建築。",
          "田宅宫传统上关乎家宅、土地与家业；将主星延伸到附近的学校、银行、树木、水道等，是近现代流派的环境取象。这些对应可以拿来观察、记录，不能凭单星认定附近一定有某类建筑。",
          "The Property Palace traditionally concerns home, land and family property. Mapping its stars to nearby buildings and terrain is a modern symbolic practice: useful for observation, not reliable proof of what exists nearby."
        )}
      </p>

      <details className="mt-5 rounded-xl border border-line bg-cream open:bg-paper">
        <summary className="cursor-pointer px-4 py-4 text-base font-semibold text-ink">
          {tr(locale, "展開十四主星對照與讀法", "展开十四主星对照与读法", "Open the 14-star guide")}
          <span className="ml-2 text-cinnabar" aria-hidden="true">＋</span>
        </summary>
        <div className="space-y-5 border-t border-line px-4 pb-5 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {ENVIRONMENT_SYMBOLS.map((item) => (
              <article key={item.star[0]} className="rounded-xl border border-line bg-paper p-4">
                <h3 className="font-display text-xl text-ink">{tr(locale, ...item.star)}</h3>
                <p className="mt-2 text-[15px] leading-7 text-ink">{tr(locale, ...item.examples)}</p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{tr(locale, ...item.explanation)}</p>
              </article>
            ))}
          </div>
          <div>
            <h3 className="font-display text-xl text-ink">{tr(locale, "怎樣核對才有意義", "怎样核对才有意义", "A sensible way to check")}</h3>
            <p className="mt-2 text-[15px] leading-7 text-ink-soft">
              {tr(
                locale,
                "先確認出生時間與田宅宮落星，再看同宮星曜、四化、輔煞和三方四正。實際查地圖或走訪時，先固定觀察半徑與分類標準，記錄符合及不符合的設施；不要看見一項便算命中。沒有足夠對照案例之前，不評估命中率。",
                "先确认出生时间与田宅宫落星，再看同宫星曜、四化、辅煞和三方四正。实际查地图或走访时，先固定观察半径与分类标准，记录符合及不符合的设施；不要看见一项便算命中。没有足够对照案例之前，不评估命中率。",
                "Verify birth-time accuracy and the Property Palace first, then assess accompanying stars, transformations and palace relationships. Set a fixed search radius and clear categories, record both matches and misses, and avoid success-rate claims without a proper comparison sample."
              )}
            </p>
          </div>
          <p className="text-sm leading-7 text-ink-soft">
            {tr(
              locale,
              "邊界：不同流派對單星地物取象有差異；五行局數換算幾百米或幾公里等說法，目前缺少可驗證的統計依據。買房、租屋或搬遷，仍以實際地段、交通、噪音、安全、預算及契約為準。",
              "边界：不同流派对单星地物取象有差异；五行局数换算几百米或几公里等说法，目前缺少可验证的统计依据。买房、租房或搬迁，仍以实际地段、交通、噪音、安全、预算及合同为准。",
              "Limitations: schools assign different places to the same star. Claims that bureau numbers determine distances in metres or kilometres lack robust validation. Choose housing by real-world location, transport, noise, safety, budget and contract terms."
            )}
          </p>
        </div>
      </details>

      <p className="mt-4 text-xs leading-6 text-ink-soft">
        {tr(locale, "來源層級：現代紫微斗數環境象意整理，非古籍定論；以下為延伸參考，並非原 Instagram 貼文逐字轉錄。", "来源层级：现代紫微斗数环境象意整理，非古籍定论；以下为延伸参考，并非原 Instagram 帖文逐字转录。", "Source level: modern interpretive symbolism, not a classical rule or a verbatim transcript of the Instagram post.")}
        {" "}
        <a className="text-cinnabar underline underline-offset-2" href="https://www.ziweicn.com/show/3427.html" target="_blank" rel="noopener noreferrer">
          {tr(locale, "環境取象資料（2018）", "环境取象资料（2018）", "Environment mappings (2018)")}
        </a>
        {" · "}
        <a className="text-cinnabar underline underline-offset-2" href="https://www.youtube.com/watch?v=MsiZyS0Khd0" target="_blank" rel="noopener noreferrer">
          {tr(locale, "十四主星教學（2021）", "十四主星教学（2021）", "14-star teaching (2021)")}
        </a>
        {" · "}
        <a className="text-cinnabar underline underline-offset-2" href="https://www.instagram.com/p/DeKEZlpT0mc/" target="_blank" rel="noopener noreferrer">
          {tr(locale, "站主提供的參考貼文", "站主提供的参考帖文", "Owner-supplied reference")}
        </a>
      </p>
    </section>
  );
}
