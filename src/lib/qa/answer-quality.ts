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
  scores: AnswerQualityScores;
  failed: boolean;
  failReasons: string[];
};

const KIND_PATTERNS: Array<[QuestionKind, RegExp[]]> = [
  ["choice", [/還是|还是|二選一|二选一|選哪|选哪|哪個更|哪个更|哪一個更|which\s+(?:one|option)|\bvs\.?\b/i]],
  ["timing", [/何時|何时|什麼時候|什么时候|哪一年|哪年|幾月|几月|應期|应期|when\b|timing\b/i]],
  ["love", [/感情|戀愛|恋爱|婚姻|伴侶|伴侣|男友|女友|對象|对象|復合|复合|love|relationship|marriage|partner/i]],
  ["career", [/工作|事業|事业|職業|职业|轉職|转职|跳槽|升職|升职|老闆|老板|公司|職場|职场|career|job|work|role|business/i]],
  ["money", [/財運|财运|收入|賺錢|赚钱|投資|投资|資產|资产|房產|房产|金錢|金钱|money|finance|income|investment|wealth/i]],
  ["health", [/健康|身體|身体|睡眠|壓力|压力|疲勞|疲劳|生病|疾病|health|body|sleep|stress/i]],
  ["home", [/家宅|住宅|住哪|搬家|搬遷|搬迁|房間|房间|風水|风水|home|house|move house|feng shui/i]],
  ["past", [/前世|今生|六道|一掌經|一掌经|past life|past-life/i]],
  ["self", [/格局|身強|身强|身弱|用神|病藥|病药|調候|调候|日主|命局|八字|性格|自己|self|bazi|day master|structure/i]],
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
  const kindMatch = routedKind === detectedIntent;
  const hintMatch = KIND_ANSWER_HINTS[detectedIntent].test(direct);
  const protocol = result.methodProtocol;
  const usedModules = modulesActuallyUsed(result);

  const directAnswer = direct.length >= 8 ? 1 : direct.length >= 3 ? 0.7 : 0;
  const relevance = clamp((kindMatch ? 0.85 : 0.25) + (hintMatch ? 0.15 : 0));
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

  return { detectedIntent, scores, failed: failReasons.length > 0, failReasons };
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
  return union > 0 && intersection / union >= 0.72;
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
