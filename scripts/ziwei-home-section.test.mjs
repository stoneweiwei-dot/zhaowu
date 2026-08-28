import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('首页存在独立紫微专题 section，并链接 /ziwei', async () => {
  const [home, feature] = await Promise.all([
    read('../src/routes/index.tsx'),
    read('../src/components/ziwei-home-feature.tsx'),
  ]);
  assert.match(home, /<ZiweiHomeFeature\s*\/>/);
  assert.match(feature, /to="\/ziwei"/);
  assert.match(feature, /紫微斗數・十二宮真值命盤|紫微斗数・十二宫真值命盘/);
  assert.match(feature, /zhaowu-ziwei-mini-chart/);
});

test('紫微页面明确计算层可正式使用，同时保留流派与原典差异说明', async () => {
  const [route, css, engine] = await Promise.all([
    read('../src/routes/ziwei.tsx'),
    read('../src/ziwei.css'),
    read('../src/lib/ziwei/horoscope.ts'),
  ]);
  assert.match(route, /createFileRoute\("\/ziwei"\)/);
  assert.match(route, /buildZiweiTruthExtension/);
  assert.match(route, /真太阳时|真太陽時/);
  assert.match(route, /計算資料已通過驗證，可正式使用|计算资料已通过验证，可正式使用|calculation data is verified for production use/);
  assert.doesNotMatch(route, /productionReady=false/);
  assert.match(css, /grid-template-columns:\s*repeat\(4/);
  assert.match(css, /@media \(max-width:\s*430px\)/);
  assert.match(engine, /import \{ ZIWEI_ENGINE_READINESS \} from '\.\/profiles'/);
  assert.match(engine, /productionReady:\s*ZIWEI_ENGINE_READINESS\.calculationDataReady/);
  assert.match(engine, /calculationDataReady:\s*ZIWEI_ENGINE_READINESS\.calculationDataReady/);
  assert.match(engine, /primarySourceComplete:\s*ZIWEI_ENGINE_READINESS\.primarySourceComplete/);
  assert.match(engine, /1ba89cca577c6d5d46754d6f49b6b51467c577d1/);
});