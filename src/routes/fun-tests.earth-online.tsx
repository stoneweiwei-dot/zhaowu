import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";
import "../earth-online-quiz.css";

export const Route = createFileRoute("/fun-tests/earth-online")({ component: EarthOnlineQuiz });

type BookKey =
  | "dao"
  | "yi"
  | "zhuang"
  | "neijing"
  | "bencao"
  | "lunyu"
  | "sunzi"
  | "strategems"
  | "shiji"
  | "caigen";

type BookProfile = {
  title: string;
  system: string;
  use: string;
  summary: string;
  action: string;
  dlc: string;
  rarity: number;
};

type Answer = { label: string; book: BookKey };
type Question = { title: string; answers: Answer[] };

type Copy = {
  back: string;
  kicker: string;
  title: string;
  lead: string;
  premise: string;
  start: string;
  progress: string;
  resultKicker: string;
  mainQuest: string;
  dualQuest: string;
  sideQuest: string;
  hiddenDlc: string;
  currentUse: string;
  rarity: string;
  today: string;
  restart: string;
  articleKicker: string;
  articleTitle: string;
  articleLead: string;
  disclaimer: string;
  menu: string;
};

const tr = (locale: Locale, hant: string, hans: string, en: string) =>
  locale === "en" ? en : locale === "zh-Hans" ? hans : hant;

const BOOKS: Record<Locale, Record<BookKey, BookProfile>> = {
  "zh-Hant": {
    dao: { title: "《道德經》", system: "底層規則", use: "放下無效控制 · 重整用力方式", summary: "你現在可能不是不夠努力，而是有些地方用力過頭。這本書適合拿來重新辨認：哪些事值得推進，哪些事越硬推越失去餘地。", action: "挑一件最近反覆硬推卻沒有變好的事，寫下：如果少做一步，局面會不會反而更清楚？", dlc: "《金剛經／心經》", rarity: 5 },
    yi: { title: "《易經》", system: "時位與變化", use: "判斷時機 · 看清局勢轉折", summary: "你真正缺的可能不是答案，而是對『現在處於哪個階段』的判斷。適合把決策放回時間、位置與變化之中，而不是只問對錯。", action: "把眼前的一個選擇拆成三欄：現在、再等一段時間、錯過之後，各自的代價是什麼？", dlc: "《傳習錄》", rarity: 5 },
    zhuang: { title: "《莊子》", system: "視角切換", use: "解除比較 · 鬆動執著", summary: "你現在需要的未必是更強的執行力，而是把尺度拉遠。當一件事被放進更大的時間與人生背景，它可能不再值得你耗掉全部精神。", action: "挑一件最近非常在意的事，問自己：三年後回頭看，它還有現在這麼大嗎？", dlc: "《金剛經／心經》", rarity: 5 },
    neijing: { title: "《黃帝內經》", system: "生命值管理", use: "節律 · 勞逸 · 身體資源", summary: "你的主線不是再開新任務，而是先把角色電量顧回來。這裡取的是古典生活節律與『治未病』思路，不把古籍當成現代醫療替代品。", action: "先只處理一個最明顯的耗損源：睡眠、進食節奏、久坐或過度工作，連續觀察七天。", dlc: "《本草綱目》", rarity: 4 },
    bencao: { title: "《本草綱目》", system: "材料圖鑑", use: "辨物 · 日常材料知識", summary: "你對具體材料、飲食與自然物的知識需求較強。適合把它當歷史性的博物與藥物知識總集來讀，而不是把古代療法直接照搬到今天。", action: "從一種你每天都會接觸的食材或植物開始，分開查它的古代記載與現代證據，不把兩者混為一談。", dlc: "《黃帝內經》", rarity: 4 },
    lunyu: { title: "《論語》", system: "角色與信任", use: "人際秩序 · 合作 · 分寸", summary: "你目前的難題比較像『人和位置』。不是討好別人，而是理解在家庭、工作與合作中，什麼叫可信、守分、有效地承擔自己的角色。", action: "選一段最消耗你的關係，寫下：我的責任、對方的責任、其實不該由我承擔的責任。", dlc: "《傳習錄》", rarity: 4 },
    sunzi: { title: "《孫子兵法》", system: "競爭策略", use: "資源配置 · 先勝後戰", summary: "你面對的是需要判局、分配資源或談判的現實問題。最值得讀的不是奇招，而是先算條件、避開低勝率消耗，再決定要不要出手。", action: "下一個重要行動之前，先列出：目標、資源、對方優勢、自己優勢、可以不打的部分。", dlc: "《資治通鑑》", rarity: 5 },
    strategems: { title: "《三十六計》", system: "弱勢博弈", use: "迂迴 · 避險 · 脫困", summary: "你對資源不對等、複雜人際或退路特別敏感。把它當成歷史策略語彙與案例索引較合適，而不是把每段關係都看成算計。", action: "面對一件資源不對等的事，先找第三條路：不正面硬碰，也不立刻投降，還有哪些可逆選項？", dlc: "《鬼谷子》", rarity: 4 },
    shiji: { title: "《史記》", system: "人性案例庫", use: "識人 · 權力 · 成敗模式", summary: "你現在最需要的可能不是抽象道理，而是真人如何在利益、忠誠、野心、恐懼與局勢裡做選擇。歷史的價值，是增加你辨認模式的樣本。", action: "找一個你最近看不懂的人，不猜他的性格，先只列他的利益、風險、選擇與實際行動。", dlc: "《資治通鑑》", rarity: 5 },
    caigen: { title: "《菜根譚》", system: "心態校準", use: "進退 · 得失 · 日常修心", summary: "你未必遇到單一大危機，更像是在學習怎麼不被每一次成敗拖走。這本書適合零碎讀，讓自己在得失與進退之間多一點緩衝。", action: "今天遇到一件不順時，先延遲十分鐘再回應；不是壓抑，而是讓情緒不要替你做第一個決定。", dlc: "《圍爐夜話》", rarity: 4 },
  },
  "zh-Hans": {} as Record<BookKey, BookProfile>,
  en: {} as Record<BookKey, BookProfile>,
};

