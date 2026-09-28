import { useI18n } from "@/lib/i18n";
import { getTodaySkyCards, getTodaySkyUpdatedDate } from "@/lib/sky-events";
import "@/sky-events.css";

type Lang = "zh-Hant" | "zh-Hans" | "en";

function formatDate(date: string, lang: Lang): string {
  const [, month, day] = date.split("-");
  if (lang === "en") return `${Number(month)}/${Number(day)}`;
  return `${Number(month)}月${Number(day)}日`;
}

/**
 * Compact daily/weekly sky-event digest: one card per verified aspect or
 * ingress, astronomy fact first and symbolic astrology clearly labelled
 * second. Every affected-sign note here is computed from classical
 * modality/element geometry in src/lib/sky-events.ts, never guessed from a
 * reader's unknown birth chart.
 */
export function TodaySkyCards() {
  const { locale } = useI18n();
  const lang: Lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const cards = getTodaySkyCards();
  const updated = getTodaySkyUpdatedDate();

  const ui = lang === "en"
    ? {
        kicker: "TODAY'S SKY",
        title: "Sky events this week",
        updated: `Updated through ${formatDate(updated, lang)}`,
        visible: "Naked-eye visible",
        notVisible: "Requires calculation",
        gradeA: "Major",
        gradeB: "Routine but real",
        impact: "Symbolic impact by sign",
        note: "Astronomy first, symbolic astrology second — clearly separated, and no reading assumes your birth chart."
      }
    : lang === "zh-Hans"
      ? {
          kicker: "今日星象",
          title: "本周星象速览",
          updated: `更新至 ${formatDate(updated, lang)}`,
          visible: "肉眼可见",
          notVisible: "需星历测算",
          gradeA: "重要天象",
          gradeB: "常规但真实",
          impact: "占星象征影响（按星座）",
          note: "天文事实优先，占星象征解读独立标示；未使用任何人的出生资料。"
        }
      : {
          kicker: "今日星象",
          title: "本週星象速覽",
          updated: `更新至 ${formatDate(updated, lang)}`,
          visible: "肉眼可見",
          notVisible: "需星曆測算",
          gradeA: "重要天象",
          gradeB: "常規但真實",
          impact: "占星象徵影響（按星座）",
          note: "天文事實優先，占星象徵解讀獨立標示；未使用任何人的出生資料。"
        };

  return (
    <section className="sky-today" aria-label={ui.title}>
      <header className="sky-today-header">
        <span className="sky-events-kicker">{ui.kicker}</span>
        <h2>{ui.title}</h2>
        <p className="sky-today-updated">{ui.updated}</p>
        <p className="sky-today-note">{ui.note}</p>
      </header>
      <div className="sky-today-list">
        {cards.map((card) => (
          <article key={card.id} className={`sky-today-card grade-${card.grade}`}>
            <div className="sky-today-card-mark" aria-hidden="true">{card.glyph}</div>
            <div className="sky-today-card-body">
              <div className="sky-today-badges">
                <span className="sky-today-date">{formatDate(card.date, lang)}</span>
                <span className={`sky-today-grade grade-${card.grade}`}>{card.grade === "A" ? ui.gradeA : ui.gradeB}</span>
                <span className={`sky-today-visibility ${card.visibleToNakedEye ? "is-visible" : ""}`}>
                  {card.visibleToNakedEye ? ui.visible : ui.notVisible}
                </span>
              </div>
              <strong className="sky-today-title">{card.title[lang]}</strong>
              <p className="sky-today-science">{card.scienceLine[lang]}</p>
              <div className="sky-today-impact">
                <span className="sky-today-theme">{card.theme[lang]}</span>
                <span className="sky-today-impact-label">{ui.impact}</span>
                <ul>
                  {card.affectedSigns.map((entry) => (
                    <li key={entry.sign[lang]}>
                      <b>{entry.sign[lang]}</b>
                      <span>{entry.note[lang]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
