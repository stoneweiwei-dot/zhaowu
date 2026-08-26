import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { AnalysisResult } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { matchTeaGuardians, quizComplete, readTeaQuizAnswers, type TeaQuizAnswers } from "@/lib/tea/guardian";

const COPY = {
  "zh-Hant": {
    kicker: "昭梧 · 茶仙守護",
    title: "你的命理守護茶",
    lead: "以命盤現有喜用資訊做文化象徵匹配；完成 8 題口味測驗後，再把真正喝茶偏好加入結果。",
    score: "綜合契合",
    destiny: "命理象徵",
    taste: "口味",
    alternatives: "另外兩款也很合",
    quiz: "做 8 題茶仙測驗",
    refine: "重新做測驗",
    provisional: "目前命局的喜用判定仍屬暫定，因此茶仙結果也以參考排序呈現。",
    disclaimer: "茶仙與五行配對屬文化／品味體驗，不是醫療、營養或治療建議。",
  },
  "zh-Hans": {
    kicker: "昭梧 · 茶仙守护",
    title: "你的命理守护茶",
    lead: "以命盘现有喜用信息做文化象征匹配；完成 8 题口味测验后，再把真正喝茶偏好加入结果。",
    score: "综合契合",
    destiny: "命理象征",
    taste: "口味",
    alternatives: "另外两款也很合",
    quiz: "做 8 题茶仙测验",
    refine: "重新做测验",
    provisional: "目前命局的喜用判定仍属暂定，因此茶仙结果也以参考排序呈现。",
    disclaimer: "茶仙与五行配对属于文化／品味体验，不是医疗、营养或治疗建议。",
  },
  en: {
    kicker: "ZHAOWU · TEA GUARDIAN",
    title: "Your symbolic guardian tea",
    lead: "Uses the chart's existing favourable-element output as a cultural matching layer. The 8-question taste quiz adds what you actually enjoy drinking.",
    score: "Overall fit",
    destiny: "Chart symbolism",
    taste: "Taste",
    alternatives: "Two close alternatives",
    quiz: "Take the 8-question tea quiz",
    refine: "Retake quiz",
    provisional: "The chart's favourable-element reading is currently provisional, so this guardian ranking is also presented as a reference rather than a hard conclusion.",
    disclaimer: "Tea-guardian and Five-Element matching is a cultural and taste experience, not medical, nutritional or treatment advice.",
  },
} as const;

export function TeaGuardianPanel({ result, useStoredTaste = true, compact = false }: { result: AnalysisResult; useStoredTaste?: boolean; compact?: boolean }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [answers, setAnswers] = useState<TeaQuizAnswers>({});

  useEffect(() => {
    setAnswers(useStoredTaste ? readTeaQuizAnswers() : {});
  }, [useStoredTaste]);

  const hasQuiz = useStoredTaste && quizComplete(answers);
  const matches = useMemo(() => matchTeaGuardians({ chart: result.chart, answers: hasQuiz ? answers : null, locale, limit: 3 }), [answers, hasQuiz, locale, result.chart]);
  const primary = matches[0];
  if (!primary) return null;

  return (
    <section className={`seal-border overflow-hidden rounded-[1.4rem] bg-cream/95 ${compact ? "mt-4" : "mt-5"}`} aria-labelledby={`tea-guardian-${result.id}`}>
      <div className="grid gap-0 sm:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="relative bg-paper-deep/60">
          <img src={primary.tea.image} alt={primary.tea.guardian[locale]} loading="lazy" className="aspect-[9/16] h-full max-h-[34rem] w-full object-cover object-top" onError={(event) => { event.currentTarget.hidden = true; }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#2a1e12]/65 to-transparent" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 p-4 text-[#fff9ed]">
            <p className="text-[10px] tracking-[0.22em] text-[#ead3a8]">{copy.kicker}</p>
            <p className="mt-1 font-display text-xl">{primary.tea.guardian[locale]}</p>
            <p className="mt-0.5 text-xs text-[#fff9ed]/80">{primary.tea.tea[locale]} · {primary.tea.origin[locale]}</p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-cinnabar">{copy.kicker}</p>
          <h3 id={`tea-guardian-${result.id}`} className="mt-2 font-display text-2xl text-ink">{copy.title}</h3>
          {!compact ? <p className="mt-2 text-sm leading-7 text-ink-soft">{copy.lead}</p> : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-earth/25 bg-paper px-3 py-1 text-xs text-ink-soft">{copy.score} {primary.score}%</span>
            {primary.destinyScore !== null ? <span className="rounded-full border border-line bg-cream px-3 py-1 text-xs text-ink-soft">{copy.destiny} {primary.destinyScore}%</span> : null}
            {primary.tasteScore !== null ? <span className="rounded-full border border-line bg-cream px-3 py-1 text-xs text-ink-soft">{copy.taste} {primary.tasteScore}%</span> : null}
          </div>

          <p className="mt-4 text-sm leading-7 text-ink-soft">{primary.reason}</p>
          <p className="mt-2 text-sm leading-7 text-ink">{primary.tea.note[locale]}</p>

          {matches.length > 1 ? (
            <div className="mt-5 border-t border-line/70 pt-4">
              <p className="text-xs font-medium tracking-[0.08em] text-ink-mute">{copy.alternatives}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {matches.slice(1).map((match) => (
                  <div key={match.tea.id} className="rounded-xl border border-line bg-paper/55 p-2.5">
                    <img src={match.tea.image} alt="" aria-hidden loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover object-top" onError={(event) => { event.currentTarget.hidden = true; }} />
                    <p className="mt-2 font-display text-sm text-ink">{match.tea.tea[locale]}</p>
                    <p className="text-[11px] text-ink-mute">{match.tea.guardian[locale]} · {match.score}%</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result.chart.usefulProvisional ? <p className="mt-4 text-xs leading-6 text-cinnabar/85">{copy.provisional}</p> : null}
          <Link to="/tea-guardian" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-wood px-5 text-sm font-medium text-cream">
            {hasQuiz ? copy.refine : copy.quiz}
          </Link>
          {!compact ? <p className="mt-3 text-[11px] leading-5 text-ink-mute">{copy.disclaimer}</p> : null}
        </div>
      </div>
    </section>
  );
}
