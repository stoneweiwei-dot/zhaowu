import { useEffect, useState, type FormEvent } from "react";
import { analyzeLife, searchCities } from "@/lib/actions";
import type { AnalyzeInput, CityHit } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

type PickerProps = {
  label: string;
  placeholder: string;
  optional?: boolean;
  onSelect: (city: CityHit | null) => void;
};

function CityPicker({ label, placeholder, optional = false, onSelect }: PickerProps) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<CityHit[]>([]);
  const [selected, setSelected] = useState<CityHit | null>(null);

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
          if (alive) setHits(rows);
        })
        .catch(() => {
          if (alive) setHits([]);
        });
    }, 220);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [query, selected]);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm text-ink-soft">
        {label}{optional ? <span className="ml-2 text-xs text-ink-mute">選填</span> : null}
      </label>
      <input
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        className="h-12 w-full rounded-md border border-line bg-cream px-4 text-base outline-none transition focus:border-cinnabar"
        onChange={(e) => {
          setQuery(e.target.value);
          if (selected) {
            setSelected(null);
            onSelect(null);
          }
        }}
      />
      {hits.length ? (
        <div className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line bg-cream shadow-xl">
          {hits.map((city) => (
            <button
              key={`${city.display}-${city.latitude}-${city.longitude}`}
              type="button"
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

export function AnalysisForm() {
  const { t } = useI18n();
  const setCurrent = useAppStore((s) => s.setCurrent);
  const reset = useAppStore((s) => s.reset);
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
  const [ziPolicy, setZiPolicy] = useState<AnalyzeInput["ziPolicy"]>("midnight");
  const [useTrueSolar, setUseTrueSolar] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reset();
    const clear = () => reset();
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, [reset]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!birthCity) {
      setError("請從搜尋結果選擇出生城市與國家。");
      return;
    }
    if (!question.trim()) {
      setError("請先寫下你真正想問的問題。");
      return;
    }
    setBusy(true);
    try {
      const payload: AnalyzeInput = {
        question: question.trim(),
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
        ziPolicy,
        useTrueSolar,
      };
      const result = await analyzeLife({ data: payload });
      setCurrent(result);
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析暫時未能完成，請檢查資料後再試。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="analysisForm" className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
      <p className="text-xs tracking-[0.28em] text-cinnabar">ZHAOWU · ANALYSIS</p>
      <h2 className="mt-2 font-display text-2xl sm:text-3xl">{t("formTitle")}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">{t("formLead")}</p>

      <form className="mt-6 space-y-6" onSubmit={(e) => void submit(e)}>
        <div>
          <label className="mb-2 block text-sm text-ink-soft">{t("question")}</label>
          <textarea
            value={question}
            maxLength={400}
            rows={4}
            placeholder={t("qPh")}
            className="w-full resize-y rounded-md border border-line bg-cream px-4 py-3 text-base leading-7 outline-none transition focus:border-cinnabar"
            onChange={(e) => setQuestion(e.target.value)}
          />
          <p className="mt-1 text-right text-xs text-ink-mute">{question.length}/400</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[{ label: t("year"), value: year, set: setYear, min: 1900, max: 2100 }, { label: t("month"), value: month, set: setMonth, min: 1, max: 12 }, { label: t("day"), value: day, set: setDay, min: 1, max: 31 }].map((f) => (
            <label key={f.label} className="text-sm text-ink-soft">
              <span className="mb-2 block">{f.label}</span>
              <input
                type="number"
                inputMode="numeric"
                min={f.min}
                max={f.max}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className="h-12 w-full rounded-md border border-line bg-cream px-3 text-base outline-none focus:border-cinnabar"
              />
            </label>
          ))}
        </div>

        <div className="rounded-lg border border-line bg-paper/45 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink-soft">{t("time")}</p>
            <label className="flex items-center gap-2 text-xs text-ink-mute">
              <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
              {t("timeUnknown")}
            </label>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={23}
              disabled={timeUnknown}
              value={hour}
              placeholder="時 0–23"
              onChange={(e) => setHour(e.target.value)}
              className="h-12 rounded-md border border-line bg-cream px-3 text-base outline-none disabled:opacity-40 focus:border-cinnabar"
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              disabled={timeUnknown}
              value={minute}
              placeholder="分 0–59"
              onChange={(e) => setMinute(e.target.value)}
              className="h-12 rounded-md border border-line bg-cream px-3 text-base outline-none disabled:opacity-40 focus:border-cinnabar"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-ink-soft">
            <span className="mb-2 block">{t("gender")}</span>
            <select value={gender} onChange={(e) => setGender(e.target.value as AnalyzeInput["gender"])} className="h-12 w-full rounded-md border border-line bg-cream px-3 text-base outline-none focus:border-cinnabar">
              <option value="unspecified">{t("unset")}</option>
              <option value="male">{t("male")}</option>
              <option value="female">{t("female")}</option>
            </select>
          </label>
          <label className="text-sm text-ink-soft">
            <span className="mb-2 block">感情需求類型</span>
            <select value={relation} onChange={(e) => setRelation(e.target.value as AnalyzeInput["relation"])} className="h-12 w-full rounded-md border border-line bg-cream px-3 text-base outline-none focus:border-cinnabar">
              <option value="unset">{t("unset")}</option>
              <option value="any">{t("relAny")}</option>
              <option value="hetero">{t("relHet")}</option>
              <option value="same">{t("relSame")}</option>
            </select>
            <span className="mt-1 block text-xs leading-5 text-ink-mute">{t("relHint")}</span>
          </label>
        </div>

        <CityPicker label={t("city")} placeholder={t("cityPh")} onSelect={setBirthCity} />
        <CityPicker label={t("liveCity")} placeholder={t("liveCity")} optional onSelect={setLiveCity} />
        <p className="-mt-4 text-xs leading-5 text-ink-mute">{t("liveHint")}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-12 items-center gap-3 rounded-md border border-line bg-paper/35 px-4 text-sm text-ink-soft">
            <input type="checkbox" checked={useTrueSolar} onChange={(e) => setUseTrueSolar(e.target.checked)} />
            {t("solar")}
          </label>
          <label className="text-sm text-ink-soft">
            <span className="mb-2 block">{t("zi")}</span>
            <select value={ziPolicy} onChange={(e) => setZiPolicy(e.target.value as AnalyzeInput["ziPolicy"])} className="h-12 w-full rounded-md border border-line bg-cream px-3 text-base outline-none focus:border-cinnabar">
              <option value="midnight">{t("ziMid")}</option>
              <option value="late">{t("ziLate")}</option>
            </select>
          </label>
        </div>

        {error ? <p className="rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm leading-6 text-cinnabar-deep">{error}</p> : null}

        <button type="submit" disabled={busy} className="h-12 w-full rounded-full bg-cinnabar px-6 text-base font-medium text-cream disabled:opacity-55 sm:w-auto">
          {busy ? t("analyzing") : t("analyze")}
        </button>
      </form>
    </section>
  );
}
