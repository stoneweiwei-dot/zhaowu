import assert from "node:assert/strict";
import test from "node:test";
import {formatSacredDay,SACRED_DAY_CASES,SACRED_DAY_SOURCE_COUNT,SACRED_DAY_MOVABLE_COUNT} from "../src/lib/almanac/sacred-days.ts";
const fmt=(m,d,loc="zh-Hant",date,opts={})=>formatSacredDay(m,d,loc,date,opts);
test("every fixed lunar/solar entry is reachable in all three locales",()=>{
 assert.equal(SACRED_DAY_CASES.length,SACRED_DAY_SOURCE_COUNT);
 assert.ok(SACRED_DAY_SOURCE_COUNT>=70);
 const seen=new Set();
 for(const row of SACRED_DAY_CASES){
   const key=[row.calendar,row.month,row.day,row.tradition,row.hant].join("|");
   assert.ok(!seen.has(key),"duplicate "+key); seen.add(key);
   for(const locale of ["zh-Hant","zh-Hans","en"]){
     const options={year:2026,isLunarMonthEnd:true};
     const result=fmt(row.month,row.day,locale,row.calendar==="solar"?`${row.month}-${row.day}`:undefined,options);
     const needle=locale==="en"?row.en:row.hant;
     if(locale!=="zh-Hans") assert.ok(result.includes(needle),"missing "+locale+" "+key);
     else assert.ok(result.includes("["),"missing label "+key);
     assert.ok(!result.includes("undefined"),"bad localization "+key);
   }
 }
});
test("overlapping celebrations preserve all faith labels",()=>{
 let s=fmt(7,15);
 for(const name of ["盂蘭盆節","中元地官聖誕","中元普度"])assert.ok(s.includes(name));
 assert.ok(fmt(5,13).includes("伽藍菩薩"));
 assert.ok(fmt(5,13).includes("城隍爺"));
});
test("lunar leap month never repeats ordinary-month birthdays",()=>{
 assert.match(fmt(3,23),/媽祖/);
 assert.doesNotMatch(fmt(3,23,"zh-Hant",undefined,{isLeapMonth:true}),/媽祖/);
 assert.match(fmt(3,23,"zh-Hant","12-25",{isLeapMonth:true}),/耶穌/);
});
test("end-of-lunar-month birthdays only fall on the real last day",()=>{
 assert.doesNotMatch(fmt(7,29),/地藏/);
 assert.match(fmt(7,29,"zh-Hant",undefined,{isLunarMonthEnd:true}),/地藏/);
 assert.match(fmt(7,30,"zh-Hant",undefined,{isLunarMonthEnd:true}),/地藏/);
 assert.doesNotMatch(fmt(9,29),/藥師/);
 assert.match(fmt(9,29,"zh-Hant",undefined,{isLunarMonthEnd:true}),/藥師/);
 assert.match(fmt(9,30,"zh-Hant",undefined,{isLunarMonthEnd:true}),/藥師/);
});
test("no mixed traditional script in known simplified names",()=>{
 for(const char of ["爺","農","統","節"]) {
   const relevant=SACRED_DAY_CASES.filter(x=>x.hant.includes(char));
   for(const row of relevant){
     const s=fmt(row.month,row.day,"zh-Hans",row.calendar==="solar"?`${row.month}-${row.day}`:undefined,{isLunarMonthEnd:true});
     assert.ok(!s.includes(char),"untranslated "+char+" "+row.hant);
   }
 }
});
test("Western and Orthodox Easter date algorithms match published 2026/2027 calendars",()=>{
 assert.ok(fmt(1,2,"zh-Hant","4-5",{year:2026}).includes("復活節"));
 assert.ok(fmt(1,2,"zh-Hant","4-12",{year:2026}).includes("聖帕斯哈"));
 assert.ok(fmt(1,2,"zh-Hant","3-28",{year:2027}).includes("復活節"));
 assert.ok(fmt(1,2,"zh-Hant","5-2",{year:2027}).includes("聖帕斯哈"));
 assert.ok(fmt(1,2,"zh-Hant","4-3",{year:2026}).includes("耶穌受難日"));
 assert.ok(fmt(1,2,"zh-Hant","5-24",{year:2026}).includes("聖神降臨節"));
 assert.ok(SACRED_DAY_MOVABLE_COUNT>=13);
});
test("fixed solar observances are not misread as lunar and short dates fallback",()=>{
 assert.ok(fmt(1,1,"zh-Hant","12-25",{year:2026}).includes("聖誕節"));
 assert.ok(fmt(1,1,"zh-Hant","9-28",{year:2026}).includes("孔子誕辰"));
 assert.doesNotMatch(fmt(1,1,"zh-Hant","9-27",{year:2026}),/孔子誕辰紀念暨祭孔/);
 assert.match(fmt(5,2,"zh-Hans"),/未列主要圣日/);
 assert.match(fmt(5,8,"zh-Hant"),/傳統六齋日/);
});
