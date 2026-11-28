import { parseLanguagePath } from '../src/lib/language-routing.js';
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
  const types = data['@graph'].flatMap((n) => n['@type']);
  assert.deepEqual(types, ['Organization', 'WebSite', 'SoftwareApplication', 'WebApplication', 'FAQPage']);
  assert.equal(data['@graph'].find(n => n['@type'] === 'FAQPage').mainEntity.length, 4);
});

test('robots.txt and sitemap.xml agree: private routes crawlable with edge noindex, sitemap url declared, listed paths exist as routes', () => {
  const robots = read('public/robots.txt');
  assert.match(robots, /Sitemap: https:\/\/zhao-wu\.com\/sitemap\.xml/);
  const groups = robots.trim().split(/\n\s*\n/);
  for (const agent of ['*', 'Googlebot', 'OAI-SearchBot', 'GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'anthropic-ai', 'Applebot-Extended']) {
    const matches = groups.filter(group => group.split(/\r?\n/).includes('User-agent: ' + agent));
    assert.equal(matches.length, 1, agent);
    assert.match(matches[0], /^Allow: \/$/m);
    assert.doesNotMatch(matches[0], /^Disallow: \/$/m);
    assert.match(matches[0], /^Disallow: \/api\/$/m);
  }
  // Private HTML routes must stay crawlable so their X-Robots-Tag: noindex header is
  // actually read by search bots; robots.txt Disallow would hide that signal.
  for (const p of ['/login', '/account', '/member', '/history', '/gallery', '/social']) {
    assert.doesNotMatch(robots, new RegExp(`Disallow: ${p}\\n`), `robots.txt must not disallow page route ${p}`);
  }
  // Non-HTML endpoints stay disallowed.
  for (const p of ['/auth/', '/api/']) assert.match(robots, new RegExp(`Disallow: ${p}`));
  // The noindex signal for private page routes lives at the edge in vercel.json.
  const vercel = JSON.parse(read('vercel.json'));
  const noindexEntry = vercel.headers.find((e) => e.headers.some((h) => h.key === 'X-Robots-Tag' && h.value.includes('noindex')));
  assert.ok(noindexEntry, 'expected an X-Robots-Tag noindex header rule in vercel.json');
  for (const p of ['member', 'login', 'account', 'history', 'social', 'gallery']) {
    assert.ok(noindexEntry.source.includes(p), `X-Robots-Tag rule missing ${p}`);
  }
  const sitemap = read('public/sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => parseLanguagePath(m[1].replace('https://zhao-wu.com', '') || '/').rest);
  assert.ok(locs.includes('/') && locs.includes('/hepan'));
  for (const path of ['/pricing', '/yunyi-shenxiang']) assert.ok(locs.includes(path));
  const tree = read('src/routeTree.gen.ts');
  for (const p of locs.filter((x) => x !== '/')) assert.ok(tree.includes(`'${p}'`) || tree.includes(`"${p}"`), `route ${p} missing from routeTree`);
});

test('site shell sets multilingual title/description, noindex for private routes, and mounts the timing guide', () => {
  const shell = read('src/components/site-shell.tsx');
  assert.match(shell, /noindex,nofollow/);
  assert.match(shell, /Free BaZi/);
  assert.match(shell, /真太陽時/);
  const result = read('src/components/result-view.tsx');
  assert.match(result, /<ReportTimingGuide chart=\{chart\} unlocked(?:=| \/>)/);
  const guide = read('src/components/report-timing-guide.tsx');
  assert.match(guide, /data-timing-locked/);
  assert.match(guide, /toSimplifiedCustomerText/);
});
