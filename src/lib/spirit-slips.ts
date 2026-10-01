import { hantToHans, type SacredLocale } from "@/lib/sacred-days";

/**
 * 今日靈籤：十二支原創籤，依日期穩定抽出（同一天同一支，不依賴網路、不使用隨機圖片）。
 * 籤詩只作當下的提醒與反思，不作預言或宿命判斷。
 */
export type SlipGrade = "excellent" | "good" | "mild" | "neutral";

type SlipSource = {
  grade: SlipGrade;
  title: string;
  poem: [string, string, string, string];
  gloss: string;
  advice: string;
  en: { title: string; poem: [string, string, string, string]; gloss: string; advice: string };
};

const SLIPS: SlipSource[] = [
  {
    grade: "good", title: "靜心守中",
    poem: ["風起不須驚", "心定自成城", "一燈守夜靜", "天明路自平"],
    gloss: "先把最重要的一件事守住，雜音自然會退。",
    advice: "少猜一步，慢半拍確認；真正要保留的是自己的節奏。",
    en: { title: "Hold Your Centre", poem: ["Let the wind rise, do not be alarmed;", "a settled heart becomes its own wall.", "One lamp keeps watch through the quiet night,", "and by dawn the road lies level."], gloss: "Protect the one thing that matters most and let the noise fall away.", advice: "Guess less, confirm first, and keep your own pace." },
  },
  {
    grade: "excellent", title: "應緣而啟",
    poem: ["門外有人語", "未必皆是客", "聽得回聲處", "方可啟柴扉"],
    gloss: "有些門不是硬推開的。先看清哪一個回應是真正的邀請。",
    advice: "先觀察，再靠近；有回聲的地方才值得投入更多心力。",
    en: { title: "Open With Response", poem: ["Voices at the gate;", "not every one is a guest.", "Open the wicker door", "only where an echo answers."], gloss: "Notice what is genuinely responding to you before you invest more.", advice: "Observe first, then move closer." },
  },
  {
    grade: "good", title: "先定後行",
    poem: ["欲渡先觀水", "未行先定舟", "方向若無誤", "遲到亦無憂"],
    gloss: "現在最重要的不是速度，而是先把方向定清楚。",
    advice: "涉及承諾、金錢或關係時，先確認核心條件。",
    en: { title: "Set Direction First", poem: ["Read the water before the crossing;", "fix the boat before the journey.", "If the heading is true,", "arriving late is no worry."], gloss: "Speed is not the priority; set the direction before moving.", advice: "Confirm the core conditions before committing money or relationships." },
  },
  {
    grade: "mild", title: "留白養氣",
    poem: ["紙上留餘白", "山間有遠煙", "少添一分力", "多存一寸天"],
    gloss: "今天的空白不是浪費，而是在替下一步保留判斷力。",
    advice: "把能量留給需要你親自決定的事。",
    en: { title: "Leave Some Space", poem: ["Blank paper left on the page,", "far smoke on the mountain;", "add a little less effort,", "keep an inch more sky."], gloss: "Doing slightly less can preserve the judgement you need next.", advice: "Keep your capacity for decisions only you can make." },
  },
  {
    grade: "neutral", title: "守拙待時",
    poem: ["春耕不爭早", "秋收自有期", "笨工勤打磨", "終見璞成璣"],
    gloss: "進度慢不等於落後，根基打穩的事不怕晚。",
    advice: "今天適合補基礎、改細節，不必急著證明什麼。",
    en: { title: "Patient Craft", poem: ["Spring ploughing need not race;", "autumn harvest keeps its date.", "Slow work, steadily polished,", "turns raw jade into a gem."], gloss: "Slow progress is not falling behind; sound foundations are never late.", advice: "Today suits groundwork and fine details; there is nothing to prove yet." },
  },
  {
    grade: "excellent", title: "水到渠成",
    poem: ["溪細終歸海", "雲輕自出山", "不爭一時快", "自有水流長"],
    gloss: "已經在做的事正在累積，順著現有的節奏便是最好的推進。",
    advice: "持續比突擊有效；把重複的動作做穩，比開新局更划算。",
    en: { title: "Water Finds Its Course", poem: ["A thin stream still reaches the sea;", "light clouds leave the mountain on their own.", "No need to be quick for a moment;", "the current runs long."], gloss: "What you are already doing is accumulating; the current rhythm is the best way to advance.", advice: "Consistency beats sprints; steady repetition beats starting something new." },
  },
  {
    grade: "neutral", title: "開口三思",
    poem: ["言出如潑水", "收回事已難", "話到唇邊轉", "三思再啟關"],
    gloss: "今天容易說過頭，一句話的重量比想像中大。",
    advice: "重要的訊息先寫下來放一放；情緒高的時候不做決定。",
    en: { title: "Think Before Speaking", poem: ["Words spilled cannot be gathered;", "taking them back is hard.", "Let the phrase turn on your lips,", "think three times, then open the gate."], gloss: "It is easy to say too much today; one sentence weighs more than you expect.", advice: "Write important messages down and let them rest; decide nothing at high emotion." },
  },
  {
    grade: "excellent", title: "貴人在側",
    poem: ["路遠有同行", "燈暗見微光", "莫嫌人語淡", "一語可回航"],
    gloss: "身邊有人願意給你一個方向或一個提醒，別急著婉拒。",
    advice: "主動問一句、聽完一句；今天的求助比硬撐更有效率。",
    en: { title: "A Helper Nearby", poem: ["A long road has companions;", "in dim light, a small glow.", "Do not dismiss a quiet word;", "one sentence can turn the ship."], gloss: "Someone nearby may offer a direction or a reminder; do not rush to decline.", advice: "Ask one question, hear one answer; asking is more efficient than enduring alone." },
  },
  {
    grade: "good", title: "去繁就簡",
    poem: ["枝多遮日影", "葉落見天青", "減去三分事", "留得一分明"],
    gloss: "事情之所以亂，往往是因為放太多。",
    advice: "只留下三件必做的事，其餘延後或放手。",
    en: { title: "Simplify", poem: ["Many branches shade the sun;", "fallen leaves show the blue sky.", "Cut away three parts of the work", "and keep one part clear."], gloss: "Things are usually messy because too much was loaded on.", advice: "Keep three must-do items; postpone or release the rest." },
  },
  {
    grade: "mild", title: "退一步寬",
    poem: ["路窄難並馬", "退身便見天", "不爭眼前利", "自有後來寬"],
    gloss: "今天的僵持不必分勝負，退一步反而看得更清楚。",
    advice: "把「贏」換成「弄清楚」；對方的條件先聽完再回應。",
    en: { title: "Step Back, Gain Room", poem: ["A narrow road cannot take two horses;", "step aside and the sky opens.", "Skip the fight over today's gain,", "and room arrives later."], gloss: "No need to win today's standoff; a step back shows more.", advice: "Swap \"winning\" for \"understanding\"; hear their terms out first." },
  },
  {
    grade: "good", title: "知足常安",
    poem: ["杯小也能滿", "粥淡亦成歡", "心安茅屋穩", "何必羨雕鞍"],
    gloss: "手上已有的東西，比今天想要的更值得先珍惜。",
    advice: "在添新之前，先把已有的整理好、用好。",
    en: { title: "Content and Calm", poem: ["A small cup can still be full;", "plain porridge still brings joy.", "A peaceful heart steadies a thatched roof;", "why envy a carved saddle?"], gloss: "What you already have deserves attention before what you want today.", advice: "Before adding anything new, organise and use what you have." },
  },
  {
    grade: "neutral", title: "靜觀其變",
    poem: ["雲急風將動", "池深月未沉", "且收千里目", "靜聽一聲真"],
    gloss: "局面還在變化，現在表態可能太早。",
    advice: "蒐集資訊、保留彈性；等條件落定再行動。",
    en: { title: "Watch and Wait", poem: ["Clouds rush; the wind will stir.", "The pool is deep; the moon has not sunk.", "Withdraw your far-ranging gaze", "and listen for the true sound."], gloss: "The situation is still shifting; declaring a position now may be early.", advice: "Gather information and keep flexibility; act when conditions settle." },
  },
];