BOOKS["zh-Hans"] = Object.fromEntries(
  Object.entries(BOOKS["zh-Hant"]).map(([key, value]) => [key, { ...value,
    title: value.title.replace("《黃帝內經》", "《黄帝内经》").replace("《道德經》", "《道德经》").replace("《易經》", "《易经》").replace("《莊子》", "《庄子》").replace("《本草綱目》", "《本草纲目》").replace("《論語》", "《论语》").replace("《孫子兵法》", "《孙子兵法》").replace("《三十六計》", "《三十六计》").replace("《史記》", "《史记》").replace("《菜根譚》", "《菜根谭》"),
    system: tr("zh-Hans", value.system, value.system.replace("與", "与"), value.system),
    use: value.use.replaceAll(" · ", " · "),
    dlc: value.dlc.replace("經", "经").replace("傳習錄", "传习录").replace("資治通鑑", "资治通鉴").replace("鬼谷子", "鬼谷子").replace("圍爐夜話", "围炉夜话"),
  }])
) as Record<BookKey, BookProfile>;

BOOKS.en = {
  dao: { title: "Tao Te Ching", system: "Underlying rules", use: "Release futile control · redirect effort", summary: "Your problem may not be too little effort, but effort applied where force makes the situation narrower. Read it to reconsider what needs action and what needs room.", action: "Choose one situation you keep forcing. Ask what would become clearer if you deliberately did one step less.", dlc: "Heart Sutra / Diamond Sutra", rarity: 5 },
  yi: { title: "I Ching", system: "Timing and change", use: "Timing · transitions · position", summary: "You may need a better model of where the situation is in its cycle, rather than a simple yes or no. It is most useful as a classical language of change and position.", action: "For one decision, compare the cost of acting now, waiting, and missing the window entirely.", dlc: "Instructions for Practical Living", rarity: 5 },
  zhuang: { title: "Zhuangzi", system: "Perspective shift", use: "Comparison · attachment · scale", summary: "You may need distance more than more productivity. A change of scale can turn an all-consuming problem into something that no longer deserves all of your attention.", action: "Pick one issue that feels huge today. Ask whether it will still carry the same weight when viewed three years from now.", dlc: "Heart Sutra / Diamond Sutra", rarity: 5 },
  neijing: { title: "Huangdi Neijing", system: "Energy management", use: "Rhythm · rest · bodily resources", summary: "Your next quest may be recovery rather than expansion. Treat this as a historical framework for rhythm and preventive thinking, not a substitute for modern medical care.", action: "Choose one obvious drain—sleep, meal rhythm, prolonged sitting or overwork—and observe it consistently for seven days.", dlc: "Compendium of Materia Medica", rarity: 4 },
  bencao: { title: "Compendium of Materia Medica", system: "Materials atlas", use: "Things · foods · natural materials", summary: "You are drawn to concrete knowledge about materials, plants and daily substances. Read it as a historical compendium, while keeping ancient claims separate from modern evidence.", action: "Choose one familiar ingredient or plant and compare its historical record with current evidence without treating them as the same thing.", dlc: "Huangdi Neijing", rarity: 4 },
  lunyu: { title: "Analects", system: "Roles and trust", use: "Relationships · cooperation · boundaries", summary: "Your current problem is about people and positions. The useful question is not how to please everyone, but how trust, responsibility and conduct work in recurring relationships.", action: "For one draining relationship, separate your responsibility, their responsibility and what was never yours to carry.", dlc: "Instructions for Practical Living", rarity: 4 },
  sunzi: { title: "The Art of War", system: "Competitive strategy", use: "Resources · leverage · conditions", summary: "Your situation requires judgement under competition or constraint. Its strongest lesson is not clever tricks but improving the conditions before committing resources.", action: "Before your next major move, list the goal, your resources, their advantage, your advantage and what does not need to be fought at all.", dlc: "Zizhi Tongjian", rarity: 5 },
  strategems: { title: "Thirty-Six Stratagems", system: "Asymmetric strategy", use: "Detours · exits · risk", summary: "You are sensitive to unequal resources and complicated manoeuvring. Read it as a vocabulary of historical tactics, not as proof that every relationship is a scheme.", action: "For one unequal situation, find a third route that is neither frontal collision nor immediate surrender.", dlc: "Guiguzi", rarity: 4 },
  shiji: { title: "Records of the Grand Historian", system: "Human case library", use: "People · power · recurring patterns", summary: "You may learn more from lived cases than abstract rules. History adds samples of how people choose under ambition, loyalty, fear, incentives and changing circumstances.", action: "For one person you cannot read, stop guessing personality for a moment and list incentives, risks, available choices and observed actions.", dlc: "Zizhi Tongjian", rarity: 5 },
  caigen: { title: "Caigentan", system: "Mindset calibration", use: "Gain and loss · advance and retreat", summary: "You may not have one dramatic crisis; the task is to stop every win and loss from carrying your whole sense of self with it. This is a book for small, repeated recalibration.", action: "When something goes wrong today, delay your response by ten minutes so the first emotion does not make the first decision.", dlc: "Weilu Yehua", rarity: 4 },
};

