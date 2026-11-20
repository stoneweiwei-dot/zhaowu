import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ZIWEI_CLASSICAL_STAR_METADATA,
  ZIWEI_PRIMARY_SOURCE_BLOCKERS,
  ZIWEI_PRIMARY_SOURCE_READY,
  ZIWEI_RULE_SOURCES,
  calculateSoulAndBody,
  getAuxiliaries,
  getDecadalDirection,
  getFiveElementsBureau,
  getHongluanTianxi,
  getMajorStars,
  getMutagens,
  getPalaceStem,
  getScopeMovingStars,
  getTianma,
  resolvePlacementLunarMonth,
} from '../src/lib/ziwei/index.ts';

// Historical-text anchors in this file are taken from 《紫微斗數全書》卷二:
// 安身命例、安十二宮例、起五行寅例、安南北斗諸星訣、安文昌文曲、
// 安左輔右弼、安天馬、安祿存羊陀、安火鈴、四化、天空地劫、
// 安紅鸞天喜、安大限、安流祿流羊流陀，以及星曜五行/化氣段落。

test('《全書》安身命例：正月子丑寅三时的命身宫固定向相反方向展开', () => {
  assert.deepEqual(calculateSoulAndBody(1, '子'), { soulIndex: 0, bodyIndex: 0, soulBranch: '寅', bodyBranch: '寅' });
  assert.deepEqual(calculateSoulAndBody(1, '丑'), { soulIndex: 11, bodyIndex: 1, soulBranch: '丑', bodyBranch: '卯' });
  assert.deepEqual(calculateSoulAndBody(1, '寅'), { soulIndex: 10, bodyIndex: 2, soulBranch: '子', bodyBranch: '辰' });
});

test('《全書》起五行寅例：五虎遁十干在寅宫起干逐组一致', () => {
  const expected = {
    甲: '丙', 己: '丙',
    乙: '戊', 庚: '戊',
    丙: '庚', 辛: '庚',
    丁: '壬', 壬: '壬',
    戊: '甲', 癸: '甲',
  };
  for (const [stem, palaceStem] of Object.entries(expected)) {
    assert.equal(getPalaceStem(stem, '寅'), palaceStem, stem);
  }
});

test('《全書》明例：甲年命在寅得丙寅火六局，初一紫微在酉', () => {
  const lifeStem = getPalaceStem('甲', '寅');
  assert.equal(lifeStem, '丙');
  assert.deepEqual(getFiveElementsBureau(lifeStem, '寅'), { name: '火六局', number: 6 });
  assert.equal(getMajorStars(1, 6).紫微, '酉');
});

test('《全書》安南北斗诸星诀：火六局初一由紫微酉位展开十四主星', () => {
  assert.deepEqual(getMajorStars(1, 6), {
    紫微: '酉', 天機: '申', 太陽: '午', 武曲: '巳', 天同: '辰', 廉貞: '丑',
    天府: '未', 太陰: '申', 貪狼: '酉', 巨門: '戌', 天相: '亥', 天梁: '子', 七殺: '丑', 破軍: '巳',
  });
});

test('《全書》昌曲与左右明例：子丑时、正二月不依赖现代软件推导', () => {
  const m1zi = getAuxiliaries({ yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '子' });
  assert.equal(m1zi.文昌, '戌');
  assert.equal(m1zi.文曲, '辰');
  assert.equal(m1zi.左輔, '辰');
  assert.equal(m1zi.右弼, '戌');

  const m2chou = getAuxiliaries({ yearStem: '甲', yearBranch: '子', lunarMonth: 2, lunarDay: 1, timeBranch: '丑' });
  assert.equal(m2chou.文昌, '酉');
  assert.equal(m2chou.文曲, '巳');
  assert.equal(m2chou.左輔, '巳');
  assert.equal(m2chou.右弼, '酉');
});

