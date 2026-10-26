import { FROST_SKIN_ID, SEASONAL_AUTO_ID, FROST_PHASES, SOLAR_TERMS_24, seasonalState } from "@/lib/seasonal-skins";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  ARCHIVED_SKINS,
  CURATED_SKINS,
  SKINS,
  SEASONAL_SKINS,
  skinById,
  useSkin,
  type SkinDef,
  type SkinFamily,
} from "@/lib/theme-skins";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

type ThemePreview = { src: string; alt: string };
type FamilyFilter = "all" | SkinFamily;

const FAMILY_FILTERS: FamilyFilter[] = ["all", "soft", "water", "warm", "green", "night"];

function familyName(locale: Locale, family: FamilyFilter) {
  const labels: Record<FamilyFilter, [string, string, string]> = {
    all: ["全部精選", "全部精选", "All curated"],
    soft: ["粉彩", "粉彩", "Pastel"],
    water: ["水色", "水色", "Water"],
    warm: ["暖金", "暖金", "Warm"],
    green: ["青木", "青木", "Green"],
    night: ["夜色", "夜色", "Night"],
  };
  return tr(locale, ...labels[family]);
}

function localName(locale: Locale, skin: SkinDef) {
  return locale === "en" ? skin.en : locale === "zh-Hans" ? skin.hans : skin.zh;
}

function localNote(locale: Locale, skin: SkinDef) {
  return locale === "en" ? skin.noteEn : locale === "zh-Hans" ? skin.noteHans : skin.noteZh;
}

type ThemeCardProps = {
  locale: Locale;
  skin: SkinDef;
  active: boolean;
  saving: boolean;
  compact?: boolean;
  family?: SkinFamily;
  onChoose: (id: string) => void;
  onPreview: (preview: ThemePreview) => void;
};

