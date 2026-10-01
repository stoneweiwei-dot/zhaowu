import { toLunar } from "@/lib/bazi/calendar";

/**
 * 每日黃曆「聖日」資料（農曆日期 → 佛道與民間信仰的聖誕、成道、出家等日子）。
 *
 * 這是依佛教、道教與民間信仰的通行說法整理的日期表，各寺廟宮觀的慣例略有差異，頁面上會標註「以所屬寺廟宮觀為準」。
 * 閏月不重複計算聖日。大月三十、小月廿九的差異按「當月最後一天」處理。
 */
export type SacredLocale = "zh-Hant" | "zh-Hans" | "en";
export type SacredKind = "buddha" | "dao" | "folk";

type Entry = { zh: string; en: string; kind: SacredKind };
const b = (zh: string, en: string): Entry => ({ zh, en, kind: "buddha" });
const d = (zh: string, en: string): Entry => ({ zh, en, kind: "dao" });
const f = (zh: string, en: string): Entry => ({ zh, en, kind: "folk" });

const FESTIVALS: Record<string, Entry[]> = {
  "1-1": [b("彌勒菩薩聖誕", "Maitreya Bodhisattva's birthday")],
  "1-6": [b("定光古佛聖誕", "Dipamkara Buddha's birthday")],
  "1-9": [d("玉皇上帝聖誕（天誕）", "Jade Emperor's birthday")],
  "1-15": [d("上元天官大帝聖誕", "Heaven Official (Shangyuan) birthday")],
  "2-2": [f("福德正神（土地公）聖誕", "Earth God (Tudigong) birthday")],
  "2-3": [d("文昌帝君聖誕", "Wenchang Emperor's birthday")],
  "2-8": [b("釋迦牟尼佛出家日", "Shakyamuni Buddha's renunciation day")],
  "2-15": [b("釋迦牟尼佛涅槃日", "Shakyamuni Buddha's parinirvana day"), d("太上老君聖誕", "Laozi (Supreme Elderly Lord) birthday")],
  "2-19": [b("觀世音菩薩聖誕", "Guanyin Bodhisattva's birthday")],
  "2-21": [b("普賢菩薩聖誕", "Samantabhadra Bodhisattva's birthday")],
  "3-3": [d("玄天上帝聖誕", "Xuantian Shangdi's birthday")],
  "3-15": [f("保生大帝聖誕", "Baosheng Emperor's birthday"), f("財神趙公元帥聖誕", "God of Wealth (Marshal Zhao) birthday")],
  "3-16": [b("準提菩薩聖誕", "Cundi Bodhisattva's birthday")],
  "3-23": [f("天上聖母（媽祖）聖誕", "Mazu (Heavenly Mother) birthday")],
  "3-28": [d("東嶽大帝聖誕", "Eastern Peak Emperor's birthday")],
  "4-4": [b("文殊菩薩聖誕", "Manjushri Bodhisattva's birthday")],
  "4-8": [b("釋迦牟尼佛聖誕（浴佛節）", "Shakyamuni Buddha's birthday (Buddha Bathing Day)")],
  "4-14": [d("呂洞賓（純陽祖師）聖誕", "Lü Dongbin (Patriarch Chunyang) birthday")],
  "4-28": [b("藥王菩薩聖誕", "Medicine King Bodhisattva's birthday")],
  "5-5": [f("端午・天中節", "Dragon Boat Festival (Tianzhong)")],
  "5-11": [f("城隍爺聖誕", "City God's birthday")],
  "5-13": [b("伽藍菩薩聖誕", "Sangharama (Guardian) Bodhisattva's birthday")],
  "6-3": [b("韋馱菩薩聖誕", "Skanda (Weituo) Bodhisattva's birthday")],
  "6-19": [b("觀世音菩薩成道日", "Guanyin Bodhisattva's enlightenment day")],
  "6-24": [d("關聖帝君聖誕", "Guan Sheng Emperor (Guan Yu) birthday")],
  "7-7": [f("七夕・七娘媽聖誕", "Qixi / Qiniangma's birthday")],
  "7-13": [b("大勢至菩薩聖誕", "Mahasthamaprapta Bodhisattva's birthday")],
  "7-15": [d("中元地官大帝聖誕", "Earth Official (Zhongyuan) birthday")],
  "7-30": [b("地藏王菩薩聖誕", "Ksitigarbha Bodhisattva's birthday")],
  "8-3": [f("灶君（司命真君）聖誕", "Kitchen God's birthday")],
  "8-15": [f("中秋・太陰星君聖誕", "Mid-Autumn / Moon Goddess birthday")],
  "8-22": [b("燃燈古佛聖誕", "Dipamkara (Lamp-Lighting) Buddha's birthday")],
  "9-9": [f("重陽節・九皇大帝聖誕", "Double Ninth / Nine Emperors birthday")],
  "9-19": [b("觀世音菩薩出家日", "Guanyin Bodhisattva's renunciation day")],
  "9-30": [b("藥師琉璃光如來聖誕", "Medicine Buddha's birthday")],
  "10-5": [b("達摩祖師聖誕", "Bodhidharma's birthday")],
  "10-15": [d("下元水官大帝聖誕", "Water Official (Xiayuan) birthday")],
  "11-11": [d("太乙救苦天尊聖誕", "Taiyi Saviour Lord's birthday")],
  "11-17": [b("阿彌陀佛聖誕", "Amitabha Buddha's birthday")],
  "11-19": [b("日光菩薩聖誕", "Sunlight Bodhisattva's birthday")],
  "12-8": [b("釋迦牟尼佛成道日（臘八）", "Shakyamuni Buddha's enlightenment day (Laba)")],
  "12-16": [f("土地公尾牙", "Earth God's year-end banquet (Weiya)")],
  "12-24": [f("送灶神（灶君上天）", "Sending off the Kitchen God")],
  "12-25": [d("玉皇上帝巡天", "Jade Emperor's inspection of the world")],
  "12-29": [b("華嚴菩薩聖誕", "Huayan Bodhisattva's birthday")],
};

