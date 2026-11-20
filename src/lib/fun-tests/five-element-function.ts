import type { Locale } from "@/lib/i18n";

export type FiveElementKey = "wood" | "fire" | "earth" | "metal" | "water";
export type FiveElementAnswer = { label: string; element: FiveElementKey };
export type FiveElementQuestion = { title: string; answers: FiveElementAnswer[] };

export type FiveElementScore = {
  primary: FiveElementKey;
  secondary: FiveElementKey | null;
  overdrive: boolean;
};

type AuraCopy = {
  primary: string;
  secondary: string[];
  base: string;
  text: string;
};

type ResultCopy = {
  name: string;
  title: string;
  core: string;
  actions: string[];
  observe: string;
  excess: string;
  support: string;
  aura: AuraCopy;
};

type UiCopy = {
  kicker: string;
  title: string;
  intro: string;
  progress: string;
  resultKicker: string;
  actionsTitle: string;
  observeTitle: string;
  excessTitle: string;
  supportTitle: string;
  auraTitle: string;
  disclaimer: string;
  overdrive: string;
  restart: string;
  back: string;
};

const q = (title: string, labels: [string, string, string, string, string]): FiveElementQuestion => ({
  title,
  answers: [
    { label: labels[0], element: "wood" },
    { label: labels[1], element: "fire" },
    { label: labels[2], element: "earth" },
    { label: labels[3], element: "metal" },
    { label: labels[4], element: "water" },
  ],
});

