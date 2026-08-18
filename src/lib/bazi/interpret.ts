import { COLOR_OF_ELEMENT, DAY_MASTER_NATURE, DIRECTION_OF_ELEMENT, ELEMENT_LABEL, HOUR_OF_ELEMENT } from "./constants";
import type { Chart, Element, LifeGuide, Pillar, QuestionKind, Reading, RelationPref } from "./types";
import type { PalmReading } from "@/lib/core/types";
import { composePalmReport } from "@/lib/palm/engine";

const PAST_KEYS = ["前世", "前三世", "六道", "輪迴", "哪一道", "一掌經", "三世因果", "前世今生"];
const HOME_KEYS = ["家宅", "搬家", "店面", "風水", "住哪", "買屋方位"];
const LOVE_KEYS = ["感情", "戀", "愛", "對象", "結婚", "伴侶", "桃花", "復合", "分手", "緣分", "喜歡", "男友", "女友", "暧昧", "曖昧"];
const WORK_KEYS = ["工作", "職業", "轉職", "升遷", "事業", "面試", "創業", "老闆", "職場", "出國工作", "離職", "跳槽", "考", "升官"];
const MONEY_KEYS = ["財", "錢", "收入", "投資", "買房", "買屋", "理財", "債務", "存錢", "虧", "賺"];
const HEALTH_KEYS = ["健康", "病", "痛", "醫療", "手術", "失眠", "身體", "復原", "累", "睡不著"];
const CHOICE_KEYS = ["還是", "或者", "該不該", "要不要", "兩個選項", "A還是B", "選哪"];
const TIME_KEYS = ["什麼時候", "何時", "哪年", "哪月", "時間", "窗口", "時機", "等到"];

export function classifyQuestion(q: string): QuestionKind {
  if (PAST_KEYS.some((k) => q.includes(k))) return "past";
  if (HOME_KEYS.some((k) => q.includes(k))) return "home";
  if (CHOICE_KEYS.some((k) => q.includes(k))) return "choice";
  if (HEALTH_KEYS.some((k) => q.includes(k))) return "health";
  if (LOVE_KEYS.some((k) => q.includes(k))) return "love";
  if (WORK_KEYS.some((k) => q.includes(k))) return "career";
  if (MONEY_KEYS.some((k) => q.includes(k))) return "money";
  if (TIME_KEYS.some((k) => q.includes(k))) return "timing";
  return "self";
}

function joinEl(els: Element[]): string {
  return els.join("、");
}

function isReady(col: Pillar): boolean {
  return col.ready !== false && col.ganZhi !== "未定" && Boolean(col.gan);
}

function p(chart: Chart, key: Pillar["key"]): Pillar {
  return chart.pillars.find((x) => x.key === key) ?? chart.pillars[0];
}

const BRANCH_TELL: Record<string, string> = {
  子: "表面上不吵，夜裡才把白天沒說的話全部重播一遍",
  丑: "先把事吞進肚子裡，等人問起才說「沒什麼」",
  寅: "一旦決定動，周圍會覺得你突然換了一個人",
  卯: "外表好說話，心裡其實早有自己的節奏，只是不宣布",
  辰: "同一句沒說完的話，會在心裡轉好幾圈才肯放手",
  巳: "先把全局看完再出手，看太久就會自己把自己烤乾",
  午: "情緒上來得快，也容易在人多的地方把光打開",
  未: "先把別人安頓好，輪到自己時位置已經沒了",
  申: "腦子比嘴快，先拆問題，拆完才發現對方想要的是被接住",
  酉: "看不慣湊合，標準一高，自己也先被這把尺割傷",
  戌: "答應過的事會守，被食言一次就記得特別久",
  亥: "表面上隨和，內裡有一片只讓少數人進來的水域",
};

const STEM_TELL: Record<string, string> = {
  甲: "你習慣先把骨架撐住，再讓別人來靠。靠久了，沒人問你累不累",
  乙: "你能在縫隙裡長出形狀，外人以為你軟，其實你只是先繞、後佔",
  丙: "你一出現場面就亮，但亮完之後需要暗處，否則會過熱",
  丁: "你不是爆發型，是小火慢燉。最怕被含糊、被拖延、被潮氣悶住",
  戊: "你立定以後極難被說動。別人覺得你慢，你覺得他們還沒站穩",
  己: "你擅長把散亂收成可用之地，也容易變成誰的雜務都往你這裡堆",
  庚: "你一刀切開問題，準，也容易連關係一起切開",
  辛: "你的眼睛先看見瑕疵。美的東西你願意等，湊合的東西你待不久",
  壬: "你吸收得比誰都快，沒出口就會在體內積成霧，看起來像淡，其實是滿",
  癸: "你觀察入微，擅長醞釀。霧散之前，誰來催你，你都不會交出真正的答案",
};

