import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EARTHLY_BRANCHES,
  buildZiweiCoreChart,
  buildZiweiTruthExtension,
  getDecadalDirection,
  getHongluanTianxi,
  getMajorStarBrightness,
  getScopeMovingStars,
  getTianma,
  palaceIndexOf,
  palaceRelation,
} from '../src/lib/ziwei/index.ts';

const BRIGHTNESS = {
  紫微: ['旺', '旺', '得', '旺', '廟', '廟', '旺', '旺', '得', '旺', '平', '廟'],
  天機: ['得', '旺', '利', '平', '廟', '陷', '得', '旺', '利', '平', '廟', '陷'],
  太陽: ['旺', '廟', '旺', '旺', '旺', '得', '得', '陷', '不', '陷', '陷', '不'],
  武曲: ['得', '利', '廟', '平', '旺', '廟', '得', '利', '廟', '平', '旺', '廟'],
  天同: ['利', '平', '平', '廟', '陷', '不', '旺', '平', '平', '廟', '旺', '不'],
  廉貞: ['廟', '平', '利', '陷', '平', '利', '廟', '平', '利', '陷', '平', '利'],
  天府: ['廟', '得', '廟', '得', '旺', '廟', '得', '旺', '廟', '得', '廟', '廟'],
  太陰: ['旺', '陷', '陷', '陷', '不', '不', '利', '不', '旺', '廟', '廟', '廟'],
  貪狼: ['平', '利', '廟', '陷', '旺', '廟', '平', '利', '廟', '陷', '旺', '廟'],
  巨門: ['廟', '廟', '陷', '旺', '旺', '不', '廟', '廟', '陷', '旺', '旺', '不'],
  天相: ['廟', '陷', '得', '得', '廟', '得', '廟', '陷', '得', '得', '廟', '廟'],
  天梁: ['廟', '廟', '廟', '陷', '廟', '旺', '陷', '得', '廟', '陷', '廟', '旺'],
  七殺: ['廟', '旺', '廟', '平', '旺', '廟', '廟', '廟', '廟', '平', '旺', '廟'],
  破軍: ['得', '陷', '旺', '平', '廟', '旺', '得', '陷', '旺', '平', '廟', '旺'],
};

const PALACE_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

test('十四主星 14×12 亮度矩阵与 pinned iztro 2.6.0 一致', () => {
  for (const [star, row] of Object.entries(BRIGHTNESS)) {
    PALACE_BRANCHES.forEach((branch, index) => {
      assert.equal(getMajorStarBrightness(star, branch), row[index], `${star}@${branch}`);
    });
  }
});

test('天马完整覆盖十二年支三合组', () => {
  const expected = { 子: '寅', 丑: '亥', 寅: '申', 卯: '巳', 辰: '寅', 巳: '亥', 午: '申', 未: '巳', 申: '寅', 酉: '亥', 戌: '申', 亥: '巳' };
  for (const branch of EARTHLY_BRANCHES) assert.equal(getTianma(branch), expected[branch]);
});

test('红鸾天喜十二支完整覆盖且永远相隔六宫', () => {
  for (const branch of EARTHLY_BRANCHES) {
    const { hongluan, tianxi } = getHongluanTianxi(branch);
    assert.equal((palaceIndexOf(tianxi) - palaceIndexOf(hongluan) + 12) % 12, 6, branch);
  }
  assert.deepEqual(getHongluanTianxi('子'), { hongluan: '卯', tianxi: '酉' });
  assert.deepEqual(getHongluanTianxi('亥'), { hongluan: '辰', tianxi: '戌' });
});

test('大限顺逆：阳男阴女顺，阴男阳女逆', () => {
  assert.equal(getDecadalDirection('甲', 'male'), 1);
  assert.equal(getDecadalDirection('乙', 'female'), 1);
  assert.equal(getDecadalDirection('乙', 'male'), -1);
  assert.equal(getDecadalDirection('甲', 'female'), -1);
});

test('十二步大限连续、每限十年、第一限起岁等于五行局', () => {
  const chart = buildZiweiCoreChart(
    { yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '子' },
    { mutagenProfile: 'south_iztro_v1' },
  );
  const truth = buildZiweiTruthExtension({ chart, directionBasis: 'male' });
  assert.equal(truth.decadals.length, 12);
  assert.equal(truth.decadals[0].ageStart, chart.fiveElementsBureau.number);
  for (let i = 0; i < truth.decadals.length; i += 1) {
    const item = truth.decadals[i];
    assert.equal(item.ageEnd - item.ageStart, 9);
    assert.equal(item.mutagens.length, 4);
    assert.equal(item.movingStars.length, 10);
    if (i > 0) assert.equal(item.ageStart, truth.decadals[i - 1].ageEnd + 1);
  }
});

