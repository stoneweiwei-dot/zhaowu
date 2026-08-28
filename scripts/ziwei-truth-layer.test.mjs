import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EARTHLY_BRANCHES,
  PALACE_BRANCHES,
  buildZiweiCoreChart,
  calculateSoulAndBody,
  getAuxiliaries,
  getMajorStars,
  getMutagens,
} from '../src/lib/ziwei/index.ts';

const GOLDEN = [
  {
    name: 'A',
    input: { yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '子' },
    soul: '寅', body: '寅', stem: '丙', bureau: '火六局', ziwei: '酉', tianfu: '未',
    aux: { 擎羊: '卯', 陀羅: '丑', 火星: '寅', 鈴星: '戌', 地空: '亥', 地劫: '亥', 左輔: '辰', 右弼: '戌', 文昌: '戌', 文曲: '辰', 天魁: '丑', 天鉞: '未' },
  },
  {
    name: 'B',
    input: { yearStem: '乙', yearBranch: '丑', lunarMonth: 2, lunarDay: 6, timeBranch: '丑' },
    soul: '寅', body: '辰', stem: '戊', bureau: '土五局', ziwei: '未', tianfu: '酉',
    aux: { 擎羊: '辰', 陀羅: '寅', 火星: '辰', 鈴星: '亥', 地空: '戌', 地劫: '子', 左輔: '巳', 右弼: '酉', 文昌: '酉', 文曲: '巳', 天魁: '子', 天鉞: '申' },
  },
  {
    name: 'C',
    input: { yearStem: '丙', yearBranch: '寅', lunarMonth: 5, lunarDay: 13, timeBranch: '卯' },
    soul: '卯', body: '酉', stem: '辛', bureau: '木三局', ziwei: '申', tianfu: '申',
    aux: { 擎羊: '午', 陀羅: '辰', 火星: '辰', 鈴星: '午', 地空: '申', 地劫: '寅', 左輔: '申', 右弼: '午', 文昌: '未', 文曲: '未', 天魁: '亥', 天鉞: '酉' },
  },
  {
    name: 'D',
    input: { yearStem: '辛', yearBranch: '酉', lunarMonth: 8, lunarDay: 27, timeBranch: '午' },
    soul: '卯', body: '卯', stem: '辛', bureau: '木三局', ziwei: '戌', tianfu: '午',
    aux: { 擎羊: '戌', 陀羅: '申', 火星: '酉', 鈴星: '辰', 地空: '巳', 地劫: '巳', 左輔: '亥', 右弼: '卯', 文昌: '辰', 文曲: '戌', 天魁: '午', 天鉞: '寅' },
  },
  {
    name: 'E',
    input: { yearStem: '壬', yearBranch: '辰', lunarMonth: 11, lunarDay: 6, timeBranch: '亥' },
    soul: '丑', body: '亥', stem: '癸', bureau: '木三局', ziwei: '卯', tianfu: '丑',
    aux: { 擎羊: '子', 陀羅: '戌', 火星: '丑', 鈴星: '酉', 地空: '子', 地劫: '戌', 左輔: '寅', 右弼: '子', 文昌: '亥', 文曲: '卯', 天魁: '卯', 天鉞: '巳' },
  },
];

