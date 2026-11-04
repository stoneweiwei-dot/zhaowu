import test from 'node:test';
import assert from 'node:assert/strict';
import {saveOwnerMusicChunk, MANIFEST_PATH, SCRATCH_DIR, TRACK_DIR} from '../lib/owner-music-git.js';

const respond=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json'}});
test('final chunk publishes audio and removes only previously committed chunks',async()=>{
 const old=process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN;process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN='synthetic-token-1234567890';
 const original=globalThis.fetch, chunkPath=`${SCRATCH_DIR}/upload123/000.part`, blob='c'.repeat(40), manifest='d'.repeat(40);let treeRequest,uploaded=[];
 globalThis.fetch=async(url,init={})=>{
  const u=String(url),m=init.method||'GET';
  if(m==='GET'&&u.includes('/git/refs/'))return respond({object:{sha:'a'.repeat(40)}});
  if(m==='GET'&&u.includes('/git/commits/'))return respond({tree:{sha:'b'.repeat(40)}});
  if(m==='GET'&&u.includes('/git/trees/'))return respond({tree:[{path:chunkPath,type:'blob',mode:'100644',sha:blob},{path:MANIFEST_PATH,type:'blob',mode:'100644',sha:manifest}]});
  if(m==='GET'&&u.includes(`/git/blobs/${blob}`))return respond({encoding:'base64',content:Buffer.from('first').toString('base64')});
  if(m==='GET'&&u.includes(`/git/blobs/${manifest}`))return respond({encoding:'base64',content:Buffer.from('{"version":1,"tracks":[]}').toString('base64')});
  if(m==='POST'&&u.endsWith('/git/blobs')){uploaded.push(Buffer.from(JSON.parse(init.body).content,'base64'));return respond({sha:String(uploaded.length).repeat(40)});}
  if(m==='POST'&&u.endsWith('/git/trees')){treeRequest=JSON.parse(init.body);const invalid=treeRequest.tree.some(x=>x.sha===null&&x.path!==chunkPath);return invalid?respond({message:'Cannot delete missing path'},422):respond({sha:'e'.repeat(40)});}
  if(m==='POST'&&u.endsWith('/git/commits'))return respond({sha:'f'.repeat(40)});
  if(m==='PATCH'&&u.includes('/git/refs/'))return respond({});
  throw Error('Unexpected request '+m+' '+u);
 };
 try{
  const result=await saveOwnerMusicChunk({kind:'device',deviceId:'3f2b8c1e-5d4a-4e7b-9c10-a1b2c3d4e5f6'},{name:'test',ext:'.mp3',contentType:'audio/mpeg',buffer:Buffer.from('second'),uploadId:'upload123',chunkIndex:1,chunkTotal:2});
  assert.equal(result.tracks.length,1);assert.ok(uploaded.some(b=>b.equals(Buffer.from('firstsecond'))));
  assert.deepEqual(treeRequest.tree.filter(x=>x.sha===null).map(x=>x.path),[chunkPath]);assert.ok(treeRequest.tree.some(x=>x.path.startsWith(TRACK_DIR+'/')));
 }finally{globalThis.fetch=original;if(old===undefined)delete process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN;else process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN=old;}
});