test('scope 流曜集合固定；流年额外年解且不重新生成火铃空劫', () => {
  const decadal = getScopeMovingStars('甲', '子', 'decadal').map((star) => star.star);
  const yearly = getScopeMovingStars('甲', '子', 'yearly').map((star) => star.star);
  assert.deepEqual(decadal, ['天魁', '天鉞', '文昌', '文曲', '祿存', '擎羊', '陀羅', '天馬', '紅鸞', '天喜']);
  assert.deepEqual(yearly, [...decadal, '年解']);
  for (const forbidden of ['火星', '鈴星', '地空', '地劫']) assert.equal(yearly.includes(forbidden), false);
});

test('流年四化只是标注本命星所在宫，不重新安星', () => {
  const chart = buildZiweiCoreChart(
    { yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '子' },
    { mutagenProfile: 'south_iztro_v1' },
  );
  const truth = buildZiweiTruthExtension({ chart, directionBasis: 'male', targetYear: { year: 2026, stem: '丙', branch: '午' } });
  const annual = truth.yearly;
  assert.ok(annual);
  assert.equal(annual.mutagens.find((event) => event.transformation === '祿')?.targetStar, '天同');
  assert.equal(annual.mutagens.find((event) => event.transformation === '祿')?.branch, chart.majorStars.天同);
  assert.equal(annual.mutagens.find((event) => event.transformation === '忌')?.branch, chart.majorStars.廉貞);
});

test('三方四正几何关系是纯索引关系', () => {
  assert.equal(palaceRelation(0, 0), 'same');
  assert.equal(palaceRelation(0, 6), 'opposite');
  assert.equal(palaceRelation(0, 4), 'trine');
  assert.equal(palaceRelation(0, 8), 'trine');
  assert.equal(palaceRelation(0, 1), 'adjacent');
  assert.equal(palaceRelation(0, 11), 'adjacent');
  assert.equal(palaceRelation(0, 3), 'other');
});

test('Truth extension 标记计算资料可生产使用，同时保留原典未完全统一状态', () => {
  const chart = buildZiweiCoreChart(
    { yearStem: '辛', yearBranch: '酉', lunarMonth: 8, lunarDay: 27, timeBranch: '午' },
    { mutagenProfile: 'south_iztro_v1' },
  );
  const truth = buildZiweiTruthExtension({ chart, directionBasis: 'male', targetYear: { year: 2026, stem: '丙', branch: '午' }, activeDecadalIndex: 3 });
  assert.equal(truth.productionReady, true);
  assert.equal(truth.calculationDataReady, true);
  assert.equal(truth.primarySourceComplete, false);
  assert.equal(truth.calculationProfileId, 'zhaowu_ziwei_v0.5.2');
  assert.equal(truth.truthVersion, 'ziwei_truth_extension_v0.5');
  assert.equal(truth.referenceLock.iztroVersion, '2.6.0');
  assert.equal(truth.referenceLock.iztroCommit, '1ba89cca577c6d5d46754d6f49b6b51467c577d1');
  assert.ok(truth.activationEvents.length > 0);
});

test('一万组 deterministic scope property 检查所有宫位索引与基本不变量', () => {
  let seed = 20260828;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed;
  };
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  for (let i = 0; i < 10000; i += 1) {
    const stem = stems[next() % 10];
    const branch = EARTHLY_BRANCHES[next() % 12];
    const stars = getScopeMovingStars(stem, branch, i % 2 ? 'yearly' : 'decadal');
    for (const star of stars) assert.ok(star.palaceIndex >= 0 && star.palaceIndex < 12);
    const lu = stars.find((star) => star.star === '祿存');
    const yang = stars.find((star) => star.star === '擎羊');
    const tuo = stars.find((star) => star.star === '陀羅');
    const luan = stars.find((star) => star.star === '紅鸞');
    const xi = stars.find((star) => star.star === '天喜');
    assert.equal((yang.palaceIndex - lu.palaceIndex + 12) % 12, 1);
    assert.equal((lu.palaceIndex - tuo.palaceIndex + 12) % 12, 1);
    assert.equal((xi.palaceIndex - luan.palaceIndex + 12) % 12, 6);
  }
});