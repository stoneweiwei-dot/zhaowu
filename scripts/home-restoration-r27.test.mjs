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
test('question stays ahead of birth details even after a report, login returns to BaZi and intro stays intact',()=>{
 const form=source('src/components/analysis-form.tsx');
 assert.ok(form.indexOf('id="analysis-question"')<form.indexOf('id: "birth-year"'));
 assert.match(form,/aria-describedby="time-importance"/);assert.match(form,/UNKNOWN_TIME_COPY\[locale\]/);
 assert.match(form,/!current && previewChart/);
 const login=source('src/routes/login.tsx');assert.doesNotMatch(login,/navigate\(\{ to: "\/account"/);assert.match(login,/navigate\(\{ to: "\/"/);
 const intro=source('src/components/intro-gate.tsx');assert.match(intro,/OWNER_LOADING_VIDEO/);assert.match(intro,/data-intro-motion="owner-video"/);assert.doesNotMatch(intro,/wutong-owner-r29/);
 const panel=source('src/components/character-panel.tsx');assert.doesNotMatch(panel,/buildCharacterPanel|radar|artScores|SCHOOL_MARK/);
});