const GOD_WORK: Record<string, string> = {
  比肩: "適合自己扛一塊能署名的領域，不適合長期當影子",
  劫財: "適合跟強的人合作，但規則要先寫清，否則你會先被捲走",
  食神: "適合把想法做成可交付的東西：課、稿、產品、流程",
  傷官: "適合要表達、要改進、要被看見的位置，受不了 dumb 服從",
  正財: "適合穩的變現：顧問、專業服務、按件計酬",
  偏財: "適合機會型收入，但每次都要先寫退出條件",
  正官: "適合有評價、有職稱、有公開責任的結構",
  七殺: "適合高壓、決勝、能一錘定音的場合，不適合磨很久卻沒人拍板",
  正印: "適合研究、教學、幕後支撐，也容易學太多、交件太慢",
  偏印: "適合冷門專業、特殊判斷，忌同時開太多條線",
};

function countGods(chart: Chart): Record<string, number> {
  const bag: Record<string, number> = {};
  for (const col of chart.pillars) {
    if (!isReady(col)) continue;
    if (col.key !== "day") {
      bag[col.shiShenGan] = (bag[col.shiShenGan] ?? 0) + 2;
    }
    for (const h of col.hide) {
      bag[h.shiShen] = (bag[h.shiShen] ?? 0) + 1;
    }
  }
  return bag;
}

function topGod(chart: Chart): string {
  const bag = countGods(chart);
  let best = "食神";
  let n = -1;
  for (const [k, v] of Object.entries(bag)) {
    if (k === "日主") continue;
    if (v > n) {
      best = k;
      n = v;
    }
  }
  return best;
}

function guideFrom(chart: Chart): LifeGuide {
  const favorEl = chart.useful[0] ?? chart.dayMasterElement;
  const restEl = chart.drain[0] ?? "土";
  return {
    colors: COLOR_OF_ELEMENT[favorEl],
    avoidColors: COLOR_OF_ELEMENT[restEl],
    directions: {
      favor: chart.useful.map((e) => DIRECTION_OF_ELEMENT[e]),
      rest: chart.drain.map((e) => DIRECTION_OF_ELEMENT[e]),
    },
    hours: {
      favor: HOUR_OF_ELEMENT[favorEl],
      drain: HOUR_OF_ELEMENT[restEl],
    },
    pet:
      favorEl === "火"
        ? "互動性高的貓或小型犬，暖棕、紅棕或奶油色；陪伴節奏要活但不吵。"
        : favorEl === "水"
          ? "安靜陪伴型的貓、魚或小型動物，深灰、藍灰或黑白。"
          : favorEl === "木"
            ? "活動量適中的狗或鳥，青灰、棕綠或自然色。"
            : favorEl === "金"
              ? "邊界清楚、照顧節奏穩定的貓，銀灰、白色或淺金。"
              : "作息穩定的貓或性格平穩的狗，米白、金棕或灰褐。",
  };
}

function weather(chart: Chart): string {
  if (chart.currentDayun) {
    const d = chart.currentDayun;
    return `你此刻走${d.ganZhi}大運（${d.startYear}–${d.endYear}），今年流年${chart.currentYear}正在引動原局。`;
  }
  if (chart.timeUnknown) {
    return `今年流年${chart.currentYear}正在引動原局。時辰未定，大運起運與時柱留白，判斷只掛年日月。`;
  }
  return `今年流年${chart.currentYear}正在引動原局。`;
}

function clipQuestion(q: string): string {
  const t = q.trim().replace(/[？?。！!]+$/g, "");
  return t.length > 36 ? `${t.slice(0, 36)}…` : t;
}

function moveScore(text: string): number {
  const move = ["轉", "離", "走", "換", "創", "出國", "分手", "結束", "辭", "跳"];
  const stay = ["留", "穩", "先", "等", "維持", "繼續", "忍", "復合"];
  let n = 0;
  for (const k of move) if (text.includes(k)) n += 1;
  for (const k of stay) if (text.includes(k)) n -= 1;
  return n;
}

