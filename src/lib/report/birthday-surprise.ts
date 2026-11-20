import type { AppLocale } from "@/lib/bazi/types";
import type { ShareCardModel } from "@/lib/report/share-card";
import { getDayStemCharacterAsset, getReportVisualAsset } from "@/lib/report/report-visual-assets";

export type BirthdayState = { kind: "today" } | { kind: "countdown"; days: number } | { kind: "hidden" };
const DAY_MS = 86_400_000;

function dateParts(instant: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(instant);
  return { year: Number(parts.find((part) => part.type === "year")?.value), month: Number(parts.find((part) => part.type === "month")?.value), day: Number(parts.find((part) => part.type === "day")?.value) };
}

/** Compare calendar dates in the guest's chart timezone. Feb 29 birthdays observe Feb 28 in non-leap years. */
export function birthdayState(birthMonth: number, birthDay: number, instant: Date, timezone: string): BirthdayState {
  const today = dateParts(instant, timezone);
  let targetMonth = birthMonth;
  let targetDay = birthDay;
  if (birthMonth === 2 && birthDay === 29 && !isLeapYear(today.year)) targetDay = 28;
  let days = (Date.UTC(today.year, targetMonth - 1, targetDay) - Date.UTC(today.year, today.month - 1, today.day)) / DAY_MS;
  if (days < 0) {
    const nextYear = today.year + 1;
    if (birthMonth === 2 && birthDay === 29 && !isLeapYear(nextYear)) targetDay = 28;
    else targetDay = birthDay;
    days = (Date.UTC(nextYear, targetMonth - 1, targetDay) - Date.UTC(today.year, today.month - 1, today.day)) / DAY_MS;
  }
  if (days === 0) return { kind: "today" };
  return days >= 1 && days <= 7 ? { kind: "countdown", days } : { kind: "hidden" };
}

function isLeapYear(year: number) { return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0); }

export function birthdayIntroMode(reducedMotion: boolean, alreadyPlayed: boolean): "letter" | "intro" {
  return reducedMotion || alreadyPlayed ? "letter" : "intro";
}

export function birthdayYear(instant: Date, timezone: string) { return dateParts(instant, timezone).year; }

export function birthdayIntroKey(month: number, day: number, year: number) { return `zhaowu.birthday-intro.v1:${year}:${month}-${day}`; }

