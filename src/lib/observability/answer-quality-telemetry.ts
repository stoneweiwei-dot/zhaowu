import type { AnalysisResult, QuestionKind } from "@/lib/bazi/types";
import {
  evaluateAnswerQuality,
  getUsedModules,
  questionsAreEquivalent,
  redactQuestion,
  stableQuestionFingerprint,
} from "@/lib/qa/answer-quality";

const POSTHOG_KEY = String(import.meta.env.VITE_POSTHOG_KEY || "phc_w6rhtrMQLLBczV4uNvsDWGb4zq2GCknyeqa2YWScrs3G").trim();
const POSTHOG_HOST = String(import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");
const SESSION_KEY = "zhaowu:qa-session-id";
const REASK_KEY = "zhaowu:qa-reask-state";

type ReaskState = { question: string; kind: QuestionKind; repeatCount: number };

type TrackResultArgs = {
  result: AnalysisResult;
  expectedKind?: QuestionKind;
  startedAt: number;
  source: "initial" | "follow-up" | "report";
};

type TrackErrorArgs = {
  question: string;
  source: "initial" | "follow-up" | "report";
  error: unknown;
  startedAt: number;
};

function browserReady() {
  return typeof window !== "undefined" && typeof window.fetch === "function";
}

function randomId() {
  return globalThis.crypto?.randomUUID?.() ?? `qa-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sessionId() {
  if (!browserReady()) return "server";
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = randomId();
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return randomId();
  }
}

function readReaskState(): ReaskState | null {
  if (!browserReady()) return null;
  try {
    const raw = window.sessionStorage.getItem(REASK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReaskState;
    return parsed && typeof parsed.question === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function updateReaskState(question: string, kind: QuestionKind) {
  const previous = readReaskState();
  const equivalent = Boolean(previous && previous.kind === kind && questionsAreEquivalent(previous.question, question));
  const repeatCount = equivalent ? (previous?.repeatCount ?? 0) + 1 : 0;
  if (browserReady()) {
    try { window.sessionStorage.setItem(REASK_KEY, JSON.stringify({ question, kind, repeatCount } satisfies ReaskState)); } catch { /* no-op */ }
  }
  return repeatCount;
}

function capture(event: string, properties: Record<string, unknown>) {
  if (!browserReady() || !POSTHOG_KEY) return;
  const sid = sessionId();
  const payload = {
    api_key: POSTHOG_KEY,
    event,
    properties: {
      distinct_id: `zhaowu:${sid}`,
      $session_id: sid,
      $process_person_profile: false,
      $current_url: window.location.href,
      $host: window.location.host,
      app: "zhaowu",
      qa_contract: "STONE-R6.1-P0",
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };
  void fetch(`${POSTHOG_HOST}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
    mode: "cors",
    credentials: "omit",
  }).catch(() => undefined);
}

function compactError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 180);
  return String(error ?? "unknown").slice(0, 180);
}

export function trackAnswerResult({ result, expectedKind, startedAt, source }: TrackResultArgs) {
  if (!browserReady()) return;
  const evaluation = evaluateAnswerQuality(result, expectedKind);
  const reaskCount = updateReaskState(result.question, evaluation.detectedIntent);
  const failReasons = [...evaluation.failReasons];
  if (reaskCount >= 2) failReasons.push("two_semantically_equivalent_reasks");
  const failed = failReasons.length > 0;
  const protocol = result.methodProtocol;
  const modulesUsed = getUsedModules(result);
  const common = {
    trace_id: result.id,
    source,
    runtime_mode: protocol?.mode ?? "unknown",
    engine_version: protocol?.version ?? "unknown",
    detected_intent: evaluation.detectedIntent,
    answer_route: result.reading.kind,
    modules_used: modulesUsed,
    latency_ms: Math.max(0, Date.now() - startedAt),
    locale: result.locale ?? "unknown",
    question_fingerprint: stableQuestionFingerprint(result.question),
    reask_count: reaskCount,
    direct_answer_length: result.reading.directAnswer?.length ?? 0,
    answer_length: [result.reading.directAnswer, result.reading.rhythm, result.reading.action, result.reading.lastLine].join(" ").length,
    ...evaluation.scores,
    failed,
    failure_categories: failReasons,
  };

  capture("zhaowu_answer_quality", common);

  if (failed) {
    capture("zhaowu_answer_quality_failed", {
      ...common,
      regression_id: result.id,
      original_question_redacted: redactQuestion(result.question),
      incorrect_answer_redacted: redactQuestion(result.reading.directAnswer ?? ""),
      expected_coverage: `direct answer for ${evaluation.detectedIntent}; only relevant R6.1 modules`,
      fixing_commit: "pending",
      post_fix_retest: "pending",
    });
  }
}

export function trackAnswerError({ question, source, error, startedAt }: TrackErrorArgs) {
  if (!browserReady()) return;
  capture("zhaowu_answer_error", {
    source,
    latency_ms: Math.max(0, Date.now() - startedAt),
    question_fingerprint: stableQuestionFingerprint(question),
    question_redacted: redactQuestion(question),
    error: compactError(error),
  });
}
