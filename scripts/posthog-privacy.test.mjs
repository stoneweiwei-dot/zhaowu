import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { trackAnswerError, trackAnswerResult } from "../src/lib/observability/answer-quality-telemetry.ts";
import { trackConversion } from "../src/lib/observability/conversion-telemetry.ts";
import {
  analyticsPathname,
  coarseErrorType,
  questionLengthBucket,
  stripQueryAndHash,
} from "../src/lib/observability/posthog-privacy.ts";
import { stableQuestionFingerprint } from "../src/lib/qa/answer-quality.ts";

const PAGE = "/?report=abc-uuid&session_id=x#report";
const QUESTION = "林婉清 Alice Chen 住在 88 Harbour Street，出生 1990.5.3，農曆一九九零年三月，早上八點，想問工作。test@example.com";
const QUESTION_FRAGMENTS = [
  "林婉清",
  "Alice Chen",
  "88 Harbour Street",
  "1990.5.3",
  "一九九零年三月",
  "早上八點",
  "test@example.com",
];
const URL_SECRETS = ["abc-uuid", "access_key", "client_reference_id", "ref_secret", "?report=", "#report"];
const TEXT_KEYS = [
  "question",
  "question_text",
  "question_redacted",
  "original_question",
  "original_question_redacted",
  "incorrect_answer",
  "incorrect_answer_redacted",
  "error",
];

function installBrowser(href = PAGE) {
  const store = new Map();
  const sessionStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); },
  };
  globalThis.window = {
    location: {
      href,
      pathname: "/",
      search: "?report=abc-uuid&session_id=x",
      hash: "#report",
      host: "zhao-wu.com",
      hostname: "zhao-wu.com",
      origin: "https://zhao-wu.com",
    },
    sessionStorage,
    fetch: globalThis.fetch,
  };
}

function captured(run, href = PAGE) {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const bodies = [];
  installBrowser(href);
  globalThis.fetch = async (url, init = {}) => {
    bodies.push({
      url: String(url),
      body: typeof init.body === "string" ? JSON.parse(init.body) : null,
    });
    return { ok: true };
  };
  globalThis.window.fetch = globalThis.fetch;
  try {
    run();
    return bodies.filter((call) => call.url.endsWith("/capture/")).map((call) => call.body);
  } finally {
    globalThis.fetch = previousFetch;
    globalThis.window = previousWindow;
  }
}

function reading(question) {
  return {
    id: "trace-fixed",
    locale: "zh-Hant",
    question,
    chart: {},
    reading: {
      kind: "self",
      directAnswer: question,
      rhythm: "",
      work: "",
      love: "",
      money: "",
      body: "",
      home: "",
      action: "",
      decree: "",
      lastLine: "",
      guide: {},
    },
    createdAt: "2026-10-30T00:00:00.000Z",
  };
}

function assertNoQuestionText(payload) {
  const encoded = JSON.stringify(payload);
  for (const fragment of QUESTION_FRAGMENTS) {
    assert.equal(encoded.includes(fragment), false, `payload leaked ${fragment}`);
  }
  for (const key of TEXT_KEYS) assert.equal(Object.hasOwn(payload.properties, key), false, key);
}

test("answer_error and quality_failed payloads contain no question text", () => {
  const payloads = captured(() => {
    trackAnswerError({
      question: QUESTION,
      source: "initial",
      error: new Error("出生 1990.5.3 林婉清 88 Harbour Street 早上八點"),
      startedAt: Date.now(),
    });
    trackAnswerResult({
      result: reading(QUESTION),
      startedAt: Date.now(),
      source: "initial",
    });
  });

  const errorEvent = payloads.find((payload) => payload.event === "zhaowu_answer_error");
  const failedEvent = payloads.find((payload) => payload.event === "zhaowu_answer_quality_failed");
  assert.ok(errorEvent, "zhaowu_answer_error was not captured");
  assert.ok(failedEvent, "zhaowu_answer_quality_failed was not captured");

  for (const payload of [errorEvent, failedEvent]) {
    assertNoQuestionText(payload);
    assert.equal(payload.properties.$current_url, "/");
    assert.equal(payload.properties.question_fingerprint, stableQuestionFingerprint(QUESTION));
    assert.match(payload.properties.question_fingerprint, /^q_[0-9a-f]{8}$/);
    assert.equal(payload.properties.question_length_bucket, questionLengthBucket(QUESTION.length));
    assert.equal(payload.properties.system, "bazi");
    assert.equal(payload.properties.$process_person_profile, false);
    assert.equal(payload.properties.$geoip_disable, true);
  }
  assert.equal(errorEvent.properties.error_type, "Error");
  assert.equal(typeof failedEvent.properties.failure_categories, "object");
});

