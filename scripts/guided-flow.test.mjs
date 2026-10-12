import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {JourneySteps} from '../src/components/journey-steps.tsx';
import {currentJourneyStep,JOURNEY_COPY} from '../src/lib/site-journey.ts';

test('first visit, restored birth, editing and optional question choose the right step', () => {
  assert.equal(currentJourneyStep(false,false,false),1);
  assert.equal(currentJourneyStep(true,false,false),2);
  assert.equal(currentJourneyStep(true,false,true),3);
  assert.equal(currentJourneyStep(true,true,true),1);
});
test('three locales have one current step; unfilled birth cannot skip to dependent stages', () => {
  for (const locale of ['zh-Hant','zh-Hans','en']) {
    for (const hasBirth of [false,true]) {
      const current=hasBirth?2:1;
      const html=renderToStaticMarkup(createElement(JourneySteps,{locale,current,hasBirth,onSelect:()=>{}}));
      assert.equal((html.match(/<button /g)||[]).length,3);
      assert.equal((html.match(/aria-current="step"/g)||[]).length,1);
      assert.equal((html.match(/ disabled=""/g)||[]).length,hasBirth?0:2);
      for (const label of JOURNEY_COPY[locale].steps) assert.ok(html.includes(label));
    }
  }
});
test('entry points reach real existing screens; guide stays local and can close', () => {
  const dock=readFileSync('src/components/site-utility-dock.tsx','utf8');
  const home=readFileSync('src/routes/index.tsx','utf8');
  assert.match(dock,/zhaowu:open-guide/);
  assert.match(dock,/event.key === "Escape"/);
  assert.match(dock,/navigate\("\/#birth-form"\)/);
  assert.match(dock,/navigate\("\/history"\)/);
  for(const hash of ['#today','#quiz','#notes']) assert.ok(dock.includes('/'+hash));
  for(const name of ['TODAY_HASHES','QUIZ_HASHES','NOTES_HASHES']) assert.ok(home.includes(name));
  assert.doesNotMatch(dock,/api\.openai|createPortal|localStorage/);
});
test('new flow keeps chart and question as separate stages, with one follow-up above detail and checkout', () => {
  const form=readFileSync('src/components/analysis-form.tsx','utf8');
  assert.match(form,/showQuestion && !questionOpen \? <section id="bazi"/);
  assert.match(form,/showQuestion && questionOpen \? \(/);
  assert.match(form,/<CharacterPanel chart=\{previewChart\} \/>/);
  assert.match(form,/step > 1 && \(!rememberedRecord \|\| detailsOpen\)/);
  assert.match(form,/UNKNOWN_TIME_COPY\[locale\]/);
  assert.match(form,/question: question.trim\(\), locale/);
  const result=readFileSync('src/components/result-view.tsx','utf8');
  assert.equal((result.match(/<FollowUpBox result=\{result\} \/>/g)||[]).length,1);
  assert.ok(result.indexOf('<FollowUpBox') < result.indexOf('<details className="zhaowu-result-evidence'));
  assert.doesNotMatch(result,/<details[^>]*data-evidence-chart-detail/);
  assert.match(result,/showReadingGuide=\{false\}/);
});