export const FIVE_ELEMENT_QUESTIONS: Record<Locale, FiveElementQuestion[]> = {
  "zh-Hant": [
    q("你最近最常卡在哪裡？", ["想做很多事，但方向和路徑還沒理清。", "知道要做什麼，但就是遲遲沒有啟動。", "已經開始很多事，卻總是難以穩定完成。", "事情、人際和資訊太多，很難取捨。", "最近明顯覺得累，需要先把自己收回來。"]),
    q("遇到新機會時，你現在最需要的是？", ["看清它能往哪裡長。", "馬上跨出第一步的動力。", "把它真正接住並持續做下去。", "判斷它值不值得，並拒絕其他干擾。", "先觀察，不被興奮感帶著跑。"]),
    q("最近你的工作或生活更像哪一種？", ["被堵著，想突破但路徑不夠通。", "有想法，但曝光、表達和行動不足。", "零碎很多，缺穩定節奏和收尾。", "太雜太亂，需要刪減和重新定標準。", "長期輸出，恢復和留白明顯不足。"]),
    q("如果今天只能改善一件事，你會選？", ["把未來三個月的方向排清楚。", "把一直拖著的事正式啟動。", "把一件重要的事做完並穩定下來。", "把不重要的人事物刪掉一批。", "空出時間休息、思考、重新儲備。"]),
    q("你最近表達自己的狀態？", ["有很多想法，但表達路徑容易繞或卡住。", "太收著，需要更敢說、更敢展示。", "能表達，但落實和持續跟進不夠。", "需要說得更明確、更有界線。", "不想馬上說，想先想清楚再開口。"]),
    q("你做計畫時最常遇到什麼問題？", ["不缺想法，缺清晰主線。", "計畫有了，缺啟動。", "啟動很多，缺持續和完成。", "計畫太多，缺刪減和優先級。", "排得太滿，缺緩衝和觀察時間。"]),
    q("最近人際上最需要什麼？", ["把關係重新疏通，讓話能說開。", "主動聯絡、表達熱度。", "建立穩定可靠的相處節奏。", "明確界線、拒絕不合理消耗。", "暫時拉開一點距離，恢復自己。"]),
    q("你的空間、桌面或資料最近更需要？", ["為新計畫騰出成長空間。", "把重要東西擺出來，提醒自己行動。", "建立固定位置和穩定流程。", "分類、刪除、歸檔。", "降低刺激，變得安靜、簡單。"]),
    q("面對壓力，你現在最容易出現？", ["想找出口，卻越想越多條路。", "立刻衝出去做，容易過熱。", "什麼都扛下來，越積越重。", "變得挑剔或快速切斷。", "退回自己裡面，遲遲不行動。"]),
    q("你現在最希望自己的狀態變成？", ["更有方向、更能成長。", "更有行動力、更敢表達。", "更穩定、更能完成。", "更清楚、更有界線。", "更安靜、更有恢復力。"]),
    q("如果只能練一個能力，你最需要？", ["規劃與溝通。", "啟動與展示。", "承接與完成。", "取捨與界線。", "觀察與恢復。"]),
    q("下面哪句話最像你現在需要的提醒？", ["先把路疏通，再往前長。", "不要只想，先讓事情發生。", "少開新坑，把重要的接穩做完。", "不是都要，要的是選清楚。", "先恢復判斷力，再決定下一步。"]),
  ],
  "zh-Hans": [
    q("你最近最常卡在哪里？", ["想做很多事，但方向和路径还没理清。", "知道要做什么，但就是迟迟没有启动。", "已经开始很多事，却总是难以稳定完成。", "事情、人际和信息太多，很难取舍。", "最近明显觉得累，需要先把自己收回来。"]),
    q("遇到新机会时，你现在最需要的是？", ["看清它能往哪里长。", "马上跨出第一步的动力。", "把它真正接住并持续做下去。", "判断它值不值得，并拒绝其他干扰。", "先观察，不被兴奋感带着跑。"]),
    q("最近你的工作或生活更像哪一种？", ["被堵着，想突破但路径不够通。", "有想法，但曝光、表达和行动不足。", "零碎很多，缺稳定节奏和收尾。", "太杂太乱，需要删减和重新定标准。", "长期输出，恢复和留白明显不足。"]),
    q("如果今天只能改善一件事，你会选？", ["把未来三个月的方向排清楚。", "把一直拖着的事正式启动。", "把一件重要的事做完并稳定下来。", "把不重要的人事物删掉一批。", "空出时间休息、思考、重新储备。"]),
    q("你最近表达自己的状态？", ["有很多想法，但表达路径容易绕或卡住。", "太收着，需要更敢说、更敢展示。", "能表达，但落实和持续跟进不够。", "需要说得更明确、更有边界。", "不想马上说，想先想清楚再开口。"]),
    q("你做计划时最常遇到什么问题？", ["不缺想法，缺清晰主线。", "计划有了，缺启动。", "启动很多，缺持续和完成。", "计划太多，缺删减和优先级。", "排得太满，缺缓冲和观察时间。"]),
    q("最近人际上最需要什么？", ["把关系重新疏通，让话能说开。", "主动联系、表达热度。", "建立稳定可靠的相处节奏。", "明确边界、拒绝不合理消耗。", "暂时拉开一点距离，恢复自己。"]),
    q("你的空间、桌面或资料最近更需要？", ["为新计划腾出成长空间。", "把重要东西摆出来，提醒自己行动。", "建立固定位置和稳定流程。", "分类、删除、归档。", "降低刺激，变得安静、简单。"]),
    q("面对压力，你现在最容易出现？", ["想找出口，却越想越多条路。", "立刻冲出去做，容易过热。", "什么都扛下来，越积越重。", "变得挑剔或快速切断。", "退回自己里面，迟迟不行动。"]),
    q("你现在最希望自己的状态变成？", ["更有方向、更能成长。", "更有行动力、更敢表达。", "更稳定、更能完成。", "更清楚、更有边界。", "更安静、更有恢复力。"]),
    q("如果只能练一个能力，你最需要？", ["规划与沟通。", "启动与展示。", "承接与完成。", "取舍与边界。", "观察与恢复。"]),
    q("下面哪句话最像你现在需要的提醒？", ["先把路疏通，再往前长。", "不要只想，先让事情发生。", "少开新坑，把重要的接稳做完。", "不是都要，要的是选清楚。", "先恢复判断力，再决定下一步。"]),
  ],
  en: [
    q("Where do you feel most stuck lately?", ["I have several ideas, but the direction is still unclear.", "I know what to do, but I keep delaying the start.", "I start things, but struggle to finish them consistently.", "There is too much information, work or people to sort through.", "I feel drained and need to pull my energy back first."]),
    q("When a new opportunity appears, what do you need most right now?", ["A clearer sense of where it could grow.", "The push to take the first step now.", "A way to hold it steadily and keep going.", "A clear decision about whether it is worth my time.", "Space to observe before I commit."]),
    q("Which best describes work or life lately?", ["I want to move, but the path feels blocked.", "I have ideas, but not enough action or visibility.", "Too many loose ends and not enough completion.", "Too much clutter; I need clearer standards and priorities.", "Too much output and not enough recovery."]),
    q("If you could improve only one thing today, what would it be?", ["Clarify the main direction for the next three months.", "Finally start the thing I keep postponing.", "Finish one important thing and make it stable.", "Remove a batch of low-value commitments or distractions.", "Make room to rest, think and rebuild capacity."]),
    q("How does self-expression feel lately?", ["I have ideas, but the message or path gets tangled.", "I am holding back and need to speak or show more.", "I can explain myself, but follow-through is weak.", "I need to be clearer and set firmer boundaries.", "I need more time to think before I speak."]),
    q("What is the main problem with your plans?", ["Too many ideas, not enough clear direction.", "The plan exists, but I have not started.", "I start often, but do not sustain or finish enough.", "There are too many plans and not enough prioritising.", "My schedule is too full and leaves no thinking room."]),
    q("What do your relationships need most right now?", ["Clearer communication so things can move again.", "More initiative, warmth and contact.", "A steadier and more reliable rhythm.", "Clear boundaries around what I will and will not carry.", "A little distance so I can recover first."]),
    q("What does your space, desk or information system need most?", ["Room for a new plan to grow.", "Visible reminders that help me act.", "Fixed places and repeatable routines.", "Sorting, deleting and filing.", "Less stimulation and more quiet."]),
    q("Under pressure, what happens most easily right now?", ["I keep opening more possible paths instead of choosing one.", "I rush into action and overheat.", "I carry everything until it becomes heavy.", "I become overly critical or cut things off too fast.", "I withdraw and delay action for too long."]),
    q("What state do you most want to move toward now?", ["More direction and room to grow.", "More action and confident expression.", "More stability and completion.", "More clarity and stronger boundaries.", "More calm and recovery capacity."]),
    q("If you could train only one ability, which would help most?", ["Planning and communication.", "Starting and showing up.", "Carrying through and finishing.", "Choosing and setting boundaries.", "Observing and recovering."]),
    q("Which reminder fits you best right now?", ["Clear the path, then grow forward.", "Stop waiting; make something happen.", "Open fewer loops and finish what matters.", "You do not need everything; choose clearly.", "Restore your judgement before choosing the next step."]),
  ],
};

