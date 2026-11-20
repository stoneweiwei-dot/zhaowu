/** Method B: every localized URL has the same reciprocal alternate set. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LANGUAGES, languagePath, languageAlternates, parseLanguagePath } from '../src/lib/language-routing.js';
export function renderSitemap(meta, previous = '') {
  const dates = new Map([...previous.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map(([, url, date]) => [parseLanguagePath(new URL(url).pathname).rest, date]));
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + Object.keys(meta.routes).flatMap(path => LANGUAGES.map(language => {
    const alternates = languageAlternates(path, meta.origin).map(a => `    <xhtml:link rel="alternate" hreflang="${a.language}" href="${a.href}"/>`).join('\n');
    return `  <url><loc>${meta.origin}${languagePath(path, language)}</loc><lastmod>${dates.get(path) ?? '2026-11-12'}</lastmod>\n${alternates}\n  </url>`;
  })).join('\n') + '\n</urlset>\n';
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = new URL('../public/sitemap.xml', import.meta.url);
  writeFileSync(target, renderSitemap(JSON.parse(readFileSync(new URL('../src/lib/route-meta.json', import.meta.url), 'utf8')), readFileSync(target, 'utf8')));
}
