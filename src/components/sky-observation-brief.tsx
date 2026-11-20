import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { sydneyDate } from "@/lib/daily-sky-date";
import { OBSERVATIONS } from "@/components/daily-sky-observation";
import "@/sky-observation-brief.css";

/** A summary of the existing dated observation, not a live ephemeris. */
export function SkyObservationBrief() {
  const { locale } = useI18n();
  const lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const [today, setToday] = useState(() => sydneyDate(new Date()));
  useEffect(() => {
    const update = () => setToday(sydneyDate(new Date()));
    const timer = window.setInterval(update, 30_000);
    document.addEventListener("visibilitychange", update);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, []);
  const latest = OBSERVATIONS.filter((entry) => entry.date <= today).at(-1);
  const copy = lang === "en"
    ? { title: "Sky observation", today: "Dated observation", stale: "Today's observation is not yet available", none: "No observation available for this date", zone: "Sydney time", more: "View record and sources", disclaimer: "Dated record · not a live feed or automatic daily update" }
    : lang === "zh-Hans"
      ? { title: "天象观测摘要", today: "当日观测记录", stale: "今日观测尚未更新", none: "该日期暂无观测记录", zone: "悉尼时间", more: "查看记录与来源", disclaimer: "指定日期的记录 · 并非即时数据或每日自动更新" }
      : { title: "天象觀測摘要", today: "當日觀測紀錄", stale: "今日觀測尚未更新", none: "該日期暫無觀測紀錄", zone: "悉尼時間", more: "查看紀錄與來源", disclaimer: "指定日期的紀錄 · 並非即時資料或每日自動更新" };
  const fresh = latest?.date === today;
  return <section className="sky-observation-brief" aria-labelledby="sky-brief-title">
    <div className="sky-observation-brief-heading"><h2 id="sky-brief-title">{copy.title}</h2><span role="status">{latest ? (fresh ? copy.today : copy.stale) : copy.none}</span></div>
    {latest && <><p className="sky-observation-brief-date"><time dateTime={latest.date}>{latest.date}</time> · {copy.zone}</p><p className="sky-observation-brief-moon">{latest.moon[lang]}</p></>}
    <p className="sky-observation-brief-note">{copy.disclaimer}</p>
    {latest && <a href="#sky-observation-record">{copy.more} <span aria-hidden="true">→</span></a>}
  </section>;
}
