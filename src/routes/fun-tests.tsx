import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { deriveGuardianBeast } from "@/lib/report/guardian-beast";
import { saveSpecialistHistory } from "@/lib/specialist-history";
import {
  FIVE_ELEMENT_QUESTIONS,
  FIVE_ELEMENT_RESULTS,
  FIVE_ELEMENT_UI,
  scoreFiveElementAnswers,
  type FiveElementKey,
} from "@/lib/fun-tests/five-element-function";

export const Route = createFileRoute("/fun-tests")({ component: FunTests });

type AnimalKey = "eagle" | "wolf" | "fox" | "deer" | "leopard" | "crane" | "whale" | "horse";
type AnimalGroup = "action" | "relational" | "adaptive";
type AnimalAnswer = { label: string; animal: AnimalKey };
type AnimalQuestion = { title: string; answers: AnimalAnswer[] };
type QuizMode = "menu" | "animal" | "element";

type AnimalCopy = {
  name: string;
  subtitle: string;
  desire: string;
  powers: string[];
  shadow: string;
  group: AnimalGroup;
};

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

const ANIMALS: Record<Locale, Record<AnimalKey, AnimalCopy>> = {
  "zh-Hant": {
    eagle: { name: "蒼鷹", subtitle: "高空判斷者", desire: "自主與選擇權", powers: ["獨立判斷", "長線視野", "迅速決斷"], shadow: "過度自己扛，容易把距離感當成安全感。", group: "action" },
    wolf: { name: "狼", subtitle: "邊界型盟友", desire: "可靠的同盟與忠誠", powers: ["策略", "守界", "團隊忠誠"], shadow: "一旦失去信任，容易直接撤離。", group: "relational" },
    fox: { name: "靈狐", subtitle: "變局讀取者", desire: "自由轉向與理解局勢", powers: ["適應", "觀察", "策略轉換"], shadow: "太會繞路時，可能延後真正的決定。", group: "adaptive" },
    deer: { name: "玄鹿", subtitle: "敏銳感知者", desire: "和諧、安全與乾淨界線", powers: ["感受力", "審美", "避險"], shadow: "為了維持平衡，可能壓下自己的真實需求。", group: "relational" },
    leopard: { name: "玄豹", subtitle: "單點突破者", desire: "掌控節奏與有效成果", powers: ["專注", "膽識", "爆發力"], shadow: "容易把效率放在關係與恢復之前。", group: "action" },
    crane: { name: "玄鶴", subtitle: "冷靜觀照者", desire: "秩序、清明與精神空間", powers: ["克制", "洞察", "抽離思考"], shadow: "過度抽離時，別人會讀不到你的真實感受。", group: "adaptive" },
    whale: { name: "靈鯨", subtitle: "深水承載者", desire: "深度連結與內在穩定", powers: ["包容", "深度", "持續力"], shadow: "承接太多時，容易忘了先處理自己的負荷。", group: "relational" },
    horse: { name: "天馬", subtitle: "自由行動者", desire: "移動、探索與不被束縛", powers: ["行動", "生命力", "開拓"], shadow: "不喜歡停滯，可能太快離開仍值得經營的事。", group: "action" },
  },
  "zh-Hans": {
    eagle: { name: "苍鹰", subtitle: "高空判断者", desire: "自主与选择权", powers: ["独立判断", "长线视野", "迅速决断"], shadow: "过度自己扛，容易把距离感当成安全感。", group: "action" },
    wolf: { name: "狼", subtitle: "边界型盟友", desire: "可靠的同盟与忠诚", powers: ["策略", "守界", "团队忠诚"], shadow: "一旦失去信任，容易直接撤离。", group: "relational" },
    fox: { name: "灵狐", subtitle: "变局读取者", desire: "自由转向与理解局势", powers: ["适应", "观察", "策略转换"], shadow: "太会绕路时，可能延后真正的决定。", group: "adaptive" },
    deer: { name: "玄鹿", subtitle: "敏锐感知者", desire: "和谐、安全与清楚边界", powers: ["感受力", "审美", "避险"], shadow: "为了维持平衡，可能压下自己的真实需求。", group: "relational" },
    leopard: { name: "玄豹", subtitle: "单点突破者", desire: "掌控节奏与有效成果", powers: ["专注", "胆识", "爆发力"], shadow: "容易把效率放在关系与恢复之前。", group: "action" },
    crane: { name: "玄鹤", subtitle: "冷静观照者", desire: "秩序、清明与精神空间", powers: ["克制", "洞察", "抽离思考"], shadow: "过度抽离时，别人会读不到你的真实感受。", group: "adaptive" },
    whale: { name: "灵鲸", subtitle: "深水承载者", desire: "深度连接与内在稳定", powers: ["包容", "深度", "持续力"], shadow: "承接太多时，容易忘了先处理自己的负荷。", group: "relational" },
    horse: { name: "天马", subtitle: "自由行动者", desire: "移动、探索与不被束缚", powers: ["行动", "生命力", "开拓"], shadow: "不喜欢停滞，可能太快离开仍值得经营的事。", group: "action" },
  },
  en: {
    eagle: { name: "Eagle", subtitle: "High-level strategist", desire: "Autonomy and choice", powers: ["Independent judgement", "Long-range view", "Decisive action"], shadow: "Carrying everything alone can turn distance into a false sense of safety.", group: "action" },
    wolf: { name: "Wolf", subtitle: "Boundary-minded ally", desire: "Reliable alliances and loyalty", powers: ["Strategy", "Boundaries", "Team loyalty"], shadow: "Once trust breaks, you may leave before checking whether repair is possible.", group: "relational" },
    fox: { name: "Fox", subtitle: "Reader of change", desire: "Freedom to adapt and understand the situation", powers: ["Adaptability", "Observation", "Strategic pivots"], shadow: "Keeping too many options open can delay the decision that actually matters.", group: "adaptive" },
    deer: { name: "Deer", subtitle: "Sensitive perceiver", desire: "Harmony, safety and clean boundaries", powers: ["Sensitivity", "Aesthetic awareness", "Risk sensing"], shadow: "Protecting harmony can make you suppress what you genuinely need.", group: "relational" },
    leopard: { name: "Leopard", subtitle: "Focused breaker", desire: "Control of pace and effective results", powers: ["Focus", "Courage", "Burst power"], shadow: "Efficiency can move ahead of relationships and recovery.", group: "action" },
    crane: { name: "Crane", subtitle: "Calm observer", desire: "Order, clarity and mental space", powers: ["Restraint", "Insight", "Detached thinking"], shadow: "Too much distance can make your real feelings hard for others to read.", group: "adaptive" },
    whale: { name: "Whale", subtitle: "Deep carrier", desire: "Deep connection and inner stability", powers: ["Capacity", "Depth", "Persistence"], shadow: "When you carry too much, your own load can become the last thing you notice.", group: "relational" },
    horse: { name: "Horse", subtitle: "Free mover", desire: "Movement, exploration and freedom", powers: ["Action", "Vitality", "Opening new paths"], shadow: "Discomfort with stagnation can make you leave something that still deserves time.", group: "action" },
  },
};

