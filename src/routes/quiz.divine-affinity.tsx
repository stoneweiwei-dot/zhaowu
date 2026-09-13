import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/quiz/divine-affinity")({ component: DivineAffinityQuiz });

type AffinityKey = "buddha" | "bodhisattva" | "guardian" | "immortal";
type AffinityAnswer = { label: string; key: AffinityKey };
type AffinityQuestion = { layer: string; title: string; answers: AffinityAnswer[] };

type ResultProfile = {
  name: string;
  essence: string;
  representatives: string[];
  mandate: string;
  soul: string;
  aspect: string;
  seal: string;
  duty: string;
  path: string;
  law: string;
  pattern: string;
  ancientSymbol: string;
  patternText: string;
};

const KEYS: AffinityKey[] = ["buddha", "bodhisattva", "guardian", "immortal"];

function question(layer: string, title: string, labels: [string, string, string, string]): AffinityQuestion {
  return {
    layer,
    title,
    answers: labels.map((label, index) => ({ label, key: KEYS[index] })) as AffinityAnswer[],
  };
}

// The source system preserves the six layers and four affinity families but omits the
// original 16 prompt texts. These production prompts reconstruct that taxonomy without
// presenting the result as a factual religious identity, reincarnation claim or diagnosis.
const QUESTIONS: Record<Locale, AffinityQuestion[]> = {
  "zh-Hant": [
    question("魂格 · Soul Pattern", "當你真正獨處、沒有任何角色要扮演時，哪種狀態最像你的內在底色？", ["安靜下來，看清念頭如何生滅", "心會自然想到人與人的苦樂", "會本能確認界線、秩序與安全", "想讓身心流動，去感受風、路與變化"]),
    question("魂格 · Soul Pattern", "遇到一件很難放下的事，你最自然的內在處理方式是？", ["退一步觀察，不急著把感受當成全部", "理解自己與別人真正受傷的地方", "辨明原則，決定什麼必須守住", "換個角度、環境或節奏，讓氣重新流動"]),
    question("魂格 · Soul Pattern", "你最希望自己長久保有哪一種力量？", ["清明與洞察", "慈悲與願力", "正氣與守護力", "自在與生命流動感"]),
    question("脈象 · Symbolic Pulse", "壓力忽然升高時，你身心最常先出現哪種傾向？", ["想把聲音關小，獨自沉澱", "先感受到別人的情緒與需要", "全身進入備戰，想立刻處理問題", "坐不住，想走動、換空間或透氣"]),
    question("脈象 · Symbolic Pulse", "要讓自己恢復到比較穩的狀態，你最需要的是？", ["留白、靜坐、閱讀或獨處", "被理解，也重新與人建立柔和連結", "把事情整理好，恢復明確秩序", "到自然裡走動，讓呼吸和節奏重新打開"]),
    question("能量體 · Aura Body", "如果把你最舒服的精神氣場畫成一幅畫，你最容易走進哪一幕？", ["深藍與霧灰之間，一輪安靜空月", "乳白與淡金之間，一池柔光蓮影", "朱砂與古金之間，一座穩定守門之壇", "青綠與天青之間，一條穿雲而去的山徑"]),
    question("能量體 · Aura Body", "走進一個陌生群體時，你比較常自然成為哪種存在？", ["先觀察全局，不急著表態", "讓氣氛柔和，照顧被忽略的人", "看出漏洞，主動穩住局面", "把人和資訊串起來，讓場子流動起來"]),
    question("能量體 · Aura Body", "別人向你求助時，你最像哪一種回應方式？", ["幫他看清真正卡住的是什麼", "先接住情緒，再陪他往前", "直接擋下問題、建立界線與方案", "幫他換路徑、找資源或打開新可能"]),
    question("前世系統 · Symbolic Lineage", "只把它當作象徵場景，哪一幅古老畫面最容易讓你產生熟悉感？", ["古寺暮鐘與長卷經冊", "蓮燈、願池與渡人的小舟", "城門、法幢與夜裡不熄的守燈", "松風、雲海、古道與遠行的道人"]),
    question("前世系統 · Symbolic Lineage", "若把人生反覆出現的角色寫成一個神話原型，你更像？", ["觀者：從混亂中辨出本質", "照者：讓受傷之處重新有光", "守者：在關鍵處維持秩序", "行者：把氣、知識與變化帶往下一站"]),
    question("命格深層 · Fate Deep Structure", "你人生裡最容易反覆卡住的課題，更接近哪一種？", ["太執著一個念頭，需要學會鬆開", "承接太多人，需要分清慈悲與耗損", "過度扛責或太硬，需要在守與鬆之間調整", "方向很多、變化很快，需要找到真正主線"]),
    question("命格深層 · Fate Deep Structure", "真正改變你人生的轉折，通常更像哪一種力量？", ["突然看懂了，所以願意放下", "因為一個人或一個願，決定長久去做", "有人需要我站出來，所以不能退", "環境一變、路一開，我就重新活起來"]),
    question("命格深層 · Fate Deep Structure", "如果你的工作只能留下一種長期影響，你最希望是？", ["讓人更清醒、更能看見真相", "讓人得到支持、理解與修復", "讓重要的人事物被好好保護", "讓知識、資源與生命力繼續流通"]),
    question("天命系統 · Celestial Mandate", "你覺得世界最常向你索取的能力是？", ["辨真偽、破迷霧", "給溫度、續願心", "守底線、破障礙", "開路、傳遞、讓停滯重新動起來"]),
    question("天命系統 · Celestial Mandate", "到了真正必須做決定的時候，你最想守住哪句話？", ["看清之後，該放的就放", "願意照亮，但不替別人活", "該守的守住，該斷的斷開", "不困在原地，讓路繼續往前"]),
    question("天命系統 · Celestial Mandate", "四個古象只能選一個作為你此刻的精神徽記，你會選？", ["空鐘：一聲之後，萬念漸寂", "光泉：柔光不斷向外流出", "力塔：穩穩立住，不讓界線崩塌", "氣樹：根在大地，枝葉向風而行"]),
  ],
  "zh-Hans": [
    question("魂格 · Soul Pattern", "当你真正独处、没有任何角色要扮演时，哪种状态最像你的内在底色？", ["安静下来，看清念头如何生灭", "心会自然想到人与人的苦乐", "会本能确认边界、秩序与安全", "想让身心流动，去感受风、路与变化"]),
    question("魂格 · Soul Pattern", "遇到一件很难放下的事，你最自然的内在处理方式是？", ["退一步观察，不急着把感受当成全部", "理解自己与别人真正受伤的地方", "辨明原则，决定什么必须守住", "换个角度、环境或节奏，让气重新流动"]),
    question("魂格 · Soul Pattern", "你最希望自己长久保有哪一种力量？", ["清明与洞察", "慈悲与愿力", "正气与守护力", "自在与生命流动感"]),
    question("脉象 · Symbolic Pulse", "压力忽然升高时，你身心最常先出现哪种倾向？", ["想把声音关小，独自沉淀", "先感受到别人的情绪与需要", "全身进入备战，想立刻处理问题", "坐不住，想走动、换空间或透气"]),
    question("脉象 · Symbolic Pulse", "要让自己恢复到比较稳的状态，你最需要的是？", ["留白、静坐、阅读或独处", "被理解，也重新与人建立柔和连接", "把事情整理好，恢复明确秩序", "到自然里走动，让呼吸和节奏重新打开"]),
    question("能量体 · Aura Body", "如果把你最舒服的精神气场画成一幅画，你最容易走进哪一幕？", ["深蓝与雾灰之间，一轮安静空月", "乳白与淡金之间，一池柔光莲影", "朱砂与古金之间，一座稳定守门之坛", "青绿与天青之间，一条穿云而去的山径"]),
    question("能量体 · Aura Body", "走进一个陌生群体时，你比较常自然成为哪种存在？", ["先观察全局，不急着表态", "让气氛柔和，照顾被忽略的人", "看出漏洞，主动稳住局面", "把人和信息串起来，让场子流动起来"]),
    question("能量体 · Aura Body", "别人向你求助时，你最像哪一种回应方式？", ["帮他看清真正卡住的是什么", "先接住情绪，再陪他往前", "直接挡下问题、建立边界与方案", "帮他换路径、找资源或打开新可能"]),
    question("前世系统 · Symbolic Lineage", "只把它当作象征场景，哪一幅古老画面最容易让你产生熟悉感？", ["古寺暮钟与长卷经册", "莲灯、愿池与渡人的小舟", "城门、法幢与夜里不熄的守灯", "松风、云海、古道与远行的道人"]),
    question("前世系统 · Symbolic Lineage", "若把人生反复出现的角色写成一个神话原型，你更像？", ["观者：从混乱中辨出本质", "照者：让受伤之处重新有光", "守者：在关键处维持秩序", "行者：把气、知识与变化带往下一站"]),
    question("命格深层 · Fate Deep Structure", "你人生里最容易反复卡住的课题，更接近哪一种？", ["太执着一个念头，需要学会松开", "承接太多人，需要分清慈悲与耗损", "过度扛责或太硬，需要在守与松之间调整", "方向很多、变化很快，需要找到真正主线"]),
    question("命格深层 · Fate Deep Structure", "真正改变你人生的转折，通常更像哪一种力量？", ["突然看懂了，所以愿意放下", "因为一个人或一个愿，决定长久去做", "有人需要我站出来，所以不能退", "环境一变、路一开，我就重新活起来"]),
    question("命格深层 · Fate Deep Structure", "如果你的工作只能留下一种长期影响，你最希望是？", ["让人更清醒、更能看见真相", "让人得到支持、理解与修复", "让重要的人事物被好好保护", "让知识、资源与生命力继续流通"]),
    question("天命系统 · Celestial Mandate", "你觉得世界最常向你索取的能力是？", ["辨真伪、破迷雾", "给温度、续愿心", "守底线、破障碍", "开路、传递、让停滞重新动起来"]),
    question("天命系统 · Celestial Mandate", "到了真正必须做决定的时候，你最想守住哪句话？", ["看清之后，该放的就放", "愿意照亮，但不替别人活", "该守的守住，该断的断开", "不困在原地，让路继续往前"]),
    question("天命系统 · Celestial Mandate", "四个古象只能选一个作为你此刻的精神徽记，你会选？", ["空钟：一声之后，万念渐寂", "光泉：柔光不断向外流出", "力塔：稳稳立住，不让边界崩塌", "气树：根在大地，枝叶向风而行"]),
  ],
  en: [
    question("Soul Pattern", "When you are fully alone and no role needs to be performed, which state feels most like your inner baseline?", ["Quiet observation of thoughts arising and passing", "A natural awareness of other people's joy and pain", "An instinct to check boundaries, order and safety", "A need to move, breathe and feel change around me"]),
    question("Soul Pattern", "When something is difficult to release, what is your most natural inner response?", ["Step back and observe rather than treating the feeling as the whole truth", "Understand where I and others are genuinely hurt", "Clarify the principle and decide what must be protected", "Change perspective, setting or rhythm until movement returns"]),
    question("Soul Pattern", "Which quality would you most want to preserve throughout your life?", ["Clarity and insight", "Compassion and commitment", "Integrity and protective strength", "Freedom and a sense of living flow"]),
    question("Symbolic Pulse", "When pressure rises suddenly, what tendency tends to appear first?", ["Reduce noise and process alone", "Notice other people's feelings and needs first", "Brace, take position and deal with the problem", "Become restless and need movement, air or a change of space"]),
    question("Symbolic Pulse", "What restores you most reliably?", ["Silence, meditation, reading or solitude", "Being understood and reconnecting gently with people", "Putting things in order and restoring clear structure", "Walking in nature and reopening breath and movement"]),
    question("Aura Body", "If your most comfortable inner atmosphere became a painting, which scene would you enter?", ["Deep blue and mist-grey around a quiet empty moon", "Ivory and pale gold around a softly lit lotus pool", "Cinnabar and antique gold around a steady guardian gate", "Jade green and sky blue along a mountain path through clouds"]),
    question("Aura Body", "When you enter an unfamiliar group, which role do you most naturally take?", ["Observe the whole before speaking", "Soften the atmosphere and notice who is left out", "Spot weak points and stabilise the situation", "Connect people and information so the group starts moving"]),
    question("Aura Body", "When someone asks you for help, which response is most like you?", ["Help them see what is actually blocking them", "Hold the emotion first, then walk forward with them", "Stop the immediate problem and establish boundaries and a plan", "Find another route, resource or possibility they have not seen"]),
    question("Symbolic Lineage", "Treating these only as symbolic scenes, which ancient image feels most familiar?", ["An evening temple bell beside long scripture scrolls", "Lotus lamps, a vow-pool and a small ferry boat", "A city gate, ritual standard and a lamp kept through the night", "Pine wind, cloud sea and an old mountain road used by wandering adepts"]),
    question("Symbolic Lineage", "If your recurring life role were written as a mythic archetype, which fits best?", ["Observer: distinguishes essence from noise", "Illuminator: brings light back to wounded places", "Guardian: holds order at the critical boundary", "Wayfarer: carries energy, knowledge and change onward"]),
    question("Fate Deep Structure", "Which recurring challenge is closest to your own pattern?", ["Holding one idea too tightly and needing to release it", "Carrying too many people and confusing compassion with depletion", "Over-carrying duty or becoming too rigid about what must be defended", "Too many directions and changes, making it hard to keep one true line"]),
    question("Fate Deep Structure", "Major turning points in your life are most often triggered by what kind of force?", ["I suddenly understand, so I can let go", "A person or vow gives me a reason to stay with something for the long term", "Someone needs me to stand up, so I cannot step back", "The environment changes, a route opens and I come alive again"]),
    question("Fate Deep Structure", "If your work could leave only one long-term effect, which would you choose?", ["People become clearer and see what is true", "People feel supported, understood and able to repair", "Important people or values are properly protected", "Knowledge, resources and vitality keep circulating"]),
    question("Celestial Mandate", "Which capacity does the world seem to ask from you most often?", ["Discern what is real and clear confusion", "Give warmth and keep commitment alive", "Hold boundaries and break through obstruction", "Open paths, transmit and restart movement"]),
    question("Celestial Mandate", "When a real decision has to be made, which principle do you most want to keep?", ["Once it is seen clearly, release what should be released", "Bring light without living someone else's life for them", "Protect what must be protected and cut what must be cut", "Do not stay trapped in place; keep the road moving"]),
    question("Celestial Mandate", "Choose one ancient symbol as your current spiritual emblem.", ["Void Bell: one sound, then the mind gradually settles", "Light Spring: soft radiance continues to flow outward", "Guardian Pillar: stands firm so the boundary does not collapse", "Qi Tree: rooted in earth while its branches move with the wind"]),
  ],
};

