import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/quiz/five-element-overdrive")({ component: FiveElementOverdriveQuiz });

type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";
type Localized = Record<Locale, string>;
type QuizOption = { key: ElementKey; label: Localized };
type QuizQuestion = { prompt: Localized; options: QuizOption[] };
type ResultCopy = { name: string; title: string; strength: string; overdrive: string; next: string };

const KEYS: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];
const L = (zhHant: string, zhHans: string, en: string): Localized => ({ "zh-Hant": zhHant, "zh-Hans": zhHans, en });
const O = (key: ElementKey, zhHant: string, zhHans: string, en: string): QuizOption => ({ key, label: L(zhHant, zhHans, en) });

const QUESTIONS: QuizQuestion[] = [
  { prompt: L("接到一個全新的計畫，你第一反應通常是？", "接到一个全新的计划，你第一反应通常是？", "When a new project appears, what is your first instinct?"), options: [
    O("wood", "馬上想到它未來可以長成什麼樣", "马上想到它未来可以长成什么样", "Imagine what it could grow into"),
    O("fire", "想趕快做出來讓大家看到", "想赶快做出来让大家看到", "Make something visible quickly"),
    O("earth", "先確認資源、時間和能不能穩定完成", "先确认资源、时间和能不能稳定完成", "Check resources, timing and whether it can be sustained"),
    O("metal", "先拆流程、標準、責任與風險", "先拆流程、标准、责任与风险", "Define process, standards, ownership and risk"),
    O("water", "先收集資訊，觀察局勢再決定", "先收集信息，观察局势再决定", "Gather information and observe before deciding"),
  ]},
  { prompt: L("別人來找你訴苦時，你最容易？", "别人来找你诉苦时，你最容易？", "When someone comes to you with a problem, what do you tend to do?"), options: [
    O("wood", "太替對方著想，最後自己的界線沒了", "太替对方着想，最后自己的界线没了", "Care so much that your own boundary disappears"),
    O("fire", "很快給鼓勵和情緒價值", "很快给鼓励和情绪价值", "Give quick encouragement and emotional energy"),
    O("earth", "默默幫他把事情扛起來", "默默帮他把事情扛起来", "Quietly take part of the burden on yourself"),
    O("metal", "直接告訴他問題到底在哪", "直接告诉他问题到底在哪", "Tell them directly where the problem is"),
    O("water", "先分析他真正想要什麼", "先分析他真正想要什么", "Work out what they actually want"),
  ]},
  { prompt: L("你最常被人提醒的問題是？", "你最常被人提醒的问题是？", "Which criticism sounds most familiar?"), options: [
    O("wood", "想做太多，很難剪枝", "想做太多，很难剪枝", "Too many directions; hard to prune"),
    O("fire", "太急、太容易上頭", "太急、太容易上头", "Too fast or too easily fired up"),
    O("earth", "太固執，不願意改", "太固执，不愿意改", "Too fixed; reluctant to change"),
    O("metal", "太硬，標準太高", "太硬，标准太高", "Too strict; standards become too hard"),
    O("water", "想太多，遲遲不動", "想太多，迟迟不动", "Too much analysis before action"),
  ]},
  { prompt: L("面對衝突，你最自然的模式？", "面对冲突，你最自然的模式？", "In conflict, what is your default response?"), options: [
    O("wood", "想修復關係", "想修复关系", "Try to repair the relationship"),
    O("fire", "當場說清楚", "当场说清楚", "Say it clearly on the spot"),
    O("earth", "忍很久才處理", "忍很久才处理", "Hold it for a long time before dealing with it"),
    O("metal", "立刻劃清界線", "立刻划清界线", "Draw a boundary immediately"),
    O("water", "先退開觀察局勢", "先退开观察局势", "Step back and observe first"),
  ]},
  { prompt: L("工作裡什麼最讓你有成就感？", "工作里什么最让你有成就感？", "What gives you the strongest sense of achievement at work?"), options: [
    O("wood", "看一件事從無到有成長", "看一件事从无到有成长", "Seeing something grow from nothing"),
    O("fire", "被看見、被認可、產生影響力", "被看见、被认可、产生影响力", "Being seen and creating impact"),
    O("earth", "建立一個穩定可長期運作的東西", "建立一个稳定可长期运作的东西", "Building something stable that can last"),
    O("metal", "把混亂整理成精準系統", "把混乱整理成精准系统", "Turning disorder into a precise system"),
    O("water", "看懂複雜問題背後真正的規律", "看懂复杂问题背后真正的规律", "Understanding the pattern behind a complex problem"),
  ]},
  { prompt: L("當你壓力很大時，最容易出現？", "当你压力很大时，最容易出现？", "Under heavy pressure, what tends to happen?"), options: [
    O("wood", "什麼都捨不得放掉", "什么都舍不得放掉", "You cannot let any direction go"),
    O("fire", "情緒急、講話快", "情绪急、讲话快", "Your emotions and speech speed up"),
    O("earth", "悶著、僵住、不想變", "闷着、僵住、不想变", "You become stuck and resistant to change"),
    O("metal", "控制欲提高，對錯感變強", "控制欲提高，对错感变强", "Control and right-versus-wrong thinking intensify"),
    O("water", "反覆推演，失去行動", "反复推演，失去行动", "You keep modelling scenarios and stop moving"),
  ]},
  { prompt: L("如果別人不照你的方法做，你通常？", "如果别人不照你的方法做，你通常？", "If someone ignores your preferred method, what do you tend to feel?"), options: [
    O("wood", "擔心他走彎路", "担心他走弯路", "Worried they will take an unnecessary detour"),
    O("fire", "忍不住立刻介入", "忍不住立刻介入", "You want to jump in immediately"),
    O("earth", "覺得原來的方法已經很好", "觉得原来的方法已经很好", "The existing method already seems good enough"),
    O("metal", "覺得沒標準怎麼做事", "觉得没标准怎么做事", "Without standards, the work will fall apart"),
    O("water", "想知道他背後的邏輯", "想知道他背后的逻辑", "You want to understand their logic first"),
  ]},
  { prompt: L("你比較容易把錢花在哪？", "你比较容易把钱花在哪？", "Where are you most willing to spend money?"), options: [
    O("wood", "學習、成長、新計畫", "学习、成长、新计划", "Learning, growth and new projects"),
    O("fire", "體驗、社交、形象", "体验、社交、形象", "Experiences, social life and presentation"),
    O("earth", "家、生活品質、耐用品", "家、生活品质、耐用品", "Home, quality of life and durable goods"),
    O("metal", "工具、設備、有效率的東西", "工具、设备、有效率的东西", "Tools, equipment and efficiency"),
    O("water", "資訊、旅行、探索、新知", "信息、旅行、探索、新知", "Information, travel, exploration and new knowledge"),
  ]},
  { prompt: L("哪種環境最容易讓你發揮？", "哪种环境最容易让你发挥？", "Which environment brings out your best work?"), options: [
    O("wood", "可以創造、試錯、成長", "可以创造、试错、成长", "Room to create, experiment and grow"),
    O("fire", "有舞台、有互動、有速度", "有舞台、有互动、有速度", "Visibility, interaction and pace"),
    O("earth", "有秩序、有長期性、有安全感", "有秩序、有长期性、有安全感", "Order, continuity and security"),
    O("metal", "有清楚標準、有自主權", "有清楚标准、有自主权", "Clear standards and autonomy"),
    O("water", "有資訊自由、有思考空間", "有信息自由、有思考空间", "Information freedom and thinking space"),
  ]},
  { prompt: L("如果人生卡住，你最容易做錯的是？", "如果人生卡住，你最容易做错的是？", "When life is stuck, which mistake are you most likely to make?"), options: [
    O("wood", "繼續增加新方向", "继续增加新方向", "Add more directions"),
    O("fire", "用更大的力氣硬衝", "用更大的力气硬冲", "Push harder with more force"),
    O("earth", "守著已經失效的東西", "守着已经失效的东西", "Keep holding what no longer works"),
    O("metal", "把自己和別人管得更緊", "把自己和别人管得更紧", "Tighten control over yourself and others"),
    O("water", "繼續分析，而不是做第一步", "继续分析，而不是做第一步", "Keep analysing instead of taking the first step"),
  ]},
];