function ThemeCard({ locale, skin, active, saving, compact = false, family, onChoose, onPreview }: ThemeCardProps) {
  const name = localName(locale, skin);
  const dark = skin.mode === "dark";
  return (
    <article
      className={`overflow-hidden rounded-[18px] border ${active ? "ring-2 ring-offset-2" : ""}`}
      style={{ backgroundColor: skin.swatch[0], borderColor: skin.swatch[1], color: dark ? "#f7f1e5" : "#262523", outlineColor: skin.swatch[1] }}
      data-owner-theme-card={skin.id}
    >
      <button type="button" onClick={() => onPreview({ src: skin.hero, alt: `${name} · ${tr(locale, "原畫", "原画", "Original artwork")}` })} className="block w-full text-left" aria-label={`${name} · ${tr(locale, "查看原畫", "查看原画", "View original artwork")}`}>
        <img src={skin.hero} alt="" loading="lazy" className={`${compact ? "h-28" : "h-44"} w-full object-cover`} style={{ objectPosition: skin.focus }} />
      </button>
      <div className="p-4" style={{ background: dark ? "rgba(4,12,18,.74)" : "rgba(255,255,255,.58)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-lg leading-7">{name}</p>
            <p className="mt-1 text-sm leading-6 opacity-80">{localNote(locale, skin)}</p>
            {skin.id === FROST_SKIN_ID && <p className="mt-1 text-sm leading-6"><span lang="zh">霜降</span> · <span lang="en">Frost’s Descent</span></p>}
          </div>
          {family ? <span className="shrink-0 rounded-sm border border-current/25 px-2.5 py-1 text-[11px] opacity-75">{familyName(locale, family)}</span> : null}
        </div>
        <div className="mt-3 flex items-center gap-2" aria-label={tr(locale, "主題色票", "主题色票", "Theme palette")}>
          {skin.swatch.map((colour) => <i key={colour} className="h-5 flex-1 rounded-sm border border-black/10" style={{ backgroundColor: colour }} />)}
        </div>
        <button type="button" disabled={saving} onClick={() => onChoose(skin.id)} aria-pressed={active} className="mt-4 min-h-11 w-full rounded-sm border px-4 text-sm font-medium disabled:opacity-50" style={{ borderColor: skin.swatch[1], backgroundColor: active ? skin.swatch[1] : "transparent", color: active ? (dark ? skin.swatch[0] : "#fffaf0") : "inherit" }}>
          {saving ? tr(locale, "同步中…", "同步中…", "Saving…") : active ? tr(locale, "全站使用中", "全站使用中", "Live site theme") : tr(locale, "套用這套主題", "套用这套主题", "Publish this theme")}
        </button>
      </div>
    </article>
  );
}

/** Curated owner catalog: ten distinct palettes first, similar historical skins kept in one disclosure. */
export function OwnerThemeSkinsManager({ locale }: { locale: Locale }) {
  const { id, apply } = useSkin();
  const [filter, setFilter] = useState<FamilyFilter>("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<ThemePreview | null>(null);
  const current = skinById(id);
  const currentSolar = seasonalState();
  const visibleThemes = useMemo(() => CURATED_SKINS.filter((entry) => filter === "all" || entry.family === filter), [filter]);

  useEffect(() => {
    if (!preview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [preview]);

  const choose = async (next: string) => {
    if (saving) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apply(next);
      setSuccess(tr(locale, "已同步給所有訪客。", "已同步给所有访客。", "Published for all visitors."));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : tr(locale, "儲存失敗，網站主題未更動。", "保存失败，网站主题未更改。", "Save failed. Public theme unchanged."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7" data-owner-theme-skins>
      <p className="text-xs tracking-[0.28em] text-cinnabar">CURATED THEMES</p>
      <h2 className="mt-1 font-display text-2xl">{tr(locale, "主題管理", "主题管理", "Theme manager")}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-soft">
        {tr(locale, "主選區只保留色系與氣質差異清楚的 10 套。相近版本已收進下方的歷史主題，不會刪除。", "主选区只保留色系与气质差异清楚的 10 套。相近版本已收进下方的历史主题，不会删除。", "The main catalog keeps ten clearly distinct themes. Similar versions remain available in Historical themes below.")}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper/55 p-3">
        <div>
          <p className="text-xs text-ink-mute">{tr(locale, "目前全站", "目前全站", "Live across the site")}</p>
          <p className="mt-0.5 font-medium text-ink">{current ? localName(locale, current) : tr(locale, "系統預設", "系统默认", "System default")}</p>
        </div>
        <button type="button" disabled={saving || id === ""} onClick={() => void choose("none")} className="min-h-11 rounded-sm border border-line px-4 text-sm text-ink disabled:opacity-40">
          {tr(locale, "恢復系統預設", "恢复系统默认", "Restore default")}
        </button>
      </div>

      {error ? <p role="alert" className="mt-3 text-sm text-cinnabar">{error}</p> : null}
      {success ? <p role="status" className="mt-3 text-sm text-wood">{success}</p> : null}

      <section className="mt-5 border-y border-line py-4" data-seasonal-theme-collection>
        <h3 className="font-display text-xl">{tr(locale, "節氣主題", "节气主题", "Seasonal themes")}</h3>
        <p className="mt-2 text-sm leading-7">{tr(locale, "完整 24 節氣／72 候按悉尼日期 00:01 自動切換，使用天文交節所在的悉尼日曆日，而非精確交節秒數。霜降三候使用專屬原畫，其餘節氣採用現有完整主題畫作，不冒稱已製作 72 幅新畫。", "完整 24 节气／72 候按悉尼日期 00:01 自动切换，依据天文交节所在日期，并非精确交节秒数。霜降三候有专属原画，其余沿用已上架主题。", "All 24 terms and 72 pentads switch at 00:01 on each Sydney calendar date derived from the astronomical solar term. This is a visual schedule, not exact astronomical transition time. Frost has bespoke art; other terms reuse existing complete themes.")}</p>
        <div data-seasonal-current className="mt-3 rounded-lg border border-line bg-paper/60 px-4 py-3">
          <strong className="font-display">{locale === "en" ? currentSolar.term.en : locale === "zh-Hans" ? currentSolar.term.hans : currentSolar.term.zh}</strong>
          <span className="ml-3 text-sm">{currentSolar.hou[locale]}</span>
          <p className="mt-1 text-xs text-ink-mute">{tr(locale, "當前節氣日期", "当前节气日期", "Current term date")}: {currentSolar.termDate} · {tr(locale, "候序", "候序", "Pentad")} {currentSolar.houIndex + 1}/3</p>
        </div>
        <button type="button" disabled={saving} aria-pressed={id === SEASONAL_AUTO_ID} onClick={() => void choose(SEASONAL_AUTO_ID)} className="mt-3 min-h-11 w-full rounded-lg border border-wood px-4 py-2 text-sm">
          {id === SEASONAL_AUTO_ID ? tr(locale, "節氣自動模式使用中", "节气自动模式使用中", "Seasonal automatic mode is live") : tr(locale, "啟用節氣自動模式", "启用节气自动模式", "Enable seasonal automatic mode")}
        </button>
        <p className="my-3 text-sm leading-7">{tr(locale, "每候約五日：初候第 0–4 日、二候第 5–9 日、三候直至下一節氣，避免日期缺口。中國傳統物候不是悉尼天氣預報。", "每候约五日：初候第 0–4 日、二候第 5–9 日、三候直到下一节气；传统物候并非悉尼天气预报。", "About five days per pentad: days 0–4, 5–9, then the third until the next term. Traditional Chinese phenology is not Sydney's weather forecast.")}</p>
        <details className="mb-4 rounded-lg border border-line p-3" data-seasonal-72-list>
          <summary className="cursor-pointer text-sm font-medium">{tr(locale, "查看完整 24 節氣・72 候", "查看完整 24 节气・72 候", "Browse all 24 terms and 72 pentads")}</summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">{SOLAR_TERMS_24.map(term => (
            <div key={term.zh} className="rounded-md bg-paper/70 p-3">
              <strong className="text-base">{locale === "en" ? term.en : locale === "zh-Hans" ? term.hans : term.zh}</strong>
              <p className="mt-1 text-sm leading-6 text-ink-soft">{term.hou.map((hou,i) => `${i+1}. ${hou[locale]}`).join(" · ")}</p>
            </div>
          ))}</div>
        </details>
        <div className="grid gap-4 sm:grid-cols-2">{SEASONAL_SKINS.map(skin => <ThemeCard key={skin.id} locale={locale} skin={skin} active={id === skin.id} saving={saving} onChoose={(next) => void choose(next)} onPreview={setPreview} />)}</div>
        <details className="mt-3 border-t border-line pt-2"><summary className="flex min-h-11 cursor-pointer items-center text-sm">{tr(locale, "查看三候畫作", "查看三候画作", "View the three seasonal scenes")}</summary>
          <div className="grid gap-3 sm:grid-cols-3">{FROST_PHASES.map(phase => <button key={phase.start} type="button" onClick={() => setPreview({ src: phase.art, alt: phase.name[locale] })} className="min-h-11 text-left"><img src={phase.art} alt="" loading="lazy" className="aspect-[9/16] w-full rounded-lg object-cover" /><span className="block py-2 text-sm">{phase.name[locale]}</span></button>)}</div>
        </details>
      </section>

      <nav className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label={tr(locale, "按色系篩選", "按色系筛选", "Filter by palette")}>
        {FAMILY_FILTERS.map((family) => (
          <button key={family} type="button" aria-pressed={filter === family} onClick={() => setFilter(family)} className={`min-h-11 shrink-0 rounded-sm border px-4 text-sm ${filter === family ? "border-wood bg-wood text-cream" : "border-line bg-paper/60 text-ink"}`}>
            {familyName(locale, family)}
          </button>
        ))}
      </nav>

      <div className="mt-4 grid gap-4 sm:grid-cols-2" data-curated-theme-grid>
        {visibleThemes.map(({ skin, family }) => (
          <ThemeCard key={skin.id} locale={locale} skin={skin} family={family} active={id === skin.id} saving={saving} onChoose={(next) => void choose(next)} onPreview={setPreview} />
        ))}
      </div>

      <details className="mt-6 rounded-lg border border-line bg-paper/35" data-archived-theme-collection>
        <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-4 py-3 text-ink">
          <span><strong className="block">{tr(locale, "歷史主題", "历史主题", "Historical themes")}</strong><small className="mt-1 block text-ink-mute">{tr(locale, "相近版本集中收納，需要時仍可套用", "相近版本集中收纳，需要时仍可套用", "Similar editions are tucked away and still available")}</small></span>
          <span className="rounded-sm border border-line px-2.5 py-1 text-xs">{ARCHIVED_SKINS.length}</span>
        </summary>
        <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-2">
          {ARCHIVED_SKINS.map((skin) => (
            <ThemeCard key={skin.id} locale={locale} skin={skin} compact active={id === skin.id} saving={saving} onChoose={(next) => void choose(next)} onPreview={setPreview} />
          ))}
        </div>
      </details>

      {preview ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-6" onClick={() => setPreview(null)}>
          <section role="dialog" aria-modal="true" aria-label={preview.alt} onClick={(event) => event.stopPropagation()} className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-cream shadow-2xl">
            <div className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-4 py-2">
              <p className="min-w-0 truncate text-sm font-medium text-ink">{preview.alt}</p>
              <button type="button" autoFocus onClick={() => setPreview(null)} className="min-h-11 shrink-0 rounded-sm border border-line bg-paper px-4 text-sm text-ink" aria-label={tr(locale, "返回主題列表", "返回主题列表", "Back to themes")}>
                {tr(locale, "返回主題列表", "返回主题列表", "Back to themes")}
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-2 sm:p-4">
              <img src={preview.src} alt={preview.alt} className="max-h-[calc(100dvh-7rem)] max-w-full object-contain" />
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
