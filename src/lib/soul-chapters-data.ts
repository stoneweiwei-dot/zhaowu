/**
 * 昭梧 · 灵阶十章 — 原创叙事原型数据
 *
 * 灵阶是十种理解人生的方式，不是十个人的高低。
 * 结果来自用户对当下生活的回答或自行选择。
 * 不声称能科学测量灵魂年龄、前世次数或人生结局。
 * 不与 Michael Newton Institute 或 Michael Teachings 有关联或认证。
 *
 * 此文件为纯展示数据，不接入八字算法，不参与命盘计算。
 */

export type Locale = "zh-Hant" | "zh-Hans" | "en";

export interface SoulChapterField {
  /** 在天 — sky imagery */
  sky: string;
  /** 在地 — land imagery */
  land: string;
  /** 命象短句 — one-line essence */
  line: string;
  /** 正式正文 — main reading */
  reading: string;
  /** 昭梧提示 — zhaowu note */
  note: string;
  /** 今天做一件事 — actionable step */
  tryToday: string;
}

export interface SoulChapter {
  /** 编号 01–10 */
  number: number;
  /** URL slug */
  slug: string;
  /** 组别名 */
  group: string;
  /** 关键词 */
  keywords: string;
  /** 三语文案 */
  fields: Record<Locale, SoulChapterField & { title: string; titleEn: string }>;
}

/** 五组叙事节奏 */
export const CHAPTER_GROUPS: Record<Locale, { name: string; range: string }[]> = {
  "zh-Hant": [
    { name: "初識人間", range: "01–02" },
    { name: "卷入洪流", range: "03–04" },
    { name: "建功立業", range: "05–06" },
    { name: "向內反思", range: "07–08" },
    { name: "歸整與澄明", range: "09–10" },
  ],
  "zh-Hans": [
    { name: "初识人间", range: "01–02" },
    { name: "卷入洪流", range: "03–04" },
    { name: "建功立业", range: "05–06" },
    { name: "向内反思", range: "07–08" },
    { name: "归整与澄明", range: "09–10" },
  ],
  en: [
    { name: "First Encounters", range: "01–02" },
    { name: "Joining the Current", range: "03–04" },
    { name: "Making Your Mark", range: "05–06" },
    { name: "Turning Inward", range: "07–08" },
    { name: "Clarity & Ease", range: "09–10" },
  ],
};

/** 共用说明文案 */
export const CHAPTER_DISCLAIMER: Record<Locale, string> = {
  "zh-Hant":
    "靈階是十種理解人生的方式，不是十個人的高低。結果來自你對當下生活的回答或自行選擇。它可以陪你反思，但不能證明靈魂年齡、前世次數或人生結局。你可隨時重選。",
  "zh-Hans":
    "灵阶是十种理解人生的方式，不是十个人的高低。结果来自你对当下生活的回答或自行选择。它可以陪你反思，但不能证明灵魂年龄、前世次数或人生结局。你可随时重选。",
  en: "Ten ways to reflect on life, not a ranking of people. Your chapter comes from your answers or your own choice. It isn't a scientific measure of soul age or past lives. You can change your chapter whenever you like.",
};

/** 对外总标 */
export const CHAPTER_TITLE_PROMPT: Record<Locale, string> = {
  "zh-Hant": "人生有十章，哪一章最像現在的你？",
  "zh-Hans": "人生有十章，哪一章最像现在的你？",
  en: "Ten life chapters. Which one feels like yours right now?",
};

