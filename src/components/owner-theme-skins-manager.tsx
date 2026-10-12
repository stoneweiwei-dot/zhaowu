import { Fragment } from "react";
import type { Locale } from "@/lib/i18n";
import { SKINS, useSkin } from "@/lib/theme-skins";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

/** 後台「主題皮膚」：原有 10 套 + 宋式留白 4 套，預覽圖使用實際的本地畫作。 */
export function OwnerThemeSkinsManager({ locale }: { locale: Locale }) {
  const { id, apply } = useSkin();
  const name = (s: (typeof SKINS)[number]) => (locale === "en" ? s.en : locale === "zh-Hans" ? s.hans : s.zh);
  const note = (s: (typeof SKINS)[number]) => (locale === "en" ? s.noteEn : locale === "zh-Hans" ? s.noteHans : s.noteZh);
  return (
    <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7" data-owner-theme-skins>
      <p className="text-xs tracking-[0.28em] text-cinnabar">THEME SKINS</p>
      <h2 className="mt-1 font-display text-2xl">{tr(locale, "主題皮膚", "主题皮肤", "Theme skins")}</h2>
      <p className="mt-2 text-sm leading-7 text-ink-soft">
        {tr(locale, "套用後，頁面與報告題頭會同步換膚；正文紙面保持清楚。只儲存在這台裝置，不會替其他訪客切換。", "套用后，页面与报告标题区同步换肤；正文纸面保持清晰。只保存在这台设备，不会替其他访客切换。", "Apply to pages and report covers on this device only. Reading paper stays clear; other visitors are unchanged.")}
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
            <Fragment key={s.id}>
              {s.ref === 1 ? <div className="sm:col-span-2 border-t border-line/70 pt-4"><h3 className="font-display text-lg text-ink">{tr(locale, "原有主題 · 十景", "原有主题 · 十景", "Original Ten Skins")}</h3></div> : null}
              {s.ref === 11 ? (
                <div className="sm:col-span-2 border-t border-line/70 pt-5" data-song-quiet-skin-collection>
                  <h3 className="font-display text-lg text-ink">{tr(locale, "宋式留白 · 四景", "宋式留白 · 四景", "Song Whitespace · Four Scenes")}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{tr(locale, "延續宋畫氣韻，減少裝飾、保留呼吸感；四款只使用站內現有畫作。", "延续宋画气韵，减少装饰、保留呼吸感；四款只使用站内现有画作。", "Four calmer interpretations, using existing site paintings and more breathing room.")}</p>
                </div>
              ) : null}
              <article className={`overflow-hidden rounded-xl border bg-paper/40 ${active ? "border-[#315f51] ring-2 ring-[#315f51]/25" : "border-line"}`}>
              <div className="flex h-28 w-full overflow-hidden" role="group" aria-label={name(s)}>
                <div className="relative w-1/2" style={{ background: `${s.swatch[0]} url(${s.hero}) ${s.focus} / cover no-repeat` }} role="img" aria-label={tr(locale, "頁面畫作", "页面画作", "Page painting")}>
                  <span className="absolute left-2 top-2 rounded-sm bg-[#fffaf0]/90 px-2 py-0.5 text-[10px] text-[#254238]">{tr(locale, "頁面", "页面", "Page")}</span>
                </div>
                <div className="relative flex w-1/2 flex-col justify-between border-l border-[#ad9c80]/30 p-2" style={{ background: `linear-gradient(90deg, rgba(250,247,239,.97), rgba(250,247,239,.80)), url(${s.hero}) ${s.focus} / cover no-repeat` }} role="img" aria-label={tr(locale, "報告背景示意", "报告背景示意", "Report colour preview")}>
                  <span className="self-start rounded-sm bg-[#fffaf0]/90 px-2 py-0.5 text-[10px] text-[#254238]">{tr(locale, "報告", "报告", "Report")}</span>
                  <div aria-hidden="true"><span className="block font-serif text-[13px] font-semibold text-[#293c34]">{tr(locale, "命書", "命书", "Reading")}</span><span className="mt-1 block h-px w-9 bg-[#b39770]"/><span className="mt-1 block text-[10px] text-[#4c5d52]">{tr(locale, "宋式閱讀紙", "宋式阅读纸", "Warm paper")}</span></div>
                </div>
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
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
