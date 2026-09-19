import type { AnalysisResult, QuestionKind } from "@/lib/bazi/types";

export type AnswerQualityScores = {
  direct_answer_score: number;
  relevance_score: number;
  structure_score: number;
  r6_1_compliance: number;
  redundancy_score: number;
  unsupported_claim_score: number;
};

export type AnswerQualityEvaluation = {
  detectedIntent: QuestionKind;
  questionFocus: string;
  scores: AnswerQualityScores;
  failed: boolean;
  failReasons: string[];
};

const KIND_PATTERNS: Array<[QuestionKind, RegExp[]]> = [
  ["choice", [/還是|还是|二選一|二选一|選哪|选哪|哪個更|哪个更|哪一個更|which\s+(?:one|option)|\bvs\.?\b/i]],
  ["timing", [/何時|何时|什麼時候|什么时候|哪一年|哪年|幾月|几月|應期|应期|when\b|timing\b/i]],
  ["love", [/感情|戀愛|恋爱|婚姻|伴侶|伴侣|男友|女友|對象|对象|復合|复合|love|relationship|marriage|partner/i]],
  ["career", [/工作|事業|事业|職業|职业|轉職|转职|跳槽|升職|升职|老闆|老板|公司|職場|职场|career|job|work|role|business/i]],
  ["money", [/財運|财运|財務|财务|收入|賺錢|赚钱|投資|投资|資產|资产|房產|房产|金錢|金钱|money|finance|financial|income|investment|wealth/i]],
  ["health", [/健康|身體|身体|睡眠|壓力|压力|疲勞|疲劳|生病|疾病|health|body|sleep|stress/i]],
  ["home", [/家宅|住宅|住哪|搬家|搬遷|搬迁|房間|房间|風水|风水|home|house|move house|feng shui/i]],
  ["past", [/前世|今生|六道|一掌經|一掌经|past life|past-life/i]],
  ["self", [/天賦|天赋|擅長|擅长|強項|强项|格局|身強|身强|身弱|用神|病藥|病药|調候|调候|日主|命局|八字|性格|自己|talent|aptitude|self|bazi|day master|structure/i]],
];

