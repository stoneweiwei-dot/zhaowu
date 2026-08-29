import { useEffect, useState, type FormEvent } from "react";
import { analyzeLife, searchCities } from "@/lib/actions";
import type { AnalyzeInput, CityHit } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { localizeCityHit } from "@/lib/bazi/cities";
import { useAppStore } from "@/lib/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createEngineReportRecord, updateBirthData } from "@/lib/supabase-rest";

type PickerProps = {
  id: string;
  label: string;
  placeholder: string;
  optional?: boolean;
  optionalLabel: string;
  popularLabel: string;
  locale: Locale;
  value?: CityHit | null;
  onSelect: (city: CityHit | null) => void;
};

function CityPicker({
  id,
  label,
  placeholder,
  optional = false,
  optionalLabel,
  popularLabel,
  locale,
  value = null,
  onSelect,
}: PickerProps) {
  const [query, setQuery] = useState(value?.display ?? "");
  const [hits, setHits] = useState<CityHit[]>([]);
  const [selected, setSelected] = useState<CityHit | null>(value);
  const listId = `${id}-results`;

  useEffect(() => {
    const localized = value ? localizeCityHit(value, locale) : null;
    setSelected(localized);
    setQuery(localized?.display ?? "");
    if (value && localized && localized.display !== value.display)
      onSelect(localized);
  }, [locale, onSelect, value?.display, value?.latitude, value?.longitude]);

  useEffect(() => {
    const q = query.trim();
    if (selected?.display === q || q.length < 2) {
      setHits([]);
      return;
    }
    let alive = true;
    const timer = window.setTimeout(() => {
      void searchCities({ data: q })
        .then((rows) => {
          if (alive) setHits(rows.map((city) => localizeCityHit(city, locale)));
        })
        .catch(() => {
          if (alive) setHits([]);
        });
    }, 220);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [locale, query, selected]);

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-2 block text-sm text-ink-soft">
        {label}
        {optional ? (
          <span className="ml-2 text-xs text-ink-mute">{optionalLabel}</span>
        ) : null}
      </label>
      <input
        id={id}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={hits.length > 0}
        className="h-12 w-full rounded-md border border-line bg-cream px-4 text-base outline-none transition focus:border-cinnabar"
        onFocus={() => {
          if (selected || query.trim().length >= 2) return;
          void searchCities({ data: "" })
            .then((rows) =>
              setHits(rows.map((city) => localizeCityHit(city, locale))),
            )
            .catch(() => setHits([]));
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setHits([]);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          if (selected) {
            setSelected(null);
            onSelect(null);
          }
        }}
      />
      {hits.length ? (
        <div
          id={listId}
          role="listbox"
          aria-label={query.trim().length < 2 ? popularLabel : label}
          className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line bg-cream shadow-xl"
        >
          {query.trim().length < 2 ? (
            <p className="border-b border-line/60 px-4 py-2 text-xs tracking-[0.16em] text-ink-mute">
              {popularLabel}
            </p>
          ) : null}
          {hits.map((city) => (
            <button
              key={`${city.display}-${city.latitude}-${city.longitude}`}
              type="button"
              role="option"
              aria-selected={selected?.display === city.display}
              className="block w-full border-b border-line/60 px-4 py-3 text-left text-sm last:border-0 hover:bg-paper"
              onClick={() => {
                setSelected(city);
                setQuery(city.display);
                setHits([]);
                onSelect(city);
              }}
            >
              <span className="block text-ink">{city.display}</span>
              <span className="mt-1 block text-xs text-ink-mute">
                {city.timezone}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function asCity(value: unknown): CityHit | null {
  if (!value || typeof value !== "object") return null;
  const c = value as Partial<CityHit>;
  if (
    typeof c.display !== "string" ||
    typeof c.name !== "string" ||
    typeof c.timezone !== "string"
  )
    return null;
  if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude))
    return null;
  return c as CityHit;
}

export function AnalysisForm() {
  const { t, locale } = useI18n();
  const { user, profile, session } = useCurrentUserState();
  const setCurrent = useAppStore((s) => s.setCurrent);
  const setSavedId = useAppStore((s) => s.setSavedId);
  const reset = useAppStore((s) => s.reset);
  const current = useAppStore((s) => s.current);
  const [question, setQuestion] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [gender, setGender] = useState<AnalyzeInput["gender"]>("unspecified");
  const [relation, setRelation] = useState<AnalyzeInput["relation"]>("unset");
  const [birthCity, setBirthCity] = useState<CityHit | null>(null);
  const [liveCity, setLiveCity] = useState<CityHit | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remembered, setRemembered] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const compact = Boolean(current) && !detailsOpen;
  const compactCopy =
    locale === "en"
      ? {
          adjust: "Edit details",
          solar: "True solar time applied",
          zi: "Day changes at midnight",
        }
      : locale === "zh-Hans"
        ? {
            adjust: "调整资料",
            solar: "已套用真太阳时校正",
            zi: "子时不换日（以午夜为界）",
          }
        : {
            adjust: "調整資料",
            solar: "已套用真太陽時校正",
            zi: "子時不換日（以午夜為界）",
          };

  useEffect(() => {
    reset();
    const clear = () => reset();
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, [reset]);

  useEffect(() => {
    const raw = user?.birthData;
    if (!raw) return;
    const b = raw as Record<string, unknown>;
    setYear(b.year != null ? String(b.year) : "");
    setMonth(b.month != null ? String(b.month) : "");
    setDay(b.day != null ? String(b.day) : "");
    setHour(b.hour != null ? String(b.hour) : "");
    setMinute(b.minute != null ? String(b.minute) : "");
    setTimeUnknown(Boolean(b.timeUnknown));
    if (
      b.gender === "male" ||
      b.gender === "female" ||
      b.gender === "unspecified"
    )
      setGender(b.gender);
    if (
      b.relation === "any" ||
      b.relation === "hetero" ||
      b.relation === "same" ||
      b.relation === "unset"
    )
      setRelation(b.relation);
    const bc = asCity(b.city);
    const lc = asCity(b.liveCity);
    if (bc) setBirthCity(bc);
    setLiveCity(lc);
    setRemembered(true);
  }, [user?.id, user?.birthData]);

  useEffect(() => {
    setDetailsOpen(!current);
  }, [current?.id]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!birthCity) {
      setError(t("errCity"));
      return;
    }
    if (!question.trim()) {
      setError(t("errQuestion"));
      return;
    }
    setBusy(true);
    try {
      const payload: AnalyzeInput = {
        question: question.trim(),
        locale,
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: timeUnknown ? 12 : Number(hour),
        minute: timeUnknown ? 0 : Number(minute || 0),
        timeUnknown,
        gender,
        relation,
        city: birthCity,
        liveCity,
        ziPolicy: "midnight",
        useTrueSolar: true,
      };
      const result = await analyzeLife({ data: payload });
      setCurrent(result);
      if (session) {
        setSavedId(result.id);
        const { question: _question, ...birthData } = payload;
        void Promise.allSettled([
          createEngineReportRecord({ session, profile, result }),
          updateBirthData(
            session,
            birthData as unknown as Record<string, unknown>,
          ),
        ]).then(() => {
          window.dispatchEvent(new Event("zhaowu-auth-change"));
          setRemembered(true);
        });
      }
      window.setTimeout(
        () =>
          document
            .getElementById("result")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        40,
      );
    } catch (err) {
      setError(
        locale === "en"
          ? t("errAnalyze")
          : err instanceof Error
            ? err.message
            : t("errAnalyze"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id="analysisForm"
      className={`seal-border rounded-xl bg-cream/95 p-5 sm:p-7 ${compact ? "is-compact" : ""}`}
    >
      <div className="zhaowu-analysis-heading">
        <div>
          {!compact ? (
            <p className="text-xs tracking-[0.24em] text-cinnabar">
              ZHAOWU · BIRTH CHART
            </p>
          ) : null}
          <h2
            className={`${compact ? "" : "mt-2"} font-display text-2xl sm:text-3xl`}
          >
            {t("formTitle")}
          </h2>
        </div>
        {compact ? (
          <button
            type="button"
            className="zhaowu-analysis-edit"
            onClick={() => setDetailsOpen(true)}
          >
            <span aria-hidden>◎</span>
            {compactCopy.adjust}
          </button>
        ) : null}
      </div>
      {!compact ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">
          {t("formLead")}
        </p>
      ) : null}
      {!compact && remembered ? (
        <p className="mt-2 text-xs text-wood">{t("remembered")}</p>
      ) : null}

      <form
        className={`${compact ? "zhaowu-analysis-compact-form" : "mt-6 space-y-6"}`}
        onSubmit={(e) => void submit(e)}
      >
        {!compact ? (
          <div className="zhaowu-analysis-core space-y-6">
            <div>
              <label
                htmlFor="analysis-question"
                className="mb-2 block text-sm text-ink-soft"
              >
                {t("question")}
              </label>
              <textarea
                id="analysis-question"
                value={question}
                maxLength={400}
                rows={3}
                required
                placeholder={t("qPh")}
                className="w-full resize-y rounded-md border border-line bg-cream px-4 py-3 text-base leading-7 outline-none transition focus:border-cinnabar"
                onChange={(e) => setQuestion(e.target.value)}
              />
              <p className="mt-1 text-right text-xs text-ink-mute">
                {question.length}/400
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: "birth-year",
                  label: t("year"),
                  value: year,
                  set: setYear,
                  min: 1900,
                  max: 2100,
                },
                {
                  id: "birth-month",
                  label: t("month"),
                  value: month,
                  set: setMonth,
                  min: 1,
                  max: 12,
                },
                {
                  id: "birth-day",
                  label: t("day"),
                  value: day,
                  set: setDay,
                  min: 1,
                  max: 31,
                },
              ].map((f) => (
                <label
                  htmlFor={f.id}
                  key={f.id}
                  className="text-sm text-ink-soft"
                >
                  <span className="mb-2 block">{f.label}</span>
                  <input
                    id={f.id}
                    type="number"
                    inputMode="numeric"
                    min={f.min}
                    max={f.max}
                    required
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="h-12 w-full rounded-md border border-line bg-cream px-3 text-base outline-none focus:border-cinnabar"
                  />
                </label>
              ))}
            </div>

            <div className="rounded-lg border border-line bg-paper/45 p-4">
              <div className="grid gap-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <p className="text-sm text-ink-soft">{t("time")}</p>
                <label
                  htmlFor="time-unknown"
                  className="flex min-h-11 items-center gap-2 text-xs leading-5 text-ink-mute"
                >
                  <input
                    id="time-unknown"
                    type="checkbox"
                    checked={timeUnknown}
                    onChange={(e) => setTimeUnknown(e.target.checked)}
                  />
                  {t("timeUnknown")}
                </label>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  id="birth-hour"
                  aria-label={t("hourPh")}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={23}
                  required={!timeUnknown}
                  disabled={timeUnknown}
                  value={hour}
                  placeholder={t("hourPh")}
                  onChange={(e) => setHour(e.target.value)}
                  className="h-12 min-w-0 rounded-md border border-line bg-cream px-3 text-base outline-none disabled:opacity-40 focus:border-cinnabar"
                />
                <input
                  id="birth-minute"
                  aria-label={t("minutePh")}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  disabled={timeUnknown}
                  value={minute}
                  placeholder={t("minutePh")}
                  onChange={(e) => setMinute(e.target.value)}
                  className="h-12 min-w-0 rounded-md border border-line bg-cream px-3 text-base outline-none disabled:opacity-40 focus:border-cinnabar"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label htmlFor="birth-gender" className="text-sm text-ink-soft">
                <span className="mb-2 block">{t("gender")}</span>
                <select
                  id="birth-gender"
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as AnalyzeInput["gender"])
                  }
                  className="h-12 w-full rounded-md border border-line bg-cream px-3 text-base outline-none focus:border-cinnabar"
                >
                  <option value="unspecified">{t("unset")}</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                </select>
              </label>
              <label
                htmlFor="relationship-preference"
                className="text-sm text-ink-soft"
              >
                <span className="mb-2 block">{t("relation")}</span>
                <select
                  id="relationship-preference"
                  value={relation}
                  onChange={(e) =>
                    setRelation(e.target.value as AnalyzeInput["relation"])
                  }
                  className="h-12 w-full rounded-md border border-line bg-cream px-3 text-base outline-none focus:border-cinnabar"
                >
                  <option value="unset">{t("unset")}</option>
                  <option value="any">{t("relAny")}</option>
                  <option value="hetero">{t("relHet")}</option>
                  <option value="same">{t("relSame")}</option>
                </select>
                <span className="mt-1 block text-xs leading-5 text-ink-mute">
                  {t("relHint")}
                </span>
              </label>
            </div>
          </div>
        ) : null}

        <div className={compact ? "zhaowu-analysis-cities" : "space-y-6"}>
          <CityPicker
            id="birth-city"
            label={t("city")}
            placeholder={t("cityPh")}
            optionalLabel={t("optional")}
            popularLabel={t("popularCities")}
            locale={locale}
            value={birthCity}
            onSelect={setBirthCity}
          />
          <CityPicker
            id="current-city"
            label={t("liveCity")}
            placeholder={t("liveCity")}
            optional
            optionalLabel={t("optional")}
            popularLabel={t("popularCities")}
            locale={locale}
            value={liveCity}
            onSelect={setLiveCity}
          />
          {!compact ? (
            <p className="-mt-4 text-xs leading-5 text-ink-mute">
              {t("liveHint")}
            </p>
          ) : null}
        </div>

        {compact ? (
          <div
            className="zhaowu-analysis-settings"
            aria-label={
              locale === "en" ? "Time calculation settings" : "時間換算設定"
            }
          >
            <span>
              <b aria-hidden>✓</b>
              {compactCopy.solar}
              <i aria-hidden>i</i>
            </span>
            <span>
              <small>{locale === "en" ? "Day boundary" : t("zi")}</small>
              {compactCopy.zi}
            </span>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm leading-6 text-cinnabar-deep"
          >
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-full bg-cinnabar px-6 text-base font-medium text-cream disabled:opacity-55"
        >
          {busy ? t("analyzing") : t("analyze")}
        </button>
      </form>
    </section>
  );
}
