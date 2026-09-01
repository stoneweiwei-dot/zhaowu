import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { SIX_REALM_QUESTIONS, SIX_REALM_RESULTS, scoreSixRealmAnswers, type SixRealmKey } from "@/lib/fun-tests/six-realms";

export const Route = createFileRoute("/quiz/six-realms")({ component: SixRealmsQuiz });

const UI = {
  "zh-Hant": {
    kicker: "趣味測驗 · SERIES 03",
    title: "六道習氣測驗",
    subtitle: "你從哪道來，看身上即知",
    lead: "用 6 個日常直覺情境，看你現在最常出現的習氣方向。憑第一直覺選最接近自己的答案，不必想太久。",
    boundary: "這個測驗不是在斷定『你前世就是哪一道』，也不替代昭梧的達摩一掌經排盤。它只用日常選擇觀察你目前最明顯的習氣方向，重點是觀自身、斷惡習。",
    question: "題",
    next: "下一題",
    result: "查看結果",
    mixed: "習氣混合",
    score: "本次計分",
    watch: "需留意的習氣",
    practice: "觀自身重點",
    reminder: "這個測驗不是在給你貼標籤，更不是在說『你前世就是某一道』。它只是一面鏡子，讓你看見自己日常最常出現的習氣方向。真正重要的是：看見之後，開始調整習慣與行為。",
    restart: "重新測驗",
    formal: "查看我的正式一掌經六道",
    formalNote: "正式排盤需要出生資料，且不會讀取這次趣味測驗結果。",
    home: "返回首頁",
  },
  "zh-Hans": {
    kicker: "趣味测验 · SERIES 03",
    title: "六道习气测验",
    subtitle: "你从哪道来，看身上即知",
    lead: "用 6 个日常直觉情境，看你现在最常出现的习气方向。凭第一直觉选最接近自己的答案，不必想太久。",
    boundary: "这个测验不是在断定『你前世就是哪一道』，也不替代昭梧的达摩一掌经排盘。它只用日常选择观察你目前最明显的习气方向，重点是观自身、断恶习。",
    question: "题",
    next: "下一题",
    result: "查看结果",
    mixed: "习气混合",
    score: "本次计分",
    watch: "需留意的习气",
    practice: "观自身重点",
    reminder: "这个测验不是在给你贴标签，更不是在说『你前世就是某一道』。它只是一面镜子，让你看见自己日常最常出现的习气方向。真正重要的是：看见之后，开始调整习惯与行为。",
    restart: "重新测验",
    formal: "查看我的正式一掌经六道",
    formalNote: "正式排盘需要出生资料，且不会读取这次趣味测验结果。",
    home: "返回首页",
  },
  en: {
    kicker: "FUN TEST · SERIES 03",
    title: "Six Realms Habit Test",
    subtitle: "A mirror for the habits showing up most strongly now",
    lead: "Six everyday situations highlight the behavioural pattern you are leaning on most right now. Choose the closest answer by instinct rather than overthinking it.",
    boundary: "This test does not claim to identify a past-life realm and it does not replace Zhaowu's Dharma Palm calculation. It only uses everyday choices as a self-reflection tool for current habits.",
    question: "Question",
    next: "Next question",
    result: "See result",
    mixed: "Mixed pattern",
    score: "Score",
    watch: "Watch for",
    practice: "Practice",
    reminder: "This test is not a label and it is not a claim about where you came from in a past life. It is only a mirror for the habits that appear most often now. What matters is what you choose to change after noticing them.",
    restart: "Retake test",
    formal: "View my formal Dharma Palm reading",
    formalNote: "The formal reading needs birth details and does not use this quiz result.",
    home: "Back to home",
  },
} as const;