const QUESTIONS: Record<Locale, Question[]> = {
  "zh-Hant": [
    { title: "最近最困擾你的事情，比較像哪一種？", answers: [
      { label: "身體很累、生活節奏亂，總覺得電量不足", book: "neijing" },
      { label: "面前有幾條路，但不知道什麼時候該動", book: "yi" },
      { label: "越來越看不懂人，常搞不清別人在想什麼", book: "shiji" },
      { label: "事情未必很糟，但自己的腦子停不下來", book: "zhuang" },
    ] },
    { title: "遇到難題時，你現在最缺的是什麼？", answers: [
      { label: "看清局勢，別再亂出招", book: "sunzi" },
      { label: "知道什麼事情其實根本不用硬做", book: "dao" },
      { label: "把人際關係和自己的位置重新理順", book: "lunyu" },
      { label: "不要因為一次成敗，把整個人拖進去", book: "caigen" },
    ] },
    { title: "如果今天只能改善一件事，你最想先處理：", answers: [
      { label: "作息、精力、身體狀態", book: "neijing" },
      { label: "飲食、日常材料與植物知識", book: "bencao" },
      { label: "工作競爭、談判、資源配置", book: "sunzi" },
      { label: "情緒、比較心、執著", book: "zhuang" },
    ] },
    { title: "你做重大決定時，最容易出現哪個問題？", answers: [
      { label: "不知道現在究竟是不是時機", book: "yi" },
      { label: "沒有先算清楚資源和對手", book: "sunzi" },
      { label: "總是事後才發現：人原來會這樣選", book: "shiji" },
      { label: "明明控制不了，還是一直想控制", book: "dao" },
    ] },
    { title: "你現在最想補哪一堂『社會生存課』？", answers: [
      { label: "看懂權力、人性與成敗", book: "shiji" },
      { label: "知道怎麼做人、合作與建立信任", book: "lunyu" },
      { label: "在明顯弱勢時，怎麼避免被牽著走", book: "strategems" },
      { label: "怎麼不被別人的評價和比較綁架", book: "zhuang" },
    ] },
    { title: "如果人生是一個角色養成遊戲，你現在最缺的屬性是：", answers: [
      { label: "體力值", book: "neijing" },
      { label: "生存素材知識", book: "bencao" },
      { label: "心態穩定度", book: "caigen" },
      { label: "對整個遊戲規則的理解", book: "dao" },
    ] },
    { title: "你現在最想從書裡得到哪種東西？", answers: [
      { label: "世界底層規律與反直覺提醒", book: "dao" },
      { label: "大量真人成敗案例", book: "shiji" },
      { label: "能拿去用的策略框架", book: "sunzi" },
      { label: "一兩句就能讓自己慢下來的提醒", book: "caigen" },
    ] },
    { title: "你現在最怕哪一種『翻車』？", answers: [
      { label: "在錯的時間做對的事情", book: "yi" },
      { label: "被別人算計了才發現", book: "strategems" },
      { label: "事情還沒做成，人先耗光了", book: "neijing" },
      { label: "一直活在比較與執念裡", book: "zhuang" },
    ] },
  ],
  "zh-Hans": [],
  en: [],
};

