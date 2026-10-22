import test from "node:test";
import assert from "node:assert/strict";
import {
  buildWesternReportChapters, buildWesternReportPrompt,
  validateWesternReportFacts,
} from "../src/lib/astrology/report-protocol.ts";
import { TEN_PLANETS, analyzeWesternChart } from "../src/lib/astrology/deep-engine.ts";

const placements=TEN_PLANETS.map((key,i)=>({
  key,longitude:(i*31+5)%360,retrograde:false,
  house:[1,8,9,12,2,6,10,3,4,5][i],signReliable:true,
}));
const analysis=analyzeWesternChart({
  placements,houseSystem:"whole",timeReliability:"high",provenance:"confirmed-minute",
});
const facts={
  zodiac:"tropical",houseSystem:"whole",source:"astronomy-engine@2.1.19",
  birthTimeBasis:"documented-minute",planets:placements,analysis,
  angles:{ascendant:16,mc:287},
};
const config={
  locale:"zh-Hant",style:"direct",targetCharacters:4000,
  includeBazi:false,includeZiwei:false,includeVedic:false,includeTransits:true,
};

test("ten chapters always appear in the required order and have traceable evidence",()=>{
  const chapters=buildWesternReportChapters(facts,config);
  assert.equal(chapters.length,10);
  assert.deepEqual(chapters.map(c=>c.number),Array.from({length:10},(_,i)=>i+1));
  assert.ok(chapters[0].evidence.some(c=>c.id==="angle.mc"));
  assert.ok(chapters[0].evidence.some(c=>c.id==="planet.Sun"));
  assert.ok(chapters[8].evidence.some(c=>c.id==="dignity.Sun"));
});
test("transit dates are never fabricated",()=>{
  const chapters=buildWesternReportChapters(facts,config);
  assert.equal(chapters[7].status,"limited");
  assert.match(chapters[7].summary,/不作判定/);
});
test("cross-system evidence is not injected without independently calculated inputs",()=>{
  const chapters=buildWesternReportChapters({...facts,ziwei:{calculated:false,sourceVersion:"",evidence:[]}},
    {...config,includeZiwei:true});
  assert.ok(!chapters.some(ch=>ch.evidence.some(ev=>ev.source==="ziwei")));
});
test("unverified sidereal and Alcabitius are blocked, not silently substituted",()=>{
  assert.throws(()=>validateWesternReportFacts({...facts,zodiac:"sidereal"}));
  assert.throws(()=>validateWesternReportFacts({...facts,houseSystem:"alcabitius"}));
});
test("prompt is grounded by allowed evidence and explicit missing-data rules",()=>{
  const p=buildWesternReportPrompt(facts,config);
  assert.ok(p.system.includes("不能硬湊"));
  assert.ok(p.system.includes("不作判定"));
  assert.ok(p.user.includes("不作判定"));
  assert.equal(p.chapters.length,10);
});
