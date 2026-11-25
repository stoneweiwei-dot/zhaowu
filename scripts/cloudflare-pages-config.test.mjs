import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const redirects = readFileSync(new URL('../public/_redirects', import.meta.url), 'utf8');
const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/cloudflare-pages.yml', import.meta.url), 'utf8');
const wrangler = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const functionFiles = readdirSync(new URL('../functions/api/', import.meta.url));

test('Pages redirects retain app routes, Supabase proxy and canonical guide redirect', () => {
  for (const route of ['/login', '/account', '/member', '/history', '/auth/callback', '/gallery', '/social', '/mythic-atlas', '/tianji-dual', '/tianji-xinggong']) {
    assert.match(redirects, new RegExp(`^${route.replaceAll('/', '\\/')} \/ 200$`, 'm'));
  }
  // Wildcard rewrites for paths that hold static files must target /index.html:
  // a target of "/" serves the app shell for every file under the path
  // (verified live 2026-11-25: all 109 files under /mythic-atlas/* returned
  // text/html). Bare routes keep "/ 200": no file lives at the bare path,
  // and "/index.html" there 308-redirects the route home.
  for (const route of ['/social', '/mythic-atlas']) {
    assert.match(redirects, new RegExp(`^${route.replaceAll('/', '\\/')}/\\* \/index\\.html 200$`, 'm'));
  }
  assert.match(redirects, /^\/guide\/\* \/\?guide=1 302$/m);
  assert.match(redirects, /^\/sb\/rest\/v1\/\* https:\/\/gyisxbkjzvdretbqzeuw\.supabase\.co\/rest\/v1\/:splat 200$/m);
  assert.match(redirects, /^\/\* \/index\.html 200$/m);
});

test('Pages headers and runtime handlers are present', () => {
  for (const header of ['Content-Security-Policy:', 'Strict-Transport-Security:', 'Service-Worker-Allowed:', 'Cache-Control: public, max-age=31536000, immutable']) assert.ok(headers.includes(header));
  for (const api of ['owner-data', 'owner-login', 'owner-logout', 'owner-music', 'owner-music-write', 'owner-session', 'mingshu-doctor', 'mingshu-locations', 'mingshu-chart', 'mingshu-compare', 'zhaowu-capabilities', 'zhaowu-doctor']) assert.ok(functionFiles.includes(`${api}.js`), `${api} Pages function missing`);
  assert.match(wrangler, /name = "zhaowu-prod"/);
  assert.match(wrangler, /nodejs_compat_populate_process_env/);
});

test('production deploy is main-only; manual deploy rejects production branch', () => {
  assert.match(workflow, /push:\n\s+branches: \[main\]/);
  assert.match(workflow, /\[ \"\$PREVIEW_BRANCH\" = \"main\" \]/);
  assert.match(workflow, /--project-name=zhaowu-prod --branch=main/);
  assert.match(workflow, /--project-name=zhaowu-prod --branch=\"\$PREVIEW_BRANCH\"/);
  assert.match(workflow, /CLOUDFLARE_API_TOKEN/);
  assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID/);
});
