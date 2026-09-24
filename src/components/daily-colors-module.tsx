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
  const copy = active.copy[locale];
  const recommended = dailyColorById(almanac.recommendedId).copy[locale];
  const isUserOverride = selectedId !== almanac.recommendedId;
  const compact = variant === "embed";

  return (
    <section
      id="five-element-wardrobe"
      data-daily-colors={variant}
      aria-label={page.title}
    >
      <header>
        <p data-daily-colors-date>{formatDailyColorDate(almanac.date, locale)}</p>
        <h2>{compact ? (locale === "en" ? "Today's dress colour" : locale === "zh-Hans" ? "今日穿衣" : "今日穿衣") : page.title}</h2>
        <p>{compact ? `${page.todaySuit}：${recommended.name} · ${recommended.colorsLabel}` : page.subtitle}</p>
      </header>

      {compact ? null : (
        <article data-daily-colors-today aria-live="polite">
          <p>
            {page.todaySuit}：{recommended.name}
          </p>
          <p>
            {page.element} {copy.elementLabel}
            {" · "}
            {page.mood} {copy.keywords}
          </p>
          <p>
            {page.colors}：{copy.colorsLabel}
          </p>
          <p data-daily-colors-quote>{copy.quote}</p>
          <p>{copy.englishExplain}</p>
          {variant === "home" ? (
            <Link to="/daily-colors">{page.openFull}</Link>
          ) : (
            <p>{copy.description}</p>
          )}
        </article>
      )}

      {compact ? (
        <>
          <article data-daily-colors-today data-daily-colors-featured aria-live="polite">
            <div data-daily-colors-featured-head>
              <span aria-hidden="true" data-daily-color-featured-swatch>
                {active.swatches.map((hex) => <i key={hex} style={{ ["--swatch" as string]: hex }} />)}
              </span>
              <div>
                <small>{page.todaySuit}</small>
                <strong>{copy.name} · {copy.colorsLabel}</strong>
                <span>{copy.wantLabel} · {copy.elementLabel} · {copy.keywords}</span>
              </div>
            </div>
            <p data-daily-colors-quote>{copy.quote}</p>
            <p data-daily-colors-description>{copy.description}</p>
            <Link to="/daily-colors">{page.openFull}</Link>
          </article>
          <p data-daily-colors-pick>{page.pick}</p>
        </>
      ) : (
        <p>{page.pick}</p>
      )}

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
              data-testid={`daily-color-${state.id}`}
              aria-pressed={pressed}
              onClick={() => setSelectedId(state.id)}
              style={{ ["--daily-color-ink" as string]: state.ink }}
            >
              <span aria-hidden="true" data-daily-color-swatch>
                {state.swatches.map((hex) => (
                  <i key={hex} style={{ ["--swatch" as string]: hex }} />
                ))}
              </span>
              <strong>{item.name}</strong>
              <small>
                {item.wantLabel} · {item.elementLabel}
              </small>
            </button>
          );
        })}
      </div>

      {compact ? null : isUserOverride ? <p>{page.userNote}</p> : <p>{page.almanacNote}</p>}
      {compact ? null : <p>{page.boundary}</p>}
      {variant === "page" ? (
        <p>
          <Link to="/">{page.back}</Link>
        </p>
      ) : null}
    </section>
  );
}
