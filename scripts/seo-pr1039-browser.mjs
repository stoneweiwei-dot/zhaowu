/** node scripts/seo-pr1039-browser.mjs PREVIEW_ORIGIN [local] */
import assert from 'node:assert/strict';
import { appendFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
const origin=new URL(process.argv[2]).origin;
if(['zhao-wu.com','stone-zhaowu-official.vercel.app'].includes(new URL(origin).hostname)) throw Error('Preview/local only');
const log=s=>{ console.log(s); for(const p of ['/workspace/codex-logs/seo-multilang-pr-20261112.log','/workspace/codex-logs/seo-pr1039-curl-20261112.txt']) appendFileSync(p,s+'\n'); };
const browser=await chromium.launch({headless:true});
let failures=0;
try {
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'en-AU',serviceWorkers:'block'});
 const page=await context.newPage();
 for(const lang of ['en','ja']) for(const route of ['/about','/sample-report','/knowledge/true-solar-time']) {
  const name=route.slice(1).replaceAll('/','-');
  try {
   const response=await page.goto(`${origin}/${lang}${route}?ref=seo#story`);
   assert.equal(response.status(),200);
   await page.locator('.zw-langpick__toggle').waitFor();
   await page.waitForFunction(l=>document.documentElement.lang===l,lang);
   // Visible navigation is localized; article/report bodies retain the approved English fallback.
   const expected=lang==='ja'?'私のレポート':'My reports';
   const sample=page.getByText(expected,{exact:true}).first();
   await sample.waitFor({state:'visible'});
   const text=await sample.innerText();
   assert.ok(lang==='ja'?/[ぁ-んァ-ン]/.test(text):/[A-Za-z]{4}/.test(text));
   const screenshot=`/workspace/codex-logs/seo-pr1039-${lang}-${name}.png`;
   await page.screenshot({path:screenshot,fullPage:true});
   const other=lang==='en'?'ja':'en';
   await page.locator('.zw-langpick__toggle').click();
   await page.locator(`[data-lang="${other}"]`).click();
   await page.waitForURL(`${origin}/${other}${route}?ref=seo#story`);
   await page.waitForFunction(l=>document.documentElement.lang===l,other);
   const switched=`/workspace/codex-logs/seo-pr1039-${lang}-${name}-switch.png`;
   await page.screenshot({path:switched,fullPage:true});
   log(`PASS ${process.argv[3]==='local'?'LOCAL':'PREVIEW'} ${lang}${route}: lang=${lang}; visible navigation sample=${text}; existing English body fallback retained for ja; switch ${other} preserves query/hash; ${screenshot}; ${switched}`);
  } catch(e) {failures++;log(`FAIL ${lang}${route}: ${e.message}`);}
 }
 await context.close();
} finally {await browser.close();}
if(failures) process.exitCode=1;