const RESULTS: Record<Locale, Record<AffinityKey, ResultProfile>> = {
  "zh-Hant": {
    buddha: { name: "佛系", essence: "空性 · 觀照 · 智慧", representatives: ["釋迦牟尼佛", "藥師佛", "阿彌陀佛"], mandate: "佛命 · 破執", soul: "空魂", aspect: "空相", seal: "寂印", duty: "觀", path: "空路", law: "空法", pattern: "空輪魂格", ancientSymbol: "空鐘", patternText: "向心收束。先看清，再鬆開；核心不是逃離世界，而是不讓執著接管判斷。" },
    bodhisattva: { name: "菩薩系", essence: "慈悲 · 願力 · 柔光", representatives: ["觀世音菩薩", "地藏王菩薩", "文殊菩薩"], mandate: "菩薩命 · 救度", soul: "光魂", aspect: "光相", seal: "慈印", duty: "照", path: "光路", law: "願法", pattern: "光心魂格", ancientSymbol: "光泉", patternText: "向外擴散。你的象徵重點在照見、承接與願力，但慈悲需要界線，才不會變成消耗。" },
    guardian: { name: "護法系", essence: "正氣 · 破障 · 守護", representatives: ["韋馱", "伽藍", "金剛力士"], mandate: "護法命 · 守序", soul: "護魂", aspect: "力相", seal: "護印", duty: "守", path: "護路", law: "戒法", pattern: "護柱魂格", ancientSymbol: "力塔", patternText: "向前凝聚。你的象徵重點在守界、承責與破障；真正的力量不是一直戰鬥，而是知道哪裡值得站住。" },
    immortal: { name: "仙系", essence: "氣感 · 古息 · 自在", representatives: ["太上老君", "九天玄女", "呂洞賓"], mandate: "仙命 · 傳氣", soul: "氣魂", aspect: "氣相", seal: "氣印", duty: "行", path: "氣路", law: "氣法", pattern: "氣渦魂格", ancientSymbol: "氣樹", patternText: "向上升騰。你的象徵重點在流動、傳遞與開路；自在不是漂浮，而是讓變化始終有一條主線。" },
  },
  "zh-Hans": {
    buddha: { name: "佛系", essence: "空性 · 观照 · 智慧", representatives: ["释迦牟尼佛", "药师佛", "阿弥陀佛"], mandate: "佛命 · 破执", soul: "空魂", aspect: "空相", seal: "寂印", duty: "观", path: "空路", law: "空法", pattern: "空轮魂格", ancientSymbol: "空钟", patternText: "向心收束。先看清，再松开；核心不是逃离世界，而是不让执着接管判断。" },
    bodhisattva: { name: "菩萨系", essence: "慈悲 · 愿力 · 柔光", representatives: ["观世音菩萨", "地藏王菩萨", "文殊菩萨"], mandate: "菩萨命 · 救度", soul: "光魂", aspect: "光相", seal: "慈印", duty: "照", path: "光路", law: "愿法", pattern: "光心魂格", ancientSymbol: "光泉", patternText: "向外扩散。你的象征重点在照见、承接与愿力，但慈悲需要边界，才不会变成消耗。" },
    guardian: { name: "护法系", essence: "正气 · 破障 · 守护", representatives: ["韦驮", "伽蓝", "金刚力士"], mandate: "护法命 · 守序", soul: "护魂", aspect: "力相", seal: "护印", duty: "守", path: "护路", law: "戒法", pattern: "护柱魂格", ancientSymbol: "力塔", patternText: "向前凝聚。你的象征重点在守界、承责与破障；真正的力量不是一直战斗，而是知道哪里值得站住。" },
    immortal: { name: "仙系", essence: "气感 · 古息 · 自在", representatives: ["太上老君", "九天玄女", "吕洞宾"], mandate: "仙命 · 传气", soul: "气魂", aspect: "气相", seal: "气印", duty: "行", path: "气路", law: "气法", pattern: "气涡魂格", ancientSymbol: "气树", patternText: "向上升腾。你的象征重点在流动、传递与开路；自在不是漂浮，而是让变化始终有一条主线。" },
  },
  en: {
    buddha: { name: "Buddha family", essence: "emptiness · observation · wisdom", representatives: ["Shakyamuni Buddha", "Medicine Buddha", "Amitabha Buddha"], mandate: "Buddha mandate · release attachment", soul: "Void Soul", aspect: "Void Aspect", seal: "Stillness Seal", duty: "Observe", path: "Void Path", law: "Void Law", pattern: "Void Wheel Pattern", ancientSymbol: "Void Bell", patternText: "Energy gathers inward. See clearly, then release. The theme is not withdrawal from life but refusing to let attachment govern judgement." },
    bodhisattva: { name: "Bodhisattva family", essence: "compassion · vow · soft light", representatives: ["Avalokiteshvara", "Ksitigarbha", "Manjushri"], mandate: "Bodhisattva mandate · aid", soul: "Light Soul", aspect: "Light Aspect", seal: "Compassion Seal", duty: "Illuminate", path: "Light Path", law: "Vow Law", pattern: "Light Heart Pattern", ancientSymbol: "Light Spring", patternText: "Energy expands outward. The symbolic emphasis is illumination, support and commitment; compassion needs boundaries so it does not become depletion." },
    guardian: { name: "Guardian family", essence: "integrity · obstacle-breaking · protection", representatives: ["Skanda", "Guan Yu / Sangharama guardian", "Vajra guardians"], mandate: "Guardian mandate · preserve order", soul: "Guardian Soul", aspect: "Force Aspect", seal: "Guardian Seal", duty: "Guard", path: "Guardian Path", law: "Discipline Law", pattern: "Guardian Pillar Pattern", ancientSymbol: "Strength Tower", patternText: "Energy gathers forward. The symbolic emphasis is boundaries, responsibility and removing obstruction; strength is knowing where standing firm truly matters." },
    immortal: { name: "Immortal family", essence: "qi-sense · ancient breath · freedom", representatives: ["Taishang Laojun", "Jiutian Xuannü", "Lü Dongbin"], mandate: "Immortal mandate · transmit qi", soul: "Qi Soul", aspect: "Qi Aspect", seal: "Qi Seal", duty: "Move", path: "Qi Path", law: "Qi Law", pattern: "Qi Vortex Pattern", ancientSymbol: "Qi Tree", patternText: "Energy rises and circulates. The symbolic emphasis is movement, transmission and path-opening; freedom works best when change still follows a real through-line." },
  },
};

