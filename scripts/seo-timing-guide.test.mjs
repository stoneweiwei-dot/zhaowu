import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('index.html carries the keyword matrix in title, description and keywords', () => {
  const html = read('index.html');
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  for (const k of ['八字排盤', '子平八字', '真太陽時', '流年運勢', '免登入免費']) assert.ok(title.includes(k), `title missing ${k}`);
  assert.match(html, /<meta name="keywords" content="[^"]*五行旺衰[^"]*"/);
  assert.match(html, /<meta name="description" content="免登入免費八字排盤/);
  assert.doesNotMatch(html, /精準|aggregateRating|review|offers/);
});

test('JSON-LD parses and includes WebSite, WebApplication and FAQPage with 4 questions', () => {
  const html = read('index.html');
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  const data = JSON.parse(raw);
  const types = data['@graph'].map((n) => n['@type']);
  assert.deepEqual(types, ['WebSite', 'WebApplication', 'FAQPage']);
  assert.equal(data['@graph'][2].mainEntity.length, 4);
});

test('robots.txt and sitemap.xml agree: private routes disallowed, sitemap url declared, listed paths exist as routes', () => {
  const robots = read('public/robots.txt');
  assert.match(robots, /Sitemap: https:\/\/stone-zhaowu-official\.vercel\.app\/sitemap\.xml/);
  for (const p of ['/login', '/account', '/history']) assert.match(robots, new RegExp(`Disallow: ${p}`));
  const sitemap = read('public/sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].replace('https://stone-zhaowu-official.vercel.app', '') || '/');
  assert.ok(locs.includes('/'));
  const tree = read('src/routeTree.gen.ts');
  for (const p of locs.filter((x) => x !== '/')) assert.ok(tree.includes(`'${p}'`) || tree.includes(`"${p}"`), `route ${p} missing from routeTree`);
});

test('site shell sets multilingual title/description, noindex for private routes, and mounts the timing guide', () => {
  const shell = read('src/components/site-shell.tsx');
  assert.match(shell, /noindex,nofollow/);
  assert.match(shell, /Free BaZi/);
  assert.match(shell, /真太陽時/);
  const result = read('src/components/result-view.tsx');
  assert.match(result, /<ReportTimingGuide chart=\{chart\} unlocked=/);
  const guide = read('src/components/report-timing-guide.tsx');
  assert.match(guide, /data-timing-locked/);
  assert.match(guide, /toSimplifiedCustomerText/);
});