// PLACEHOLDER copy: official literary copy will be written by 智譜清言 and reviewed by 白澤.
// Each language/stem has its own temporary paragraph; do not present these as final copy.
const HANT: Record<string, string> = {
  甲: "願你像山中初生的長木，向上時不忘根，伸展時仍留有柔韌。今日不必急著證明自己走得多遠，先辨認心裡真正珍重的方向，再把力氣放在值得長久照料的事上。遇到風雨時，讓枝葉承接變化，也讓根系安住當下。願你有清明的眼光，也有慢慢生長的餘裕；每一步都不必喧嘩，仍能抵達自己的高處。這段文字是暫用佔位稿，往後會由創作者重新撰寫與審閱。",
  乙: "願你像庭前柔枝，懂得順勢而生，也記得自己並非沒有方向。細微的感受不是負擔，它們讓你看見別人忽略的轉折；而你的溫柔，也不需要以委屈自己作為代價。今天可以為心意留一處安靜的位置，再挑選一件真心想完成的小事。願你在依傍與獨立之間找到舒服的距離，在曲折裡保有韌性與清醒。此段仍是暫用佔位文字，等待正式創作與審閱。",
  丙: "願你像晨光照過遠山，明朗而不催促，溫暖而不灼人。你帶來的熱度可以照亮同行的人，也要記得替自己留一段休息的陰影。今日不必把所有想法一次說盡，先讓最重要的心意落在一個可行的行動裡。當掌聲安靜下來，仍請聽見自己心中細小而真實的聲音。願你的明亮有節奏，熱情有歸處，所照見的路也容得下自己的步伐。這是暫用佔位稿，正式文案將另行創作並審閱。",
  丁: "願你像夜窗前的一盞燈，不必耀眼，也能讓一方天地安穩。你細緻的觀察與含蓄的心意，常在沉靜處帶來清楚的光；別因此忘了，燈火也需要添油與歇息。今天若有未說出口的願望，可以先用溫和的方式承認它，再為它留下一點時間。願你不被外界的喧鬧催著改變自己的亮度，在安靜與表達之間，找到自在而穩定的位置。此文字是等待創作者重寫的佔位稿。",
  戊: "願你如遠山厚土，沉著承接，也能辨明哪些重量不必獨自背負。可靠是你的力量，卻不表示每件事都要由你收拾。今天不妨把責任分出輕重，為真正重要的人事留下餘地，也為自己安排一段可休息的空白。山並非從不移動，而是在歲月裡守住所向。願你在穩定中保持開闊，在承擔時仍聽見內心的需要。這段文字明確屬於暫用佔位稿，之後將由創作者撰寫與審閱。",
  己: "願你像春雨後的沃土，能讓想法落地，也容許尚未成熟的事物慢慢發芽。照料他人是你的本領，照料自己同樣值得被排進日常。若今天感到事情繁多，先挑一件最能滋養未來的小事，安穩完成便好。你不必把每一寸土地都種滿，留白也會讓根呼吸。願你的細心帶來生機，而不是耗盡；願你在付出與收穫之間，尋到踏實溫和的平衡。此為佔位稿，正式文字將重新創作並審閱。",
  庚: "願你如秋山之石，保有清晰的界線與堅定的骨架，也記得鋒芒之外仍有溫度。判斷果決能替你開路，但適時停一停，也會讓方向更準。今日遇到取捨時，先分辨原則與習慣，再把真正重要的留下。你不必靠嚴苛證明可靠，寬容也能讓力量持久。願你在清醒中保有柔軟，在行動前聽見不同聲音，仍能走出端正而自在的路。這是待正式撰寫的佔位稿。",
  辛: "願你像霜晨中的玉石，清澈而有光，不因安靜便失去存在感。你對細節的珍惜，能把平凡之處照料得妥帖；也請允許自己不必事事完美，才值得被看見。今天可以放下不必要的比較，選一件能讓心神歸位的小事，慢慢做完。願你的品味成為生活的滋養，而非束縛；願你在純粹與親近之間，仍保有明亮、自尊與舒展。本文是暫用佔位文字，等待後續創作與審閱。",
  壬: "願你像江河行經群山，寬廣地接納變化，也記得替自己選擇河道。敏銳與好奇帶你看見更多可能，然而不必每一條路都同時追逐。今天先讓思緒沉澱，再挑一個值得持續的方向，踏出清楚的一步。遇到阻礙時，可以轉彎，不必否定一路累積的力量。願你的流動不失根本，遠行仍能知返；在遼闊與專注之間，找到真正合身的節奏。此段是等待正式撰寫、審閱的佔位稿。",
  癸: "願你像細雨與清泉，懂得以微小而持續的方式滋養生活。你感受到的細節或許不易被旁人察覺，卻能成為理解世界的入口；請給自己足夠的邊界，不必承接所有情緒。今日可以讓心安靜片刻，再把一個模糊的念頭寫成簡單的句子。願柔和不等於退讓，安靜也不等於停滯；願你在細水長流中保有清澈，慢慢走向珍視的地方。這是明確標示的暫用佔位稿，之後會再創作審閱。",
};