function leanChoice(q: string, chart: Chart): string {
  const parts = q.split(/還是|或者|还是/);
  const strong = chart.strength.tendency.includes("旺");
  if (parts.length >= 2) {
    const a = parts[0].replace(/^.*[，,、：:]/, "").trim();
    const b = parts[1].replace(/[？?。！!].*$/, "").trim();
    if (a && b) {
      const pickMove = moveScore(a) >= moveScore(b) ? a : b;
      const pickStay = pickMove === a ? b : a;
      if (strong) {
        return `兩個裡面，選「${pickMove}」。你現在不是缺勇氣，是盤面偏滿，需要一條能輸出、能離開舊位置的路；「${pickStay}」比較像把已經過重的東西再扛一次。`;
      }
      return `兩個裡面，選「${pickStay}」。你現在需要的是能沉澱、能托住你的那一條；「${pickMove}」聽起來像突破，實際上會先抽走你還沒補上的${joinEl(chart.useful)}。`;
    }
  }
  if (q.includes("該不該") || q.includes("要不要")) {
    return strong
      ? "該動。條件是：先寫退出成本，再小規模試三十天，不要一次把後路燒光。"
      : "先不要全押。先補上能托住你的資源與節奏，再把同一件事做成三十天的小樣。";
  }
  return strong
    ? "選能留下作品、能被外人核對、你走得開的那一條。"
    : "選能讓你每天有落點、有人或制度托住、退出成本低的那一條。";
}

function loveLens(chart: Chart, relation: RelationPref): string {
  const day = p(chart, "day");
  if (relation === "same") {
    return `你要的不是傳統公式裡的「誰來當官殺」，而是對方是否連續出現、是否接得住你日支「${day.zhi}」這種${BRANCH_TELL[day.zhi] ?? "先消化再開口"}的相處。`;
  }
  if (chart.gender === "female") {
    return `女命看官殺只作功能：誰能給秩序、誰只給張力。真正決定走不走下去的，仍是日支「${day.zhi}」這間房子裡，你有沒有被接住。`;
  }
  if (chart.gender === "male") {
    return `男命看財星只作功能：誰讓你願意付出、誰只讓你興奮。真正決定走不走下去的，仍是日支「${day.zhi}」這間房子裡，你有沒有把話說完。`;
  }
  return `先看日支「${day.zhi}」：${BRANCH_TELL[day.zhi] ?? "日常怎麼相處"}。誰能進這間房子而不翻亂它，誰才是可談的人。`;
}

