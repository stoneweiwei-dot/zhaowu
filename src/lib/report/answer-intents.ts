/**
 * Topic intents for the customer first-screen answer (zh-Hant).
 *
 * Each intent is a specific kind of question people actually ask (reconcile
 * with an ex, boss targeting me, debt, 犯太歲, …). An intent supplies a plain
 * lead sentence, an optional reason sentence and a next step. Chart-specific
 * parts only read values the engine already produced (strength tendency,
 * stem/branch tells, `chart.useful`, natal pillars, the year ranking); nothing
 * here recomputes the chart or adds a new verdict about it.
 *
 * Where the chart genuinely cannot answer (does my partner cheat, will I win
 * the lottery, how is my parent's health), the intent says so plainly and
 * moves to what the person can actually do.
 *
 * Each lead/reason is exactly one sentence (one 。) so the first screen stays
 * within the 3-sentence contract (docs/FOCUSED-REPORT.md §1).
 */
import { analyzeBranchRelations, natalBranchPoints } from "@/lib/bazi/branch-relations";
import { COLOR_OF_ELEMENT } from "@/lib/bazi/constants";
import type { Chart, Element } from "@/lib/bazi/types";

export type IntentTopic = "career" | "money" | "love" | "health" | "home" | "self";
export type IntentGrade = "up" | "mixed" | "down";

export type IntentCtx = {
  chart: Chart;
  question: string;
  /** 今年 / 明年 … */
  y: string;
  grade: IntentGrade;
  strong: boolean;
  /** Plain "long suit" and "watch out" phrases from the day-master tell (already zh-Hant). */
  gift: string;
  risk: string;
  /** First sentence of the engine's work text, without the final 。 */
  work: string;
  /** Branch (地支) of the target year, e.g. 午. */
  yearBranch: string;
  /** "this year's" word to use inside a sentence. */
  yearLabel: string;
  /** Month-level read, only filled for the this-month / next-month intent. */
  monthLabel: string;
  monthGrade: IntentGrade;
};

export type Intent = {
  id: string;
  re: RegExp;
  topic: IntentTopic;
  /** good = list the better months, caution = list the slower months, none = no month sentence. */
  timing: "good" | "caution" | "none";
  lead: (c: IntentCtx) => string;
  reason?: (c: IntentCtx) => string;
  next: (c: IntentCtx) => string;
};

const yearDo = (c: IntentCtx, up: string, mixed: string, down: string): string =>
  c.grade === "up" ? up : c.grade === "down" ? down : mixed;

const NATAL_LABEL: Record<string, string> = { year: "出生年", month: "出生月", day: "日", time: "出生時辰" };

function taisui(c: IntentCtx): { hits: string[]; helps: string[]; same: boolean } {
  const natal = natalBranchPoints(c.chart).filter((p) => ["natal:year", "natal:day"].includes(p.id));
  const same = natal.some((p) => p.id === "natal:year" && p.branch === c.yearBranch);
  const points = [...natal, { id: "year:target", branch: c.yearBranch, source: "year", label: "流年" }];
  const rels = analyzeBranchRelations(points).filter((r) => r.participants.some((p) => p.id === "year:target"));
  const hits: string[] = [];
  const helps: string[] = [];
  for (const r of rels) {
    const other = r.participants.find((p) => p.id !== "year:target");
    if (!other) continue;
    const where = NATAL_LABEL[other.id.replace("natal:", "")] ?? "";
    const text = `${c.yearBranch}和你${where}支${other.branch}${r.kind === "六沖" ? "相沖" : r.kind === "六合" ? "相合" : r.kind}`;
    if (r.kind === "六沖" || r.kind === "相刑" || r.kind === "自刑" || r.kind === "六害" || r.kind === "相破") hits.push(text);
    else if (r.kind === "六合") helps.push(text);
  }
  return { hits, helps, same };
}

