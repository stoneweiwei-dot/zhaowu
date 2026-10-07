import { useEffect, useRef, useState } from "react";
import { searchCities } from "@/lib/actions";
import type { CityHit } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";
import { localizeCityHit } from "@/lib/bazi/cities";
import { needsTimezone, resolveCityTimezone } from "@/lib/geo/city-search";

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
  invalid?: boolean;
  errorMessage?: string;
};

function normalizeQuery(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[\s,，。·/\\-]+/g, "");
}

function exactMatch(rows: CityHit[], q: string): CityHit | null {
  const normalizedQuery = normalizeQuery(q);
  return rows.find((city) => {
    const firstLabel = city.display.split(/[，,]/)[0] ?? city.display;
    const candidates = [city.name, city.display, firstLabel].map(normalizeQuery);
    return candidates.includes(normalizedQuery);
  }) ?? null;
}

/**
 * Birthplace picker.
 * Owner 2026-10-08: typing felt stuck. Root causes fixed here:
 *  - the input text is never rewritten while the visitor is typing (exact matches
 *    are confirmed silently and the label is normalised only on blur/selection);
 *  - IME composition (iPhone 注音/拼音) does not trigger searches mid-composition;
 *  - stale responses are discarded and repeated queries are cached.
 */
export function CityPicker({
  id,
  label,
  placeholder,
  optional = false,
  optionalLabel,
  popularLabel,
  locale,
  value = null,
  onSelect,
  invalid = false,
  errorMessage,
}: PickerProps) {
  const [query, setQuery] = useState(value?.display ?? "");
  const [hits, setHits] = useState<CityHit[]>([]);
  const [selected, setSelected] = useState<CityHit | null>(value);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [tzError, setTzError] = useState(false);
  const composing = useRef(false);
  const requestSeq = useRef(0);
  const listId = `${id}-results`;
  const errorId = `${id}-error`;
  const optionalToken = optionalLabel.trim().toLowerCase();
  const showOptionalLabel = optional
    && Boolean(optionalToken)
    && !label.toLowerCase().includes(optionalToken);

  const copy = locale === "en"
    ? { searching: "Searching places…", none: "No match yet — try the town name in English or a nearby city.", confirmed: "Confirmed", resolving: "Confirming time zone…", tzFailed: "Could not confirm this place's time zone. Please retry or choose a nearby town." }
    : locale === "zh-Hans"
      ? { searching: "正在搜索地点…", none: "暂时没有找到，可试试英文地名或附近城镇。", confirmed: "已确认", resolving: "正在确认时区…", tzFailed: "无法确认这个地点的时区，请重试或选择附近城镇。" }
      : { searching: "正在搜尋地點…", none: "暫時沒有找到，可試試英文地名或附近城鎮。", confirmed: "已確認", resolving: "正在確認時區…", tzFailed: "無法確認這個地點的時區，請重試或選擇附近城鎮。" };

  useEffect(() => {
    const localized = value ? localizeCityHit(value, locale) : null;
    setSelected(localized);
    setQuery(localized?.display ?? "");
    if (value && localized && localized.display !== value.display) onSelect(localized);
  }, [locale, onSelect, value?.display, value?.latitude, value?.longitude]);

  async function commit(city: CityHit, rewriteText: boolean) {
    setTzError(false);
    let ready: CityHit | null = city;
    if (needsTimezone(city)) {
      setResolving(true);
      ready = await resolveCityTimezone(city);
      setResolving(false);
    }
    if (!ready) {
      setTzError(true);
      setSelected(null);
      onSelect(null);
      return;
    }
    setSelected(ready);
    if (rewriteText) setQuery(ready.display);
    setHits([]);
    onSelect(ready);
  }

  function runSearch(raw: string) {
    const q = raw.trim();
    const seq = ++requestSeq.current;
    if (q.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    void searchCities({ data: q })
      .then((rows) => {
        if (seq !== requestSeq.current) return;
        const localized = rows.map((city) => localizeCityHit(city, locale));
        setHits(localized);
        // Confirm an exact match silently; never overwrite what the visitor is typing.
        const exact = exactMatch(localized, q);
        if (exact && !needsTimezone(exact)) {
          setSelected(exact);
          onSelect(exact);
        }
      })
      .catch(() => {
        if (seq === requestSeq.current) setHits([]);
      })
      .finally(() => {
        if (seq === requestSeq.current) setSearching(false);
      });
  }

  useEffect(() => {
    if (composing.current) return;
    const q = query.trim();
    if (selected && selected.display === q) return;
    const timer = window.setTimeout(() => runSearch(q), 320);
    return () => window.clearTimeout(timer);
  }, [locale, query]); // eslint-disable-line react-hooks/exhaustive-deps

  const showEmpty = !searching && !selected && query.trim().length >= 2 && hits.length === 0;

  return (
    <div className="relative" data-city-picker>
      <label htmlFor={id} className="mb-2 block text-sm text-ink-soft">
        {label}
        {showOptionalLabel ? <span className="ml-2 text-xs text-ink-mute">{optionalLabel}</span> : null}
      </label>
      <input
        id={id}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="search"
        inputMode="search"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={hits.length > 0}
        aria-invalid={invalid || tzError || undefined}
        aria-describedby={invalid && errorMessage ? errorId : undefined}
        className={`h-12 w-full rounded-md border bg-cream px-4 text-base outline-none transition focus:border-cinnabar ${invalid || tzError ? "border-cinnabar" : "border-line"}`}
        onFocus={() => {
          if (selected || query.trim().length >= 2) return;
          void searchCities({ data: "" })
            .then((rows) => setHits(rows.map((city) => localizeCityHit(city, locale))))
            .catch(() => setHits([]));
        }}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={(e) => {
          composing.current = false;
          setQuery(e.currentTarget.value);
          runSearch(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setHits([]);
          if (e.key === "Enter" && !composing.current) {
            e.preventDefault();
            const pick = exactMatch(hits, query) ?? hits[0];
            if (pick) void commit(pick, true);
          }
        }}
        onBlur={() => {
          // Normalise the visible label only after the visitor has finished typing.
          window.setTimeout(() => {
            setHits([]);
            if (selected && query !== selected.display && exactMatch([selected], query)) setQuery(selected.display);
          }, 180);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setTzError(false);
          if (selected) {
            setSelected(null);
            onSelect(null);
          }
        }}
      />
      {selected && !hits.length ? (
        <p className="mt-2 text-xs text-ink-mute" data-city-confirmed>{copy.confirmed}：{selected.display} · {selected.timezone}</p>
      ) : null}
      {searching || resolving ? <p className="mt-2 text-xs text-ink-mute" role="status">{resolving ? copy.resolving : copy.searching}</p> : null}
      {showEmpty ? <p className="mt-2 text-xs text-ink-mute" role="status">{copy.none}</p> : null}
      {tzError ? <p role="alert" className="mt-2 text-sm text-cinnabar">{copy.tzFailed}</p> : null}
      {invalid && errorMessage ? <p id={errorId} role="alert" className="mt-2 text-sm text-cinnabar">{errorMessage}</p> : null}
      {hits.length ? (
        <div id={listId} role="listbox" aria-label={query.trim().length < 2 ? popularLabel : label} className="absolute z-40 mt-1 max-h-72 w-full overflow-auto overscroll-contain rounded-md border border-line bg-cream shadow-xl">
          {query.trim().length < 2 ? (
            <p className="border-b border-line/60 px-4 py-2 text-xs tracking-[0.16em] text-ink-mute">{popularLabel}</p>
          ) : null}
          {hits.map((city) => (
            <button
              key={`${city.display}-${city.latitude}-${city.longitude}`}
              type="button"
              role="option"
              aria-selected={selected?.display === city.display}
              className="block min-h-[48px] w-full border-b border-line/60 px-4 py-3 text-left text-[15px] last:border-0 hover:bg-paper"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void commit(city, true)}
            >
              <span className="block text-ink">{city.display}</span>
              {city.timezone ? <span className="mt-1 block text-xs text-ink-mute">{city.timezone}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
