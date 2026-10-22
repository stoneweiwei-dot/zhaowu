import { useI18n } from "@/lib/i18n";
import { getTodaySkyCards, getTodaySkyUpdatedDate } from "@/lib/sky-events";
import { getSkyCardTone, getSkyWeekRange, getSkyWeekTheme, type SkyTone } from "@/lib/sky-week-presentation";
import "@/sky-events.css";

type Lang = "zh-Hant" | "zh-Hans" | "en";

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS: Record<Lang, string[]> = {
  "zh-Hant": ["週日", "週一", "週二", "週三", "週四", "週五", "週六"],
  "zh-Hans": ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
};

function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  // UTC on both ends: a plain calendar date must not shift with the reader's timezone.
  return { month, day, weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay() };
}

function formatDate(date: string, lang: Lang): string {
  const { month, day } = parseDate(date);
  return lang === "en" ? `${EN_MONTHS[month - 1]} ${day}` : `${month}月${day}日`;
}

/**
 * Weekly sky digest in the "星辰形象" layout: week badge, week theme, then one
 * dated card per verified aspect or ingress with its intensity colour. The
 * astronomy line always comes first and the symbolic reading is labelled
 * separately. Every affected-sign note is computed from classical
 * modality/element geometry in src/lib/sky-events.ts, never guessed from a
 * reader's unknown birth chart.
 */
export function TodaySkyCards() {
  const { locale } = useI18n();
  const lang: Lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const cards = getTodaySkyCards();
  const updated = getTodaySkyUpdatedDate();
  const range = getSkyWeekRange(cards);
  const weekTheme = getSkyWeekTheme(cards);

  const ui = lang === "en"
    ? {
        label: "ZHAOWU · WEEKLY BROADCAST",
        title: "Star Imagery",
        themeLabel: "THIS WEEK'S THEME",
        science: "ASTRONOMY",
        symbol: "SYMBOLISM",
        signs: "Signs touched",
        updated: `Updated through ${formatDate(updated, lang)}`,
        visible: "Naked-eye visible",
        notVisible: "Requires calculation",
        gradeA: "Major",
        gradeB: "Routine but real",
        tones: { high: "Major", mid: "Tension", shift: "Shift" } as Record<SkyTone, string>,
        note: "Astronomy first, symbolic astrology second — clearly separated, and no reading assumes your birth chart."
      }
    : lang === "zh-Hans"
      ? {
          label: "昭梧 · 每周播报",
          title: "星辰形象",
          themeLabel: "本周主题",
          science: "天文事实",
          symbol: "占星象征",
          signs: "影响星座",
          updated: `更新至 ${formatDate(updated, lang)}`,
          visible: "肉眼可见",
          notVisible: "需星历测算",
          gradeA: "重要天象",
          gradeB: "常规但真实",
          tones: { high: "强震", mid: "张力", shift: "转换" } as Record<SkyTone, string>,
          note: "天文事实优先，占星象征解读独立标示；未使用任何人的出生资料。"
        }
      : {
          label: "昭梧 · 每週播報",
          title: "星辰形象",
          themeLabel: "本週主題",
          science: "天文事實",
          symbol: "占星象徵",
          signs: "影響星座",
          updated: `更新至 ${formatDate(updated, lang)}`,
          visible: "肉眼可見",
          notVisible: "需星曆測算",
          gradeA: "重要天象",
          gradeB: "常規但真實",
          tones: { high: "強震", mid: "張力", shift: "轉換" } as Record<SkyTone, string>,
          note: "天文事實優先，占星象徵解讀獨立標示；未使用任何人的出生資料。"
        };

  const badge = range
    ? range.start === range.end
      ? formatDate(range.start, lang)
      : `${formatDate(range.start, lang)} — ${formatDate(range.end, lang)}`
    : "";

  return (
    <section className="sky-today" aria-label={ui.title}>
      <header className="sky-today-header">
        <div className="sky-today-header-left">
          <div className="sky-today-label">{ui.label}</div>
          <h2>{ui.title}</h2>
        </div>
        {badge ? <div className="sky-today-week-badge">{badge}</div> : null}
      </header>

      {weekTheme ? (
        <div className="sky-today-theme-block">
          <div className="sky-today-theme-label">{ui.themeLabel}</div>
          <p className="sky-today-theme-text">{weekTheme[lang]}</p>
        </div>
      ) : null}

      <div className="sky-today-list">
        {cards.map((card) => {
          const tone = getSkyCardTone(card);
          const { month, day, weekday } = parseDate(card.date);
          const firstNote = card.affectedSigns[0]?.note[lang] ?? "";
          const sharedNote = card.affectedSigns.every((entry) => entry.note[lang] === firstNote);
          return (
            <article key={card.id} className={`sky-today-card tone-${tone} grade-${card.grade}`}>
              <div className="sky-today-date-col">
                <span className="sky-today-day">{day}</span>
                <span className="sky-today-month">
                  <span>{lang === "en" ? EN_MONTHS[month - 1] : `${month}月`}</span>
                  <span>{WEEKDAYS[lang][weekday]}</span>
                </span>
              </div>
              <div className="sky-today-body">
                <div className="sky-today-name">
                  <span className="sky-today-glyph" aria-hidden="true">{card.glyph}</span>
                  {card.title[lang]}
                </div>
                <div className="sky-today-tags">
                  <span className={`sky-today-tag tag-${tone}`}>{ui.tones[tone]}</span>
                  <span className="sky-today-flag">{card.grade === "A" ? ui.gradeA : ui.gradeB}</span>
                  <span className={`sky-today-flag ${card.visibleToNakedEye ? "is-visible" : ""}`}>
                    {card.visibleToNakedEye ? ui.visible : ui.notVisible}
                  </span>
                </div>
                <div className="sky-today-block">
                  <span className="sky-today-block-label">{ui.science}</span>
                  <p className="sky-today-science">{card.scienceLine[lang]}</p>
                </div>
                <div className="sky-today-block">
                  <span className="sky-today-block-label">{ui.symbol}</span>
                  <p className="sky-today-influence">
                    <b>{card.theme[lang]}</b>
                    {sharedNote ? firstNote : null}
                  </p>
                  {sharedNote ? (
                    <div className="sky-today-signs" aria-label={ui.signs}>
                      {card.affectedSigns.map((entry) => <span key={entry.sign[lang]}>{entry.sign[lang]}</span>)}
                    </div>
                  ) : (
                    <ul className="sky-today-sign-list" aria-label={ui.signs}>
                      {card.affectedSigns.map((entry) => (
                        <li key={entry.sign[lang]}>
                          <b>{entry.sign[lang]}</b>
                          <span>{entry.note[lang]}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="sky-today-footer">
        <span className="sky-today-footer-text">{ui.updated} · {ui.note}</span>
        <div className="sky-today-legend" aria-hidden="true">
          {(["high", "mid", "shift"] as SkyTone[]).map((tone) => (
            <span key={tone}><i className={`sky-today-dot dot-${tone}`} />{ui.tones[tone]}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
