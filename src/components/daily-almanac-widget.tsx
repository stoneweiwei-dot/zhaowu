import { useEffect, useMemo, useState } from "react";
import { DailyColorsModule } from "@/components/daily-colors-module";
import { useI18n } from "@/lib/i18n";
import { stemElement } from "@/lib/element-colors";
import { galleryFallbackUrl, galleryPublicUrl, listPublicGalleryAssets, type GalleryAsset } from "@/lib/gallery-assets";
import { isPublicAtlasAsset } from "@/lib/gallery-groups";
import { dayGanzhi, hourPillar, yearMonthPillars, lunarDateLabel, toLunar } from "@/lib/bazi/calendar";

const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;
type Locale = "zh-Hant" | "zh-Hans" | "en";
type VisitorContext = { city: string; country: string; latitude: number; longitude: number; timezone: string; temperature: number | null; weatherCode: number | null };

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30_000); return () => window.clearInterval(timer); }, []);
  return now;
}
function stableHash(value: string) { let hash = 2166136261; for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
function zonedDate(now: Date, timezone?: string) {
  if (!timezone) return now;
  try {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(now);
    const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
    return new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  } catch { return now; }
}
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
function useVisitorContext() {
  const [visitor, setVisitor] = useState<VisitorContext | null>(null);
  useEffect(() => {
    let cancelled = false; const key = "zhaowu:visitor-context:v3";
    const load = async () => {
      try { const cached = window.localStorage.getItem(key); if (cached) { const row = JSON.parse(cached) as { at: number; value: VisitorContext }; if (Date.now() - row.at < 5 * 60_000) { setVisitor(row.value); return; } } } catch { /* optional cache */ }
      try {
        const geoResponse = await fetch("https://ipwho.is/?fields=success,city,country,latitude,longitude,timezone", { cache: "no-store" });
        const geo = await geoResponse.json() as { success?: boolean; city?: string; country?: string; latitude?: number; longitude?: number; timezone?: { id?: string } | string };
        if (!geo.success || typeof geo.latitude !== "number" || typeof geo.longitude !== "number") throw new Error("geo unavailable");
        const timezone = typeof geo.timezone === "string" ? geo.timezone : geo.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m,weather_code&timezone=auto&forecast_days=1`, { cache: "no-store" });
        const weather = await weatherResponse.json() as { current?: { temperature_2m?: number; weather_code?: number } };
        const value: VisitorContext = { city: geo.city || "", country: geo.country || "", latitude: geo.latitude, longitude: geo.longitude, timezone, temperature: typeof weather.current?.temperature_2m === "number" ? weather.current.temperature_2m : null, weatherCode: typeof weather.current?.weather_code === "number" ? weather.current.weather_code : null };
        if (!cancelled) setVisitor(value); try { window.localStorage.setItem(key, JSON.stringify({ at: Date.now(), value })); } catch { /* optional cache */ }
      } catch { if (!cancelled) setVisitor(null); }
    };
    void load(); return () => { cancelled = true; };
  }, []);
  return visitor;
}

const LIUHE: Record<string, string> = { 子: "丑", 丑: "子", 寅: "亥", 亥: "寅", 卯: "戌", 戌: "卯", 辰: "酉", 酉: "辰", 巳: "申", 申: "巳", 午: "未", 未: "午" };
const CHONG: Record<string, string> = { 子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅", 卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳" };
const SANHE = [["申", "子", "辰"], ["亥", "卯", "未"], ["寅", "午", "戌"], ["巳", "酉", "丑"]];
const XING: Record<string, string[]> = { 子: ["卯"], 卯: ["子"], 寅: ["巳", "申"], 巳: ["寅", "申"], 申: ["寅", "巳"], 丑: ["戌", "未"], 戌: ["丑", "未"], 未: ["丑", "戌"], 辰: ["辰"], 午: ["午"], 酉: ["酉"], 亥: ["亥"] };
function relationText(branch: string, locale: Locale) {
  const group = SANHE.find((row) => row.includes(branch)) ?? []; const mates = group.filter((item) => item !== branch).join("、") || "—";
  if (locale === "en") return `Day ${branch}: combine ${LIUHE[branch] ?? "—"} · clash ${CHONG[branch] ?? "—"} · triad ${mates}`;
  const value = `日支${branch}｜合${LIUHE[branch] ?? "—"}・沖${CHONG[branch] ?? "—"}・三合${mates}`; return locale === "zh-Hans" ? value.replace("沖", "冲") : value;
}
function timeWindows(branch: string) { const group = SANHE.find((row) => row.includes(branch)) ?? []; return { good: Array.from(new Set([LIUHE[branch], ...group])).filter(Boolean).slice(0, 4), caution: Array.from(new Set([CHONG[branch], ...(XING[branch] ?? [])])).filter(Boolean).slice(0, 4) }; }
function sacredDay(date: Date, jieName: string, locale: Locale) {
  const lunar = toLunar(date.getFullYear(), date.getMonth() + 1, date.getDate()); const key = lunar ? `${lunar.month}-${lunar.day}` : "";
  const known: Record<string, string> = { "1-1": "彌勒菩薩聖誕", "1-9": "玉皇上帝聖誕", "1-15": "上元天官聖誕", "2-19": "觀世音菩薩聖誕", "3-3": "玄天上帝聖誕", "4-8": "釋迦牟尼佛誕", "6-19": "觀世音菩薩成道", "7-15": "中元地官聖誕", "7-30": "地藏菩薩聖誕", "9-19": "觀世音菩薩出家", "10-15": "下元水官聖誕", "12-8": "釋迦牟尼佛成道日" };
  let observance = known[key] ?? ""; if (!observance && lunar && [8, 14, 15, 23, 29, 30].includes(lunar.day)) observance = "傳統六齋日";
  if (locale === "en") return observance ? `${observance} · ${jieLabel(jieName, locale)}` : `${jieLabel(jieName, locale)} · Buddhist/Daoist observance: verify`;
  if (locale === "zh-Hans") { observance = observance.replaceAll("觀", "观").replaceAll("薩", "萨").replaceAll("誕", "诞").replaceAll("傳", "传").replaceAll("齋", "斋"); return observance ? `${observance}｜节令：${jieLabel(jieName, locale)}` : `节令：${jieLabel(jieName, locale)}｜佛道主圣日：待考`; }
  return observance ? `${observance}｜節令：${jieLabel(jieName, locale)}` : `節令：${jieLabel(jieName, locale)}｜佛道主聖日：待考`;
}
function dayStyle(stem: string, locale: Locale) {
  const element = stemElement(stem) ?? "水";
  const map: Record<string, { core: string; colors: string; jewellery: string; mask: string }> = {
    木: { core: "木氣主伸展，宜先定方向再輸出；保留節奏，避免散耗。", colors: "青綠・霧藍・玉白", jewellery: "白玉・銀飾・青玉", mask: "溫和執行者" }, 火: { core: "火氣主顯化，宜聚焦一事而明；勿以躁動代替效率。", colors: "朱砂・暖白・煙粉", jewellery: "白金・南紅點綴・白玉", mask: "邊界管理者" }, 土: { core: "土氣主承載，宜整理、收束、完成；避免把別人的重量一併扛走。", colors: "岩白・沙金・暖灰", jewellery: "白玉・茶晶・銀飾", mask: "沉默整理者" }, 金: { core: "金氣主清理與判斷，宜去雜、定稿、立界線；鋒利但不必硬碰。", colors: "銀灰・玉白・霧藍", jewellery: "銀飾・白金・月光石", mask: "冷靜觀察者" }, 水: { core: "水氣主流動與感知，宜觀察、溝通、留白；避免情緒與任務同時堆積。", colors: "墨藍・霧藍・銀白", jewellery: "月光石・銀飾・白玉", mask: "低調溝通者" }
  };
  const value = map[element] ?? map.水; if (locale === "en") return { ...value, core: `${element} day energy: prioritise flow, boundaries and one clear sequence.`, mask: "Calm observer" };
  if (locale === "zh-Hans") return Object.fromEntries(Object.entries(value).map(([key, text]) => [key, text.replaceAll("氣", "气").replaceAll("鋒", "锋").replaceAll("觀", "观").replaceAll("銀", "银").replaceAll("綠", "绿").replaceAll("藍", "蓝").replaceAll("邊", "边").replaceAll("靜", "静")])) as typeof value; return value;
}
const SLIPS = {
  "zh-Hant": [["靜心守中", "先把最重要的一件事守住，雜音自然會退。", "少猜一步，慢半拍確認；真正要保留的是自己的節奏。"], ["應緣而啟", "有些門不是硬推開的。先看清哪一個回應是真正的邀請。", "先觀察，再靠近；有回聲的地方才值得投入更多心力。"], ["先定後行", "現在最重要的不是速度，而是先把方向定清楚。", "涉及承諾、金錢或關係時，先確認核心條件。"], ["留白養氣", "今天的空白不是浪費，而是在替下一步保留判斷力。", "把能量留給需要你親自決定的事。"]],
  "zh-Hans": [["静心守中", "先把最重要的一件事守住，杂音自然会退。", "少猜一步，慢半拍确认；真正要保留的是自己的节奏。"], ["应缘而启", "有些门不是硬推开的。先看清哪一个回应是真正的邀请。", "先观察，再靠近；有回声的地方才值得投入更多心力。"], ["先定后行", "现在最重要的不是速度，而是先把方向定清楚。", "涉及承诺、金钱或关系时，先确认核心条件。"], ["留白养气", "今天的空白不是浪费，而是在替下一步保留判断力。", "把能量留给需要你亲自决定的事。"]],
  en: [["Hold Your Centre", "Protect the one thing that matters most and let the noise fall away.", "Guess less, confirm first, and keep your own pace."], ["Open With Response", "Notice what is genuinely responding to you before you invest more.", "Observe first, then move closer."], ["Set Direction First", "Speed is not the priority; set the direction before moving.", "Confirm the core conditions before acting on emotion."], ["Leave Some Space", "Doing slightly less can preserve the judgement you need next.", "Keep your capacity for decisions only you can make."]]
} as const;

export function DailyAlmanacWidget({ embedded = false }: { embedded?: boolean }) {
  const { locale } = useI18n(); const absoluteNow = useNow(); const visitor = useVisitorContext(); const now = useMemo(() => zonedDate(absoluteNow, visitor?.timezone), [absoluteNow, visitor?.timezone]);
  const [page, setPage] = useState(0); const [slipOpen, setSlipOpen] = useState(false); const [asset, setAsset] = useState<GalleryAsset | null>(null); const [loadingSlip, setLoadingSlip] = useState(false);
  const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const pillars = useMemo(() => { const day = dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate()); const ym = yearMonthPillars(now); return { year: ym.year, month: ym.month, day, hour: hourPillar(day, now.getHours()), jieName: ym.jieName }; }, [dayKey, now.getHours()]);
  const values = [pillars.year, pillars.month, pillars.day, pillars.hour]; const branch = pillars.day[1]; const windows = timeWindows(branch); const tone = dayStyle(pillars.day[0], locale); const slip = useMemo(() => SLIPS[locale][stableHash(`${dayKey}|daily-spirit-slip`) % SLIPS[locale].length], [dayKey, locale]);
  const labels = locale === "en" ? { title: "Today Guide", sub: "Local time · weather · almanac rhythm", almanac: "Daily Almanac", wardrobe: "Daily Dress · Five Elements", spirit: "Daily Spirit Slip", location: "Location & weather", sacred: "Sacred day", pillars: "Stems & branches", core: "Core dynamic", yi: "Good for", ji: "Avoid", relation: "Combine · clash · penalty", good: "Supportive hours", caution: "Caution hours", colors: "Colours", jewellery: "Jewellery", mask: "Persona mask", open: "Open today guide" } : locale === "zh-Hans" ? { title: "今日指引", sub: "当地时间・即时天气・今日气机", almanac: "每日黄历", wardrobe: "每日穿衣｜五行色彩", spirit: "今日灵签｜签文指引", location: "所在地｜天气", sacred: "今日圣日", pillars: "今日干支", core: "核心气机", yi: "宜", ji: "忌", relation: "合冲刑害", good: "吉时", caution: "慎时", colors: "适宜颜色", jewellery: "适宜首饰", mask: "性格面具", open: "查看今日完整指引" } : { title: "今日指引", sub: "當地時間・即時天氣・今日氣機", almanac: "每日黃曆", wardrobe: "每日穿衣｜五行色彩", spirit: "今日靈籤｜籤文指引", location: "所在地｜天氣", sacred: "今日聖日", pillars: "今日干支", core: "核心氣機", yi: "宜", ji: "忌", relation: "合沖刑害", good: "吉時", caution: "慎時", colors: "適宜顏色", jewellery: "適宜首飾", mask: "性格面具", open: "查看今日完整指引" };
  const yi = locale === "en" ? "organise · finalise · edit · calm communication" : locale === "zh-Hans" ? "整理・定稿・审美・冷静沟通" : "整理・定稿・審美・冷靜溝通"; const ji = locale === "en" ? "forcing · rushing · task stacking · emotional drain" : locale === "zh-Hans" ? "硬碰・急躁・堆任务・情绪内耗" : "硬碰・急躁・堆任務・情緒內耗";
  const locationName = visitor?.city || (locale === "en" ? "Local" : "本地"); const weather = `${weatherLabel(visitor?.weatherCode ?? null, locale)}${visitor?.temperature != null ? ` ${Math.round(visitor.temperature)}°C` : ""}`; const season = seasonLabel(visitor?.latitude ?? null, now.getMonth() + 1, locale); const pageTitles = [labels.almanac, labels.wardrobe, labels.spirit];
  async function drawSlip() { setLoadingSlip(true); setSlipOpen(true); try { if (!asset) { const rows = (await listPublicGalleryAssets("visual-library")).filter(isPublicAtlasAsset); if (rows.length) setAsset(rows[stableHash(`${dayKey}|daily-spirit-slip|image`) % rows.length]); } } catch { /* artwork optional */ } finally { setLoadingSlip(false); } }

  return <>
    <section id="daily-almanac" className="zhaowu-today-guide" aria-label={labels.title}>
      <details className={`zhaowu-daily-details${embedded ? " is-embedded-open" : ""}`} open={embedded || undefined}>
        {!embedded ? <summary className="zhaowu-today-guide__summary">
          <div className="zhaowu-today-guide__summary-head"><div><p>{labels.title}</p><span>{labels.sub}</span></div><b>→</b></div>
          <div className="zhaowu-today-guide__summary-row"><strong>{now.getFullYear()}.{String(now.getMonth() + 1).padStart(2, "0")}.{String(now.getDate()).padStart(2, "0")}</strong><span>{locationName} · {weather}</span></div>
          <div className="zhaowu-today-guide__summary-meta"><span>{pillars.day}</span><span>{season}</span><em>{labels.open}</em></div>
        </summary> : null}

        <div className="zhaowu-today-guide__expanded">
          <header className="zhaowu-today-guide__hero"><div><p>{labels.title}</p><span>{labels.sub}</span></div><div className="zhaowu-today-guide__pager"><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setPage((page + 2) % 3); }} aria-label={locale === "en" ? "Previous page" : "上一頁"}>←</button><b>{page + 1}/3</b><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setPage((page + 1) % 3); }} aria-label={locale === "en" ? "Next page" : "下一頁"}>→</button></div></header>
          <div className="zhaowu-today-guide__page-title"><strong>{pageTitles[page]}</strong><span>{lunarLabel(now, locale)} · {timeLabel(now)}</span></div>
          <div className="zhaowu-today-guide__grid" hidden={page !== 0}>
            <article className="zhaowu-today-card is-date"><small>{weekdayLabel(now, locale)}</small><strong>{now.getFullYear()}.{String(now.getMonth() + 1).padStart(2, "0")}.{String(now.getDate()).padStart(2, "0")}</strong><span>{timeLabel(now)}</span></article>
            <article className="zhaowu-today-card is-weather"><small>{labels.location}</small><strong>{locationName} · {weather}</strong><span>{season}</span></article>
            <article className="zhaowu-today-card is-sacred"><small>{labels.sacred}</small><strong>{sacredDay(now, pillars.jieName, locale)}</strong><span>{locale === "en" ? "Unverified observances stay marked for verification." : locale === "zh-Hans" ? "未核实圣日不作确定结论。" : "未核實聖日不作確定結論。"}</span></article>
            <article className="zhaowu-today-card is-pillars"><small>{labels.pillars}</small><span className="zhaowu-contract-label">當下年月日時干支</span><div className="zhaowu-today-pillars zhaowu-daily-pillars">{values.map((value, index) => <span data-element={stemElement(value[0]) ?? undefined} data-pillar={PILLAR_KEYS[index]} key={`${PILLAR_KEYS[index]}-${value}`}><b>{value}</b><i>{locale === "en" ? PILLAR_KEYS[index].toUpperCase() : ["年", "月", "日", "時"][index]}</i></span>)}</div></article>
            <article className="zhaowu-today-card is-core"><small>{labels.core}</small><strong>{tone.core}</strong><span>{jieLabel(pillars.jieName, locale)}</span></article>
            <article className="zhaowu-today-card is-guidance"><small>{labels.yi} / {labels.ji}</small><p className="is-yi"><b>{labels.yi}</b>{yi}</p><p className="is-ji"><b>{labels.ji}</b>{ji}</p></article>
            <article className="zhaowu-today-card is-relation"><small>{labels.relation}</small><strong>{relationText(branch, locale)}</strong></article>
            <article className="zhaowu-today-card is-hours"><small>{labels.good} / {labels.caution}</small><p><b>{labels.good}</b>{windows.good.join("・") || "—"}</p><p><b>{labels.caution}</b>{windows.caution.join("・") || "—"}</p><span>{locale === "en" ? "Light reference from branch harmony/clash only." : locale === "zh-Hans" ? "仅按日支合冲刑作轻量参考。" : "僅按日支合沖刑作輕量參考。"}</span></article>
            <div className="zhaowu-today-guide__chips"><article><small>{labels.colors}</small><strong>{tone.colors}</strong></article><article><small>{labels.jewellery}</small><strong>{tone.jewellery}</strong></article><article><small>{labels.mask}</small><strong>{tone.mask}</strong></article></div>
          </div>
          <div className="zhaowu-today-guide__wardrobe" hidden={page !== 1}><DailyColorsModule variant="embed" /></div>
          <div className="zhaowu-today-guide__spirit" hidden={page !== 2}><div className="zhaowu-today-slip-mark" aria-hidden>籤</div><div><p>{locale === "en" ? "Reflection, not prediction" : locale === "zh-Hans" ? "一支签，照见当下；不作宿命判断" : "一支籤，照見當下；不作宿命判斷"}</p><h3>{slip[0]}</h3><strong>{slip[1]}</strong><span>{slip[2]}</span><button type="button" onClick={() => void drawSlip()} disabled={loadingSlip}>{loadingSlip ? "…" : locale === "en" ? "Open full slip" : locale === "zh-Hans" ? "查看完整签文" : "查看完整籤文"} →</button></div></div>
          <footer className="zhaowu-today-guide__footer"><span>{locale === "en" ? "Location and weather are fetched in the visitor browser; no private API key is exposed." : locale === "zh-Hans" ? "位置与天气由访客浏览器直接读取，优先使用访客自己的网络流量；不暴露私钥。" : "位置與天氣由訪客瀏覽器直接讀取，優先使用訪客自己的網路流量；不暴露私鑰。"}</span><div>{[0,1,2].map((item) => <button key={item} type="button" className={page === item ? "is-active" : ""} onClick={() => setPage(item)} aria-label={`${item + 1}/3`} />)}</div></footer>
        </div>
      </details>
    </section>
    {slipOpen ? <section className="zhaowu-spirit-slip" aria-label={labels.spirit}><button type="button" className="zhaowu-spirit-slip-close" onClick={() => setSlipOpen(false)} aria-label={locale === "en" ? "Close" : "收起"}>×</button>{asset ? <figure className="zhaowu-spirit-slip-art"><img src={galleryPublicUrl(asset.storage_path, asset.bucket_id)} alt={asset.title || labels.spirit} onError={(event) => { const fallback = galleryFallbackUrl(asset); if (fallback && event.currentTarget.getAttribute("src") !== fallback) event.currentTarget.src = fallback; }} /></figure> : <div className="zhaowu-spirit-slip-art is-empty" aria-hidden>昭梧</div>}<p className="zhaowu-spirit-slip-kicker"><img className="zhaowu-spirit-slip-gourd" src="/brand-ui/mark-gourd.svg" alt="" width={28} height={28} decoding="async" />{labels.spirit}</p><h2>{slip[0]}</h2><div className="zhaowu-spirit-slip-copy"><p><strong>{slip[1]}</strong></p><p>{slip[2]}</p></div><div className="zhaowu-spirit-slip-rule" aria-hidden /><p className="zhaowu-spirit-slip-basis">{pillars.day} · {timeLabel(now)}</p><p className="zhaowu-spirit-slip-mark">{locale === "en" ? "STONE ORIGINAL" : locale === "zh-Hans" ? "STONE 原创" : "STONE 原創"}</p></section> : null}
  </>;
}