const RESULTS: Record<Locale, Record<ElementKey, ResultCopy>> = {
  "zh-Hant": {
    wood: { name: "木", title: "生發型", strength: "你擅長看見可能性、讓事情生長、連結資源與開新路。", overdrive: "用過頭時會變成方向太多、界線太少、什麼都捨不得剪。", next: "下一課不是再長，而是修枝：只留一條主線，主動砍掉不重要的分支。" },
    fire: { name: "火", title: "顯化型", strength: "你擅長啟動、表達、點燃氣氛，讓事情真正被看見。", overdrive: "用過頭時會變成急、躁、太在意即時反應，續航反而下降。", next: "下一課不是再燒，而是節律：每次啟動都安排收尾與冷卻。" },
    earth: { name: "土", title: "承載型", strength: "你擅長穩定、負責、把重要的事長期接住。", overdrive: "用過頭時會變成僵、慢、什麼都自己扛，甚至守著已失效的東西。", next: "下一課不是再扛，而是疏通：先移開一個最重的堵點。" },
    metal: { name: "金", title: "結構型", strength: "你擅長決斷、界線、品質與把混亂整理成標準。", overdrive: "用過頭時會變成過硬、控制感強、只剩對錯而沒有彈性。", next: "下一課不是更鋒利，而是讓規則為人和目標服務。" },
    water: { name: "水", title: "洞察型", strength: "你擅長觀察、理解複雜性、策略與在變化中找路。", overdrive: "用過頭時會變成想得比做得快，資訊越多越難決定。", next: "下一課不是再知道，而是導流：限定觀察窗口，然後做第一步。" },
  },
  "zh-Hans": {
    wood: { name: "木", title: "生发型", strength: "你擅长看见可能性、让事情生长、连接资源与开新路。", overdrive: "用过头时会变成方向太多、界线太少、什么都舍不得剪。", next: "下一课不是再长，而是修枝：只留一条主线，主动砍掉不重要的分支。" },
    fire: { name: "火", title: "显化型", strength: "你擅长启动、表达、点燃气氛，让事情真正被看见。", overdrive: "用过头时会变成急、躁、太在意即时反应，续航反而下降。", next: "下一课不是再烧，而是节律：每次启动都安排收尾与冷却。" },
    earth: { name: "土", title: "承载型", strength: "你擅长稳定、负责、把重要的事长期接住。", overdrive: "用过头时会变成僵、慢、什么都自己扛，甚至守着已失效的东西。", next: "下一课不是再扛，而是疏通：先移开一个最重的堵点。" },
    metal: { name: "金", title: "结构型", strength: "你擅长决断、界线、品质与把混乱整理成标准。", overdrive: "用过头时会变成过硬、控制感强、只剩对错而没有弹性。", next: "下一课不是更锋利，而是让规则为人和目标服务。" },
    water: { name: "水", title: "洞察型", strength: "你擅长观察、理解复杂性、策略与在变化中找路。", overdrive: "用过头时会变成想得比做得快，信息越多越难决定。", next: "下一课不是再知道，而是导流：限定观察窗口，然后做第一步。" },
  },
  en: {
    wood: { name: "Wood", title: "Growth mode", strength: "You naturally see possibilities, connect resources and create new paths.", overdrive: "Overused, this becomes too many directions, weak boundaries and difficulty pruning.", next: "The next move is not more growth but pruning: keep one main line and cut low-value branches." },
    fire: { name: "Fire", title: "Activation mode", strength: "You naturally start things, express energy and make work visible.", overdrive: "Overused, this becomes urgency, emotional heat and dependence on immediate response.", next: "The next move is rhythm: every launch needs a finish and a cool-down." },
    earth: { name: "Earth", title: "Carrying mode", strength: "You naturally stabilise, take responsibility and keep important things running.", overdrive: "Overused, this becomes rigidity, carrying everything alone and holding on after something has stopped working.", next: "The next move is circulation: remove one major blockage instead of carrying more." },
    metal: { name: "Metal", title: "Structure mode", strength: "You naturally make decisions, define boundaries and turn disorder into standards.", overdrive: "Overused, this becomes excessive hardness, control and a rigid right-versus-wrong frame.", next: "The next move is flexibility: make rules serve people and the goal." },
    water: { name: "Water", title: "Insight mode", strength: "You naturally observe, model complexity and find routes through change.", overdrive: "Overused, this becomes analysis without movement; more information makes decisions harder.", next: "The next move is channeling: set an observation window, then take one concrete step." },
  },
};

