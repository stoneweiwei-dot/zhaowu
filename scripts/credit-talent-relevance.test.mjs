import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { finalizeReading } = await import("../src/lib/report/final-reading.ts");
const contract = await import("../src/lib/report/credit-and-talent-contract.ts");

const CITY = {
  name: "Sanming",
  country: "China",
  display: "三明市，福建省，中国",
  latitude: 26.2639,
  longitude: 117.6387,
  timezone: "Asia/Shanghai",
};

function chartFor(question, birth = { year: 1988, month: 10, day: 4, hour: 4, minute: 40 }) {
  return buildChart({
    question,
    ...birth,
    timeUnknown: false,
    gender: "male",
    relation: "same",
    city: CITY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: true,
  });
}

function reading(question, birth) {
  const chart = chartFor(question, birth);
  return finalizeReading(question, chart, interpret(question, chart, "same", null));
}

// ── 1. 各段不可黏在一起 ──────────────────────────────────────────

test("結構化答案各段以空格分開，且評級名稱貼合題意", () => {
  const credit = reading("我的信用分高嗎").directAnswer;
  assert.match(credit, /。 財務節奏：\S+ \S/, "段與段之間要有分隔");
  assert.match(credit, / 三個主要原因：1\. .+ 2\. .+ 3\. /);
  assert.match(credit, / 現在應該做什麼：/);
  assert.doesNotMatch(credit, /可成指數/, "信用題不能用「可成指數：可以做」");

  const talent = reading("我的天賦是什麼").directAnswer;
  assert.match(talent, /。 盤面依據：/);
  assert.doesNotMatch(talent, /可以做三個/);
});

test("下游把空白壓成單一空格後仍保有段落分隔", () => {
  const flattened = reading("我的天賦是什麼").directAnswer.replace(/\s+/g, " ").trim();
  assert.match(flattened, /。 盤面依據：.+ 三個主要原因：/);
});

// ── 2. 信用：換個問法也要答到 ────────────────────────────────────

test("信用題的各種問法都走信用答案，而不是通用格局模板", () => {
  for (const q of ["我的信用分高嗎", "我的信用好不好", "我的信用狀況怎麼樣", "我會不會被拒貸", "我的貸款能不能批", "我的征信會有問題嗎"]) {
    const r = reading(q);
    assert.equal(r.kind, "money", q);
    assert.match(r.directAnswer, /財務節奏|徵信|銀行/, q);
    assert.doesNotMatch(r.directAnswer, /这张盘目前以|这张盘/, `${q} 不應落到通用格局模板`);
  }
});

test("貸款題明說由銀行決定，信用分題明說命盤不能推算", () => {
  assert.match(reading("我會不會被拒貸").directAnswer, /能否獲批貸款由銀行依徵信紀錄、收入與負債比決定/);
  assert.match(reading("我的信用分高嗎").directAnswer, /命盤不能推算銀行信用分/);
});

// ── 3. 問的是別人：不能用本人命盤冒充 ─────────────────────────────

test("問孩子／伴侶／朋友時，明說這張盤讀不出對方，並指出怎麼問", () => {
  for (const [q, who] of [
    ["我的孩子有什麼天賦", "孩子"],
    ["我老公適合做什麼工作", "老公"],
    ["我朋友的信用好不好", "朋友"],
  ]) {
    const r = reading(q);
    assert.match(r.directAnswer, new RegExp(`這張盤是你本人的盤，讀不出${who}`), q);
    assert.match(r.directAnswer, /另排一盤/, q);
    assert.doesNotMatch(r.directAnswer, /較有盤面依據的天賦|較適合優先看的工作類型/, `${q} 不可用本人命盤作答`);
  }
});

test("問自己的題不會被第三方規則誤傷", () => {
  assert.equal(contract.detectThirdParty("我的天賦是什麼"), null);
  assert.equal(contract.detectThirdParty("我適合做什麼工作，我老公會支持嗎"), null);
  assert.equal(contract.detectThirdParty("我適合當孩子的老師嗎"), null);
  assert.equal(contract.detectThirdParty("其他的工作我適合做什麼"), null);
  assert.match(reading("我的天賦是什麼").directAnswer, /較有盤面依據的天賦/);
});

// ── 4. 複合題：每一問都有答案 ─────────────────────────────────────

test("「天賦＋適合做什麼工作」兩問都有對應答案", () => {
  const r = reading("我的天賦是什麼，適合做什麼工作");
  assert.match(r.directAnswer, /【天賦】.*較有盤面依據的天賦/);
  assert.match(r.directAnswer, /【適合的工作】.*較適合優先看的工作類型/);
  assert.match(r.action, /天賦：.+；適合的工作：.+/);
  assert.doesNotMatch(r.action, /。；/, "合併 action 不可出現「。；」");
});

// ── 5. 專項：先回應專項 ──────────────────────────────────────────

test("天賦題帶專項時，明確回應該專項", () => {
  const music = reading("我有沒有音樂才華").directAnswer;
  assert.match(music, /你問的是「音樂」/);
  assert.match(music, /不能單獨證明「音樂」這個專項/);

  const startup = reading("我的天賦適合創業嗎").directAnswer;
  assert.match(startup, /你問的是「創業」/);
  assert.match(startup, /若走創業，較貼合這個能力的起步方向是：/);
});

