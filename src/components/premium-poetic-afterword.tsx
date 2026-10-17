import { buildPoeticAfterword, type PoeticTheme } from "@/lib/report/poetic-afterword";
import type { Locale } from "@/lib/i18n";

/**
 * Interpret an already-written report's central message, never chart placements.
 * A matched key phrase is a literary editorial cue, NOT a calculation or evidence.
 * No sufficiently matched theme => no afterword.
 */
const CUES: Record<PoeticTheme, RegExp[]> = {
  patience: [/等待|觀察|观察|積累|积累|耐心|謹慎|谨慎|循序|準備|准备|沉澱|沉淀/i, /\bwait\b|\bpatient\b|\bprepar\w*\b|\bsteady\b|\bgradual\b|\bobserve\b/i],
  resilience: [/韌|韧|承擔|承担|壓力|压力|界線|界限|守住|堅持|坚持|自律/i, /\bresilien\w*\b|\bpressure\b|\bboundar\w*\b|\bresponsib\w*\b|\bpersist\b/i],
  "turning-point": [/轉折|转折|轉型|转型|轉換|转换|困局|阻礙|阻碍|改變方向|改变方向|新選擇|新选择|變化|变化/i, /\btransition\b|\bturning point\b|\breorient\w*\b|\bchange course\b|\bnew option\b/i],
  perspective: [/全局|整體|整体|看清|視角|视角|認知|认知|辨認|辨认|長遠|长远/i, /\bperspective\b|\bclarity\b|\blong.term\b|\bbig picture\b|\bunderstand\b/i],
  "forward-motion": [/行動|行动|推進|推进|突破|主動|主动|前進|前进|實踐|实践/i, /\baction\b|\binitiative\b|\bmove forward\b|\bprogress\b|\bact\b/i],
};

export function matchPoeticTheme(approvedConclusion: string): PoeticTheme | null {
  const summary = approvedConclusion.trim();
  if (summary.length < 12) return null;
  let winner: PoeticTheme | null = null;
  let highest = 0;
  let tie = false;
  for (const theme of Object.keys(CUES) as PoeticTheme[]) {
    const score = CUES[theme].reduce((count, cue) => count + (cue.test(summary) ? 1 : 0), 0);
    if (score > highest) { winner = theme; highest = score; tie = false; }
    else if (score > 0 && score === highest) tie = true;
  }
  return !tie && highest > 0 ? winner : null;
}

export type PremiumPoeticContext = { conclusion: string; action: string };

export function PremiumPoeticAfterword({
  locale, context,
}: { locale: Locale; context: PremiumPoeticContext }) {
  const poem = buildPoeticAfterword({
    locale,
    theme: matchPoeticTheme(context.conclusion),
    finalInterpretation: context.conclusion,
    realWorldAction: context.action,
    editorialApproved: true,
  });
  if (!poem) return null;
  const labels = locale === "en"
    ? { interpretation: "In your reading", action: "Your practical next step", literary: "How the poem speaks to this moment", source: "Original source" }
    : locale === "zh-Hans"
    ? { interpretation: "你的命书判断", action: "现实下一步", literary: "这首诗如何回应你的处境", source: "古籍来源" }
    : { interpretation: "你的命書判斷", action: "現實下一步", literary: "這首詩如何呼應你的處境", source: "古籍來源" };

  return (
    <aside data-premium-poetic-afterword="true" className="seal-border mx-auto mt-10 max-w-3xl overflow-hidden rounded-lg border border-cinnabar/20 bg-cream p-5 text-ink sm:p-10">
      <p className="text-xs tracking-[0.18em] text-cinnabar">ZHAOWU · LITERARY AFTERWORD</p>
      <h2 className="mt-2 font-display text-2xl sm:text-3xl">{poem.heading}</h2>
      <div className="mx-auto my-8 max-w-2xl text-center">
        <blockquote className="font-display text-[clamp(1.4rem,5vw,2.1rem)] leading-[1.9] text-ink">{poem.quote}</blockquote>
        {locale === "en" ? <p className="mt-3 text-lg leading-8 text-ink-soft" lang="zh-Hant">{poem.originalChinese}</p> : null}
        <p className="mt-3 text-xs tracking-[0.12em] text-ink-soft">{poem.attribution}</p>
      </div>
      <div className="mx-auto max-w-2xl space-y-4 border-t border-line pt-5 text-[15px] leading-7">
        <section><h3 className="font-semibold text-ink">{labels.literary}</h3><p className="mt-1 text-ink-soft">{poem.connection}</p></section>
        <section><h3 className="font-semibold text-ink">{labels.interpretation}</h3><p className="mt-1 text-ink-soft">{poem.finalInterpretation}</p></section>
        <section><h3 className="font-semibold text-ink">{labels.action}</h3><p className="mt-1 text-ink-soft">{poem.realWorldAction}</p></section>
        <p className="text-xs leading-6 text-ink-mute">{poem.evidenceBoundary}</p>
        <a href={poem.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block min-h-11 py-2 text-sm text-cinnabar underline underline-offset-4">{labels.source} · {poem.sourceLocator}</a>
      </div>
    </aside>
  );
}