const UI: Record<Locale, { kicker: string; title: string; lead: string; disclaimer: string; question: string; result: string; mixed: string; strength: string; overdrive: string; next: string; restart: string; article: string; home: string }> = {
  "zh-Hant": { kicker: "趣味測驗 · 五行功能", title: "你最容易把哪一種優勢，用成自己的內耗？", lead: "10 個日常情境，看你最常使用的功能，以及它在壓力下最容易怎麼用過頭。憑第一反應選，不必想成命盤。", disclaimer: "本測驗只反映目前行為傾向，不等同正式八字命盤，不判喜用神，也不會把結果寫入你的命理資料。", question: "題", result: "查看結果", mixed: "並列主模式", strength: "你的長板", overdrive: "用過頭會怎樣", next: "下一步", restart: "重新測一次", article: "閱讀完整觀世錄文章", home: "回首頁" },
  "zh-Hans": { kicker: "趣味测验 · 五行功能", title: "你最容易把哪一种优势，用成自己的内耗？", lead: "10 个日常情境，看你最常使用的功能，以及它在压力下最容易怎么用过头。凭第一反应选，不必想成命盘。", disclaimer: "本测验只反映目前行为倾向，不等同正式八字命盘，不判喜用神，也不会把结果写入你的命理资料。", question: "题", result: "查看结果", mixed: "并列主模式", strength: "你的长板", overdrive: "用过头会怎样", next: "下一步", restart: "重新测一次", article: "阅读完整观世录文章", home: "回首页" },
  en: { kicker: "FUN TEST · FIVE-ELEMENT FUNCTIONS", title: "Which strength are you most likely to overuse?", lead: "Ten everyday situations show the function you rely on most and how it can turn into friction under pressure. Choose by first instinct; this is not a birth-chart reading.", disclaimer: "This test reflects current self-reported behaviour only. It is not a BaZi chart, does not determine favourable elements, and does not write the result into your metaphysics profile.", question: "Question", result: "See result", mixed: "Tied primary patterns", strength: "Your strength", overdrive: "When it becomes overused", next: "Next move", restart: "Retake test", article: "Read the full Notes on Life article", home: "Back home" },
};

