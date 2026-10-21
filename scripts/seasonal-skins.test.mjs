import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { FROST_PHASES, FROST_END, FROST_SECTIONS, frostEdition, seasonalSkinId } from '../src/lib/seasonal-skins.ts';
import { SITE_SKIN_IDS } from '../lib/owner-site-skin-public.js';

test('auto stays on the verified fallback until Sydney 00:01, independent of visitor timezone', () => {
  assert.equal(seasonalSkinId(new Date('2026-10-22T13:00:59.999Z')), 'song-gallery-frostleaf');
  assert.equal(seasonalSkinId(new Date('2026-10-22T13:01:00Z')), 'solar-frost-descent');
  assert.equal(seasonalSkinId(new Date('2027-01-01T00:00Z')), 'solar-frost-descent');
});
test('each of the three scenes changes on its exact scheduled boundary', () => {
  FROST_PHASES.forEach((p, i) => {
    const boundary = Date.parse(p.start);
    assert.equal(frostEdition(new Date(boundary)).art, p.art);
    if (i) assert.equal(frostEdition(new Date(boundary-1)).art, FROST_PHASES[i-1].art);
    for (const locale of ['zh-Hant','zh-Hans','en']) assert.ok(p.name[locale] && p.quote[locale]);
  });
  assert.equal(frostEdition(new Date(FROST_END)).current, false);
});
test('every scheduled painting and section is a real local WebP, not a placeholder', () => {
  for (const file of [...FROST_PHASES.map(p => `public${p.art}`), ...FROST_SECTIONS.map(s => `public/theme-skins/solar-frost-descent/${s}.webp`)]) {
    const b = readFileSync(file);
    assert.equal(b.toString('ascii', 0, 4), 'RIFF', file);
    assert.equal(b.toString('ascii', 8, 12), 'WEBP', file);
    assert.equal(b.readUInt32LE(4) + 8, b.length, file);
  }
});
test('all twelve existing branch paintings are preserved; no repeat generation needed', () => {
  for (const key of ['zi','chou','yin','mao','chen','si','wu','wei','shen','you','xu','hai']) assert.ok(existsSync(`public/report-visuals/branches/${key}.webp`));
});
test('auto uses existing protected publisher and keeps manual rollback available', () => {
  assert.ok(SITE_SKIN_IDS.has('solar-auto'));
  assert.ok(SITE_SKIN_IDS.has('solar-frost-descent'));
  const source=readFileSync('src/lib/theme-skins.ts','utf8');
  assert.match(source,/credentials: "same-origin"/);
  assert.match(source,/site-skin.publish/);
  assert.match(source,/data-zws-selection/);
  assert.match(readFileSync('src/components/owner-theme-skins-manager.tsx','utf8'),/data-seasonal-theme-collection/);
});