const FOCUS_RULES: Array<[string, RegExp, RegExp]> = [
  // Precision / data sufficiency gates come first so a compound question such as
  // "不知道時辰，我適合什麼工作？" cannot pass by answering only the job-fit half.
  ["unknown_time", /(不知道.{0,8}(時辰|时辰|出生時間|出生时间)|時辰.{0,8}(不知|未知|不確定|不确定)|时辰.{0,8}(不知|未知|不确定)|unknown.{0,8}(birth\s*time|time of birth))/i, /(時辰|时辰|出生時間|出生时间|不作判定|降級|降级|只能判|可以判一部分|unknown|birth\s*time|downgrad)/i],
  ["d60", /(D60|六十[分份]盤|六十[分份]盘|沙斯提安沙|shashtiamsa)/i, /(D60|旁證|旁证|時間|时间|time|corroborat)/i],
  ["ziwei", /(紫微|紫微斗數|紫微斗数|zi\s*wei)/i, /(紫微|旁證|旁证|驗證|验证|時辰|时辰|zi\s*wei|validat)/i],
  ["job_fit", /(適合|适合).{0,8}(什麼|什么|哪種|哪种|哪類|哪类).{0,8}(工作|職業|职业|職位|职位|崗位|岗位)|(適合做|适合做).{0,8}(工作|職業|职业|什麼|什么)|職業方向|职业方向|career\s+fit|what\s+(?:job|career)/i, /(研究|教學|教学|知識管理|知识管理|專業支援|专业支援|營運|营运|管理|顧問|顾问|設計|设计|協作|协作|開拓|开拓|專案|项目|服務|服务|產品|产品|企劃|企划|創作|创作|商務|商务|危機處理|危机处理|技術診斷|技术诊断|跨領域|跨领域|不足以可靠列出|無法可靠列出|无法可靠列出|research|teaching|operations|management|consulting|design|support|business development|insufficient)/i],
  ["talent", /(天賦|天赋|擅長什麼|擅长什么|強項|强项|能力特長|能力特长|talent|aptitude|natural\s+strength)/i, /(獨立完成|独立完成|自主判斷|自主判断|協作整合|协作整合|調動資源|调动资源|整理複雜|整理复杂|建立方法|穩定輸出|稳定输出|找出問題|找出问题|改進|改进|設計解法|设计解法|穩定執行|稳定执行|可重複成果|可重复成果|辨識機會|辨识机会|連結人與資源|连接人与资源|承責|承责|組織與落地|组织与落地|抓重點|抓重点|做決定|做决定|深挖|專門判斷|专门判断|不足以可靠列出|無法可靠列出|无法可靠列出|research|organis|analy[sz]|decision|integrat|deliver|insufficient)/i],
  ["career_decision", /(工作|職位|职位|公司|事業|事业|職業|职业).{0,18}(值不值得|要不要|該不該|该不该|能不能|是否值得|繼續|继续|離開|离开|換|换)|(值不值得|要不要|該不該|该不该|是否值得).{0,18}(工作|職位|职位|公司|事業|事业|職業|职业)/i, /(不能可靠|不能只憑|不能只凭|值得繼續|值得继续|不值得|續留|续留|離開|离开|換工作|换工作|不換|不换|stay|leave|cannot reliably|worth continuing)/i],
  ["love_outlook", /(感情|關係|关系|曖昧|暧昧|復合|复合|對象|对象).{0,18}(有沒有|有没有|還有沒有|还有没有|能不能|會不會|会不会|空間|空间|發展|发展|繼續|继续)|(還有沒有|还有没有|能不能|會不會|会不会).{0,18}(感情|關係|关系|復合|复合|發展|发展)/i, /(不能可靠|不能只憑|不能只凭|有發展空間|有发展空间|沒有發展空間|没有发展空间|偏向繼續|偏向继续|不要再加碼|不要再加码|聯繫|联系|投入|承諾|承诺|recipro|commit|cannot reliably)/i],
  ["money_risk", /(財務|财务|財運|财运|錢|钱|收入|投資|投资|現金流|现金流).{0,18}(最該防|最该防|風險|风险|注意|小心|避免|防什麼|防什么)|(最該防|最该防|風險|风险|注意|小心).{0,18}(財務|财务|財運|财运|錢|钱|投資|投资)/i, /(最該防|最该防|風險|风险|現金流|现金流|最大損失|最大损失|退出|槓桿|杠杆|固定支出|loss|cash flow|exit)/i],
  ["choice", /(還是|还是|二選一|二选一|選哪|选哪|哪個更|哪个更|哪一個更|which\s+(?:one|option)|\bvs\.?\b)/i, /(暫不強選|暂不强选|條件不足|条件不足|偏向|選|选|A|B|option|choose|choice|不能可靠)/i],
  ["timing", /(何時|何时|什麼時候|什么时候|哪一年|哪年|幾月|几月|應期|应期|when\b|timing\b)/i, /(\d{4}年|\d{1,2}月|窗口|時間|时间|階段|阶段|暫不能精確|暂不能精确|when|timing|period)/i],
  ["structure", /(格局|成格|破格|格局大小|pattern|structure)/i, /(格局|主格|結構|结构|完成度|pattern|structure)/i],
  ["strength", /(身強|身强|身弱|旺衰|日主.{0,8}(強|强|弱)|strong|weak|strength)/i, /(身強|身强|身弱|旺衰|承載|承载|強|强|弱|strength|capacity)/i],
  ["remedy", /(病藥|病药|藥神|药神|主病|病在哪|remedy|structural disease)/i, /(主病|病藥|病药|藥|药|對治|对治|remedy|disease)/i],
  ["useful", /(用神|喜用|取用|useful god|favourable element|favorable element)/i, /(用神|取用|候選|候选|流通|調候|调候|useful|candidate)/i],
  ["decision", /(值不值得|要不要|該不該|该不该|能不能|有沒有必要|有没有必要|是否值得|是否應該|是否应该|繼續.{0,8}[嗎吗]|继续.{0,8}[嗎吗]|should\s+i|worth\s+(?:staying|continuing))/i, /(直接回答|偏向|建議|建议|不建議|不建议|值得|不值得|可以|不能|不宜|暫不能|暂不能|不作判定|stay|leave|cannot|should|lean)/i],
];

