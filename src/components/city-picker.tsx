import { useEffect, useState } from "react";
import { searchCities } from "@/lib/actions";
import type { CityHit } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";
import { localizeCityHit } from "@/lib/bazi/cities";

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
}: PickerProps) {
  const [query, setQuery] = useState(value?.display ?? "");
  const [hits, setHits] = useState<CityHit[]>([]);
  const [selected, setSelected] = useState<CityHit | null>(value);
  const listId = `${id}-results`;

  useEffect(() => {
    const localized = value ? localizeCityHit(value, locale) : null;
    setSelected(localized);
    setQuery(localized?.display ?? "");
    if (value && localized && localized.display !== value.display) onSelect(localized);
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
        {optional ? <span className="ml-2 text-xs text-ink-mute">{optionalLabel}</span> : null}
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
            .then((rows) => setHits(rows.map((city) => localizeCityHit(city, locale))))
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
        <div id={listId} role="listbox" aria-label={query.trim().length < 2 ? popularLabel : label} className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line bg-cream shadow-xl">
          {query.trim().length < 2 ? (
            <p className="border-b border-line/60 px-4 py-2 text-xs tracking-[0.16em] text-ink-mute">{popularLabel}</p>
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
              <span className="mt-1 block text-xs text-ink-mute">{city.timezone}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
