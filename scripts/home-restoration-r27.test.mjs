import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { chooseDifferentArt } from '../src/lib/rotating-art.ts';
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
test('r144 keeps birth first, restores question second, and owner login still lands in account',()=>{
 const form=source('src/components/analysis-form.tsx');
 assert.match(form,/id="customer-record"/);
 assert.match(form,/id="question-stage"/);
 assert.match(form,/id="analysis-question"/);
 assert.ok(form.indexOf('id="customer-record"') < form.indexOf('id="question-stage"'));
 assert.match(form,/const showQuestion = Boolean\(rememberedRecord && !detailsOpen\)/);
 assert.match(form,/aria-describedby="time-importance"/);assert.match(form,/UNKNOWN_TIME_COPY\[locale\]/);
 assert.match(form,/id="bazi"/);assert.match(form,/zhaowu-bazi-hub/);
 const login=source('src/routes/login.tsx');assert.match(login,/navigate\(\{ to: "\/account"/);assert.match(login,/data-owner-only-login="true"/);
 const intro=source('src/components/intro-gate.tsx');assert.match(intro,/OWNER_LOADING_VIDEO/);assert.match(intro,/data-intro-motion="zhaowu-opening-r148"/);assert.match(intro,/zhaowu-opening-r148\.mp4/);
});