QUESTIONS["zh-Hans"] = QUESTIONS["zh-Hant"].map((q) => ({
  title: q.title
    .replace("最近最困擾你的事情，比較像哪一種？", "最近最困扰你的事情，比较像哪一种？")
    .replace("遇到難題時，你現在最缺的是什麼？", "遇到难题时，你现在最缺的是什么？")
    .replace("如果今天只能改善一件事，你最想先處理：", "如果今天只能改善一件事，你最想先处理：")
    .replace("你做重大決定時，最容易出現哪個問題？", "你做重大决定时，最容易出现哪个问题？")
    .replace("你現在最想補哪一堂『社會生存課』？", "你现在最想补哪一堂『社会生存课』？")
    .replace("如果人生是一個角色養成遊戲，你現在最缺的屬性是：", "如果人生是一个角色养成游戏，你现在最缺的属性是：")
    .replace("你現在最想從書裡得到哪種東西？", "你现在最想从书里得到哪种东西？")
    .replace("你現在最怕哪一種『翻車』？", "你现在最怕哪一种『翻车』？"),
  answers: q.answers.map((a) => ({ ...a, label: a.label
    .replaceAll("體", "体").replaceAll("亂", "乱").replaceAll("覺", "觉").replaceAll("幾", "几").replaceAll("時", "时").replaceAll("動", "动")
    .replaceAll("來", "来").replaceAll("裡", "里").replaceAll("麼", "么").replaceAll("際", "际").replaceAll("關", "关").replaceAll("順", "顺")
    .replaceAll("爭", "争").replaceAll("資", "资").replaceAll("執", "执").replaceAll("決", "决").replaceAll("現", "现").replaceAll("對", "对")
    .replaceAll("會", "会").replaceAll("權", "权").replaceAll("與", "与").replaceAll("麼", "么").replaceAll("評", "评").replaceAll("綁", "绑")
    .replaceAll("遊", "游").replaceAll("戲", "戏").replaceAll("態", "态").replaceAll("則", "则").replaceAll("從", "从").replaceAll("書", "书")
    .replaceAll("實", "实").replaceAll("錯", "错").replaceAll("發", "发").replaceAll("還", "还").replaceAll("種", "种").replaceAll("這", "这")
  })),
}));

