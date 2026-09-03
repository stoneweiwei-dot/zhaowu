import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { SIX_REALM_QUESTIONS, SIX_REALM_RESULTS, scoreSixRealmAnswers, type SixRealmKey } from "@/lib/fun-tests/six-realms";

export const Route = createFileRoute("/quiz/six-realms")({ component: SixRealmsQuiz });

const UI = {
  "zh-Hant": {
    kicker: "趣味測驗 · SERIES 03",
    title: "六道習氣測驗",
    subtitle: "你今天正在經歷哪一道？",
    lead: "每一天、甚至每一瞬間，都可能在六種心境之間輪轉。用 6 個日常情境，看你此刻較常落入的主導心境與次要心境。憑第一直覺選最接近自己的答案，不必想太久。",
    boundary: "這裡把六道作為日常意識與情緒的觀察框架：天道是喜悅與執著，阿修羅道是瞋恨與好勝，人道是忙碌與理性，畜生道是愚痴與本能，餓鬼道是貪婪與匱乏，地獄道是極怒與煎熬。不是在斷定死後去處或前世身分，也不替代昭梧的正式一掌經排盤。",
    question: "題",
    next: "下一題",
    result: "查看結果",
    mixed: "主導心境並列",
    primary: "主導心境",
    secondary: "次要心境",
    score: "本次計分",
    watch: "容易卡住的地方",
    practice: "轉念方向",
    reminder: "外在境遇未必由人，但面對境遇時的心念可以被覺察與調整。這個測驗要看的不是『你是哪一道』，而是『此刻哪種心念最常接管你』；看見它，就是從無意識輪轉回到主動選擇的第一步。",
    restart: "重新測驗",
    formal: "查看我的正式一掌經六道",
    formalNote: "正式排盤需要出生資料，且不會讀取這次趣味測驗結果。",
    home: "返回首頁",
  },
  "zh-Hans": {
    kicker: "趣味测验 · SERIES 03",
    title: "六道习气测验",
    subtitle: "你今天正在经历哪一道？",
    lead: "每一天、甚至每一瞬间，都可能在六种心境之间轮转。用 6 个日常情境，看你此刻较常落入的主导心境与次要心境。凭第一直觉选最接近自己的答案，不必想太久。",
    boundary: "这里把六道作为日常意识与情绪的观察框架：天道是喜悦与执着，阿修罗道是瞋恨与好胜，人道是忙碌与理性，畜生道是愚痴与本能，饿鬼道是贪婪与匮乏，地狱道是极怒与煎熬。不是在断定死后去处或前世身份，也不替代昭梧的正式一掌经排盘。",
    question: "题",
    next: "下一题",
    result: "查看结果",
    mixed: "主导心境并列",
    primary: "主导心境",
    secondary: "次要心境",
    score: "本次计分",
    watch: "容易卡住的地方",
    practice: "转念方向",
    reminder: "外在境遇未必由人，但面对境遇时的心念可以被觉察与调整。这个测验要看的不是『你是哪一道』，而是『此刻哪种心念最常接管你』；看见它，就是从无意识轮转回到主动选择的第一步。",
    restart: "重新测验",
    formal: "查看我的正式一掌经六道",
    formalNote: "正式排盘需要出生资料，且不会读取这次趣味测验结果。",
    home: "返回首页",
  },
  en: {
    kicker: "FUN TEST · SERIES 03",
    title: "Six Realms Habit Test",
    subtitle: "Which state are you moving through today?",
    lead: "Across a day, even moment to moment, your mind can move through very different states. Six everyday situations show the dominant and secondary pattern appearing most often for you right now. Choose by instinct rather than overthinking it.",
    boundary: "This test uses the Six Realms as a reflection framework for everyday states: pleasure and attachment, rivalry and anger, busyness and reason, unexamined instinct, scarcity and craving, or intense anger and distress. It does not claim to identify a literal afterlife or past-life realm, and it does not replace Zhaowu's formal Dharma Palm calculation.",
    question: "Question",
    next: "Next question",
    result: "See result",
    mixed: "Tied dominant states",
    primary: "Dominant state",
    secondary: "Secondary state",
    score: "Score",
    watch: "Where it can trap you",
    practice: "Shift to practise",
    reminder: "You cannot control every circumstance, but you can notice and adjust how your mind responds. The point is not to label you as one realm; it is to notice which state is taking over most often now. Awareness is the first step back toward deliberate choice.",
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

  function realmCard(key: SixRealmKey, level: "primary" | "secondary") {
    const result = results[key];
    return (
      <div key={`${level}-${key}`} className={`rounded-xl border bg-paper p-4 sm:p-5 ${level === "primary" ? "border-cinnabar/35" : "border-line"}`}>
        <h2 className="font-display text-2xl text-ink">{key} · {result.name}</h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{result.summary}</p>
        <p className="mt-4 text-sm leading-7 text-ink-soft"><b className="text-ink">{copy.watch}：</b>{result.watch}</p>
        <p className="mt-2 text-sm leading-7 text-ink-soft"><b className="text-ink">{copy.practice}：</b>{result.practice}</p>
      </div>
    );
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
            <p className="text-xs tracking-[0.24em] text-cinnabar">{finalScore.tied ? copy.mixed : copy.primary}</p>
            <div className="mt-4 grid gap-4">
              {finalScore.primary.map((key) => realmCard(key, "primary"))}
            </div>

            {finalScore.secondary.length > 0 ? (
              <div className="mt-6 border-t border-line pt-5">
                <p className="text-xs tracking-[0.2em] text-ink-mute">{copy.secondary}</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {finalScore.secondary.map((key) => realmCard(key, "secondary"))}
                </div>
              </div>
            ) : null}

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
