import type { QuestionKind } from "@/lib/bazi/types";

export type AnswerQualityCorpusCase = {
  id: string;
  topic: string;
  question: string;
  expectedKind: QuestionKind;
  expectedCoverage: string;
};

export const ANSWER_QUALITY_CORPUS: AnswerQualityCorpusCase[] = [
  { id: "structure", topic: "格局", question: "這個八字到底是什麼格局？格局成立到什麼程度？", expectedKind: "self", expectedCoverage: "直接回答主格、成立條件、完成度與限制" },
  { id: "strength", topic: "身強身弱", question: "這個命局究竟身強還是身弱？依據是什麼？", expectedKind: "self", expectedCoverage: "直接回答承載強弱及月令、根氣、透藏依據" },
  { id: "useful", topic: "用神", question: "這個命局真正該取什麼用？不要只說缺什麼補什麼。", expectedKind: "self", expectedCoverage: "區分格局核心、病藥、調候與綜合首要解法" },
  { id: "remedy", topic: "病藥", question: "命局的主病是什麼，藥神到底落在哪裡？", expectedKind: "self", expectedCoverage: "先病後藥，說明作用鏈與是否有根有路" },
  { id: "dayun", topic: "大運", question: "我現在這步大運的主題是什麼？", expectedKind: "timing", expectedCoverage: "回答當前大運背景、主結構受力與可操作重點" },
  { id: "annual", topic: "流年", question: "今年流年對我最直接的影響是什麼？", expectedKind: "timing", expectedCoverage: "回答流年引動，不把所有人生領域都展開" },
  { id: "career", topic: "工作", question: "這份工作還值得繼續做嗎？", expectedKind: "career", expectedCoverage: "第一段直接回答工作去留，再給結構與現實條件" },
  { id: "love", topic: "感情", question: "這段感情還有沒有繼續發展的空間？", expectedKind: "love", expectedCoverage: "只回答關係承載、當前節奏與可驗證條件" },
  { id: "money", topic: "財運", question: "接下來一年財務上最該防什麼？", expectedKind: "money", expectedCoverage: "回答財務風險與時間背景，不展開無關感情內容" },
  { id: "choice", topic: "二選一", question: "留在現在的公司，還是接受新的工作？哪個更合適？", expectedKind: "choice", expectedCoverage: "能判則明確選擇；不能判則說明缺少的比較條件" },
  { id: "timing", topic: "應期", question: "工作轉機大概在什麼時候出現？", expectedKind: "timing", expectedCoverage: "只在有上位歲運支持時談時間窗口與可信度" },
  { id: "kinship", topic: "六親", question: "父親這條六親線在命局裡怎麼看？", expectedKind: "self", expectedCoverage: "區分功能、人、事件三層，不以單一十神直接等同真人事件" },
  { id: "d60", topic: "D60", question: "我的出生分鐘很準，D60 能不能作為旁證？", expectedKind: "self", expectedCoverage: "先做時辰可靠度 gate，再決定是否作旁證" },
  { id: "ziwei", topic: "紫微", question: "紫微能不能驗證這個感情判斷？", expectedKind: "love", expectedCoverage: "紫微只作獨立現象場景驗證，不改寫子平主判" },
  { id: "unknown-time", topic: "未知時辰", question: "不知道出生時辰，還能判工作嗎？", expectedKind: "career", expectedCoverage: "明確標示不能判的時辰依賴模組，保留可判部分" },
  { id: "mixed", topic: "多問題混合", question: "我想知道工作和財務，但現在最急的是要不要換工作。", expectedKind: "career", expectedCoverage: "先回答最急的工作問題，其他問題降級為次要" },
];