test("$current_url for a query-and-hash return URL is exactly /", () => {
  assert.equal(analyticsPathname(PAGE), "/");
  assert.equal(analyticsPathname("https://zhao-wu.com/?report=abc-uuid&session_id=x#report"), "/");
  assert.equal(stripQueryAndHash("https://news.example/story?report=abc-uuid&session_id=x#report"), "https://news.example/story");

  const payloads = captured(() => {
    trackConversion("zhaowu_checkout_clicked", {
      system: "bazi",
      product: "system",
      currency: "USD",
      has_report_id: false,
      $referrer: "https://news.example/story?report=abc-uuid&session_id=x#report",
      page_url: "https://zhao-wu.com/pay?access_key=secret&client_reference_id=ref_secret#done",
      question_redacted: QUESTION,
    });
    trackAnswerError({
      question: QUESTION,
      source: "report",
      error: new TypeError("早上八點"),
      startedAt: Date.now(),
    });
  });

  assert.ok(payloads.length >= 2);
  for (const payload of payloads) {
    assert.equal(payload.properties.$current_url, "/");
    const encoded = JSON.stringify(payload);
    for (const secret of URL_SECRETS) assert.equal(encoded.includes(secret), false, secret);
    for (const fragment of QUESTION_FRAGMENTS) assert.equal(encoded.includes(fragment), false, fragment);
  }
  const checkout = payloads.find((payload) => payload.event === "zhaowu_checkout_clicked");
  assert.equal(checkout.properties.$referrer, "https://news.example/story");
  assert.equal(checkout.properties.page_url, "/pay");
  assert.equal(Object.hasOwn(checkout.properties, "question_redacted"), false);
});

test("city-picker chunk capture sends pathname only", () => {
  const picker = readFileSync(new URL("../src/components/city-picker.tsx", import.meta.url), "utf8");
  const actions = readFileSync(new URL("../src/lib/actions.ts", import.meta.url), "utf8");
  const answerTelemetry = readFileSync(new URL("../src/lib/observability/answer-quality-telemetry.ts", import.meta.url), "utf8");
  const conversionTelemetry = readFileSync(new URL("../src/lib/observability/conversion-telemetry.ts", import.meta.url), "utf8");

  // The production city-picker chunk includes this capture because the picker
  // imports searchCities from actions.ts, which statically imports the telemetry.
  assert.match(picker, /searchCities/);
  assert.match(actions, /trackAnswerError/);
  assert.match(actions, /trackAnswerResult/);
  assert.doesNotMatch(picker, /window\.location\.href|posthog|\/capture\//);
  assert.doesNotMatch(answerTelemetry, /\$current_url:\s*window\.location\.href|redactQuestion|question_redacted|original_question_redacted/);
  assert.doesNotMatch(conversionTelemetry, /\$current_url:\s*`\$\{window\.location\.origin\}/);
  assert.match(answerTelemetry, /sanitizePosthogProperties\(\{[\s\S]*\}, window\.location\.href\)/);
  assert.match(conversionTelemetry, /sanitizePosthogProperties\(\{[\s\S]*\}, window\.location\.href\)/);

  const payloads = captured(() => {
    trackAnswerError({
      question: QUESTION,
      source: "initial",
      error: new Error("1990.5.3"),
      startedAt: Date.now(),
    });
  });
  assert.equal(payloads.length, 1);
  assert.equal(payloads[0].event, "zhaowu_answer_error");
  assert.equal(payloads[0].properties.$current_url, "/");
  assert.equal(JSON.stringify(payloads[0]).includes("1990.5.3"), false);
  assert.equal(payloads[0].properties.error_type, "Error");
});

test("error type and length bucket stay coarse", () => {
  assert.equal(coarseErrorType(new Error("1990.5.3 林婉清 早上八點")), "Error");
  assert.equal(coarseErrorType(new TypeError("88 Harbour Street")), "TypeError");
  assert.equal(coarseErrorType(new Error("PROMO_NOT_FOUND")), "PROMO_NOT_FOUND");
  assert.equal(coarseErrorType("一九九零年三月"), "unknown");
  assert.equal(questionLengthBucket(0), "0");
  assert.equal(questionLengthBucket(40), "1-40");
  assert.equal(questionLengthBucket(41), "41-120");
  assert.equal(questionLengthBucket(120), "41-120");
  assert.equal(questionLengthBucket(121), "121-400");
  assert.equal(questionLengthBucket(400), "121-400");
  assert.equal(questionLengthBucket(401), "401+");
});
