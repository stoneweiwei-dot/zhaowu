import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/lib/store";
import { deriveGuardianBeast } from "@/lib/report/guardian-beast";

export const Route = createFileRoute("/fun-tests")({ component: FunTests });

type AnimalKey = "eagle" | "wolf" | "fox" | "deer" | "leopard" | "crane" | "whale" | "horse";

type Answer = { label: string; animal: AnimalKey };
type Question = { title: string; answers: Answer[] };

const ANIMALS: Record<AnimalKey, { name: string; subtitle: string; desire: string; powers: string[]; shadow: string; group: "action" | "relational" | "adaptive" }> = {
  eagle: { name: "蒼鷹", subtitle: "高空判斷者", desire: "自主與選擇權", powers: ["獨立判斷", "長線視野", "迅速決斷"], shadow: "過度自己扛，容易把距離感當成安全感。", group: "action" },
  wolf: { name: "狼", subtitle: "邊界型盟友", desire: "可靠的同盟與忠誠", powers: ["策略", "守界", "團隊忠誠"], shadow: "一旦失去信任，容易直接撤離。", group: "relational" },
  fox: { name: "靈狐", subtitle: "變局讀取者", desire: "自由轉向與理解局勢", powers: ["適應", "觀察", "策略轉換"], shadow: "太會繞路時，可能延後真正的決定。", group: "adaptive" },
  deer: { name: "玄鹿", subtitle: "敏銳感知者", desire: "和諧、安全與乾淨邊界", powers: ["感受力", "審美", "避險"], shadow: "為了維持平衡，可能壓下自己的真實需求。", group: "relational" },
  leopard: { name: "玄豹", subtitle: "單點突破者", desire: "掌控節奏與有效成果", powers: ["專注", "膽識", "爆發力"], shadow: "容易把效率放在關係與恢復之前。", group: "action" },
  crane: { name: "玄鶴", subtitle: "冷靜觀照者", desire: "秩序、清明與精神空間", powers: ["克制", "洞察", "抽離思考"], shadow: "過度抽離時，別人會讀不到你的真實感受。", group: "adaptive" },
  whale: { name: "靈鯨", subtitle: "深水承載者", desire: "深度連結與內在穩定", powers: ["包容", "深度", "持續力"], shadow: "承接太多時，容易忘了先處理自己的負荷。", group: "relational" },
  horse: { name: "天馬", subtitle: "自由行動者", desire: "移動、探索與不被束縛", powers: ["行動", "生命力", "開拓"], shadow: "不喜歡停滯，可能太快離開仍值得經營的事。", group: "action" },
};

