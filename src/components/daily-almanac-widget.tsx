import { useEffect, useMemo, useState } from "react";
import { DailyColorsModule } from "@/components/daily-colors-module";
import { useI18n } from "@/lib/i18n";
import { stemElement } from "@/lib/element-colors";
import { hantToHans, nextSacredAfter, sacredForDate, SACRED_KIND_LABEL } from "@/lib/sacred-days";
import { spiritSlipFor } from "@/lib/spirit-slips";
import { dayGanzhi, hourPillar, yearMonthPillars, lunarDateLabel, toLunar } from "@/lib/bazi/calendar";

const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;
const BRANCH_EN: Record<string, string> = { 子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai" };
type Locale = "zh-Hant" | "zh-Hans" | "en";
type VisitorContext = { city: string; country: string; latitude: number; longitude: number; timezone: string; temperature: number | null; weatherCode: number | null };

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
  if (locale === "en") return `Day ${BRANCH_EN[branch] ?? branch}: combines with ${BRANCH_EN[LIUHE[branch]] ?? "—"} · opposes ${BRANCH_EN[CHONG[branch]] ?? "—"} · triad ${group.filter((item) => item !== branch).map((item) => BRANCH_EN[item]).join(", ") || "—"}`;
  const value = `日支${branch}｜合${LIUHE[branch] ?? "—"}・沖${CHONG[branch] ?? "—"}・三合${mates}`; return locale === "zh-Hans" ? value.replace("沖", "冲") : value;
}
function timeWindows(branch: string) { const group = SANHE.find((row) => row.includes(branch)) ?? []; return { good: Array.from(new Set([LIUHE[branch], ...group])).filter(Boolean).slice(0, 4), caution: Array.from(new Set([CHONG[branch], ...(XING[branch] ?? [])])).filter(Boolean).slice(0, 4) }; }
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
  if (locale === "zh-Hans") return Object.fromEntries(Object.entries(value).map(([key, text]) => [key, text.replaceAll("氣", "气").replaceAll("鋒", "锋").replaceAll("觀", "观").replaceAll("銀", "银").replaceAll("綠", "绿").replaceAll("藍", "蓝").replaceAll("邊", "边").replaceAll("靜", "静")])) as typeof value; return value;
}
export function DailyAlmanacWidget({ embedded = false }: { embedded?: boolean }) {
  const { locale } = useI18n(); const now = useNow(); const visitor = useVisitorContext();
  const [page, setPage] = useState(0); const [drawn, setDrawn] = useState(false);
  const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const pillars = useMemo(() => { const day = dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate()); const ym = yearMonthPillars(now); return { year: ym.year, month: ym.month, day, hour: hourPillar(day, now.getHours()), jieName: ym.jieName }; }, [dayKey, now.getHours(), now.getMinutes()]);
  const values = [pillars.year, pillars.month, pillars.day, pillars.hour]; const branch = pillars.day[1]; const windows = timeWindows(branch); const tone = dayStyle(pillars.day[0], locale); const slip = useMemo(() => spiritSlipFor(stableHash(`${dayKey}|daily-spirit-slip`), locale), [dayKey, locale]); const sacred = useMemo(() => sacredForDate(now, locale), [dayKey, locale]); const nextSacred = useMemo(() => (sacred.items.length ? null : nextSacredAfter(now, locale)), [dayKey, locale, sacred.items.length]); const kindLabel = SACRED_KIND_LABEL[locale];
  const labels = locale === "en" ? { title: "Today Guide", sub: "Local time · weather · almanac rhythm", almanac: "Daily Almanac", wardrobe: "Daily Dress · Five Elements", spirit: "Daily Spirit Slip", location: "Location & weather", sacred: "Sacred day", pillars: "Stems & branches", core: "Core dynamic", yi: "Good for", ji: "Avoid", relation: "Combine · clash · penalty", good: "Supportive hours", caution: "Caution hours", colors: "Colours", jewellery: "Jewellery", mask: "Persona mask", open: "Open today guide" } : locale === "zh-Hans" ? { title: "今日指引", sub: "当地时间・即时天气・今日气机", almanac: "每日黄历", wardrobe: "每日穿衣｜五行色彩", spirit: "今日灵签｜签文指引", location: "所在地｜天气", sacred: "今日圣日", pillars: "今日干支", core: "核心气机", yi: "宜", ji: "忌", relation: "合冲刑害", good: "吉时", caution: "慎时", colors: "适宜颜色", jewellery: "适宜首饰", mask: "性格面具", open: "查看今日完整指引" } : { title: "今日指引", sub: "當地時間・即時天氣・今日氣機", almanac: "每日黃曆", wardrobe: "每日穿衣｜五行色彩", spirit: "今日靈籤｜籤文指引", location: "所在地｜天氣", sacred: "今日聖日", pillars: "今日干支", core: "核心氣機", yi: "宜", ji: "忌", relation: "合沖刑害", good: "吉時", caution: "慎時", colors: "適宜顏色", jewellery: "適宜首飾", mask: "性格面具", open: "查看今日完整指引" };
  const yi = locale === "en" ? "organise · finalise · edit · calm communication" : locale === "zh-Hans" ? "整理・定稿・审美・冷静沟通" : "整理・定稿・審美・冷靜溝通"; const ji = locale === "en" ? "forcing · rushing · task stacking · emotional drain" : locale === "zh-Hans" ? "硬碰・急躁・堆任务・情绪内耗" : "硬碰・急躁・堆任務・情緒內耗";
  const locationName = visitor?.city || (locale === "en" ? "Location not confirmed" : locale === "zh-Hans" ? "尚未确认位置" : "尚未確認位置"); const weather = `${weatherLabel(visitor?.weatherCode ?? null, locale)}${visitor?.temperature != null ? ` ${Math.round(visitor.temperature)}°C` : ""}`; const season = seasonLabel(visitor?.latitude ?? null, now.getMonth() + 1, locale); const pageTitles = [labels.almanac, labels.wardrobe, labels.spirit]; const tabLabels = locale === "en" ? ["Almanac", "Dress", "Spirit slip"] : locale === "zh-Hans" ? ["黄历", "穿衣", "灵签"] : ["黃曆", "穿衣", "靈籤"];
  const tr = (hant: string) => (locale === "zh-Hans" ? hantToHans(hant) : hant);
  const extra = locale === "en"
    ? { sacredNone: "No confirmed birthday or observance today.", fast: "Fast-day Buddha", next: "Next observance", term: "Solar term", sacredNote: "Dates follow common Buddhist, Daoist and folk traditions; temples may differ, so follow your own temple's calendar.", draw: "Shake for today's slip", drawHint: "One slip a day, the same all day. A prompt for reflection, not a prediction.", verse: "Verse", gloss: "Reading", advice: "For today", when: (n: number) => (n === 1 ? "tomorrow" : `in ${n} days`), mark: "STONE ORIGINAL" }
    : { sacredNone: tr("今日無載明的神佛聖誕。"), fast: tr("十齋日"), next: tr("下一個聖日"), term: tr("節令"), sacredNote: tr("日期依佛、道與民間信仰的通行說法，各寺廟宮觀略有差異，請以所屬寺廟為準。"), draw: tr("搖一支今日籤"), drawHint: tr("每日一支，當天固定；籤文是提醒與反思，不是預言。"), verse: tr("籤詩"), gloss: tr("解曰"), advice: tr("今日宜"), when: (n: number) => (n === 1 ? tr("明天") : tr(`${n} 天後`)), mark: tr("STONE 原創") };
  const nextWhen = nextSacred ? (locale === "en" ? ` (${extra.when(nextSacred.inDays)})` : `（${extra.when(nextSacred.inDays)}）`) : "";
  useEffect(() => { try { setDrawn(window.sessionStorage.getItem(`zhaowu:slip-drawn:${dayKey}`) === "1"); } catch { /* optional memory */ } }, [dayKey]);
  function drawSlip() { setDrawn(true); try { window.sessionStorage.setItem(`zhaowu:slip-drawn:${dayKey}`, "1"); } catch { /* optional memory */ } }

  return <>
    <section id="daily-almanac" className="zhaowu-today-guide" aria-label={labels.title}>
      <details className={`zhaowu-daily-details${embedded ? " is-embedded-open" : ""}`} open={embedded || undefined}>
        {embedded ? <summary hidden>{labels.title}</summary> : <summary className="zhaowu-today-guide__summary">
          <div className="zhaowu-today-guide__summary-head"><div><p>{labels.title}</p><span>{labels.sub}</span></div><b>→</b></div>
          <div className="zhaowu-today-guide__summary-row"><strong>{now.getFullYear()}.{String(now.getMonth() + 1).padStart(2, "0")}.{String(now.getDate()).padStart(2, "0")}</strong><span>{locationName} · {weather}</span></div>
          <div className="zhaowu-today-guide__summary-meta"><span>{pillars.day}</span><span>{season}</span><em>{labels.open}</em></div>
        </summary>}

        <div className="zhaowu-today-guide__expanded">
          <header className="zhaowu-today-guide__hero"><div><p>{labels.title}</p><span>{labels.sub}</span></div></header>
          <nav className="zhaowu-today-guide__tabs" aria-label={locale === "en" ? "Today sections" : locale === "zh-Hans" ? "今日分区" : "今日分區"}>{pageTitles.map((title, index) => <button key={title} type="button" aria-pressed={page === index} aria-label={title} onClick={() => setPage(index)}>{tabLabels[index]}</button>)}</nav>
          <div className="zhaowu-today-guide__page-title"><strong>{pageTitles[page]}</strong><span>{lunarLabel(now, locale)} · {timeLabel(now)}</span></div>
          <div className="zhaowu-today-guide__grid" hidden={page !== 0}>
            <article className="zhaowu-today-card is-sacred" data-sacred-card>
              <small>{labels.sacred}</small>
              {sacred.items.length ? <ul className="zhaowu-sacred-list">{sacred.items.map((item) => <li key={item.label} data-sacred-kind={item.kind}><i>{kindLabel[item.kind]}</i><strong>{item.label}</strong></li>)}</ul> : <p className="zhaowu-sacred-none">{extra.sacredNone}</p>}
              {sacred.fast ? <p className="zhaowu-sacred-line"><b>{extra.fast}</b>{sacred.fast}</p> : null}
              {nextSacred ? <p className="zhaowu-sacred-line"><b>{extra.next}</b>{lunarLabel(nextSacred.date, locale)} · {nextSacred.items.map((item) => item.label).join(locale === "en" ? "; " : "、")}{nextWhen}</p> : null}
              <em className="zhaowu-sacred-note">{extra.term}：{jieLabel(pillars.jieName, locale)} · {extra.sacredNote}</em>
            </article>
            <article className="zhaowu-today-card is-date"><small>{weekdayLabel(now, locale)}</small><strong>{now.getFullYear()}.{String(now.getMonth() + 1).padStart(2, "0")}.{String(now.getDate()).padStart(2, "0")}</strong><span>{timeLabel(now)}</span></article>
            <article className="zhaowu-today-card is-weather"><small>{labels.location}</small><strong>{locationName} · {weather}</strong><span>{season}</span></article>
            <article className="zhaowu-today-card is-pillars"><small>{labels.pillars}</small><span className="zhaowu-contract-label">{locale === "en" ? "Current year, month, day and hour pillars" : "當下年月日時干支"}</span><div className="zhaowu-today-pillars zhaowu-daily-pillars">{values.map((value, index) => <span data-element={stemElement(value[0]) ?? undefined} data-pillar={PILLAR_KEYS[index]} key={`${PILLAR_KEYS[index]}-${value}`}><b>{value}</b><i>{locale === "en" ? PILLAR_KEYS[index].toUpperCase() : ["年", "月", "日", "時"][index]}</i></span>)}</div></article>
            <article className="zhaowu-today-card is-core"><small>{labels.core}</small><strong>{tone.core}</strong><span>{jieLabel(pillars.jieName, locale)}</span></article>
            <article className="zhaowu-today-card is-guidance"><small>{labels.yi} / {labels.ji}</small><p className="is-yi"><b>{labels.yi}</b>{yi}</p><p className="is-ji"><b>{labels.ji}</b>{ji}</p></article>
            <article className="zhaowu-today-card is-relation"><small>{labels.relation}</small><strong>{relationText(branch, locale)}</strong></article>
            <article className="zhaowu-today-card is-hours"><small>{labels.good} / {labels.caution}</small><p><b>{labels.good}</b>{locale === "en" ? windows.good.map((item) => BRANCH_EN[item]).join(" · ") || "—" : windows.good.join("・") || "—"}</p><p><b>{labels.caution}</b>{locale === "en" ? windows.caution.map((item) => BRANCH_EN[item]).join(" · ") || "—" : windows.caution.join("・") || "—"}</p><span>{locale === "en" ? "Light reference from branch harmony/clash only." : locale === "zh-Hans" ? "仅按日支合冲刑作轻量参考。" : "僅按日支合沖刑作輕量參考。"}</span></article>
            <div className="zhaowu-today-guide__chips"><article><small>{labels.colors}</small><strong>{tone.colors}</strong></article><article><small>{labels.jewellery}</small><strong>{tone.jewellery}</strong></article><article><small>{labels.mask}</small><strong>{tone.mask}</strong></article></div>
          </div>
          <div className="zhaowu-today-guide__wardrobe" hidden={page !== 1}><DailyColorsModule variant="embed" date={now} /><div className="zhaowu-today-guide__wardrobe-notes"><span><small>{labels.colors}</small><strong>{tone.colors}</strong></span><span><small>{labels.jewellery}</small><strong>{tone.jewellery}</strong></span><span><small>{labels.mask}</small><strong>{tone.mask}</strong></span></div></div>
          <div className="zhaowu-lot-wrap" hidden={page !== 2}>
            <p className="zhaowu-lot-note">{locale === "en" ? "Reflection, not prediction" : locale === "zh-Hans" ? "一支签，照见当下；不作宿命判断" : "一支籤，照見當下；不作宿命判斷"}</p>
            {drawn ? (
              <article className="zhaowu-lot" data-lot-script={locale === "en" ? "latin" : "han"} aria-label={`${slip.number} ${slip.title}`}>
                <div className="zhaowu-lot__strip">
                  <b className="zhaowu-lot__number">{slip.number}</b>
                  <ol className="zhaowu-lot__poem" aria-label={extra.verse}>{slip.poem.map((line) => <li key={line}>{line}</li>)}</ol>
                  <i className="zhaowu-lot__grade" data-grade={slip.grade}>{slip.gradeLabel}</i>
                </div>
                <div className="zhaowu-lot__body">
                  <p className="zhaowu-lot__kicker"><img className="zhaowu-spirit-slip-gourd" src="/brand-ui/mark-gourd.svg" alt="" width={24} height={24} decoding="async" />{labels.spirit}</p>
                  <h3>{slip.title}</h3>
                  <dl><div><dt>{extra.gloss}</dt><dd>{slip.gloss}</dd></div><div><dt>{extra.advice}</dt><dd>{slip.advice}</dd></div></dl>
                  <p className="zhaowu-lot__basis">{pillars.day} · {timeLabel(now)}</p>
                  <p className="zhaowu-lot__mark">{extra.mark}</p>
                </div>
              </article>
            ) : (
              <div className="zhaowu-lot-tube">
                <svg viewBox="0 0 96 112" width="96" height="112" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M30 8v26M42 4v30M54 10v24M66 6v28" opacity=".7"/><path d="M22 34h52l-4 70a6 6 0 0 1-6 5H32a6 6 0 0 1-6-5z" fill="currentColor" fillOpacity=".06"/><path d="M24 54h48M25 86h46" opacity=".4"/></g></svg>
                <button type="button" onClick={() => drawSlip()}>{extra.draw}</button>
                <p>{extra.drawHint}</p>
              </div>
            )}
          </div>
          <footer className="zhaowu-today-guide__footer"><span>{locale === "en" ? "Location and weather are fetched in the visitor browser; no private API key is exposed." : locale === "zh-Hans" ? "位置与天气由访客浏览器直接读取，不暴露私钥。" : "位置與天氣由訪客瀏覽器直接讀取，不暴露私鑰。"}</span></footer>
        </div>
      </details>
    </section>
  </>;
}
