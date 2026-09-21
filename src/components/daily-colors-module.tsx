import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  DAILY_COLOR_PAGE,
  DAILY_COLOR_STATES,
  dailyColorAlmanacRef,
  dailyColorById,
  formatDailyColorDate,
  type DailyColorId,
} from "@/lib/daily-colors";
import { useI18n } from "@/lib/i18n";

type Variant = "home" | "page" | "embed";

export function DailyColorsModule({ variant }: { variant: Variant }) {
  const { locale } = useI18n();
  const page = DAILY_COLOR_PAGE[locale];
  const almanac = useMemo(() => dailyColorAlmanacRef(), []);
  const [selectedId, setSelectedId] = useState<DailyColorId>(almanac.recommendedId);
  const active = dailyColorById(selectedId);
  const selected = active.copy[locale];
  const recommended = dailyColorById(almanac.recommendedId).copy[locale];
  const isUserOverride = selectedId !== almanac.recommendedId;
  const compact = variant === "embed";

  return (
    <section id="five-element-wardrobe" data-daily-colors={variant} aria-label={page.title}>
      <header data-daily-color-header>
        <p data-daily-colors-date>{formatDailyColorDate(almanac.date, locale)}</p>
        <h2>{compact ? page.compactTitle : page.title}</h2>
        <p>{page.subtitle}</p>
      </header>

      <article data-daily-color-cue>
        <small>{page.todaySuit}</small>
        <strong>{recommended.name} · {recommended.colorsLabel}</strong>
        <span>{recommended.keywords}</span>
        <p>{page.almanacNote}</p>
      </article>

      <p data-daily-color-pick>{page.pick}</p>

      <div role="list" data-daily-colors-choices>
        {DAILY_COLOR_STATES.map((state) => {
          const item = state.copy[locale];
          const pressed = state.id === selectedId;
          return (
            <button
              key={state.id}
              type="button"
              role="listitem"
              data-daily-color-id={state.id}
              data-testid={"daily-color-" + state.id}
              aria-pressed={pressed}
              onClick={() => setSelectedId(state.id)}
              style={{ ["--daily-color-ink" as string]: state.ink }}
            >
              <span aria-hidden="true" data-daily-color-swatch>
                {state.swatches.map((hex) => (
                  <i key={hex} style={{ ["--swatch" as string]: hex }} />
                ))}
              </span>
              <span>
                <strong>{item.name}</strong>
                <small>{item.wantLabel}</small>
              </span>
            </button>
          );
        })}
      </div>

      <article data-daily-color-detail aria-live="polite">
        <header>
          <span aria-hidden="true" data-daily-color-detail-swatch style={{ ["--daily-color-ink" as string]: active.ink }} />
          <div>
            <p>{selected.name}</p>
            <strong>{selected.keywords}</strong>
          </div>
        </header>
        <section>
          <small>{page.core}</small>
          <p>{selected.core}</p>
        </section>
        <section>
          <small>{page.suitable}</small>
          <p>{selected.suitable.join(" · ")}</p>
        </section>
        <section>
          <small>{page.less}</small>
          <p>{selected.less}</p>
        </section>
        <blockquote>
          <small>{page.reminder}</small>
          <p>{selected.reminder}</p>
        </blockquote>
      </article>

      <p data-daily-color-user-note>{isUserOverride ? page.userNote : page.almanacNote}</p>
      <p data-daily-color-boundary>{page.boundary}</p>

      {compact ? <Link to="/daily-colors">{page.openFull} →</Link> : null}
      {variant === "page" ? <p><Link to="/">{page.back}</Link></p> : null}
    </section>
  );
}
