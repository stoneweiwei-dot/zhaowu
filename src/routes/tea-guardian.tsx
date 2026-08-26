import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { TeaGuardianImage } from "@/components/tea-guardian-image";
import {
  matchTeaGuardians,
  quizComplete,
  readTeaQuizAnswers,
  saveTeaQuizAnswers,
  TEA_QUIZ,
  type TeaQuizAnswers,
} from "@/lib/tea/guardian";

export const Route = createFileRoute("/tea-guardian")({ component: TeaGuardianQuizPage });

const COPY = {
  "zh-Hant": {
    kicker: "昭梧 · 茶仙守護測驗",
    title: "找到你的本命茶仙",
    leadWithChart: "你的命盤已帶入。本測驗只補足口味偏好，完成後以「命理象徵 62%＋口味 38%」給出綜合茶仙。",
    leadNoChart: "目前沒有本次命盤資料，先做口味版；回首頁完成八字分析後，會再加入命理象徵匹配。",
    progress: "已完成",
    calculate: "看我的茶仙",
    incomplete: "還有題目沒有作答。",
    result: "你的綜合本命茶仙",
    tasteResult: "你的口味茶仙",
    score: "契合",
    destiny: "命理象徵",
    taste: "口味",
    more: "次選茶仙",
    restart: "重新作答",
    back: "回到昭梧分析",
    chartOnly: "先完成八字分析，取得命理合參",
    disclaimer: "這是以傳統五行象徵與飲茶偏好做的文化體驗，不等同醫療、體質診斷或營養建議。",
  },
  "zh-Hans": {
    kicker: "昭梧 · 茶仙守护测验",
    title: "找到你的本命茶仙",
    leadWithChart: "你的命盘已带入。本测验只补足口味偏好，完成后以“命理象征 62%＋口味 38%”给出综合茶仙。",
    leadNoChart: "目前没有本次命盘资料，先做口味版；回首页完成八字分析后，会再加入命理象征匹配。",
    progress: "已完成",
    calculate: "看我的茶仙",
    incomplete: "还有题目没有作答。",
    result: "你的综合本命茶仙",
    tasteResult: "你的口味茶仙",
    score: "契合",
    destiny: "命理象征",
    taste: "口味",
    more: "次选茶仙",
    restart: "重新作答",
    back: "回到昭梧分析",
    chartOnly: "先完成八字分析，取得命理合参",
    disclaimer: "这是以传统五行象征与饮茶偏好做的文化体验，不等同医疗、体质诊断或营养建议。",
  },
  en: {
    kicker: "ZHAOWU · TEA GUARDIAN QUIZ",
    title: "Find your guardian tea",
    leadWithChart: "Your current chart is included. The quiz adds your real taste preference, then combines chart symbolism (62%) with taste (38%).",
    leadNoChart: "There is no current chart in this browser session, so this will be a taste-only result. Complete a Bazi analysis on the home page to add the symbolic chart layer.",
    progress: "Answered",
    calculate: "Reveal my tea guardian",
    incomplete: "Please answer every question first.",
    result: "Your combined tea guardian",
    tasteResult: "Your taste guardian",
    score: "Fit",
    destiny: "Chart symbolism",
    taste: "Taste",
    more: "Close alternatives",
    restart: "Retake",
    back: "Back to Zhaowu analysis",
    chartOnly: "Run a Bazi analysis for the chart layer",
    disclaimer: "This is a cultural experience combining Five-Element symbolism with tea preferences. It is not medical, constitutional or nutritional advice.",
  },
} as const;

