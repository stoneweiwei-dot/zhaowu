import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { getTodaySkyUpdatedDate } from "@/lib/sky-events";
import { TodaySkyCards } from "@/components/today-sky-cards";
import "@/sky-events.css";
import "@/sky-art-restore.css";

/** Accessible, same-level sibling to the almanac. Uses only dated, verified material. */
export function SkyEventsHomeSection() {
  const { locale } = useI18n();
  const lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const updated = getTodaySkyUpdatedDate();
  const dateParts = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const field = (type: string) => dateParts.find((part) => part.type === type)?.value || "00";
  const currentSydneyDate = field("year") + "-" + field("month") + "-" + field("day");
  const outdated = updated < currentSydneyDate;
  const title = lang === "en" ? "Today’s sky · Star Imagery" : "今日星象 · 星辰形象";
  const note = outdated
    ? lang === "en"
      ? "Archived report through " + updated + ". This is not today's live sky."
      : lang === "zh-Hans"
        ? "历史播报：资料截至 " + updated + "，不是今日实时星象。"
        : "歷史播報：資料截至 " + updated + "，不是今日即時星象。"
    : lang === "en"
      ? "Astronomical facts and symbolic readings are labelled separately."
      : lang === "zh-Hans"
        ? "天文事实与占星象征分开标示。"
        : "天文事實與占星象徵分開標示。";
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