const KIND_ANSWER_HINTS: Record<QuestionKind, RegExp> = {
  choice: /選|选|方案|方向|A|B|option|choose|choice/i,
  timing: /年|月|時|时|運|运|階段|阶段|when|timing|period/i,
  love: /感情|關係|关系|伴侶|伴侣|婚|戀|恋|love|relationship|partner/i,
  career: /工作|事業|事业|職場|职场|職業|职业|career|job|work|role/i,
  money: /財|财|收入|投資|投资|資產|资产|money|finance|income|wealth/i,
  health: /身體|身体|健康|睡眠|壓力|压力|health|body|sleep|stress/i,
  home: /家|宅|住|搬|房|風水|风水|home|house|move/i,
  past: /前世|六道|一掌|象徵|象征|past|symbol/i,
  self: /格局|日主|命局|結構|结构|旺|弱|用神|病藥|病药|自己|structure|bazi|self/i,
};

const GENERIC_FILLER = [
  /一切都是最好的安排/i,
  /相信自己(?:就|，|,)?/i,
  /順其自然|顺其自然/i,
  /宇宙(?:會|会)?(?:給|给)你/i,
  /命中注定/i,
  /做最好的自己/i,
  /聽從內心|听从内心/i,
];

const ABSOLUTE_CLAIMS = [
  /百分之百/g,
  /100\s*%/g,
  /必然會/g,
  /必然会/g,
  /一定會/g,
  /一定会/g,
  /保證會/g,
  /保证会/g,
  /絕對會/g,
  /绝对会/g,
  /注定會/g,
  /注定会/g,
  /毫無疑問會/g,
  /毫无疑问会/g,
  /guaranteed\s+to/gi,
  /definitely\s+will/gi,
  /certain\s+to/gi,
];

function clamp(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(3))));
}

export function detectQaIntent(question: string, fallback: QuestionKind = "self"): QuestionKind {
  const text = question.trim();
  for (const [kind, patterns] of KIND_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(text))) return kind;
  }
  return fallback;
}

export function detectQuestionFocus(question: string): string {
  for (const [name, questionPattern] of FOCUS_RULES) {
    if (questionPattern.test(question)) return name;
  }
  return "general";
}

export function directAnswerCoversQuestion(question: string, directAnswer: string): boolean {
  const matched = FOCUS_RULES.filter(([, questionPattern]) => questionPattern.test(question));
  if (matched.length) {
    // Compound questions must satisfy every detected requirement. This prevents a
    // technically related sentence from passing while silently dropping the most
    // important half of the user's question.
    return matched.every(([, , answerPattern]) => answerPattern.test(directAnswer));
  }
  const kind = detectQaIntent(question, "self");
  return directAnswer.trim().length >= 8 && KIND_ANSWER_HINTS[kind].test(directAnswer);
}

function sentenceParts(text: string): string[] {
  return text
    .split(/[。！？!?;；\n]+/)
    .map((part) => part.replace(/[\s，,、：:（）()【】\[\]「」『』]/g, "").toLowerCase())
    .filter((part) => part.length >= 8);
}

function redundancyScore(text: string): number {
  const parts = sentenceParts(text);
  if (parts.length < 2) return 0;
  const unique = new Set(parts);
  return clamp((parts.length - unique.size) / parts.length);
}

function unsupportedClaimScore(text: string): number {
  let count = 0;
  for (const pattern of ABSOLUTE_CLAIMS) count += text.match(pattern)?.length ?? 0;
  return count ? clamp(Math.min(1, count / 3)) : 0;
}

function modulesActuallyUsed(result: AnalysisResult): string[] {
  const protocol = result.methodProtocol;
  if (!protocol) return [];
  const modules = [protocol.primary.name];
  for (const item of protocol.selected ?? []) {
    if (item.status === "已執行") modules.push(item.name);
  }
  return [...new Set(modules)];
}

export function getUsedModules(result: AnalysisResult): string[] {
  return modulesActuallyUsed(result);
}

