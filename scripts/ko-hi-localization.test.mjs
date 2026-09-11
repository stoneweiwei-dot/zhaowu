import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { translateKoHiVisibleText } from "../src/lib/ko-hi-localization.ts";

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

test("the runtime bridge is mounted globally and remains local-only", () => {
  const main = read("src/main.tsx");
  const bridge = read("src/components/ko-hi-localization-bridge.tsx");
  const localizer = read("src/lib/ko-hi-localization.ts");
  assert.match(main, /KoHiLocalizationBridge/);
  assert.match(bridge, /MutationObserver/);
  assert.match(bridge, /useDisplayLanguage/);
  assert.doesNotMatch(`${bridge}\n${localizer}`, /fetch\(|OPENAI_API_KEY|api\.openai\.com|translate\.google|SUPABASE_SERVICE_ROLE_KEY/);
});

test("customer-cost isolation deploy gate is preserved", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.scripts["test:deploy"], /customer-cost-isolation\.test\.mjs/);
  assert.match(pkg.scripts["test:deploy"], /ko-hi-localization\.test\.mjs/);
});
