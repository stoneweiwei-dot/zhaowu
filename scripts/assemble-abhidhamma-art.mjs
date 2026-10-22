import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Original paintings are split only to respect GitHub API transport size.
// All binary chunks live in git: no remote URLs or paid runtime dependencies.
const expected = [
  ['overview', 3213876, 'f9905277a88081bd130c87b75435d8fb4a68173d41fc2a638cbe386c4a0fa703'],
  ['desire', 3547266, '90d1cb903d075a4e71882ff0f3c1b738655dad4d8bb58c800a91f9d18c0dfcc4'],
  ['form', 3258568, '8ef73a85ff9d0c3f48a08f76077e3af498765fe3fc33e792bb428056f071d4f0'],
  ['formless', 2664104, '2a8ae836302ab840892b35fae2c88a122eeacd957ec2ed05903ba54fc7de1a03'],
];
const root = path.resolve(import.meta.dirname, '..');
const sourceDir = path.join(root, 'art-source');
const destinationDir = path.join(root, 'public', 'articles');
mkdirSync(destinationDir, { recursive: true });
for (const [kind, size, sha256] of expected) {
  const name = `abhidhamma-31-realms-${kind}-stone-original.png`;
  const chunks = [0, 1, 2].map(i => readFileSync(path.join(sourceDir, `${name}.part${i}`)));
  const file = Buffer.concat(chunks);
  assert.equal(file.length, size, `Unexpected image length: ${kind}`);
  assert.equal(createHash('sha256').update(file).digest('hex'), sha256, `Image checksum mismatch: ${kind}`);
  assert.ok(file.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `Invalid PNG: ${kind}`);
  writeFileSync(path.join(destinationDir, name), file);
  console.log(`[article-art] ${name}: ${size} bytes OK`);
}