function score(answers: ElementKey[]) {
  const scores = Object.fromEntries(KEYS.map((key) => [key, 0])) as Record<ElementKey, number>;
  answers.forEach((answer) => { scores[answer] += 1; });
  const high = Math.max(...KEYS.map((key) => scores[key]));
  return { scores, leaders: KEYS.filter((key) => scores[key] === high) };
}

function FiveElementOverdriveQuiz() {
  const { locale } = useI18n();
  const copy = UI[locale];
  const [answers, setAnswers] = useState<ElementKey[]>([]);
  const [index, setIndex] = useState(0);
  const finished = index >= QUESTIONS.length;
  const scored = useMemo(() => score(answers), [answers]);
  const current = QUESTIONS[index];

  const answer = (key: ElementKey) => {
    if (finished) return;
    setAnswers((value) => [...value, key]);
    setIndex((value) => value + 1);
  };

  const restart = () => { setAnswers([]); setIndex(0); };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="seal-border rounded-[28px] bg-paper p-5 shadow-[0_18px_50px_rgba(86,62,31,0.08)] sm:p-8">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-cinnabar">{copy.kicker}</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 text-sm leading-7 text-ink-soft">{copy.lead}</p>
        <p className="mt-4 rounded-2xl border border-line bg-cream px-4 py-3 text-xs leading-6 text-ink-mute">{copy.disclaimer}</p>

        {!finished && current ? (
          <div className="mt-7">
            <div className="flex items-center justify-between text-xs text-ink-mute">
              <span>{copy.question} {index + 1} / {QUESTIONS.length}</span>
              <span>{Math.round((index / QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line/60"><div className="h-full rounded-full bg-cinnabar transition-all" style={{ width: `${(index / QUESTIONS.length) * 100}%` }} /></div>
            <h2 className="mt-6 font-display text-2xl leading-9 text-ink">{current.prompt[locale]}</h2>
            <div className="mt-5 grid gap-3">
              {current.options.map((option) => (
                <button key={option.key} type="button" onClick={() => answer(option.key)} className="min-h-14 rounded-2xl border border-line bg-cream px-5 py-3 text-left text-sm leading-6 text-ink transition hover:border-cinnabar/40 hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinnabar">
                  {option.label[locale]}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-7">
            <p className="text-xs font-semibold tracking-[0.16em] text-cinnabar">{scored.leaders.length > 1 ? copy.mixed : copy.result}</p>
            <div className="mt-4 grid gap-4">
              {scored.leaders.map((key) => {
                const result = RESULTS[locale][key];
                return (
                  <article key={key} className="rounded-3xl border border-line bg-cream p-5 sm:p-6">
                    <h2 className="font-display text-3xl text-ink">{result.name}｜{result.title}</h2>
                    <div className="mt-5 space-y-4 text-sm leading-7 text-ink-soft">
                      <p><strong className="text-ink">{copy.strength}：</strong>{result.strength}</p>
                      <p><strong className="text-ink">{copy.overdrive}：</strong>{result.overdrive}</p>
                      <p><strong className="text-ink">{copy.next}：</strong>{result.next}</p>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={restart} className="min-h-11 rounded-full bg-ink px-5 py-2 text-sm text-paper">{copy.restart}</button>
              <Link to="/knowledge" className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-5 py-2 text-sm text-ink">{copy.article} →</Link>
              <Link to="/" className="inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-5 py-2 text-sm text-ink">{copy.home}</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
