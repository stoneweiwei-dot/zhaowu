import type { Element } from "./types";

export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export const STEM_ELEMENT: Record<string, Element> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

export const BRANCH_ELEMENT: Record<string, Element> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

export const ELEMENT_GENERATES: Record<Element, Element> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

export const ELEMENT_CONTROLS: Record<Element, Element> = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火",
};

export const ELEMENT_MOTHER: Record<Element, Element> = {
  木: "水",
  火: "木",
  土: "火",
  金: "土",
  水: "金",
};

export const DAY_MASTER_NATURE: Record<string, string> = {
  甲: "向上生長、承擔骨架，喜歡把事情撐成可以依靠的結構",
  乙: "柔韌適應、善於盤繞資源，在縫隙裡也能長出形狀",
  丙: "公開照明、帶動氣氛，需要舞台也容易過熱",
  丁: "內斂燃燒、專注細節，火小而久，忌被潮氣悶住",
  戊: "厚重承載、能托住局面，行動慢但一旦立定不易動搖",
  己: "收納化育、打理雜務，擅長把散亂的東西變成可用之地",
  庚: "剛毅決斷、鋒利分明，擅長切開問題，也容易傷到關係",
  辛: "精緻鑑別、講究品質，標準高，忌把刀鋒對準自己",
  壬: "深廣流通、善於吸收資訊，要有出口才不會積成內耗",
  癸: "細潤滲透、觀察入微，擅長醞釀，忌長期停在霧裡",
};

export const ELEMENT_LABEL: Record<Element, string> = {
  木: "生長與表達",
  火: "推動與呈現",
  土: "承載與整合",
  金: "判斷與整理",
  水: "洞察與流動",
};

export const SEASON_OF_BRANCH: Record<string, "春" | "夏" | "秋" | "冬" | "四季"> = {
  寅: "春",
  卯: "春",
  辰: "四季",
  巳: "夏",
  午: "夏",
  未: "四季",
  申: "秋",
  酉: "秋",
  戌: "四季",
  亥: "冬",
  子: "冬",
  丑: "四季",
};

export const S2T: Record<string, string> = {
  偏印: "偏印",
  正印: "正印",
  比肩: "比肩",
  劫财: "劫財",
  食神: "食神",
  伤官: "傷官",
  正财: "正財",
  偏财: "偏財",
  正官: "正官",
  七杀: "七殺",
  日主: "日主",
  长生: "長生",
  沐浴: "沐浴",
  冠带: "冠帶",
  临官: "臨官",
  帝旺: "帝旺",
  衰: "衰",
  病: "病",
  死: "死",
  墓: "墓",
  绝: "絕",
  胎: "胎",
  养: "養",
  路旁土: "路旁土",
  桑柘木: "桑柘木",
  泉中水: "泉中水",
  天河水: "天河水",
};

export function toTrad(s: string): string {
  if (!s) return s;
  if (S2T[s]) return S2T[s];
  return s
    .replaceAll("财", "財")
    .replaceAll("伤", "傷")
    .replaceAll("杀", "殺")
    .replaceAll("长", "長")
    .replaceAll("临", "臨")
    .replaceAll("绝", "絕")
    .replaceAll("养", "養")
    .replaceAll("带", "帶")
    .replaceAll("岁", "歲")
    .replaceAll("运", "運")
    .replaceAll("历", "曆")
    .replaceAll("农", "農")
    .replaceAll("时", "時")
    .replaceAll("为", "為")
    .replaceAll("与", "與")
    .replaceAll("国", "國")
    .replaceAll("湾", "灣")
    .replaceAll("台", "臺");
}

export const HOUR_LABELS = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

export const DIRECTION_OF_ELEMENT: Record<Element, string> = {
  木: "正東",
  火: "正南",
  土: "中宮／西南",
  金: "正西",
  水: "正北",
};

export const COLOR_OF_ELEMENT: Record<Element, string[]> = {
  木: ["森林綠", "青玉綠", "青灰"],
  火: ["暖朱紅", "珊瑚橘", "酒紅"],
  土: ["米白", "暖赭", "燕麥色"],
  金: ["珍珠白", "淺金", "銀灰"],
  水: ["霧藍", "深海軍藍", "墨黑"],
};

export const HOUR_OF_ELEMENT: Record<Element, string[]> = {
  木: ["寅時（03–05）", "卯時（05–07）"],
  火: ["巳時（09–11）", "午時（11–13）"],
  土: ["辰時（07–09）", "戌時（19–21）"],
  金: ["申時（15–17）", "酉時（17–19）"],
  水: ["亥時（21–23）", "子時（23–01）"],
};
