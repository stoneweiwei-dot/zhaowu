import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const model = readFileSync(new URL('../src/lib/report/decision-report-model.ts', import.meta.url), 'utf8');
const pages = readFileSync(new URL('../src/components/paid-report-pages.tsx', import.meta.url), 'utf8');
const focused = readFileSync(new URL('../src/lib/report/focused-report.ts', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/focused-report.css', import.meta.url), 'utf8');

test('report keeps persisted summary/body contract while rendering an answer-first view model', () => {
  assert.match(focused, /key:\s*"summary"/);
  assert.match(focused, /key:\s*"body"/);
  assert.match(model, /export function buildQuestionContract/);
  assert.match(model, /export function buildDecisionReportModel/);
  assert.match(model, /validationIssues/);
  assert.match(model, /sectionOrder/);
});

test('paid report opens with the exact user question and a two-sentence direct answer surface', () => {
  assert.match(pages, /zhaowu-question-contract/);
  assert.match(pages, /model\.contract\.sourceText/);
  assert.match(pages, /model\.directAnswer/);
  assert.match(pages, /DecisionCards/);
  assert.ok(pages.indexOf('<DecisionCards') < pages.indexOf('<ChartSnapshot'));
  assert.ok(pages.indexOf('<ChartSnapshot') < pages.indexOf('<ReportVisualBook'));
});

test('question relevance controls timing-heavy visual modules', () => {
  assert.match(model, /supportingModules/);
  assert.match(pages, /model\?\.supportingModules\.includes\("luck"\)/);
  assert.match(pages, /showLuck\s*\?\s*<ReportLuckBook/);
});

test('mobile report typography and palette meet the r110 readable-paper contract', () => {
  assert.match(css, /--zw-paper:\s*#f6f1e7/i);
  assert.match(css, /--zw-pine:\s*#355e50/i);
  assert.match(css, /--zw-cinnabar:\s*#a64d3e/i);
  assert.match(css, /--zw-wood:\s*#64865d/i);
  assert.match(css, /--zw-fire:\s*#b95b49/i);
  assert.match(css, /--zw-earth:\s*#af8e55/i);
  assert.match(css, /--zw-metal:\s*#c2a25b/i);
  assert.match(css, /--zw-water:\s*#4382a0/i);
  assert.match(css, /\.zhaowu-report-copy[\s\S]*?font-size:\s*17px/);
  assert.match(css, /\.zhaowu-decision-card li[\s\S]*?font-size:\s*17px/);
  assert.match(css, /\.zhaowu-direct-answer > p[\s\S]*?clamp\(21px/);
});

test('four-pillar snapshot keeps day master visually central and hides unavailable hour data', () => {
  assert.match(pages, /pillar\.key === "day" \? "is-day"/);
  assert.match(pages, /pillar\.ready !== false/);
  assert.match(pages, /pillar\.hide\.map/);
  assert.match(css, /\.zhaowu-pillar-card\.is-day/);
  assert.match(css, /\.zhaowu-pillar-grid/);
});
