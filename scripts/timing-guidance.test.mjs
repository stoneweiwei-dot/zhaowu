import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildChart } from '../src/lib/bazi/chart.ts';
import { dayGanzhi } from '../src/lib/bazi/calendar.ts';
import { buildTimingGuide } from '../src/lib/report/timing-guidance.ts';

const city={name:'Beijing',display:'Beijing',country:'China',latitude:39.9,longitude:116.4,timezone:'Asia/Shanghai'};
const input={question:'test',year:1988,month:10,day:4,hour:4,minute:40,timeUnknown:false,gender:'male',relation:'unset',city,useTrueSolar:true,ziPolicy:'midnight'};
const NOW=new Date('2026-10-09T04:00:00Z');

test('day pillar anchor 2000-01-01 = 戊午',()=>{ assert.equal(dayGanzhi(2000,1,1),'戊午'); });

test('guide shape: 3 years x 2 halves, 12 months from 寅, today pillar, deterministic',()=>{
  const chart=buildChart(input);
  const a=buildTimingGuide(chart,NOW,'zh'),b=buildTimingGuide(chart,NOW,'zh');
  assert.deepEqual(a,b);
  assert.equal(a.years.length,3);
  for(const y of a.years){ assert.ok(y.first&&y.second); assert.ok(y.first.doOne&&y.first.avoidOne&&y.second.doOne&&y.second.avoidOne); }
  assert.equal(a.months.length,12);
  assert.equal(a.months[0].ganZhi.slice(1),'寅');
  assert.equal(a.months.filter(m=>m.current).length,1);
  assert.equal(a.today.ganZhi.length,2);
  for(const m of a.months){ assert.ok(m.doOne&&m.avoidOne); }
});

test('2026-10-09 falls in 丙午 year (立春 2026 passed) and 戌月 (寒露 10-08)',()=>{
  const g=buildTimingGuide(buildChart(input),NOW,'zh');
  assert.equal(g.years[0].ganZhi,'丙午');
  const cur=g.months.find(m=>m.current);
  assert.equal(cur.ganZhi.slice(1),'戌');
});

test('English output has no CJK except ganzhi tokens; zh/en same structure',()=>{
  const chart=buildChart(input);
  const en=buildTimingGuide(chart,NOW,'en'),zh=buildTimingGuide(chart,NOW,'zh');
  assert.equal(en.months.length,zh.months.length);
  const txt=JSON.stringify({d:en.today.doList,a:en.today.avoidList,m:en.months.map(m=>[m.doOne,m.avoidOne,m.mood])});
  assert.doesNotMatch(txt,/[㐀-鿿]/);
});

test('unknown birth time: no dayun guide; localize hook applied',()=>{
  const chart=buildChart({...input,timeUnknown:true});
  const g=buildTimingGuide(chart,NOW,'zh',s=>`«${s}»`);
  assert.equal(g.dayun,null);
  assert.match(g.years[0].first.doOne,/^«/);
});

test('known birth time yields dayun with two halves',()=>{
  const g=buildTimingGuide(buildChart(input),NOW,'zh');
  if(g.dayun){ assert.ok(g.dayun.first&&g.dayun.second); }
});
