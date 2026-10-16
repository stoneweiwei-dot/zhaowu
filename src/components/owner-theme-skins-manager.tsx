import { Fragment, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { SKINS, useSkin } from "@/lib/theme-skins";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

type ThemePreview = { src: string; alt: string };

/** Owner theme catalog uses isolated screenshots of the actual homepage. */
export function OwnerThemeSkinsManager({ locale }: { locale: Locale }) {
  const { id, apply } = useSkin();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<ThemePreview | null>(null);

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
  const name = (s: (typeof SKINS)[number]) => (locale === "en" ? s.en : locale === "zh-Hans" ? s.hans : s.zh);
  const note = (s: (typeof SKINS)[number]) => (locale === "en" ? s.noteEn : locale === "zh-Hans" ? s.noteHans : s.noteZh);
  return (
    <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7" data-owner-theme-skins>
      <p className="text-xs tracking-[0.28em] text-cinnabar">THEME SKINS</p>
      <h2 className="mt-1 font-display text-2xl">{tr(locale, "主題皮膚", "主题皮肤", "Theme skins")}</h2>
      <p className="mt-2 text-sm leading-7 text-ink-soft">
        {tr(locale, "在這裡選擇一款，所有訪客就會使用同款主題與報告背景；切換免部署。已開啟的頁面約一分鐘內同步。", "在这里选择一款，所有访客就会使用同款主题与报告背景；切换无需部署。已打开的页面约一分钟内同步。", "Choose once for every visitor. Pages and report covers update without redeploying; open tabs sync within about a minute.")}
      </p>
      {error ? <p role="alert" className="mt-3 text-sm text-cinnabar">{error}</p> : null}
      {success ? <p role="status" className="mt-3 text-sm text-wood">{success}</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <article className={`overflow-hidden rounded-xl border ${id === "" ? "border-[#315f51] ring-2 ring-[#315f51]/25" : "border-line"} bg-paper/40`}>
          <button type="button" onClick={() => setPreview({ src: "/theme-previews/none.jpg", alt: tr(locale, "預設首頁實際排版", "默认首页实际排版", "Default homepage layout") })} aria-label={tr(locale, "放大預設首頁預覽", "放大默认首页预览", "Enlarge default homepage preview")} className="block w-full p-3 text-left"><img src="/theme-previews/none.jpg" alt={tr(locale, "預設首頁實際排版", "默认首页实际排版", "Default homepage layout")} loading="lazy" width="390" height="844" className="mx-auto h-80 w-auto max-w-full object-contain object-top" /></button>
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0"><p className="truncate font-medium">{tr(locale, "預設（現行）", "默认（现行）", "Default (current)")}</p></div>
            <button type="button" disabled={saving} onClick={() => void choose("none")} aria-pressed={id === ""} className="min-h-11 shrink-0 whitespace-nowrap rounded-full border border-line px-4 text-sm disabled:opacity-50">{saving ? tr(locale, "同步中…", "同步中…", "Saving…") : id === "" ? tr(locale, "全站使用中", "全站使用中", "Live site theme") : tr(locale, "全站還原", "全站还原", "Reset site")}</button>
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
              {s.ref === 15 ? (
                <div className="sm:col-span-2 border-t border-line/70 pt-5" data-qingmu-skin-collection>
                  <h3 className="font-display text-lg text-ink">{tr(locale, "青木 · 生生不息", "青木 · 生生不息", "Verdant Wood · Endless Growth")}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{tr(locale, "東方甲乙木：葉化青龍、煙嵐青峰、春雨柳亭、夜雨竹林；整站換裝。", "东方甲乙木：叶化青龙、烟岚青峰、春雨柳亭、夜雨竹林；整站换装。", "Eastern green-wood: leaf dragon, misty peaks, spring-rain willow, night bamboo rain — a full-site set.")}</p>
                </div>
              ) : null}
              {s.ref === 19 ? (
                <div className="sm:col-span-2 border-t border-line/70 pt-5" data-private-art-skin-collection>
                  <h3 className="font-display text-lg text-ink">{tr(locale, "畫中六景 · 私藏畫作", "画中六景 · 私藏画作", "Six Painted Scenes · Private Art")}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{tr(locale, "取自圖庫私人上傳的無字完整畫作：曉日雲龍、月下荷舟、竹瀑漁舟、荷舟仙羽、粉蓮雲溪、蝶戀荷塘；首頁與全站同步換裝。", "取自图库私人上传的无字完整画作：晓日云龙、月下荷舟、竹瀑渔舟、荷舟仙羽、粉莲云溪、蝶恋荷塘；首页与全站同步换装。", "Text-free paintings from the private uploads; the homepage and every page change together.")}</p>
                </div>
              ) : null}
              <article className={`overflow-hidden rounded-xl border bg-paper/40 ${active ? "border-[#315f51] ring-2 ring-[#315f51]/25" : "border-line"}`}>
              <button type="button" onClick={() => setPreview({ src: `/theme-previews/${s.id}.jpg`, alt: `${name(s)} · ${tr(locale, "實際首頁排版", "实际首页排版", "Actual homepage layout")}` })} className="block w-full bg-paper/40 p-3 text-left" aria-label={`${name(s)} · ${tr(locale, "查看完整首頁", "查看完整首页", "View full homepage")}`}>
                <img src={`/theme-previews/${s.id}.jpg`} alt={`${name(s)} · ${tr(locale, "實際首頁排版", "实际首页排版", "Actual homepage layout")}`} loading="lazy" width="390" height="844" className="mx-auto h-80 w-auto max-w-full object-contain object-top" />
                <span className="mt-2 block text-center text-xs text-ink-soft">{tr(locale, "實際首頁 · 點擊放大", "实际首页 · 点击放大", "Rendered homepage · Enlarge")}</span>
              </button>
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{name(s)}</p>
                  <p className="truncate text-xs text-ink-mute">{note(s)}</p>
                  <div className="mt-1.5 flex gap-1" aria-hidden="true">{s.swatch.map((c) => <i key={c} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: c }} />)}</div>
                </div>
                <button type="button" disabled={saving} onClick={() => void choose(s.id)} aria-pressed={active} className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-sm disabled:opacity-50 ${active ? "bg-[#315f51] text-[#fffaf0]" : "border border-[#315f51] text-[#315f51]"}`}>{saving ? tr(locale, "同步中…", "同步中…", "Saving…") : active ? tr(locale, "全站使用中", "全站使用中", "Live site theme") : tr(locale, "全站套用", "全站套用", "Publish")}</button>
              </div>
              </article>
            </Fragment>
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