const QUESTIONS: Question[] = [
  { title: "遇到一個陌生又重要的選擇，你第一反應是？", answers: [
    { label: "先拉高視角，看長期代價", animal: "eagle" }, { label: "先找最可靠的人交換判斷", animal: "wolf" }, { label: "先保留幾條路，邊走邊看", animal: "fox" }, { label: "先確認環境是否讓我舒服安全", animal: "deer" },
  ]},
  { title: "工作卡住時，你比較像哪一種？", answers: [
    { label: "集中火力，直接破掉最關鍵的一點", animal: "leopard" }, { label: "暫時抽離，重新整理整個結構", animal: "crane" }, { label: "慢慢承接，把問題沉到底再處理", animal: "whale" }, { label: "換地方、換方法，先讓事情動起來", animal: "horse" },
  ]},
  { title: "你最受不了哪種關係？", answers: [
    { label: "控制我、替我做決定", animal: "eagle" }, { label: "嘴上承諾很多，實際不可靠", animal: "wolf" }, { label: "把所有事情定死，沒有轉圜", animal: "fox" }, { label: "情緒太粗暴，沒有分寸", animal: "deer" },
  ]},
  { title: "面對衝突，你更常怎麼做？", answers: [
    { label: "抓核心問題，直接解決", animal: "leopard" }, { label: "先冷卻，不在情緒高點處理", animal: "crane" }, { label: "先理解彼此真正介意的是什麼", animal: "whale" }, { label: "不值得耗就離開現場", animal: "horse" },
  ]},
  { title: "如果突然多出一整天空白時間，你會？", answers: [
    { label: "做一直想做、但沒人替我決定的事", animal: "eagle" }, { label: "和自己認定的人待在一起", animal: "wolf" }, { label: "隨機探索新東西", animal: "fox" }, { label: "去安靜漂亮的地方恢復感受", animal: "deer" },
  ]},
  { title: "別人最容易低估你的地方是？", answers: [
    { label: "真正出手時的狠準", animal: "leopard" }, { label: "我其實看得比說得多", animal: "crane" }, { label: "我能承受和消化很多複雜情緒", animal: "whale" }, { label: "我看似隨性，其實很敢開新路", animal: "horse" },
  ]},
  { title: "你做重大決策時最信任什麼？", answers: [
    { label: "自己的整體判斷", animal: "eagle" }, { label: "長期驗證過的人和承諾", animal: "wolf" }, { label: "環境裡細小但真實的訊號", animal: "fox" }, { label: "身體與直覺告訴我的舒適或不適", animal: "deer" },
  ]},
  { title: "當壓力很大，你最可能出現什麼狀態？", answers: [
    { label: "更強勢、更想控制進度", animal: "leopard" }, { label: "變安靜，自己消化", animal: "crane" }, { label: "先承擔，直到真的累了才說", animal: "whale" }, { label: "想立刻換環境或出去走", animal: "horse" },
  ]},
  { title: "理想的合作方式是？", answers: [
    { label: "給我目標和權限，不要微管理", animal: "eagle" }, { label: "角色清楚、彼此可靠、長期合作", animal: "wolf" }, { label: "允許快速調整，不要流程綁死", animal: "fox" }, { label: "尊重節奏與感受，不靠壓迫推進", animal: "deer" },
  ]},
  { title: "你最看重自己的哪種能力？", answers: [
    { label: "關鍵時刻敢做決定", animal: "leopard" }, { label: "不被表面帶走，能看清本質", animal: "crane" }, { label: "能理解深層情緒與複雜人性", animal: "whale" }, { label: "不怕重新開始", animal: "horse" },
  ]},
  { title: "你希望別人怎麼理解你？", answers: [
    { label: "我不是難搞，我只是需要自主", animal: "eagle" }, { label: "我不是冷，我只把信任給少數人", animal: "wolf" }, { label: "我不是飄，我只是不喜歡把自己鎖死", animal: "fox" }, { label: "我不是脆弱，我只是感受得很細", animal: "deer" },
  ]},
  { title: "如果只能保留一種人生能力，你選？", answers: [
    { label: "突破", animal: "leopard" }, { label: "看清", animal: "crane" }, { label: "承載", animal: "whale" }, { label: "自由移動", animal: "horse" },
  ]},
];

function guardianGroup(element: string): "action" | "relational" | "adaptive" {
  if (element === "火") return "action";
  if (element === "土") return "relational";
  return "adaptive";
}

function relationLabel(innerGroup: "action" | "relational" | "adaptive", outerGroup: "action" | "relational" | "adaptive") {
  if (innerGroup === outerGroup) return { title: "內外同象", text: "你現在最常使用的人格策略，和命局瑞獸所象徵的底層走向高度一致。優勢會被放大，過度使用同一套策略時，盲點也會一起被放大。" };
  if ((innerGroup === "action" && outerGroup === "adaptive") || (innerGroup === "adaptive" && outerGroup === "relational")) return { title: "內外相生", text: "你的後天人格與命局底色不是同一種力量，但能互相補位：一邊負責開路，一邊負責校準或承載。" };
  if (innerGroup === "action" && outerGroup === "relational") return { title: "內外相制", text: "你現在習慣用較強的推進方式，去平衡命局中更重穩定與承載的一面。這不是矛盾，而是一種長期形成的制衡。" };
  return { title: "內外異象", text: "你的社會人格與命局底色走的是不同路線。這通常表示你已發展出一套很成熟的後天生存方式，不代表哪一面比較真。" };
}