const HAN_S: Record<string, string> = {
  甲: "愿你像山中初生的长木，向上时不忘根，伸展时仍留有柔韧。今天不必急着证明自己走了多远，先辨认心里真正珍重的方向，再把力气放在值得长久照料的事上。遇到风雨时，让枝叶承接变化，也让根系安住当下。愿你有清明的眼光，也有慢慢生长的余裕；每一步都不必喧哗，仍能抵达自己的高处。这段文字是暂用占位稿，之后会由创作者重新撰写与审阅。",
  乙: "愿你像庭前柔枝，懂得顺势而生，也记得自己并非没有方向。细微的感受不是负担，它们让你看见别人忽略的转折；而你的温柔，也不需要以委屈自己为代价。今天可以为心意留一处安静的位置，再挑选一件真心想完成的小事。愿你在依傍与独立之间找到舒服的距离，在曲折里保有韧性与清醒。此段仍是暂用占位文字，等待正式创作与审阅。",
  丙: "愿你像晨光照过远山，明朗而不催促，温暖而不灼人。你带来的热度可以照亮同行的人，也要记得替自己留一段休息的阴影。今天不必把所有想法一次说尽，先让最重要的心意落在一个可行的行动里。当掌声安静下来，仍请听见自己心中细小而真实的声音。愿你的明亮有节奏，热情有归处，所照见的路也容得下自己的步伐。这是暂用占位稿，正式文案将另行创作并审阅。",
  丁: "愿你像夜窗前的一盏灯，不必耀眼，也能让一方天地安稳。你细致的观察与含蓄的心意，常在沉静处带来清楚的光；别因此忘了，灯火也需要添油与歇息。今天若有未说出口的愿望，可以先用温和的方式承认它，再为它留下一点时间。愿你不被外界的喧闹催着改变自己的亮度，在安静与表达之间，找到自在而稳定的位置。此文字是等待创作者重写的占位稿。",
  戊: "愿你如远山厚土，沉着承接，也能辨明哪些重量不必独自背负。可靠是你的力量，却不表示每件事都要由你收拾。今天不妨把责任分出轻重，为真正重要的人事留下余地，也为自己安排一段可休息的空白。山并非从不移动，而是在岁月里守住所向。愿你在稳定中保持开阔，在承担时仍听见内心的需要。这段文字明确属于暂用占位稿，之后将由创作者撰写与审阅。",
  己: "愿你像春雨后的沃土，能让想法落地，也允许尚未成熟的事物慢慢发芽。照料他人是你的本领，照料自己同样值得被排进日常。若今天感到事情繁多，先挑一件最能滋养未来的小事，安稳完成便好。你不必把每一寸土地都种满，留白也会让根呼吸。愿你的细心带来生机，而不是耗尽；愿你在付出与收获之间，寻到踏实温和的平衡。此为占位稿，正式文字将重新创作并审阅。",
  庚: "愿你如秋山之石，保有清晰的界线与坚定的骨架，也记得锋芒之外仍有温度。判断果决能替你开路，但适时停一停，也会让方向更准。今天遇到取舍时，先分辨原则与习惯，再把真正重要的留下。你不必靠严苛证明可靠，宽容也能让力量持久。愿你在清醒中保有柔软，在行动前听见不同声音，仍能走出端正而自在的路。这是待正式撰写的占位稿。",
  辛: "愿你像霜晨中的玉石，清澈而有光，不因安静便失去存在感。你对细节的珍惜，能把平凡之处照料得妥帖；也请允许自己不必事事完美，才值得被看见。今天可以放下不必要的比较，选一件能让心神归位的小事，慢慢做完。愿你的品味成为生活的滋养，而非束缚；愿你在纯粹与亲近之间，仍保有明亮、自尊与舒展。本文是暂用占位文字，等待后续创作与审阅。",
  壬: "愿你像江河行经群山，宽广地接纳变化，也记得替自己选择河道。敏锐与好奇带你看见更多可能，然而不必每一条路都同时追逐。今天先让思绪沉淀，再挑一个值得持续的方向，踏出清楚的一步。遇到阻碍时，可以转弯，不必否定一路积累的力量。愿你的流动不失根本，远行仍能知返；在辽阔与专注之间，找到真正合身的节奏。此段是等待正式撰写、审阅的占位稿。",
  癸: "愿你像细雨与清泉，懂得以微小而持续的方式滋养生活。你感受到的细节或许不易被旁人察觉，却能成为理解世界的入口；请给自己足够的边界，不必承接所有情绪。今天可以让心安静片刻，再把一个模糊的念头写成简单的句子。愿柔和不等于退让，安静也不等于停滞；愿你在细水长流中保有清澈，慢慢走向珍视的地方。这是明确标示的暂用占位稿，之后会再创作审阅。",
};

