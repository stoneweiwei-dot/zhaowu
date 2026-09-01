import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildChart } from '../src/lib/bazi/chart.ts';
import { NAYIN, solarTermUtc, hourPillar } from '../src/lib/bazi/calendar.ts';
import { chartTerm, characterFacts, UNKNOWN_TIME_COPY } from '../src/lib/bazi/presentation.ts';
import { BaziChartContent } from '../src/components/bazi-chart.tsx';
import { useI18n } from '../src/lib/i18n.ts';
const city={name:'Beijing',display:'Beijing',country:'China',latitude:39.9,longitude:116.4,timezone:'Asia/Shanghai'};
const input={question:'test',year:1988,month:10,day:4,hour:4,minute:40,timeUnknown:false,gender:'male',relation:'unset',city,useTrueSolar:true,ziPolicy:'midnight'};

test('1988-10-04 golden Four Pillars; English values and all 30 Na Yin images translate',()=>{
  const chart=buildChart(input);
  assert.deepEqual(chart.pillars.map(p=>p.ganZhi),['戊辰','辛酉','壬辰','壬寅']);
  for(const title of new Set(NAYIN)) { assert.doesNotMatch(chartTerm(title,'en'),/[\u3400-\u9fff]/);assert.notEqual(chartTerm(title,'en'),'Not available'); }
  assert.equal(chartTerm('壬','en'),'Ren · Yang Water');
  assert.equal(chartTerm('長流水','en'),'Ever-flowing Water');
  assert.doesNotMatch(JSON.stringify(characterFacts(chart,'en')),/[\u3400-\u9fff]/);
});
test('all five rat-start stems and the midnight rule remain intact',()=>{
  for(const [day,expected] of [['甲','甲'],['乙','丙'],['丙','戊'],['丁','庚'],['戊','壬'],['己','甲'],['庚','丙'],['辛','戊'],['壬','庚'],['癸','壬']]) {
    assert.equal(hourPillar(day+'子',0),expected+'子');assert.equal(hourPillar(day+'子',23),expected+'子');
  }
});
test('unknown time leaves hour, life palace and cycles blank; English chart has no untranslated labels',()=>{
  const chart=buildChart({...input,timeUnknown:true});
  const html=renderToStaticMarkup(createElement(BaziChartContent,{chart,locale:'en'}));
  assert.doesNotMatch(html,/[\u3400-\u9fff]/);
  assert.match(html,/Birth time not known/);
  assert.equal(chart.pillars[3].ready,false);assert.equal(chart.minggong,'未定');assert.deepEqual(chart.dayun,[]);
  assert.match(UNKNOWN_TIME_COPY.en,/less certain and more prone to error/);
});
test('solar-time correction cannot change the physical instant used for solar-term year and month boundaries',()=>{
  const term=solarTermUtc(2024,315);
  const local=new Date(term.getTime()+8*3600000+10*60000);
  const data={...input,year:local.getUTCFullYear(),month:local.getUTCMonth()+1,day:local.getUTCDate(),hour:local.getUTCHours(),minute:local.getUTCMinutes(),city:{...city,longitude:75}};
  const corrected=buildChart(data),civil=buildChart({...data,useTrueSolar:false});
  assert.deepEqual(corrected.pillars.slice(0,2).map(p=>p.ganZhi),civil.pillars.slice(0,2).map(p=>p.ganZhi));
  assert.equal(corrected.pillars[0].ganZhi,'甲辰');assert.equal(corrected.pillars[1].ganZhi,'丙寅');
});

test('birthplace DST conversion is independent of the device timezone',async()=>{
  const {execFileSync}=await import('node:child_process');
  const fixture={...input,year:2025,month:4,day:6,hour:1,minute:30,city:{name:'Sydney',display:'Sydney',country:'Australia',latitude:-33.86,longitude:151.21,timezone:'Australia/Sydney'}};
  const code=`import {buildChart} from './src/lib/bazi/chart.ts';const c=buildChart(${JSON.stringify(fixture)});console.log(JSON.stringify({p:c.pillars,t:c.trueSolarStamp,d:c.dayun}));`;
  const run=zone=>execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',code],{cwd:new URL('../',import.meta.url),env:{...process.env,TZ:zone},encoding:'utf8'});
  assert.equal(run('UTC'),run('America/Los_Angeles'));
});
