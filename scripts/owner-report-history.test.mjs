import assert from 'node:assert/strict';
import test from 'node:test';
import { listReportPage, ownerReportRow } from '../supabase/functions/zhaowu-owner-data/reports.mjs';
import { resolveReportAccess } from '../src/lib/report-access.ts';
import { saveLocalReport, readLocalReports, markReportCloudSaved, removeLocalReport } from '../src/lib/local-report-history.ts';
import ownerDataHandler from '../api/owner-data.js';

const result = { id:'11111111-1111-4111-8111-111111111111', question:'如何安排工作？', chart:{pillars:Array.from({length:4},()=>({ganZhi:'甲子'}))}, reading:{directAnswer:'先整理現況。'} };
function memoryStorage() { const data=new Map(); return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}; }

test('owner access requires a successful server session and never Stripe', async () => {
 const original=globalThis.fetch; const calls=[];
 try {
  globalThis.fetch=async(url, init)=>{calls.push({url,init});return Response.json({authenticated:true});};
  assert.deepEqual(await resolveReportAccess('ziwei'),{level:'bundle',pending:false,owner:true});
  assert.equal(calls.length,1); assert.equal(calls[0].url,'/api/owner-session');
  assert.equal(calls[0].init.credentials,'include'); assert.equal(calls[0].init.cache,'no-store');
  for (const body of [{authenticated:false},{authenticated:'true'},{}]) {
   globalThis.fetch=async()=>Response.json(body);
   assert.equal((await resolveReportAccess('ziwei')).level,'quick');
  }
  globalThis.fetch=async()=>{throw new Error('offline');};
  assert.equal((await resolveReportAccess('ziwei')).owner,false);
 } finally {globalThis.fetch=original;}
});

test('report archive remains inaccessible without an owner cookie, including save', async()=>{
 for(const action of ['report.list','report.get','report.save']) {
  const response=await ownerDataHandler(new Request('https://stone-zhaowu-official.vercel.app/api/owner-data',{method:'POST',headers:{host:'stone-zhaowu-official.vercel.app',origin:'https://stone-zhaowu-official.vercel.app','content-type':'application/json'},body:JSON.stringify({action,result})}));
  assert.equal(response.status,401);
 }
});

test('raw pagination reaches older customer records after a whole QA page',async()=>{
 const rows=Array.from({length:103},(_,id)=>({id,qa:id<50})); const orders=[];
 const service={from:()=>({select:()=>({order(field){orders.push(field);return this;},range:async(start,end)=>({data:rows.slice(start,end+1)})})})};
 const first=await listReportPage(service,{},'*',r=>r.qa);
 assert.equal(first.items.length,0); assert.equal(first.nextOffset,50);
 const second=await listReportPage(service,{offset:first.nextOffset},'*',r=>r.qa);
 assert.equal(second.items.length,50); assert.equal(second.items[0].id,50); assert.equal(second.nextOffset,100);
 const last=await listReportPage(service,{offset:second.nextOffset},'*',r=>r.qa);
 assert.equal(last.items.length,3); assert.equal(last.nextOffset,null);
 assert.deepEqual(orders.slice(0,2),['created_at','id']);
 await assert.rejects(listReportPage(service,{offset:Infinity},'*',()=>false),/INVALID_REPORT_OFFSET/);
});

test('owner snapshots use valid database access enums and ignore supplied payment or identity',()=>{
 const row=ownerReportRow({result,sections:[],user_id:'victim',payment_status:'paid',access_mode:'paid'});
 assert.equal(row.user_id,null); assert.equal(row.access_mode,'member'); assert.equal(row.payment_status,'not_required');
 assert.equal(row.payment_tier,'free'); assert.equal(row.engine_snapshot,result);
 assert.throws(()=>ownerReportRow({result:{...result,id:'bad'}}),/INVALID_REPORT/);
 assert.throws(()=>ownerReportRow({result:{...result,question:''}}),/INVALID_REPORT/);
 assert.throws(()=>ownerReportRow({result:{...result,question:'a'.repeat(401)}}),/INVALID_REPORT/);
});

test('device history restores full snapshots, deduplicates and preserves cloud save state',()=>{
 const storage=memoryStorage();
 assert.equal(saveLocalReport(result,storage),true); markReportCloudSaved(result.id,storage);
 saveLocalReport({...result,question:'修訂的問題'},storage);
 const saved=readLocalReports(storage);
 assert.equal(saved.length,1); assert.equal(saved[0].cloudSaved,true); assert.equal(saved[0].result.question,'修訂的問題');
 const other={...result,id:'22222222-2222-4222-8222-222222222222'};saveLocalReport(other,storage);
 removeLocalReport(result.id,storage); assert.deepEqual(readLocalReports(storage).map(r=>r.result.id),[other.id]);
 const previous=storage.getItem('zhaowu.report-history.v1');
 storage.setItem=()=>{throw new Error('quota');};
 assert.equal(saveLocalReport(result,storage),false); assert.equal(storage.getItem('zhaowu.report-history.v1'),previous);
 assert.deepEqual(readLocalReports({getItem:()=>'{broken'}),[]);
});