const EN: Record<string, string> = {
  甲: "May you grow like a mountain tree: reaching upward while staying close to your roots. You do not need to prove how far you have come today. Notice what matters, then give your energy to something worth tending over time. Let changing weather move through your branches without unsettling the ground beneath you. May you keep a clear view and enough room to grow at your own pace. This is temporary placeholder copy, awaiting its final writer and review.",
  乙: "May you bend with changing winds without losing your direction. Your sensitivity helps you notice turns others may miss, and your kindness need not come at the cost of your own needs. Leave a quiet place for what you truly want, then choose one small thing to complete. May you find a comfortable distance between relying on others and standing on your own. This temporary placeholder will be rewritten and reviewed.",
  丙: "May your warmth resemble morning light across distant hills: clear, generous, and unhurried. Your energy can brighten a room, but you deserve shade and rest as well. You do not have to say everything at once; let one important intention become one workable action. When the applause fades, listen for your own quieter voice. May your brightness keep a humane rhythm. This is placeholder copy for later writing and review.",
  丁: "May you be like a lamp beside a night window: not dazzling, yet enough to make a small world feel safe. Your careful attention often brings clarity in quiet places. Remember that every flame needs tending and rest. If a wish remains unspoken, acknowledge it gently and give it a little time. May you keep your own steady light amid the noise. This temporary placeholder will receive final writing and review.",
  戊: "May you carry the steadiness of a distant mountain while knowing which burdens are not yours alone. Reliability is a strength, not a promise to fix everything. Sort what truly needs your attention today, and leave space for rest. Mountains change across the years while keeping their bearing. May you stay open within your stability and hear your own needs as you care for others. Placeholder copy, awaiting final writing and review.",
  己: "May you be like fertile ground after spring rain, letting ideas take root without demanding that every seed bloom at once. Caring for others is a gift; caring for yourself belongs in the daily rhythm too. Choose one small action that nourishes what comes next. Unplanted space lets roots breathe. May your attentiveness bring life without exhausting you. This temporary placeholder will be rewritten and reviewed.",
  庚: "May you hold the clear boundaries of an autumn mountain and the warmth that lives beyond its stone. Decisive judgment can open a path, while a pause can make the direction surer. When choices arise, separate principle from habit and keep what matters. You need not be harsh to be dependable. May your clarity leave room for softness. This is placeholder copy for later writing and review.",
  辛: "May you be like a clear stone in a frosted morning: luminous without needing to call for attention. Your care for detail can make ordinary moments feel considered. You do not have to be perfect to deserve to be seen. Set comparison aside today and do one thing that brings you back to yourself. May your discernment nourish rather than constrain you. Placeholder copy, awaiting final writing and review.",
  壬: "May you travel like a broad river through changing country, welcoming possibility while choosing your own course. Curiosity reveals many paths, though you need not pursue them all at once. Let your thoughts settle, then take one clear step in a direction worth keeping. A bend around an obstacle does not erase the strength you have gathered. This temporary placeholder awaits final writing and review.",
  癸: "May you nourish your days like rain and a clear spring: quietly, gently, and with persistence. Small details you notice can open a way to understand the world, but you need not carry every feeling you encounter. Give yourself a boundary and a quiet moment. Write one vague thought in a simple sentence. May gentleness keep its strength, and may your steady pace lead you toward what you value. Placeholder copy for later writing and review.",
};

const STEM_TITLE: Record<string, [string, string, string]> = { 甲: ["甲木", "甲木", "Jia Wood"], 乙: ["乙木", "乙木", "Yi Wood"], 丙: ["丙火", "丙火", "Bing Fire"], 丁: ["丁火", "丁火", "Ding Fire"], 戊: ["戊土", "戊土", "Wu Earth"], 己: ["己土", "己土", "Ji Earth"], 庚: ["庚金", "庚金", "Geng Metal"], 辛: ["辛金", "辛金", "Xin Metal"], 壬: ["壬水", "壬水", "Ren Water"], 癸: ["癸水", "癸水", "Gui Water"] };

export function birthdayLetter(stem: string, locale: AppLocale) {
  const index = locale === "en" ? 2 : locale === "zh-Hans" ? 1 : 0;
  const title = STEM_TITLE[stem]?.[index] ?? stem;
  const body = (locale === "en" ? EN : locale === "zh-Hans" ? HAN_S : HANT)[stem];
  if (!body) return null;
  return { title: locale === "en" ? `For your birthday · ${title}` : locale === "zh-Hans" ? `写给今天生日的你 · ${title}` : `給今日生日的你 · ${title}`, body, placeholder: true as const, marker: locale === "en" ? "Placeholder" : locale === "zh-Hans" ? "占位稿" : "佔位稿", signature: "昭梧・S原創" };
}

export function buildBirthdayShareModel(stem: string, locale: AppLocale, letter: ReturnType<typeof birthdayLetter>): ShareCardModel | null {
  if (!letter) return null;
  const key: Record<string, string> = { 甲: "jia-wood", 乙: "yi-wood", 丙: "bing-fire", 丁: "ding-fire", 戊: "wu-earth", 己: "ji-earth", 庚: "geng-metal", 辛: "xin-metal", 壬: "ren-water", 癸: "gui-water" };
  const visualKey = key[stem];
  const artwork = locale === "en" ? getReportVisualAsset("day-master", visualKey) : getDayStemCharacterAsset(visualKey);
  return { brand: "昭梧・S原創", title: locale === "en" ? "Happy Birthday" : locale === "zh-Hans" ? "生日快乐" : "生日快樂", subtitle: letter.title, summary: letter.body, keywords: [letter.marker], facts: [], artwork, artworkFallback: "/wallpaper-song.jpg", watermark: "昭梧・S原創" };
}