export const INTENTS: Intent[] = [
  // ───────── 感情 ─────────
  {
    id: "love.suspect",
    re: /(男朋友|女朋友|老公|老婆|先生|太太|伴侶|伴侣|對象|对象|另一半|男友|女友).{0,10}(有沒有|是不是|會不會|会不会).{0,8}(別人|別的|外面|劈腿|出軌|出轨|變心|变心|騙我|骗我|說謊|说谎)|劈腿|變心|变心/,
    topic: "love",
    timing: "none",
    lead: () => "對方有沒有別人，命盤看不出來，也不該拿命盤替你下結論，這件事要靠具體事實和當面談清楚。",
    reason: () => "先分清楚你看到的是事實還是感覺：有沒有對得上的時間、訊息或行為，再決定要不要攤開講。",
    next: () => "把你看到的具體事實列出來（日期、事件），挑一個冷靜的時間直接問，不要靠猜或逼問。",
  },
  {
    id: "love.reconcile",
    re: /復合|复合|前任|前男友|前女友|前夫|前妻|舊情|旧情|回頭找|回头找|重新在一起/,
    topic: "love",
    timing: "good",
    lead: () => "要不要復合，命盤不能替你拍板，關鍵是當初分開的原因有沒有真的改變。",
    reason: () => "先看對方這次有沒有具體改變的行動，而不是只有想念或道歉，你自己也要確認能不能接受同樣的相處模式。",
    next: () => "寫下當初分開的三個原因，逐一問自己：現在有哪一件真的不一樣了？",
  },
  {
    id: "love.crush",
    re: /忽冷忽熱|忽冷忽热|暗戀|暗恋|喜歡的人|喜欢的人|有意思|曖昧|暧昧|有感覺|有感觉|告白|表白|追他|追她|被追/,
    topic: "love",
    timing: "good",
    lead: () => "對方有沒有意思，命盤看不出來，要看對方有沒有主動聯絡、主動約你、回應有沒有誠意。",
    reason: () => "曖昧超過三個月還沒有任何進展，通常不是時機問題，而是對方沒有要往前走。",
    next: () => "主動約一次明確的見面，看對方是具體排出時間，還是含糊帶過。",
  },
  {
    id: "love.family",
    re: /(父母|爸媽|爸妈|媽媽|妈妈|媽|妈|爸|家人|家裡|家里|婆婆|公公).{0,8}(逼|催|反對|反对|不同意|干涉|不喜歡|不喜欢)|逼我.{0,4}(結婚|结婚|相親|相亲)|被逼婚|逼婚|催婚/,
    topic: "love",
    timing: "none",
    lead: () => "被家人催婚或反對，壓力主要來自期待落差和溝通方式，不是命盤能直接解決的。",
    reason: () => "先分清楚：是你還沒準備好，還是你的對象不被接受，這兩種情況的處理方式完全不同。",
    next: () => "挑一個家人願意聽的時間，只談一件事：你的時間表和你在意的條件，不要一次談完所有對立點。",
  },
  {
    id: "love.match",
    re: /(八字|命盤|命盘|生肖|星座).{0,4}(合不合|合嗎|合吗|配不配|相配|相合)|合不合.{0,4}(八字|命)|合盤|合盘/,
    topic: "love",
    timing: "none",
    lead: () => "兩個人合不合，要同時看雙方的出生資料，單看你的盤只能看你自己在感情裡的習慣。",
    reason: () => "合不合也不是一句好或壞，更多是兩個人的節奏怎麼配、哪些地方要多遷就。",
    next: () => "想看合盤，需要對方的出生日期與時間，另外一起看；先自己觀察你們吵架和和好的方式是不是互相能接住。",
  },
  {
    id: "love.distance",
    re: /異地|异地|遠距|远距/,
    topic: "love",
    timing: "good",
    lead: () => "異地的感情能不能走下去，關鍵是有沒有固定的見面頻率和未來的交集，命盤只能看時機。",
    reason: () => "遠距離最容易出問題的是長期沒有共同的時間表，所以要先談清楚誰搬、什麼時候見面、多久之後住在一起。",
    next: () => "跟對方一起訂一個具體時間表：多久見一次面、預計多久後住在同一個城市。",
  },
  {
    id: "love.breakup",
    re: /分手|吵架|冷戰|冷战|還能走下去|还能走下去|走不下去|要不要繼續|要不要继续/,
    topic: "love",
    timing: "good",
    lead: () => "要不要繼續，命盤不能替你拍板，要看吵的是同一個問題反覆出現，還是各自在解決問題。",
    reason: () => "吵架本身不是重點，吵完之後有沒有改變、有沒有被尊重才是。",
    next: () => "把最近三次吵架的原因寫下來，看是同一件事還是不同的；同一件事一直沒變，才是需要認真考慮的訊號。",
  },
  {
    id: "love.late",
    re: /(三十|四十|\d{2})\s*歲.{0,6}(還沒|还没|沒有|没有|未).{0,4}(結婚|结婚|對象|对象|談戀愛|谈恋爱)|晚婚|剩女|剩男|大齡|大龄/,
    topic: "love",
    timing: "good",
    lead: () => "結婚早晚沒有標準答案，命盤能看的是感情比較容易有進展的時間，而不是你有沒有問題。",
    reason: () => "有沒有走進婚姻，更多取決於你想要的關係型態和接觸的人群，不是年齡本身。",
    next: () => "把你想要的關係型態寫下來（想不想結婚、想不想有孩子、時間點），再用這個條件去認識人。",
  },
  {
    id: "love.cantmeet",
    re: /遇不到|遇不見|碰不到|渣男|渣女|愛上不該愛|爛桃花|烂桃花|找不到.{0,3}(對象|对象|對的人|对的人|另一半)|感情.{0,4}(不順|不顺|坎坷|總是|总是|一直)|不適合談戀愛|不适合谈恋爱|單身|单身|脫單|脱单|沒有對象|没有对象|沒人追|没人追/,
    topic: "love",
    timing: "good",
    lead: () => "遇不到對的人，多半不是沒有緣分，而是接觸的人群太少，或是同一種相處模式一再重複。",
    reason: (c) => (c.risk ? `從你的盤來看，你自己要留意的是${c.risk}，在感情裡這會讓對方很難知道你在想什麼。` : "先回頭看最近幾段關係，找出每次重複出現的同一種卡點。"),
    next: () => "回頭看最近三段感情或曖昧，找出重複出現的同一種問題；同時每個月主動增加認識新朋友的機會。",
  },

  // ───────── 職場 ─────────
  {
    id: "career.boss",
    re: /(老闆|老板|主管|上司|同事|組長|组长|客戶|客户).{0,8}(針對|针对|排擠|排挤|刁難|刁难|打壓|打压|霸凌|欺負|欺负|PUA|為難|为难|不公平|搶.{0,3}功|抢.{0,3}功|甩鍋|甩锅)|搶我.{0,4}功|抢我.{0,4}功|被針對|被针对|職場霸凌|职场霸凌|職場.{0,3}(關係|关系|衝突|冲突|鬥爭|斗争)/i,
    topic: "career",
    timing: "good",
    lead: () => "被針對或排擠，命盤看不出對方的動機，能做的是先確認這是不是真的有針對性，再決定要談、要留還是要走。",
    reason: () => "先把事件和時間記下來，分清楚是工作要求高，還是只針對你，有紀錄，談判和申訴都比較站得住。",
    next: () => "接下來兩週，每次發生就記下日期、事件、在場的人，累積到三筆再決定要找主管談、找人資，還是開始看別的機會。",
  },
  {
    id: "career.partner",
    re: /合夥|合伙|合作開|合作开|一起開|一起开|共同創業|共同创业|入股|股東|股东/,
    topic: "career",
    timing: "none",
    lead: () => "合夥能不能成，主要看分工、出資和退出規則寫得清不清楚，命盤只能看你自己做決定的節奏。",
    reason: () => "朋友或同事合夥最常出問題的是沒講清楚誰負責什麼、錢怎麼分、其中一方想退出時怎麼辦。",
    next: () => "先寫下股份、分工、決策方式和退出條件，雙方都簽認之後再投錢。",
  },
  {
    id: "career.shop",
    re: /開店|开店|開餐廳|开餐厅|開咖啡|开咖啡|開工作室|开工作室|開公司|开公司|開實體|开实体/,
    topic: "career",
    timing: "good",
    lead: () => "適不適合開店，關鍵是你的現金能撐多久、能不能穩定拿到客人，不是只看命盤。",
    reason: (c) => (c.gift ? `從你的盤來看，你的長處是${c.gift}，開店時要把這個長處放在能直接帶來收入的位置。` : "從你的盤來看，開店要先把最能直接帶來收入的長處放在最前面。"),
    next: () => "先算清楚開店前六個月的現金流：租金、人事、進貨，以及完全沒有收入時你撐得了幾個月，再決定要不要簽約。",
  },
  {
    id: "career.probation",
    re: /試用期|试用期|轉正|转正|續約|续约|會不會被留|会不会被留/,
    topic: "career",
    timing: "good",
    lead: () => "能不能留下來，主要看你在試用期交出的具體成果和主管的回饋，命盤只能看時機。",
    reason: () => "主動問一次主管對你的期待和還缺的地方，比自己猜有效得多。",
    next: () => "這週主動約主管做一次回饋，問清楚轉正的標準，並把你已經完成的成果整理成一頁。",
  },
  {
    id: "career.credential",
    re: /證照|证照|考照|進修|进修/,
    topic: "career",
    timing: "good",
    lead: () => "考證照值不值得，看這張證照能不能直接換到職位、薪資或選擇權，命盤只能看時機。",
    reason: () => "先查三個你想去的職缺有沒有要求這張證照，再決定要不要花時間和錢。",
    next: () => "先搜尋三個目標職缺確認有沒有要求這張證照，再報名；同時估算備考要花的月數。",
  },
  {
    id: "career.layoff",
    re: /裁員|裁员|被資遣|被资遣|資遣|资遣|失業|失业|被炒|被開除|被开除|沒工作|没工作|找不到工作|待業|待业/,
    topic: "career",
    timing: "good",
    lead: () => "先穩住現金和履歷再找下一份，命盤只能幫你看哪幾個月比較容易有機會。",
    reason: () => "失業期最重要的是算清楚還能撐幾個月，並同時投多個方向，而不是等一個完美機會。",
    next: () => "今天先算出你手上的現金能撐幾個月，這週更新履歷，並找三個人問有沒有機會。",
  },
  {
    id: "career.switch",
    re: /轉行|转行|換跑道|换跑道|轉職業|转职业|換行業|换行业|轉換跑道|转换跑道/,
    topic: "career",
    timing: "good",
    lead: () => "想轉行，先分清楚你是累在這一行，還是累在目前的公司或職位。",
    reason: (c) => (c.gift ? `從你的盤來看，你的長處是${c.gift}，轉行時優先找能用到這個長處的方向。` : "轉行時優先找能用到你現有長處的方向。"),
    next: () => "先用業餘時間做一個小試驗（上課、接案或訪談在職的人），三個月後再決定要不要正式轉。",
  },

  // ───────── 錢 ─────────
  {
    id: "money.lottery",
    re: /彩券|彩票|樂透|乐透|powerball|lotto|中獎|中奖|jackpot|簽注|签注/i,
    topic: "money",
    timing: "none",
    lead: () => "彩券是隨機的，命盤不能預測中獎的號碼或日期，我也不會給你號碼。",
    reason: () => "如果想買，只用你完全輸得起的小額，並把它當成娛樂，不當作收入計畫。",
    next: () => "想增加收入，改看你每月固定支出和能多賺的一條穩定管道，比押注更有用。",
  },
  {
    id: "money.debt",
    re: /欠.{0,3}[債债]|負債|负债|還債|还债|債務|债务|還清|还清|貸款|贷款|卡債|卡债/,
    topic: "money",
    timing: "good",
    lead: () => "債能不能還完，主要看你的收入能撐多久和有沒有新增支出，命盤只能看哪幾個月比較容易有進帳。",
    reason: () => "先把所有債務按利率高低排列，優先還利息最高的，同時避免新增借款。",
    next: () => "今天先列出每筆債務的金額、利率和每月最低還款額，再算出你每月能多還多少。",
  },
  {
    id: "money.lend",
    re: /借錢|借钱|借他|借給|借给|擔保|担保|作保/,
    topic: "money",
    timing: "none",
    lead: () => "借不借錢，關鍵是你損失得起多少，命盤不能保證對方會還。",
    reason: () => "只借你就算拿不回來也不會影響生活的金額，並把金額和還款日期寫下來。",
    next: () => "決定前先問自己：這筆錢如果完全收不回來，我的生活會不會受影響？會的話就不要借。",
  },
  {
    id: "money.collect",
    re: /拖款|欠款|不付款|收不到款|尾款|不還錢|不还钱/,
    topic: "money",
    timing: "none",
    lead: () => "對方會不會付款，命盤看不出來，這件事要靠合約、紀錄和催收流程。",
    reason: () => "先確認有沒有書面約定和付款日期，沒有的話先補一份確認訊息，再談後續。",
    next: () => "今天先整理合約、對話和付款紀錄，書面催一次並訂出最後期限，再決定要不要走法律程序。",
  },
  {
    id: "money.save",
    re: /存不住錢|存不住钱|留不住錢|留不住钱|花太多|月光|存不到錢|存不到钱|怎麼存錢|怎么存钱/,
    topic: "money",
    timing: "none",
    lead: () => "存不住錢多半是支出結構的問題，不一定是賺得不夠。",
    reason: () => "先找出每月最大的三項支出，分清楚哪些是固定的、哪些是衝動的。",
    next: () => "這個月先記帳三十天，把每一筆分成必要、想要、衝動三類，再決定要砍哪一類。",
  },
  {
    id: "money.car",
    re: /買車|买车|換車|换车|買新車|买新车|買手機|买手机|買電腦|买电脑|買.{0,4}(名牌|包包)/,
    topic: "money",
    timing: "good",
    lead: () => "大額購買適不適合，看的是你的現金、每月負擔和實際使用頻率，命盤只能看時機。",
    reason: () => "先確認就算這筆花費之後收入少一陣子，你的生活也不會被拖垮。",
    next: () => "先算清楚頭期款、每月還款、保險與維護的總成本，不超過你能承受的上限後再挑時間。",
  },

  // ───────── 健康 ─────────
  {
    id: "health.sleep",
    re: /失眠|睡不好|睡不著|睡不着|睡眠|多夢|多梦|早醒/,
    topic: "health",
    timing: "caution",
    lead: () => "睡不好先處理作息和壓力，命盤不能診斷原因。",
    reason: (c) => (c.strong ? "你的底子偏旺，通常是停不下來、腦子關不掉，睡前要有一段完全不用腦的緩衝。" : "你的底子偏弱，累了反而更難入睡，要多留恢復的時間。"),
    next: () => "固定起床時間、睡前一小時不看螢幕；超過兩週沒改善，直接去看醫生。",
  },
  {
    id: "health.tired",
    re: /很容易累|容易疲勞|常常累|常常很累|沒精神|没精神|體力差|体力差|疲勞|疲劳/,
    topic: "health",
    timing: "caution",
    lead: () => "容易累先看作息、飲食和有沒有身體問題，命盤不能診斷。",
    reason: (c) => (c.strong ? "你的底子偏旺，通常不是沒力氣，而是消耗過頭、不知道停。" : "你的底子偏弱，恢復要比別人多留一點時間。"),
    next: () => "先固定睡眠和運動兩週再觀察；沒有改善就安排健康檢查。",
  },

  // ───────── 運勢、擇日 ─────────
  {
    id: "luck.taisui",
    re: /太歲|太岁|沖太歲|冲太岁|值太歲|值太岁/,
    topic: "self",
    timing: "caution",
    lead: (c) => {
      const t = taisui(c);
      const parts = [...(t.same ? [`${c.yearLabel}是${c.yearBranch}年，和你的出生年支同一個字，傳統上叫「值太歲」`] : []), ...t.hits];
      if (parts.length) return `傳統上看${c.yearLabel}算犯太歲：${parts.join("、")}。`;
      if (t.helps.length) return `${c.yearLabel}不算犯太歲，反而${t.helps.join("、")}，傳統上算合太歲。`;
      return `${c.yearLabel}（${c.yearBranch}年）和你的出生年支、日支沒有相沖、相刑、相害、相破，傳統上不算犯太歲。`;
    },
    reason: (c) => {
      const t = taisui(c);
      return t.hits.length || t.same
        ? "犯太歲不等於一定倒楣，傳統上主要提醒這一年變動多、情緒容易起伏，重大決定要慢一點。"
        : "所以最近不順，更可能來自具體事件或作息壓力，先處理眼前的事比歸因於太歲有用。";
    },
    next: () => "把最近不順的事分成「可以改」和「不能改」兩類，先處理可以改的那一件。",
  },
  {
    id: "luck.low",
    re: /(運氣|运气|運勢|运势|最近).{0,6}(很差|不好|低谷|倒楣|倒霉|衰|不順|不顺)|低潮|瓶頸|瓶颈/,
    topic: "self",
    timing: "good",
    lead: (c) => yearDo(c, `${c.yearLabel}整體其實是推得動的一年，現在的不順多半是階段性的。`, `${c.yearLabel}整體起伏比較大，不順是這種年份的常態，不代表一直會這樣。`, `${c.yearLabel}整體阻力偏大，現在的不順有一部分是年份本身造成的，適合守、整理和準備。`),
    reason: () => "低谷期最有效的做法是縮小範圍：只處理眼前最影響你的一件事，其他先維持現狀。",
    next: () => "挑一件最影響你的事，這週只做一個具體的小動作，不要同時處理所有問題。",
  },
  {
    id: "luck.date",
    re: /(哪天|哪一天|哪個日子|哪个日子|幾號|几号|擇日|择日|吉日|選日|选日|挑日)|適合.{0,4}(簽約|签约|開業|开业|開幕|开幕|動工|动工|領證|领证)的(日子|時間|时间)|開業要挑|开业要挑|挑.{0,4}月/,
    topic: "money",
    timing: "good",
    lead: () => "命盤沒辦法精準到哪一天，這裡只能給月份層級的窗口。",
    reason: () => "精準到日的擇日是另一套方法，先用月份縮小範圍，再看你自己的假期、對方的時間和場地能不能配合。",
    next: () => "先用上面的月份縮小範圍，再從中挑一個你現實上最方便、不會被趕時間的日期。",
  },

  {
    id: "luck.month",
    re: /(這個月|这个月|本月|下個月|下个月).{0,10}(運勢|运势|運氣|运气|如何|怎麼樣|怎么样|順不順|顺不顺|注意|適合|适合|重大決定|重大决定)/,
    topic: "self",
    timing: "none",
    lead: (c) => `${c.monthLabel}${c.monthGrade === "up" ? "整體比較順，適合把想推的事往前推" : c.monthGrade === "down" ? "整體阻力比較大，適合守、整理和準備，不適合硬衝" : "整體有起伏，不算特別順也不算差，要挑時機做事"}。`,
    reason: () => "重大決定盡量放在比較順的月份，必須在這個月做的話，給自己一天冷靜期再簽。",
    next: () => "把這個月想做的事分成「一定要做」和「可以延後」兩堆，先處理前者。",
  },
  // ───────── 家人與人際 ─────────
  {
    id: "family.parentHealth",
    re: /(爸爸|媽媽|妈妈|父親|父亲|母親|母亲|父母|長輩|长辈|老人|家人).{0,10}(身體|身体|健康|生病|開刀|开刀|手術|手术)/,
    topic: "health",
    timing: "none",
    lead: () => "家人的健康，命盤不能代替檢查和醫生的判斷，也看不出別人的病情。",
    reason: () => "如果你有擔心的症狀，最有效的做法是提早安排檢查和固定追蹤。",
    next: () => "這週先幫他預約一次健康檢查，把近期的症狀和用藥紀錄整理好帶給醫生。",
  },
  {
    id: "family.impact",
    re: /(流年|明年|今年).{0,8}(家裡|家里|家人|家中).{0,6}(什麼人|什么人|誰|谁|哪個人|哪个人)/,
    topic: "self",
    timing: "none",
    lead: () => "流年對家人的影響，要用每個人自己的命盤去看，單看你的盤只能看你自己。",
    reason: () => "你的盤能看的是你今年在家裡的角色和壓力，例如要不要多承擔、多溝通。",
    next: () => "想知道某位家人的情況，需要他的出生資料另外看；先把你自己今年在家中的節奏顧好。",
  },
  {
    id: "family.childStudy",
    re: /(孩子|小孩|兒子|儿子|女兒|女儿).{0,8}(不愛|不爱|不想|不肯|不喜歡|不喜欢).{0,3}(讀書|读书|念書|念书|上學|上学|學習|学习)|成績不好|成绩不好/,
    topic: "self",
    timing: "none",
    lead: () => "孩子不愛讀書，多半是興趣、方法或壓力的問題，命盤不能替他下結論。",
    reason: () => "先弄清楚是哪個科目、哪種情境最抗拒，再看是方法不對還是情緒的問題。",
    next: () => "這週只觀察不責備：記下他讀書時卡在哪、什麼情況下反而願意投入。",
  },
  {
    id: "family.child",
    re: /(孩子|兒子|儿子|女兒|女儿|小孩|子女).{0,8}(以後|以后|未來|未来|會怎麼樣|会怎么样|前途|成就|成績|成绩)/,
    topic: "self",
    timing: "none",
    lead: () => "孩子的未來要用孩子自己的命盤看，從你的盤只能看到你和孩子的相處方式。",
    reason: () => "孩子的發展更多取決於環境、陪伴和他自己的興趣，不需要用命盤替他定型。",
    next: () => "觀察孩子最近三個月主動花時間做的事，那就是他目前最自然的方向，從那裡開始支持。",
  },
  {
    id: "family.relation",
    re: /(我|跟|和).{0,3}(媽|妈|爸|父母|母親|母亲|父親|父亲|孩子|兒子|儿子|女兒|女儿|兄弟|姊妹|姐姐|哥哥|弟弟|妹妹|婆婆|公公|岳母|家人).{0,10}(關係|关系|相處|相处|吵|合不來|合不来|不和|衝突|冲突)|為什麼.{0,4}(媽|妈|爸|父母).{0,6}(差|不好|吵)/,
    topic: "self",
    timing: "none",
    lead: () => "家人之間的關係，命盤只能看你自己的互動習慣，看不出對方心裡的想法。",
    reason: (c) => (c.risk ? `你這邊要留意的是${c.risk}，在家人面前這個習慣特別容易被放大。` : "你這邊先看自己在互動裡最容易重複的反應，是後退、爭辯還是不說。"),
    next: () => "挑一個平靜的時間，只談一件具體的事（不翻舊帳），先說你想要的結果，而不是對方的錯。",
  },
  {
    id: "people.conflict",
    re: /(室友|同事|主管|老闆|老板|鄰居|邻居|同學|同学|客戶|客户|朋友).{0,6}(合不來|合不来|處不好|处不好|相處不|相处不|吵|衝突|冲突|不和|有問題|有问题|關係不好|关系不好)/,
    topic: "self",
    timing: "none",
    lead: () => "人際摩擦先分清楚是事、是人，還是溝通方式，命盤只能看你自己的互動習慣，看不出對方的想法。",
    reason: (c) => (c.risk ? `你這邊要留意的是${c.risk}，在摩擦裡這個習慣容易讓對方誤會你的意思。` : "你這邊先看自己在摩擦裡最常見的反應，是後退、爭辯還是不說。"),
    next: () => "把最近一次摩擦的具體事件寫下來，只談這一件事，先說你想要的結果，而不是對方的錯。",
  },
  {
    id: "people.friend",
    re: /(朋友|同學|同学|閨蜜|闺蜜|兄弟).{0,10}(利用我|不夠意思|不够意思|疏遠|疏远|背叛|不真心|吃定我|佔我便宜|占我便宜)|被朋友/,
    topic: "self",
    timing: "none",
    lead: () => "朋友是不是在利用你，命盤看不出對方的動機，要看具體的互動模式。",
    reason: () => "觀察一個月：付出是不是長期單向、有事才找你、你需要時對方有沒有出現。",
    next: () => "把你最近幫過對方的事和對方回報過的事各列一次，單向太明顯就先降低付出的頻率。",
  },
  {
    id: "people.villain",
    re: /說壞話|说坏话|說閒話|说闲话|被議論|被议论|流言|被陷害|被背後|被背后|陷害|被騙|被骗|被設計|被设计|有人在害我/,
    topic: "self",
    timing: "none",
    lead: () => "有沒有人陷害你，命盤看不出來，要看具體事實。",
    reason: () => "先分清楚是事實還是感覺：有沒有可以驗證的證據、時間點和第三方在場。",
    next: () => "把發生的事按日期記下來，重要溝通改用文字留存，再決定要不要找主管、人資或專業人士。",
  },

  // ───────── 官司 ─────────
  {
    id: "legal",
    re: /官司|訴訟|诉讼|律師|律师|法院|仲裁|被告|提告|開庭|开庭/,
    topic: "self",
    timing: "none",
    lead: () => "官司的結果要看證據、程序和律師的判斷，命盤不能預測勝敗，也不能取代法律意見。",
    reason: () => "命盤最多只能提醒你這段時間的壓力和決策節奏，真正的準備在證據和時間線。",
    next: () => "先把證據和時間線整理好，盡快諮詢律師，別靠命盤決定要不要和解。",
  },

  // ───────── 自我 ─────────
  {
    id: "self.lucky",
    re: /幸運色|幸运色|幸運顏色|幸运颜色|開運色|开运色|開運顏色|开运颜色|吉利色|穿什麼顏色|穿什么颜色/,
    topic: "self",
    timing: "none",
    lead: (c) => {
      const el = c.chart.useful[0] as Element | undefined;
      if (!el) return "目前這張盤還沒有足夠穩定的依據來定顏色，先不硬給。";
      const colors = (COLOR_OF_ELEMENT[el] ?? []).slice(0, 3).join("、");
      return `從你的盤來看，比較適合你的顏色偏${el}系：${colors}。`;
    },
    reason: (c) => (c.chart.usefulProvisional ? "這個判斷目前屬於初步參考，顏色只是日常搭配的提示，不會改變運勢。" : "顏色只是日常搭配的提示，穿得舒服、讓你狀態穩定比顏色本身更重要。"),
    next: () => "先從貼身或常看到的小物件開始（衣服、手機殼、桌面），用兩週觀察自己的狀態有沒有差別。",
  },
  {
    id: "bazi.hour",
    re: /時柱|时柱|時辰.{0,6}(怎麼看|怎么看|代表|是什麼|是什么|影響|影响)/,
    topic: "self",
    timing: "none",
    lead: (c) => {
      const hour = c.chart.pillars.find((p) => p.key === "time");
      return c.chart.timeUnknown || !hour || hour.ready === false
        ? "時柱代表出生的時辰，你的出生時間沒有確定，所以時柱不能當依據。"
        : `時柱代表出生的時辰，傳統上看晚年、子女和事業後勁，你的時柱是${hour.gan}${hour.zhi}。`;
    },
    reason: () => "它是四柱裡最細的一柱，時辰差一點就會變，所以要用準確的出生時間才有意義。",
    next: () => "出生時間不確定時，先不要用時柱做重大判斷；有確切時間再重看。",
  },
  {
    id: "home.floor",
    re: /高樓層|高楼层|低樓層|低楼层|幾樓|几楼|頂樓|顶楼|樓層|楼层/,
    topic: "home",
    timing: "none",
    lead: () => "住幾樓適不適合，更看採光、噪音、通風和你的生活習慣，命盤不直接決定樓層。",
    reason: () => "白天和晚上各去看一次，確認光線、噪音和電梯等待時間你能不能接受。",
    next: () => "選兩間條件接近的房子，各在不同時段去看一次，用「睡得好不好、通勤順不順」當決定標準。",
  },
  {
    id: "self.strength",
    re: /優勢|优势|優點|优点|強項|强项|擅長|擅长|最大的長處|最大的长处/,
    topic: "self",
    timing: "none",
    lead: (c) => (c.gift ? `從你的盤來看，你最明顯的優勢是${c.gift}。` : "從你的盤來看，你的優勢要看你最自然做得好的那一件事。"),
    reason: (c) => (c.risk ? `用得好的前提是留意${c.risk}，優勢才不會變成內耗。` : "優勢要放在別人看得見、也願意付費或依賴的地方才有價值。"),
    next: () => "挑最近三件別人主動找你處理、你又做得快的事，把它們放在你未來的選擇裡。",
  },
  {
    id: "bazi.missing",
    re: /缺什麼|缺什么|五行.{0,3}缺|缺.{0,2}(木|火|土|金|水)|命中缺/,
    topic: "self",
    timing: "none",
    lead: () => "五行有沒有缺，不能只看數量，要看整體的強弱和需要，所以這裡不直接說你缺什麼。",
    reason: (c) => {
      const el = c.chart.useful[0] as Element | undefined;
      return el && !c.chart.usefulProvisional ? `目前判斷對你比較有幫助的是${el}，用在日常的顏色、環境和習慣上就夠了。` : "目前這個判斷還屬於初步參考，先不要為了補哪個五行去買東西。";
    },
    next: () => "先看你現在最缺的是穩定、行動還是休息，從作息和環境調整，比補五行有效。",
  },
  {
    id: "other.guardian",
    re: /守護神|守护神|守護靈|守护灵|本命佛/,
    topic: "self",
    timing: "none",
    lead: () => "守護神屬於象徵和信仰層面，八字本身不會直接指出是哪一位神明。",
    reason: () => "傳統上有人用出生年的生肖或五行來對應象徵，那只是文化上的比喻，不是命盤的判斷。",
    next: () => "如果你有信仰或習慣的對象，以你自己的信仰為主，不需要靠命盤決定。",
  },
  {
    id: "other.pastlife",
    re: /上輩子|上辈子|來生|来生/,
    topic: "self",
    timing: "none",
    lead: () => "上輩子是誰，八字推算不到，我也不會憑命盤編一個故事當事實。",
    reason: () => "八字看的是這一世的時間節奏，象徵層面的寓意只能當比喻，不能當事實。",
    next: () => "想理解自己，從這一世最常重複的選擇和情緒開始，會比猜前世更有用。",
  },
  {
    id: "other.ghost",
    re: /鬼|撞邪|被纏|被缠|卡到陰|卡到阴|靈異|灵异/,
    topic: "health",
    timing: "none",
    lead: () => "命盤看不出有沒有靈異的東西，我不會替你下這種判斷。",
    reason: () => "如果最近睡不好、壓力大或身體不舒服，先處理作息和健康，通常就是原因。",
    next: () => "先固定作息兩週，同時安排一次身體檢查；你有信仰或習慣的儀式，用熟悉的方式安心就好。",
  },
];

export function matchIntent(question: string): Intent | null {
  return INTENTS.find((intent) => intent.re.test(question)) ?? null;
}