export function interpret(question: string, chart: Chart, relation: RelationPref = "unset", palm: PalmReading | null = null): Reading {
  const kind = classifyQuestion(question);
  const nature = DAY_MASTER_NATURE[chart.dayMaster] ?? "以日主性情為軸";
  const dayP = p(chart, "day");
  const monthP = p(chart, "month");
  const timeP = p(chart, "time");
  const yearP = p(chart, "year");
  const useful = joinEl(chart.useful);
  const usefulLine = useful ? `調候粗候選是${useful}（待完整子平覆核，不是喜用神定論）` : "流通候選未定";
  const timeLine = isReady(timeP) ? `時柱${timeP.ganZhi}是你出力的方式` : "時柱未定，出力方式先不寫死";
  const guide = guideFrom(chart);
  const god = topGod(chart);
  const stemTell = STEM_TELL[chart.dayMaster] ?? nature;
  const branchTell = BRANCH_TELL[dayP.zhi] ?? "日常落點很具體，不喜歡被抽象安慰";
  const q = clipQuestion(question);
  const now = weather(chart);
  const strong = chart.strength.tendency.includes("旺");

  let directAnswer = "";
  switch (kind) {
    case "past":
      if (palm) {
        const lives = palm.palaces.map((x) => `${x.lifeLabel}：${x.zhi}・${x.star}｜${x.dao}`).join("；");
        directAnswer = [
          palm.firstSentence,
          lives ? `四宮如下——${lives}。` : "",
          palm.minggongNote,
          palm.cause,
          palm.fruit,
          palm.seed,
          palm.boundary,
        ].filter(Boolean).join(" ");
      } else {
        directAnswer = `你問「${q}」。這一問要走達摩一掌經四宮，不拿子平反推六道。請補性別與出生時辰後再問同一句。`;
      }
      break;
    case "home":
      directAnswer = `你問「${q}」，先聽結論：出生盤只回答你的承載與節奏，不能代替房屋的光、風、路與動線。${stemTell}。${now}沒有平面圖、坐向或實地資料，風水不作判定；奇門也要另起局。眼下能做的，是把家分成「能做事的桌」和「能關燈的角落」，並讓${chart.dayMasterElement}吃到「${guide.colors[0]}」這一系質地。`;
      break;
    case "health":
      directAnswer = `你問「${q}」，先聽結論：不是某個月份一到就會好，是你一直用「${ELEMENT_LABEL[chart.dayMasterElement]}」硬撐，恢復才會越來越差。${stemTell}。日支${dayP.zhi}的習慣是——${branchTell}。${now}這段時間最要收回的是睡眠、下班界線，以及一件你反覆想卻沒出口的事。身體若已經發出痛、失眠或突然掉力，去看醫生；命盤在這裡的用處，是指出你為什麼會拖到那一步。`;
      break;
    case "love":
      directAnswer = `你問「${q}」，結論先講：值得推進的，是已經連續回應你、並且進得了日支「${dayP.zhi}」這間房子的人；只興奮、不落地的，耗掉你的注意力。${stemTell}。${loveLens(chart, relation)}${now}接下來三十天，只核對一件事：對方有沒有主動把下一次見面或把話說清楚。有，就往前走一步；沒有，就停在這裡，不要再加碼解釋自己。`;
      break;
    case "career":
      directAnswer = `你問「${q}」，結論是：職能要靠近「${ELEMENT_LABEL[chart.dayMasterElement]}」，月令${monthP.zhi}下較活躍的十神是${god}（粗算，要掛回月令與透藏，不是數個數）——${GOD_WORK[god] ?? "把判斷做成可交付物"}。${stemTell}。${timeLine}。${now}${strong ? "你現在不是缺機會，是機會太多、出口太少。先把正在做的事收成一件能給外人看的作品。" : "你現在不宜空跳。先找一個能托住你、能署名、能重複使用的位置，再談轉場。"}三十天內只交一件可核對的成果。`;
      break;
    case "money":
      directAnswer = `你問「${q}」，錢的結論很硬：你比較容易從「把${ELEMENT_LABEL[chart.dayMasterElement]}做成可交付成果」進來，不容易從追漲、頻繁換方向進來。${stemTell}。年柱${yearP.ganZhi}（${yearP.nayin}）是你看待資源的底色。${usefulLine}。${now}這個月只做一件財務動作：列出主收入、真實時薪、退出成本。數字出來之前，不要再開下一條線。`;
      break;
    case "choice":
      directAnswer = `你問「${q}」。${leanChoice(question, chart)}${stemTell}。月令${monthP.zhi}、日支${dayP.zhi}告訴我：你不是不會選，是選完以後還在心裡替另一條路辦喪事。${now}選完的七天內，只服務被選中的那一條，另一條寫在紙上封起來。`;
      break;
    case "timing":
      directAnswer = `你問「${q}」，時間窗口就是現在這一截：流年${chart.currentYear}${chart.currentDayun ? `叠在${chart.currentDayun.ganZhi}大運上` : ""}。不是某一個「必成之日」，是機會開始具體、阻力下降、你可以試三十天而不必燒船的時候。${stemTell}。${now}${strong ? "窗口已經在眼前，再等，是把熱度耗掉。" : "先把托住你的那一塊補上，窗口才接得住；補的同時就可以小規模試，不必空等明年。"}`;
      break;
    default:
      directAnswer = `你問「${q}」。先看見自己：${stemTell}。日支${dayP.zhi}——${branchTell}。已排定的柱是 ${chart.pillars.filter(isReady).map((x) => x.ganZhi).join("　")}，日主${chart.dayMaster}${chart.dayMasterElement}，月令${monthP.zhi}，旺衰底盤是${chart.strength.tendency}。${usefulLine}。${now}你真正的功課不是再找一句更準的批語，而是把已經知道的那件事做成七天的行為。命局不會因一句話消失，可被你改的是：出口、邊界、以及你願不願意讓別人看見半成品。`;
  }


  const rhythm = `人生節奏以${chart.dayMaster}${chart.dayMasterElement}為軸，在${monthP.zhi}月令裡展開。年柱${yearP.ganZhi}（${yearP.nayin}）是底色，日支${dayP.zhi}是每天回家會碰到的自己。${timeLine}。${stemTell}。${strong ? `盤面偏滿，出口比進補重要。${usefulLine}。` : `盤面需要先被托住。${usefulLine}。`}穩定不是停住，是讓每一次選擇都有落點。`;

  const work = `${GOD_WORK[god] ?? "把判斷做成可交付物"}。你吃香的是能看見成果、能複用、能署名的位置；一進「責任很大、產出卻說不清」的房間，你的${chart.dayMasterElement}就會先耗掉。今明兩步：選一項技能做成外人看得懂的交付物，並算清它能不能重複賣。`;
  const love = `${loveLens(chart, relation)}你容易先消化再開口。把隱含期待改成一句可協商的話，比再找一個會讀心的人準。三十天只看連續性，不看宣言。`;
  const money = `錢從「${ELEMENT_LABEL[chart.dayMasterElement]}被做成產品」來。先固定一條主收入，記錄投入、實收、退出。帳本比儀式準。`;
  const body = `${chart.dayMaster}${chart.dayMasterElement}一壓久，恢復就會從睡眠和胃口先報信。這不是病名，是節奏。先收回固定睡覺的時間，以及一件你反覆想卻沒有出口的事。若已經有疼痛、突然掉力或長期失眠，先去看醫生。`;
  const home = `家要同時有能做事的桌，和真正能關燈的角落。${chart.dayMasterElement}吃「${guide.colors[0]}」這一系的質地。東西、訊息、情緒各有位置，比再買一件象徵物有用。`;
  const action = `從今天起連續七天，只改一件：${kind === "love" ? "每天把一句該說的話寫下來，其中至少一次真的發出去" : kind === "career" ? "每天為同一件作品推進四十分鐘，第七天必須有一份能給外人看的東西" : kind === "money" ? "每天記下每一筆錢的去向，第七天只留一條主收入線" : "固定同一時間睡覺，並把一件反覆想的事寫完一頁"}。不要同時改三個習慣。`;
  const decree = `留住${chart.dayMaster}${chart.dayMasterElement}的本色，但不要讓它變成凡事由你硬扛。能交出去、能恢復、能修正，比一時撐住更像你的命。`;
  const lastLine = "别人觉得准，是因为你自己早就知道；真正改命的，是你下一次把这件事做完。";

  return {
    kind,
    directAnswer,
    rhythm,
    work,
    love,
    money,
    body,
    home,
    action,
    decree,
    lastLine,
    guide,
  };
}