QUESTIONS.en = [
  { title: "What feels most stuck right now?", answers: [
    { label: "Low energy and a disrupted daily rhythm", book: "neijing" }, { label: "Several possible paths, but unclear timing", book: "yi" }, { label: "People are hard to read", book: "shiji" }, { label: "The situation is manageable, but my mind will not stop", book: "zhuang" },
  ] },
  { title: "What do you need most when a problem appears?", answers: [
    { label: "A clearer read of the field before acting", book: "sunzi" }, { label: "Knowing what does not need to be forced", book: "dao" }, { label: "Clearer roles and relationships", book: "lunyu" }, { label: "Not letting one win or loss consume me", book: "caigen" },
  ] },
  { title: "If you could improve one thing first, what would it be?", answers: [
    { label: "Sleep, energy and physical rhythm", book: "neijing" }, { label: "Knowledge of foods, plants and everyday materials", book: "bencao" }, { label: "Competition, negotiation and resources", book: "sunzi" }, { label: "Comparison, emotion and attachment", book: "zhuang" },
  ] },
  { title: "What most often goes wrong in a major decision?", answers: [
    { label: "I cannot tell whether the timing is right", book: "yi" }, { label: "I act before calculating resources and opposition", book: "sunzi" }, { label: "I understand people's motives too late", book: "shiji" }, { label: "I keep trying to control what is not controllable", book: "dao" },
  ] },
  { title: "Which social survival skill do you most want to strengthen?", answers: [
    { label: "Reading power, motives and patterns of success or failure", book: "shiji" }, { label: "Trust, conduct and cooperation", book: "lunyu" }, { label: "Protecting myself when resources are unequal", book: "strategems" }, { label: "Freedom from comparison and external judgement", book: "zhuang" },
  ] },
  { title: "If life were an RPG, which stat is lowest right now?", answers: [
    { label: "Energy", book: "neijing" }, { label: "Knowledge of useful materials", book: "bencao" }, { label: "Emotional stability", book: "caigen" }, { label: "Understanding the rules of the game", book: "dao" },
  ] },
  { title: "What do you want most from a book right now?", answers: [
    { label: "A deeper model of how the world works", book: "dao" }, { label: "Real cases of people succeeding and failing", book: "shiji" }, { label: "Practical strategy frameworks", book: "sunzi" }, { label: "Short reminders that help me regain perspective", book: "caigen" },
  ] },
  { title: "Which kind of failure worries you most?", answers: [
    { label: "Doing the right thing at the wrong time", book: "yi" }, { label: "Realising too late that I was outmanoeuvred", book: "strategems" }, { label: "Running out of energy before the work is done", book: "neijing" }, { label: "Spending years trapped in comparison and attachment", book: "zhuang" },
  ] },
];

const COPY: Record<Locale, Copy> = {
  "zh-Hant": {
    back: "趣味小測", kicker: "地球 ONLINE · 古籍攻略", title: "你現在卡在哪一關？", lead: "8 道題，看看古人會塞給你哪一本攻略。不是測你『是哪種人』，只看你現在最需要處理哪個系統。", premise: "人生卡關，不一定需要更多答案。有時候，只是拿錯了攻略本。", start: "開始讀取當前關卡", progress: "關卡掃描", resultKicker: "攻略掉落", mainQuest: "主線攻略", dualQuest: "雙主線", sideQuest: "副線攻略", hiddenDlc: "隱藏 DLC", currentUse: "目前用途", rarity: "稀有度", today: "今天就能做", restart: "重新測一次", articleKicker: "觀世錄 · 延伸閱讀", articleTitle: "地球 Online 沒有通關：你現在卡在哪一關，就讀哪一本古籍", articleLead: "古籍不是同一套人生哲學的不同版本。它們處理的是不同的問題：時機、身體、關係、競爭、人性、執著與進退。先辨認關卡，再選攻略。", disclaimer: "本測驗是閱讀導航，不是人格、心理、醫療或命運判定。古代醫藥典籍只作文化與思想閱讀；健康問題應依現代專業醫療處理。", menu: "回到全部趣味小測",
  },
  "zh-Hans": {
    back: "趣味小测", kicker: "地球 ONLINE · 古籍攻略", title: "你现在卡在哪一关？", lead: "8 道题，看看古人会塞给你哪一本攻略。不是测你『是哪种人』，只看你现在最需要处理哪个系统。", premise: "人生卡关，不一定需要更多答案。有时候，只是拿错了攻略本。", start: "开始读取当前关卡", progress: "关卡扫描", resultKicker: "攻略掉落", mainQuest: "主线攻略", dualQuest: "双主线", sideQuest: "副线攻略", hiddenDlc: "隐藏 DLC", currentUse: "目前用途", rarity: "稀有度", today: "今天就能做", restart: "重新测一次", articleKicker: "观世录 · 延伸阅读", articleTitle: "地球 Online 没有通关：你现在卡在哪一关，就读哪一本古籍", articleLead: "古籍不是同一套人生哲学的不同版本。它们处理的是不同的问题：时机、身体、关系、竞争、人性、执着与进退。先辨认关卡，再选攻略。", disclaimer: "本测验是阅读导航，不是人格、心理、医疗或命运判定。古代医药典籍只作文化与思想阅读；健康问题应依现代专业医疗处理。", menu: "回到全部趣味小测",
  },
  en: {
    back: "Fun quizzes", kicker: "EARTH ONLINE · CLASSICS GUIDE", title: "Which level are you stuck on?", lead: "Eight questions to match your current problem with a Chinese classic. This is not a personality label; it identifies the system you may need to think about next.", premise: "Being stuck does not always mean you need more answers. Sometimes you are simply carrying the wrong guidebook.", start: "Scan my current level", progress: "Level scan", resultKicker: "GUIDE DROP", mainQuest: "Main guide", dualQuest: "Dual main guides", sideQuest: "Side guide", hiddenDlc: "Hidden DLC", currentUse: "Current use", rarity: "Rarity", today: "Do this today", restart: "Retake quiz", articleKicker: "GUANSHILU · FURTHER READING", articleTitle: "Earth Online has no final level: read the classic that matches the level you are on", articleLead: "These classics are not interchangeable versions of one life philosophy. They address different problems: timing, health, relationships, competition, human behaviour, attachment, advance and retreat. Identify the level before choosing the guide.", disclaimer: "This quiz is a reading guide, not a personality, psychological, medical or fate assessment. Historical medical texts are presented for cultural and intellectual reading only; health concerns should use modern professional care.", menu: "Back to all fun quizzes",
  },
};

