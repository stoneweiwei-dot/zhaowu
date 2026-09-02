import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');
const shell = await readFile(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/ios-section-visibility.css', import.meta.url), 'utf8');
const v31 = await readFile(new URL('../src/zhaowu-paper-reference-v31.css', import.meta.url), 'utf8');

test('section pages keep header and forms above the landscape layer', () => {
  assert.match(main, /import '\.\/ios-section-visibility\.css';/);
  assert.ok(main.indexOf("zhaowu-paper-reference-v31.css") < main.indexOf("ios-section-visibility.css"));
  assert.doesNotMatch(shell, /\bisolate\b/);
  assert.match(shell, /overflow-x-hidden/);
  assert.doesNotMatch(shell, /overflow-x-clip/);
  assert.match(css, /z-index: 0 !important/);
  assert.match(css, /\.zhaowu-app-frame/);
  assert.match(css, /backdrop-filter: none/);
  assert.doesNotMatch(v31, /\.zhaowu-home-sheet-shell,/);
});