test('《全書》天马诀：四组三合年支完整锁定', () => {
  for (const branch of ['寅', '午', '戌']) assert.equal(getTianma(branch), '申');
  for (const branch of ['申', '子', '辰']) assert.equal(getTianma(branch), '寅');
  for (const branch of ['巳', '酉', '丑']) assert.equal(getTianma(branch), '亥');
  for (const branch of ['亥', '卯', '未']) assert.equal(getTianma(branch), '巳');
});

test('《全書》祿存羊陀：十干祿位与癸年子祿丑羊亥陀明例一致', () => {
  const expectedLu = { 甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳', 己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子' };
  for (const [stem, lu] of Object.entries(expectedLu)) {
    const aux = getAuxiliaries({ yearStem: stem, yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '子' });
    assert.equal(aux.祿存, lu, stem);
  }
  const gui = getAuxiliaries({ yearStem: '癸', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '子' });
  assert.equal(gui.祿存, '子');
  assert.equal(gui.擎羊, '丑');
  assert.equal(gui.陀羅, '亥');
});

test('《全書》火铃诀：四组三合的子时起位保持原诀', () => {
  const cases = [
    ['寅', '丑', '卯'],
    ['申', '寅', '戌'],
    ['巳', '卯', '戌'],
    ['亥', '酉', '戌'],
  ];
  for (const [yearBranch, fire, bell] of cases) {
    const aux = getAuxiliaries({ yearStem: '甲', yearBranch, lunarMonth: 1, lunarDay: 1, timeBranch: '子' });
    assert.equal(aux.火星, fire, `${yearBranch} 火`);
    assert.equal(aux.鈴星, bell, `${yearBranch} 鈴`);
  }
});

test('《全書》十干四化 profile 逐干固定，壬干明确为梁紫府武', () => {
  const expected = {
    甲: { 祿: '廉貞', 權: '破軍', 科: '武曲', 忌: '太陽' },
    乙: { 祿: '天機', 權: '天梁', 科: '紫微', 忌: '太陰' },
    丙: { 祿: '天同', 權: '天機', 科: '文昌', 忌: '廉貞' },
    丁: { 祿: '太陰', 權: '天同', 科: '天機', 忌: '巨門' },
    戊: { 祿: '貪狼', 權: '太陰', 科: '右弼', 忌: '天機' },
    己: { 祿: '武曲', 權: '貪狼', 科: '天梁', 忌: '文曲' },
    庚: { 祿: '太陽', 權: '武曲', 科: '太陰', 忌: '天同' },
    辛: { 祿: '巨門', 權: '太陽', 科: '文曲', 忌: '文昌' },
    壬: { 祿: '天梁', 權: '紫微', 科: '天府', 忌: '武曲' },
    癸: { 祿: '破軍', 權: '巨門', 科: '太陰', 忌: '貪狼' },
  };
  for (const [stem, row] of Object.entries(expected)) {
    assert.deepEqual(getMutagens(stem, 'quanshu_transcription_v1'), row, stem);
  }
  assert.equal(getMutagens('壬', 'south_iztro_v1').科, '左輔');
  assert.equal(getMutagens('壬', 'quanshu_transcription_v1').科, '天府');
});

test('《全書》天空地劫明例：子、丑、午时逐项一致', () => {
  const zi = getAuxiliaries({ yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '子' });
  const chou = getAuxiliaries({ yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '丑' });
  const wu = getAuxiliaries({ yearStem: '甲', yearBranch: '子', lunarMonth: 1, lunarDay: 1, timeBranch: '午' });
  assert.deepEqual([zi.地劫, zi.地空], ['亥', '亥']);
  assert.deepEqual([chou.地劫, chou.地空], ['子', '戌']);
  assert.deepEqual([wu.地劫, wu.地空], ['巳', '巳']);
});