export function evaluateAnswerQuality(result: AnalysisResult, expectedKind?: QuestionKind): AnswerQualityEvaluation {
  const direct = result.reading.directAnswer?.trim() ?? "";
  const answerText = [direct, result.reading.rhythm, result.reading.action, result.reading.lastLine].filter(Boolean).join("\n");
  const routedKind = result.reading.kind;
  const detectedIntent = detectQaIntent(result.question, expectedKind ?? routedKind);
  const questionFocus = detectQuestionFocus(result.question);
  const kindMatch = routedKind === detectedIntent;
  const hintMatch = KIND_ANSWER_HINTS[detectedIntent].test(direct);
  const coverageMatch = directAnswerCoversQuestion(result.question, direct);
  const protocol = result.methodProtocol;
  const usedModules = modulesActuallyUsed(result);

  const directAnswer = direct.length >= 8 && coverageMatch ? 1 : direct.length >= 3 ? 0.55 : 0;
  const relevance = clamp((kindMatch ? 0.75 : 0.2) + (hintMatch ? 0.1 : 0) + (coverageMatch ? 0.15 : 0));
  const structure = clamp(
    (direct ? 0.35 : 0) +
      (result.reading.action?.trim() ? 0.25 : 0) +
      (kindMatch ? 0.2 : 0) +
      (protocol?.primary?.name === "子平八字" ? 0.2 : 0),
  );
  const unsupported = unsupportedClaimScore(answerText);
  const redundancy = redundancyScore(answerText);

  let r61 = 1;
  if (!direct) r61 -= 0.35;
  if (!kindMatch) r61 -= 0.3;
  if (!coverageMatch) r61 -= 0.2;
  if (protocol?.primary?.name !== "子平八字" || protocol.primary.role !== "主判") r61 -= 0.25;
  if (protocol?.mode && protocol.mode !== "deterministic-zero-ai") r61 -= 0.1;
  if (!usedModules.includes("子平八字")) r61 -= 0.15;
  r61 -= unsupported * 0.5;

  const scores: AnswerQualityScores = {
    direct_answer_score: clamp(directAnswer),
    relevance_score: clamp(relevance),
    structure_score: clamp(structure),
    r6_1_compliance: clamp(r61),
    redundancy_score: redundancy,
    unsupported_claim_score: unsupported,
  };

  const failReasons: string[] = [];
  if (scores.direct_answer_score < 0.8) failReasons.push("direct_answer_below_0.8");
  if (scores.relevance_score < 0.8) failReasons.push("relevance_below_0.8");
  if (scores.r6_1_compliance < 0.9) failReasons.push("r6_1_compliance_below_0.9");
  if (scores.unsupported_claim_score > 0) failReasons.push("unsupported_claim_present");
  if (GENERIC_FILLER.some((pattern) => pattern.test(answerText))) failReasons.push("generic_filler_present");

  return { detectedIntent, questionFocus, scores, failed: failReasons.length > 0, failReasons };
}

function fingerprintTokens(value: string): Set<string> {
  const normalized = normalizeQuestion(value);
  const tokens = new Set<string>();
  const latin = normalized.match(/[a-z0-9]+/g) ?? [];
  latin.forEach((token) => tokens.add(token));
  const cjk = normalized.replace(/[a-z0-9]/g, "");
  for (let index = 0; index < cjk.length - 1; index += 1) tokens.add(cjk.slice(index, index + 2));
  return tokens;
}

export function normalizeQuestion(value: string): string {
  return value
    .toLowerCase()
    .replace(/^(?:請問|请问|想問|想问|我想問|我想问|那|所以|那麼|那么)+/g, "")
    .replace(/到底/g, "")
    .replace(/值不值得/g, "值得")
    .replace(/該不該/g, "該")
    .replace(/该不该/g, "该")
    .replace(/能不能/g, "能")
    .replace(/可不可以/g, "可以")
    .replace(/[嗎吗呢吧啊呀]$/g, "")
    .replace(/[\s\p{P}\p{S}]/gu, "")
    .trim();
}

export function questionsAreEquivalent(a: string, b: string): boolean {
  const left = normalizeQuestion(a);
  const right = normalizeQuestion(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (Math.min(left.length, right.length) >= 8 && (left.includes(right) || right.includes(left))) return true;
  const aTokens = fingerprintTokens(a);
  const bTokens = fingerprintTokens(b);
  if (!aTokens.size || !bTokens.size) return false;
  let intersection = 0;
  for (const token of aTokens) if (bTokens.has(token)) intersection += 1;
  const union = new Set([...aTokens, ...bTokens]).size;
  return union > 0 && intersection / union >= 0.68;
}

export function redactQuestion(value: string): string {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, "[number]")
    .replace(/\b\d{4}[\-/年]\d{1,2}[\-/月]\d{1,2}(?:日)?\b/g, "[date]")
    .replace(/\b\d{1,2}:\d{2}\b/g, "[time]")
    .replace(/\b\d{6,}\b/g, "[number]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export function stableQuestionFingerprint(value: string): string {
  const input = normalizeQuestion(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `q_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