function EarthOnlineQuiz() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const questions = QUESTIONS[locale];
  const books = BOOKS[locale];
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<BookKey[]>([]);

  const result = useMemo(() => {
    if (answers.length !== questions.length) return null;
    const counts = {} as Record<BookKey, number>;
    (Object.keys(books) as BookKey[]).forEach((key) => { counts[key] = 0; });
    answers.forEach((key) => { counts[key] += 2; });
    const ranked = (Object.keys(counts) as BookKey[]).sort((a, b) => counts[b] - counts[a]);
    const max = counts[ranked[0]];
    const mains = ranked.filter((key) => counts[key] === max).slice(0, 2);
    const side = ranked.find((key) => !mains.includes(key)) ?? ranked[1];
    return { mains, side, counts };
  }, [answers, books, questions.length]);

  function choose(book: BookKey) {
    const next = [...answers, book];
    setAnswers(next);
    if (index < questions.length - 1) setIndex(index + 1);
  }

  function restart() {
    setStarted(true);
    setIndex(0);
    setAnswers([]);
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  const mainBook = result ? books[result.mains[0]] : null;
  const sideBook = result ? books[result.side] : null;

  return (
    <main className="earth-online-shell">
      <div className="earth-online-ambient" aria-hidden="true"><span>乾</span><span>道</span><span>史</span><span>莊</span></div>

      <nav className="earth-online-nav" aria-label={copy.back}>
        <Link to="/fun-tests" className="earth-online-back">← {copy.back}</Link>
        <span className="earth-online-status"><i /> ONLINE</span>
      </nav>

      <header className="earth-online-hero">
        <div className="earth-online-orbit" aria-hidden="true"><span className="earth-online-orbit-core">典</span></div>
        <p className="earth-online-kicker">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <p className="earth-online-lead">{copy.lead}</p>
        <blockquote>{copy.premise}</blockquote>
        {!started ? <button className="earth-online-primary" type="button" onClick={() => setStarted(true)}>{copy.start}<span>→</span></button> : null}
      </header>

      {started && !result ? (
        <section className="earth-online-quiz-card" aria-live="polite">
          <div className="earth-online-progress-row"><span>{copy.progress}</span><strong>{index + 1} / {questions.length}</strong></div>
          <div className="earth-online-progress" role="progressbar" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={index + 1}><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
          <p className="earth-online-level">LEVEL {String(index + 1).padStart(2, "0")}</p>
          <h2>{questions[index].title}</h2>
          <div className="earth-online-options">
            {questions[index].answers.map((answer, answerIndex) => (
              <button type="button" key={answer.label} onClick={() => choose(answer.book)}>
                <span>{String.fromCharCode(65 + answerIndex)}</span><b>{answer.label}</b><i>›</i>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {result && mainBook && sideBook ? (
        <section className="earth-online-result-wrap" aria-live="polite">
          <p className="earth-online-drop-label">{copy.resultKicker}</p>
          <article className="earth-online-loot-card">
            <div className="earth-online-loot-shine" aria-hidden="true" />
            <div className="earth-online-loot-top">
              <span>{result.mains.length > 1 ? copy.dualQuest : copy.mainQuest}</span>
              <span>{copy.rarity} {"★".repeat(mainBook.rarity)}</span>
            </div>
            <div className="earth-online-book-mark" aria-hidden="true">{mainBook.title.replace(/[《》]/g, "").slice(0, 1)}</div>
            <p className="earth-online-system">{mainBook.system}</p>
            <h2>{result.mains.map((key) => books[key].title).join(" × ")}</h2>
            <p className="earth-online-use"><span>{copy.currentUse}</span>{result.mains.map((key) => books[key].use).join(" / ")}</p>
            <p className="earth-online-summary">{mainBook.summary}</p>
            <div className="earth-online-drop-grid">
              <div><span>{copy.sideQuest}</span><strong>{sideBook.title}</strong></div>
              <div><span>{copy.hiddenDlc}</span><strong>{mainBook.dlc}</strong></div>
            </div>
            <div className="earth-online-action"><span>{copy.today}</span><p>{mainBook.action}</p></div>
          </article>
          <button type="button" className="earth-online-secondary" onClick={restart}>{copy.restart}</button>
        </section>
      ) : null}

      <article className="earth-online-article">
        <p className="earth-online-kicker">{copy.articleKicker}</p>
        <h2>{copy.articleTitle}</h2>
        <p className="earth-online-article-lead">{copy.articleLead}</p>

        <div className="earth-online-article-body">
          <p>{tr(locale, "如果人生真的是一款遊戲，大部分人最大的問題，可能不是沒有攻略，而是攻略太多。二十歲有人叫你讀《論語》，遇到競爭有人叫你讀《孫子兵法》，迷茫了去看《易經》，焦慮了又搬出《莊子》《道德經》。書都沒有錯，問題是：你現在究竟卡在哪一關？", "如果人生真的是一款游戏，大部分人最大的问题，可能不是没有攻略，而是攻略太多。二十岁有人叫你读《论语》，遇到竞争有人叫你读《孙子兵法》，迷茫了去看《易经》，焦虑了又搬出《庄子》《道德经》。书都没有错，问题是：你现在究竟卡在哪一关？", "If life were a game, the problem would rarely be a lack of guides. It would be having too many. One book is recommended for relationships, another for competition, another for uncertainty, another for anxiety. The books are not the problem. The real question is which level you are actually on.")}</p>
          <p>{tr(locale, "遊戲裡沒有人會拿補血藥去解地圖謎題，也不會角色只剩 5% 生命值還硬開下一個 Boss。現實裡卻很常見：身體已經耗空的人繼續研究效率；明明是人際問題，卻一直優化工具；真正卡在比較與執著的人，又替自己加更多目標。", "游戏里没人会拿补血药去解地图谜题，也不会角色只剩 5% 生命值还硬开下一个 Boss。现实里却很常见：身体已经耗空的人继续研究效率；明明是人际问题，却一直优化工具；真正卡在比较与执着的人，又替自己加更多目标。", "In a game, a healing item does not solve a map puzzle, and a character at five per cent health should not start another boss fight. Real life is less tidy: exhausted people optimise productivity, relationship problems get treated as workflow problems, and comparison gets answered with more goals.")}</p>

          <div className="earth-online-pullquote">{tr(locale, "先辨認問題屬於哪個系統，再決定拿哪一本攻略。", "先辨认问题属于哪个系统，再决定拿哪一本攻略。", "Identify the system first. Then choose the guide.")}</div>

          <h3>{tr(locale, "時機不明：讀《易經》", "时机不明：读《易经》", "When timing is unclear: I Ching")}</h3>
          <p>{tr(locale, "它最值得借用的不是把人生簡化成一句吉凶，而是『時、位、變』的視角：同一個行動，放在不同階段與位置，結果可以完全不同。", "它最值得借用的不是把人生简化成一句吉凶，而是『时、位、变』的视角：同一个行动，放在不同阶段与位置，结果可以完全不同。", "Its most useful lens is not a one-word prediction but timing, position and change: the same move can mean something very different at another stage of the situation.")}</p>

          <h3>{tr(locale, "控制過度：讀《道德經》", "控制过度：读《道德经》", "When control becomes the problem: Tao Te Ching")}</h3>
          <p>{tr(locale, "它不是叫你什麼都不做，而是逼你辨認哪種力量有用、哪種用力只是在增加阻力。對總想把所有變數抓在手上的人，這是一種反向校準。", "它不是叫你什么都不做，而是逼你辨认哪种力量有用、哪种用力只是在增加阻力。对总想把所有变量抓在手上的人，这是一种反向校准。", "It is not an instruction to do nothing. It asks which kind of force actually works and which kind merely creates more resistance—a useful correction when you are trying to hold every variable at once.")}</p>

          <h3>{tr(locale, "比較與執著：讀《莊子》", "比较与执着：读《庄子》", "When comparison takes over: Zhuangzi")}</h3>
          <p>{tr(locale, "《莊子》不急著教你怎麼贏，它先問：這場比賽真的值得參加嗎？當尺度被拉遠，很多『非證明不可』的事情會重新恢復比例。", "《庄子》不急着教你怎么赢，它先问：这场比赛真的值得参加吗？当尺度被拉远，很多『非证明不可』的事情会重新恢复比例。", "Zhuangzi does not rush to teach you how to win. It asks whether the contest deserves your participation at all. Changing scale can restore proportion to things that once felt compulsory.")}</p>

          <h3>{tr(locale, "競爭與資源：讀《孫子兵法》", "竞争与资源：读《孙子兵法》", "When resources and competition matter: The Art of War")}</h3>
          <p>{tr(locale, "真正值得學的不是把生活軍事化，而是『先創造勝率，再投入成本』：看條件、看資源、看對手，也看哪些仗根本沒有必要打。", "真正值得学的不是把生活军事化，而是『先创造胜率，再投入成本』：看条件、看资源、看对手，也看哪些仗根本没有必要打。", "The point is not to militarise daily life. It is to improve the conditions before spending resources: assess the field, your capacity, the opposition and the fights that never needed to happen.")}</p>

          <h3>{tr(locale, "看不懂人：讀《史記》", "看不懂人：读《史记》", "When people are hard to read: Records of the Grand Historian")}</h3>
          <p>{tr(locale, "抽象的人性論很容易變成標籤；歷史案例比較有用，因為你看到的是人在利益、忠誠、恐懼、野心與時勢裡實際做了什麼。樣本多了，辨認模式的能力才會增加。", "抽象的人性论很容易变成标签；历史案例比较有用，因为你看到的是人在利益、忠诚、恐惧、野心与时势里实际做了什么。样本多了，辨认模式的能力才会增加。", "Abstract claims about human nature easily become labels. Historical cases are richer because they show what people actually did under incentives, loyalty, fear, ambition and changing circumstances.")}</p>

          <h3>{tr(locale, "角色快沒電：先讀生活，再談大道理", "角色快没电：先读生活，再谈大道理", "When the character is out of energy: restore before expanding")}</h3>
          <p>{tr(locale, "《黃帝內經》與《本草綱目》在這裡只取古典的節律觀、博物知識與思想史價值。它們不是現代醫療指南。但『先照顧承載你的身體，再討論下一個宏大目標』，仍是一個很實際的閱讀提醒。", "《黄帝内经》与《本草纲目》在这里只取古典的节律观、博物知识与思想史价值。它们不是现代医疗指南。但『先照顾承载你的身体，再讨论下一个宏大目标』，仍是一个很实际的阅读提醒。", "The Huangdi Neijing and Compendium are included here for historical ideas about rhythm, materia and intellectual history—not as modern medical manuals. The practical reminder still stands: care for the body carrying the project before adding another grand objective.")}</p>

          <h3>{tr(locale, "沒有一本是終極攻略", "没有一本是终极攻略", "No book is the final guide")}</h3>
          <p>{tr(locale, "《道德經》不是《孫子兵法》的高級版，《莊子》也不是《論語》的反面。它們處理的是不同問題。今天需要的書，半年後未必還是同一本。測驗結果不是身份，而是目前版本的導航。", "《道德经》不是《孙子兵法》的高级版，《庄子》也不是《论语》的反面。它们处理的是不同问题。今天需要的书，半年后未必还是同一本。测验结果不是身份，而是目前版本的导航。", "The Tao Te Ching is not an upgraded Art of War, and Zhuangzi is not the opposite of the Analects. They address different problems. The book you need today may not be the book you need six months from now. The result is navigation, not identity.")}</p>

          <div className="earth-online-final-line">{tr(locale, "地球 Online 沒有通關，只有存檔、讀檔、換地圖。攻略的作用，是降低盲撞的成本，不是跳過體驗。", "地球 Online 没有通关，只有存档、读档、换地图。攻略的作用，是降低盲撞的成本，不是跳过体验。", "Earth Online has no final completion screen—only saves, reloads and new maps. A guide reduces the cost of blind trial; it does not skip the experience.")}</div>
        </div>
        <p className="earth-online-disclaimer">{copy.disclaimer}</p>
      </article>

      <footer className="earth-online-footer"><Link to="/fun-tests">← {copy.menu}</Link><span>昭梧 · ZHAOWU</span></footer>
    </main>
  );
}
