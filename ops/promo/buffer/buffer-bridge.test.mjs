import test from 'node:test';
import assert from 'node:assert/strict';
import {sydneyTimeToUtc,buildPostMutation,validateInput,validateTargetChannels,draftPlan} from './buffer-bridge.mjs';
const base={timezone:'Australia/Sydney',publish_time:'08:45',targets:{facebook:{enabled:true,channel_id:'fb001',expected_name:'昭梧 Zhaowu'},threads:{enabled:false,channel_id:'',expected_name:'fkofflove'},instagram:{enabled:false,channel_id:'',expected_name:'fkofflove'}}};
const post={local_date:'2026-11-03',captions:{facebook:'測試文字',threads:'測試Threads',instagram:'測試Instagram'},image_url:'',image_alt:'',image_aspect_ratio:'4:5'};
test('Sydney AEDT date converts to previous UTC date',()=>assert.equal(sydneyTimeToUtc('2026-11-03','08:45'),'2026-11-02T21:45:00.000Z'));
test('Sydney AEST winter date converts to previous UTC date',()=>assert.equal(sydneyTimeToUtc('2026-06-03','08:45'),'2026-06-02T22:45:00.000Z'));
test('invalid dates blocked',()=>assert.throws(()=>sydneyTimeToUtc('2026-11-03','99:99')));
test('IG text-only auto publishing blocked',()=>assert.throws(()=>validateInput({...base,targets:{...base.targets,instagram:{enabled:true,channel_id:'ig',expected_name:'fkofflove'}}},post),/Instagram requires/));
test('queue post matches approved Buffer channel',()=>{let p=draftPlan(base,post); assert.equal(p.length,1);validateTargetChannels(p,[{id:'fb001',service:'facebook',name:'昭梧 Zhaowu',displayName:'昭梧 Zhaowu',isQueuePaused:false,type:'Page',isDisconnected:false,isLocked:false}]);});
test('wrong account rejected',()=>{let p=draftPlan(base,post);assert.throws(()=>validateTargetChannels(p,[{id:'fb001',service:'facebook',name:'個人帳號',displayName:'個人帳號',isQueuePaused:false,type:'Page',isDisconnected:false,isLocked:false}]),/mismatch/)});
test('GraphQL escapes quotes and injects correct FB metadata',()=>{let q=buildPostMutation({channel:'facebook',text:'測試"escape',dueAt:'2026-11-02T21:45:00.000Z'});assert.match(q,/type: post/);assert.match(q,/測試\\"escape/);assert.match(q,/customScheduled/);});
test('empty destination group fails-closed in live mode',()=>{const cfg={...base,targets:Object.fromEntries(Object.entries(base.targets).map(([k,v])=>[k,{...v,enabled:false}]))}; assert.equal(draftPlan(cfg,post).length,0);});
test('Instagram with image includes alt text and posting metadata',()=>{const q=buildPostMutation({channel:'instagram',text:'藝術文化',dueAt:'2026-11-02T21:45:00.000Z',imageUrl:'https://zhao-wu.com/approved.jpg',imageAlt:'宣紙上的宋式山水'}); assert.match(q,/shouldShareToFeed: true/);assert.match(q,/altText:/); assert.match(q,/approved\.jpg/);});

test('personal Facebook profile is blocked even if named correctly',()=>{const p=draftPlan(base,post);assert.throws(()=>validateTargetChannels(p,[{id:'fb001',service:'facebook',name:'昭梧 Zhaowu',type:'Profile'}]),/Page/);});
test('expired or locked channels are blocked',()=>{const p=draftPlan(base,post);assert.throws(()=>validateTargetChannels(p,[{id:'fb001',service:'facebook',name:'昭梧 Zhaowu',type:'Page',isLocked:true}]),/disconnected or locked/);});
test('Threads 500 character limit is enforced',()=>{const cfg={...base,targets:{...base.targets,facebook:{...base.targets.facebook,enabled:false},threads:{enabled:true,channel_id:'thread',expected_name:'stone1004'}}};assert.throws(()=>validateInput(cfg,{...post,captions:{...post.captions,threads:'A'.repeat(501)}}),/too long/);});
test('Instagram requires verified feed-compatible image',()=>{const cfg={...base,targets:{instagram:{enabled:true,channel_id:'ig',expected_name:'stone1004'}}};assert.throws(()=>validateInput(cfg,{...post,image_url:'https://zhao-wu.com/art.webp',image_aspect_ratio:'9:16'}),/1:1 or 4:5/);assert.equal(typeof validateInput(cfg,{...post,image_url:'https://zhao-wu.com/art.webp',image_aspect_ratio:'4:5',image_alt:'一張原創山水畫'}),'string');});

test('deduplicate across Sydney day despite different UTC instant', async()=>{
  const { checkScheduled } = await import('./buffer-bridge.mjs');
  const mock=async()=>new Response(JSON.stringify({data:{posts:{edges:[{node:{id:'existing',channelId:'fb001',dueAt:'2026-11-02T23:00:00.000Z',text:'a different post'}}],pageInfo:{hasNextPage:false}}}}));
  const existing=await checkScheduled('fake-but-not-real','org','fb001','2026-11-02T21:45:00.000Z',mock);
  assert.equal(existing?.id,'existing');
});
test('stop rather than create if scheduled post query is incomplete', async()=>{
  const { checkScheduled }=await import('./buffer-bridge.mjs');
  const mock=async()=>new Response(JSON.stringify({data:{posts:{edges:[],pageInfo:{hasNextPage:true}}}}));
  await assert.rejects(()=>checkScheduled('fake','org','fb001','2026-11-02T21:45:00.000Z',mock),/More than 100/);
});
