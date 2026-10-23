import assert from "node:assert/strict";
import test from "node:test";
import {handleOwnerData} from "../api/owner-data.js";
function fakeResponse(){return {code:200,body:null,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(n){this.code=n;return this},json(v){this.body=v;return this}}}
test("diagnostic touches read-only Edge actions and returns only sanitized status codes",async()=>{
 const oldFetch=globalThis.fetch, keys=["SUPABASE_URL","ZHAOWU_OWNER_BRIDGE_SECRET","ZHAOWU_SOCIAL_QUEUE_SECRET","SUPABASE_SERVICE_ROLE_KEY"];
 const save=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 process.env.SUPABASE_URL="https://example.supabase.co";
 process.env.ZHAOWU_OWNER_BRIDGE_SECRET="TEST_ONLY_NOT_REAL_BRIDGE_0123456789";
 process.env.ZHAOWU_SOCIAL_QUEUE_SECRET="TEST_ONLY_NOT_REAL_SOCIAL_QUEUE_0123456789";
 process.env.SUPABASE_SERVICE_ROLE_KEY="TEST_ONLY_NOT_REAL_SERVICE_KEY";
 const calls=[];
 globalThis.fetch=async(url,init)=>{
   const action=init?.body?JSON.parse(init.body).action:null;
   calls.push({url,action,method:init?.method||"GET"});
   const error = url.includes("zhaowu-owner-promo")?"OWNER_UNAUTHORIZED":url.includes("zhaowu-owner-articles")?"BRIDGE_UNAUTHORIZED":action==="owner.device.credential"?"INVALID_CREDENTIAL_ID":null;
   if(error)return new Response(JSON.stringify({ok:false,error}),{status:error==="INVALID_CREDENTIAL_ID"?400:401});
   if(url.includes("zhaowu-social-queue"))return new Response(JSON.stringify({ok:true,enabled:false}),{status:200});
   return new Response(JSON.stringify([{key:"x"}]),{status:200});
 };
 try{
   const res=fakeResponse();
   await handleOwnerData({method:"GET",url:"/api/owner-data?view=ops-health",query:{view:"ops-health"}},res);
   assert.equal(res.code,200);
   assert.deepEqual(Object.keys(res.body).sort(),["articles","device","diagnosticOnly","ok","promo","queue","serviceKey"].sort());
   assert.equal(res.body.device.code,"INVALID_CREDENTIAL_ID");
   assert.equal(res.body.promo.code,"OWNER_UNAUTHORIZED");
   assert.equal(res.body.articles.code,"BRIDGE_UNAUTHORIZED");
   assert.equal(res.body.queue.code,"OK");
   assert.equal(res.body.serviceKey.code,"OK");
   assert.equal(calls.length,5);
   assert.ok(calls.every(x=>x.action===null||["promo.list","article.list","owner.device.credential","settings.get"].includes(x.action)));
   assert.ok(!JSON.stringify(res.body).includes("TEST_ONLY_NOT_REAL"));
 }finally{
   globalThis.fetch=oldFetch;
   for(const k of keys){if(save[k]===undefined)delete process.env[k];else process.env[k]=save[k]}
 }
});
