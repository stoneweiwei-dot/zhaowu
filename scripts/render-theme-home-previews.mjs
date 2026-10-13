import { readThemeCatalog } from './lib/theme-catalog.mjs';
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('public/theme-previews',{recursive:true});
// Run against a local production build; every service call is mocked.
const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE_PATH ? {executablePath:process.env.CHROME_EXECUTABLE_PATH} : {}),args:['--no-sandbox']});
for(const skin of ['none',...readThemeCatalog().map(s=>s.id)]) {
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,locale:'zh-TW',reducedMotion:'reduce'});
 await context.route('**/*',route=>{
 const u=new URL(route.request().url());
 if(u.origin==='http://127.0.0.1:4173'&&!u.pathname.startsWith('/api/'))return route.continue();
 if(u.hostname.includes('fonts.'))return route.continue();
 const data=u.pathname==='/api/owner-data'&&u.searchParams.get('view')==='site-skin'?{configured:true,skin}:u.pathname==='/api/owner-session'?{authenticated:false}:[];
 return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await context.addInitScript(()=>{localStorage.setItem('zhaowu.display-language','zh-Hant');localStorage.setItem('zhaowu.intro.seen-at.public.v2',String(Date.now()));});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');await page.locator('.zw-painted-home').waitFor();
 await page.waitForFunction(skin=>skin==='none' ? !document.documentElement.hasAttribute('data-zws') : document.documentElement.dataset.zws===skin,skin);
 await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>Promise.all([...document.querySelectorAll('.zw-painted-home img')].map(img=>img.decode())));
 if(errors.length)throw new Error(`${skin}: ${errors.join('; ')}`);
 await page.locator('.zw-painted-home').screenshot({path:`public/theme-previews/${skin}.jpg`,type:'jpeg',quality:88,animations:'disabled'});
 console.log(skin,await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,images:[...document.querySelectorAll('.zw-painted-home img')].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)})));
 await context.close();
}
await browser.close();