export const FIVE_ELEMENT_UI: Record<Locale, UiCopy> = {
  "zh-Hant": {
    kicker: "五行功能測驗",
    title: "你現在最需要練哪一行？",
    intro: "不是看你缺什麼，而是看你現在更需要生長、啟動、落地、收斂，還是恢復。",
    progress: "當前狀態",
    resultKicker: "你的當前主軸",
    actionsTitle: "現在怎麼用",
    observeTitle: "先看什麼結果",
    excessTitle: "不要過頭",
    supportTitle: "你還可以借一點什麼力量",
    auraTitle: "靈光色彩提示",
    disclaimer: "這是依你目前 1–3 個月自報狀態做的功能傾向測驗，不等同八字喜用神；若已有完整八字報告，以八字結構分析為準。靈光色彩只作象徵提示，不是人體能量檢測。",
    overdrive: "你在壓力題也選中了同一功能的過度表現，所以現在要練的是它的健康版本，不是繼續加碼。",
    restart: "重新測一次",
    back: "回到趣味測驗",
  },
  "zh-Hans": {
    kicker: "五行功能测验",
    title: "你现在最需要练哪一行？",
    intro: "不是看你缺什么，而是看你现在更需要生长、启动、落地、收敛，还是恢复。",
    progress: "当前状态",
    resultKicker: "你的当前主轴",
    actionsTitle: "现在怎么用",
    observeTitle: "先看什么结果",
    excessTitle: "不要过头",
    supportTitle: "你还可以借一点什么力量",
    auraTitle: "灵光色彩提示",
    disclaimer: "这是按你目前 1–3 个月自报状态做的功能倾向测验，不等同八字喜用神；如果已有完整八字报告，以八字结构分析为准。灵光色彩只作象征提示，不是人体能量检测。",
    overdrive: "你在压力题也选中了同一功能的过度表现，所以现在要练的是它的健康版本，不是继续加码。",
    restart: "重新测一次",
    back: "回到趣味测验",
  },
  en: {
    kicker: "FIVE-ELEMENT FUNCTION TEST",
    title: "Which function do you need to strengthen right now?",
    intro: "This is not a 'what element are you missing?' test. It looks at whether you currently need more growth, activation, follow-through, boundaries or recovery.",
    progress: "Current state",
    resultKicker: "Your current focus",
    actionsTitle: "What to do now",
    observeTitle: "What to watch for",
    excessTitle: "Do not overdo it",
    supportTitle: "A useful secondary support",
    auraTitle: "Symbolic aura colours",
    disclaimer: "This reflects your self-reported state over the past 1–3 months. It is not a BaZi favourable-element reading. If you have a full BaZi report, use that structural analysis instead. Aura colours are symbolic, not an energy measurement.",
    overdrive: "You also chose the overused version of this function under pressure, so the goal is a healthier version of it—not simply more of the same.",
    restart: "Take the test again",
    back: "Back to fun tests",
  },
};

