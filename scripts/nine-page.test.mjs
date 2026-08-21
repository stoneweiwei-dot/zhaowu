import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret, classifyQuestion } = await import("../src/lib/bazi/interpret.ts");
const { applyAnswerContract, inferQuestionKind } = await import("../src/lib/core/answer-contract.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");
const { composeNinePages, composeNinePageReport } = await import("../src/lib/report/nine-page.ts");

const CITY = FEATURED_CITIES[0];

function makeResult(question, relation = "unset", over = {}) {
  const input = {
    question,
    year: 1988,
    month: 10,
    day: 4,
    hour: 3,
    minute: 30,
    timeUnknown: false,
    gender: "male",
    relation,
    city: CITY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: false,
    ...over,
  };
  const chart = buildChart(input);
  const palm = buildPalm({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    timeUnknown: input.timeUnknown,
    gender: input.gender,
  });
  const reading = applyAnswerContract(
    question,
    chart,
    interpret(question, chart, relation, palm),
  );
  reading.kind = inferQuestionKind(question, classifyQuestion(question));
  return {
    id: "qa-nine-page",
    question,
    chart,
    reading,
    createdAt: "2026-08-20T00:00:00.000Z",
    palm,
  };
}

function page(result, no) {
  return composeNinePages(result).find((p) => p.pageNo === no);
}

test("2027旅行九页必须使用最新流月结果，不再说尚未补算", () => {
  const result = makeResult("我什麼時候適合去度假，去哪裡最好？2027 是不是不適合我出行？");
  const p1 = page(result, 1);
  const p4 = page(result, 4);
  const report = composeNinePageReport(result);

  assert.match(p1.body.join("\n"), /2027/);
  assert.match(p1.body.join("\n"), /較順的窗口/);
  assert.doesNotMatch(p1.body.join("\n"), /你問的是|你问的是|排序依據|排序依据/);
  assert.doesNotMatch(report, /没有完成 2027|沒有完成 2027|还必须补算|還必須補算/);
  assert.doesNotMatch(p4.body.join("\n"), /当前这份结果只带有|當前這份結果只帶有/);
});

test("职业题第4页只围绕职业主课题，不自动塞感情财务次课题", () => {
  const result = makeResult("我現在工作最大的問題是什麼？");
  const p4 = page(result, 4);
  const text = p4.body.join("\n");
  assert.ok(text.includes(result.reading.work));
  assert.ok(!text.includes(result.reading.love));
  assert.ok(!text.includes(result.reading.money));
});

test("感情题第4页只围绕关系主课题，不自动塞工作财务", () => {
  const result = makeResult("我感情裡最容易重複什麼問題？", "same");
  const p4 = page(result, 4);
  const text = p4.body.join("\n");
  assert.ok(text.includes(result.reading.love));
  assert.ok(!text.includes(result.reading.work));
  assert.ok(!text.includes(result.reading.money));
});

test("多主题题第4页保留分栏，不丢掉第二主题", () => {
  const result = makeResult("我工作最大的問題和財務最大的問題分別是什麼？");
  const text = page(result, 4).body.join("\n");
  assert.match(text, /工作重点｜/);
  assert.match(text, /财务重点｜/);
  assert.match(text, /分别处理|分別處理/);
});

test("第6页解释现实使用方式，第8页才放唯一最高优先行动", () => {
  const result = makeResult("我何時適合換工作？");
  const p6 = page(result, 6).body.join("\n");
  const p8 = page(result, 8).body.join("\n");
  assert.ok(!p6.includes(result.reading.action));
  assert.ok(p8.includes(result.reading.action));
  assert.equal(page(result, 8).body.length, 1);
});

test("正式取用未完成时，第7页继续禁止幸运色方位宠物", () => {
  const result = makeResult("我適合什麼顏色和方位？");
  const p7 = page(result, 7);
  const text = p7.body.join("\n");
  assert.equal(result.chart.usefulProvisional, true);
  assert.match(text, /不必刻意追求固定答案/);
  assert.doesNotMatch(text, /正式取用尚未完成|此页暂不硬填|粗候选|喜用神/);
  assert.doesNotMatch(text, /较有利颜色：.+[^—]/);
});

test("未知时辰在九页排盘页明确留白，不伪造时柱与大运", () => {
  const result = makeResult("明年什麼時候適合換工作？", "unset", {
    timeUnknown: true,
    hour: 12,
    minute: 0,
  });
  const p2 = page(result, 2).body.join("\n");
  const p1 = page(result, 1).body.join("\n");
  assert.match(p2, /时柱 未定|時柱 未定|时辰未定|時辰未定/);
  assert.match(p2, /出生时间尚未确定，因此时柱与大运暂不列入本次判断/);
  assert.match(p1, /出生時間未確定/);
});


test("客户九页不得出现内部验收、未接入状态、编号与时间戳", () => {
  const result = makeResult("我什麼時候適合去度假，去哪裡最好？2027 是不是不適合我出行？");
  const report = composeNinePageReport(result);
  assert.doesNotMatch(
    report,
    /全站回答契約|全站回答契约|資料未接入|资料未接入|正式取用尚未完成|粗候選|粗候选|待覆核|待覆核|不是完整子平|不是喜用神|方法透明|報告編號|报告编号|qa-nine-page|2026-08-20T00:00:00|ZW-NINE|隱藏算法|隐藏算法|為什麼這樣排|为什么这样排|不伪造午时/,
  );
});

test("客户九页不重复问题与直接答案", () => {
  const result = makeResult("我何時適合換工作？");
  const pages = composeNinePages(result);
  const allBodies = pages.flatMap((p) => p.body);
  assert.equal(allBodies.filter((line) => line === result.reading.directAnswer).length, 0);
  assert.equal(pages[0].title, "核心结论");
  assert.doesNotMatch(pages[0].body.join("\n"), /^你[問问]的是/);
});
