import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const assetPath = 'public/articles/civilization-timeline-2025-2030-stone-original.png';
const articlePath = 'src/lib/life-view-long-form/civilization-timeline-2025-2030.ts';
const registryPath = 'src/lib/life-view-long-form.ts';
const navPath = 'src/components/home-tree.tsx';

test('STONE original infographic is exact 941x1672 PNG, not a generated placeholder', () => {
  assert.ok(existsSync(assetPath), 'Real PNG asset must be committed before release');
  const bytes = readFileSync(assetPath);
  assert.equal(bytes.length, 2736517);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(bytes.readUInt32BE(16), 941);
  assert.equal(bytes.readUInt32BE(20), 1672);
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    'fe37936b94efcf936ce48fe3e62c770ec81976777bd3aa6bcb738173bcbbbf1a',
  );
});

test('civilization article appears in existing three-language Articles catalog with real image', () => {
  const file = readFileSync(articlePath, 'utf8');
  const registry = readFileSync(registryPath, 'utf8');
  assert.match(file, /publishedAt: "2026-10-23"/);
  for (const locale of ['zh-Hant', 'zh-Hans', 'en']) assert.ok(file.includes('"'+locale+'":'));
  assert.match(file, /src: "\/articles\/civilization-timeline-2025-2030-stone-original\.png"/);
  assert.match(file, /afterParagraph: 1/);
  assert.match(file, /display: "wide"/);
  assert.match(file, /不是文明災變預言|非科學預測|科學預測/);
  assert.match(file, /2027 丁未/);
  assert.match(registry, /CIVILIZATION_TIMELINE_2025_2030_ARTICLE,/);
});

test('Today sky is directly visible within the second guidance step, preserving sky route', () => {
  const file = readFileSync(navPath, 'utf8');
  const today = file.split("id: 'today'")[1].split("id: 'quiz'")[0];
  assert.match(today, /href: '\/sky-events', title: t\('今日星象', '今日星象', 'Today’s sky & astrology'\)/);
  assert.match(today, /href: '\/daily-colors'/);
  assert.ok(today.indexOf("href: '/sky-events'") < today.indexOf("href: '/daily-colors'"), 'sky is the first direct child link');
  assert.doesNotMatch(today, /id: 'branch'/, 'sky is not tucked behind another accordion');
  assert.match(file, /id: 'today'/);
});
