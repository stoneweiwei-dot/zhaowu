import { useI18n } from "@/lib/i18n";
import { sydneyDate } from "@/lib/daily-sky-date";
import { useEffect, useState } from "react";
import "@/daily-sky-observation.css";

type Lang = "zh-Hant" | "zh-Hans" | "en";
type LocalText = Record<Lang, string>;
type DatedObservation = {
  date: string;
  moon: LocalText;
  planets: LocalText;
  events: LocalText;
  weather: LocalText;
  sources: Array<{ title: string; url: string }>;
};

// Dated, sourced observation snapshots. An unverified planetary event is never
// represented as absent. Future daily records belong to the verified generator.
export const OBSERVATIONS: DatedObservation[] = [
  {
    date: "2026-10-31",
    moon: {
      "zh-Hant": "虧凸月；05:02 過中天時照明約 73.3%。00:11 月出，09:55 月落。",
      "zh-Hans": "亏凸月；05:02 过中天时照明约 73.3%。00:11 月出，09:55 月落。",
      en: "Waning gibbous; ~73.3% illuminated at its 05:02 transit. Moonrise 00:11; moonset 09:55."
    },
    planets: {
      "zh-Hant": "晚間土星約 22:54 過中天；黎明前的木星、火星須觀察東北方低空。",
      "zh-Hans": "晚间土星约 22:54 过中天；黎明前的木星、火星须观察东北方低空。",
      en: "Saturn transits around 22:54. Jupiter and Mars are in the pre-dawn northeastern sky."
    },
    events: {
      "zh-Hant": "S／A 行星事件尚未經雙引擎核驗；不宣稱無事件。",
      "zh-Hans": "S／A 行星事件尚未经过双引擎核验；不宣称无事件。",
      en: "S/A planetary events are awaiting independent ephemeris verification; no absence claim is made."
    },
    weather: {
      "zh-Hant": "當日天氣和光害資料尚未核實。",
      "zh-Hans": "当日天气和光害资料尚未核实。",
      en: "Weather and light-pollution data for this date were not verified."
    },
    sources: [
      { title: "Timeanddate · Sydney Moon, October 2026", url: "https://www.timeanddate.com/moon/australia/sydney?month=10&year=2026" },
      { title: "Timeanddate · Sydney planetary visibility", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" }
    ]
  },
  {
    date: "2026-11-01",
    moon: {
      "zh-Hant": "虧凸月；06:02 過中天時照明 62.0%。01:03 東北偏東月出，11:07 西北偏西月落。",
      "zh-Hans": "亏凸月；06:02 过中天时照明 62.0%。01:03 东北偏东月出，11:07 西北偏西月落。",
      en: "Waning gibbous; 62.0% illuminated at the 06:02 transit. Rises ENE at 01:03; sets WNW at 11:07."
    },
    planets: {
      "zh-Hant": "土星晚間容易觀察，約 22:50 過中天。11月2日黎明前，火星 02:22、木星 02:34 升起；金星約 04:57 升起但貼近地平線。水星過近太陽，不建議尋找。",
      "zh-Hans": "土星晚间容易观察，约 22:50 过中天。11月2日黎明前，火星 02:22、木星 02:34 升起；金星约 04:57 升起但贴近地平线。水星过近太阳，不建议寻找。",
      en: "Saturn is readily visible in the evening, transiting around 22:50. Before dawn on 2 Nov, Mars rises 02:22, Jupiter 02:34 and low-horizon Venus 04:57. Mercury is too close to the Sun for practical viewing."
    },
    events: {
      "zh-Hant": "本日 S／A 行星事件與未來72小時預告尚待獨立星曆核驗。這不代表沒有重大事件。",
      "zh-Hans": "本日 S／A 行星事件与未来72小时预告尚待独立星历核验。这不代表没有重大事件。",
      en: "Today's S/A planetary events and the 72-hour forecast await independent ephemeris validation. This does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "澳洲氣象局11月1日17:00預報：悉尼地區多雲間晴，今晚可能有陣雨，越晚機率越低。市區光害較強；建議避開街燈，實地確認雲況。",
      "zh-Hans": "澳大利亚气象局11月1日17:00预报：悉尼地区多云间晴，今晚可能有阵雨，越晚概率越低。市区光害较强；建议避开街灯，实地确认云况。",
      en: "The Australian Bureau of Meteorology's 17:00 forecast says partly cloudy, with a slight chance of showers becoming less likely later tonight. Urban light pollution is substantial; check clouds and avoid bright streetlights."
    },
    sources: [
      { title: "Timeanddate · Sydney Moon, November 2026", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney planetary visibility, 1 Nov", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · Sydney area forecast, issued 1 Nov 2026 17:00 AEDT", url: "https://www.bom.gov.au/places/nsw/sydney/forecast/" }
    ]
  },
  {
    date: "2026-11-02",
    moon: {
      "zh-Hant": "下弦月於悉尼時間07:28發生；06:58過中天時照明50.4%。月出01:46（方位65°），月落12:17（方位292°）。",
      "zh-Hans": "下弦月于悉尼时间07:28发生；06:58过中天时照明50.4%。月出01:46（方位65°），月落12:17（方位292°）。",
      en: "Last quarter occurs at 07:28 Sydney time. At the 06:58 transit the Moon is 50.4% illuminated; it rises at 01:46 (65°) and sets at 12:17 (292°)."
    },
    planets: {
      "zh-Hant": "11月2日黎明前：火星02:22、木星02:34升起，朝東北方觀察；金星04:57升起、貼近地平線。實際可見性受雲量和地形影響。",
      "zh-Hans": "11月2日黎明前：火星02:22、木星02:34升起，朝东北方观察；金星04:57升起、贴近地平线。实际可见性受云量和地形影响。",
      en: "Before dawn on 2 November, Mars rises at 02:22 and Jupiter at 02:34; look northeast. Venus rises at 04:57, low on the horizon. Clouds and terrain affect visibility."
    },
    events: {
      "zh-Hant": "本日S／A行星事件及未來72小時預告尚待獨立星曆核驗，不代表沒有重大事件。",
      "zh-Hans": "本日S／A行星事件及未来72小时预告尚待独立星历核验，不代表没有重大事件。",
      en: "Today's S/A planetary events and the 72-hour outlook await independent ephemeris verification; this does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "當日可追溯的觀測時段天氣和光害資料暫缺；出門前請確認最新預報，選擇安全且遠離強光的位置。",
      "zh-Hans": "当日可追溯的观测时段天气和光害资料暂缺；出门前请确认最新预报，选择安全且远离强光的位置。",
      en: "Traceable weather and light-pollution data for the viewing period are unavailable. Check the latest forecast and choose a safe location away from bright lights."
    },
    sources: [
      { title: "Timeanddate · Sydney Moon, 2 Nov 2026", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney planets, 1–2 Nov 2026", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" }
    ]
  }
];

const UI: Record<Lang, {
  title: string; subtitle: string; archived: string; moon: string;
  planets: string; events: string; weather: string; sources: string;
  daily: string; why: string; actions: string; signature: string; note: string; tips: string[];
}> = {
  "zh-Hant": {
    title: "每日觀象", subtitle: "觀天象 · 知時序", archived: "歷史觀測紀錄，尚未更新到今日",
    moon: "月相與升落", planets: "行星動態", events: "行星事件核驗", weather: "觀測提醒",
    sources: "完整紀錄及資料來源", daily: "天空正在發生什麼", why: "如何理解",
    actions: "今日可做的事", signature: "觀天有時，行事有度",
    note: "以上為天文觀測。占星象徵與八字判斷不屬同一證據層，另行標示。",
    tips: ["今晚看土星前先查看雲量與雨勢。", "避開街燈並選擇安全、視野開闊的位置。", "若想看木星與火星，安排11月2日黎明前觀測。"]
  },
  "zh-Hans": {
    title: "每日观象", subtitle: "观天象 · 知时序", archived: "历史观测记录，尚未更新到今日",
    moon: "月相与升落", planets: "行星动态", events: "行星事件核验", weather: "观测提醒",
    sources: "完整记录及数据来源", daily: "天空正在发生什么", why: "如何理解",
    actions: "今天可做的事", signature: "观天有时，行事有度",
    note: "以上为天文观测。占星象征与八字判断不属同一证据层，另行标示。",
    tips: ["今晚看土星前先查看云量与雨势。", "避开街灯并选择安全、视野开阔的位置。", "如想看木星与火星，安排11月2日黎明前观测。"]
  },
  en: {
    title: "Daily Sky", subtitle: "Observe the sky · Mark the seasons", archived: "Archived observation; today's update is not available",
    moon: "Moon phase and rise/set", planets: "Planet visibility", events: "Planetary event verification", weather: "Viewing advice",
    sources: "Full record and sources", daily: "What is happening in the sky?", why: "How to interpret it",
    actions: "Practical things to do", signature: "Watch the sky; act with care",
    note: "Astronomy is presented here as observation. Astrological symbolism and BaZi judgments are separate evidence layers.",
    tips: ["Check clouds and rain before viewing Saturn tonight.", "Choose a safe open view away from streetlights.", "For Jupiter and Mars, plan an observation before dawn on 2 November."]
  }
};

export function DailySkyObservation() {
  const { locale } = useI18n();
  const lang: Lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const [today, setToday] = useState(() => sydneyDate(new Date()));
  useEffect(() => {
    const update = () => setToday(sydneyDate(new Date()));
    const timer = window.setInterval(update, 30_000);
    document.addEventListener("visibilitychange", update);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, []);
  const observation = OBSERVATIONS.filter((entry) => entry.date <= today).at(-1);
  const ui = UI[lang];
  if (!observation) return null;
  const stale = observation.date !== today;
  const zoneName = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", timeZoneName: "short" })
    .formatToParts(new Date(`${observation.date}T12:00:00Z`)).find((part) => part.type === "timeZoneName")?.value ?? "Australia/Sydney";
  return (
    <section className="daily-sky" aria-label={ui.title}>
      <header>
        <span className="daily-sky-kicker">ZHAOWU · SYDNEY SKY</span>
        <h2>{ui.title}</h2><p>{ui.subtitle}</p>
        <time dateTime={observation.date}>{observation.date} · Australia/Sydney ({zoneName})</time>
      </header>
      {stale && <p className="daily-sky-stale" role="status">{ui.archived}</p>}
      <div className="daily-sky-columns">
        <section><h3>{ui.moon}</h3><p>{observation.moon[lang]}</p></section>
        <section><h3>{ui.planets}</h3><p>{observation.planets[lang]}</p></section>
      </div>
      <p className="daily-sky-quote">{ui.signature}</p>
      <section><h3>{ui.daily}</h3><p>{observation.moon[lang]}</p></section>
      <section><h3>{ui.why}</h3><p>{observation.date === "2026-11-01"
        ? (lang === "en" ? "Late spring in Sydney brings later sunsets, while planetary visibility depends on the actual horizon and weather, not on astrology." : lang === "zh-Hans" ? "悉尼正值春末，日落渐晚；能否看见行星取决于地平线和天气，不代表命运变化。" : "悉尼正值春末，日落漸晚；能否看見行星取決於地平線和天氣，不代表命運變化。")
        : ui.note}</p></section>
      <section><h3>{ui.events}</h3><p>{observation.events[lang]}</p></section>
      <section><h3>{ui.weather}</h3><p>{observation.weather[lang]}</p></section>
      {observation.date === "2026-11-01" && <section><h3>{ui.actions}</h3><ul>{ui.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></section>}
      {observation.date === "2026-11-02" && <section><h3>{ui.actions}</h3><ul>{(lang === "en" ? ["Check the latest clouds and weather before observing.", "Choose a safe site with an open northeastern horizon.", "Before sunrise, look for Jupiter and Mars; do not point optical equipment near the Sun."] : lang === "zh-Hans" ? ["观测前查看最新云量及天气。", "选择安全、东北方视野开阔的地点。", "日出前寻找木星与火星；光学器材不要指向太阳附近。"] : ["觀測前查看最新雲量及天氣。", "選擇安全、東北方視野開闊的地點。", "日出前尋找木星與火星；光學器材不要指向太陽附近。"]).map((tip) => <li key={tip}>{tip}</li>)}</ul></section>}
      <details>
        <summary>{ui.sources}</summary>
        <p><time dateTime={observation.date}>{observation.date}</time> · Australia/Sydney</p>
        <ul>{observation.sources.map((source) => <li key={source.url}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
        </li>)}</ul>
        {OBSERVATIONS.filter((entry) => entry.date < observation.date).map((old) =>
          <details key={old.date}><summary>{old.date}</summary><p>{old.moon[lang]}</p><p>{old.planets[lang]}</p></details>
        )}
      </details>
      <p className="daily-sky-note">{ui.note}</p>
    </section>
  );
}
