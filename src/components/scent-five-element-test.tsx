import { useMemo, useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import type { AnalysisResult, Element } from "@/lib/bazi/types";

type ScentKey =
  | "white-tea"
  | "citrus"
  | "osmanthus"
  | "rain-mineral"
  | "pine"
  | "bamboo"
  | "green-herb"
  | "basil"
  | "sea-salt"
  | "seaweed"
  | "spring-water"
  | "mint"
  | "cinnamon"
  | "clove"
  | "roast-coffee"
  | "soft-smoke"
  | "vanilla"
  | "honey-grain"
  | "patchouli"
  | "vetiver-earth";

type ScentItem = {
  elements: Element[];
  label: Record<Locale, string>;
};

const ELEMENT_ORDER: Element[] = ["金", "木", "水", "火", "土"];

const SCENTS: Record<ScentKey, ScentItem> = {
  "white-tea": { elements: ["金"], label: { "zh-Hant": "白茶、乾淨茶氣", "zh-Hans": "白茶、干净茶气", en: "White tea, clean tea notes" } },
  citrus: { elements: ["金", "木"], label: { "zh-Hant": "檸檬、柑橘的清亮果皮", "zh-Hans": "柠檬、柑橘的清亮果皮", en: "Lemon and bright citrus peel" } },
  osmanthus: { elements: ["金", "土"], label: { "zh-Hant": "桂花的清甜花氣", "zh-Hans": "桂花的清甜花气", en: "Clear, lightly sweet osmanthus" } },
  "rain-mineral": { elements: ["金", "水"], label: { "zh-Hant": "雨後空氣、冷冽礦石感", "zh-Hans": "雨后空气、冷冽矿石感", en: "Rain-clean air and cool mineral notes" } },
  pine: { elements: ["木"], label: { "zh-Hant": "松木、雪松、森林木質", "zh-Hans": "松木、雪松、森林木质", en: "Pine, cedar and forest woods" } },
  bamboo: { elements: ["木", "水"], label: { "zh-Hant": "竹葉、清綠植物氣", "zh-Hans": "竹叶、清绿植物气", en: "Bamboo leaf and fresh green notes" } },
  "green-herb": { elements: ["木"], label: { "zh-Hant": "青草、嫩葉、自然草本", "zh-Hans": "青草、嫩叶、自然草本", en: "Fresh grass, young leaves and herbs" } },
  basil: { elements: ["木", "火"], label: { "zh-Hant": "羅勒、芳香草本", "zh-Hans": "罗勒、芳香草本", en: "Basil and aromatic herbs" } },
  "sea-salt": { elements: ["水"], label: { "zh-Hant": "海鹽、清冷海風", "zh-Hans": "海盐、清冷海风", en: "Sea salt and cool ocean air" } },
  seaweed: { elements: ["水", "木"], label: { "zh-Hant": "海藻、潮濕海岸氣息", "zh-Hans": "海藻、潮湿海岸气息", en: "Seaweed and damp coastal notes" } },
  "spring-water": { elements: ["水", "金"], label: { "zh-Hant": "山泉、冷水、透明水感", "zh-Hans": "山泉、冷水、透明水感", en: "Spring water, cool and transparent aquatic notes" } },
  mint: { elements: ["水", "木"], label: { "zh-Hant": "薄荷的清涼草本感", "zh-Hans": "薄荷的清凉草本感", en: "Cool green mint" } },
  cinnamon: { elements: ["火", "土"], label: { "zh-Hant": "肉桂的辛暖甜香", "zh-Hans": "肉桂的辛暖甜香", en: "Warm, spicy cinnamon" } },
  clove: { elements: ["火"], label: { "zh-Hant": "丁香、溫熱辛香", "zh-Hans": "丁香、温热辛香", en: "Clove and warm spice" } },
  "roast-coffee": { elements: ["火", "土"], label: { "zh-Hant": "咖啡焦香、烘焙氣息", "zh-Hans": "咖啡焦香、烘焙气息", en: "Roasted coffee and baked notes" } },
  "soft-smoke": { elements: ["火", "金"], label: { "zh-Hant": "淡煙燻、木炭暖香", "zh-Hans": "淡烟熏、木炭暖香", en: "Soft smoke and warm charcoal notes" } },
  vanilla: { elements: ["土"], label: { "zh-Hant": "香草、柔厚甜香", "zh-Hans": "香草、柔厚甜香", en: "Vanilla and soft rounded sweetness" } },
  "honey-grain": { elements: ["土"], label: { "zh-Hant": "蜂蜜、穀物、麥香", "zh-Hans": "蜂蜜、谷物、麦香", en: "Honey, grain and cereal notes" } },
  patchouli: { elements: ["土", "木"], label: { "zh-Hant": "廣藿香、濕土根系感", "zh-Hans": "广藿香、湿土根系感", en: "Patchouli and damp-root earthiness" } },
  "vetiver-earth": { elements: ["土", "木"], label: { "zh-Hant": "岩蘭草、泥土、大地根香", "zh-Hans": "岩兰草、泥土、大地根香", en: "Vetiver, soil and rooted earth notes" } },
};

const GROUP_COPY: Record<Element, Record<Locale, { title: string; sensory: string; symbol: string }>> = {
  金: {
    "zh-Hant": { title: "清冽・礦物・乾淨", sensory: "你容易被俐落、透明、乾淨、有邊界的氣味吸引。", symbol: "文化象意偏向收斂、辨別、質感與清晰邊界。" },
    "zh-Hans": { title: "清冽・矿物・干净", sensory: "你容易被利落、透明、干净、有边界的气味吸引。", symbol: "文化象意偏向收敛、辨别、质感与清晰边界。" },
    en: { title: "Crisp · mineral · clean", sensory: "You tend to like scents that feel clear, precise, transparent and well defined.", symbol: "In the five-element cultural vocabulary, this leans toward refinement, discernment and clear boundaries." },
  },
  木: {
    "zh-Hant": { title: "綠意・草本・生長", sensory: "你容易被有生命感、植物感、伸展感的氣味吸引。", symbol: "文化象意偏向生發、方向、成長、規劃與自然延展。" },
    "zh-Hans": { title: "绿意・草本・生长", sensory: "你容易被有生命感、植物感、伸展感的气味吸引。", symbol: "文化象意偏向生发、方向、成长、规划与自然延展。" },
    en: { title: "Green · herbal · growing", sensory: "You tend to like living, botanical scents with a sense of growth and movement.", symbol: "In the five-element cultural vocabulary, this leans toward growth, direction, planning and organic expansion." },
  },
  水: {
    "zh-Hant": { title: "海洋・濕潤・冷感・流動", sensory: "你容易被清涼、濕潤、流動、留白感較強的氣味吸引。", symbol: "文化象意偏向流動、感受、轉換、深度與空間感。" },
    "zh-Hans": { title: "海洋・湿润・冷感・流动", sensory: "你容易被清凉、湿润、流动、留白感较强的气味吸引。", symbol: "文化象意偏向流动、感受、转换、深度与空间感。" },
    en: { title: "Aquatic · cool · fluid", sensory: "You tend to like cool, moist, spacious scents that feel mobile rather than fixed.", symbol: "In the five-element cultural vocabulary, this leans toward flow, depth, adaptation and emotional space." },
  },
  火: {
    "zh-Hant": { title: "辛暖・烘焙・焦香・煙燻", sensory: "你容易被有溫度、擴散力、辛香或烘焙感的氣味吸引。", symbol: "文化象意偏向顯化、表達、溫度、行動與被看見。" },
    "zh-Hans": { title: "辛暖・烘焙・焦香・烟熏", sensory: "你容易被有温度、扩散力、辛香或烘焙感的气味吸引。", symbol: "文化象意偏向显化、表达、温度、行动与被看见。" },
    en: { title: "Warm · roasted · smoky · spicy", sensory: "You tend to like scents with warmth, projection, spice or a roasted edge.", symbol: "In the five-element cultural vocabulary, this leans toward expression, visibility, warmth and action." },
  },
  土: {
    "zh-Hant": { title: "甜厚・穀物・泥土・根系", sensory: "你容易被有厚度、包覆感、穩定感與大地質地的氣味吸引。", symbol: "文化象意偏向承載、整合、落實、穩定與長期累積。" },
    "zh-Hans": { title: "甜厚・谷物・泥土・根系", sensory: "你容易被有厚度、包覆感、稳定感与大地质地的气味吸引。", symbol: "文化象意偏向承载、整合、落实、稳定与长期累积。" },
    en: { title: "Rounded · grain · earth · root", sensory: "You tend to like scents with body, grounded texture, softness and a sense of stability.", symbol: "In the five-element cultural vocabulary, this leans toward support, integration, steadiness and long-term accumulation." },
  },
};

const COPY: Record<Locale, {
  kicker: string;
  title: string;
  lead: string;
  instruction: string;
  selected: string;
  submit: string;
  reset: string;
  needMore: string;
  primary: string;
  secondary: string;
  sensory: string;
  symbolic: string;
  bazi: string;
  noBazi: string;
  baziSame: string;
  baziSecondary: string;
  baziDifferent: string;
  provisional: string;
  disclaimer: string;
}> = {
  "zh-Hant": {
    kicker: "FUN TEST · 五行香氣譜",
    title: "你偏好的氣味，對應哪種感官能量？",
    lead: "選出你真的會想靠近的氣味。這裡看的是嗅覺偏好與五行文化象意，不把香氣喜好當成身體缺什麼。",
    instruction: "請選 3–7 種最喜歡的氣味",
    selected: "已選",
    submit: "看我的香氣主調",
    reset: "重新選擇",
    needMore: "至少選 3 種，才有足夠的偏好訊號。",
    primary: "香氣主調",
    secondary: "副調",
    sensory: "感官傾向",
    symbolic: "五行文化象意",
    bazi: "與八字結構對照",
    noBazi: "目前先保留為感官與文化象意。首頁完成一次出生資料與八字分析後，這裡會自動加入命局調候／病藥方向的對照。",
    baziSame: "你的香氣主調，與目前八字分析中的有利調節方向同向。這是偏好與命局結構的對照，不代表身體缺少這個五行。",
    baziSecondary: "你的副調與目前八字分析中的有利調節方向有交集。香氣偏好可以作為生活環境的參考，但不取代命局病藥判斷。",
    baziDifferent: "你的香氣主調與目前八字分析中的有利調節方向並不重合。這很正常：喜歡的味道與命局結構需要本來就是兩件不同的事。",
    provisional: "目前八字的調節方向仍屬暫定，因此此處只作低權重對照。",
    disclaimer: "香氣偏好只反映感官與文化傾向，不代表醫學上的五行不足、臟腑虛弱或疾病。",
  },
  "zh-Hans": {
    kicker: "FUN TEST · 五行香气谱",
    title: "你偏好的气味，对应哪种感官能量？",
    lead: "选出你真的会想靠近的气味。这里看的是嗅觉偏好与五行文化象意，不把香气喜好当成身体缺什么。",
    instruction: "请选择 3–7 种最喜欢的气味",
    selected: "已选",
    submit: "看我的香气主调",
    reset: "重新选择",
    needMore: "至少选 3 种，才有足够的偏好讯号。",
    primary: "香气主调",
    secondary: "副调",
    sensory: "感官倾向",
    symbolic: "五行文化象意",
    bazi: "与八字结构对照",
    noBazi: "目前先保留为感官与文化象意。首页完成一次出生资料与八字分析后，这里会自动加入命局调候／病药方向的对照。",
    baziSame: "你的香气主调，与目前八字分析中的有利调节方向同向。这是偏好与命局结构的对照，不代表身体缺少这个五行。",
    baziSecondary: "你的副调与目前八字分析中的有利调节方向有交集。香气偏好可以作为生活环境的参考，但不取代命局病药判断。",
    baziDifferent: "你的香气主调与目前八字分析中的有利调节方向并不重合。这很正常：喜欢的味道与命局结构需要本来就是两件不同的事。",
    provisional: "目前八字的调节方向仍属暂定，因此此处只作低权重对照。",
    disclaimer: "香气偏好只反映感官与文化倾向，不代表医学上的五行不足、脏腑虚弱或疾病。",
  },
  en: {
    kicker: "FUN TEST · FIVE-ELEMENT SCENT MAP",
    title: "What kind of sensory energy do your favourite scents lean toward?",
    lead: "Choose the scents you genuinely want to be around. This compares scent preference with five-element cultural imagery; it does not treat fragrance preference as a bodily deficiency.",
    instruction: "Choose 3–7 scents you like most",
    selected: "Selected",
    submit: "Show my scent profile",
    reset: "Choose again",
    needMore: "Choose at least three scents so there is enough preference signal.",
    primary: "Primary scent tone",
    secondary: "Secondary tone",
    sensory: "Sensory tendency",
    symbolic: "Five-element cultural imagery",
    bazi: "BaZi structure comparison",
    noBazi: "For now this stays a sensory and cultural result. Once a birth record and BaZi reading are created on the homepage, this section automatically adds a comparison with the chart's adjustment direction.",
    baziSame: "Your primary scent tone points in the same direction as the current BaZi adjustment preference. This is only a comparison between preference and chart structure; it does not mean your body lacks this element.",
    baziSecondary: "Your secondary scent tone overlaps with the current BaZi adjustment preference. Scent can be a lifestyle reference, but it does not replace structural BaZi analysis.",
    baziDifferent: "Your scent preference does not match the current BaZi adjustment preference. That is normal: what you enjoy smelling and what the chart structurally needs are not the same thing.",
    provisional: "The current BaZi adjustment direction is provisional, so this comparison remains low-weight.",
    disclaimer: "Scent preference reflects sensory and cultural tendencies only. It does not diagnose element deficiency, organ weakness or disease.",
  },
};

export function ScentFiveElementTest({ result }: { result: AnalysisResult | null }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [selected, setSelected] = useState<ScentKey[]>([]);
  const [revealed, setRevealed] = useState(false);

  const ranking = useMemo(() => {
    const counts = Object.fromEntries(ELEMENT_ORDER.map((element) => [element, 0])) as Record<Element, number>;
    selected.forEach((key) => {
      SCENTS[key].elements.forEach((element) => {
        counts[element] += 1;
      });
    });
    return [...ELEMENT_ORDER].sort((a, b) => counts[b] - counts[a] || ELEMENT_ORDER.indexOf(a) - ELEMENT_ORDER.indexOf(b));
  }, [selected]);

  const primary = ranking[0];
  const secondary = ranking.find((element) => element !== primary) ?? ranking[1];
  const primaryCopy = GROUP_COPY[primary][locale];
  const secondaryCopy = GROUP_COPY[secondary][locale];

  function toggle(key: ScentKey) {
    setRevealed(false);
    setSelected((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      if (current.length >= 7) return current;
      return [...current, key];
    });
  }

  function reset() {
    setSelected([]);
    setRevealed(false);
  }

  const useful = result?.chart.useful ?? [];
  const comparison = !result
    ? copy.noBazi
    : useful.includes(primary)
      ? copy.baziSame
      : useful.includes(secondary)
        ? copy.baziSecondary
        : copy.baziDifferent;

  return (
    <section className="mt-5 rounded-[28px] border border-line/80 bg-cream/90 p-4 shadow-sm sm:p-6" aria-labelledby="scent-five-element-title">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-cinnabar">{copy.kicker}</p>
      <h3 id="scent-five-element-title" className="mt-2 font-display text-2xl leading-9 text-ink">{copy.title}</h3>
      <p className="mt-2 text-sm leading-7 text-ink-soft">{copy.lead}</p>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        <strong className="text-ink">{copy.instruction}</strong>
        <span className="shrink-0 text-ink-mute">{copy.selected} {selected.length}/7</span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {(Object.keys(SCENTS) as ScentKey[]).map((key) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(key)}
              className={`min-h-12 rounded-2xl border px-4 py-3 text-left text-sm leading-6 transition ${active ? "border-cinnabar bg-cinnabar/10 text-ink" : "border-line bg-paper/80 text-ink-soft hover:border-cinnabar/45"}`}
            >
              {SCENTS[key].label[locale]}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={selected.length < 3}
          onClick={() => setRevealed(true)}
          className="min-h-11 rounded-full bg-cinnabar px-5 py-2.5 text-sm font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copy.submit}
        </button>
        {selected.length ? (
          <button type="button" onClick={reset} className="min-h-11 rounded-full border border-line bg-paper px-5 py-2.5 text-sm text-ink">
            {copy.reset}
          </button>
        ) : null}
      </div>
      {selected.length > 0 && selected.length < 3 ? <p className="mt-2 text-xs leading-6 text-ink-mute">{copy.needMore}</p> : null}

      {revealed && selected.length >= 3 ? (
        <div className="mt-6 grid gap-3">
          <article className="rounded-2xl border border-line bg-paper/90 p-4">
            <p className="text-xs tracking-[0.15em] text-cinnabar">{copy.primary}</p>
            <h4 className="mt-1 font-display text-2xl text-ink">{primary} · {primaryCopy.title}</h4>
            <p className="mt-3 text-sm leading-7 text-ink-soft"><b className="text-ink">{copy.sensory}：</b>{primaryCopy.sensory}</p>
            <p className="mt-2 text-sm leading-7 text-ink-soft"><b className="text-ink">{copy.symbolic}：</b>{primaryCopy.symbol}</p>
          </article>

          <article className="rounded-2xl border border-line bg-paper/80 p-4">
            <p className="text-xs tracking-[0.15em] text-ink-mute">{copy.secondary}</p>
            <h4 className="mt-1 font-display text-xl text-ink">{secondary} · {secondaryCopy.title}</h4>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{secondaryCopy.sensory}</p>
          </article>

          <article className="rounded-2xl border border-line bg-cream p-4">
            <h4 className="font-display text-lg text-ink">{copy.bazi}</h4>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{comparison}</p>
            {result?.chart.usefulProvisional ? <p className="mt-2 text-xs leading-6 text-ink-mute">{copy.provisional}</p> : null}
          </article>
        </div>
      ) : null}

      <p className="mt-5 border-t border-line pt-4 text-xs leading-6 text-ink-mute">{copy.disclaimer}</p>
    </section>
  );
}
