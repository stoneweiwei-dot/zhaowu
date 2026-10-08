import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  DAILY_COLOR_PAGE,
  DAILY_COLOR_STATES,
  dailyColorAlmanacRef,
  dailyColorById,
  formatDailyColorDate,
  type DailyColorId,
} from "@/lib/daily-colors";
import {
  FIVE_ELEMENT_GUIDE_COPY,
  FIVE_ELEMENT_USE_STATES,
  fiveElementCorrespondence,
} from "@/lib/five-element-correspondences";
import { useI18n } from "@/lib/i18n";


type ChakraLocale = "zh-Hant" | "zh-Hans" | "en";
const CHAKRA_COLOUR_IDEAS = [
  { hex: "#B94340", name: ["海底輪", "海底轮", "Root"], focus: ["安全", "安全", "Security"] },
  { hex: "#DB823C", name: ["臍輪", "脐轮", "Sacral"], focus: ["創造", "创造", "Creativity"] },
  { hex: "#D7B347", name: ["太陽神經叢輪", "太阳神经丛轮", "Solar plexus"], focus: ["自信", "自信", "Confidence"] },
  { hex: "#438A65", name: ["心輪", "心轮", "Heart"], focus: ["關係", "关系", "Connection"] },
  { hex: "#4384AD", name: ["喉輪", "喉轮", "Throat"], focus: ["表達", "表达", "Expression"] },
  { hex: "#475B96", name: ["眉心輪", "眉心轮", "Brow"], focus: ["洞察", "洞察", "Insight"] },
  { hex: "#8F73A5", name: ["頂輪", "顶轮", "Crown"], focus: ["覺察", "觉察", "Awareness"] },
] as const;

export function ChakraColourIdeas({ locale }: { locale: ChakraLocale }) {
  const languageIndex = locale === "zh-Hant" ? 0 : locale === "zh-Hans" ? 1 : 2;
  const title = locale === "en" ? "Seven colour ideas" : locale === "zh-Hans" ? "七色搭配灵感" : "七色搭配靈感";
  const intro = locale === "en"
    ? "A modern chakra colour palette for styling ideas only. Not a fixed five-element or birth-chart mapping, and not a healing claim."
    : locale === "zh-Hans"
      ? "取自现代常见的脉轮配色，仅供穿搭灵感；不与五行或命盘喜忌直接对应，也不代表疗效。"
      : "取自現代常見的脈輪配色，僅供穿搭靈感；不與五行或命盤喜忌直接對應，也不代表療效。";
  return (
    <details data-chakra-colour-ideas>
      <summary>{title}<span aria-hidden="true">＋</span></summary>
      <div data-chakra-colour-content>
        <p>{intro}</p>
        <div data-chakra-colour-grid>
          {CHAKRA_COLOUR_IDEAS.map((item) => (
            <div key={item.hex} data-chakra-colour-item>
              <i aria-hidden="true" style={{ backgroundColor: item.hex }} />
              <span><strong>{item.name[languageIndex]}</strong><small>{item.focus[languageIndex]}</small></span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

type Variant = "home" | "page" | "embed";

export function DailyColorsModule({ variant, date }: { variant: Variant; date?: Date }) {
  const { locale } = useI18n();
  const page = DAILY_COLOR_PAGE[locale];
  const [localNow, setLocalNow] = useState(() => new Date());
  useEffect(() => {
    if (date) return;
    const refresh = () => setLocalNow(new Date());
    const timer = window.setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [date]);
  const almanac = dailyColorAlmanacRef(date ?? localNow);
  const [selectedId, setSelectedId] = useState<DailyColorId | null>(null);
  const activeId = selectedId ?? almanac.recommendedId;
  const active = dailyColorById(activeId);
  const copy = active.copy[locale];
  const recommended = dailyColorById(almanac.recommendedId).copy[locale];
  const isUserOverride = selectedId !== null && selectedId !== almanac.recommendedId;
  const compact = variant === "embed";
  const guide = FIVE_ELEMENT_GUIDE_COPY[locale];
  const correspondence = fiveElementCorrespondence(active.element, locale);

  const choices = (
    <div role="list" data-daily-colors-choices>
            {DAILY_COLOR_STATES.map((state) => {
              const item = state.copy[locale];
              const pressed = state.id === activeId;
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
  );

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

            <Link to="/daily-colors">{page.openFull}</Link>
          </article>

        </>
      ) : (
        <p>{page.pick}</p>
      )}

      {compact ? (
        <details data-daily-colour-choices-fold>
          <summary>{locale === "en" ? "Choose a different five-element colour" : locale === "zh-Hans" ? "选择其他五行配色" : "選擇其他五行配色"}<span aria-hidden="true">＋</span></summary>
          {choices}
        </details>
      ) : choices}

      {compact ? (
        <article data-five-element-correspondence-compact aria-live="polite">
          <small>{guide.compactTitle}</small>
          <strong>{correspondence.name} · {correspondence.motion}</strong>
          <span>
            {guide.color} {correspondence.classicalColor}
            {" · "}{guide.tone} {correspondence.tone}
            {" · "}{guide.qi} {correspondence.qi}
          </span>
        </article>
      ) : (
        <section data-five-element-correspondence aria-label={guide.fullTitle}>
          <header>
            <h3>{guide.fullTitle}</h3>
            <p>{guide.fullSubtitle}</p>
          </header>

          <article data-five-element-correspondence-current aria-live="polite">
            <div>
              <small>{guide.function}</small>
              <strong>{correspondence.name} · {correspondence.function}</strong>
              <span>{correspondence.motion}</span>
            </div>
            <dl data-five-element-correspondence-grid>
              <div><dt>{guide.color}</dt><dd>{correspondence.classicalColor}</dd></div>
              <div><dt>{guide.tone}</dt><dd>{correspondence.tone}</dd></div>
              <div><dt>{guide.qi}</dt><dd>{correspondence.qi}</dd></div>
              <div><dt>{guide.season}</dt><dd>{correspondence.season}</dd></div>
              <div><dt>{guide.direction}</dt><dd>{correspondence.direction}</dd></div>
              <div><dt>{guide.taste}</dt><dd>{correspondence.taste}</dd></div>
              <div><dt>{guide.zangFu}</dt><dd>{correspondence.zangFu}</dd></div>
              <div><dt>{guide.body}</dt><dd>{correspondence.body}</dd></div>
              <div><dt>{guide.emotion}</dt><dd>{correspondence.emotion}</dd></div>
              <div><dt>{guide.spirit}</dt><dd>{correspondence.spirit}</dd></div>
              <div><dt>{guide.labor}</dt><dd>{correspondence.labor}</dd></div>
            </dl>
            <p><b>{guide.practice}</b>{correspondence.practice}</p>
            <p><b>{guide.overuse}</b>{correspondence.overuse}</p>
          </article>

          <div data-five-element-use-states>
            <h4>{guide.statesTitle}</h4>
            {FIVE_ELEMENT_USE_STATES.map((state) => {
              const item = state.copy[locale];
              return <p key={state.id}><strong>{item.title}</strong><span>{item.action}</span></p>;
            })}
          </div>

          <p data-five-element-correspondence-boundary>{guide.boundary}</p>
        </section>
      )}

      {compact ? null : isUserOverride ? <p>{page.userNote}</p> : <p>{page.almanacNote}</p>}
      {compact ? null : <ChakraColourIdeas locale={locale} />}
      {compact ? null : <p>{page.boundary}</p>}
      {variant === "page" ? (
        <p>
          <Link to="/">{page.back}</Link>
        </p>
      ) : null}
    </section>
  );
}
