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
  for (const locale of ['zh-Hant', 'zh-Hans']) assert.ok(file.includes('"'+locale+'":'));
  assert.match(file, /\ben\s*:/, 'English field may be unquoted in TypeScript');
  assert.match(file, /src: "\/articles\/civilization-timeline-2025-2030-stone-original\.png"/);
  assert.match(file, /afterParagraph: 1/);
  assert.match(file, /display: "wide"/);
  assert.match(file, /不是文明災變預言|非科學預測|科學預測/);
  assert.match(file, /2027 丁未/);
  assert.match(registry, /CIVILIZATION_TIMELINE_2025_2030_ARTICLE,/);
});

test('Five Elements Flow leads with the almanac, then sky and daily colours', () => {
  const file = readFileSync(navPath, 'utf8');
  const flow = file.split("      id: 'wuxing',")[1].split("      id: 'quiz',")[0];
  const direct = flow.split("id: 'today-guide'")[1].split("id: 'element-lore'")[0];
  assert.match(direct, /kind: 'action', section: 'today', title: t\('看今天的運勢', '看今天的运势', 'Today’s fortune'\)/);
  assert.match(direct, /href: '\/sky-events', title: t\('今日星象', '今日星象', 'Today’s sky'\)/);
  assert.match(direct, /href: '\/daily-colors', title: t\('每日幸運色', '每日幸运色', 'Colour of the day'\)/);
  assert.deepEqual([...direct.matchAll(/(?:section|href): '([^']+)'/g)].map(match => match[1]), ['today', '/sky-events', '/daily-colors']);
});