const UI: Record<Locale, {
  kicker: string; title: string; lead: string; boundary: string; question: string; choose: string; result: string;
  primary: string; secondary: string; representative: string; blueprint: string; pattern: string; score: string;
  art: string; artNote: string; restart: string; home: string;
}> = {
  "zh-Hant": {
    kicker: "魂格 × 天命 × 本緣 · 16 題深層版",
    title: "仙佛淵源本緣測試",
    lead: "從魂格、象徵脈象、能量體、前世象徵、命格深層與天命六層，看看你此刻更接近佛／菩薩／護法／仙哪一種神聖原型。",
    boundary: "這是昭梧的文化象徵與自我探索測驗，不證明前世、神佛轉世、宗教身份、仙緣事實或身體能量狀態。結果只描述你回答中呈現的象徵傾向。",
    question: "題", choose: "依第一直覺選一項", result: "查看本緣結果", primary: "主本緣", secondary: "次本緣", representative: "本系代表尊", blueprint: "天命藍圖", pattern: "魂格圖譜", score: "本次四系分數", art: "含藏聖相 · 本緣結果", artNote: "以濃郁宋彩、古金月輪與半遮面聖相呈現你的主結果；這張圖是藝術化身，不是對某位神佛身份的判定。", restart: "重新測驗", home: "返回首頁",
  },
  "zh-Hans": {
    kicker: "魂格 × 天命 × 本缘 · 16 题深层版",
    title: "仙佛渊源本缘测试",
    lead: "从魂格、象征脉象、能量体、前世象征、命格深层与天命六层，看看你此刻更接近佛／菩萨／护法／仙哪一种神圣原型。",
    boundary: "这是昭梧的文化象征与自我探索测试，不证明前世、神佛转世、宗教身份、仙缘事实或身体能量状态。结果只描述你回答中呈现的象征倾向。",
    question: "题", choose: "依第一直觉选一项", result: "查看本缘结果", primary: "主本缘", secondary: "次本缘", representative: "本系代表尊", blueprint: "天命蓝图", pattern: "魂格图谱", score: "本次四系分数", art: "含藏圣相 · 本缘结果", artNote: "以浓郁宋彩、古金月轮与半遮面圣相呈现你的主结果；这张图是艺术化身，不是对某位神佛身份的判定。", restart: "重新测试", home: "返回首页",
  },
  en: {
    kicker: "SOUL × MANDATE × AFFINITY · 16 QUESTIONS",
    title: "Divine Affinity Scan",
    lead: "Across six symbolic layers—Soul Pattern, Symbolic Pulse, Aura Body, Symbolic Lineage, Fate Deep Structure and Celestial Mandate—see which sacred archetype your current answers resemble most: Buddha, Bodhisattva, Guardian or Immortal.",
    boundary: "This is a cultural-symbolic self-reflection test. It does not prove past lives, reincarnation, religious identity, literal divine affinity or a measurable energy state. The result describes patterns in your answers only.",
    question: "Question", choose: "Choose the first option that feels true", result: "See affinity result", primary: "Primary affinity", secondary: "Secondary affinity", representative: "Representative figures", blueprint: "Mandate blueprint", pattern: "Soul Pattern atlas", score: "Four-family score", art: "Concealed Sacred Icon · Affinity result", artNote: "A saturated Song-mineral, antique-gold moon-disc portrait of the result archetype. It is an artistic embodiment, not an identity claim about a deity.", restart: "Retake test", home: "Back to home",
  },
};

