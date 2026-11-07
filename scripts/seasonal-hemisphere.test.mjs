import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/zhaowu-capabilities.js';
import { SOLAR_TERMS_24, seasonalVisualSkinId } from '../src/lib/seasonal-skins.ts';
import { southernSkinForDate, sydneyClock } from '../src/lib/theme-skins.ts';
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
  for (const file of ['public/theme-skins/southern/sydney-jacaranda-spring.webp','public/theme-skins/southern/sydney-bondi-summer.webp','public/theme-skins/southern/blue-mountains-autumn.webp','public/theme-skins/southern/snowy-mountains-winter.webp']) {
    const b=readFileSync(file); assert.equal(b.toString('ascii',0,4),'RIFF'); assert.equal(b.toString('ascii',8,12),'WEBP'); assert.ok(b.length>10000);
  }
});

test('Sydney daylight saving is read from Australia/Sydney, not a fixed offset', () => {
  const daylight = sydneyClock(new Date('2026-11-06T07:00:00Z'));
  assert.equal(daylight.dst, true);
  assert.match(daylight.offset, /GMT\+11/);
  assert.equal(daylight.date, '2026-11-06');
  const standard = sydneyClock(new Date('2027-07-15T02:00:00Z'));
  assert.equal(standard.dst, false);
  assert.match(standard.offset, /GMT\+10/);
  assert.equal(standard.date, '2027-07-15');
});
