import { useI18n } from "@/lib/i18n";
import { sydneyDate } from "@/lib/daily-sky-date";
import { useEffect, useState } from "react";
import "@/daily-sky-observation.css";

// This is a dated observation, not a live ephemeris. Keep the source instant explicit.
const OBSERVATION_DATE = "2026-10-31";
export function DailySkyObservation() {
  const { locale } = useI18n();
  const [today, setToday] = useState(() => sydneyDate(new Date()));
  useEffect(() => {
    const update = () => setToday(sydneyDate(new Date()));
    const timer = window.setInterval(update, 30_000);
    document.addEventListener("visibilitychange", update);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, []);
  const lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const text = {
    "zh-Hant": { title: "每日觀象", subtitle: "觀天象 · 知時序", date: "2026年10月31日｜悉尼", stale: "歷史觀測資料：尚未更新至今日", moonTitle: "月相與升落", moon: "虧凸月；05:02 過中天時照明 73.3%。00:11 月出，09:55 月落。", planetsTitle: "行星與觀測", planets: "10月31日晚間可留意土星；約22:54過中天。11月1日黎明前可留意東北方的木星與火星。實際能見度取決於雲量與地平線。", eventsTitle: "重要事件", events: "今日行星事件及未來72小時預告尚待獨立核驗。", weather: "天氣及光害資料暫缺；請於出門前查看當地預報，選擇遠離燈光的安全地點。", line: "抬頭看天，留意時序。", source: "觀測資料與來源", notice: "以上為天文觀測資料；占星象徵另見下方專欄。" },
    "zh-Hans": { title: "每日观象", subtitle: "观天象 · 知时序", date: "2026年10月31日｜悉尼", stale: "历史观测资料：尚未更新至今日", moonTitle: "月相与升落", moon: "亏凸月；05:02 过中天时照明 73.3%。00:11 月出，09:55 月落。", planetsTitle: "行星与观测", planets: "10月31日晚间可留意土星；约22:54过中天。11月1日黎明前可留意东北方的木星与火星。实际能见度取决于云量与地平线。", eventsTitle: "重要事件", events: "今日行星事件及未来72小时预告尚待独立核验。", weather: "天气及光害资料暂缺；请于出门前查看当地预报，选择远离灯光的安全地点。", line: "抬头看天，留意时序。", source: "观测资料与来源", notice: "以上为天文观测资料；占星象征另见下方专栏。" },
    en: { title: "Daily Sky", subtitle: "Observe the sky · Mark the seasons", date: "31 October 2026 | Sydney", stale: "Archived observation: today’s update is not yet available", moonTitle: "Moon phase and rise/set", moon: "Waning gibbous; 73.3% illuminated at its 05:02 meridian passage. Moonrise 00:11; moonset 09:55.", planetsTitle: "Planets and viewing", planets: "Look for Saturn on the evening of 31 October; it transits around 22:54. Before dawn on 1 November, look northeast for Jupiter and Mars. Clouds and the horizon affect visibility.", eventsTitle: "Notable events", events: "Today's planetary events and the 72-hour outlook are awaiting independent verification.", weather: "Weather and light-pollution data are unavailable. Check the local forecast and choose a safe location away from bright lights.", line: "Look up, and notice the changing sky.", source: "Observation sources", notice: "These are astronomical observations. Astrological symbolism is presented separately below." }
  }[lang];
  const stale = today !== OBSERVATION_DATE;
  return <section className="daily-sky" aria-label={text.title}>
    <header><span className="daily-sky-kicker">ZHAOWU · SYDNEY SKY</span><h2>{text.title}</h2><p>{text.subtitle}</p><time dateTime={OBSERVATION_DATE}>{text.date}</time></header>
    {stale && <p className="daily-sky-stale" role="status">{text.stale}</p>}
    <div className="daily-sky-columns"><section><h3>{text.moonTitle}</h3><p>{text.moon}</p></section><section><h3>{text.planetsTitle}</h3><p>{text.planets}</p></section></div>
    <p className="daily-sky-quote">{text.line}</p><section><h3>{text.eventsTitle}</h3><p>{text.events}</p><p>{text.weather}</p></section>
    <details><summary>{text.source}</summary><ul><li><a href="https://www.timeanddate.com/moon/australia/sydney?month=10&amp;year=2026">Timeanddate · Sydney Moon · 31 Oct 2026</a></li><li><a href="https://www.timeanddate.com/astronomy/night/australia/sydney">Timeanddate · Sydney planets · 31 Oct 2026</a></li><li><a href="https://whatsintheskytonight.com/in/australia">What's in the sky tonight · Australia</a></li></ul></details><p className="daily-sky-note">{text.notice}</p>
  </section>;
}