function scoreAnswers(answers: AffinityKey[]) {
  const counts = Object.fromEntries(KEYS.map((key) => [key, 0])) as Record<AffinityKey, number>;
  for (const key of answers) counts[key] += 1;
  const latest = Object.fromEntries(KEYS.map((key) => [key, -1])) as Record<AffinityKey, number>;
  answers.forEach((key, index) => { latest[key] = index; });
  const sorted = [...KEYS].sort((a, b) => counts[b] - counts[a] || latest[b] - latest[a] || KEYS.indexOf(a) - KEYS.indexOf(b));
  return { counts, primary: sorted[0], secondary: sorted[1], sorted };
}

const ART = {
  buddha: { field: "#dce7ef", soft: "#edf3f5", robe: "#7998ac", deep: "#425f73", gold: "#b28a49", object: "leaf" as const },
  bodhisattva: { field: "#eadfe5", soft: "#f5ecef", robe: "#b47f91", deep: "#794e61", gold: "#b38a48", object: "lotus" as const },
  guardian: { field: "#e8dfcf", soft: "#f4ecde", robe: "#a96b55", deep: "#6f4037", gold: "#ae7d38", object: "tablet" as const },
  immortal: { field: "#dce9df", soft: "#edf4ea", robe: "#6f9d85", deep: "#3f6657", gold: "#ad8743", object: "fan" as const },
};

