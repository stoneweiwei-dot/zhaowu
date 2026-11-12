/** node scripts/seo-pr1039-curl.mjs PREVIEW_ORIGIN [local]
 * Uses curl for every request. Local mode is explicitly a router simulation.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { appendFileSync } from 'node:fs';
import { parseLanguagePath } from '../src/lib/language-routing.js';
const exec = promisify(execFile);
const origin = new URL(process.argv[2]).origin;
if (['zhao-wu.com', 'stone-zhaowu-official.vercel.app'].includes(new URL(origin).hostname)) throw Error('Preview/local only');
const output = '/workspace/codex-logs/seo-pr1039-curl-20261112.txt';
const log = '/workspace/codex-logs/seo-multilang-pr-20261112.log';
function report(s) { console.log(s); for (const p of [output, log]) appendFileSync(p, s + '\n'); }
async function curl(url) {
 try { const {stdout} = await exec('curl', ['--silent','--show-error','--location','--max-time','45','--write-out','\n%{http_code}',url], {maxBuffer: 12*1024*1024}); const i=stdout.lastIndexOf('\n'); return {status:Number(stdout.slice(i+1)), body:stdout.slice(0,i)}; }
 catch { return {status:0,body:''}; }
}
const locs = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&'));
const production = await curl('https://zhao-wu.com/sitemap.xml');
const sitemap = await curl(origin+'/sitemap.xml');
report(`\n${new Date().toISOString()} ${process.argv[3] === 'local' ? 'LOCAL SIMULATION ONLY' : 'LIVE PREVIEW'} ${origin}`);
let failed = false;
for (const [label,urls,count] of [['Production zh-Hant sitemap',locs(production.body),33],['New sitemap',locs(sitemap.body),330]]) {
 const rows = [];
 for (let i=0;i<urls.length;i+=8) await Promise.all(urls.slice(i,i+8).map(async url=>{ const path=new URL(url).pathname; const r=await curl(origin+path); rows.push({path,status:r.status}); }));
 rows.sort((a,b)=>a.path.localeCompare(b.path));
 report(`${label}\n| Path | HTTP |\n| --- | --- |\n`+rows.map(r=>`| ${r.path} | ${r.status} |`).join('\n'));
 const bad=rows.filter(r=>r.status!==200); report(`${label}: ${rows.filter(r=>r.status===200).length}/${rows.length} HTTP 200; expected ${count}; failures: ${JSON.stringify(bad)}`);
 if(bad.length || rows.length!==count) failed=true;
}
const dynamic=['/en/login','/ja/login','/en/account','/en/member','/en/history','/en/mythic-atlas/some-missing-entry','/en/?report=preview-check#report','/ja/quiz/divine-affinity?utm_source=zhaowu&utm_medium=share','/en/#birth-form','/en/fun-tests?test=animal','/ja/fun-tests/earth-online?utm_source=zhaowu&utm_medium=share','/en/auth/callback?preview-check=1','/en/?guide=1','/xx/about','/zh-hant/about'];
const paths=new Set(locs(sitemap.body).map(u=>new URL(u).pathname));
for (const path of dynamic) {
 const r=await curl(origin+path); const parsed=new URL(origin+path); const lang=parseLanguagePath(parsed.pathname).language;
 const shell=/<script[^>]+type="module"/.test(r.body) && r.body.includes('id="root"');
 const illegal=/^\/(xx|zh-hant)\//.test(path); const ok=illegal ? r.status===404 : r.status===200 && shell && r.body.includes(`<html lang="${lang}">`);
 report(`${ok?'PASS':'FAIL'} ${path}: HTTP ${r.status}; ${illegal?'illegal prefix 404':paths.has(parsed.pathname)?'prerendered':'SPA fallback'}; SPA shell=${shell}; expected lang=${lang}. Hash remains browser-side.`);
 if(!ok) failed=true;
}
if(failed) process.exitCode=1;
