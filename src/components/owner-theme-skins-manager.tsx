import { SEASONAL_AUTO_ID, seasonalState } from "@/lib/seasonal-skins";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  MANUAL_THEME_FAMILIES,
  SKINS,
  SYDNEY_SEASON_SKINS,
  skinById,
  sydneyClock,
  useSkin,
  type SkinDef,
} from "@/lib/theme-skins";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

type ThemePreview = { src: string; alt: string };

function skinFromId(id: string) {
  const skin = SKINS.find((candidate) => candidate.id === id);
  if (!skin) throw new Error(`Missing theme ${id}`);
  return skin;
}

function localName(locale: Locale, skin: SkinDef) {
  return locale === "en" ? skin.en : locale === "zh-Hans" ? skin.hans : skin.zh;
}

function localNote(locale: Locale, skin: SkinDef) {
  return locale === "en" ? skin.noteEn : locale === "zh-Hans" ? skin.noteHans : skin.noteZh;
}

const SEASON_CHROME: Record<string, { radius: string; shadow: string }> = {
  "sydney-jacaranda": { radius: "28px", shadow: "0 0 0 2px #9a7ec4, 0 0 0 6px rgba(196,161,90,.55)" },
  "southern-summer": { radius: "18px", shadow: "0 8px 0 #d7a441, 0 0 0 2px #0c5870" },
  "southern-autumn": { radius: "4px", shadow: "inset 10px 0 0 #2c4d66, 0 0 0 2px #c46a32" },
  "southern-winter": { radius: "0px", shadow: "0 0 0 1px #f7fbfd, 0 0 0 5px #1e4654" },
};

type ThemeCardProps = {
  locale: Locale;
  skin: SkinDef;
  active: boolean;
  saving: boolean;
  compact?: boolean;
  onChoose: (id: string) => void;
  onPreview: (preview: ThemePreview) => void;
};