function AffinityArt({ family, label, note }: { family: AffinityKey; label: string; note: string }) {
  const palette = ART[family];
  return (
    <article className="seal-border overflow-hidden rounded-2xl bg-cream/95 p-4 sm:p-6" data-divine-affinity-art={family}>
      <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[28px] border border-line bg-paper shadow-sm">
          <svg viewBox="0 0 540 960" role="img" aria-label={`${label} · ${family}`} className="block aspect-[9/16] h-auto w-full">
            <rect width="540" height="960" fill={palette.field} />
            <rect x="24" y="24" width="492" height="912" rx="30" fill="none" stroke={palette.gold} strokeWidth="2" opacity="0.48" />
            <circle cx="270" cy="345" r="188" fill={palette.soft} opacity="0.7" />
            <circle cx="270" cy="345" r="174" fill="none" stroke={palette.gold} strokeWidth="5" opacity="0.9" />
            <circle cx="270" cy="345" r="156" fill="none" stroke={palette.gold} strokeWidth="2" opacity="0.45" />
            <path d="M105 790 Q136 552 270 520 Q404 552 435 790 L464 930 H76 Z" fill={palette.robe} stroke={palette.gold} strokeWidth="4" />
            <path d="M137 780 Q192 660 270 632 Q348 660 403 780" fill="none" stroke={palette.deep} strokeWidth="24" opacity="0.36" />
            <path d="M159 723 Q214 672 270 667 Q326 672 381 723" fill="none" stroke={palette.gold} strokeWidth="5" opacity="0.78" />
            <ellipse cx="270" cy="357" rx="103" ry="132" fill="#ead0b8" stroke={palette.gold} strokeWidth="3" />
            <path d="M174 326 Q190 220 270 202 Q350 220 366 326 Q347 280 315 257 Q276 229 225 251 Q196 268 174 326Z" fill={palette.deep} opacity="0.92" />
            <path d="M212 351 Q236 337 258 351 M286 351 Q308 337 330 351" fill="none" stroke={palette.deep} strokeWidth="6" strokeLinecap="round" />
            <path d="M252 428 Q270 438 288 428" fill="none" stroke={palette.deep} strokeWidth="4" strokeLinecap="round" opacity="0.62" />
            {palette.object === "leaf" ? (
              <g transform="translate(4 8) rotate(-10 260 350)">
                <path d="M180 389 Q242 262 337 296 Q312 399 209 424 Q194 416 180 389Z" fill={palette.soft} stroke={palette.gold} strokeWidth="5" />
                <path d="M205 400 Q254 351 315 310" fill="none" stroke={palette.deep} strokeWidth="4" opacity="0.75" />
              </g>
            ) : null}
            {palette.object === "lotus" ? (
              <g transform="translate(0 18)">
                {[0, 36, 72, 108, 144].map((rotation) => <ellipse key={rotation} cx="270" cy="360" rx="25" ry="76" transform={`rotate(${rotation} 270 360)`} fill={palette.soft} stroke={palette.gold} strokeWidth="3" />)}
                <circle cx="270" cy="360" r="24" fill={palette.robe} stroke={palette.gold} strokeWidth="3" />
              </g>
            ) : null}
            {palette.object === "tablet" ? (
              <g transform="translate(14 5) rotate(-7 250 350)">
                <rect x="191" y="286" width="118" height="164" rx="17" fill={palette.soft} stroke={palette.gold} strokeWidth="5" />
                <rect x="210" y="307" width="80" height="120" rx="9" fill={palette.robe} opacity="0.78" />
                <circle cx="250" cy="348" r="21" fill="none" stroke={palette.gold} strokeWidth="4" />
                <path d="M228 386 H274" stroke={palette.gold} strokeWidth="4" strokeLinecap="round" />
              </g>
            ) : null}
            {palette.object === "fan" ? (
              <g transform="translate(8 10) rotate(-12 260 365)">
                <path d="M169 390 Q270 250 371 390 Q324 424 270 430 Q216 424 169 390Z" fill={palette.soft} stroke={palette.gold} strokeWidth="5" />
                {[202, 236, 270, 304, 338].map((x) => <path key={x} d={`M270 418 L${x} 350`} stroke={palette.deep} strokeWidth="3" opacity="0.58" />)}
              </g>
            ) : null}
            <path d="M74 190 Q118 147 162 190 M378 190 Q422 147 466 190" fill="none" stroke={palette.gold} strokeWidth="3" opacity="0.42" />
            <path d="M82 848 Q126 816 174 848 Q126 878 82 848Z M366 848 Q414 816 458 848 Q414 878 366 848Z" fill={palette.deep} opacity="0.16" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs tracking-[0.24em] text-cinnabar">{label}</p>
          <h3 className="mt-2 font-display text-2xl text-ink">{family === "buddha" ? "空 · 觀" : family === "bodhisattva" ? "光 · 願" : family === "guardian" ? "護 · 守" : "氣 · 行"}</h3>
          <p className="mt-4 text-sm leading-7 text-ink-soft">{note}</p>
          <div className="mt-5 h-px bg-line" />
          <p className="mt-3 text-[11px] tracking-[0.2em] text-ink-mute">STONE · 昭梧</p>
        </div>
      </div>
    </article>
  );
}

