/**
 * Offline source-quality fixtures (not the production chart engine).
 * Owner-supplied 《易經智慧精編講義》第二版, 2026-10-20.
 * Run: node --test docs/theory-audit/lecture-v2-audit.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const stems = [...'甲乙丙丁戊己庚辛壬癸'];
const branches = [...'子丑寅卯辰巳午未申酉戌亥'];
const tiger = { 甲:'丙', 己:'丙', 乙:'戊', 庚:'戊', 丙:'庚', 辛:'庚', 丁:'壬', 壬:'壬', 戊:'甲', 癸:'甲' };
const rat = { 甲:'甲', 己:'甲', 乙:'丙', 庚:'丙', 丙:'戊', 辛:'戊', 丁:'庚', 壬:'庚', 戊:'壬', 癸:'壬' };
const sixty = Array.from({ length:60 }, (_,i) => stems[i%10]+branches[i%12]);

function monthForYear(year, month) {
  const offset = (branches.indexOf(month[1])-2+12)%12;
  return stems[(stems.indexOf(tiger[year[0]])+offset)%10]+month[1];
}
function hourForDay(day, hour) {
  return stems[(stems.indexOf(rat[day[0]])+branches.indexOf(hour[1]))%10]+hour[1];
}
function luckFrom(start, direction, count) {
  const i=sixty.indexOf(start);
  assert.ok(i>=0);
  assert.ok(direction===1 || direction===-1);
  return Array.from({length:count}, (_,n)=>sixty[(i+direction*(n+1)+600)%60]);
}

// Source inputs deliberately have errors. They are NEGATIVE fixtures, never birth records.
const invalid=[
 {id:'CASE-03',page:30,p:['辛亥','癸丑','丁卯','己酉'],m:'辛丑'},
 {id:'COMP-01-A',page:31,p:['庚申','辛酉','癸卯','甲寅'],m:'乙酉'},
 {id:'COMP-01-B',page:31,p:['辛巳','甲辰','癸卯','丁巳'],m:'壬辰'},
 {id:'COMP-02-A',page:31,p:['丙寅','丙午','庚申','戊辰'],m:'甲午',h:'庚辰'},
 {id:'COMP-02-B',page:31,p:['丙寅','丙午','庚子','戊寅'],m:'甲午'},
 {id:'COMP-03-A',page:32,p:['戊辰','庚申','甲子','壬寅'],h:'丙寅'},
 {id:'COMP-04-A',page:32,p:['壬子','癸亥','丁未','戊申'],m:'辛亥'},
 {id:'COMP-04-B',page:32,p:['壬子','癸亥','丁丑','己酉'],m:'辛亥'}
];

test('eight unique negative examples, seven month and two hour mismatches',()=>{
 assert.equal(invalid.length,8);
 assert.equal(new Set(invalid.map(x=>x.id)).size,8);
 assert.equal(invalid.filter(x=>x.m).length,7);
 assert.equal(invalid.filter(x=>x.h).length,2);
});

test('five-tiger and five-rat derivation quarantines source examples',()=>{
 for (const x of invalid) {
  const [year,month,day,hour]=x.p;
  assert.ok(x.p.every(p=>sixty.includes(p)),x.id);
  const m=monthForYear(year,month),h=hourForDay(day,hour);
  if(x.m){assert.notEqual(month,m,x.id); assert.equal(m,x.m,x.id);}
  else assert.equal(month,m,x.id);
  if(x.h){assert.notEqual(hour,h,x.id); assert.equal(h,x.h,x.id);}
  else assert.equal(hour,h,x.id);
 }
});

test('positive controls do not get falsely quarantined',()=>{
 assert.equal(monthForYear('戊辰','辛酉'),'辛酉');
 assert.equal(hourForDay('壬辰','壬寅'),'壬寅');
 assert.equal(monthForYear('庚申','丁亥'),'丁亥');
 assert.equal(hourForDay('癸丑','丙辰'),'丙辰');
});

test('辛年乾造 requires reverse dayun direction; invalid original month cannot determine true luck',()=>{
 assert.deepEqual(luckFrom('庚子',-1,5),['己亥','戊戌','丁酉','丙申','乙未']);
 assert.deepEqual(luckFrom('庚子',1,3),['辛丑','壬寅','癸卯']);
 assert.deepEqual(luckFrom('辛丑',-1,5),['庚子','己亥','戊戌','丁酉','丙申']);
});

test('intake record retains provenance, rights and validation restrictions',()=>{
 const doc=readFileSync(new URL('../STONE-THEORY-LECTURE-V2-INGESTION-20261020.md',import.meta.url),'utf8');
 for(const s of ['OWNER_MATERIAL','MODERN_INTERPRETATION','QUARANTINE','VAL-C','P2','P3','UNKNOWN','不得直接商用']) assert.ok(doc.includes(s),s);
});
