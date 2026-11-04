import test from 'node:test';
import assert from 'node:assert/strict';
import { skinById } from '../src/lib/theme-skins.ts';
import { START_WINTER_PHASES } from '../src/lib/seasonal-skins.ts';

test('automatic and manually selected winter themes resolve each scheduled scene', () => {
  const NativeDate = globalThis.Date;
  try {
    for (const [i, iso] of ['2026-11-06T13:01:00Z', '2026-11-11T13:01:00Z', '2026-11-16T13:01:00Z'].entries()) {
      const instant = NativeDate.parse(iso);
      globalThis.Date = class extends NativeDate {
        constructor(...args) { super(...(args.length ? args : [instant])); }
        static now() { return instant; }
      };
      assert.equal(skinById('solar-auto')?.hero, START_WINTER_PHASES[i].art);
      assert.equal(skinById('solar-start-winter')?.hero, START_WINTER_PHASES[i].art);
    }
  } finally {
    globalThis.Date = NativeDate;
  }
});
