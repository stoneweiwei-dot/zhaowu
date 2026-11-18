import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('shared image viewer has visible safe-area close and releases iOS scroll lock', async () => {
  const [component, css] = await Promise.all([
    read('../src/components/image-viewer.tsx'),
    read('../src/image-viewer.css'),
  ]);
  assert.match(component, /event\.key === "Escape"/);
  assert.match(component, /event\.target === event\.currentTarget\) onClose\(\)/);
  assert.match(component, /popstate/);
  assert.match(component, /bodyStyle\.position = previousPosition/);
  assert.match(component, /window\.scrollTo\(0, scrollY\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /safe-area-inset-bottom/);
});

test('Vercel analytics is limited to the official host', async () => {
  const main = await read('../src/main.tsx');
  assert.match(main, /hostname === 'zhao-wu\.com'/);
  assert.match(main, /_vercel\/insights\/script\.js/);
  assert.match(main, /analytics\.onerror/);
});

test('owner image previews can be closed with Escape and restore locked page scroll', async () => {
  const [gallery, themes] = await Promise.all([
    read('../src/components/owner-gallery-manager.tsx'),
    read('../src/components/owner-theme-skins-manager.tsx'),
  ]);
  for (const source of [gallery, themes]) {
    assert.match(source, /event\.key === "Escape"/);
    assert.match(source, /body\.position = "fixed"/);
    assert.match(source, /body\.position = previous\.position/);
    assert.match(source, /window\.scrollTo\(0, scrollY\)/);
    assert.match(source, /safe-area-inset-top/);
  }
  assert.match(gallery, /min-h-11 min-w-11/);
});