export const FIVE_ELEMENT_RESULTS: Record<Locale, Record<FiveElementKey, ResultCopy>> = {
  "zh-Hant": {
    wood: { name: "木", title: "生長與方向", core: "你現在不一定是沒能力，而是需要先把路理清、把堵點疏通，再讓新的東西長出來。", actions: ["只定一個未來 30 天主方向。", "把一個模糊目標拆成 3 個具體下一步。", "主動提出一次真實需求或開啟一次關鍵溝通。", "每週留一段學習與規劃時間。", "用伸展、步行等方式把僵住的狀態帶回流動。"], observe: "未來兩週，你是否更容易知道下一步是什麼，而不是一直增加新方向。", excess: "木不是越多越好。方向太多、同時開太多新坑或硬衝，都會讓生長變成消耗。", support: "可以借一點金的取捨：先砍掉不重要的分支，主方向才長得穩。", aura: { primary: "綠", secondary: ["藍", "金"], base: "米白", text: "綠色象徵生長與疏通，藍色幫助說清楚，少量金色提醒你做取捨。" } },
    fire: { name: "火", title: "啟動與表達", core: "你已經有內容或方向，現在真正需要的是讓它發生、被看見、被表達。", actions: ["選一件拖延的事，在 24 小時內完成第一步。", "把一個成果交給真正該看見的人。", "主動發出一次邀請、聯絡或提案。", "安排規律的有氧或節奏運動。", "把一天中最需要行動力的工作固定到一個時段。"], observe: "未來兩週，真正完成與公開的事情，是否比想做但沒做的事情更多。", excess: "火不是一直加速。躁進、過度曝光和情緒過熱，都會讓行動失去續航。", support: "可以借一點土的承接：每次啟動後都安排一個明確收尾。", aura: { primary: "紅", secondary: ["黃", "藍"], base: "暖白", text: "紅色象徵啟動，黃色強調自主與行動，少量藍色幫助表達更清楚。" } },
    earth: { name: "土", title: "承載與落地", core: "你現在需要的不是再加新東西，而是把已經重要的東西接穩、做完、留下來。", actions: ["暫停一個非必要的新項目。", "每天固定一件最重要的完成事項。", "把時間、錢或工作進度放進同一套可維護的流程。", "先收尾，再開新的。", "建立一個能維持四週的簡單作息節奏。"], observe: "未來兩週，未完成事項是否開始減少，重要事情是否變得更穩。", excess: "土過頭會變成什麼都自己扛、過度保守或拖著不動。穩定不是把所有東西都留下。", support: "可以借一點木的疏通：如果已經太重，先移開一個堵點再談穩定。", aura: { primary: "黃", secondary: ["紅", "綠"], base: "米棕", text: "黃色象徵承載與自我穩定，少量紅色提供推進，綠色保留成長空間。" } },
    metal: { name: "金", title: "邊界與結構", core: "你現在不缺更多選項，而是需要更清楚地決定什麼留下、什麼停止，以及你的標準在哪裡。", actions: ["刪掉一個明確低價值的承諾。", "把一件反覆模糊的人際界線說清楚。", "建立一條簡單可執行的判斷標準。", "整理一個最常使用的文件或工作系統。", "每天只保留三件真正重要的事。"], observe: "未來兩週，你是否更快做決定，也更少被不重要的人事物拉走。", excess: "金過頭會變成過度苛刻、切斷太快或把標準變成控制。界線要清楚，但仍要留彈性。", support: "可以借一點水的觀察：重大切割前，先給自己一晚冷卻時間。", aura: { primary: "白／銀", secondary: ["黃", "藍"], base: "灰米", text: "白銀色象徵清晰和界線，黃色提醒自主決定，藍色保留冷靜判斷。" } },
    water: { name: "水", title: "恢復與觀察", core: "你現在最需要的可能不是再努力，而是先把判斷力和恢復力收回來，再決定下一步。", actions: ["先補回一段不被打擾的休息時間。", "重要決定至少留一個觀察窗口。", "把現在最耗你的三件事寫下來。", "減少一個持續刺激你的資訊來源。", "安排步行、伸展或安靜獨處，讓思考重新變清楚。"], observe: "未來兩週，你是否更能分辨真正重要的事，而不是只靠疲勞或焦慮做決定。", excess: "水過頭會變成退縮、拖延或一直分析卻不行動。恢復之後仍要重新回到現實。", support: "可以借一點火的啟動：恢復到七成後，就選一件小事重新開始。", aura: { primary: "深藍", secondary: ["靛藍", "綠"], base: "霧白", text: "深藍象徵恢復與觀察，靛藍強調洞察，綠色提醒你休息是為了重新生長。" } },
  },
  "zh-Hans": {
    wood: { name: "木", title: "生长与方向", core: "你现在不一定是没能力，而是需要先把路理清、把堵点疏通，再让新的东西长出来。", actions: ["只定一个未来 30 天主方向。", "把一个模糊目标拆成 3 个具体下一步。", "主动提出一次真实需求或开启一次关键沟通。", "每周留一段学习与规划时间。", "用伸展、步行等方式把僵住的状态带回流动。"], observe: "未来两周，你是否更容易知道下一步是什么，而不是一直增加新方向。", excess: "木不是越多越好。方向太多、同时开太多新坑或硬冲，都会让生长变成消耗。", support: "可以借一点金的取舍：先砍掉不重要的分支，主方向才长得稳。", aura: { primary: "绿", secondary: ["蓝", "金"], base: "米白", text: "绿色象征生长与疏通，蓝色帮助说清楚，少量金色提醒你做取舍。" } },
    fire: { name: "火", title: "启动与表达", core: "你已经有内容或方向，现在真正需要的是让它发生、被看见、被表达。", actions: ["选一件拖延的事，在 24 小时内完成第一步。", "把一个成果交给真正该看见的人。", "主动发出一次邀请、联系或提案。", "安排规律的有氧或节奏运动。", "把一天中最需要行动力的工作固定到一个时段。"], observe: "未来两周，真正完成与公开的事情，是否比想做但没做的事情更多。", excess: "火不是一直加速。躁进、过度曝光和情绪过热，都会让行动失去续航。", support: "可以借一点土的承接：每次启动后都安排一个明确收尾。", aura: { primary: "红", secondary: ["黄", "蓝"], base: "暖白", text: "红色象征启动，黄色强调自主与行动，少量蓝色帮助表达更清楚。" } },
    earth: { name: "土", title: "承载与落地", core: "你现在需要的不是再加新东西，而是把已经重要的东西接稳、做完、留下来。", actions: ["暂停一个非必要的新项目。", "每天固定一件最重要的完成事项。", "把时间、钱或工作进度放进同一套可维护的流程。", "先收尾，再开新的。", "建立一个能维持四周的简单作息节奏。"], observe: "未来两周，未完成事项是否开始减少，重要事情是否变得更稳。", excess: "土过头会变成什么都自己扛、过度保守或拖着不动。稳定不是把所有东西都留下。", support: "可以借一点木的疏通：如果已经太重，先移开一个堵点再谈稳定。", aura: { primary: "黄", secondary: ["红", "绿"], base: "米棕", text: "黄色象征承载与自我稳定，少量红色提供推进，绿色保留成长空间。" } },
    metal: { name: "金", title: "边界与结构", core: "你现在不缺更多选项，而是需要更清楚地决定什么留下、什么停止，以及你的标准在哪里。", actions: ["删掉一个明确低价值的承诺。", "把一件反复模糊的人际边界说清楚。", "建立一条简单可执行的判断标准。", "整理一个最常使用的文件或工作系统。", "每天只保留三件真正重要的事。"], observe: "未来两周，你是否更快做决定，也更少被不重要的人事物拉走。", excess: "金过头会变成过度苛刻、切断太快或把标准变成控制。边界要清楚，但仍要留弹性。", support: "可以借一点水的观察：重大切割前，先给自己一晚冷却时间。", aura: { primary: "白／银", secondary: ["黄", "蓝"], base: "灰米", text: "白银色象征清晰和边界，黄色提醒自主决定，蓝色保留冷静判断。" } },
    water: { name: "水", title: "恢复与观察", core: "你现在最需要的可能不是再努力，而是先把判断力和恢复力收回来，再决定下一步。", actions: ["先补回一段不被打扰的休息时间。", "重要决定至少留一个观察窗口。", "把现在最耗你的三件事写下来。", "减少一个持续刺激你的信息来源。", "安排步行、伸展或安静独处，让思考重新变清楚。"], observe: "未来两周，你是否更能分辨真正重要的事，而不是只靠疲劳或焦虑做决定。", excess: "水过头会变成退缩、拖延或一直分析却不行动。恢复之后仍要重新回到现实。", support: "可以借一点火的启动：恢复到七成后，就选一件小事重新开始。", aura: { primary: "深蓝", secondary: ["靛蓝", "绿"], base: "雾白", text: "深蓝象征恢复与观察，靛蓝强调洞察，绿色提醒你休息是为了重新生长。" } },
  },
  en: {
    wood: { name: "Wood", title: "Growth and direction", core: "You may not lack ability. The immediate need is to clear the path, choose a direction and create room for something new to grow.", actions: ["Choose one main direction for the next 30 days.", "Turn one vague goal into three concrete next steps.", "Make one clear request or start one important conversation.", "Protect a weekly block for learning and planning.", "Use walking or stretching to shift from feeling stuck into movement."], observe: "Over the next two weeks, is it easier to know the next step instead of creating more directions?", excess: "More Wood is not always better. Too many new directions or forcing growth can become another form of overload.", support: "Borrow a little Metal: cut one low-value branch so the main direction has room to grow.", aura: { primary: "green", secondary: ["blue", "gold"], base: "ivory", text: "Green symbolises growth, blue supports clear communication and a small amount of gold represents selection." } },
    fire: { name: "Fire", title: "Activation and expression", core: "You already have enough content or direction. What is missing is movement: making it happen, showing it and expressing it clearly.", actions: ["Take the first step on one delayed task within 24 hours.", "Put one piece of work in front of the person who actually needs to see it.", "Send one invitation, message or proposal proactively.", "Add regular aerobic or rhythm-based movement.", "Give your most action-heavy task a fixed time of day."], observe: "Over the next two weeks, are more things being completed or shared rather than only planned?", excess: "Fire is not constant acceleration. Overexposure, rushing and emotional overheating reduce consistency.", support: "Borrow a little Earth: every launch needs a clear follow-through and finish point.", aura: { primary: "red", secondary: ["yellow", "blue"], base: "warm white", text: "Red symbolises activation, yellow highlights agency and blue keeps expression clear." } },
    earth: { name: "Earth", title: "Stability and follow-through", core: "You do not need another new thing. You need to hold what already matters, complete it and make it sustainable.", actions: ["Pause one non-essential new project.", "Choose one important completion task each day.", "Put time, money or project progress into one maintainable system.", "Finish before opening another loop.", "Build one simple routine you can keep for four weeks."], observe: "Over the next two weeks, are unfinished items decreasing and important commitments becoming steadier?", excess: "Too much Earth becomes carrying everything yourself, over-caution or staying stuck. Stability does not mean keeping everything.", support: "Borrow a little Wood: if the load is already too heavy, clear one blockage before adding more structure.", aura: { primary: "yellow", secondary: ["red", "green"], base: "warm beige", text: "Yellow symbolises stable agency, red adds momentum and green leaves room for growth." } },
    metal: { name: "Metal", title: "Boundaries and structure", core: "You do not need more options. You need a clearer decision about what stays, what stops and what standard you are using.", actions: ["Remove one clearly low-value commitment.", "State one boundary that has stayed vague for too long.", "Create one simple decision rule you can actually use.", "Clean up one frequently used file or work system.", "Keep only three genuinely important tasks each day."], observe: "Over the next two weeks, are decisions faster and distractions less able to pull you off course?", excess: "Too much Metal becomes rigidity, excessive criticism or cutting things off too quickly. Clear boundaries still need proportion.", support: "Borrow a little Water: before a major cut, give yourself one night to cool down and observe.", aura: { primary: "white / silver", secondary: ["yellow", "blue"], base: "soft grey", text: "White and silver symbolise clarity and boundaries; yellow supports agency and blue keeps judgement calm." } },
    water: { name: "Water", title: "Recovery and observation", core: "The immediate need may not be more effort. First recover enough judgement and capacity to see the next step clearly.", actions: ["Restore one block of uninterrupted rest.", "Give important decisions a defined observation window.", "Write down the three things draining you most right now.", "Reduce one information source that keeps you overstimulated.", "Use walking, stretching or quiet time to let your thinking settle."], observe: "Over the next two weeks, can you identify what actually matters without deciding from exhaustion or anxiety?", excess: "Too much Water becomes withdrawal, delay or endless analysis. Recovery should eventually return you to action.", support: "Borrow a little Fire: once you feel about 70% recovered, restart with one small visible action.", aura: { primary: "deep blue", secondary: ["indigo", "green"], base: "mist white", text: "Deep blue symbolises recovery, indigo supports insight and green reminds you that rest is meant to support renewed growth." } },
  },
};

const ORDER: FiveElementKey[] = ["wood", "fire", "earth", "metal", "water"];
const TIE_BREAK_QUESTION_INDEXES = [3, 10, 11, 0];

export function scoreFiveElementAnswers(answers: FiveElementKey[]): FiveElementScore | null {
  if (answers.length !== 12) return null;
  const counts = Object.fromEntries(ORDER.map((key) => [key, 0])) as Record<FiveElementKey, number>;
  for (const answer of answers) counts[answer] += 1;
  const highest = Math.max(...ORDER.map((key) => counts[key]));
  const tied = ORDER.filter((key) => counts[key] === highest);
  let primary = tied[0];
  if (tied.length > 1) {
    const decisive = TIE_BREAK_QUESTION_INDEXES.map((index) => answers[index]).find((key) => tied.includes(key));
    if (decisive) primary = decisive;
  }
  const ranked = ORDER.filter((key) => key !== primary).sort((a, b) => counts[b] - counts[a] || ORDER.indexOf(a) - ORDER.indexOf(b));
  const runnerUp = ranked[0] ?? null;
  const secondary = runnerUp && counts[primary] - counts[runnerUp] <= 1 ? runnerUp : null;
  return { primary, secondary, overdrive: answers[8] === primary };
}