test('《全書》红鸾天喜诀：子年红鸾卯、天喜对宫酉', () => {
  assert.deepEqual(getHongluanTianxi('子'), { hongluan: '卯', tianxi: '酉' });
  assert.deepEqual(getHongluanTianxi('午'), { hongluan: '酉', tianxi: '卯' });
});

test('《全書》安大限诀：阳男阴女顺、阴男阳女逆', () => {
  assert.equal(getDecadalDirection('甲', 'male'), 1);
  assert.equal(getDecadalDirection('甲', 'female'), -1);
  assert.equal(getDecadalDirection('乙', 'male'), -1);
  assert.equal(getDecadalDirection('乙', 'female'), 1);
});

test('《全書》安流祿流羊流陀明例：己丑流年午祿、未羊、巳陀', () => {
  const map = Object.fromEntries(getScopeMovingStars('己', '丑', 'yearly').map((item) => [item.star, item.branch]));
  assert.equal(map.祿存, '午');
  assert.equal(map.擎羊, '未');
  assert.equal(map.陀羅, '巳');
});

test('《全書》闰月原文对应 next_month profile，现代十五日分界仍保留为另一 profile', () => {
  assert.equal(resolvePlacementLunarMonth({ lunarMonth: 6, lunarDay: 1, isLeapMonth: true, rawTimeIndex: 0, policy: 'next_month' }), 7);
  assert.equal(resolvePlacementLunarMonth({ lunarMonth: 6, lunarDay: 1, isLeapMonth: true, rawTimeIndex: 0, policy: 'split_after_15' }), 6);
  assert.equal(resolvePlacementLunarMonth({ lunarMonth: 6, lunarDay: 16, isLeapMonth: true, rawTimeIndex: 0, policy: 'split_after_15' }), 7);
});

test('《全書》星曜五行/斗系/化气资料只录原文明载，不伪造完整阴阳表', () => {
  assert.deepEqual(
    { element: ZIWEI_CLASSICAL_STAR_METADATA.紫微.element, dipper: ZIWEI_CLASSICAL_STAR_METADATA.紫微.dipper, transformation: ZIWEI_CLASSICAL_STAR_METADATA.紫微.transformation, polarity: ZIWEI_CLASSICAL_STAR_METADATA.紫微.polarity },
    { element: '土', dipper: '南北斗', transformation: '帝座', polarity: null },
  );
  assert.equal(ZIWEI_CLASSICAL_STAR_METADATA.武曲.element, '金');
  assert.equal(ZIWEI_CLASSICAL_STAR_METADATA.武曲.transformation, '財');
  assert.equal(ZIWEI_CLASSICAL_STAR_METADATA.太陰.element, '水');
  assert.equal(ZIWEI_CLASSICAL_STAR_METADATA.太陰.transformation, '富');
  assert.equal(ZIWEI_CLASSICAL_STAR_METADATA.擎羊.transformation, '刑');
  assert.equal(ZIWEI_CLASSICAL_STAR_METADATA.紅鸞.element, '水');
});

test('source registry 明确区分古籍校验、流派锁定与仅 pinned implementation，尚未伪称全层 primary-ready', () => {
  assert.equal(ZIWEI_RULE_SOURCES.majorStarSequence.confidence, 'historical_text_cross_checked');
  assert.equal(ZIWEI_RULE_SOURCES.natalMutagensQuanshu.confidence, 'historical_text_cross_checked');
  assert.equal(ZIWEI_RULE_SOURCES.kuiYueNatal.confidence, 'variant_locked');
  assert.equal(ZIWEI_RULE_SOURCES.majorStarBrightness.confidence, 'pinned_implementation_only');
  assert.equal(ZIWEI_PRIMARY_SOURCE_READY, false);
  assert.ok(ZIWEI_PRIMARY_SOURCE_BLOCKERS.includes('majorStarBrightness'));
  assert.ok(ZIWEI_PRIMARY_SOURCE_BLOCKERS.includes('scopeChangQuKuiYue'));
});
