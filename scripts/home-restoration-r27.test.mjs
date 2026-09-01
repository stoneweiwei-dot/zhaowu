import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { chooseDifferentArt } from '../src/lib/rotating-art.ts';
import { rankPersonalArt, personalArtReason } from '../src/lib/report/personal-art.ts';
import { emptyGalleryKnowledge } from '../src/lib/gallery-match.ts';
import { buildChart } from '../src/lib/bazi/chart.ts';
const source=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');

test('homepage random art excludes the last item, can choose every other item and handles empty/single pools',()=>{
 const items=[{id:'a'},{id:'b'},{id:'c'}];
 assert.equal(chooseDifferentArt(items,'a',()=>0).id,'b');
 assert.equal(chooseDifferentArt(items,'a',()=>.99).id,'c');
 assert.equal(chooseDifferentArt([items[0]],'a').id,'a');
 assert.equal(chooseDifferentArt([],'a'),null);
});
test('one article opens initially; other summaries contain only titles, with no view-counter API',()=>{
 const s=source('src/components/life-view-section.tsx');
 assert.match(s,/ARTICLES\[0\]\?\.id/);assert.match(s,/open=\{openId === article\.id\}/);
 const summary=s.slice(s.indexOf('<summary'),s.indexOf('</summary>'));
 assert.match(summary,/article.title\[locale\]/);assert.doesNotMatch(summary,/article.summary|publishedAt|views|瀏覽/);
 assert.doesNotMatch(s,/fetchLifeViewCounts|incrementLifeViewCount|life-view-views/);
});
test('question stays ahead of birth details even after a report, login returns to BaZi and intro asset stays intact',()=>{
 const form=source('src/components/analysis-form.tsx');
 assert.ok(form.indexOf('id="analysis-question"')<form.indexOf('id: "birth-year"'));
 assert.match(form,/aria-describedby="time-importance"/);assert.match(form,/UNKNOWN_TIME_COPY\[locale\]/);
 assert.match(form,/!current && previewChart/);
 const login=source('src/routes/login.tsx');assert.doesNotMatch(login,/navigate\(\{ to: "\/account"/);assert.match(login,/navigate\(\{ to: "\/"/);
 const intro=source('src/components/intro-gate.tsx');assert.match(intro,/twin-lotus-restored-r26.mp4/);
 const panel=source('src/components/character-panel.tsx');assert.doesNotMatch(panel,/buildCharacterPanel|radar|artScores|SCHOOL_MARK/);
});
const chart=buildChart({question:'What is my direction?',year:1988,month:10,day:4,hour:4,minute:40,timeUnknown:false,gender:'male',relation:'unset',city:{name:'Test',display:'Test',country:'China',latitude:30,longitude:120,timezone:'Asia/Shanghai'},useTrueSolar:true,ziPolicy:'midnight'});
function row(id,title,key='library-report-art-'+id,scores={wood:5,fire:5,earth:5,metal:5,water:5}){return {asset:{id,title,asset_key:key,category:'visual-library',storage_path:id+'.jpg',bucket_id:'zhaowu-gallery',tags:[],enabled:true},knowledge:{...emptyGalleryKnowledge(id),analysis_status:"approved",subject_labels:[title],element_scores:scores}};}
test('a documented natal-image affinity wins; absent one the elemental companion varies by chart, never tea or reference sheets',()=>{
 const water=row('water','River',undefined,{wood:0,fire:0,earth:0,metal:0,water:100});
 const fire=row('fire','Fire',undefined,{wood:0,fire:100,earth:0,metal:0,water:0});
 const exact=row('exact','長流水 · Ever-flowing Water');
 const tea=row('tea','茶仙');const reference=row('reference','長流水','reference-example');
 assert.equal(rankPersonalArt({...chart,useful:['火'],drain:[]},[water,fire,exact,tea,reference])[0].asset.id,'exact');
 assert.equal(rankPersonalArt({...chart,useful:['火'],drain:[]},[water,fire,tea,reference])[0].asset.id,'fire');
 assert.equal(rankPersonalArt({...chart,useful:['水'],drain:[]},[water,fire,tea,reference])[0].asset.id,'water');
 const reason=personalArtReason(chart,'Where next?',exact,'en');assert.doesNotMatch(reason,/[\u3400-\u9fff]/);assert.match(reason,/Ever-flowing Water/);
});
