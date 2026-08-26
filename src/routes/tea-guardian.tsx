import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TeaPortraitCard } from "@/components/tea-guardian-report";
import { useI18n, type Locale } from "@/lib/i18n";
import { recommendTea, teaQuizComplete, type TeaQuizAnswers, type TeaRecommendation } from "@/lib/tea-guardian";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/tea-guardian")({ component: TeaGuardianPage });

type QuizOption = { value: string; label: Record<Locale, string> };
type QuizQuestion = { key: keyof TeaQuizAnswers; title: Record<Locale, string>; options: QuizOption[] };

const l = (hant: string, hans: string, en: string): Record<Locale, string> => ({ "zh-Hant": hant, "zh-Hans": hans, en });

const QUESTIONS: QuizQuestion[] = [
  { key: "aroma", title: l("第一口最想先聞到什麼？", "第一口最想先闻到什么？", "Which aroma should arrive first?"), options: [
    { value: "floral", label: l("蘭花、茉莉一類花香", "兰花、茉莉一类花香", "Orchid or jasmine florals") },
    { value: "roast", label: l("焙火、煙香、岩韻", "焙火、烟香、岩韵", "Roast, smoke or mineral notes") },
    { value: "fruit", label: l("果香、蜜香、甜香", "果香、蜜香、甜香", "Fruit, honey or sweet aromatics") },
    { value: "fresh", label: l("嫩葉、豆香、清鮮", "嫩叶、豆香、清鲜", "Fresh leaf, chestnut or green notes") },
  ] },
  { key: "body", title: l("你喜歡茶湯多有份量？", "你喜欢茶汤多有分量？", "How much body do you want?"), options: [
    { value: "light", label: l("輕、透、乾淨", "轻、透、干净", "Light and transparent") },
    { value: "balanced", label: l("中等，香與湯平衡", "中等，香与汤平衡", "Balanced aroma and texture") },
    { value: "full", label: l("厚、醇、有包裹感", "厚、醇、有包裹感", "Full and enveloping") },
  ] },
  { key: "bite", title: l("你對苦澀與勁度的接受度？", "你对苦涩与劲度的接受度？", "How much bitterness or grip do you enjoy?"), options: [
    { value: "soft", label: l("越柔越好", "越柔越好", "Keep it soft") },
    { value: "medium", label: l("有一點骨架即可", "有一点骨架即可", "Some structure is welcome") },
    { value: "strong", label: l("可以強，回甘更重要", "可以强，回甘更重要", "Strong is fine if the finish rewards it") },
  ] },
  { key: "warmth", title: l("此刻更想要哪種體感？", "此刻更想要哪种体感？", "What kind of cup feels right now?"), options: [
    { value: "cool", label: l("清亮、輕快", "清亮、轻快", "Bright and light") },
    { value: "neutral", label: l("不冷不燥，平衡", "不冷不燥，平衡", "Neutral and balanced") },
    { value: "warm", label: l("溫厚、安定", "温厚、安定", "Warm and grounding") },
  ] },
  { key: "caffeine", title: l("你對咖啡因通常怎樣？", "你对咖啡因通常怎样？", "How do you usually handle caffeine?"), options: [
    { value: "sensitive", label: l("比較敏感，容易睡不著", "比较敏感，容易睡不着", "Sensitive, especially later in the day") },
    { value: "normal", label: l("一般，適量沒問題", "一般，适量没问题", "Average tolerance") },
    { value: "robust", label: l("耐受高，喜歡有精神感", "耐受高，喜欢有精神感", "High tolerance; I like a stronger lift") },
  ] },
  { key: "moment", title: l("你最常在什麼時候喝？", "你最常在什么时候喝？", "When do you most often drink tea?"), options: [
    { value: "morning", label: l("早上或開工前", "早上或开工前", "Morning or before work") },
    { value: "allDay", label: l("白天慢慢喝", "白天慢慢喝", "Across the day") },
    { value: "afterMeal", label: l("飯後或下午", "饭后或下午", "After food or in the afternoon") },
    { value: "evening", label: l("傍晚或晚上", "傍晚或晚上", "Late afternoon or evening") },
  ] },
  { key: "intention", title: l("這杯茶現在要替你做什麼？", "这杯茶现在要替你做什么？", "What should this cup support right now?"), options: [
    { value: "focus", label: l("讓頭腦清楚、專注", "让头脑清楚、专注", "Clearer focus") },
    { value: "calm", label: l("把節奏放慢", "把节奏放慢", "A slower, calmer pace") },
    { value: "comfort", label: l("要溫暖和安定感", "要温暖和安定感", "Warmth and comfort") },
    { value: "explore", label: l("想喝到有個性的東西", "想喝到有个性的东西", "Something distinctive and exploratory") },
  ] },
];

