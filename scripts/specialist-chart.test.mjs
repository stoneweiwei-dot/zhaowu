import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWesternReading, buildZiweiReading, buildQizhengReading } from '../src/lib/specialist-reading.ts';
import { houseOf } from '../src/lib/western-astrology/engine.ts';
const birth={year:1990,month:6,day:15,hour:10,minute:30,timeUnknown:false,gender:'male',relation:'unset',city:{name:'Sydney',display:'Sydney',country:'AU',timezone:'Australia/Sydney',latitude:-33.87,longitude:151.21}};
test('Western summary localizes planet names and separates positions into columns',()=>{
 const reading=buildWesternReading(birth,'zh-Hant');
 const table=reading.sections.find(s=>s.table).table;
 assert.deepEqual(table.headers,['行星','星座','度數','落宮']);
 assert.deepEqual(table.rows.map(r=>r[0]),['水星','金星','火星','木星','土星']);
 for(const row of table.rows){assert.equal(row.length,4);assert.match(row[2],/°/);assert.ok(Number(row[3])>=1&&Number(row[3])<=12);}
 assert.equal(buildWesternReading(birth,'en').sections.find(s=>s.table).table.rows[0][0],'Mercury');
 const unknown=buildWesternReading({...birth,timeUnknown:true},'zh-Hant').sections.find(s=>s.table).table;
 for(const row of unknown.rows){assert.equal(row[2],'—');assert.equal(row[3],'—');}
});
test('Western snapshot includes all twelve cusps and every computed classical planet once',()=>{const c=buildWesternReading(birth,'en').chart;assert.equal(c.kind,'western');assert.equal(c.houses.cusps.length,12);assert.equal(c.bodies.length,7);for(const b of c.bodies){assert.ok(Number.isFinite(b.longitude));assert.ok(houseOf(b.longitude,c.houses)>=1&&houseOf(b.longitude,c.houses)<=12);}assert.ok(c.angles);});
test('Zi Wei snapshot preserves fourteen major stars and twelve distinct palace branches',()=>{const c=buildZiweiReading(birth,'zh-Hant').chart.data;assert.equal(c.palaces.length,12);assert.equal(new Set(c.palaces.map(p=>p.branch)).size,12);assert.equal(Object.keys(c.majorStars).length,14);});
test('Qizheng retains all eleven points and distinguishes the four virtual points',()=>{const c=buildQizhengReading(birth,'en').chart.data;assert.equal(c.bodies.length,11);assert.equal(c.bodies.filter(b=>b.virtual).length,4);});
test('unknown birth time never produces a fabricated time-dependent chart',()=>{for(const build of [buildWesternReading,buildZiweiReading,buildQizhengReading])assert.equal(build({...birth,timeUnknown:true},'en').chart,undefined);});
