import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { FROST_PHASES, FROST_END, FROST_SECTIONS, SOLAR_TERMS_24, seasonalState, solarTermsForYear, solarTermInstant, frostEdition, seasonalSkinId, seasonalVisualSkinId } from '../src/lib/seasonal-skins.ts';
import { SITE_SKIN_IDS } from '../lib/owner-site-skin-public.js';

test('southern imagery maps six months apart without changing the actual term', () => {
  for (const [i, term] of SOLAR_TERMS_24.entries()) {
    assert.equal(seasonalVisualSkinId(term, 'north'), term.skinId);
    assert.equal(seasonalVisualSkinId(term, 'unknown'), term.skinId);
    assert.equal(seasonalVisualSkinId(term, 'south'), SOLAR_TERMS_24[(i + 12) % 24].skinId);
  }
  assert.equal(seasonalState(new Date('2026-10-31T00:00:00Z')).term.zh, '霜降');
});

test('auto spans all seasons, and Sydney civil 00:01 switch is timezone independent', () => {
  assert.equal(seasonalSkinId(new Date('2026-10-22T13:00:59.999Z')), 'pine-ink');
  assert.equal(seasonalSkinId(new Date('2026-10-22T13:01:00Z')), 'solar-frost-descent');
  assert.equal(seasonalSkinId(new Date('2027-01-01T00:00Z')), 'day-flute');
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

test('the full 24-term 72-hou catalogue has accurate trilingual names and a skin for each term', () => {
  assert.equal(SOLAR_TERMS_24.length,24);
  assert.equal(new Set(SOLAR_TERMS_24.map(x => x.longitude)).size,24);
  assert.equal(SOLAR_TERMS_24.reduce((a,t) => a+t.hou.length,0),72);
  for(const term of SOLAR_TERMS_24){
    assert.ok(term.zh&&term.hans&&term.en&&term.skinId);
    assert.ok(SITE_SKIN_IDS.has(term.skinId), `undefined existing skin: ${term.skinId}`);
    for(const hou of term.hou){
      for(const locale of ['zh-Hant','zh-Hans','en']) assert.ok(hou[locale].trim(),`missing ${locale} of ${term.zh}`);
    }
  }
  assert.deepEqual(SOLAR_TERMS_24.find(t=>t.zh==='霜降').hou.map(h=>h['zh-Hant']),['豺乃祭獸','草木黃落','蟄蟲咸俯']);
});
test('astronomical solar longitude determines the Sydney date: cross-check NAOJ 2026 and 2027',()=>{
  const y2026=solarTermsForYear(2026), y2027=solarTermsForYear(2027);
  assert.equal(y2026.length,24);assert.equal(y2027.length,24);
  assert.equal(y2026.find(x=>x.spec.zh==='霜降').date,'2026-10-23');
  assert.equal(y2026.find(x=>x.spec.zh==='立冬').date,'2026-11-07');
  assert.equal(y2027.find(x=>x.spec.zh==='霜降').date,'2027-10-24');
  assert.equal(y2027.find(x=>x.spec.zh==='立冬').date,'2027-11-08');
  // NAOJ 2026 霜降: Oct 23 18:38 JST -> 09:38 UTC.
  assert.ok(Math.abs(solarTermInstant(2026,210,10,23).getTime()-Date.parse('2026-10-23T09:38:00Z'))<12*60000);
  // NAOJ 2027 霜降: Oct 24 00:33 JST -> Oct 23 15:33 UTC.
  assert.ok(Math.abs(solarTermInstant(2027,210,10,23).getTime()-Date.parse('2027-10-23T15:33:00Z'))<12*60000);
});
test('all 72 pentads switch at the scheduled Sydney dates, no gaps or repeated identities',()=>{
 for(const year of [2026,2027,2028,2030]){
  const terms=solarTermsForYear(year);
  for(const entry of terms) {
    const [y,m,d]=entry.date.split('-').map(Number);
    const atDays=(days,hm='00:01')=>{
      const t = new Date(Date.UTC(y,m-1,d+days));
      const yyyy=t.getUTCFullYear(),mm=String(t.getUTCMonth()+1).padStart(2,'0'),dd=String(t.getUTCDate()).padStart(2,'0');
      const iso=`${yyyy}-${mm}-${dd}T${hm}:00`;
      // Local midnight Sydney with correct time-zone DST offset (10 or 11 hours).
      const guesses=[10,11].map(offset=>new Date(iso+`+${offset}:00`));
      const sy=new Intl.DateTimeFormat('sv-SE',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
      const instant=guesses.find(x=>sy.format(x).replace(' ','T')===iso.slice(0,16));
      assert.ok(instant,`Sydney local instant for ${iso}`);
      return instant;
    };
    const first=seasonalState(atDays(0)),second=seasonalState(atDays(5)),third=seasonalState(atDays(10));
    assert.equal(first.term.zh,entry.spec.zh);
    assert.equal(first.houIndex,0);
    assert.equal(second.term.zh,entry.spec.zh);
    assert.equal(second.houIndex,1);
    assert.equal(third.term.zh,entry.spec.zh);
    assert.equal(third.houIndex,2);
    const before=seasonalState(atDays(0,'00:00'));
    assert.notEqual(before.term.zh,entry.spec.zh,`at midnight, previous term must stay until 00:01: ${entry.spec.zh}`);
  }
 }
});
test('homepage and theme manager display the pentad instead of pretending all 72 artworks are bespoke',()=>{
  const home=readFileSync('src/components/painted-home.tsx','utf8');
  const themes=readFileSync('src/components/owner-theme-skins-manager.tsx','utf8');
  const resolver=readFileSync('src/lib/theme-skins.ts','utf8');
  assert.match(home,/data-solar-hou/);
  assert.match(home,/seasonalAuto\.hou\[locale\]/);
  assert.match(themes,/data-seasonal-72-list/);
  assert.match(themes,/existing complete themes|沿用/);
  assert.match(resolver,/window\.setInterval\(refreshAutoSkinIfDue, 30_000\)/);
  assert.match(resolver,/visibilitychange/);
});
