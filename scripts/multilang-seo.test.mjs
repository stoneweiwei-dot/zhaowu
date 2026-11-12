import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LANGUAGES, LANGUAGE_PREFIXES, languagePath, parseLanguagePath, createLanguageRewrite } from '../src/lib/language-routing.js';
import { readRouteMeta, buildRouteHtml } from './build-route-html.mjs';
import { renderSitemap } from './build-sitemap.mjs';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const meta = readRouteMeta();

test('exact language prefixes only; ordinary and illegal paths are not stripped', () => {
  for (const language of LANGUAGES) {
    const path = languagePath('/about', language);
    assert.deepEqual(parseLanguagePath(path), { language, rest: '/about' });
    assert.deepEqual(parseLanguagePath(languagePath('/', language)), { language, rest: '/' });
  }
  for (const path of ['/ziwei', '/qizheng', '/xx/about', '/zh-hant/about', '/english/about', '/EN/about']) {
    assert.deepEqual(parseLanguagePath(path), { language: 'zh-Hant', rest: path });
  }
});
test('router rewrite covers links and navigation, without double prefixes or query/hash loss', () => {
  for (const language of LANGUAGES) {
    const rewrite = createLanguageRewrite(() => language);
    const url = new URL('https://example.test/knowledge/true-solar-time?x=a%20b&x=2#formula');
    assert.equal(rewrite.output({ url }).pathname, languagePath('/knowledge/true-solar-time', language));
    assert.equal(rewrite.output({ url }).pathname, languagePath('/knowledge/true-solar-time', language));
    assert.equal(url.search, '?x=a%20b&x=2'); assert.equal(url.hash, '#formula');
    assert.equal(rewrite.input({ url }).pathname, '/knowledge/true-solar-time');
    assert.equal(url.search, '?x=a%20b&x=2'); assert.equal(url.hash, '#formula');
  }
});
test('every static document contains exact localized SEO, reciprocal 11 alternates and a body', () => {
  const dir = mkdtempSync(join(tmpdir(), 'zhaowu-seo-'));
  try {
    writeFileSync(join(dir, 'index.html'), read('index.html'));
    const written = buildRouteHtml(dir);
    assert.equal(written.length, Object.keys(meta.routes).length * 10);
    const summaries = ['/sample-report', '/mythic-atlas', '/guaili-luanshen', '/knowledge/nine-heavens-lamps'];
    for (const path of Object.keys(meta.routes)) for (const language of LANGUAGES) {
      const publicPath = languagePath(path, language);
      const html = readFileSync(join(dir, publicPath, 'index.html'), 'utf8');
      assert.ok(html.includes(`<html lang="${language}">`), publicPath);
      assert.ok(html.includes(`rel="canonical" href="${meta.origin}${publicPath}"`), publicPath);
      const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
      assert.equal(alternates.length, 11, publicPath);
      assert.equal(new Set(alternates.map(a => a[1])).size, 11);
      for (const other of LANGUAGES) assert.equal(alternates.find(a => a[1] === other)?.[2], `${meta.origin}${languagePath(path, other)}`);
      assert.equal(alternates.find(a => a[1] === 'x-default')[2], `${meta.origin}${path}`);
      assert.ok(html.includes(`<title>${meta.routes[path][language].title.replaceAll('&', '&amp;')}</title>`));
      assert.ok(html.includes(meta.routes[path][language].description.replaceAll('&', '&amp;')));
      if (summaries.includes(path)) {
        const body = html.match(/<main class="zw-static-shell"[\s\S]*?<\/main>/)[0];
        assert.match(body, /<h1>[^<]+<\/h1>/);
        assert.match(body, /<p data-static-lead>[^<]+<\/p>/);
        const summary = body.match(/<section data-static-summary>([\s\S]*?)<\/section>/)[1];
        assert.equal((summary.match(/<p>/g) ?? []).length, 2);
        assert.ok(summary.replace(/<[^>]*>/g, '').length > 240, `${publicPath}: substantial editorial body`);
      }
    }
    assert.ok(!written.some(p => p.startsWith('/xx/') || p.startsWith('/zh-hant/')));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('sitemap method B covers 330 URLs with reciprocal alternates and stays reproducible', () => {
  const xml = read('public/sitemap.xml');
  assert.equal(renderSitemap(meta, xml), xml);
  assert.match(xml, /xmlns:xhtml="http:\/\/www.w3.org\/1999\/xhtml"/);
  const blocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
  assert.equal(blocks.length, Object.keys(meta.routes).length * 10);
  const urls = blocks.map(b => b[1].match(/<loc>([^<]+)<\/loc>/)[1]);
  assert.equal(new Set(urls).size, urls.length);
  for (const [i, block] of blocks.entries()) {
    const path = parseLanguagePath(new URL(urls[i]).pathname).rest;
    assert.equal((block[1].match(/hreflang=/g) ?? []).length, 11);
    for (const language of LANGUAGES) assert.ok(block[1].includes(`hreflang="${language}" href="${meta.origin}${languagePath(path, language)}"`));
  }
});
test('only language rewrites added; unknown prefixes retain a real host 404', () => {
  const config = JSON.parse(read('vercel.json'));
  const localized = config.rewrites.filter(r => Object.values(LANGUAGE_PREFIXES).some(prefix => prefix && r.source.startsWith(prefix + '/')));
  assert.equal(localized.length, 18);
  for (const language of LANGUAGES.slice(1)) {
    const prefix = LANGUAGE_PREFIXES[language];
    assert.ok(localized.some(r => r.source === `${prefix}/:path*` && r.destination === `${prefix}/:path*/index.html`));
  }
  assert.ok(!config.rewrites.some(r => /xx|zh-hant/.test(r.source)));
  assert.ok(!config.rewrites.some(r => r.source === '/:path*'));
  assert.ok(!config.redirects.some(r => r.has?.some(h => h.key?.toLowerCase() === 'accept-language')));
});