export function composeFullReport(question: string, chart: Chart, reading: Reading, palm: PalmReading | null = null): string {
  if (reading.kind === "past" && palm) {
    return composePalmReport(
      question,
      palm,
      `日主${chart.dayMaster}${chart.dayMasterElement}　月令${chart.monthBranch}　四柱 ${chart.pillars.map((col) => col.ganZhi).join("　")}`,
    );
  }
  const pillars = chart.pillars
    .map((col) => `${col.label} ${col.ganZhi}（${col.nayin}／${col.shiShenGan}／十二長生${col.diShi}）`)
    .join("\n");
  return [
    "昭梧｜白話完整報告",
    "",
    "一、你真正問的問題",
    question,
    "",
    reading.directAnswer,
    "",
    "二、這張盤為什麼這樣排",
    chart.provenance,
    `農曆：${chart.lunarDate}`,
    `出生地：${chart.cityLabel}`,
    chart.liveCityLabel ? `現居地：${chart.liveCityLabel}（只修正季節與生活節奏，不改八字）` : null,
    chart.hemisphere === "S" ? "現居南半球：作息與採光按當地季節理解；八字五行不因此反轉。" : null,
    "",
    pillars,
    `日主 ${chart.dayMaster}${chart.dayMasterElement}　月令 ${chart.monthBranch}　胎元 ${chart.taiyuan}　命宮 ${chart.minggong}`,
    chart.strength.summary,
    chart.usefulProvisional ? `流通粗候選：${chart.useful.join("、") || "—"}（待完整子平覆核）` : null,
    "",
    "三、你的整體人生節奏",
    reading.rhythm,
    "",
    "四、你反覆出現的課題",
    `你最深的慣性，是用「${chart.useful[0] ?? chart.dayMasterElement}」去承擔。環境變了，方法還是舊的；關係裡和工作裡，能控制的事會被你抓得太久。這不是故事，是你自己認得的那種重複。`,
    "",
    "五、個人命誥",
    reading.decree,
    "",
    "六、生活使用說明",
    `工作｜${reading.work}`,
    `感情｜${reading.love}`,
    `財務｜${reading.money}`,
    `身心｜${reading.body}`,
    `家宅｜${reading.home}`,
    "",
    "七、顏色、方位與時段",
    `較有利顏色：${reading.guide.colors.join("、")}`,
    `現在不必刻意放大：${reading.guide.avoidColors.join("、")}`,
    `較有利方位：${reading.guide.directions.favor.join("、")}`,
    `較適合時段：${reading.guide.hours.favor.join("、")}`,
    `寵物取象：${reading.guide.pet}`,
    "",
    "八、一個最高優先行動",
    reading.action,
    "",
    "九、最後一句",
    reading.lastLine,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
