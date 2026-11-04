import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import handler from '../api/owner-music-write.js';
import { OWNER_COOKIE, ownerDeviceCookieValue, ownerCookieValue } from '../lib/owner-session-cookie.js';
import { clearOwnerDeviceCache } from '../lib/owner-auth.js';
import { MANIFEST_PATH } from '../lib/owner-music-public.js';

const secret='synthetic-owner-password-123';
const device='3f2b8c1e-5d4a-4e7b-9c10-a1b2c3d4e5f6';
const env={ ZHAOWU_OWNER_BRIDGE_SECRET:'synthetic-bridge-secret-0123456789', ZHAOWU_OWNER_KEY_SHA256:createHash('sha256').update(secret).digest('hex'), ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN:'synthetic-token-0123456789' };
const response = (body, status=200) => new Response(JSON.stringify(body), {status,headers:{'content-type':'application/json'}});
const req = (cookie, method='POST', origin='https://zhao-wu.com') => ({method,headers:{origin,host:'zhao-wu.com',cookie: cookie ? `${OWNER_COOKIE}=${encodeURIComponent(cookie)}`:'','content-type':'audio/mpeg','x-zhaowu-music-name':'test.mp3'},body:Buffer.from('ID3 test fixture')});

test('music uploads require a validated owner, deny revoked devices and cross-origin requests', async () => {
 const old=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]])); Object.assign(process.env,env);
 const original=globalThis.fetch; let active=true; let writes=0; let temporaryFailure=true;
 globalThis.fetch=async (url,init={})=>{
  const u=String(url);
  if(u.includes('/functions/v1/zhaowu-owner-data')) return response({ok:true,active});
  if(u.includes('/git/refs/heads/') && !init.method) return response({object:{sha:'a'.repeat(40)}});
  if(u.includes('/git/commits/') && !init.method) return response({tree:{sha:'b'.repeat(40)}});
  if(u.includes('/git/trees/') && !init.method) return response({tree:[{path:MANIFEST_PATH,mode:'100644',type:'blob',sha:'c'.repeat(40)},{path:'public/audio/tracks/old.mp3',mode:'100644',type:'blob',sha:'e'.repeat(40)}]});
  if(u.includes('/git/blobs/') && !init.method) return response({encoding:'base64',content:Buffer.from(JSON.stringify({version:1,tracks:[{id:'track-a',name:'Old',filename:'old.mp3',enabled:false,contentType:'audio/mpeg',fileSize:20}]})).toString('base64')});
  if(init.method==='POST'||init.method==='PATCH'){writes++;if(u.endsWith('/git/blobs') && temporaryFailure){temporaryFailure=false;return response({},502);}return response({sha:'d'.repeat(40)});}
  throw new Error(`unexpected mock request ${u}`);
 };
 try {
  const deviceCookie=ownerDeviceCookieValue(device,{env});
  const passwordCookie=ownerCookieValue(secret,{env});
  for(const cookie of [deviceCookie,passwordCookie]) {clearOwnerDeviceCache();const res=await handler(req(cookie)); assert.equal(res.status,200,JSON.stringify(await res.clone().json()));assert.equal((await res.json()).uploaded,true);}
  clearOwnerDeviceCache();
  const chunk=req(deviceCookie); Object.assign(chunk.headers,{"x-zhaowu-music-upload-id":"upload1234","x-zhaowu-music-chunk-index":"0","x-zhaowu-music-chunk-total":"2"});
  const chunkResult=await handler(chunk); assert.equal(chunkResult.status,200); assert.equal((await chunkResult.json()).pending,true);
  const change=(method,body)=>({method,headers:{origin:'https://zhao-wu.com',host:'zhao-wu.com',cookie:`${OWNER_COOKIE}=${encodeURIComponent(deviceCookie)}`},body});
  for(const [method,body] of [['PATCH',{id:'track-a',action:'rename',name:'Changed'}],['PATCH',{id:'track-a'}],['DELETE',{id:'track-a'}]]) {
    clearOwnerDeviceCache();
    const changed=await handler(change(method,body));
    assert.equal(changed.status,200,JSON.stringify(await changed.clone().json()));
  }
  const before=writes;
  clearOwnerDeviceCache(); active=false; assert.equal((await handler(req(deviceCookie))).status,401);
  clearOwnerDeviceCache(); active=true; assert.equal((await handler(req(''))).status,401);
  assert.equal((await handler(req(deviceCookie,'POST','https://evil.invalid'))).status,403);
  assert.equal((await handler(req(deviceCookie,'DELETE'))).status,401);
  assert.equal(writes,before);
  clearOwnerDeviceCache();globalThis.fetch=async()=>{throw new Error('offline')};assert.equal((await handler(req(deviceCookie))).status,401);
 } finally {globalThis.fetch=original;clearOwnerDeviceCache();for(const [k,v] of Object.entries(old)) if(v===undefined)delete process.env[k];else process.env[k]=v;}
});
