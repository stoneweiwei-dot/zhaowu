import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeLife, followUpLife, writeFullReport } from '../src/lib/actions.ts';
import { buildDecisionReportModel } from '../src/lib/report/decision-report-model.ts';
import { composeFocusedReport } from '../src/lib/report/focused-report.ts';
import { buildCustomerAnswer, uniqueCustomerLines } from '../src/lib/report/customer-answer.ts';
import { detectQuestionFocus, directAnswerCoversQuestion } from '../src/lib/qa/answer-quality.ts';
const input = {year:1988,month:10,day:4,hour:4,minute:40,timeUnknown:false,gender:'male',relation:'same',city:{name:'三明',country:'中國',display:'福建三明',latitude:26.263,longitude:117.638,timezone:'Asia/Shanghai'},ziPolicy:'midnight',useTrueSolar:true,locale:'zh-Hant'};
const run = (question, overrides={}) => analyzeLife({data:{...input,question,...overrides}});
const jargon = /正印|七殺|承載底盤|核心不是|視覺層|主判|做功/;

test('actual talent answer contains concrete, conditional skills with traceable combined evidence', async () => {
  const r=await run('我的天賦是什麼？');
  assert.equal(detectQuestionFocus(r.question),'talent');
  assert.equal(directAnswerCoversQuestion(r.question,'目前主格為正印格，承載偏旺。'),false);
  const a=r.reading.customerAnswer;
  assert.match(a.direct,/學懂複雜方法/);
  assert.match(a.direct,/推論/);
  assert.ok(a.evidence.length>2);
  assert.doesNotMatch([a.direct,...a.reasons,...a.actions].join(''),jargon);
  const unknown=await run(r.question,{timeUnknown:true});
  assert.match(unknown.reading.directAnswer,/不能/);
  assert.equal(unknown.reading.customerAnswer.evidence,undefined);
});

test('birth data completeness never becomes higher confidence', async()=>{
  for(const timeUnknown of [false,true]) {
    const model=buildDecisionReportModel(await run('我的天賦是什麼？',{timeUnknown}));
    assert.equal(model.confidence,'limited');
    assert.doesNotMatch(model.confidenceLabel,/較高|Higher/);
  }
});

test('career fit, relationship cause, and timing give distinct relevant answers',async()=>{
  const job=await run('我適合什麼工作？');
  assert.match(job.reading.directAnswer,/工作內容/);
  assert.doesNotMatch(job.reading.directAnswer,/感情|聯繫|現金流/);
  const love=await run('感情為什麼反覆出問題？');
  assert.match(love.reading.directAnswer,/原因/);
  assert.doesNotMatch(love.reading.directAnswer,/工作|七殺/);
  const time=await run('2027年3月和5月，什麼時候適合換工作？');
  const a=time.reading.customerAnswer;
  assert.match(a.direct,/2027/);
  assert.match(a.direct,/5月/);
  assert.match(a.timing.join(''),/3月/);
  assert.doesNotMatch(a.direct,/指定.*工作/);
});

test('follow-up retains subject, replaces year, and does not recalculate natal chart',async()=>{
  const base=await run('2027年3月和5月，什麼時候適合換工作？');
  const follow=await followUpLife({data:{base,question:'那2028年呢？'}});
  assert.strictEqual(follow.chart,base.chart);
  assert.equal(follow.question,'那2028年呢？');
  assert.match(follow.reading.directAnswer,/2028/);
  assert.doesNotMatch(follow.reading.directAnswer,/2027/);
  const full=await writeFullReport({data:follow});
  assert.ok(full.text.replace(/\s/g, "").includes(follow.reading.directAnswer.replace(/\s/g, "")));
});

test('saved report and screen consume the same answer and contain no repeated sentences',async()=>{
  const r=await run('我的天賦是什麼？');
  const answer=r.reading.customerAnswer;
  const model=buildDecisionReportModel(r);
  assert.equal(model.directAnswer,answer.direct);
  const summary=composeFocusedReport(r)[0].body;
  assert.equal(summary.length,uniqueCustomerLines(summary).length);
  const full=await writeFullReport({data:r});
  assert.ok(full.text.includes(answer.direct.split('。')[0]));
  assert.doesNotMatch(full.text,jargon);
});

test('English timing keeps the requested year and month names without Chinese fragments',async()=>{
  const r=await run('When should I change jobs in March or May 2027?',{locale:'en'});
  const a=r.reading.customerAnswer;
  const text=[a.direct,...a.timing,...a.reasons,...a.actions,...a.limits].join(' ');
  assert.match(text,/2027/);assert.match(text,/March/);assert.match(text,/May/);
  assert.doesNotMatch(text,/[\u3400-\u9fff]/);
});

test('historical answers lose internal instructions without manufacturing replacement advice',async()=>{
  const r=await run('我的天賦是什麼？');
  const a=buildCustomerAnswer('這是什麼？',r.chart,{...r.reading,kind:'self',directAnswer:'核心不是羅列更多術語。視覺層不自行加斷語。',rhythm:'七殺成勢。',action:''},'zh-Hant');
  assert.match(a.direct,/資料不足|沒有足夠資料/);
  assert.deepEqual(a.reasons,[]);
  assert.doesNotMatch(a.direct,/先從|眼前/);
});

test('a month-only follow-up keeps the year and repeated follow-ups keep the subject',async()=>{
  const base=await run('2027年3月和5月，什麼時候適合換工作？');
  const first=await followUpLife({data:{base,question:'那6月呢？'}});
  assert.match(first.reading.directAnswer,/2027/);
  assert.match(first.reading.directAnswer,/6月/);
  const second=await followUpLife({data:{base:first,question:'那2028年呢？'}});
  assert.match(second.reading.directAnswer,/2028/);
  assert.match(second.reading.customerAnswer.contextQuestion,/換工作/);
});

test('a work-problem question does not demand two job offers',async()=>{
  const r=await run('我工作最大的問題是什麼？');
  assert.doesNotMatch(r.reading.action,/兩個選擇|两个选择|三次/);
  assert.match(r.reading.action,/工作/);
});

test('a stay-or-leave career choice keeps a concrete next step even when the contract classifies it as a choice', async()=>{
  const r=await run('這份工作我應該繼續還是離開？');
  assert.ok(r.reading.customerAnswer.actions.length > 0);
  assert.match(r.reading.customerAnswer.direct,/留職|離開|工作/);
  assert.match(r.reading.customerAnswer.actions.join(''),/薪|工時|選擇/);
});
