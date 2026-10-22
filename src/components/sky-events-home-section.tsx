import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { getTodaySkyReportWindow } from "@/lib/sky-events";
import { TodaySkyCards } from "@/components/today-sky-cards";
import "@/sky-events.css";
import "@/sky-art-restore.css";

/** Accessible, same-level sibling to the almanac. Uses only dated, verified material. */
export function SkyEventsHomeSection() {
  const { locale } = useI18n();
  const lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const report = getTodaySkyReportWindow();
  const dateParts = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const currentSydneyDate = ["year", "month", "day"].map((type) => dateParts.find((part) => part.type === type)?.value ?? "00").join("-");
  const outdated = currentSydneyDate > report.end;
  const title = lang === "en" ? "Today’s sky · Star Imagery" : "今日星象 · 星辰形象";
  const note = outdated
    ? lang === "en" ? `Archived week ${report.start}–${report.end}; not today's live sky.`
      : lang === "zh-Hans" ? `历史周报 ${report.start}—${report.end}；不是今日实时星象。`
      : `歷史週報 ${report.start}—${report.end}；不是今日即時星象。`
    : lang === "en" ? `Verified weekly report ${report.start}–${report.end}; not a live feed.`
      : lang === "zh-Hans" ? `已核对当周星象 ${report.start}—${report.end}；非实时观测。`
      : `已核對當週星象 ${report.start}—${report.end}；非即時觀測。`;
  return (
    <section className="sky-events-home sky-art-home" aria-label={title} id="today-sky">
      <header className="sky-art-intro">
        <span className="sky-art-eyebrow">ZHAOWU · CELESTIAL JOURNAL</span>
        <h2>{title}</h2>
        <p>{note}</p>
        <Link to="/sky-events" className="sky-art-deep-link">
          {lang === "en" ? "Open the full sky journal" : lang === "zh-Hans" ? "阅读完整天象专栏" : "閱讀完整天象專欄"} <span aria-hidden="true">↗</span>
        </Link>
      </header>
      <TodaySkyCards />
    </section>
  );
}
