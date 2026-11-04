import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/zhaowu-capabilities.js';
import { SOLAR_TERMS_24, seasonalVisualSkinId } from '../src/lib/seasonal-skins.ts';
import { southernSkinForDate } from '../src/lib/theme-skins.ts';
import { readFileSync } from 'node:fs';
test('IP latitude returns only a non-cacheable hemisphere', async () => {
  for (const [latitude, expected] of [['-33.87', 'south'], ['51.5', 'north'], ['0', 'unknown'], ['', 'unknown'], ['-91', 'unknown'], ['bad', 'unknown']]) {
    const response = await handler({ method: 'GET', url: '/api/zhaowu-capabilities?mode=visitor-hemisphere', headers: { 'x-vercel-ip-latitude': latitude } });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.deepEqual(await response.json(), { hemisphere: expected });
  }
});
test('all terms preserve north and unknown; south uses opposite term imagery', () => {
  SOLAR_TERMS_24.forEach((term, i) => {
    assert.equal(seasonalVisualSkinId(term, 'north'), term.skinId);
    assert.equal(seasonalVisualSkinId(term, 'unknown'), term.skinId);
    assert.equal(seasonalVisualSkinId(term, 'south'), SOLAR_TERMS_24[(i+12)%24].skinId);
  });
});

test('four southern seasons switch at Sydney civil month boundaries', () => {
  for (const [date, expected] of [
    ['2026-08-31T13:59:59Z','southern-winter'], ['2026-08-31T14:00:00Z','sydney-jacaranda'],
    ['2026-11-30T12:59:59Z','sydney-jacaranda'], ['2026-11-30T13:00:00Z','southern-summer'],
    ['2027-02-28T12:59:59Z','southern-summer'], ['2027-02-28T13:00:00Z','southern-autumn'],
    ['2027-05-31T13:59:59Z','southern-autumn'], ['2027-05-31T14:00:00Z','southern-winter'],
  ]) assert.equal(southernSkinForDate(new Date(date)),expected,date);
  for (const file of ['public/theme-skins/southern/sydney-jacaranda-summer.webp','public/theme-skins/solar-frost-descent/option-falling-leaves.webp','public/theme-skins/southern/autumn-blue-mountains.webp','public/theme-skins/southern/winter-eucalyptus.webp']) {
    const b=readFileSync(file); assert.equal(b.toString('ascii',0,4),'RIFF'); assert.equal(b.toString('ascii',8,12),'WEBP'); assert.ok(b.length>10000);
  }
});