const NUMERALS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
const GRADE_LABEL: Record<SacredLocale, Record<SlipGrade, string>> = {
  "zh-Hant": { excellent: "上吉", good: "中吉", mild: "小吉", neutral: "中平" },
  "zh-Hans": { excellent: "上吉", good: "中吉", mild: "小吉", neutral: "中平" },
  en: { excellent: "Excellent", good: "Good", mild: "Mild", neutral: "Neutral" },
};

export type DailySlip = {
  index: number;
  number: string;
  grade: SlipGrade;
  gradeLabel: string;
  title: string;
  poem: string[];
  gloss: string;
  advice: string;
};

export const SPIRIT_SLIP_COUNT = SLIPS.length;

export function spiritSlipFor(hash: number, locale: SacredLocale): DailySlip {
  const index = hash % SLIPS.length;
  const slip = SLIPS[index];
  const number = locale === "en" ? `No. ${index + 1}` : `第${NUMERALS[index]}籤`;
  if (locale === "en") {
    return { index, number, grade: slip.grade, gradeLabel: GRADE_LABEL.en[slip.grade], title: slip.en.title, poem: [...slip.en.poem], gloss: slip.en.gloss, advice: slip.en.advice };
  }
  const convert = locale === "zh-Hans" ? hantToHans : (text: string) => text;
  return {
    index,
    number: convert(number),
    grade: slip.grade,
    gradeLabel: GRADE_LABEL[locale][slip.grade],
    title: convert(slip.title),
    poem: slip.poem.map(convert),
    gloss: convert(slip.gloss),
    advice: convert(slip.advice),
  };
}

/** 供測試遍歷全部籤文。 */
export const SPIRIT_SLIP_SOURCE = SLIPS;