function TeaGuardianQuizPage() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const result = useAppStore((state) => state.current);
  const [answers, setAnswers] = useState<TeaQuizAnswers>(() => readTeaQuizAnswers());
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const answered = Object.keys(answers).filter((key) => answers[key]).length;
  const complete = quizComplete(answers);
  const matches = useMemo(() => submitted && complete ? matchTeaGuardians({ chart: result?.chart ?? null, answers, locale, limit: 3 }) : [], [answers, complete, locale, result?.chart, submitted]);
  const primary = matches[0];

  function choose(questionId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setSubmitted(false);
    setMessage(null);
  }

  function submit() {
    if (!complete) {
      setMessage(copy.incomplete);
      return;
    }
    saveTeaQuizAnswers(answers);
    setSubmitted(true);
    setMessage(null);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 pb-12 sm:px-6">
      <section className="seal-border rounded-[1.5rem] bg-cream/95 p-5 sm:p-8">
        <p className="text-[10px] font-semibold tracking-[0.26em] text-cinnabar">{copy.kicker}</p>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">{result ? copy.leadWithChart : copy.leadNoChart}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-deep" aria-hidden>
          <div className="h-full rounded-full bg-wood transition-[width]" style={{ width: `${Math.min(100, answered / TEA_QUIZ.length * 100)}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink-mute">{copy.progress} {answered}/{TEA_QUIZ.length}</p>
      </section>

      <section className="space-y-4" aria-label={copy.title}>
        {TEA_QUIZ.map((question, index) => (
          <article key={question.id} className="seal-border rounded-xl bg-cream/95 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-earth/25 bg-paper font-display text-sm text-earth">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg leading-7 text-ink">{question.question[locale]}</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.id;
                    return (
                      <button key={option.id} type="button" aria-pressed={selected} onClick={() => choose(question.id, option.id)} className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm leading-6 transition ${selected ? "border-wood bg-wood text-cream shadow-sm" : "border-line bg-paper/60 text-ink-soft hover:border-earth/45"}`}>
                        {option.label[locale]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="seal-border rounded-xl bg-cream/95 p-4 sm:p-5">
        <button type="button" onClick={submit} className="min-h-12 w-full rounded-full bg-cinnabar px-6 font-medium text-cream">{copy.calculate}</button>
        {message ? <p className="mt-3 text-center text-sm text-cinnabar">{message}</p> : null}
      </section>

      {primary ? (
        <section className="seal-border overflow-hidden rounded-[1.5rem] bg-cream/95" aria-live="polite">
          <div className="grid sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <TeaGuardianImage teaId={primary.tea.id} fallback={primary.tea.image} alt={primary.tea.guardian[locale]} className="aspect-[9/16] h-full max-h-[38rem] w-full object-cover object-top" />
            <div className="p-5 sm:p-7">
              <p className="text-[10px] tracking-[0.24em] text-cinnabar">{result ? copy.result : copy.tasteResult}</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{primary.tea.guardian[locale]}</h2>
              <p className="mt-1 text-sm text-earth">{primary.tea.tea[locale]} · {primary.tea.origin[locale]}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-earth/25 bg-paper px-3 py-1 text-xs">{copy.score} {primary.score}%</span>
                {primary.destinyScore !== null ? <span className="rounded-full border border-line px-3 py-1 text-xs">{copy.destiny} {primary.destinyScore}%</span> : null}
                {primary.tasteScore !== null ? <span className="rounded-full border border-line px-3 py-1 text-xs">{copy.taste} {primary.tasteScore}%</span> : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-ink-soft">{primary.reason}</p>
              <p className="mt-2 text-sm leading-7 text-ink">{primary.tea.note[locale]}</p>

              <div className="mt-5 border-t border-line pt-4">
                <p className="text-xs font-medium tracking-[0.08em] text-ink-mute">{copy.more}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {matches.slice(1).map((match) => (
                    <div key={match.tea.id} className="rounded-xl border border-line bg-paper/55 p-2.5">
                      <TeaGuardianImage teaId={match.tea.id} fallback={match.tea.image} alt={match.tea.guardian[locale]} className="aspect-[4/3] w-full rounded-lg object-cover object-top" />
                      <p className="mt-2 font-display text-sm text-ink">{match.tea.tea[locale]}</p>
                      <p className="text-[11px] text-ink-mute">{match.score}%</p>
                    </div>
                  ))}
                </div>
              </div>

              <button type="button" onClick={() => { setAnswers({}); saveTeaQuizAnswers({}); setSubmitted(false); }} className="mt-5 min-h-11 w-full rounded-full border border-line bg-paper px-5 text-sm text-ink-soft">{copy.restart}</button>
              {!result ? <Link to="/" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-wood px-5 text-sm text-cream">{copy.chartOnly}</Link> : null}
              <p className="mt-4 text-[11px] leading-5 text-ink-mute">{copy.disclaimer}</p>
            </div>
          </div>
        </section>
      ) : null}

      <Link to="/" className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-5 text-sm text-ink-soft">← {copy.back}</Link>
    </main>
  );
}