/** 十齋日：佛教傳統每月十個持齋日，各對應一尊佛菩薩。 */
const FAST_DAYS: Record<number, { zh: string; en: string }> = {
  1: { zh: "定光佛", en: "Dipamkara Buddha" },
  8: { zh: "藥師佛", en: "Medicine Buddha" },
  14: { zh: "賢劫千佛", en: "Thousand Buddhas of the Bhadra Kalpa" },
  15: { zh: "阿彌陀佛", en: "Amitabha Buddha" },
  18: { zh: "地藏王菩薩", en: "Ksitigarbha Bodhisattva" },
  23: { zh: "大勢至菩薩", en: "Mahasthamaprapta Bodhisattva" },
  24: { zh: "觀世音菩薩", en: "Guanyin Bodhisattva" },
  28: { zh: "盧舍那佛", en: "Vairocana Buddha" },
  29: { zh: "藥王菩薩", en: "Medicine King Bodhisattva" },
  30: { zh: "釋迦牟尼佛", en: "Shakyamuni Buddha" },
};

/** 繁體→簡體，每組「繁簡」兩字、以空格分隔；只覆蓋本資料與籤文用到的字，由測試保證沒有漏網的繁體字。 */
const HANS_PAIRS = "亂乱 並并 係系 來来 個个 側侧 動动 勝胜 勢势 後后 啟启 嚴严 嶽岳 帥帅 師师 彈弹 彌弥 態态 憂忧 應应 擊击 撐撑 斷断 於于 時时 會会 條条 槃盘 歡欢 歸归 氣气 決决 減减 準准 滿满 潑泼 為为 無无 煙烟 燈灯 爭争 爺爷 現现 璣玑 盧卢 確确 礎础 穩稳 節节 簡简 籤签 純纯 紙纸 細细 終终 給给 經经 緒绪 緣缘 續续 羨羡 聖圣 聲声 聽听 臘腊 華华 葉叶 藍蓝 藥药 處处 複复 見见 親亲 觀观 訊讯 話话 認认 誕诞 語语 誤误 說说 請请 諾诺 證证 變变 財财 貴贵 費费 資资 賓宾 賢贤 贏赢 趙赵 轉转 還还 邊边 釋释 長长 門门 開开 間间 關关 雜杂 難难 雲云 靜静 韋韦 頭头 願愿 風风 養养 餘余 馬马 馱驮 驚惊 麼么 東东 積积 補补 進进 過过 達达 遠远 適适 遲迟 錢钱 順顺 須须 別别 呂吕 問问 媽妈 寫写 寬宽 薩萨 對对 將将 換换 載载 齋斋 與与 廟庙 宮宫 屬属 異异 搖摇 當当 預预 詩诗 創创";

