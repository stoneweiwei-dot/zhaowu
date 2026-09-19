import { test, expect } from '@playwright/test';

test('report keeps one answer, one prose column and collapsed technical evidence on iPhone', async ({page}) => {
  await page.route('**/rest/v1/**', route => route.fulfill({status:503,body:'offline-test'}));
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.evaluate(async () => {
    const actionsPath='/src/lib/actions.ts';
    const storePath='/src/lib/store.ts';
    const {analyzeLife}=await import(actionsPath);
    const {useAppStore}=await import(storePath);
    const r=await analyzeLife({data:{year:1988,month:10,day:4,hour:4,minute:40,timeUnknown:false,gender:'male',relation:'same',city:{name:'三明',country:'中國',display:'福建三明',latitude:26.263,longitude:117.638,timezone:'Asia/Shanghai'},ziPolicy:'midnight',useTrueSolar:true,locale:'zh-Hant',question:'我的天賦是什麼？'}});
    useAppStore.getState().setCurrent(r);
  });
  const later=page.getByRole('button',{name:'稍後再說',exact:true});
  if(await later.isVisible()) await later.click();
  await expect(page.locator('[data-primary-answer]')).toContainText('學懂複雜方法');
  await page.getByRole('button',{name:'查看完整分析',exact:true}).click();
  await expect(page.locator('[data-primary-answer]')).toHaveCount(0);
  const report=page.locator('.zhaowu-focused-report');
  await expect(report.locator('.zhaowu-direct-answer')).toContainText('學懂複雜方法');
  await expect(report.locator('.zhaowu-answer-meta')).toHaveCount(0);
  await expect(report.locator('[data-report-evidence]')).not.toHaveAttribute('open','');
  const geometry=await report.locator('.zhaowu-decision-card').evaluateAll(cards => cards.map(c => ({x:c.getBoundingClientRect().x,width:c.getBoundingClientRect().width})));
  expect(geometry.length).toBeGreaterThan(1);
  expect(new Set(geometry.map(c=>Math.round(c.x))).size).toBe(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
  await expect(report).not.toContainText('判斷把握');
  await report.screenshot({path:test.info().outputPath('report-phone.png')});
});
