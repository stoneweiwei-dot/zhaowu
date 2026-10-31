import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/zhaowu-capabilities.js';

test('coarse IP latitude returns only a non-cacheable hemisphere', async () => {
  for (const [latitude, expected] of [['-33.87', 'south'], ['51.5', 'north'], ['0', 'unknown'], ['', 'unknown'], ['-91', 'unknown']]) {
    const response = await handler({ method: 'GET', url: '/api/zhaowu-capabilities?mode=visitor-hemisphere', headers: { 'x-vercel-ip-latitude': latitude } });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.deepEqual(await response.json(), { hemisphere: expected });
  }
});