function FunTests() {
  const current = useAppStore((s) => s.current);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnimalKey[]>([]);

  const resultKey = useMemo(() => {
    if (answers.length !== QUESTIONS.length) return null;
    const counts = Object.keys(ANIMALS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {} as Record<AnimalKey, number>);
    for (const key of answers) counts[key] += 1;
    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "eagle") as AnimalKey;
  }, [answers]);

  const inner = resultKey ? ANIMALS[resultKey] : null;
  const guardian = current ? deriveGuardianBeast(current.chart, "zh-Hant") : null;
  const relation = inner && guardian ? relationLabel(inner.group, guardianGroup(guardian.element)) : null;

  function choose(animal: AnimalKey) {
    const next = [...answers, animal];
    setAnswers(next);
    if (index < QUESTIONS.length - 1) setIndex(index + 1);
    if (next.length === QUESTIONS.length && typeof window !== "undefined") {
      window.localStorage.setItem("zhaowu-inner-animal-v1", JSON.stringify({ animal, answers: next, completedAt: new Date().toISOString() }));
    }
  }

  function restart() {
    setStarted(true);
    setIndex(0);
    setAnswers([]);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 pb-16">
      <header className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
        <p className="text-xs tracking-[0.28em] text-cinnabar">ZHAOWU · 趣味測驗</p>
        <h1 className="mt-2 font-display text-3xl text-ink">昭梧趣味測驗系列</h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">不把心理測驗冒充命理。先測你現在最常使用的人格策略，再和八字命局瑞獸交叉，看是內外同象、相生、相制，還是異象。</p>
      </header>

      {!started && !resultKey ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => setStarted(true)} className="seal-border rounded-2xl bg-paper p-5 text-left shadow-sm">
            <span className="text-xs tracking-[0.22em] text-cinnabar">SERIES 01</span>
            <strong className="mt-2 block font-display text-2xl text-ink">你的內在之獸</strong>
            <span className="mt-2 block text-sm leading-6 text-ink-soft">12 題，看你目前最常使用的動物人格原型；有命盤時，再交叉生成命局瑞獸與「內外同象」。</span>
            <span className="mt-4 inline-block text-sm text-cinnabar">開始測驗 →</span>
          </button>
          <article className="seal-border rounded-2xl bg-cream/70 p-5 opacity-75">
            <span className="text-xs tracking-[0.22em] text-ink-mute">SERIES 02 · 待加入</span>
            <strong className="mt-2 block font-display text-xl text-ink">關係中的你</strong>
            <span className="mt-2 block text-sm leading-6 text-ink-soft">系列入口已預留，後續可以繼續加入不同趣味測驗，不需要再改首頁結構。</span>
          </article>
        </section>
      ) : null}

      {started && !resultKey ? (
        <section className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
          <div className="flex items-center justify-between gap-4 text-xs text-ink-mute"><span>內在之獸</span><span>{index + 1} / {QUESTIONS.length}</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-deep"><div className="h-full bg-cinnabar transition-all" style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} /></div>
          <h2 className="mt-6 font-display text-2xl leading-9 text-ink">{QUESTIONS[index].title}</h2>
          <div className="mt-5 grid gap-3">
            {QUESTIONS[index].answers.map((answer) => (
              <button key={answer.label} type="button" onClick={() => choose(answer.animal)} className="rounded-xl border border-line bg-paper px-4 py-4 text-left text-[15px] leading-6 text-ink transition hover:border-cinnabar/50">
                {answer.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {inner ? (
        <section className="space-y-4">
          <article className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
            <p className="text-xs tracking-[0.25em] text-cinnabar">INNER ANIMAL</p>
            <h2 className="mt-2 font-display text-3xl text-ink">{inner.name} · {inner.subtitle}</h2>
            <p className="mt-4 text-sm leading-7 text-ink-soft">核心欲望：{inner.desire}</p>
            <div className="mt-4 flex flex-wrap gap-2">{inner.powers.map((power) => <span key={power} className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink">{power}</span>)}</div>
            <p className="mt-4 text-sm leading-7 text-ink-soft">陰影面：{inner.shadow}</p>
          </article>

          {guardian && relation ? (
            <article className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
              <p className="text-xs tracking-[0.25em] text-cinnabar">INNATE GUARDIAN BEAST</p>
              <h2 className="mt-2 font-display text-3xl text-ink">命局瑞獸 · {guardian.name}</h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">{guardian.rationale}</p>
              <div className="mt-5 rounded-xl border border-line bg-cream/80 p-4">
                <strong className="font-display text-xl text-ink">{relation.title}</strong>
                <p className="mt-2 text-sm leading-7 text-ink-soft">{relation.text}</p>
              </div>
            </article>
          ) : (
            <article className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
              <strong className="font-display text-xl text-ink">要看「內外同象」，還差你的命盤。</strong>
              <p className="mt-2 text-sm leading-7 text-ink-soft">先回首頁完成一次八字分析。命盤生成後再回到這裡，會直接補上命局瑞獸與內外關係，不需要重做題目。</p>
              <Link to="/" className="mt-4 inline-flex rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">回首頁建立命盤</Link>
            </article>
          )}

          <button type="button" onClick={restart} className="w-full rounded-full border border-line bg-cream px-5 py-3 text-sm text-ink">重新測一次</button>
        </section>
      ) : null}
    </main>
  );
}
