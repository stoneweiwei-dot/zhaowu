import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWesternReading, buildZiweiReading, buildQizhengReading } from '../src/lib/specialist-reading.ts';
import { houseOf } from '../src/lib/western-astrology/engine.ts';
const birth={year:1990,month:6,day:15,hour:10,minute:30,timeUnknown:false,gender:'male',relation:'unset',city:{name:'Sydney',display:'Sydney',country:'AU',timezone:'Australia/Sydney',latitude:-33.87,longitude:151.21}};
test('Western reading localizes all seven classical planets and expands houses, angles and aspects',()=>{
 const reading=buildWesternReading(birth,'zh-Hant');
 const planets=reading.sections.find(s=>s.title==='七曜星座與落宮解讀').table;
 assert.deepEqual(planets.headers,['行星','星座／度分','落宮','運行','解讀']);
 assert.deepEqual(planets.rows.map(r=>r[0]),['太陽','月亮','水星','金星','火星','木星','土星']);
 for(const row of planets.rows){assert.equal(row.length,5);assert.match(row[1],/°/);assert.match(row[2],/^第 \d+ 宮$/);assert.ok(row[4].length>10);}
 const houses=reading.sections.find(s=>s.title==='十二宮完整解讀').table;
 assert.equal(houses.rows.length,12);assert.deepEqual(houses.headers,['宮位','宮頭','傳統主星','宮內行星','生活主題','解讀']);
 const angles=reading.sections.find(s=>s.title==='四軸解讀').table;assert.equal(angles.rows.length,4);
 const aspects=reading.sections.find(s=>s.title==='主要相位').table;assert.ok(aspects.rows.length>0);
 assert.equal(reading.sections.some(s=>s.title==='太陽落宮'),false);
 assert.equal(buildWesternReading(birth,'en').sections.find(s=>s.title==='Seven planets · signs and houses').table.rows[0][0],'Sun');
 const unknown=buildWesternReading({...birth,timeUnknown:true},'zh-Hant');
 assert.equal(unknown.chart,undefined);assert.equal(unknown.sections.some(s=>s.title==='十二宮完整解讀'),false);assert.equal(unknown.sections.some(s=>s.title==='四軸解讀'),false);
});
test('Western snapshot includes all twelve cusps and every computed classical planet once',()=>{const c=buildWesternReading(birth,'en').chart;assert.equal(c.kind,'western');assert.equal(c.houses.cusps.length,12);assert.equal(c.bodies.length,7);for(const b of c.bodies){assert.ok(Number.isFinite(b.longitude));assert.ok(houseOf(b.longitude,c.houses)>=1&&houseOf(b.longitude,c.houses)<=12);}assert.ok(c.angles);});
test('Zi Wei snapshot preserves fourteen major stars and twelve distinct palace branches',()=>{const c=buildZiweiReading(birth,'zh-Hant').chart.data;assert.equal(c.palaces.length,12);assert.equal(new Set(c.palaces.map(p=>p.branch)).size,12);assert.equal(Object.keys(c.majorStars).length,14);});
test('Qizheng retains all eleven points and distinguishes the four virtual points',()=>{const c=buildQizhengReading(birth,'en').chart.data;assert.equal(c.bodies.length,11);assert.equal(c.bodies.filter(b=>b.virtual).length,4);});
test('unknown birth time never produces a fabricated time-dependent chart',()=>{for(const build of [buildWesternReading,buildZiweiReading,buildQizhengReading])assert.equal(build({...birth,timeUnknown:true},'en').chart,undefined);});