const COPY = {
  "zh-Hant": {
    kicker: "昭梧・茶仙守護測驗",
    title: "七題找到你真正適合的茶",
    lead: "口味與生活狀態先獨立計算；如果你剛完成昭梧命盤，再加入月令、旺衰底盤與流通候選，避免只靠五行貼標籤。",
    back: "返回昭梧",
    chartReady: "已讀取本次命盤，結果會同時給出本命茶仙。",
    chartMissing: "目前沒有本次命盤；先做口味結果。若要加入本命茶仙，回首頁完成一次分析後再進來。",
    submit: "查看我的三個茶答案",
    incomplete: "請完成全部 7 題。",
    result: "你的茶仙評估",
    guardian: "本命茶仙守護",
    current: "當下最適合喝",
    taste: "純口味最可能喜歡",
    noGuardian: "要加入本命茶仙，請先回首頁完成一次命盤分析。",
    rerun: "重新測驗",
    boundary: "結果是飲茶偏好與傳統文化象徵的交叉推薦，不是醫療、減肥、治病或補運保證。茶葉咖啡因會受品種、投茶量、水溫與浸泡時間影響。",
  },
  "zh-Hans": {
    kicker: "昭梧・茶仙守护测验",
    title: "七题找到你真正适合的茶",
    lead: "口味与生活状态先独立计算；如果你刚完成昭梧命盘，再加入月令、旺衰底盘与流通候选，避免只靠五行贴标签。",
    back: "返回昭梧",
    chartReady: "已读取本次命盘，结果会同时给出本命茶仙。",
    chartMissing: "目前没有本次命盘；先做口味结果。若要加入本命茶仙，回首页完成一次分析后再进来。",
    submit: "查看我的三个茶答案",
    incomplete: "请完成全部 7 题。",
    result: "你的茶仙评估",
    guardian: "本命茶仙守护",
    current: "当下最适合喝",
    taste: "纯口味最可能喜欢",
    noGuardian: "要加入本命茶仙，请先回首页完成一次命盘分析。",
    rerun: "重新测验",
    boundary: "结果是饮茶偏好与传统文化象征的交叉推荐，不是医疗、减肥、治病或补运保证。茶叶咖啡因会受品种、投茶量、水温与浸泡时间影响。",
  },
  en: {
    kicker: "ZHAOWU · TEA GUARDIAN TEST",
    title: "Seven questions to find your tea",
    lead: "Taste and current routine are scored independently. If you have just completed a Zhaowu chart, the result also uses its Month Command, strength baseline and provisional flow candidates—without reducing you to a generic element label.",
    back: "Back to Zhaowu",
    chartReady: "Your current chart is available, so the result will also include a chart-based guardian.",
    chartMissing: "No current chart is available. You can still get the taste results; complete one analysis on the homepage to add the chart-based guardian.",
    submit: "Show my three tea matches",
    incomplete: "Complete all seven questions.",
    result: "Your tea matches",
    guardian: "Chart-based tea guardian",
    current: "Best fit right now",
    taste: "Most likely taste favourite",
    noGuardian: "Complete one chart analysis on the homepage to add the chart-based guardian.",
    rerun: "Retake test",
    boundary: "This is a cross-match of tea preference and traditional cultural symbolism—not medical, weight-loss, treatment or luck advice. Caffeine varies with the tea, dose, water temperature and steeping time.",
  },
} as const;

function TeaGuardianPage() {
  const { locale } = useI18n();
  const current = useAppStore((state) => state.current);
  const chart = current?.chart ?? null;
  const copy = COPY[locale];
  const [answers, setAnswers] = useState<TeaQuizAnswers>({});
  const [result, setResult] = useState<TeaRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!teaQuizComplete(answers)) {
      setError(copy.incomplete);
      return;
    }
    setError(null);
    setResult(recommendTea(answers, chart));
    window.setTimeout(() => document.getElementById("tea-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  function resetQuiz() {
    setAnswers({});
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="tea-quiz-page">
      <section className="tea-quiz-hero seal-border">
        <Link to="/" className="tea-back-link">← {copy.back}</Link>
        <p className="tea-quiz-kicker">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <p className="tea-quiz-lead">{copy.lead}</p>
        <div className={`tea-chart-status ${chart ? "is-ready" : ""}`}>{chart ? copy.chartReady : copy.chartMissing}</div>
      </section>

      <form className="tea-quiz-form seal-border" onSubmit={submit}>
        <div className="tea-quiz-progress"><span style={{ width: `${(answered / QUESTIONS.length) * 100}%` }} /></div>
        {QUESTIONS.map((question, index) => (
          <fieldset key={question.key} className="tea-question">
            <legend><span>{String(index + 1).padStart(2, "0")}</span>{question.title[locale]}</legend>
            <div className="tea-options">
              {question.options.map((option) => {
                const checked = answers[question.key] === option.value;
                return (
                  <label key={option.value} className={checked ? "is-selected" : ""}>
                    <input
                      type="radio"
                      name={question.key}
                      value={option.value}
                      checked={checked}
                      onChange={() => setAnswers((previous) => ({ ...previous, [question.key]: option.value }))}
                    />
                    <span>{option.label[locale]}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
        {error ? <p role="alert" className="tea-quiz-error">{error}</p> : null}
        <button type="submit" className="tea-quiz-submit">{copy.submit}</button>
      </form>

      {result ? (
        <section id="tea-result" className="tea-quiz-results seal-border" aria-labelledby="tea-result-title">
          <p className="tea-quiz-kicker">ZHAOWU · TEA MATCH</p>
          <h2 id="tea-result-title">{copy.result}</h2>
          <div className="tea-results-grid">
            {result.guardian ? <TeaPortraitCard tea={result.guardian} label={copy.guardian} locale={locale} featured /> : null}
            <TeaPortraitCard tea={result.current} label={copy.current} locale={locale} />
            <TeaPortraitCard tea={result.taste} label={copy.taste} locale={locale} />
          </div>
          {!result.guardian ? <p className="tea-no-guardian">{copy.noGuardian}</p> : null}
          {result.guardian && result.chartEvidence.length ? (
            <ul className="tea-result-evidence">{result.chartEvidence.map((line) => <li key={line[locale]}>{line[locale]}</li>)}</ul>
          ) : null}
          <button type="button" className="tea-rerun" onClick={resetQuiz}>{copy.rerun}</button>
          <p className="tea-guardian-boundary">{copy.boundary}</p>
        </section>
      ) : null}
    </main>
  );
}
