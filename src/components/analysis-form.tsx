import { useEffect, useRef, useState } from "react";
import { analyzeLife, consumeQuestionAccess, saveBirthProfile, searchCities } from "@/lib/actions";
import { FEATURED_CITIES } from "@/lib/bazi/cities";
import type { AnalyzeInput, CityHit, Gender, RelationPref, ZiPolicy } from "@/lib/bazi/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

function CityPicker({ label, value, onChange, optional = false }: { label: string; value: CityHit | null; onChange: (v: CityHit | null) => void; optional?: boolean }) {
  const [q, setQ] = useState(value?.display ?? "");
  const [items, setItems] = useState<CityHit[]>(FEATURED_CITIES.slice(0, 6));
  const [open, setOpen] = useState(false);
  useEffect(() => { if (value) setQ(value.display); }, [value]);
  useEffect(() => {
    const id = window.setTimeout(() => {
      void searchCities({ data: q }).then(setItems).catch(() => setItems(FEATURED_CITIES.slice(0, 6)));
    }, 220);
    return () => window.clearTimeout(id);
  }, [q]);
  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs tracking-[0.12em] text-ink-mute">{label}</label>
      <input
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQ(e.target.value); onChange(null); setOpen(true); }}
        placeholder={optional ? "选填，例如 Sydney, Australia" : "例如 Sydney, Australia"}
        className="h-11 w-full rounded-md border border-line bg-cream px-3 text-sm outline-none focus:border-cinnabar"
      />
      {open && items.length > 0 ? (
        <div className="absolute z-40 mt-1 max-h-52 w-full overflow-auto rounded-md border border-line bg-cream shadow-xl">
          {optional ? <button type="button" className="block w-full px-3 py-2 text-left text-xs text-ink-mute" onClick={() => { setQ(""); onChange(null); setOpen(false); }}>不填写</button> : null}
          {items.map((city) => (
            <button key={`${city.display}-${city.latitude}`} type="button" className="block w-full border-t border-line/50 px-3 py-2 text-left text-sm hover:bg-paper" onClick={() => { setQ(city.display); onChange(city); setOpen(false); }}>
              {city.display}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type Draft = Omit<AnalyzeInput, "city"> & { city: CityHit | null };

const initial: Draft = {
  question: "",
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  timeUnknown: false,
  gender: "unspecified",
  relation: "unset",
  city: null,
  liveCity: null,
  ziPolicy: "midnight",
  useTrueSolar: true,
};

export function AnalysisForm() {
  const { t } = useI18n();
  const { user, profile, refreshProfile } = useCurrentUserState();
  const setCurrent = useAppStore((s) => s.setCurrent);
  const setLastInput = useAppStore((s) => s.setLastInput);
  const [draft, setDraft] = useState<Draft>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current || !profile?.birthData) return;
    const b = profile.birthData;
    setDraft((d) => ({
      ...d,
      ...b,
      question: "",
      city: b.city && typeof b.city === "object" ? b.city as CityHit : d.city,
      liveCity: b.liveCity && typeof b.liveCity === "object" ? b.liveCity as CityHit : null,
    }));
    hydrated.current = true;
  }, [profile]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!draft.city) { setMsg("请先从列表选择出生城市。"); return; }
    const input = { ...draft, city: draft.city } as AnalyzeInput;
    setBusy(true);
    try {
      await consumeQuestionAccess();
      const result = await analyzeLife({ data: input });
      setLastInput(input);
      setCurrent(result);
      if (user) {
        await saveBirthProfile(input);
        await refreshProfile();
      }
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      setMsg(text === "QUESTION_LIMIT" ? "今天免费的 2 次提问已经用完。站主账号不受此限制。" : text || "分析暂时无法完成。请检查资料后再试。 ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="analysisForm" className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
      <p className="text-xs tracking-[0.28em] text-cinnabar">{t("product")}</p>
      <h2 className="mt-2 font-display text-2xl">{t("formTitle")}</h2>
      <p className="mt-2 text-sm leading-7 text-ink-soft">{t("formLead")}</p>
      {user && profile?.birthData ? <p className="mt-2 text-xs text-cinnabar">已自动带入你上次保存的出生资料。</p> : null}
      <form className="mt-6 space-y-5" onSubmit={submit}>
        <div>
          <label className="mb-1.5 block text-xs tracking-[0.12em] text-ink-mute">{t("question")}</label>
          <textarea value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} rows={3} maxLength={400} placeholder="例如：我现在该留在这份工作，还是换到新的方向？" className="w-full resize-none rounded-md border border-line bg-cream px-3 py-3 text-sm leading-6 outline-none focus:border-cinnabar" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-xs text-ink-mute">年<input type="number" min={1900} max={2100} value={draft.year} onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })} className="mt-1 h-11 w-full rounded-md border border-line bg-cream px-2 text-sm" /></label>
          <label className="text-xs text-ink-mute">月<input type="number" min={1} max={12} value={draft.month} onChange={(e) => setDraft({ ...draft, month: Number(e.target.value) })} className="mt-1 h-11 w-full rounded-md border border-line bg-cream px-2 text-sm" /></label>
          <label className="text-xs text-ink-mute">日<input type="number" min={1} max={31} value={draft.day} onChange={(e) => setDraft({ ...draft, day: Number(e.target.value) })} className="mt-1 h-11 w-full rounded-md border border-line bg-cream px-2 text-sm" /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-ink-mute">小时（24h）<input type="number" min={0} max={23} disabled={draft.timeUnknown} value={draft.hour} onChange={(e) => setDraft({ ...draft, hour: Number(e.target.value) })} className="mt-1 h-11 w-full rounded-md border border-line bg-cream px-3 text-sm disabled:opacity-40" /></label>
          <label className="text-xs text-ink-mute">分钟<input type="number" min={0} max={59} disabled={draft.timeUnknown} value={draft.minute} onChange={(e) => setDraft({ ...draft, minute: Number(e.target.value) })} className="mt-1 h-11 w-full rounded-md border border-line bg-cream px-3 text-sm disabled:opacity-40" /></label>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft"><input type="checkbox" checked={draft.timeUnknown} onChange={(e) => setDraft({ ...draft, timeUnknown: e.target.checked })} />时间不确定：时柱、命宫与大运起运留白，不伪造午时。</label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-ink-mute">性别（排大运）<select value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value as Gender })} className="mt-1 h-11 w-full rounded-md border border-line bg-cream px-3 text-sm"><option value="unspecified">先不提供</option><option value="male">男</option><option value="female">女</option></select></label>
          <label className="text-xs text-ink-mute">感情需求方向<select value={draft.relation} onChange={(e) => setDraft({ ...draft, relation: e.target.value as RelationPref })} className="mt-1 h-11 w-full rounded-md border border-line bg-cream px-3 text-sm"><option value="unset">先不提供</option><option value="any">不限</option><option value="hetero">异性缘</option><option value="same">同性／多元</option></select></label>
        </div>
        <CityPicker label="出生城市／国家" value={draft.city} onChange={(city) => setDraft({ ...draft, city })} />
        <CityPicker label="目前居住城市（选填，只用于季节/生活节奏）" value={(draft.liveCity as CityHit | null) ?? null} onChange={(liveCity) => setDraft({ ...draft, liveCity })} optional />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-ink-soft"><input type="checkbox" checked={draft.useTrueSolar} onChange={(e) => setDraft({ ...draft, useTrueSolar: e.target.checked })} />套用真太阳时校正</label>
          <label className="text-xs text-ink-mute">子时换日<select value={draft.ziPolicy} onChange={(e) => setDraft({ ...draft, ziPolicy: e.target.value as ZiPolicy })} className="mt-1 h-10 w-full rounded-md border border-line bg-cream px-2 text-sm"><option value="midnight">以午夜为界</option><option value="late">晚子换日（23时起）</option></select></label>
        </div>
        {msg ? <p className="rounded-md border border-cinnabar/30 bg-cinnabar/5 px-3 py-2 text-sm leading-6 text-cinnabar">{msg}</p> : null}
        <button disabled={busy} className="inline-flex h-12 w-full items-center justify-center rounded-full bg-cinnabar px-6 text-cream disabled:opacity-60 sm:w-auto">
          {busy ? "正在建立命盘…" : "开始分析"}
        </button>
      </form>
    </section>
  );
}