test("具體職業題：落在方向內才說貼合，對不上不判不適合", () => {
  const teacher = reading("我適合當老師嗎").directAnswer; // 此盤月令為正印：研究／教育
  assert.match(teacher, /你問的是「老師」：它落在命盤較貼合的職業方向內/);
  assert.match(teacher, /盤面依據：⭐ 貼合/);

  const police = reading("我適合當警察嗎").directAnswer;
  assert.match(police, /你問的是「警察」/);
  assert.match(police, /不能直接說適合/);
  assert.doesNotMatch(police.split(" 盤面依據")[0], /不適合/, "結論句對不上只說明驗證方式，不下「不適合」");
  assert.match(reading("我适合做研究吗").directAnswer, /你問的是「研究」：它落在命盤較貼合/);
});

test("職業題要列出可對號入座的具體職業，不只是抽象描述", () => {
  const r = reading("適合做什麼工作");
  assert.equal(r.kind, "career");
  assert.match(r.directAnswer, /較適合優先看的工作類型是：研究、教育與培訓、顧問諮詢/);
});

// ── 6. 專項／對象抽取：只在抽得乾淨時才抽 ─────────────────────────

test("extractTalentFocus / extractJobFocus 抽不乾淨就回 null", () => {
  assert.equal(contract.extractTalentFocus("我有沒有音樂才華"), "音樂");
  assert.equal(contract.extractTalentFocus("我的繪畫天賦怎麼樣"), "繪畫");
  assert.equal(contract.extractTalentFocus("我的天賦適合創業嗎"), "創業");
  for (const q of ["我的天賦是什麼", "我到底有什麼天賦", "我的先天天賦", "我的天賦是什麼，適合做什麼工作"]) {
    assert.equal(contract.extractTalentFocus(q), null, q);
  }
  assert.equal(contract.extractJobFocus("我適合當老師嗎"), "老師");
  assert.equal(contract.extractJobFocus("我適合當孩子的老師嗎"), "老師");
  for (const q of ["適合做什麼工作", "我適合做業務還是做設計", "我適合做這份工作嗎", "我適合創業嗎"]) {
    assert.equal(contract.extractJobFocus(q), null, q);
  }
});

// ── 7. 不誤傷無關問題 ────────────────────────────────────────────

test("與信用／天賦／職業無關的問題不進入此入口", () => {
  const chart = chartFor("x");
  for (const q of ["我今年財運如何", "怎樣才能賺錢", "我和他合作順不順", "我適合做業務還是做設計", "我適合創業嗎", "今年感情如何"]) {
    assert.equal(contract.buildContractAnswer(q, chart), null, q);
  }
  // 選擇題與「適合創業嗎」仍由原有流程回答
  assert.equal(reading("我適合做業務還是做設計").kind, "choice");
});

// ── 8. 資料不足時誠實留白 ────────────────────────────────────────

test("缺月柱／旺衰資料時不硬編，並說明要補什麼", () => {
  const bare = { pillars: [], strength: { tendency: "" } };
  const talent = contract.buildContractAnswer("我的天賦是什麼", bare);
  assert.match(talent.directAnswer, /目前結構證據不足以可靠列出具體天賦/);
  assert.match(talent.directAnswer, /盤面依據：😐 不足，先不下判斷/);
  assert.match(contract.buildContractAnswer("我適合做什麼工作", bare).directAnswer, /不硬套職業/);
  assert.match(contract.buildContractAnswer("我的信用分高嗎", bare).directAnswer, /現有資料也不足以判斷財務節奏/);
  assert.match(contract.buildContractAnswer("我適合當老師嗎", bare).directAnswer, /無法可靠判斷你適不適合「老師」/);
});

// ── 9. 多組生辰：不拋錯、格式一致 ─────────────────────────────────

test("不同命盤下三類題都能產出完整結構", () => {
  const births = [
    { year: 1988, month: 10, day: 4, hour: 4, minute: 40 },
    { year: 1995, month: 3, day: 15, hour: 9, minute: 10 },
    { year: 1979, month: 7, day: 22, hour: 21, minute: 0 },
    { year: 2001, month: 12, day: 1, hour: 14, minute: 30 },
    { year: 1966, month: 1, day: 30, hour: 6, minute: 5 },
  ];
  for (const birth of births) {
    for (const q of ["我的信用分高嗎", "我的天賦是什麼", "適合做什麼工作", "我的天賦是什麼，適合做什麼工作"]) {
      const r = reading(q, birth);
      assert.match(r.directAnswer, /直接結論：/, `${JSON.stringify(birth)} ${q}`);
      assert.match(r.directAnswer, /現在應該做什麼：/, `${JSON.stringify(birth)} ${q}`);
      assert.ok(r.action.length > 4, `${JSON.stringify(birth)} ${q} action`);
    }
    const level = reading("我的信用分高嗎", birth).directAnswer.match(/偏向「(偏高|中等|偏低)」/);
    assert.ok(level, `${JSON.stringify(birth)} 信用應給出明確等級`);
  }
});