function SixRealmsQuiz() {
  const { locale } = useI18n();
  const copy = UI[locale];
  const questions = SIX_REALM_QUESTIONS[locale];
  const results = SIX_REALM_RESULTS[locale];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<SixRealmKey[]>([]);
  const [selected, setSelected] = useState<SixRealmKey | null>(null);
  const [done, setDone] = useState(false);
  const score = useMemo(() => scoreSixRealmAnswers(answers), [answers]);

  function reset() {
    setIndex(0);
    setAnswers([]);
    setSelected(null);
    setDone(false);
  }

  function advance() {
    if (!selected) return;
    const next = [...answers, selected];
    setAnswers(next);
    setSelected(null);
    if (index === questions.length - 1) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
  }

  const finalScore = done ? scoreSixRealmAnswers(answers) : score;

  return (
    <main className="mx-auto max-w-3xl space-y-5 pb-16">
      <header className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
        <p className="text-xs tracking-[0.24em] text-cinnabar">ZHAOWU · {copy.kicker}</p>
        <h1 className="mt-2 font-display text-3xl text-ink">{copy.title}</h1>
        <p className="mt-1 font-display text-lg text-ink-soft">{copy.subtitle}</p>
        <p className="mt-4 text-[15px] leading-7 text-ink-soft">{copy.lead}</p>
        <p className="mt-4 rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-6 text-ink-soft">{copy.boundary}</p>
      </header>

      {!done ? (
        <section className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
          <div className="flex items-center justify-between gap-4 text-xs text-ink-mute">
            <span>{copy.question} {index + 1}</span><span>{index + 1} / {questions.length}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-deep">
            <div className="h-full bg-cinnabar transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
          </div>
          <h2 className="mt-6 font-display text-2xl leading-9 text-ink">{questions[index].title}</h2>
          <div className="mt-5 grid gap-3">
            {questions[index].answers.map((answer) => {
              const active = selected === answer.key;
              return (
                <button
                  key={answer.key}
                  type="button"
                  onClick={() => setSelected(answer.key)}
                  aria-pressed={active}
                  className={`min-h-14 w-full rounded-xl border px-4 py-4 text-left text-[15px] leading-6 transition ${active ? "border-cinnabar bg-cream text-ink shadow-sm" : "border-line bg-paper text-ink hover:border-cinnabar/50"}`}
                >
                  <b className="mr-3 text-cinnabar">{answer.key}</b>{answer.label}
                </button>
              );
            })}
          </div>
          <button type="button" disabled={!selected} onClick={advance} className="mt-5 min-h-12 w-full rounded-full bg-cinnabar px-5 py-3 text-sm text-cream disabled:cursor-not-allowed disabled:opacity-35">
            {index === questions.length - 1 ? copy.result : copy.next}
          </button>
        </section>
      ) : (
        <section className="space-y-4">
          <article className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
            <p className="text-xs tracking-[0.24em] text-cinnabar">{finalScore.tied ? copy.mixed : copy.title}</p>
            <div className="mt-4 grid gap-4">
              {finalScore.winners.map((key) => {
                const result = results[key];
                return (
                  <div key={key} className="rounded-xl border border-line bg-paper p-4 sm:p-5">
                    <h2 className="font-display text-2xl text-ink">{key} · {result.name}</h2>
                    <p className="mt-3 text-sm leading-7 text-ink-soft">{result.summary}</p>
                    <p className="mt-4 text-sm leading-7 text-ink-soft"><b className="text-ink">{copy.watch}：</b>{result.watch}</p>
                    <p className="mt-2 text-sm leading-7 text-ink-soft"><b className="text-ink">{copy.practice}：</b>{result.practice}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-sm text-ink-soft"><b className="text-ink">{copy.score}：</b>{(["A", "B", "C", "D", "E", "F"] as SixRealmKey[]).map((key) => `${key} ${finalScore.counts[key]}`).join(" · ")}</p>
          </article>

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
            <p className="text-sm leading-7 text-ink-soft">{copy.reminder}</p>
          </article>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={reset} className="min-h-12 rounded-full border border-line bg-cream px-5 py-3 text-sm text-ink">{copy.restart}</button>
            <Link to="/" className="grid min-h-12 place-items-center rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">{copy.formal}</Link>
          </div>
          <p className="text-center text-xs leading-6 text-ink-mute">{copy.formalNote}</p>
        </section>
      )}

      <div className="text-center"><Link to="/" className="text-sm text-cinnabar">← {copy.home}</Link></div>
    </main>
  );
}
