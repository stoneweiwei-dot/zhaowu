import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DailyColorsModule } from "@/components/daily-colors-module";
import { useI18n } from "@/lib/i18n";
import { stemElement } from "@/lib/element-colors";
import { dayGanzhi, hourPillar, yearMonthPillars, lunarDateLabel, toLunar } from "@/lib/bazi/calendar";
import { toSimplifiedCustomerText } from "@/lib/report/reading-locale";

const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;
const BRANCH_EN: Record<string, string> = { 子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai" };
type Locale = "zh-Hant" | "zh-Hans" | "en";
type VisitorContext = { source: "browser" | "none"; city: string; country: string; latitude: number | null; longitude: number | null; timezone: string; temperature: number | null; weatherCode: number | null };
const NO_VISITOR_LOCATION: VisitorContext = { source: "none", city: "", country: "", latitude: null, longitude: null, timezone: "", temperature: null, weatherCode: null };

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const refresh = () => setNow(new Date()); const timer = window.setInterval(refresh, 30_000); document.addEventListener("visibilitychange", refresh); return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); }; }, []);
  return now;
}
function stableHash(value: string) { let hash = 2166136261; for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
function timeLabel(date: Date) { return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`; }
function weekdayLabel(date: Date, locale: Locale) { return locale === "en" ? new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(date) : ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][date.getDay()]; }
function lunarLabel(date: Date, locale: Locale) {
  if (locale === "en") { const lunar = toLunar(date.getFullYear(), date.getMonth() + 1, date.getDate()); return lunar ? `Lunar month ${lunar.month}, day ${lunar.day}` : "Lunar date unavailable"; }
  const label = lunarDateLabel(date.getFullYear(), date.getMonth() + 1, date.getDate()); return locale === "zh-Hans" ? label.replace("農曆", "农历").replace("閏", "闰") : label;
}
function jieLabel(name: string, locale: Locale) {
  const en: Record<string, string> = { 立春: "Start of Spring", 驚蟄: "Awakening of Insects", 清明: "Clear and Bright", 立夏: "Start of Summer", 芒種: "Grain in Ear", 小暑: "Minor Heat", 立秋: "Start of Autumn", 白露: "White Dew", 寒露: "Cold Dew", 立冬: "Start of Winter", 大雪: "Major Snow", 小寒: "Minor Cold" };
  if (locale === "en") return en[name] ?? name; return locale === "zh-Hans" ? name.replace("驚蟄", "惊蛰") : name;
}
function weatherLabel(code: number | null, locale: Locale) {
  if (code == null) return locale === "en" ? "Weather loading" : locale === "zh-Hans" ? "天气读取中" : "天氣讀取中";
  const zh = code === 0 ? "晴" : code <= 3 ? "少雲" : code <= 48 ? "霧" : code <= 67 ? "雨" : code <= 77 ? "雪" : code <= 82 ? "陣雨" : "雷雨";
  if (locale !== "en") return locale === "zh-Hans" ? zh.replace("雲", "云") : zh;
  return code === 0 ? "Clear" : code <= 3 ? "Partly cloudy" : code <= 48 ? "Fog" : code <= 67 ? "Rain" : code <= 77 ? "Snow" : code <= 82 ? "Showers" : "Thunderstorms";
}
function seasonLabel(latitude: number | null, month: number, locale: Locale) {
  if (latitude == null) return locale === "en" ? "Season pending location" : locale === "zh-Hans" ? "季节待定位" : "季節待定位";
  const south = latitude < 0; const north = month <= 2 || month === 12 ? "winter" : month <= 5 ? "spring" : month <= 8 ? "summer" : "autumn"; const southern = month <= 2 || month === 12 ? "summer" : month <= 5 ? "autumn" : month <= 8 ? "winter" : "spring"; const season = south ? southern : north;
  if (locale === "en") return `${south ? "Southern" : "Northern"} Hemisphere · ${season[0].toUpperCase()}${season.slice(1)}`;
  const map: Record<string, string> = { spring: "春季", summer: "夏季", autumn: "秋季", winter: "冬季" }; return `${south ? "南半球" : "北半球"}${map[season]}`;
}
function locationLabel(visitor: VisitorContext | null, locale: Locale) {
  if (visitor?.source === "browser") {
    if (visitor.city.trim() && visitor.city.trim().toLowerCase() !== "washington") return visitor.city.trim();
    const timezoneCity = visitor.timezone.split("/").filter(Boolean).at(-1)?.replaceAll("_", " ").trim();
    if (timezoneCity) return timezoneCity;
    return locale === "en" ? "Located" : "已定位";
  }
  return locale === "en" ? "Location not confirmed" : locale === "zh-Hans" ? "尚未确认位置" : "尚未確認位置";
}
function weatherUnavailable(locale: Locale) {
  return locale === "en" ? "Weather unavailable" : locale === "zh-Hans" ? "天气暂不可用" : "天氣暫不可用";
}
function weatherPendingLocation(locale: Locale) {
  return locale === "en" ? "Weather pending location" : locale === "zh-Hans" ? "天气待定位" : "天氣待定位";
}
function useVisitorContext() {
  const [visitor, setVisitor] = useState<VisitorContext>(NO_VISITOR_LOCATION);
  const [requesting, setRequesting] = useState(false);
  const [locationError, setLocationError] = useState<"denied" | "unavailable" | "timeout" | "unknown" | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    const legacyKey = "zhaowu:visitor-context:v3";
    const key = "zhaowu:visitor-context:v4";
    try {
      window.localStorage.removeItem(legacyKey);
      const cached = window.localStorage.getItem(key);
      if (!cached) return;
      const row = JSON.parse(cached) as { at?: number; value?: Partial<VisitorContext> };
      const value = row.value;
      const valid = typeof row.at === "number"
        && Date.now() - row.at < 5 * 60_000
        && value?.source === "browser"
        && typeof value.latitude === "number"
        && typeof value.longitude === "number"
        && (value.city || "").trim().toLowerCase() !== "washington";
      if (valid) setVisitor({ ...NO_VISITOR_LOCATION, ...value } as VisitorContext);
      else window.localStorage.removeItem(key);
    } catch {
      try { window.localStorage.removeItem(key); } catch { /* optional cache */ }
    }
  }, []);

  async function requestLocation() {
    if (inFlight.current) return;
    inFlight.current = true;
    setRequesting(true);
    setLocationError(null);
    const finish = () => { inFlight.current = false; setRequesting(false); };
    try {
      if (!navigator.geolocation) throw new Error("Geolocation unavailable");
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8_000,
          maximumAge: 5 * 60_000,
          enableHighAccuracy: false,
        });
      });
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const baseValue: VisitorContext = {
        source: "browser",
        city: "",
        country: "",
        latitude,
        longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        temperature: null,
        weatherCode: null,
      };
      setVisitor(baseValue);
      try { window.localStorage.setItem("zhaowu:visitor-context:v4", JSON.stringify({ at: Date.now(), value: baseValue })); } catch { /* optional cache */ }
      let temperature: number | null = null;
      let weatherCode: number | null = null;
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto&forecast_days=1`,
          { cache: "no-store", signal: AbortSignal.timeout(5_000) },
        );
        if (!response.ok) throw new Error("Weather unavailable");
        const weather = await response.json() as { current?: { temperature_2m?: number; weather_code?: number } };
        temperature = typeof weather.current?.temperature_2m === "number" ? weather.current.temperature_2m : null;
        weatherCode = typeof weather.current?.weather_code === "number" ? weather.current.weather_code : null;
      } catch { /* location remains confirmed when weather is unavailable */ }

      const value: VisitorContext = { ...baseValue, temperature, weatherCode };
      setVisitor(value);
      try { window.localStorage.setItem("zhaowu:visitor-context:v4", JSON.stringify({ at: Date.now(), value })); } catch { /* optional cache */ }
    } catch (error) {
      setVisitor(NO_VISITOR_LOCATION);
      const code = typeof error === "object" && error && "code" in error ? Number((error as GeolocationPositionError).code) : 0;
      setLocationError(code === 1 ? "denied" : code === 2 ? "unavailable" : code === 3 ? "timeout" : "unknown");
    } finally {
      finish();
    }
  }

  useEffect(() => {
    let cancelled = false;
    if (!navigator.geolocation || !navigator.permissions?.query) return;
    void navigator.permissions.query({ name: "geolocation" as PermissionName }).then((permission) => {
      if (!cancelled && permission.state === "granted") void requestLocation();
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  return { visitor, requestLocation, requesting, locationError };
}

const LIUHE: Record<string, string> = { 子: "丑", 丑: "子", 寅: "亥", 亥: "寅", 卯: "戌", 戌: "卯", 辰: "酉", 酉: "辰", 巳: "申", 申: "巳", 午: "未", 未: "午" };
const CHONG: Record<string, string> = { 子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅", 卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳" };
const SANHE = [["申", "子", "辰"], ["亥", "卯", "未"], ["寅", "午", "戌"], ["巳", "酉", "丑"]];
const XING: Record<string, string[]> = { 子: ["卯"], 卯: ["子"], 寅: ["巳", "申"], 巳: ["寅", "申"], 申: ["寅", "巳"], 丑: ["戌", "未"], 戌: ["丑", "未"], 未: ["丑", "戌"], 辰: ["辰"], 午: ["午"], 酉: ["酉"], 亥: ["亥"] };
function relationText(branch: string, locale: Locale) {
  const group = SANHE.find((row) => row.includes(branch)) ?? []; const mates = group.filter((item) => item !== branch).join("、") || "—";
  if (locale === "en") return `Day ${BRANCH_EN[branch] ?? branch}: combines with ${BRANCH_EN[LIUHE[branch]] ?? "—"} · opposes ${BRANCH_EN[CHONG[branch]] ?? "—"} · triad ${group.filter((item) => item !== branch).map((item) => BRANCH_EN[item]).join(", ") || "—"}`;
  const value = `日支${branch}｜合${LIUHE[branch] ?? "—"}・沖${CHONG[branch] ?? "—"}・三合${mates}`; return locale === "zh-Hans" ? value.replace("沖", "冲") : value;
}
function timeWindows(branch: string) { const group = SANHE.find((row) => row.includes(branch)) ?? []; return { good: Array.from(new Set([LIUHE[branch], ...group])).filter(Boolean).slice(0, 4), caution: Array.from(new Set([CHONG[branch], ...(XING[branch] ?? [])])).filter(Boolean).slice(0, 4) }; }
function sacredDay(date: Date, jieName: string, locale: Locale) {
  const lunar = toLunar(date.getFullYear(), date.getMonth() + 1, date.getDate()); const key = lunar ? `${lunar.month}-${lunar.day}` : "";
  const known: Record<string, string> = { "1-1": "彌勒菩薩聖誕", "1-9": "玉皇上帝聖誕", "1-15": "上元天官聖誕", "2-19": "觀世音菩薩聖誕", "3-3": "玄天上帝聖誕", "4-8": "釋迦牟尼佛誕", "6-19": "觀世音菩薩成道", "7-15": "中元地官聖誕", "7-30": "地藏菩薩聖誕", "9-19": "觀世音菩薩出家", "10-15": "下元水官聖誕", "12-8": "釋迦牟尼佛成道日" };
  let observance = known[key] ?? ""; if (!observance && lunar && [8, 14, 15, 23, 29, 30].includes(lunar.day)) observance = "傳統六齋日";
  if (locale === "en") {
    const english: Record<string, string> = { "1-1": "Maitreya observance", "1-9": "Jade Emperor observance", "1-15": "Heaven Official observance", "2-19": "Guanyin's birthday", "3-3": "Xuantian Emperor observance", "4-8": "Buddha's birthday", "6-19": "Guanyin's enlightenment", "7-15": "Earth Official observance", "7-30": "Ksitigarbha observance", "9-19": "Guanyin's renunciation", "10-15": "Water Official observance", "12-8": "Buddha's enlightenment" };
    return `${english[key] ?? (observance ? "Traditional observance" : "No confirmed observance")} · ${jieLabel(jieName, locale)}`;
  }
  if (locale === "zh-Hans") { observance = observance.replaceAll("觀", "观").replaceAll("薩", "萨").replaceAll("誕", "诞").replaceAll("傳", "传").replaceAll("齋", "斋"); return observance ? `${observance}｜节令：${jieLabel(jieName, locale)}` : `节令：${jieLabel(jieName, locale)}｜佛道主圣日：待考`; }
  return observance ? `${observance}｜節令：${jieLabel(jieName, locale)}` : `節令：${jieLabel(jieName, locale)}｜佛道主聖日：待考`;
}
function dayStyle(stem: string, locale: Locale) {
  const element = stemElement(stem) ?? "水";
  const map: Record<string, { core: string; colors: string; jewellery: string; mask: string }> = {
    木: { core: "木氣主伸展，宜先定方向再輸出；保留節奏，避免散耗。", colors: "青綠・霧藍・玉白", jewellery: "白玉・銀飾・青玉", mask: "溫和執行者" }, 火: { core: "火氣主顯化，宜聚焦一事而明；勿以躁動代替效率。", colors: "朱砂・暖白・煙粉", jewellery: "白金・南紅點綴・白玉", mask: "邊界管理者" }, 土: { core: "土氣主承載，宜整理、收束、完成；避免把別人的重量一併扛走。", colors: "岩白・沙金・暖灰", jewellery: "白玉・茶晶・銀飾", mask: "沉默整理者" }, 金: { core: "金氣主清理與判斷，宜去雜、定稿、立界線；鋒利但不必硬碰。", colors: "銀灰・玉白・霧藍", jewellery: "銀飾・白金・月光石", mask: "冷靜觀察者" }, 水: { core: "水氣主流動與感知，宜觀察、溝通、留白；避免情緒與任務同時堆積。", colors: "墨藍・霧藍・銀白", jewellery: "月光石・銀飾・白玉", mask: "低調溝通者" }
  };
  const value = map[element] ?? map.水;
  if (locale === "en") {
    const english: Record<string, typeof value> = {
      木: { core: "Wood day: set a direction and keep a steady pace.", colors: "Jade green · mist blue · soft white", jewellery: "White jade · silver · green jade", mask: "Gentle doer" },
      火: { core: "Fire day: focus on one visible result without rushing.", colors: "Vermilion · warm white · dusty pink", jewellery: "White gold · red agate · white jade", mask: "Boundary keeper" },
      土: { core: "Earth day: sort, finish and carry only your share.", colors: "Stone white · sand gold · warm grey", jewellery: "White jade · smoky quartz · silver", mask: "Quiet organiser" },
      金: { core: "Metal day: edit, decide and set clear limits.", colors: "Silver grey · jade white · mist blue", jewellery: "Silver · white gold · moonstone", mask: "Clear observer" },
      水: { core: "Water day: observe, talk and leave breathing room.", colors: "Ink blue · mist blue · silver white", jewellery: "Moonstone · silver · white jade", mask: "Quiet communicator" },
    };
    return english[element] ?? english.水;
  }
  if (locale === "zh-Hans") return Object.fromEntries(Object.entries(value).map(([key, text]) => [key, toSimplifiedCustomerText(text)])) as typeof value; return value;
}
const SLIPS = {
  "zh-Hant": [
    ["靜心守中", "先把最重要的一件事守住，雜音自然會退。", "少猜一步，慢半拍確認。今日不求同時解開所有事，只求把真正重要的事做穩。"],
    ["應緣而啟", "有些門不是硬推開的；有回聲的地方，才值得靠近。", "先看清對方、環境或機會是否真有回應，再決定投入多少。沒有回聲，也是一種答案。"],
    ["先定後行", "舟未離岸，先辨水勢；路未走遠，先定方向。", "涉及承諾、金錢或關係時，先確認核心條件。方向清楚之後，速度才有意義。"],
    ["留白養氣", "空白不是停滯，是替下一步保留清明。", "少接一件不必要的事，少回一句情緒裡的話。把判斷力留給必須由你決定的地方。"],
    ["渡口先明", "水急時不爭一槳，先看哪裡真正能渡。", "今日適合先找可行入口，不必硬攻最難的一點。能繞開的消耗，就不要拿意志力去填。"],
    ["收鋒見遠", "鋒芒收一寸，眼前便多一重天地。", "不是退讓，而是把力量從爭辯移回結果。先完成可驗證的一步，再決定是否正面交鋒。"],
    ["枝動知風", "小處已先有訊息，風未至，枝葉先動。", "留意反覆出現的小問題、語氣與延誤。它們不是定論，卻足以提醒你提早調整。"],
    ["微光成路", "不必等萬事俱備；眼前的一點光，已足夠走下一步。", "把今天能完成的最小行動做完。路通常不是先被看見，而是在行動之後逐段顯出。"],
  ],
  "zh-Hans": [
    ["静心守中", "先把最重要的一件事守住，杂音自然会退。", "少猜一步，慢半拍确认。今日不求同时解开所有事，只求把真正重要的事做稳。"],
    ["应缘而启", "有些门不是硬推开的；有回声的地方，才值得靠近。", "先看清对方、环境或机会是否真有回应，再决定投入多少。没有回声，也是一种答案。"],
    ["先定后行", "舟未离岸，先辨水势；路未走远，先定方向。", "涉及承诺、金钱或关系时，先确认核心条件。方向清楚之后，速度才有意义。"],
    ["留白养气", "空白不是停滞，是替下一步保留清明。", "少接一件不必要的事，少回一句情绪里的话。把判断力留给必须由你决定的地方。"],
    ["渡口先明", "水急时不争一桨，先看哪里真正能渡。", "今日适合先找可行入口，不必硬攻最难的一点。能绕开的消耗，就不要拿意志力去填。"],
    ["收锋见远", "锋芒收一寸，眼前便多一重天地。", "不是退让，而是把力量从争辩移回结果。先完成可验证的一步，再决定是否正面交锋。"],
    ["枝动知风", "小处已先有讯息，风未至，枝叶先动。", "留意反复出现的小问题、语气与延误。它们不是定论，却足以提醒你提早调整。"],
    ["微光成路", "不必等万事俱备；眼前的一点光，已足够走下一步。", "把今天能完成的最小行动做完。路通常不是先被看见，而是在行动之后逐段显出。"],
  ],
  en: [
    ["Hold Your Centre", "Protect the one thing that matters most and let the noise recede.", "Guess less and confirm first. You do not need to solve everything today; steady the part that truly matters."],
    ["Open With Response", "Some doors are not forced open. Move closer only where there is a real response.", "Notice whether the person, setting or opportunity is genuinely meeting you before investing more. Silence can also be an answer."],
    ["Set Direction First", "Read the current before leaving shore; choose the direction before gathering speed.", "Confirm the core conditions around commitments, money or relationships. Speed only helps after the direction is clear."],
    ["Leave Some Space", "Space is not stagnation; it protects the clarity needed for what comes next.", "Decline one unnecessary demand and avoid one reply made in emotion. Keep your judgement for decisions only you can make."],
    ["Find the Crossing", "When the water runs fast, do not fight every wave; look for the place that can actually be crossed.", "Find the workable entry point instead of attacking the hardest part. Do not spend willpower on friction you can route around."],
    ["Sheathe the Edge", "Draw the blade back an inch and the wider field comes into view.", "This is not surrender. Move your strength from argument to outcome: finish one verifiable step, then decide whether confrontation is needed."],
    ["Read the Moving Branch", "Small signs arrive first; the branch moves before the wind reaches you.", "Notice repeated snags, changes in tone and small delays. They are not conclusions, but they are enough to justify an early adjustment."],
    ["Walk by the Small Light", "You do not need the whole road revealed; the light in front of you is enough for one more step.", "Complete the smallest useful action available today. The path often appears in sections only after you begin moving."],
  ],
} as const;

export function DailyAlmanacWidget({ embedded = false, onExpand }: { embedded?: boolean; onExpand?: () => void }) {
  const { locale } = useI18n(); const now = useNow(); const { visitor, requestLocation, requesting, locationError } = useVisitorContext();
  const [slipOpen, setSlipOpen] = useState(false);
  const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const pillars = useMemo(() => { const day = dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate()); const ym = yearMonthPillars(now); return { year: ym.year, month: ym.month, day, hour: hourPillar(day, now.getHours()), jieName: ym.jieName }; }, [dayKey, now.getHours(), now.getMinutes()]);
  const values = [pillars.year, pillars.month, pillars.day, pillars.hour]; const branch = pillars.day[1]; const windows = timeWindows(branch); const tone = dayStyle(pillars.day[0], locale); const slipIndex = useMemo(() => stableHash(`${dayKey}|daily-spirit-slip`) % SLIPS[locale].length, [dayKey, locale]); const slip = SLIPS[locale][slipIndex]; const slipSequence = String(slipIndex + 1).padStart(2, "0");
  const labels = locale === "en" ? { title: "Today Guide", sub: "Local time · weather · almanac rhythm", almanac: "Daily Almanac", wardrobe: "Daily Dress · Five Elements", spirit: "Daily Spirit Slip", location: "Location & weather", sacred: "Sacred day", pillars: "Stems & branches", core: "Core dynamic", yi: "Good for", ji: "Avoid", relation: "Combine · clash · penalty", good: "Supportive hours", caution: "Caution hours", colors: "Colours", jewellery: "Jewellery", mask: "Persona mask", open: "Open today guide" } : locale === "zh-Hans" ? { title: "今日指引", sub: "当地时间・即时天气・今日气机", almanac: "每日黄历", wardrobe: "每日穿衣｜五行色彩", spirit: "今日灵签｜签文指引", location: "所在地｜天气", sacred: "今日圣日", pillars: "今日干支", core: "核心气机", yi: "宜", ji: "忌", relation: "合冲刑害", good: "吉时", caution: "慎时", colors: "适宜颜色", jewellery: "适宜首饰", mask: "性格面具", open: "查看今日完整指引" } : { title: "今日指引", sub: "當地時間・即時天氣・今日氣機", almanac: "每日黃曆", wardrobe: "每日穿衣｜五行色彩", spirit: "今日靈籤｜籤文指引", location: "所在地｜天氣", sacred: "今日聖日", pillars: "今日干支", core: "核心氣機", yi: "宜", ji: "忌", relation: "合沖刑害", good: "吉時", caution: "慎時", colors: "適宜顏色", jewellery: "適宜首飾", mask: "性格面具", open: "查看今日完整指引" };
  const yi = locale === "en" ? "organise · finalise · edit · calm communication" : locale === "zh-Hans" ? "整理・定稿・审美・冷静沟通" : "整理・定稿・審美・冷靜溝通"; const ji = locale === "en" ? "forcing · rushing · task stacking · emotional drain" : locale === "zh-Hans" ? "硬碰・急躁・堆任务・情绪内耗" : "硬碰・急躁・堆任務・情緒內耗";
  const locationName = locationLabel(visitor, locale); const weather = visitor.source === "browser" ? (visitor.weatherCode != null ? `${weatherLabel(visitor.weatherCode, locale)}${visitor.temperature != null ? ` ${Math.round(visitor.temperature)}°C` : ""}` : weatherUnavailable(locale)) : weatherPendingLocation(locale); const season = seasonLabel(visitor.latitude, now.getMonth() + 1, locale);
  function drawSlip() { setSlipOpen(true); }

  return <>
    <section id="daily-almanac" className="zhaowu-today-guide" aria-label={labels.title}>
      <details className={`zhaowu-daily-details${embedded ? " is-embedded-open" : ""}`} open={embedded || undefined} onToggle={(event) => { if (!embedded && event.currentTarget.open) { if (onExpand) onExpand(); else void requestLocation(); } }}>
        {embedded ? <summary hidden>{labels.title}</summary> : <summary className="zhaowu-today-guide__summary">
          <div className="zhaowu-today-guide__summary-head"><div><p>{labels.title}</p><span>{labels.sub}</span></div><b>→</b></div>
          <div className="zhaowu-today-guide__summary-row"><strong>{now.getFullYear()}.{String(now.getMonth() + 1).padStart(2, "0")}.{String(now.getDate()).padStart(2, "0")}</strong><span>{locationName} · {weather}</span></div>
          <div className="zhaowu-today-guide__summary-meta"><span>{pillars.day}</span><span>{season}</span><em>{labels.open}</em></div>
        </summary>}

        <div className="zhaowu-today-guide__expanded">
          <header className="zhaowu-today-guide__hero"><div><p>{labels.title}</p><span>{labels.sub}</span></div></header>
          <div className="zhaowu-today-guide__overview"><strong>{lunarLabel(now, locale)}</strong><span>{weekdayLabel(now, locale)} · {timeLabel(now)}</span><span>{locationName} · {weather}</span></div>

          <section className="zhaowu-today-section is-almanac" aria-labelledby="zhaowu-today-almanac-title">
            <header className="zhaowu-today-section__head"><span>01</span><div><small>{locale === "en" ? "TIME · CALENDAR" : locale === "zh-Hans" ? "时令・日历" : "時令・日曆"}</small><h2 id="zhaowu-today-almanac-title">{labels.almanac}</h2></div><em>{jieLabel(pillars.jieName, locale)}</em></header>
            <div className="zhaowu-almanac-board">
              <div className="zhaowu-almanac-board__lead">
                <article className="zhaowu-today-card is-date"><small>{weekdayLabel(now, locale)}</small><strong>{now.getFullYear()}.{String(now.getMonth() + 1).padStart(2, "0")}.{String(now.getDate()).padStart(2, "0")}</strong><b>{String(now.getDate()).padStart(2, "0")}</b><span>{lunarLabel(now, locale)} · {timeLabel(now)}</span></article>
                <div className="zhaowu-almanac-board__place">
                  <article className="zhaowu-today-card is-weather">
                    <small>{labels.location}</small>
                    <strong>{locationName}</strong>
                    <span>{weather} · {season}</span>
                    {visitor.source !== "browser" ? (
                      <button
                        type="button"
                        className="zhaowu-today-location-inline"
                        onClick={() => void requestLocation()}
                        disabled={requesting}
                      >
                        {requesting
                          ? (locale === "en" ? "Locating…" : locale === "zh-Hans" ? "正在定位…" : "正在定位…")
                          : (locale === "en" ? "Use current location" : locale === "zh-Hans" ? "使用当前位置" : "使用目前位置")}
                      </button>
                    ) : null}
                    {locationError ? (
                      <em className="zhaowu-today-location-error">
                        {locationError === "denied"
                          ? (locale === "en" ? "Location permission is off in this browser." : locale === "zh-Hans" ? "浏览器未允许位置权限。" : "瀏覽器未允許位置權限。")
                          : (locale === "en" ? "Could not get the current location. Tap to retry." : locale === "zh-Hans" ? "暂时无法取得当前位置，请重试。" : "暫時無法取得目前位置，請重試。")}
                      </em>
                    ) : null}
                  </article>
                  <article className="zhaowu-today-card is-sacred"><small>{labels.sacred}</small><strong>{sacredDay(now, pillars.jieName, locale)}</strong><span>{jieLabel(pillars.jieName, locale)}</span></article>
                </div>
              </div>
              <article className="zhaowu-today-card is-pillars"><small>{labels.pillars}</small><span className="zhaowu-contract-label">{locale === "en" ? "Current year, month, day and hour pillars" : locale === "zh-Hans" ? "当下年月日时干支" : "當下年月日時干支"}</span><div className="zhaowu-today-pillars zhaowu-daily-pillars">{values.map((value, index) => <span data-element={stemElement(value[0]) ?? undefined} data-pillar={PILLAR_KEYS[index]} key={`${PILLAR_KEYS[index]}-${value}`}><b>{value}</b><i>{locale === "en" ? PILLAR_KEYS[index].toUpperCase() : ["年", "月", "日", locale === "zh-Hans" ? "时" : "時"][index]}</i></span>)}</div></article>
              <article className="zhaowu-today-card is-core"><small>{labels.core}</small><strong>{tone.core}</strong><span>{relationText(branch, locale)}</span></article>
              <div className="zhaowu-almanac-board__guidance">
                <article className="zhaowu-today-card is-guidance"><small>{labels.yi} / {labels.ji}</small><p className="is-yi"><b>{labels.yi}</b>{yi}</p><p className="is-ji"><b>{labels.ji}</b>{ji}</p></article>
                <article className="zhaowu-today-card is-hours"><small>{labels.good} / {labels.caution}</small><p><b>{labels.good}</b>{locale === "en" ? windows.good.map((item) => BRANCH_EN[item]).join(" · ") || "—" : windows.good.join("・") || "—"}</p><p><b>{labels.caution}</b>{locale === "en" ? windows.caution.map((item) => BRANCH_EN[item]).join(" · ") || "—" : windows.caution.join("・") || "—"}</p></article>
              </div>
            </div>
          </section>

          <section className="zhaowu-today-section is-wardrobe" aria-labelledby="zhaowu-today-wardrobe-title">
            <header className="zhaowu-today-section__head"><span>02</span><div><small>{locale === "en" ? "COLOUR · ELEMENT" : locale === "zh-Hans" ? "五色・五行" : "五色・五行"}</small><h2 id="zhaowu-today-wardrobe-title">{labels.wardrobe}</h2></div><em>{tone.colors}</em></header>
            <div className="zhaowu-today-guide__wardrobe"><DailyColorsModule variant="embed" date={now} /><div className="zhaowu-today-guide__wardrobe-notes"><span><small>{labels.colors}</small><strong>{tone.colors}</strong></span><span><small>{labels.jewellery}</small><strong>{tone.jewellery}</strong></span><span><small>{labels.mask}</small><strong>{tone.mask}</strong></span></div></div>
          </section>

          <section className="zhaowu-today-section is-spirit" aria-labelledby="zhaowu-today-spirit-title">
            <header className="zhaowu-today-section__head"><span>03</span><div><small>{locale === "en" ? "REFLECTION · ACTION" : locale === "zh-Hans" ? "观照・行动" : "觀照・行動"}</small><h2 id="zhaowu-today-spirit-title">{labels.spirit}</h2></div><em>{locale === "en" ? `Slip ${slipSequence}` : locale === "zh-Hans" ? `昭梧签 ${slipSequence}` : `昭梧籤 ${slipSequence}`}</em></header>
            <div className="zhaowu-today-guide__spirit"><div className="zhaowu-today-guide__spirit-paper"><p className="zhaowu-today-guide__spirit-kicker"><img src="/brand-ui/mark-gourd.svg" alt="" width={30} height={30} decoding="async" />{locale === "en" ? `ZHAOWU DAILY SLIP · ${slipSequence}` : locale === "zh-Hans" ? `昭梧今日灵签・${slipSequence}` : `昭梧今日靈籤・${slipSequence}`}</p><h3>{slip[0]}</h3><strong>{slip[1]}</strong><div className="zhaowu-today-guide__spirit-reading"><small>{locale === "en" ? "READING" : locale === "zh-Hans" ? "签意" : "籤意"}</small><span>{slip[2]}</span></div><button type="button" onClick={drawSlip}>{locale === "en" ? "Open the full slip" : locale === "zh-Hans" ? "展开完整签文" : "展開完整籤文"}</button></div></div>
          </section>
          <footer className="zhaowu-today-guide__footer"><span>{locale === "en" ? "Location and weather are fetched in the visitor browser; no private API key is exposed." : locale === "zh-Hans" ? "位置与天气由访客浏览器直接读取，不暴露私钥。" : "位置與天氣由訪客瀏覽器直接讀取，不暴露私鑰。"}</span></footer>
        </div>
      </details>
    </section>
    {embedded ? <div className="zhaowu-today-location-control"><button type="button" onClick={() => void requestLocation()} disabled={requesting} aria-label={locale === "en" ? "Use current location" : locale === "zh-Hans" ? "使用当前位置" : "使用目前位置"} style={{ minHeight: 44, border: 0, borderBottom: "1px solid rgba(49, 94, 80, .35)", padding: "0 4px", color: "var(--zw-jade, #315e50)", background: "transparent", fontSize: 14, fontWeight: 650 }}>{requesting ? (locale === "en" ? "Locating…" : locale === "zh-Hans" ? "正在定位…" : "正在定位…") : (locale === "en" ? "Use current location" : locale === "zh-Hans" ? "使用当前位置" : "使用目前位置")}</button></div> : null}
    {slipOpen && typeof document !== "undefined" ? createPortal(<section className="zhaowu-spirit-slip" role="dialog" aria-modal="true" aria-label={labels.spirit}><img className="zhaowu-spirit-slip-backdrop-art" src="/today/spirit-slip-song-mineral-v1.webp" alt="" decoding="async" /><div className="zhaowu-spirit-slip-wash" aria-hidden /><button type="button" className="zhaowu-spirit-slip-close" onClick={() => setSlipOpen(false)} aria-label={locale === "en" ? "Close" : "收起"}>×</button><div className="zhaowu-spirit-slip-layout"><div className="zhaowu-spirit-slip-content"><p className="zhaowu-spirit-slip-kicker"><img className="zhaowu-spirit-slip-gourd" src="/brand-ui/mark-gourd.svg" alt="" width={28} height={28} decoding="async" />{locale === "en" ? `ZHAOWU DAILY SLIP · ${slipSequence}` : locale === "zh-Hans" ? `昭梧今日灵签・${slipSequence}` : `昭梧今日靈籤・${slipSequence}`}</p><h2>{slip[0]}</h2><div className="zhaowu-spirit-slip-copy"><p><strong>{slip[1]}</strong></p><p><small>{locale === "en" ? "READING" : locale === "zh-Hans" ? "签意" : "籤意"}</small>{slip[2]}</p></div><div className="zhaowu-spirit-slip-rule" aria-hidden /><p className="zhaowu-spirit-slip-basis">{pillars.day} · {lunarLabel(now, locale)} · {timeLabel(now)}</p><p className="zhaowu-spirit-slip-mark">{locale === "en" ? "STONE ORIGINAL" : locale === "zh-Hans" ? "STONE 原创" : "STONE 原創"}</p></div></div></section>, document.body) : null}
  </>;
}