const animalQuestion = (title: string, labels: [string, string, string, string], animals: [AnimalKey, AnimalKey, AnimalKey, AnimalKey]): AnimalQuestion => ({
  title,
  answers: labels.map((label, index) => ({ label, animal: animals[index] })) as AnimalAnswer[],
});

const ANIMAL_QUESTIONS: Record<Locale, AnimalQuestion[]> = {
  "zh-Hant": [
    animalQuestion("遇到一個陌生又重要的選擇，你第一反應是？", ["先拉高視角，看長期代價", "先找最可靠的人交換判斷", "先保留幾條路，邊走邊看", "先確認環境是否讓我舒服安全"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("工作卡住時，你比較像哪一種？", ["集中火力，直接破掉最關鍵的一點", "暫時抽離，重新整理整個結構", "慢慢承接，把問題沉到底再處理", "換地方、換方法，先讓事情動起來"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("你最受不了哪種關係？", ["控制我、替我做決定", "嘴上承諾很多，實際不可靠", "把所有事情定死，沒有轉圜", "情緒太粗暴，沒有分寸"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("面對衝突，你更常怎麼做？", ["抓核心問題，直接解決", "先冷卻，不在情緒高點處理", "先理解彼此真正介意的是什麼", "不值得耗就離開現場"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("如果突然多出一整天空白時間，你會？", ["做一直想做、但沒人替我決定的事", "和自己認定的人待在一起", "隨機探索新東西", "去安靜漂亮的地方恢復感受"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("別人最容易低估你的地方是？", ["真正出手時的狠準", "我其實看得比說得多", "我能承受和消化很多複雜情緒", "我看似隨性，其實很敢開新路"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("你做重大決策時最信任什麼？", ["自己的整體判斷", "長期驗證過的人和承諾", "環境裡細小但真實的訊號", "身體與直覺告訴我的舒適或不適"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("當壓力很大，你最可能出現什麼狀態？", ["更強勢、更想控制進度", "變安靜，自己消化", "先承擔，直到真的累了才說", "想立刻換環境或出去走"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("理想的合作方式是？", ["給我目標和權限，不要微管理", "角色清楚、彼此可靠、長期合作", "允許快速調整，不要流程綁死", "尊重節奏與感受，不靠壓迫推進"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("你最看重自己的哪種能力？", ["關鍵時刻敢做決定", "不被表面帶走，能看清本質", "能理解深層情緒與複雜人性", "不怕重新開始"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("你希望別人怎麼理解你？", ["我不是難搞，我只是需要自主", "我不是冷，我只把信任給少數人", "我不是飄，我只是不喜歡把自己鎖死", "我不是脆弱，我只是感受得很細"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("如果只能保留一種人生能力，你選？", ["突破", "看清", "承載", "自由移動"], ["leopard", "crane", "whale", "horse"]),
  ],
  "zh-Hans": [
    animalQuestion("遇到一个陌生又重要的选择，你第一反应是？", ["先拉高视角，看长期代价", "先找最可靠的人交换判断", "先保留几条路，边走边看", "先确认环境是否让我舒服安全"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("工作卡住时，你比较像哪一种？", ["集中火力，直接破掉最关键的一点", "暂时抽离，重新整理整个结构", "慢慢承接，把问题沉到底再处理", "换地方、换方法，先让事情动起来"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("你最受不了哪种关系？", ["控制我、替我做决定", "嘴上承诺很多，实际不可靠", "把所有事情定死，没有转圜", "情绪太粗暴，没有分寸"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("面对冲突，你更常怎么做？", ["抓核心问题，直接解决", "先冷却，不在情绪高点处理", "先理解彼此真正介意的是什么", "不值得耗就离开现场"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("如果突然多出一整天空白时间，你会？", ["做一直想做、但没人替我决定的事", "和自己认定的人待在一起", "随机探索新东西", "去安静漂亮的地方恢复感受"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("别人最容易低估你的地方是？", ["真正出手时的狠准", "我其实看得比说得多", "我能承受和消化很多复杂情绪", "我看似随性，其实很敢开新路"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("你做重大决策时最信任什么？", ["自己的整体判断", "长期验证过的人和承诺", "环境里细小但真实的信号", "身体与直觉告诉我的舒适或不适"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("当压力很大，你最可能出现什么状态？", ["更强势、更想控制进度", "变安静，自己消化", "先承担，直到真的累了才说", "想立刻换环境或出去走"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("理想的合作方式是？", ["给我目标和权限，不要微管理", "角色清楚、彼此可靠、长期合作", "允许快速调整，不要流程绑死", "尊重节奏与感受，不靠压迫推进"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("你最看重自己的哪种能力？", ["关键时刻敢做决定", "不被表面带走，能看清本质", "能理解深层情绪与复杂人性", "不怕重新开始"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("你希望别人怎么理解你？", ["我不是难搞，我只是需要自主", "我不是冷，我只把信任给少数人", "我不是飘，我只是不喜欢把自己锁死", "我不是脆弱，我只是感受得很细"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("如果只能保留一种人生能力，你选？", ["突破", "看清", "承载", "自由移动"], ["leopard", "crane", "whale", "horse"]),
  ],
  en: [
    animalQuestion("When an unfamiliar but important choice appears, what do you do first?", ["Step back and judge the long-term cost", "Check it with the person I trust most", "Keep several paths open and learn as I go", "First check whether the environment feels safe and right"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("When work gets stuck, which response sounds most like you?", ["Focus hard and break the key blockage", "Step back and rebuild the structure", "Carry it patiently until I understand the deeper problem", "Change the setting or method and get things moving"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("Which kind of relationship frustrates you most?", ["Someone controlling me or deciding for me", "Promises without reliability", "Everything fixed with no room to adapt", "Harsh emotion with no sense of proportion"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("How do you usually handle conflict?", ["Find the core issue and solve it directly", "Cool down before dealing with it", "Understand what each person actually cares about", "Leave if the situation is not worth the drain"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("If you suddenly had a completely free day, what would you choose?", ["Do something I have wanted to choose for myself", "Spend it with people I genuinely trust", "Explore something new without a fixed plan", "Go somewhere quiet and beautiful to reset"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("What do people underestimate about you?", ["How precise and forceful I can be when I act", "I notice far more than I say", "I can hold a lot of emotional complexity", "I may look casual, but I am willing to open a new path"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("What do you trust most in a major decision?", ["My overall judgement", "People and commitments that have proved reliable over time", "Small but real signals in the situation", "What my body and intuition tell me about comfort or unease"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("Under heavy pressure, what are you most likely to do?", ["Become more forceful and control the pace", "Go quiet and process it alone", "Carry the load until I am genuinely exhausted", "Want to change the environment immediately"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("What is your ideal way to collaborate?", ["Give me the goal and authority; do not micromanage", "Clear roles, reliability and long-term trust", "Room to adjust quickly without rigid process", "Respect for pace and feeling, without pressure tactics"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("Which ability do you value most in yourself?", ["Making a decision when it matters", "Seeing past appearances to the real issue", "Understanding deep emotion and complex people", "Being willing to begin again"], ["leopard", "crane", "whale", "horse"]),
    animalQuestion("How would you most like people to understand you?", ["I am not difficult; I need autonomy", "I am not cold; I give trust selectively", "I am not aimless; I dislike locking myself in too early", "I am not fragile; I simply notice a lot"], ["eagle", "wolf", "fox", "deer"]),
    animalQuestion("If you could keep only one life skill, which would you choose?", ["Breakthrough", "Clarity", "Capacity", "Freedom to move"], ["leopard", "crane", "whale", "horse"]),
  ],
};

function guardianGroup(element: string): AnimalGroup {
  if (element === "火") return "action";
  if (element === "土") return "relational";
  return "adaptive";
}

function relationLabel(locale: Locale, innerGroup: AnimalGroup, outerGroup: AnimalGroup) {
  if (innerGroup === outerGroup) return {
    title: tr(locale, "策略一致", "策略一致", "Aligned patterns"),
    text: tr(locale, "你現在最常使用的人格策略，和命局瑞獸象徵的底層走向接近。優勢容易被放大，盲點也要一起留意。", "你现在最常使用的人格策略，和命局瑞兽象征的底层走向接近。优势容易被放大，盲点也要一起留意。", "Your current behaviour strategy is close to the underlying pattern represented by your chart guardian beast. Strengths are reinforced, so watch the same pattern when it becomes excessive."),
  };
  if ((innerGroup === "action" && outerGroup === "adaptive") || (innerGroup === "adaptive" && outerGroup === "relational")) return {
    title: tr(locale, "互相補位", "互相补位", "Complementary patterns"),
    text: tr(locale, "你的後天做法和命局底色不是同一種力量，但能互相補位：一邊負責開路，一邊負責校準或承載。", "你的后天做法和命局底色不是同一种力量，但能互相补位：一边负责开路，一边负责校准或承载。", "Your learned behaviour and underlying chart pattern use different strengths, but they can support each other—one moves, while the other calibrates or carries."),
  };
  return {
    title: tr(locale, "不同路線", "不同路线", "Different patterns"),
    text: tr(locale, "你的日常人格策略與命局底色走不同路線。這表示你發展出一套後天應對方式，不代表哪一面比較真。", "你的日常人格策略与命局底色走不同路线。这表示你发展出一套后天应对方式，不代表哪一面比较真。", "Your everyday strategy and underlying chart pattern take different routes. This suggests a learned way of coping; it does not mean one side is more 'real' than the other."),
  };
}

function scoreAnimal(answers: AnimalKey[]) {
  const keys = Object.keys(ANIMALS["zh-Hant"]) as AnimalKey[];
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<AnimalKey, number>;
  for (const key of answers) counts[key] += 1;
  return keys.sort((a, b) => counts[b] - counts[a])[0] ?? "eagle";
}

function FunTests() {
  const { locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const [mode, setMode] = useState<QuizMode>("menu");
  const [animalIndex, setAnimalIndex] = useState(0);
  const [animalAnswers, setAnimalAnswers] = useState<AnimalKey[]>([]);
  const [elementIndex, setElementIndex] = useState(0);
  const [elementAnswers, setElementAnswers] = useState<FiveElementKey[]>([]);

  const animalQuestions = ANIMAL_QUESTIONS[locale];
  const animalResultKey = animalAnswers.length === animalQuestions.length ? scoreAnimal(animalAnswers) : null;
  const inner = animalResultKey ? ANIMALS[locale][animalResultKey] : null;
  const guardian = current ? deriveGuardianBeast(current.chart, locale) : null;
  const relation = inner && guardian ? relationLabel(locale, inner.group, guardianGroup(guardian.element)) : null;

  const elementQuestions = FIVE_ELEMENT_QUESTIONS[locale];
  const elementScore = useMemo(() => scoreFiveElementAnswers(elementAnswers), [elementAnswers]);
  const elementUi = FIVE_ELEMENT_UI[locale];
  const elementResult = elementScore ? FIVE_ELEMENT_RESULTS[locale][elementScore.primary] : null;
  const elementSupport = elementScore?.secondary ? FIVE_ELEMENT_RESULTS[locale][elementScore.secondary] : null;

  const pageCopy = {
    kicker: tr(locale, "趣味測驗", "趣味测验", "FUN TESTS"),
    title: tr(locale, "昭梧趣味測驗系列", "昭梧趣味测验系列", "Zhaowu self-tests"),
    lead: tr(locale, "從你現在的行為、選擇與狀態認識自己；自評歸自評，不把趣味測驗冒充命盤。", "从你现在的行为、选择与状态认识自己；自评归自评，不把趣味测验冒充命盘。", "Short self-tests about how you are behaving and coping right now. They are not substitutes for a birth-chart reading."),
    learn: tr(locale, "你會知道", "你会知道", "You’ll learn"),
    best: tr(locale, "最擅長看", "最擅长看", "Best for"),
    start: tr(locale, "開始測驗", "开始测验", "Start test"),
    animalTitle: tr(locale, "內在動物 × 命局瑞獸", "内在动物 × 命局瑞兽", "Inner Animal × Guardian Beast"),
    animalLearn: tr(locale, "你現在最常使用的人格策略，以及壓力下最自然的反應。", "你现在最常使用的人格策略，以及压力下最自然的反应。", "The personality strategy you use most now and your instinctive response under pressure."),
    animalBest: tr(locale, "後天行為偏好、決策方式；已有命盤時可再和命局瑞獸交叉看。", "后天行为偏好、决策方式；已有命盘时可再和命局瑞兽交叉看。", "Learned behaviour, decision style and—when a chart exists—how that compares with your guardian-beast pattern."),
    elementTitle: elementUi.title,
    elementLearn: tr(locale, "你現在更需要生長、啟動、落地、收斂，還是恢復。", "你现在更需要生长、启动、落地、收敛，还是恢复。", "Whether you currently need more growth, activation, follow-through, boundaries or recovery."),
    elementBest: tr(locale, "把最近 1–3 個月的卡點，轉成一個可以立即練習的功能方向。", "把最近 1–3 个月的卡点，转成一个可以立即练习的功能方向。", "Turning your current 1–3 month bottleneck into one practical function to train."),
    animalCore: tr(locale, "核心需求", "核心需求", "Core need"),
    animalStrength: tr(locale, "強項", "强项", "Strengths"),
    animalShadow: tr(locale, "容易過度的地方", "容易过度的地方", "Watch when overused"),
    guardianTitle: tr(locale, "命局瑞獸", "命局瑞兽", "Chart guardian beast"),
    needChart: tr(locale, "要和命局瑞獸交叉看，還差你的命盤。", "要和命局瑞兽交叉看，还差你的命盘。", "To compare this with your guardian beast, you still need a BaZi chart."),
    needChartBody: tr(locale, "先回首頁完成一次八字分析。命盤生成後再回來，不需要重做題目。", "先回首页完成一次八字分析。命盘生成后再回来，不需要重做题目。", "Run a BaZi analysis on the home page first. Once the chart exists, come back—you will not need to retake the questions."),
    home: tr(locale, "回首頁建立命盤", "回首页建立命盘", "Create my chart"),
    restart: tr(locale, "重新測一次", "重新测一次", "Take the test again"),
    menu: tr(locale, "回到趣味測驗", "回到趣味测验", "Back to fun tests"),
  };

  function startAnimal() {
    setAnimalAnswers([]);
    setAnimalIndex(0);
    setMode("animal");
  }

  function chooseAnimal(animal: AnimalKey) {
    const next = [...animalAnswers, animal];
    setAnimalAnswers(next);
    if (animalIndex < animalQuestions.length - 1) setAnimalIndex(animalIndex + 1);
    if (next.length === animalQuestions.length && typeof window !== "undefined") {
      const result = scoreAnimal(next);
      try {
        window.localStorage.setItem("zhaowu-inner-animal-v1", JSON.stringify({ animal: result, answers: next, completedAt: new Date().toISOString() }));
      } catch {
        // Result still renders if private browsing blocks storage.
      }
    }
  }

  function startElement() {
    setElementAnswers([]);
    setElementIndex(0);
    setMode("element");
  }

  function chooseElement(element: FiveElementKey) {
    const next = [...elementAnswers, element];
    setElementAnswers(next);
    if (elementIndex < elementQuestions.length - 1) setElementIndex(elementIndex + 1);
    if (next.length !== elementQuestions.length || typeof window === "undefined") return;
    const score = scoreFiveElementAnswers(next);
    if (!score) return;
    const result = FIVE_ELEMENT_RESULTS[locale][score.primary];
    const support = score.secondary ? FIVE_ELEMENT_RESULTS[locale][score.secondary] : null;
    try {
      window.localStorage.setItem("zhaowu-five-element-function-v1", JSON.stringify({ ...score, answers: next, locale, completedAt: new Date().toISOString() }));
    } catch {
      // Result still renders if private browsing blocks storage.
    }
    saveSpecialistHistory({
      kind: "fun-five-element",
      locale,
      sourcePath: "/fun-tests",
      title: `${result.name}｜${result.title}`,
      inputSummary: tr(locale, "五行功能傾向測驗 · 最近 1–3 個月", "五行功能倾向测验 · 最近 1–3 个月", "Five-Element Function Test · current 1–3 months"),
      sections: [
        { title: elementUi.resultKicker, body: result.core },
        { title: elementUi.actionsTitle, body: result.actions.join("\n") },
        { title: elementUi.observeTitle, body: result.observe },
        { title: elementUi.excessTitle, body: `${score.overdrive ? `${elementUi.overdrive}\n` : ""}${result.excess}` },
        ...(support ? [{ title: elementUi.supportTitle, body: support.support }] : []),
        { title: elementUi.auraTitle, body: `${result.aura.primary} · ${result.aura.secondary.join(" / ")} · ${result.aura.base}\n${result.aura.text}` },
      ],
      closing: elementUi.disclaimer,
    });
  }

  function backToMenu() {
    setMode("menu");
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 pb-16">
      <header className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
        <p className="text-xs tracking-[0.28em] text-cinnabar">ZHAOWU · {pageCopy.kicker}</p>
        <h1 className="mt-2 font-display text-3xl text-ink">{pageCopy.title}</h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">{pageCopy.lead}</p>
      </header>

      {mode === "menu" ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={startAnimal} className="seal-border rounded-2xl bg-paper p-5 text-left shadow-sm">
            <span className="text-xs tracking-[0.22em] text-cinnabar">SERIES 01</span>
            <strong className="mt-2 block font-display text-2xl text-ink">{pageCopy.animalTitle}</strong>
            <span className="mt-4 block text-sm leading-6 text-ink-soft"><b className="text-ink">{pageCopy.learn}：</b>{pageCopy.animalLearn}</span>
            <span className="mt-2 block text-sm leading-6 text-ink-soft"><b className="text-ink">{pageCopy.best}：</b>{pageCopy.animalBest}</span>
            <span className="mt-4 inline-block text-sm text-cinnabar">{pageCopy.start} →</span>
          </button>
          <button type="button" onClick={startElement} className="seal-border rounded-2xl bg-paper p-5 text-left shadow-sm">
            <span className="text-xs tracking-[0.22em] text-cinnabar">SERIES 02 · {elementUi.kicker}</span>
            <strong className="mt-2 block font-display text-2xl text-ink">{pageCopy.elementTitle}</strong>
            <span className="mt-4 block text-sm leading-6 text-ink-soft"><b className="text-ink">{pageCopy.learn}：</b>{pageCopy.elementLearn}</span>
            <span className="mt-2 block text-sm leading-6 text-ink-soft"><b className="text-ink">{pageCopy.best}：</b>{pageCopy.elementBest}</span>
            <span className="mt-4 inline-block text-sm text-cinnabar">{pageCopy.start} →</span>
          </button>
        </section>
      ) : null}

      {mode === "animal" && !inner ? (
        <section className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
          <button type="button" onClick={backToMenu} className="mb-4 text-sm text-cinnabar">← {pageCopy.menu}</button>
          <div className="flex items-center justify-between gap-4 text-xs text-ink-mute"><span>{pageCopy.animalTitle}</span><span>{animalIndex + 1} / {animalQuestions.length}</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-deep"><div className="h-full bg-cinnabar transition-all" style={{ width: `${((animalIndex + 1) / animalQuestions.length) * 100}%` }} /></div>
          <h2 className="mt-6 font-display text-2xl leading-9 text-ink">{animalQuestions[animalIndex].title}</h2>
          <div className="mt-5 grid gap-3">
            {animalQuestions[animalIndex].answers.map((answer) => (
              <button key={answer.label} type="button" onClick={() => chooseAnimal(answer.animal)} className="min-h-12 rounded-xl border border-line bg-paper px-4 py-4 text-left text-[15px] leading-6 text-ink transition hover:border-cinnabar/50">{answer.label}</button>
            ))}
          </div>
        </section>
      ) : null}

      {mode === "animal" && inner ? (
        <section className="space-y-4">
          <article className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
            <p className="text-xs tracking-[0.25em] text-cinnabar">INNER ANIMAL</p>
            <h2 className="mt-2 font-display text-3xl text-ink">{inner.name} · {inner.subtitle}</h2>
            <p className="mt-4 text-sm leading-7 text-ink-soft"><b className="text-ink">{pageCopy.animalCore}：</b>{inner.desire}</p>
            <p className="mt-4 text-sm font-semibold text-ink">{pageCopy.animalStrength}</p>
            <div className="mt-2 flex flex-wrap gap-2">{inner.powers.map((power) => <span key={power} className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink">{power}</span>)}</div>
            <p className="mt-4 text-sm leading-7 text-ink-soft"><b className="text-ink">{pageCopy.animalShadow}：</b>{inner.shadow}</p>
          </article>

          {guardian && relation ? (
            <article className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
              <p className="text-xs tracking-[0.25em] text-cinnabar">INNATE GUARDIAN BEAST</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{pageCopy.guardianTitle} · {guardian.name}</h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">{guardian.rationale}</p>
              <div className="mt-5 rounded-xl border border-line bg-cream/80 p-4">
                <strong className="font-display text-xl text-ink">{relation.title}</strong>
                <p className="mt-2 text-sm leading-7 text-ink-soft">{relation.text}</p>
              </div>
            </article>
          ) : (
            <article className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
              <strong className="font-display text-xl text-ink">{pageCopy.needChart}</strong>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{pageCopy.needChartBody}</p>
              <Link to="/" className="mt-4 inline-flex rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">{pageCopy.home}</Link>
            </article>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={startAnimal} className="min-h-12 rounded-full border border-line bg-cream px-5 py-3 text-sm text-ink">{pageCopy.restart}</button>
            <button type="button" onClick={backToMenu} className="min-h-12 rounded-full border border-line bg-paper px-5 py-3 text-sm text-ink">{pageCopy.menu}</button>
          </div>
        </section>
      ) : null}

      {mode === "element" && !elementResult ? (
        <section className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
          <button type="button" onClick={backToMenu} className="mb-4 text-sm text-cinnabar">← {elementUi.back}</button>
          <div className="flex items-center justify-between gap-4 text-xs text-ink-mute"><span>{elementUi.progress}</span><span>{elementIndex + 1} / {elementQuestions.length}</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-deep"><div className="h-full bg-cinnabar transition-all" style={{ width: `${((elementIndex + 1) / elementQuestions.length) * 100}%` }} /></div>
          <h2 className="mt-6 font-display text-2xl leading-9 text-ink">{elementQuestions[elementIndex].title}</h2>
          <div className="mt-5 grid gap-3">
            {elementQuestions[elementIndex].answers.map((answer) => (
              <button key={answer.label} type="button" onClick={() => chooseElement(answer.element)} className="min-h-12 rounded-xl border border-line bg-paper px-4 py-4 text-left text-[15px] leading-6 text-ink transition hover:border-cinnabar/50">{answer.label}</button>
            ))}
          </div>
        </section>
      ) : null}

      {mode === "element" && elementScore && elementResult ? (
        <section className="space-y-4">
          <article className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
            <p className="text-xs tracking-[0.25em] text-cinnabar">{elementUi.resultKicker}</p>
            <h2 className="mt-2 font-display text-3xl text-ink">{elementResult.name}｜{elementResult.title}</h2>
            <p className="mt-4 text-[15px] leading-7 text-ink-soft">{elementResult.core}</p>
            {elementScore.overdrive ? <p className="mt-4 rounded-xl border border-cinnabar/25 bg-paper px-4 py-3 text-sm leading-6 text-ink">{elementUi.overdrive}</p> : null}
          </article>

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
            <h3 className="font-display text-xl text-ink">{elementUi.actionsTitle}</h3>
            <ol className="mt-3 grid gap-2 text-sm leading-6 text-ink-soft">{elementResult.actions.map((action, index) => <li key={action}><b className="mr-2 text-cinnabar">{index + 1}.</b>{action}</li>)}</ol>
            <h3 className="mt-6 font-display text-xl text-ink">{elementUi.observeTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{elementResult.observe}</p>
            <h3 className="mt-6 font-display text-xl text-ink">{elementUi.excessTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{elementResult.excess}</p>
            {elementSupport ? <><h3 className="mt-6 font-display text-xl text-ink">{elementUi.supportTitle}</h3><p className="mt-2 text-sm leading-7 text-ink-soft">{elementSupport.support}</p></> : null}
          </article>

          <article className="seal-border rounded-2xl bg-cream/90 p-5 sm:p-8">
            <p className="text-xs tracking-[0.22em] text-cinnabar">{elementUi.auraTitle}</p>
            <h3 className="mt-2 font-display text-2xl text-ink">{elementResult.aura.primary} · {elementResult.aura.secondary.join(" / ")} · {elementResult.aura.base}</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{elementResult.aura.text}</p>
            <p className="mt-5 border-t border-line pt-4 text-xs leading-6 text-ink-mute">{elementUi.disclaimer}</p>
          </article>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={startElement} className="min-h-12 rounded-full border border-line bg-cream px-5 py-3 text-sm text-ink">{elementUi.restart}</button>
            <button type="button" onClick={backToMenu} className="min-h-12 rounded-full border border-line bg-paper px-5 py-3 text-sm text-ink">{elementUi.back}</button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