test('严格保留两套地支索引，PALACE_INDEX 从寅开始，EARTHLY_BRANCH_INDEX 从子开始', () => {
  assert.deepEqual(PALACE_BRANCHES, ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']);
  assert.deepEqual(EARTHLY_BRANCHES, ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']);
});

test('命身宫 12月×12时辰共144组都可计算，十二宫始终不重不漏', () => {
  for (let month = 1; month <= 12; month += 1) {
    for (const timeBranch of EARTHLY_BRANCHES) {
      const { soulIndex, bodyIndex } = calculateSoulAndBody(month, timeBranch);
      assert.ok(soulIndex >= 0 && soulIndex < 12);
      assert.ok(bodyIndex >= 0 && bodyIndex < 12);
      const chart = buildZiweiCoreChart(
        { yearStem: '甲', yearBranch: '子', lunarMonth: month, lunarDay: 1, timeBranch },
        { mutagenProfile: 'south_iztro_v1' },
      );
      assert.equal(new Set(chart.palaces.map((palace) => palace.branch)).size, 12);
      assert.equal(new Set(chart.palaces.map((palace) => palace.id)).size, 12);
      assert.equal(chart.palaces.filter((palace) => palace.isBodyPalace).length, 1);
    }
  }
});

test('五组 golden vectors 的命身、宫干、五行局、紫微天府逐项一致', () => {
  for (const vector of GOLDEN) {
    const chart = buildZiweiCoreChart(vector.input, { mutagenProfile: 'south_iztro_v1' });
    assert.equal(chart.soulPalace, vector.soul, `${vector.name} 命宫`);
    assert.equal(chart.bodyPalace, vector.body, `${vector.name} 身宫`);
    assert.equal(chart.soulPalaceStem, vector.stem, `${vector.name} 命宫干`);
    assert.equal(chart.fiveElementsBureau.name, vector.bureau, `${vector.name} 五行局`);
    assert.equal(chart.majorStars.紫微, vector.ziwei, `${vector.name} 紫微`);
    assert.equal(chart.majorStars.天府, vector.tianfu, `${vector.name} 天府`);
  }
});

test('A 案十四主星完整位置一致，允许主星同宫而不做唯一占宫约束', () => {
  const stars = getMajorStars(1, 6);
  assert.deepEqual(stars, {
    紫微: '酉', 天機: '申', 太陽: '午', 武曲: '巳', 天同: '辰', 廉貞: '丑',
    天府: '未', 太陰: '申', 貪狼: '酉', 巨門: '戌', 天相: '亥', 天梁: '子', 七殺: '丑', 破軍: '巳',
  });
  assert.equal(stars.天機, stars.太陰);
  assert.equal(stars.紫微, stars.貪狼);
});

test('五组煞曜与辅曜 golden vectors 全部一致', () => {
  for (const vector of GOLDEN) {
    const actual = getAuxiliaries(vector.input);
    for (const [star, branch] of Object.entries(vector.aux)) {
      assert.equal(actual[star], branch, `${vector.name} ${star}`);
    }
  }
});

test('地空与地劫使用时支亥宫起法；天空不得混入同一星ID', () => {
  const zi = getAuxiliaries({ yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '子' });
  const chou = getAuxiliaries({ yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '丑' });
  const wu = getAuxiliaries({ yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '午' });
  assert.equal(zi.地空, '亥'); assert.equal(zi.地劫, '亥');
  assert.equal(chou.地空, '戌'); assert.equal(chou.地劫, '子');
  assert.equal(wu.地空, '巳'); assert.equal(wu.地劫, '巳');
  assert.equal(Object.hasOwn(zi, '天空'), false);
});

test('南派十干四化固定映射，丙干负测阻止旧错误', () => {
  assert.deepEqual(getMutagens('丙', 'south_iztro_v1'), { 祿: '天同', 權: '天機', 科: '文昌', 忌: '廉貞' });
  assert.notEqual(getMutagens('丙', 'south_iztro_v1').科, '太陽');
});

test('壬干四化必须显式区分 source profile，禁止偷偷合并', () => {
  assert.equal(getMutagens('壬', 'south_iztro_v1').科, '左輔');
  assert.equal(getMutagens('壬', 'quanshu_transcription_v1').科, '天府');
});

test('核心层只接受已经标准化的农历输入，不私自处理闰月/晚子/年界', () => {
  assert.throws(() => buildZiweiCoreChart(
    { yearStem: '甲', yearBranch: '子', lunarMonth: 13, lunarDay: 1, timeBranch: '子' },
    { mutagenProfile: 'south_iztro_v1' },
  ), /lunarMonth must already be normalized/);
  const chart = buildZiweiCoreChart(GOLDEN[0].input, { mutagenProfile: 'south_iztro_v1' });
  assert.equal(chart.productionReady, true);
  assert.equal(chart.calculationDataReady, true);
  assert.equal(chart.primarySourceComplete, false);
  assert.equal(chart.boundaryPolicy, 'normalized_input_only');
});