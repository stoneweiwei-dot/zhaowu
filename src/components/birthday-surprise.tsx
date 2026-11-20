import { useEffect, useMemo, useState } from "react";
import type { AnalysisResult, AppLocale } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { readSharedBirthRecord } from "@/lib/shared-birth";
import { birthdayIntroKey, birthdayIntroMode, birthdayLetter, birthdayState, birthdayYear, buildBirthdayShareModel } from "@/lib/report/birthday-surprise";
import { renderBirthdayShareCardPng } from "@/lib/report/share-card";

const UI = {
  "zh-Hant": { countdown: (n: number) => `還有 ${n} 天就是你的生日`, preview: "預覽生日流年", previewTitle: "生日流年預覽", previewBody: "這是供你提前整理心念的佔位預覽；完整流年內容仍依既有報告權限提供。", intro: "一封生日箋，正為你展開", skip: "略過", title: "給今日生日的你", share: "製作生日快樂分享卡", making: "正在製作…", save: "下載生日分享卡", motion: "花瓣與金箔緩緩落下" },
  "zh-Hans": { countdown: (n: number) => `还有 ${n} 天就是你的生日`, preview: "预览生日流年", previewTitle: "生日流年预览", previewBody: "这是供你提前整理心念的占位预览；完整流年内容仍依既有报告权限提供。", intro: "一封生日笺，正为你展开", skip: "略过", title: "写给今天生日的你", share: "制作生日快乐分享卡", making: "正在制作…", save: "下载生日分享卡", motion: "花瓣与金箔缓缓落下" },
  en: { countdown: (n: number) => `${n} days until your birthday`, preview: "Preview your birthday year", previewTitle: "Birthday year preview", previewBody: "A placeholder to help you reflect ahead of time. Full annual reading remains subject to existing report access.", intro: "A birthday letter is opening for you", skip: "Skip", title: "For your birthday today", share: "Create Happy Birthday card", making: "Creating…", save: "Download birthday card", motion: "Petals and gold leaf drift down" },
} satisfies Record<AppLocale, { countdown: (n: number) => string; preview: string; previewTitle: string; previewBody: string; intro: string; skip: string; title: string; share: string; making: string; save: string; motion: string }>;

function birthdayLocale(locale: string): AppLocale { return locale === "en" || locale === "zh-Hans" ? locale : "zh-Hant"; }

export function BirthdaySurprise({ result }: { result: AnalysisResult }) {
  const { locale } = useI18n();
  const lang = birthdayLocale(locale);
  const ui = UI[lang];
  const [state, setState] = useState<ReturnType<typeof birthdayState> | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [cardBusy, setCardBusy] = useState(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const letter = useMemo(() => birthdayLetter(result.chart.dayMaster, lang), [result.chart.dayMaster, lang]);

  useEffect(() => {
    const birth = readSharedBirthRecord();
    if (!birth) { setState({ kind: "hidden" }); return; }
    const zone = birth.city.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const next = birthdayState(birth.month, birth.day, new Date(), zone);
    setState(next);
    if (next.kind !== "today") { setShowIntro(false); return; }
    const key = birthdayIntroKey(birth.month, birth.day, birthdayYear(new Date(), zone));
    let played = false;
    try { played = window.localStorage.getItem(key) === "played"; } catch { /* storage unavailable: remain usable */ }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShowIntro(birthdayIntroMode(reduced, played) === "intro");
  }, [result.id]);

  useEffect(() => () => { if (cardUrl) URL.revokeObjectURL(cardUrl); }, [cardUrl]);

  if (!state || state.kind === "hidden" || !letter) return null;
  if (state.kind === "countdown") return <section className="birthday-surprise birthday-countdown" data-birthday-state="countdown">
    <p className="birthday-countdown-label">{ui.countdown(state.days)}</p>
    <a href="#birthday-year-preview">{ui.preview} ↓</a>
    <div id="birthday-year-preview" className="birthday-year-preview"><h3>{ui.previewTitle} <span>{lang === "en" ? "Placeholder" : lang === "zh-Hans" ? "占位稿" : "佔位稿"}</span></h3><p>{ui.previewBody}</p></div>
  </section>;

  const finishIntro = () => {
    setShowIntro(false);
    const birth = readSharedBirthRecord();
    if (birth) try { window.localStorage.setItem(birthdayIntroKey(birth.month, birth.day, birthdayYear(new Date(), birth.city.timezone)), "played"); } catch { /* local-only preference is best effort */ }
  };
  async function makeCard() {
    setCardBusy(true); setError(false);
    try {
      const model = buildBirthdayShareModel(result.chart.dayMaster, lang, letter);
      if (!model) throw new Error("Unsupported day master");
      const blob = await renderBirthdayShareCardPng(model);
      setCardUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
    } catch { setError(true); } finally { setCardBusy(false); }
  }

  return <section className="birthday-surprise birthday-letter" data-birthday-state="today" data-day-master={result.chart.dayMaster}>
    {showIntro ? <div className="birthday-opening" role="dialog" aria-label={ui.intro} onAnimationEnd={finishIntro}>
      <div className="birthday-envelope" aria-hidden="true"><div className="birthday-letter-sheet">✦</div></div>
      <p>{ui.intro}</p><span className="birthday-petals" aria-label={ui.motion}>✿　✦　✿</span>
      <button type="button" onClick={finishIntro}>{ui.skip}</button>
    </div> : null}
    <p className="birthday-letter-kicker">{ui.title}</p>
    <h2>{letter.title}</h2>
    <p className="birthday-placeholder">{letter.marker} · PLACEHOLDER</p>
    <p className="birthday-letter-body">{letter.body}</p>
    <p className="birthday-signature">{letter.signature}</p>
    <button className="birthday-share-button" type="button" onClick={() => cardUrl ? (() => { const a = document.createElement("a"); a.href = cardUrl; a.download = lang === "en" ? "zhaowu-birthday.png" : "昭梧-生日快樂.png"; a.click(); })() : void makeCard()} disabled={cardBusy}>{cardBusy ? ui.making : cardUrl ? ui.save : ui.share}</button>
    {error ? <p role="status">{lang === "en" ? "The card could not be created." : lang === "zh-Hans" ? "分享卡暂时无法制作。" : "分享卡暫時無法製作。"}</p> : null}
    {cardUrl ? <img className="birthday-card-preview" src={cardUrl} alt={lang === "en" ? "Happy Birthday share card" : lang === "zh-Hans" ? "生日快乐分享卡" : "生日快樂分享卡"} /> : null}
  </section>;
}