function DivineAffinityQuiz() {
  const { locale } = useI18n();
  const copy = UI[locale];
  const questions = QUESTIONS[locale];
  const profiles = RESULTS[locale];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AffinityKey[]>([]);
  const [selected, setSelected] = useState<AffinityKey | null>(null);
  const [done, setDone] = useState(false);
  const score = useMemo(() => scoreAnswers(answers), [answers]);

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
      const finalScore = scoreAnswers(next);
      try {
        window.localStorage.setItem("zhaowu-divine-affinity-v1", JSON.stringify({ ...finalScore, answers: next, locale, completedAt: new Date().toISOString() }));
      } catch {
        // Result still renders if storage is unavailable.
      }
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
  }

  const finalScore = done ? scoreAnswers(answers) : score;
  const primary = profiles[finalScore.primary];
  const secondary = profiles[finalScore.secondary];
  const showSecondary = done && finalScore.counts[finalScore.primary] - finalScore.counts[finalScore.secondary] <= 2;

  return (
    <main className="mx-auto max-w-3xl space-y-5 pb-16" data-divine-affinity-quiz>
      <header className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
        <p className="text-xs tracking-[0.24em] text-cinnabar">ZHAOWU · {copy.kicker}</p>
        <h1 className="mt-2 font-display text-3xl text-ink">{copy.title}</h1>
        <p className="mt-4 text-[15px] leading-7 text-ink-soft">{copy.lead}</p>
        <p className="mt-4 rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-6 text-ink-soft">{copy.boundary}</p>
      </header>

      {!done ? (
        <section className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
          <div className="flex items-center justify-between gap-4 text-xs text-ink-mute">
            <span>{questions[index].layer}</span>
            <span>{copy.question} {index + 1} / {questions.length}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-deep">
            <div className="h-full bg-cinnabar transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
          </div>
          <p className="mt-5 text-xs tracking-[0.15em] text-ink-mute">{copy.choose}</p>
          <h2 className="mt-2 font-display text-2xl leading-9 text-ink">{questions[index].title}</h2>
          <div className="mt-5 grid gap-3">
            {questions[index].answers.map((answer) => {
              const active = selected === answer.key;
              return (
                <button
                  key={answer.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(answer.key)}
                  className={`min-h-14 rounded-xl border px-4 py-4 text-left text-[15px] leading-6 transition ${active ? "border-cinnabar bg-cream text-ink shadow-sm" : "border-line bg-paper text-ink hover:border-cinnabar/50"}`}
                >
                  {answer.label}
                </button>
              );
            })}
          </div>
          <button type="button" disabled={!selected} onClick={advance} className="mt-5 min-h-12 w-full rounded-full bg-cinnabar px-5 py-3 text-sm text-cream disabled:cursor-not-allowed disabled:opacity-35">
            {index === questions.length - 1 ? copy.result : locale === "en" ? "Next" : locale === "zh-Hans" ? "下一题" : "下一題"}
          </button>
        </section>
      ) : (
        <section className="space-y-4" data-divine-affinity-result>
          <article className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
            <p className="text-xs tracking-[0.24em] text-cinnabar">{copy.primary}</p>
            <h2 className="mt-2 font-display text-4xl text-ink">{primary.name}</h2>
            <p className="mt-2 font-display text-lg text-ink-soft">{primary.essence}</p>
            <p className="mt-5 text-sm leading-7 text-ink-soft"><b className="text-ink">{copy.representative}：</b>{primary.representatives.join(" · ")}</p>
            {showSecondary ? <p className="mt-3 text-sm leading-7 text-ink-soft"><b className="text-ink">{copy.secondary}：</b>{secondary.name} · {secondary.essence}</p> : null}
          </article>

          <AffinityArt family={finalScore.primary} label={copy.art} note={copy.artNote} />

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
            <p className="text-xs tracking-[0.22em] text-cinnabar">{copy.blueprint}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["天命", primary.mandate], ["天魂", primary.soul], ["天相", primary.aspect], ["天印", primary.seal],
                ["天職", primary.duty], ["天路", primary.path], ["天則", primary.law],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-line bg-cream/75 px-4 py-3">
                  <span className="text-xs tracking-[0.15em] text-ink-mute">{label}</span>
                  <strong className="mt-1 block font-display text-xl text-ink">{value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="seal-border rounded-2xl bg-cream/90 p-5 sm:p-8">
            <p className="text-xs tracking-[0.22em] text-cinnabar">{copy.pattern}</p>
            <h3 className="mt-2 font-display text-2xl text-ink">{primary.pattern} · {primary.ancientSymbol}</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{primary.patternText}</p>
          </article>

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
            <p className="text-sm leading-7 text-ink-soft"><b className="text-ink">{copy.score}：</b>{KEYS.map((key) => `${profiles[key].name} ${finalScore.counts[key]}`).join(" · ")}</p>
            <p className="mt-4 border-t border-line pt-4 text-xs leading-6 text-ink-mute">{copy.boundary}</p>
          </article>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={reset} className="min-h-12 rounded-full border border-line bg-cream px-5 py-3 text-sm text-ink">{copy.restart}</button>
            <Link to="/" className="grid min-h-12 place-items-center rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">{copy.home}</Link>
          </div>
        </section>
      )}
    </main>
  );
}
