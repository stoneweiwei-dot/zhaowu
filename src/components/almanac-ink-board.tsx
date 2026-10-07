import { useEffect, useState, type ReactNode } from "react";
import { stemElement } from "@/lib/element-colors";
import { tenGod } from "@/lib/bazi/calendar";
import { readSharedBirthRecord } from "@/lib/shared-birth";
import { buildChart } from "@/lib/bazi/chart";
import { toSimplifiedCustomerText } from "@/lib/report/reading-locale";

/**
 * 今日黃曆 · ink board (owner 2026-10-08 reference: dark ink-teal almanac sheet).
 * Pure presentation of values already computed by the calendar engine plus, when the
 * visitor has saved a birth record on this device, their natal branches / day master.
 */

type Locale = "zh-Hant" | "zh-Hans" | "en";
type Element = "木" | "火" | "土" | "金" | "水";

const BRANCH_EN: Record<string, string> = { 子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai" };
const BRANCH_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const BRANCH_ELEMENT: Record<string, Element> = { 子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水" };
const LIUHE: Record<string, [string, Element]> = { 子: ["丑", "土"], 丑: ["子", "土"], 寅: ["亥", "木"], 亥: ["寅", "木"], 卯: ["戌", "火"], 戌: ["卯", "火"], 辰: ["酉", "金"], 酉: ["辰", "金"], 巳: ["申", "水"], 申: ["巳", "水"], 午: ["未", "土"], 未: ["午", "土"] };
const CHONG: Record<string, string> = { 子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅", 卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳" };
const HAI: Record<string, string> = { 子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅", 卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉" };
const XING: Record<string, string[]> = { 子: ["卯"], 卯: ["子"], 寅: ["巳"], 巳: ["申"], 申: ["寅"], 丑: ["戌"], 戌: ["未"], 未: ["丑"] };
const SELF_XING = new Set(["辰", "午", "酉", "亥"]);
const SANHE = [["申", "子", "辰"], ["亥", "卯", "未"], ["寅", "午", "戌"], ["巳", "酉", "丑"]];
const GENERATES: Record<Element, Element> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };

const T = (locale: Locale, hant: string, en: string) => locale === "en" ? en : locale === "zh-Hans" ? toSimplifiedCustomerText(hant) : hant;

type Relation = { key: string; label: string; kind: "合" | "沖" | "刑" | "害"; natal: boolean };

function pairRelations(a: string, b: string, natal: boolean, locale: Locale): Relation[] {
  const out: Relation[] = [];
  const en = (x: string) => BRANCH_EN[x] ?? x;
  if (LIUHE[a]?.[0] === b) out.push({ key: `he-${[a, b].sort().join("")}`, kind: "合", natal, label: locale === "en" ? `${en(a)}–${en(b)} combine (${LIUHE[a][1]})` : `${a}${b}合${LIUHE[a][1]}` });
  if (CHONG[a] === b) out.push({ key: `chong-${[a, b].sort().join("")}`, kind: "沖", natal, label: locale === "en" ? `${en(a)}–${en(b)} clash` : T(locale, `${a}${b}相沖`, "") });
  if (HAI[a] === b) out.push({ key: `hai-${[a, b].sort().join("")}`, kind: "害", natal, label: locale === "en" ? `${en(a)}–${en(b)} harm` : `${a}${b}相害` });
  if (a === b && SELF_XING.has(a)) out.push({ key: `zixing-${a}`, kind: "刑", natal, label: locale === "en" ? `${en(a)}–${en(a)} self-penalty` : `${a}${a}自刑` });
  else if (XING[a]?.includes(b) || XING[b]?.includes(a)) out.push({ key: `xing-${[a, b].sort().join("")}`, kind: "刑", natal, label: locale === "en" ? `${en(a)}–${en(b)} penalty` : `${a}${b}相刑` });
  return out;
}

function branchHours(branch: string) {
  const index = BRANCH_ORDER.indexOf(branch);
  const start = (index * 2 + 23) % 24;
  const end = (start + 1) % 24;
  return `${String(start).padStart(2, "0")}:00–${String(end).padStart(2, "0")}:59`;
}

function hourWindows(branch: string) {
  const group = SANHE.find((row) => row.includes(branch)) ?? [];
  const good = Array.from(new Set([LIUHE[branch]?.[0], ...group.filter((b) => b !== branch)])).filter(Boolean) as string[];
  const caution = Array.from(new Set([CHONG[branch], HAI[branch], ...(XING[branch] ?? [])])).filter(Boolean) as string[];
  return { good: good.slice(0, 4), caution: caution.filter((b) => !good.includes(b)).slice(0, 4) };
}

const TEN_GOD_PLAIN: Record<string, { zh: string; en: string }> = {
  比肩: { zh: "同類相助，適合和夥伴分工、各自負責。", en: "Peer support—split work with partners and own your part." },
  劫財: { zh: "容易有競爭和開銷，合作先講清楚分配，看緊荷包。", en: "Competition and spending rise—agree on shares first and watch money." },
  食神: { zh: "適合放鬆、創作、輸出作品，也適合好好吃一頓。", en: "Good for relaxing, creating and sharing your work." },
  傷官: { zh: "想法多、表達欲強，說話留三分，用作品代替爭辯。", en: "Lots to say—let your work speak rather than arguing." },
  正財: { zh: "適合處理實際收入、帳務和穩定的工作。", en: "Good for practical income, accounts and steady work." },
  偏財: { zh: "機會和人脈活絡，但避免衝動投入。", en: "Opportunities and contacts are lively—avoid impulsive bets." },
  正官: { zh: "適合守規則、處理正式事務和承擔責任。", en: "Good for formal matters, rules and responsibilities." },
  七殺: { zh: "壓力與挑戰偏大，先排優先順序，別正面硬碰。", en: "More pressure—prioritise and avoid head-on clashes." },
  正印: { zh: "適合學習、休息、接受幫助和長輩的建議。", en: "Good for learning, rest and accepting help." },
  偏印: { zh: "適合獨處研究與思考，留意別鑽牛角尖。", en: "Good for solo study and thinking—don't overthink." },
};

const ELEMENT_DAY: Record<Element, {
  core: string; coreEn: string;
  yi: [IconKey, string, string][]; ji: [IconKey, string, string][];
  colors: [string, string, string][]; jewellery: [string, string][]; mask: [string, string];
  closing: [string, string];
}> = {
  木: {
    core: "木氣主伸展，宜先定方向再輸出；保留節奏，避免散耗。", coreEn: "Wood energy stretches outward—set a direction first, then keep a steady pace.",
    yi: [["book", "學習進修", "Learn"], ["plant", "開展計畫", "Start plans"], ["chat", "溝通協調", "Talk it through"], ["walk", "戶外走動", "Walk outdoors"], ["pen", "規劃調整", "Plan"]],
    ji: [["fire", "急躁衝動", "Rushing"], ["split", "多頭並進", "Too many threads"], ["bolt", "過度消耗", "Overspending energy"], ["cup", "情緒化", "Moodiness"], ["moon", "熬夜透支", "Late nights"]],
    colors: [["#5f8f74", "青綠", "Jade green"], ["#8ea4b8", "霧藍", "Mist blue"], ["#eef0ea", "玉白", "Jade white"], ["#3f5a4c", "松墨", "Pine ink"]],
    jewellery: [["白玉", "White jade"], ["銀飾", "Silver"], ["青玉", "Green jade"]], mask: ["溫和執行者", "Gentle doer"],
    closing: ["生長而不散亂，伸展而有方向。", "Grow without scattering; reach out with direction."],
  },
  火: {
    core: "火氣主顯化，宜聚焦一事而明；勿以躁動代替效率。", coreEn: "Fire energy makes things visible—focus on one result; don't mistake hurry for speed.",
    yi: [["chat", "表達發表", "Present"], ["star", "曝光推廣", "Promote"], ["walk", "運動流汗", "Exercise"], ["pen", "完成收尾", "Finish"], ["sun", "曬太陽", "Get sunlight"]],
    ji: [["fire", "急躁衝動", "Rushing"], ["fist", "硬拚硬上", "Forcing"], ["bolt", "過度消耗", "Burning out"], ["cup", "情緒化", "Moodiness"], ["moon", "熬夜透支", "Late nights"]],
    colors: [["#b4442f", "朱砂", "Vermilion"], ["#f3ece0", "暖白", "Warm white"], ["#d9b8b4", "煙粉", "Dusty pink"], ["#7a3b2e", "赭紅", "Ochre red"]],
    jewellery: [["白金", "White gold"], ["南紅", "Red agate"], ["白玉", "White jade"]], mask: ["邊界管理者", "Boundary keeper"],
    closing: ["明亮而不灼人，熱情而有分寸。", "Bright without burning; warm with measure."],
  },
  土: {
    core: "土氣主承載，宜整理、收束、完成；避免把別人的重量一併扛走。", coreEn: "Earth energy carries—sort, close and finish; don't take on other people's weight.",
    yi: [["box", "整理歸納", "Tidy up"], ["pen", "定稿收尾", "Finalise"], ["home", "居家安頓", "Settle home"], ["coin", "理財記帳", "Budget"], ["lotus", "靜心沉澱", "Be still"]],
    ji: [["fist", "硬扛硬撐", "Overcarrying"], ["split", "雜事堆積", "Piling chores"], ["bolt", "過度消耗", "Overwork"], ["cup", "暴飲暴食", "Overindulging"], ["moon", "熬夜透支", "Late nights"]],
    colors: [["#e4e0d6", "岩白", "Stone white"], ["#c9a86a", "沙金", "Sand gold"], ["#a39e95", "暖灰", "Warm grey"], ["#7b6a4f", "褐土", "Umber"]],
    jewellery: [["白玉", "White jade"], ["茶晶", "Smoky quartz"], ["銀飾", "Silver"]], mask: ["沉默整理者", "Quiet organiser"],
    closing: ["承載而不負重，穩定而能轉化。", "Carry without strain; steady yet able to change."],
  },
  金: {
    core: "金氣主清理與判斷，宜去雜、定稿、立界線；鋒利但不必硬碰。", coreEn: "Metal energy clears and decides—edit, finalise and set limits without clashing.",
    yi: [["broom", "斷捨離", "Declutter"], ["pen", "定稿決策", "Decide"], ["box", "整理歸納", "Organise"], ["chat", "冷靜溝通", "Calm talk"], ["lotus", "靜心沉澱", "Be still"]],
    ji: [["fist", "硬碰硬上", "Clashing"], ["fire", "急躁衝動", "Rushing"], ["bolt", "過度挑剔", "Over-criticising"], ["cup", "情緒化", "Moodiness"], ["moon", "熬夜透支", "Late nights"]],
    colors: [["#a9adb2", "銀灰", "Silver grey"], ["#eef0ea", "玉白", "Jade white"], ["#8ea4b8", "霧藍", "Mist blue"], ["#d8c08a", "淡金", "Pale gold"]],
    jewellery: [["銀飾", "Silver"], ["白金", "White gold"], ["月光石", "Moonstone"]], mask: ["冷靜觀察者", "Clear observer"],
    closing: ["鋒利而不傷人，清明而有界線。", "Sharp without wounding; clear with boundaries."],
  },
  水: {
    core: "水氣主流動與感知，宜觀察、溝通、留白；避免情緒與任務同時堆積。", coreEn: "Water energy flows and senses—observe, talk and leave space; don't let feelings and tasks pile up together.",
    yi: [["book", "學習思考", "Study"], ["box", "整理歸納", "Organise"], ["chat", "溝通協調", "Talk it through"], ["pen", "規劃調整", "Plan"], ["lotus", "靜心沉澱", "Be still"]],
    ji: [["fire", "急躁衝動", "Rushing"], ["fist", "硬拚硬上", "Forcing"], ["bolt", "過度消耗", "Overextending"], ["cup", "情緒化", "Moodiness"], ["moon", "熬夜透支", "Late nights"]],
    colors: [["#a9adb2", "霧銀", "Mist silver"], ["#5f7186", "冷灰藍", "Cool slate"], ["#e4e0d6", "岩白", "Stone white"], ["#3b4148", "濕墨灰", "Wet ink"]],
    jewellery: [["銀飾", "Silver"], ["白金", "White gold"], ["月光石", "Moonstone"], ["白玉", "White jade"]], mask: ["低調溝通者", "Quiet communicator"],
    closing: ["流動而不漂浮，沉靜而有主見。", "Flow without drifting; calm with a mind of your own."],
  },
};

type IconKey = "book" | "plant" | "chat" | "walk" | "pen" | "fire" | "split" | "bolt" | "cup" | "moon" | "star" | "sun" | "fist" | "box" | "home" | "coin" | "lotus" | "broom";

function Icon({ name }: { name: IconKey }) {
  const paths: Record<IconKey, ReactNode> = {
    book: <><path d="M4 5.5c3-1 5.5-.8 8 .8v13c-2.5-1.6-5-1.8-8-.8z" /><path d="M20 5.5c-3-1-5.5-.8-8 .8v13c2.5-1.6 5-1.8 8-.8z" /></>,
    plant: <><path d="M12 20v-9" /><path d="M12 11c0-3 2-5.5 6-6 0 3.5-2 6-6 6z" /><path d="M12 13c0-2.5-1.8-4.5-5-5-.2 3 1.8 5 5 5z" /><path d="M8 20h8" /></>,
    chat: <><path d="M4 6h11v8H9l-3 3v-3H4z" /><path d="M15 9h5v8h-2v2.5L15.5 17H11v-3" /></>,
    walk: <><circle cx="13" cy="4.5" r="1.6" /><path d="M10 21l2.5-6 2.5 2.5V21" /><path d="M8 12l3-4 3 2 2.5 2" /><path d="M12.5 15l-1-5" /></>,
    pen: <><path d="M5 19l1-4L16 5l3 3L9 18z" /><path d="M14 7l3 3" /><path d="M5 19h14" /></>,
    fire: <path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2.5-5 .5 2 1.5 2.5 2.5 2.5C12 8 11 6 12 3z" />,
    split: <><path d="M12 20v-6" /><path d="M12 14L6 8" /><path d="M12 14l6-6" /><path d="M6 4v4h4" /><path d="M18 4v4h-4" /></>,
    bolt: <path d="M13 3L6 13h5l-1 8 7-10h-5z" />,
    cup: <><path d="M7 4h10l-1.5 7a3.5 3.5 0 0 1-7 0z" /><path d="M12 14v5" /><path d="M8.5 20h7" /></>,
    moon: <><path d="M15 4a8 8 0 1 0 5 13A7 7 0 0 1 15 4z" /><path d="M18 5l.5 1.2 1.2.5-1.2.5L18 8.4l-.5-1.2-1.2-.5 1.2-.5z" /></>,
    star: <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" /></>,
    fist: <><path d="M6 11V8.5a1.5 1.5 0 0 1 3 0V11" /><path d="M9 10V7.5a1.5 1.5 0 0 1 3 0V10" /><path d="M12 10V8a1.5 1.5 0 0 1 3 0v2.5" /><path d="M15 10.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a5 5 0 0 1-5-5v-4" /></>,
    box: <><path d="M4 8l8-4 8 4-8 4z" /><path d="M4 8v8l8 4 8-4V8" /><path d="M12 12v8" /></>,
    home: <><path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></>,
    coin: <><ellipse cx="12" cy="7" rx="6" ry="2.5" /><path d="M6 7v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7" /><path d="M6 12v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5" /></>,
    lotus: <><path d="M12 6c2 2.5 2 6.5 0 10-2-3.5-2-7.5 0-10z" /><path d="M12 16c-3 0-6.5-1.5-8-5 3 0 6 1.5 8 5z" /><path d="M12 16c3 0 6.5-1.5 8-5-3 0-6 1.5-8 5z" /><path d="M6 19h12" /></>,
    broom: <><path d="M15 3l-4 9" /><path d="M7 12h8l2 8H5z" /><path d="M9 16v4M12 16v4" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden className="zw-ink-icon" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function ElementWheel({ active, locale }: { active: Element; locale: Locale }) {
  const order: Element[] = ["木", "火", "土", "金", "水"];
  const pts = order.map((_, i) => { const a = (-90 + i * 72) * Math.PI / 180; return [60 + 44 * Math.cos(a), 60 + 44 * Math.sin(a)] as const; });
  const en: Record<Element, string> = { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" };
  return (
    <svg viewBox="0 0 120 120" className="zw-ink-wheel" role="img" aria-label={T(locale, `五行相生，今日以${active}為主`, `Five-element cycle; today leans ${en[active]}`)}>
      <polygon points={[0, 2, 4, 1, 3].map((i) => pts[i].join(",")).join(" ")} className="zw-ink-wheel__star" />
      {order.map((el, i) => {
        const [x1, y1] = pts[i]; const [x2, y2] = pts[(i + 1) % 5];
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        return <path key={`arc-${el}`} d={`M${x1},${y1} Q${mx + (mx - 60) * .35},${my + (my - 60) * .35} ${x2},${y2}`} className="zw-ink-wheel__arc" />;
      })}
      {order.map((el, i) => (
        <g key={el} data-element={el} className={el === active || GENERATES[active] === el ? "is-on" : undefined}>
          <circle cx={pts[i][0]} cy={pts[i][1]} r={11} className="zw-ink-wheel__node" />
          <text x={pts[i][0]} y={pts[i][1] + 4.5} textAnchor="middle">{locale === "en" ? en[el][0] : el}</text>
        </g>
      ))}
    </svg>
  );
}

function HourRing({ good, caution }: { good: string[]; caution: string[] }) {
  return (
    <svg viewBox="0 0 100 100" className="zw-ink-ring" aria-hidden>
      {BRANCH_ORDER.map((b, i) => {
        const a0 = (-90 - 15 + i * 30) * Math.PI / 180; const a1 = (-90 + 15 + i * 30) * Math.PI / 180;
        const r0 = 30, r1 = 46;
        const p = (r: number, a: number) => `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
        const cls = good.includes(b) ? "is-good" : caution.includes(b) ? "is-caution" : "";
        const am = (a0 + a1) / 2;
        return <g key={b} className={cls}><path d={`M${p(r0, a0)} L${p(r1, a0)} A${r1},${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 0 0 ${p(r0, a0)}Z`} /><text x={50 + 38 * Math.cos(am)} y={50 + 38 * Math.sin(am) + 2.6} textAnchor="middle">{b}</text></g>;
      })}
      <circle cx="50" cy="50" r="26" className="zw-ink-ring__hub" />
    </svg>
  );
}

export type AlmanacInkBoardProps = {
  locale: Locale;
  now: Date;
  pillars: { year: string; month: string; day: string; hour: string; jieName: string };
  lunar: string;
  weekday: string;
  time: string;
  jie: string;
  locationName: string;
  weather: string;
  season: string;
  latitude: number | null;
  sacred: string;
  pillarsSlot: ReactNode;
  locationControl: ReactNode;
};

function seasonAdvice(latitude: number | null, month: number, weather: string, locale: Locale) {
  const south = latitude != null && latitude < 0;
  const north = month <= 2 || month === 12 ? "winter" : month <= 5 ? "spring" : month <= 8 ? "summer" : "autumn";
  const southern = month <= 2 || month === 12 ? "summer" : month <= 5 ? "autumn" : month <= 8 ? "winter" : "spring";
  const season = south ? southern : north;
  const map = {
    spring: ["萬物生發，陽氣上升", "宜舒展筋骨，早睡早起", "Things are growing and rising", "Stretch, move and keep early hours"],
    summer: ["暑熱當令，心火易旺", "宜清心降火，補足水分", "Heat is in charge", "Keep cool and drink enough water"],
    autumn: ["燥氣漸起，日照偏弱", "宜收心斂神，潤燥養陰", "Air turns dry, light softens", "Gather yourself and stay moisturised"],
    winter: ["寒氣內藏，萬物收斂", "宜保暖養藏，調整節奏", "Cold settles in", "Stay warm and slow your pace"],
  }[season];
  const wet = /雨|霧|Rain|Fog|Shower|Thunder/i.test(weather);
  const lines = locale === "en" ? [map[2], wet ? "Damp air—keep warm and dry" : map[3]] : [map[0], wet ? "濕氣偏重，注意保暖除濕" : map[1]];
  return locale === "zh-Hans" ? lines.map(toSimplifiedCustomerText) : lines;
}

export function AlmanacInkBoard(props: AlmanacInkBoardProps) {
  const { locale, now, pillars } = props;
  const dayStem = pillars.day[0];
  const dayBranch = pillars.day[1];
  const element = (stemElement(dayStem) ?? "水") as Element;
  const data = ELEMENT_DAY[element];
  const [natal, setNatal] = useState<{ dayMaster: string; branches: string[] } | null>(null);

  useEffect(() => {
    try {
      const record = readSharedBirthRecord();
      if (!record) return;
      const chart = buildChart({ ...record, question: "", locale });
      const branches = chart.pillars.filter((p) => p.ready !== false && p.zhi).map((p) => p.zhi);
      setNatal({ dayMaster: chart.dayMaster, branches });
    } catch { setNatal(null); }
  }, [locale]);

  const windows = hourWindows(dayBranch);
  const todayOthers = [pillars.year[1], pillars.month[1], pillars.hour[1]];
  const rels = new Map<string, Relation>();
  for (const b of todayOthers) for (const r of pairRelations(dayBranch, b, false, locale)) rels.set(r.key, r);
  if (natal) {
    for (const b of natal.branches) for (const r of pairRelations(dayBranch, b, true, locale)) rels.set(r.key, r);
    const seen = new Set<string>();
    for (const b of natal.branches) { if (seen.has(b) && SELF_XING.has(b)) for (const r of pairRelations(b, b, true, locale)) rels.set(r.key, r); seen.add(b); }
  }
  const relations = Array.from(rels.values()).slice(0, 5);
  const personal = natal ? tenGod(natal.dayMaster, dayStem) : "";
  const personalPlain = personal ? TEN_GOD_PLAIN[personal] : null;
  const advice = seasonAdvice(props.latitude, now.getMonth() + 1, props.weather, locale);
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  const kindLabel = (k: Relation["kind"]) => locale === "en" ? ({ 合: "Combine", 沖: "Clash", 刑: "Penalty", 害: "Harm" } as const)[k] : locale === "zh-Hans" && k === "沖" ? "冲" : k;
  const branchName = (b: string) => locale === "en" ? BRANCH_EN[b] : b;
  const hourLabel = locale === "en" ? "" : T(locale, "時", "");

  return (
    <div className="zw-ink-board" data-almanac-ink-board data-day-element={element}>
      <header className="zw-ink-hero">
        <div className="zw-ink-datecard">
          <span>{now.getFullYear()}</span>
          <strong>{mmdd}</strong>
          <span>{props.weekday}</span>
          <em>{T(locale, "農曆", "Lunar")}</em>
          <small>{props.lunar}</small>
        </div>
        <div className="zw-ink-title">
          <h3>{T(locale, "今日黃曆", "Today's Almanac")}</h3>
          <p>{natal ? T(locale, "個人八字定制・每日指引", "Tuned to your chart · daily guide") : T(locale, "通用黃曆・錄入生辰後依命盤定制", "General almanac · save your birth record to personalise")}</p>
          <small>{props.time} · {props.jie}</small>
        </div>
        <div className="zw-ink-city">
          <strong>{props.locationName}</strong>
          <span>{props.season}</span>
        </div>
      </header>

      <section className="zw-ink-panel zw-ink-weather">
        <div><small>{T(locale, "今日天氣", "Weather")}</small><strong>{props.weather}</strong>{props.locationControl}</div>
        <div><small>{props.season}</small>{advice.map((line) => <span key={line}>{line}</span>)}</div>
      </section>

      <div className="zw-ink-row">
        <section className="zw-ink-panel zw-ink-pillars">
          <small>{T(locale, "今日干支", "Today's pillars")}</small>
          {props.pillarsSlot}
          <p className="zw-ink-daymaster">{T(locale, `日主：${dayStem}${element}（日支${dayBranch}${BRANCH_ELEMENT[dayBranch]}）`, `Day stem ${dayStem} (${element}) · day branch ${BRANCH_EN[dayBranch]}`)}</p>
        </section>
        <section className="zw-ink-panel zw-ink-sacred">
          <small>{T(locale, "今日聖日", "Observance")}</small>
          <Icon name="lotus" />
          <strong>{props.sacred}</strong>
        </section>
      </div>

      <section className="zw-ink-panel zw-ink-core">
        <ElementWheel active={element} locale={locale} />
        <div>
          <small>{T(locale, "核心氣機", "Core dynamic")}</small>
          <strong>{locale === "en" ? data.coreEn : T(locale, data.core, "")}</strong>
          {personalPlain ? (
            <p className="zw-ink-personal" data-almanac-personal>{locale === "en" ? `For you, today's ${dayStem} is your “${personal}”: ${personalPlain.en}` : T(locale, `對你而言，今日${dayStem}是「${personal}」：${personalPlain.zh}`, "")}</p>
          ) : null}
        </div>
      </section>

      <div className="zw-ink-row">
        <section className="zw-ink-paper is-yi">
          <h4><span>{T(locale, "宜", "Do")}</span></h4>
          <ul>{data.yi.map(([icon, zh, en]) => <li key={zh}><Icon name={icon} /><span>{locale === "en" ? en : T(locale, zh, "")}</span></li>)}</ul>
        </section>
        <section className="zw-ink-paper is-ji">
          <h4><span>{T(locale, "忌", "Avoid")}</span></h4>
          <ul>{data.ji.map(([icon, zh, en]) => <li key={zh}><Icon name={icon} /><span>{locale === "en" ? en : T(locale, zh, "")}</span></li>)}</ul>
        </section>
      </div>

      <section className="zw-ink-paper zw-ink-relations">
        <h4>{T(locale, "合沖刑害", "Combine · clash · penalty · harm")}</h4>
        {relations.length ? (
          <ul>{relations.map((r) => <li key={r.key} data-kind={r.kind}><span>{r.label}</span><b>{kindLabel(r.kind)}</b>{r.natal ? <i>{T(locale, "命盤", "your chart")}</i> : null}</li>)}</ul>
        ) : <p>{T(locale, "今日日支與當下干支無明顯合沖刑害。", "No notable combinations or clashes with today's day branch.")}</p>}
      </section>

      <div className="zw-ink-row">
        <section className="zw-ink-paper zw-ink-hours is-good">
          <h4>{T(locale, "吉時", "Supportive hours")}</h4>
          <div><ol>{windows.good.map((b) => <li key={b}><span>{branchHours(b)}</span><b>{branchName(b)}{hourLabel}</b></li>)}</ol><HourRing good={windows.good} caution={windows.caution} /></div>
        </section>
        <section className="zw-ink-paper zw-ink-hours is-caution">
          <h4>{T(locale, "慎時", "Careful hours")}</h4>
          <div><ol>{windows.caution.map((b) => <li key={b}><span>{branchHours(b)}</span><b>{branchName(b)}{hourLabel}</b></li>)}</ol><HourRing good={windows.good} caution={windows.caution} /></div>
        </section>
      </div>

      <div className="zw-ink-row is-three">
        <section className="zw-ink-panel zw-ink-colors">
          <small>{T(locale, "今日適宜顏色", "Colours")}</small>
          <ul>{data.colors.map(([hex, zh, en]) => <li key={hex}><i style={{ background: hex }} /><span>{locale === "en" ? en : T(locale, zh, "")}</span></li>)}</ul>
        </section>
        <section className="zw-ink-panel zw-ink-jewels">
          <small>{T(locale, "今日適宜首飾", "Jewellery")}</small>
          <ul>{data.jewellery.map(([zh, en]) => <li key={zh}><svg viewBox="0 0 24 24" aria-hidden className="zw-ink-icon" fill="none" stroke="currentColor" strokeWidth={1.4}><circle cx="12" cy="14" r="6" /><path d="M9 8.5L12 4l3 4.5" /></svg><span>{locale === "en" ? en : T(locale, zh, "")}</span></li>)}</ul>
        </section>
        <section className="zw-ink-panel zw-ink-mask">
          <small>{T(locale, "今日性格面具", "Persona mask")}</small>
          <svg viewBox="0 0 64 32" aria-hidden className="zw-ink-maskart" fill="none" stroke="currentColor" strokeWidth={1.3}><path d="M4 8c8-5 20-5 28 2 8-7 20-7 28-2-1 12-9 20-18 20-5 0-8-3-10-6-2 3-5 6-10 6C13 28 5 20 4 8z" /><path d="M14 15c2-2 6-2 8 0M42 15c2-2 6-2 8 0" /></svg>
          <strong>{locale === "en" ? data.mask[1] : T(locale, data.mask[0], "")}</strong>
        </section>
      </div>

      <p className="zw-ink-closing">{locale === "en" ? data.closing[1] : T(locale, data.closing[0], "")}</p>
    </div>
  );
}