const HANS_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const pair of HANS_PAIRS.split(" ")) {
    const [hant, hans] = Array.from(pair);
    if (hant && hans) map[hant] = hans;
  }
  return map;
})();

export function hantToHans(text: string) {
  return Array.from(text, (char) => HANS_MAP[char] ?? char).join("");
}

export type SacredItem = { label: string; kind: SacredKind };
export type SacredToday = {
  items: SacredItem[];
  fast: string | null;
};

function localized(entry: { zh: string; en: string }, locale: SacredLocale) {
  return locale === "en" ? entry.en : locale === "zh-Hans" ? hantToHans(entry.zh) : entry.zh;
}

function lunarOf(date: Date) {
  return toLunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function isLastLunarDay(date: Date) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return lunarOf(next)?.day === 1;
}

export function sacredForDate(date: Date, locale: SacredLocale): SacredToday {
  const lunar = lunarOf(date);
  if (!lunar) return { items: [], fast: null };
  const keys = lunar.isLeap ? [] : [`${lunar.month}-${lunar.day}`];
  const lastDay = isLastLunarDay(date);
  // 小月只有廿九：把原本落在三十的聖日提前到廿九。
  if (!lunar.isLeap && lunar.day === 29 && lastDay) keys.push(`${lunar.month}-30`);
  const items = keys.flatMap((key) => FESTIVALS[key] ?? []).map((entry) => ({ label: localized(entry, locale), kind: entry.kind }));
  const fastEntry = FAST_DAYS[lunar.day];
  const fastParts: string[] = [];
  if (fastEntry) fastParts.push(localized(fastEntry, locale));
  if (lunar.day === 29 && lastDay) fastParts.push(localized(FAST_DAYS[30], locale));
  return { items, fast: fastParts.length ? fastParts.join(locale === "en" ? " & " : "、") : null };
}

export type NextSacred = { inDays: number; date: Date; items: SacredItem[] };

/** 往後找下一個有明確聖誕的日子，讓「今天沒有聖誕」的日子也有可看的內容。 */
export function nextSacredAfter(date: Date, locale: SacredLocale, maxDays = 70): NextSacred | null {
  for (let step = 1; step <= maxDays; step += 1) {
    const candidate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + step);
    const { items } = sacredForDate(candidate, locale);
    if (items.length) return { inDays: step, date: candidate, items };
  }
  return null;
}

export const SACRED_KIND_LABEL: Record<SacredLocale, Record<SacredKind, string>> = {
  "zh-Hant": { buddha: "佛", dao: "道", folk: "民間" },
  "zh-Hans": { buddha: "佛", dao: "道", folk: "民间" },
  en: { buddha: "Buddhist", dao: "Daoist", folk: "Folk" },
};

/** 供測試遍歷全部資料。 */
export const SACRED_SOURCE = { FESTIVALS, FAST_DAYS };
