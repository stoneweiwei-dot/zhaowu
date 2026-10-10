import type { Locale } from "@/lib/i18n";
import { SKINS, useSkin } from "@/lib/theme-skins";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

/** 後台「主題皮膚」：10 套一鍵換膚。預覽圖即實際 hero 素材。 */
export function OwnerThemeSkinsManager({ locale }: { locale: Locale }) {
  const { id, apply } = useSkin();
  const name = (s: (typeof SKINS)[number]) => (locale === "en" ? s.en : locale === "zh-Hans" ? s.hans : s.zh);
  const note = (s: (typeof SKINS)[number]) => (locale === "en" ? s.noteEn : locale === "zh-Hans" ? s.noteHans : s.noteZh);
  return (
    <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7" data-owner-theme-skins>
      <p className="text-xs tracking-[0.28em] text-cinnabar">THEME SKINS</p>
      <h2 className="mt-1 font-display text-2xl">{tr(locale, "主題皮膚", "主题皮肤", "Theme skins")}</h2>
      <p className="mt-2 text-sm leading-7 text-ink-soft">
        {tr(locale, "點「套用」即時換膚，整站立即生效；選擇會記在這台裝置。「還原預設」回到現行樣式。", "点「套用」即时换肤，整站立即生效；选择会记在这台设备。「还原默认」回到现行样式。", "Tap Apply to re-skin the whole site instantly. The choice is remembered on this device; Reset restores the current classic look.")}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <article className={`overflow-hidden rounded-xl border ${id === "" ? "border-[#315f51] ring-2 ring-[#315f51]/25" : "border-line"} bg-paper/40`}>
          <div className="flex h-28 items-center justify-center bg-paper-deep/40 text-sm text-ink-soft">{tr(locale, "現行樣式", "现行样式", "Classic")}</div>
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0"><p className="truncate font-medium">{tr(locale, "預設（現行）", "默认（现行）", "Default (current)")}</p></div>
            <button type="button" onClick={() => apply("none")} aria-pressed={id === ""} className="min-h-11 shrink-0 whitespace-nowrap rounded-full border border-line px-4 text-sm">{id === "" ? tr(locale, "使用中", "使用中", "In use") : tr(locale, "還原預設", "还原默认", "Reset")}</button>
          </div>
        </article>
        {SKINS.map((s) => {
          const active = id === s.id;
          return (
            <article key={s.id} className={`overflow-hidden rounded-xl border bg-paper/40 ${active ? "border-[#315f51] ring-2 ring-[#315f51]/25" : "border-line"}`}>
              <div className="relative h-28 w-full" style={{ background: `${s.swatch[0]} url(${s.hero}) center / cover no-repeat` }} role="img" aria-label={name(s)}>
                <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white">{tr(locale, `圖${s.ref}`, `图${s.ref}`, `Ref ${s.ref}`)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{name(s)}</p>
                  <p className="truncate text-xs text-ink-mute">{note(s)}</p>
                  <div className="mt-1.5 flex gap-1" aria-hidden="true">{s.swatch.map((c) => <i key={c} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: c }} />)}</div>
                </div>
                <button type="button" onClick={() => apply(s.id)} aria-pressed={active} className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-sm ${active ? "bg-[#315f51] text-[#fffaf0]" : "border border-[#315f51] text-[#315f51]"}`}>{active ? tr(locale, "使用中", "使用中", "In use") : tr(locale, "套用", "套用", "Apply")}</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