export const SOUL_CHAPTERS: SoulChapter[] = [
  {
    number: 1,
    slug: "mengya",
    group: "初識人間",
    keywords: "感受・起點・好奇・試探",
    fields: {
      "zh-Hant": {
        title: "萌芽",
        titleEn: "First Light",
        sky: "春雪初融，雲隙透光。",
        land: "濕潤泥土，一粒種子剛剛鬆動。",
        line: "有些開始很小，小到只有自己聽見。",
        reading:
          "你正在接觸一件全新的事，還說不清它會把生活帶去哪裡。未知不一定代表沒準備好，也可能是經驗還沒長成形狀。與其急著知道最後的答案，不如先照顧好眼前最基本的需要：休息、觀察、嘗試，以及承認自己有不懂的地方。",
        note: "不必一下子懂得全部。願意試第一步，已經很重要。",
        tryToday: "選一件想開始的事，只做十分鐘；記下你感覺如何。",
      },
      "zh-Hans": {
        title: "萌芽",
        titleEn: "First Light",
        sky: "春雪初融，云隙透光。",
        land: "湿润泥土，一粒种子刚刚松动。",
        line: "有些开始很小，小到只有自己听见。",
        reading:
          "你正在接触一件全新的事，还说不清它会把生活带去哪里。未知不一定代表没准备好，也可能是经验还没长成形状。与其急着知道最后的答案，不如先照顾好眼前最基本的需要：休息、观察、尝试，以及承认自己有不懂的地方。",
        note: "不必一下子懂得全部。愿意试第一步，已经很重要。",
        tryToday: "选一件想开始的事，只做十分钟；记下你感觉如何。",
      },
      en: {
        title: "First Light",
        titleEn: "First Light",
        sky: "Winter snow softens; light slips between the clouds.",
        land: "Damp earth; a seed begins to stir.",
        line: "Some beginnings are so small only you can hear them.",
        reading:
          "Something new has entered your life, and you don't know where it will lead. That's fine. You don't have to understand the whole journey before taking the first step. Pay attention to what you need, try something manageable, and give yourself room to learn.",
        note: "You can start before you feel ready.",
        tryToday: "Spend ten minutes on one new thing. Notice how it feels.",
      },
    },
  },
  {
    number: 2,
    slug: "chuti",
    group: "初識人間",
    keywords: "表達・需要・回應・信任",
    fields: {
      "zh-Hant": {
        title: "初啼",
        titleEn: "Finding Your Voice",
        sky: "清晨微光，鳥聲漸起。",
        land: "溪邊嫩芽，枝上新羽。",
        line: "一句真心話，是與世界握手的開始。",
        reading:
          "你也許正在練習說清楚自己的需求。過去習慣忍耐、看人臉色，現在開始明白：別人並不總能猜出你想要什麼。表達不等於任性，說出界線也不是拒絕所有關係。當你能溫和而直接地說話，很多誤會反而有機會鬆開。",
        note: "讓別人理解你，比等別人猜中你，更省力。",
        tryToday: "用一句「我希望……因為……」說出一個具體需求。",
      },
      "zh-Hans": {
        title: "初啼",
        titleEn: "Finding Your Voice",
        sky: "清晨微光，鸟声渐起。",
        land: "溪边嫩芽，枝上新羽。",
        line: "一句真心话，是与世界握手的开始。",
        reading:
          "你也许正在练习说清楚自己的需求。过去习惯忍耐、看人脸色，现在开始明白：别人并不总能猜出你想要什么。表达不等于任性，说出界线也不是拒绝所有关系。当你能温和而直接地说话，很多误会反而有机会松开。",
        note: "让别人理解你，比等别人猜中你，更省力。",
        tryToday: "用一句「我希望……因为……」说出一个具体需求。",
      },
      en: {
        title: "Finding Your Voice",
        titleEn: "Finding Your Voice",
        sky: "Early light arrives with the first birdsong.",
        land: "New shoots beside a stream.",
        line: "One honest sentence can begin a better connection.",
        reading:
          "You may be learning to say what you need instead of hoping other people will guess. Being direct doesn't make you demanding, and having boundaries doesn't mean shutting people out. Clear, kind words can make everyday relationships easier.",
        note: "Being understood often starts with speaking up.",
        tryToday: "Say one need plainly: \"I'd like… because…\"",
      },
    },
  },
  {
    number: 3,
    slug: "tanxian",
    group: "卷入洪流",
    keywords: "探索・融入・練習・同伴",
    fields: {
      "zh-Hant": {
        title: "探險",
        titleEn: "Finding Your Place",
        sky: "春雷輕響，草木向陽。",
        land: "開闊平原，林間小徑分岔。",
        line: "走進人群，是為了學會走自己的路。",
        reading:
          "你想認識新的人，也想找到適合自己的位置。向別人學習，是每個人都會經歷的階段；問題不在模仿，而在長久忘了問自己是否喜歡。你可以參與、嘗試、犯錯，再慢慢留下真正適合自己的選擇。歸屬感不是把自己改得和所有人一模一樣。",
        note: "先去看看世界，再決定哪些東西值得帶回來。",
        tryToday: "試一個新活動，結束後寫下「我真正喜歡的是什麼」。",
      },
      "zh-Hans": {
        title: "探险",
        titleEn: "Finding Your Place",
        sky: "春雷轻响，草木向阳。",
        land: "开阔平原，林间小径分岔。",
        line: "走进人群，是为了学会走自己的路。",
        reading:
          "你想认识新的人，也想找到适合自己的位置。向别人学习，是每个人都会经历的阶段；问题不在模仿，而在长久忘了问自己是否喜欢。你可以参与、尝试、犯错，再慢慢留下真正适合自己的选择。归属感不是把自己改得和所有人一模一样。",
        note: "先去看看世界，再决定哪些东西值得带回来。",
        tryToday: "试一个新活动，结束后写下「我真正喜欢的是什么」。",
      },
      en: {
        title: "Finding Your Place",
        titleEn: "Finding Your Place",
        sky: "Spring thunder rolls gently over growing fields.",
        land: "An open plain with paths branching through trees.",
        line: "Join the world without losing your own direction.",
        reading:
          "You may be looking for your place among other people. Learning from them is useful, but belonging shouldn't mean becoming a copy of everyone else. Explore, try, make mistakes and keep what feels right for you.",
        note: "Be curious about the world and honest about your preferences.",
        tryToday: "Try something new, then note what you genuinely enjoyed.",
      },
    },
  },
  {
    number: 4,
    slug: "zhengdou",
    group: "卷入洪流",
    keywords: "競爭・界線・比較・自重",
    fields: {
      "zh-Hant": {
        title: "爭鬥",
        titleEn: "Learning to Stand Your Ground",
        sky: "日光明朗，山風吹急。",
        land: "山徑漸陡，林木各向天光。",
        line: "想贏沒什麼錯，別把自己也輸進去了。",
        reading:
          "你可能正處在必須爭取資源、位置或認可的時刻。比較會帶來動力，也可能讓人忘記最初為何出發。這一章不是勸你退出競爭，而是學會辨別：哪些值得全力以赴，哪些只是別人的標準。真正穩定的自尊，不需要每次都靠贏過誰來證明。",
        note: "把力氣用在真正重要的戰場，其他事容許自己放下。",
        tryToday: "寫下目前最在意的一場比較，問自己：即使沒人看見，我仍想做嗎？",
      },
      "zh-Hans": {
        title: "争斗",
        titleEn: "Learning to Stand Your Ground",
        sky: "日光明朗，山风吹急。",
        land: "山径渐陡，林木各向天光。",
        line: "想赢没什么错，别把自己也输进去了。",
        reading:
          "你可能正处在必须争取资源、位置或认可的时刻。比较会带来动力，也可能让人忘记最初为何出发。这一章不是劝你退出竞争，而是学会辨别：哪些值得全力以赴，哪些只是别人的标准。真正稳定的自尊，不需要每次都靠赢过谁来证明。",
        note: "把力气用在真正重要的战场，其他事容许自己放下。",
        tryToday: "写下目前最在意的一场比较，问自己：即使没人看见，我仍想做吗？",
      },
      en: {
        title: "Learning to Stand Your Ground",
        titleEn: "Learning to Stand Your Ground",
        sky: "Clear sunshine; a brisk wind moves over the ridge.",
        land: "A steep path where trees reach for the light.",
        line: "It's fine to want to win. Just don't lose yourself trying.",
        reading:
          "You may be competing for recognition, opportunities or stability. Competition can motivate you, but constant comparison can also wear you down. Decide which goals are genuinely yours and which come from other people's expectations.",
        note: "Save your energy for the things that matter.",
        tryToday: "Name one comparison you can stop making this week.",
      },
    },
  },
  {
    number: 5,
    slug: "jiangong",
    group: "建功立業",
    keywords: "目標・建設・責任・成就",
    fields: {
      "zh-Hant": {
        title: "建功",
        titleEn: "Making Your Mark",
        sky: "午陽穩照，天色開闊。",
        land: "大道通行，城郭漸成。",
        line: "把想法做成事情，是一種踏實的光。",
        reading:
          "你不只想想明白，還想把事情做出來。工作、作品、事業，或是一個經營多年的家，都可能是你正在建造的東西。追求成果並不庸俗；只要你知道自己為誰而做、付出的代價是否值得。能走得長遠的人，懂得把野心、能力與休息安排在同一張圖上。",
        note: "你可以很有企圖心，也可以給自己過日子的時間。",
        tryToday: "為手上最重要的計畫寫下下一個可交付成果和完成日期。",
      },
      "zh-Hans": {
        title: "建功",
        titleEn: "Making Your Mark",
        sky: "午阳稳照，天色开阔。",
        land: "大道通行，城郭渐成。",
        line: "把想法做成事情，是一种踏实的光。",
        reading:
          "你不止想想明白，还想把事情做出来。工作、作品、事业，或是一个经营多年的家，都可能是你正在建造的东西。追求成果并不庸俗；只要你知道自己为谁而做、付出的代价是否值得。能走得长远的人，懂得把野心、能力与休息安排在同一张图上。",
        note: "你可以很有企图心，也可以给自己过日子的时间。",
        tryToday: "为手上最重要的计划写下下一个可交付成果和完成日期。",
      },
      en: {
        title: "Making Your Mark",
        titleEn: "Making Your Mark",
        sky: "Midday sunlight fills a wide, open sky.",
        land: "Roads connect a growing town.",
        line: "Turning an idea into something real is its own kind of light.",
        reading:
          "You're ready to build, finish and make an impact. That might mean your career, a creative project or a home you've worked hard for. Ambition isn't shallow. Just make sure your goals reflect what matters to you and leave room for a life outside your to-do list.",
        note: "Build something meaningful without running yourself into the ground.",
        tryToday: "Set one clear deliverable and a realistic date.",
      },
    },
  },
  {
    number: 6,
    slug: "aizeng",
    group: "建功立業",
    keywords: "感情・投入・期待・鬆手",
    fields: {
      "zh-Hant": {
        title: "愛憎",
        titleEn: "The Heart of Things",
        sky: "霞光映雲，晚風起落。",
        land: "河岸燈火，窗內人聲往來。",
        line: "情深不必苦深，真心也要有分寸。",
        reading:
          "人際關係可能正佔據你很多心力。你在意一個人，也在意對方是否同樣看重你。投入會帶來親密，過度揣測卻容易讓好意變成消耗。這一章提醒你把感受說清楚，也看對方是否願意共同承擔。愛不是一方忍耐到底，離開也不一定代表誰失敗。",
        note: "關係值得經營，但你也值得被好好對待。",
        tryToday: "只談一個具體困擾，說感受、說期待，不先替對方下結論。",
      },
      "zh-Hans": {
        title: "爱憎",
        titleEn: "The Heart of Things",
        sky: "霞光映云，晚风起落。",
        land: "河岸灯火，窗内人声往来。",
        line: "情深不必苦深，真心也要有分寸。",
        reading:
          "人际关系可能正占据你很多心力。你在意一个人，也在意对方是否同样看重你。投入会带来亲密，过度揣测却容易让好意变成消耗。这一章提醒你把感受说清楚，也看对方是否愿意共同承担。爱不是一方忍耐到底，离开也不一定代表谁失败。",
        note: "关系值得经营，但你也值得被好好对待。",
        tryToday: "只谈一个具体困扰，说感受、说期待，不先替对方下结论。",
      },
      en: {
        title: "The Heart of Things",
        titleEn: "The Heart of Things",
        sky: "Evening clouds glow as the wind changes.",
        land: "Warm windows along a riverside street.",
        line: "Deep feelings need not mean endless hurt.",
        reading:
          "A relationship may be taking up a lot of your attention. Caring deeply can bring closeness, but guessing what someone else thinks can become exhausting. Speak clearly about your needs, and notice whether the effort is shared. Love should not require you to disappear.",
        note: "Care for the relationship and for yourself.",
        tryToday: "Raise one issue calmly and ask for one practical change.",
      },
    },
  },
  {
    number: 7,
    slug: "fansi",
    group: "向內反思",
    keywords: "停看・重估・意義・取捨",
    fields: {
      "zh-Hant": {
        title: "反思",
        titleEn: "A Different Question",
        sky: "夕光落野，秋風穿林。",
        land: "竹影稀疏，院中石階微涼。",
        line: "不是路走錯了，而是你想問的問題變了。",
        reading:
          "過去讓你努力的目標，現在未必還能打動你。這不代表那些努力白費；它們可能已經完成了當時的任務。與其急著推翻一切，不妨檢查手上的工作、關係與習慣，哪些仍有價值，哪些只是怕改變才繼續。反思不是停滯，而是在下一次前行之前，把方向看清楚。",
        note: "允許自己換答案，不必否定過去的自己。",
        tryToday: "列出三件正在耗費你精力的事，挑一件試著縮減。",
      },
      "zh-Hans": {
        title: "反思",
        titleEn: "A Different Question",
        sky: "夕光落野，秋风穿林。",
        land: "竹影稀疏，院中石阶微凉。",
        line: "不是路走错了，而是你想问的问题变了。",
        reading:
          "过去让你努力的目标，现在未必还能打动你。这不代表那些努力白费；它们可能已经完成了当时的任务。与其急着推翻一切，不妨检查手上的工作、关系与习惯，哪些仍有价值，哪些只是怕改变才继续。反思不是停滞，而是在下一次前行之前，把方向看清楚。",
        note: "允许自己换答案，不必否定过去的自己。",
        tryToday: "列出三件正在耗费你精力的事，挑一件试着缩减。",
      },
      en: {
        title: "A Different Question",
        titleEn: "A Different Question",
        sky: "Late sunlight passes through an autumn breeze.",
        land: "A quiet bamboo courtyard and cool stone steps.",
        line: "Maybe the road hasn't failed you. Maybe your questions have changed.",
        reading:
          "Goals that once motivated you may no longer feel quite right. That doesn't mean the effort was wasted. Take stock of what still matters and what you're continuing only out of habit or fear of change. Reflection can help you move forward with more intention.",
        note: "You can change direction without rejecting your past.",
        tryToday: "Reduce one commitment that no longer serves you.",
      },
    },
  },
  {
    number: 8,
    slug: "poju",
    group: "向內反思",
    keywords: "更新・選擇・界線・轉向",
    fields: {
      "zh-Hant": {
        title: "破局",
        titleEn: "Choosing a New Way",
        sky: "夜雨過後，天色漸清。",
        land: "溪流轉彎，石橋通向另一岸。",
        line: "不是所有規矩，都值得用一生去守。",
        reading:
          "你開始看出一套舊方法的限制，也正在尋找新出口。改變未必要轟轟烈烈；有時只是拒絕不合理的要求、重新談條件、換一種工作節奏。破局不是什麼都不要，而是把真正重要的東西留下來，再給它一個更適合生長的地方。",
        note: "先試一個可逆的小改變，再決定要不要走更遠。",
        tryToday: "找出一個卡點，設計不傷及基本生活的七天小試驗。",
      },
      "zh-Hans": {
        title: "破局",
        titleEn: "Choosing a New Way",
        sky: "夜雨过后，天色渐清。",
        land: "溪流转弯，石桥通向另一岸。",
        line: "不是所有规矩，都值得用一生去守。",
        reading:
          "你开始看出一套旧方法的限制，也正在寻找新出口。改变未必轰轰烈烈；有时只是拒绝不合理的要求、重新谈条件、换一种工作节奏。破局不是什么都不要，而是把真正重要的东西留下来，再给它一个更适合生长的地方。",
        note: "先试一个可逆的小改变，再决定要不要走更远。",
        tryToday: "找出一个卡点，设计不伤及基本生活的七天小试验。",
      },
      en: {
        title: "Choosing a New Way",
        titleEn: "Choosing a New Way",
        sky: "Rain passes; the night sky begins to clear.",
        land: "A stream bends beneath a bridge to another bank.",
        line: "Not every rule deserves a lifetime of obedience.",
        reading:
          "You may be noticing that an old way of working or relating no longer helps. Change needn't be dramatic. It may start with one boundary, one conversation or a new routine. Keep what matters and create space for it to grow differently.",
        note: "Try a small, reversible change before a big leap.",
        tryToday: "Design a seven-day experiment around one frustration.",
      },
    },
  },
  {
    number: 9,
    slug: "guiyin",
    group: "歸整與澄明",
    keywords: "安靜・整理・修復・距離",
    fields: {
      "zh-Hant": {
        title: "歸隱",
        titleEn: "Returning Inward",
        sky: "雪霽微明，遠山含青。",
        land: "江邊小屋，一燈隔窗而暖。",
        line: "走過喧鬧，終於知道安靜也是一種力量。",
        reading:
          "你可能不再想把時間用在每場熱鬧和爭辯裡。獨處對你而言，是梳理思緒、恢復精力的方式，而不是否定人群。若家人、關係或舊經歷仍牽動你，可以慢慢辨認哪些責任屬於自己，哪些不必獨自承擔。真正的歸隱，不是消失，而是讓自己的生活有可呼吸的空間。",
        note: "給自己一段清靜，也保留能求助與連結的門。",
        tryToday: "安排半小時不被打擾的時間，處理一件拖延已久的小事。",
      },
      "zh-Hans": {
        title: "归隐",
        titleEn: "Returning Inward",
        sky: "雪霁微明，远山含青。",
        land: "江边小屋，一灯隔窗而暖。",
        line: "走过喧闹，终于知道安静也是一种力量。",
        reading:
          "你可能不再想把时间用在每场热闹和争辩里。独处对你而言，是梳理思绪、恢复精力的方式，而不是否定人群。若家人、关系或旧经历仍牵动你，可以慢慢辨认哪些责任属于自己，哪些不必独自承担。真正的归隐，不是消失，而是让自己的生活有可呼吸的空间。",
        note: "给自己一段清静，也保留能求助与连结的门。",
        tryToday: "安排半小时不被打扰的时间，处理一件拖延已久的小事。",
      },
      en: {
        title: "Returning Inward",
        titleEn: "Returning Inward",
        sky: "Snow clears; distant hills emerge in soft light.",
        land: "A cottage by the river; warm light behind a window.",
        line: "After the noise, quiet can become a kind of strength.",
        reading:
          "You may have less interest in every argument, invitation or expectation. Solitude can help you reset, but it doesn't have to mean cutting yourself off. Notice what you truly need to carry, and what belongs to someone else. Make room for calm while staying connected to people you trust.",
        note: "Protect your peace without closing every door.",
        tryToday: "Take thirty uninterrupted minutes for yourself.",
      },
    },
  },
  {
    number: 10,
    slug: "guizhen",
    group: "歸整與澄明",
    keywords: "清明・簡淨・寬和・自在",
    fields: {
      "zh-Hant": {
        title: "歸真",
        titleEn: "Living Simply, Fully",
        sky: "明月高懸，天光澄澈。",
        land: "寬闊江面，一葉小舟緩行。",
        line: "不必把日子過成傳奇，也可以過得很有光。",
        reading:
          "你愈來愈清楚什麼值得留在生活裡，什麼只是外界的聲音。簡單並不代表沒有追求，而是願意把力氣放在喜歡的人、用得上的本事和真實的快樂上。你仍可能迷惘、生氣或受傷；所謂歸真，並不是超凡脫俗，而是一次次在現實中，練習更誠實地生活。",
        note: "自在不是什麼都有，而是更懂得選擇。",
        tryToday: "挑出一個真正喜歡的日常片刻，特意把它留在行程裡。",
      },
      "zh-Hans": {
        title: "归真",
        titleEn: "Living Simply, Fully",
        sky: "明月高悬，天光澄澈。",
        land: "宽阔江面，一叶小舟缓行。",
        line: "不必把日子过成传奇，也可以过得很有光。",
        reading:
          "你越来越清楚什么值得留在生活里，什么只是外界的声音。简单并不代表没有追求，而是愿意把力气放在喜欢的人、用得上的本事和真实的快乐上。你仍可能迷惘、生气或受伤；所谓归真，并不是超凡脱俗，而是一次次在现实中，练习更诚实地生活。",
        note: "自在不是什么都有，而是更懂得选择。",
        tryToday: "挑出一个真正喜欢的日常片刻，特意把它留在行程里。",
      },
      en: {
        title: "Living Simply, Fully",
        titleEn: "Living Simply, Fully",
        sky: "A bright moon over a clear, open sky.",
        land: "A small boat crossing a wide, calm river.",
        line: "Life doesn't have to be extraordinary to feel meaningful.",
        reading:
          "You may be getting clearer about what deserves your time. Simplicity doesn't mean giving up ambition; it means choosing people, work and experiences that feel worthwhile. You'll still have difficult days. This chapter is about living honestly through them, not becoming perfectly enlightened.",
        note: "Freedom often comes from knowing what to choose.",
        tryToday: "Protect one small part of the day that genuinely brings you joy.",
      },
    },
  },
];

/** 按 slug 查找单章 */
export function findChapter(slug: string): SoulChapter | undefined {
  return SOUL_CHAPTERS.find((c) => c.slug === slug);
}
