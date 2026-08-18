import type { QuestionKind } from "@/lib/bazi/types";
import type { MethodItem, MethodProtocol, MethodStatus } from "@/lib/core/types";

const ZIPING: MethodItem = {
  name: "子平八字",
  role: "主判",
  status: "已執行",
  strength: "把出生時間轉成季節氣候、五行功能、格局病藥與人生承載。",
  bound: "禁止缺什麼補什麼、五行計數、生肖單論、神煞凌駕格局。",
};

const CATALOG: Record<string, Omit<MethodItem, "status" | "role">> = {
  紫微斗數: { name: "紫微斗數", strength: "十二宮拆人生領域，四化看能量怎麼移動。", bound: "沒有獨立星曜宮位資料時不作判定。" },
  西方占星: { name: "西方占星", strength: "命主星、宮主星與相位描述心理衝突。", bound: "心理敘事不等於客觀事件預測。" },
  吠陀占星: { name: "吠陀占星", strength: "Nakshatra 與 Dasha 連月宿和人生時期。", bound: "必須固定恒星黃道與 Ayanamsa。" },
  宿曜: { name: "宿曜", strength: "月亮本能、人際距離與月宿主星。", bound: "只作關係旁證，不單獨決定婚姻成敗。" },
  六爻: { name: "六爻", strength: "一件明確問題的成敗、條件與應期。", bound: "必須另起卦；一卦一事。" },
  大六壬: { name: "大六壬", strength: "完整事件鏈：人物、過程、結果、應期。", bound: "必須另起課；出生八字不能冒充六壬。" },
  奇門遁甲: { name: "奇門遁甲", strength: "當下局勢裡的時間、空間、方向與策略。", bound: "只處理行動策略，不分析完整一生。" },
  風水: { name: "風水", strength: "處理真實居住與工作空間。", bound: "需平面圖、坐向、照片或實地資料。" },
  人類圖: { name: "人類圖", strength: "類型、策略、權威與開放中心的行為提示。", bound: "只作行為工具，不以中微子敘事證明命運。" },
  數字學: { name: "數字學", strength: "壓縮生日與名稱的象徵原型。", bound: "資訊量太低，不預測大運、婚姻與災禍。" },
  十二次: { name: "十二次", strength: "真實中國天區的宏觀十二次結構。", bound: "宿界、曆元與星曆未標準化前只作研究模組。" },
  七政四餘: { name: "七政四餘", strength: "以真實日月五星、宿度與宮位描述出生天空。", bound: "必須使用精確星曆；不能用八字反推。" },
  達摩一掌經: { name: "達摩一掌經", strength: "農曆四宮、十二星與六道的確定性排盤。", bound: "民俗分類，不是可驗證的歷史前世。" },
  三世因果歌: { name: "三世因果歌", strength: "把四宮結果整理成前因、今果、後種。", bound: "只轉譯已排出的四宮，不另造故事。" },
};

const EXCLUDED = ["天使數字", "星際種子身份", "阿卡西客觀斷言", "五格筆畫", "稱骨", "純生肖", "純納音"];

function item(name: string, status: MethodStatus, role: MethodItem["role"] = "專項"): MethodItem {
  const base = CATALOG[name];
  return { name, role, status, strength: base?.strength ?? "", bound: base?.bound ?? "" };
}

export function routeMethods(kind: QuestionKind, extras?: { palmReady?: boolean; palmMissing?: string[] }): MethodProtocol {
  const selected: MethodItem[] = [];
  let reason = "本題以子平八字主判。";

  switch (kind) {
    case "past":
      selected.push(
        item("達摩一掌經", extras?.palmReady ? "已執行" : "資料未接入"),
        item("三世因果歌", extras?.palmReady ? "已執行" : "資料未接入"),
      );
      reason = extras?.palmReady
        ? "前世／六道題由達摩一掌經主答，三世因果歌只轉譯四宮；子平仍是命局主判。"
        : `前世題需要${(extras?.palmMissing ?? ["性別"]).join("、")}才能排四宮，先不填六道。`;
      break;
    case "love":
      selected.push(item("紫微斗數", "資料未接入"), item("西方占星", "資料未接入"), item("宿曜", "資料未接入"));
      reason = "感情題：子平看本人關係結構；紫微／西方／宿曜待獨立排盤。";
      break;
    case "career":
    case "money":
      selected.push(item("紫微斗數", "資料未接入"), item("吠陀占星", "資料未接入"), item("西方占星", "資料未接入"));
      reason = "工作財務題：正文只由子平判斷現實主線。";
      break;
    case "health":
      reason = "身心題原則上不擴張流派，只作生活節奏提示，並守醫療邊界。";
      break;
    case "home":
      selected.push(item("風水", "資料未接入"), item("奇門遁甲", "資料未接入"));
      reason = "家宅題：子平只看承載；風水需平面圖，奇門需另起局。";
      break;
    case "timing":
    case "choice":
      selected.push(item("六爻", "資料未接入"), item("大六壬", "資料未接入"));
      reason = "成敗／何時題：子平給背景；六爻、大六壬須另起卦／課。";
      break;
    default:
      selected.push(item("西方占星", "資料未接入"), item("人類圖", "資料未接入"));
      reason = "性格與總鑑以子平為主；旁證未接入不造假。";
  }

  return {
    version: "ZW-METHOD-1.1",
    mode: "deterministic-zero-ai",
    primary: ZIPING,
    selected: selected.slice(0, 3),
    routingReason: reason,
    excluded: EXCLUDED,
    performance: { aiCalls: 0, externalCalls: 0, maxMethods: 4, prebuiltAtRequestCreation: true },
  };
}
