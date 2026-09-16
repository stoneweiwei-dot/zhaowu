import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { translateKoHiVisibleText } from "../src/lib/ko-hi-localization.ts";
import { translateKoHiCurrentReportText } from "../src/lib/ko-hi-current-report-localization.ts";

const read = (path) => readFileSync(path, "utf8");

test("Korean localizes the production strings that previously leaked English", () => {
  const cases = [
    ["TODAY · FOUR PILLARS", "오늘 · 사주팔자"],
    ["Today's rhythm", "오늘의 흐름"],
    ["Daily dress | Five-element colour", "오늘의 오행 컬러"],
    ["ZHAOWU · CONSULTATION", "소오 · 상담"],
    ["Client details", "출생 정보"],
    ["Seven personal readings", "일곱 가지 개인 분석"],
    ["Begin analysis", "분석 시작"],
    ["Open Jade Dragon guide", "청옥룡 안내 열기"],
    ["ZHAOWU · ACCOUNT", "ZHAOWU · 계정"],
    ["Four Pillars of Destiny", "사주팔자"],
    ["View full report", "전체 보고서 보기"],
  ];
  for (const [source, expected] of cases) assert.equal(translateKoHiVisibleText(source, "ko"), expected);
});

test("Hindi localizes the production strings that previously leaked English", () => {
  const cases = [
    ["TODAY · FOUR PILLARS", "आज · चार स्तंभ"],
    ["Today's rhythm", "आज की लय"],
    ["Daily dress | Five-element colour", "आज के पाँच-तत्व रंग"],
    ["ZHAOWU · CONSULTATION", "झाओवू · परामर्श"],
    ["Client details", "जन्म-जानकारी"],
    ["Seven personal readings", "सात व्यक्तिगत विश्लेषण"],
    ["Begin analysis", "विश्लेषण शुरू करें"],
    ["Open Jade Dragon guide", "जेड ड्रैगन मार्गदर्शक खोलें"],
    ["ZHAOWU · ACCOUNT", "ZHAOWU · खाता"],
    ["Four Pillars of Destiny", "चार स्तंभ कुंडली"],
    ["View full report", "पूरी रिपोर्ट देखें"],
  ];
  for (const [source, expected] of cases) assert.equal(translateKoHiVisibleText(source, "hi"), expected);
});

test("current guest-first and full-analysis wording is localized for Korean and Hindi", () => {
  const cases = [
    ["STEP 1 · BIRTH RECORD", "1단계 · 출생 정보", "चरण 1 · जन्म-जानकारी"],
    ["What do you actually want answered?", "지금 실제로 답을 받고 싶은 질문은 무엇인가요?", "आप वास्तव में किस प्रश्न का उत्तर चाहते हैं?"],
    ["Analyse this question", "이 질문 분석하기", "इस प्रश्न का विश्लेषण करें"],
    ["Best next step", "가장 먼저 할 일", "सबसे उपयोगी अगला कदम"],
    ["View full analysis", "전체 분석 보기", "पूरा विश्लेषण देखें"],
    ["Your full analysis", "전체 분석", "आपका पूरा विश्लेषण"],
    ["The answer first", "먼저 답부터", "पहले उत्तर"],
    ["What to do now", "지금 할 일", "अभी क्या करें"],
    ["Full explanation", "전체 설명", "पूरा विवरण"],
  ];
  for (const [source, ko, hi] of cases) {
    assert.equal(translateKoHiCurrentReportText(source, "ko"), ko);
    assert.equal(translateKoHiCurrentReportText(source, "hi"), hi);
  }
});

test("the runtime bridge is mounted globally, includes the current report layer, and remains local-only", () => {
  const main = read("src/main.tsx");
  const bridge = read("src/components/ko-hi-localization-bridge.tsx");
  const localizer = read("src/lib/ko-hi-localization.ts");
  const currentReport = read("src/lib/ko-hi-current-report-localization.ts");
  assert.match(main, /KoHiLocalizationBridge/);
  assert.match(bridge, /MutationObserver/);
  assert.match(bridge, /useDisplayLanguage/);
  assert.match(bridge, /translateKoHiCurrentReportText/);
  assert.doesNotMatch(`${bridge}\n${localizer}\n${currentReport}`, /fetch\(|OPENAI_API_KEY|api\.openai\.com|translate\.google|SUPABASE_SERVICE_ROLE_KEY/);
});

test("customer-cost isolation deploy gate is preserved", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.scripts["test:deploy"], /customer-cost-isolation\.test\.mjs/);
  assert.match(pkg.scripts["test:deploy"], /ko-hi-localization\.test\.mjs/);
});