function ThemeCard({ locale, skin, active, saving, compact = false, onChoose, onPreview }: ThemeCardProps) {
  const chrome = SEASON_CHROME[skin.id];
  const name = localName(locale, skin);
  const dark = skin.mode === "dark";
  return (
    <article
      className={`overflow-hidden border ${active ? "ring-2 ring-offset-2" : ""}`}
      style={{ backgroundColor: skin.swatch[0], borderColor: skin.swatch[1], color: dark ? "#f7f1e5" : "#202925", outlineColor: skin.swatch[1], borderRadius: chrome?.radius ?? "18px", boxShadow: chrome?.shadow }}
      data-owner-theme-card={skin.id}
      data-theme-frame={chrome ? skin.id : undefined}
    >
      <button type="button" onClick={() => onPreview({ src: skin.hero, alt: `${name} · ${tr(locale, "原畫", "原画", "Original artwork")}` })} className="block w-full text-left" aria-label={`${name} · ${tr(locale, "查看原畫", "查看原画", "View original artwork")}`}>
        <img src={skin.hero} alt="" loading="lazy" className={`${compact ? "h-28" : "h-44"} w-full object-cover`} style={{ objectPosition: skin.focus }} />
      </button>
      <div className="p-4" style={{ background: dark ? "rgba(4,12,18,.74)" : "rgba(255,255,255,.58)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-lg leading-7">{name}</p>
            <p className="mt-1 text-sm leading-6 opacity-80">{localNote(locale, skin)}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2" aria-label={tr(locale, "主題色票", "主题色票", "Theme palette")}>
          {skin.swatch.map((colour) => <i key={colour} className="h-5 flex-1 rounded-full border border-black/10" style={{ backgroundColor: colour }} />)}
        </div>
        <button type="button" disabled={saving} onClick={() => onChoose(skin.id)} aria-pressed={active} className="mt-4 min-h-11 w-full rounded-full border px-4 text-sm font-medium disabled:opacity-50" style={{ borderColor: skin.swatch[1], backgroundColor: active ? skin.swatch[1] : "transparent", color: active ? (dark ? skin.swatch[0] : "#fffaf0") : "inherit" }}>
          {saving ? tr(locale, "同步中…", "同步中…", "Saving…") : active ? tr(locale, "全站使用中", "全站使用中", "Live site theme") : tr(locale, "套用這套主題", "套用这套主题", "Publish this theme")}
        </button>
      </div>
    </article>
  );
}

/** Curated owner catalog: ten distinct palettes first, similar historical skins kept in one disclosure. */
export function OwnerThemeSkinsManager({ locale }: { locale: Locale }) {
  const { id, apply } = useSkin();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<ThemePreview | null>(null);
  const current = skinById(id);
  const currentSolar = seasonalState();
  const clock = sydneyClock();

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
        {tr(locale, "七十二候仍按悉尼日期自動換候。節氣與悉尼四季的畫面保持靜態。其餘畫境按題材分成六組，相近版本收在各組裡，編號都不刪。", "七十二候仍按悉尼日期自动换候。节气与悉尼四季的画面保持静态。其余画境按题材分成六组，相近版本收在各组里，编号都不删。", "The 72 pentads still follow the Sydney date. Solar-term and Sydney-season pictures stay still. The other themes are grouped by subject; near versions stay inside each group, and every id remains.")}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper/55 p-3">
        <div>
          <p className="text-xs text-ink-mute">{tr(locale, "目前全站", "目前全站", "Live across the site")}</p>
          <p className="mt-0.5 font-medium text-ink">{current ? localName(locale, current) : tr(locale, "系統預設", "系统默认", "System default")}</p>
        </div>
        <button type="button" disabled={saving || id === ""} onClick={() => void choose("none")} className="min-h-11 rounded-full border border-line px-4 text-sm text-ink disabled:opacity-40">
          {tr(locale, "恢復系統預設", "恢复系统默认", "Restore default")}
        </button>
      </div>

      {error ? <p role="alert" className="mt-3 text-sm text-cinnabar">{error}</p> : null}
      {success ? <p role="status" className="mt-3 text-sm text-wood">{success}</p> : null}

      <section className="mt-5 rounded-lg border border-line bg-paper/50 p-4" data-seasonal-theme-collection data-phenology-auto>
        <h3 className="font-display text-xl">{tr(locale, "七十二候・自動", "七十二候・自动", "72 pentads · automatic")}</h3>
        <p className="mt-2 text-sm leading-7" data-phenology-rule>
          {tr(locale,
            "二十四節氣、七十二候依悉尼當地日期，在 00:01 自動換候。澳洲東部夏令時間（GMT+11）與標準時間（GMT+10）由 Australia/Sydney 自行判斷，站主不用從七十二候裡點選。",
            "二十四节气、七十二候依悉尼当地日期，在 00:01 自动换候。澳洲东部夏令时间（GMT+11）与标准时间（GMT+10）由 Australia/Sydney 自行判断，站主不用从七十二候里点选。",
            "The 24 solar terms and 72 pentads change at 00:01 on the Sydney civil date. Australian Eastern daylight saving (GMT+11) and standard time (GMT+10) come from Australia/Sydney. There is nothing to pick among the 72 pentads.")}
        </p>
        <div data-seasonal-current className="mt-3 rounded-lg border border-line bg-cream/80 px-4 py-3">
          <p className="text-xs text-ink-mute">{tr(locale, "現在這一候", "现在这一候", "Pentad in force")}</p>
          <p className="mt-1 font-display text-lg">{locale === "en" ? currentSolar.term.en : locale === "zh-Hans" ? currentSolar.term.hans : currentSolar.term.zh}<span className="ml-3 text-sm font-normal">{currentSolar.hou[locale]}</span></p>
          <p className="mt-1 text-xs text-ink-mute">{tr(locale, "節氣日", "节气日", "Term date")} {currentSolar.termDate} · {tr(locale, "候序", "候序", "Pentad")} {currentSolar.houIndex + 1}/3</p>
          <p className="mt-1 text-xs text-ink-mute" data-sydney-clock>{tr(locale, "悉尼", "悉尼", "Sydney")} {clock.date} {clock.time} · {clock.dst ? tr(locale, "夏令時間", "夏令时间", "daylight saving") : tr(locale, "標準時間", "标准时间", "standard time")} {clock.offset}</p>
        </div>
        <button type="button" disabled={saving} aria-pressed={id === SEASONAL_AUTO_ID} onClick={() => void choose(SEASONAL_AUTO_ID)} className="mt-3 min-h-11 w-full rounded-lg border border-wood px-4 py-2 text-sm">
          {id === SEASONAL_AUTO_ID ? tr(locale, "七十二候自動使用中", "七十二候自动使用中", "Automatic pentads are live") : tr(locale, "啟用七十二候自動", "启用七十二候自动", "Enable automatic pentads")}
        </button>
        <p className="mt-3 text-sm leading-7" data-theme-static="solar">{tr(locale, "初候為節氣日起第 0–4 日，二候第 5–9 日，三候直到下一節氣。換的是日期與畫，不是動畫。這是中國傳統物候，不是悉尼天氣預報。南半球訪客看到的畫面改走下方四季。", "初候为节气日起第 0–4 日，二候第 5–9 日，三候直到下一节气。换的是日期与画，不是动画。这是中国传统物候，不是悉尼天气预报。南半球访客看到的画面改走下方四季。", "Pentads run days 0–4, 5–9, then through to the next term. The date and painting change; the picture does not animate. This is traditional Chinese phenology, not a Sydney weather forecast. Southern visitors see the four seasons below.")}</p>
      </section>

      <section className="mt-5" data-sydney-seasons>
        <h3 className="font-display text-xl">{tr(locale, "悉尼四季", "悉尼四季", "Sydney seasons")}</h3>
        <p className="mt-2 text-sm leading-7 text-ink-soft" data-theme-static="southern">{tr(locale, "南半球按悉尼月份自動換季，也可以手動套用。春是藍花楹，夏是東岸海灘，秋是藍山，冬是雪山。這四套畫面保持靜態。", "南半球按悉尼月份自动换季，也可以手动套用。春是蓝花楹，夏是东岸海滩，秋是蓝山，冬是雪山。这四套画面保持静态。", "The southern hemisphere follows Sydney’s months, and each season can also be published by hand. Spring is jacaranda, summer the eastern beaches, autumn the Blue Mountains, winter the Snowy Mountains. These four pictures stay still.")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {SYDNEY_SEASON_SKINS.map((skin) => (
            <ThemeCard key={skin.id} locale={locale} skin={skin} active={id === skin.id} saving={saving} onChoose={(next) => void choose(next)} onPreview={setPreview} />
          ))}
        </div>
      </section>

      <div className="mt-6 space-y-6" data-theme-families data-curated-theme-grid>
        {MANUAL_THEME_FAMILIES.map((family) => {
          const [leadId, ...rest] = family.skins;
          const lead = skinFromId(leadId);
          const title = locale === "en" ? family.en : locale === "zh-Hans" ? family.hans : family.zh;
          const note = locale === "en" ? family.noteEn : locale === "zh-Hans" ? family.noteHans : family.noteZh;
          return (
            <section key={family.id} data-theme-family={family.id} className="rounded-lg border border-line bg-paper/40 p-3">
              <h3 className="font-display text-xl">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink-soft">{note}</p>
              <div className="mt-3">
                <ThemeCard locale={locale} skin={lead} active={id === lead.id} saving={saving} onChoose={(next) => void choose(next)} onPreview={setPreview} />
              </div>
              <details className="mt-3 rounded-lg border border-line bg-cream/50" data-theme-family-rest={family.id}>
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span>{tr(locale, "同組相近畫境", "同组相近画境", "Related themes in this group")}</span>
                  <span className="rounded-full border border-line px-2 py-0.5 text-xs">{rest.length}</span>
                </summary>
                <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-2">
                  {rest.map((skinId) => {
                    const skin = skinFromId(skinId);
                    return <ThemeCard key={skin.id} locale={locale} skin={skin} compact active={id === skin.id} saving={saving} onChoose={(next) => void choose(next)} onPreview={setPreview} />;
                  })}
                </div>
              </details>
            </section>
          );
        })}
      </div>

      {preview ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-6" onClick={() => setPreview(null)}>
          <section role="dialog" aria-modal="true" aria-label={preview.alt} onClick={(event) => event.stopPropagation()} className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-cream shadow-2xl">
            <div className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-4 py-2">
              <p className="min-w-0 truncate text-sm font-medium text-ink">{preview.alt}</p>
              <button type="button" autoFocus onClick={() => setPreview(null)} className="min-h-11 shrink-0 rounded-full border border-line bg-paper px-4 text-sm text-ink" aria-label={tr(locale, "返回主題列表", "返回主题列表", "Back to themes")}>
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
