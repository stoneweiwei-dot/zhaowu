import test from 'node:test';
import assert from 'node:assert/strict';
import {sydneyTimeToUtc,buildPostMutation,validateInput,validateTargetChannels,draftPlan} from './buffer-bridge.mjs';
const base={timezone:'Australia/Sydney',publish_time:'08:45',targets:{facebook:{enabled:true,channel_id:'fb001',expected_name:'昭梧 Zhaowu',expected_service_id:'61595856501708'},threads:{enabled:false,channel_id:'',expected_name:'fkofflove'},instagram:{enabled:false,channel_id:'',expected_name:'fkofflove'}}};
const post={local_date:'2026-11-03',captions:{facebook:'測試文字',threads:'測試Threads',instagram:'測試Instagram'},image_url:'',image_alt:'',image_aspect_ratio:'4:5'};
test('Sydney AEDT date converts to previous UTC date',()=>assert.equal(sydneyTimeToUtc('2026-11-03','08:45'),'2026-11-02T21:45:00.000Z'));
test('Sydney AEST winter date converts to previous UTC date',()=>assert.equal(sydneyTimeToUtc('2026-06-03','08:45'),'2026-06-02T22:45:00.000Z'));
test('invalid dates blocked',()=>assert.throws(()=>sydneyTimeToUtc('2026-11-03','99:99')));
test('IG text-only auto publishing blocked',()=>assert.throws(()=>validateInput({...base,targets:{...base.targets,instagram:{enabled:true,channel_id:'ig',expected_name:'fkofflove'}}},post),/Instagram requires/));
test('queue post matches approved Buffer channel',()=>{let p=draftPlan(base,post); assert.equal(p.length,1);validateTargetChannels(p,[{id:'fb001',service:'facebook',name:'昭梧 Zhaowu',displayName:'昭梧 Zhaowu',isQueuePaused:false,type:'Page',serviceId:'61595856501708',isDisconnected:false,isLocked:false}]);});
test('wrong account rejected',()=>{let p=draftPlan(base,post);assert.throws(()=>validateTargetChannels(p,[{id:'fb001',service:'facebook',name:'個人帳號',displayName:'個人帳號',isQueuePaused:false,type:'Page',serviceId:'61595856501708',isDisconnected:false,isLocked:false}]),/mismatch/)});
test('GraphQL escapes quotes and injects correct FB metadata',()=>{let q=buildPostMutation({channel:'facebook',text:'測試"escape',dueAt:'2026-11-02T21:45:00.000Z'});assert.match(q,/type: post/);assert.match(q,/測試\\"escape/);assert.match(q,/customScheduled/);});
test('empty destination group fails-closed in live mode',()=>{const cfg={...base,targets:Object.fromEntries(Object.entries(base.targets).map(([k,v])=>[k,{...v,enabled:false}]))}; assert.equal(draftPlan(cfg,post).length,0);});
test('Instagram with image includes alt text and posting metadata',()=>{const q=buildPostMutation({channel:'instagram',text:'藝術文化',dueAt:'2026-11-02T21:45:00.000Z',imageUrl:'https://zhao-wu.com/approved.jpg',imageAlt:'宣紙上的宋式山水'}); assert.match(q,/shouldShareToFeed: true/);assert.match(q,/altText:/); assert.match(q,/approved\.jpg/);});

test('personal Facebook profile is blocked even if named correctly',()=>{const p=draftPlan(base,post);assert.throws(()=>validateTargetChannels(p,[{id:'fb001',service:'facebook',name:'昭梧 Zhaowu',type:'Profile',isQueuePaused:false,isDisconnected:false,isLocked:false}]),/Page/);});
test('expired or locked channels are blocked',()=>{const p=draftPlan(base,post);assert.throws(()=>validateTargetChannels(p,[{id:'fb001',service:'facebook',name:'昭梧 Zhaowu',type:'Page',isQueuePaused:false,isDisconnected:false,isLocked:true}]),/disconnected or locked/);});
test('Threads 500 character limit is enforced',()=>{const cfg={...base,targets:{...base.targets,facebook:{...base.targets.facebook,enabled:false},threads:{enabled:true,channel_id:'thread',expected_name:'stone1004'}}};assert.throws(()=>validateInput(cfg,{...post,captions:{...post.captions,threads:'A'.repeat(501)}}),/too long/);});
test('Instagram requires verified feed-compatible image',()=>{const cfg={...base,targets:{instagram:{enabled:true,channel_id:'ig',expected_name:'stone1004'}}};assert.throws(()=>validateInput(cfg,{...post,image_url:'https://zhao-wu.com/art.webp',image_aspect_ratio:'9:16'}),/1:1 or 4:5/);assert.equal(typeof validateInput(cfg,{...post,image_url:'https://zhao-wu.com/art.webp',image_aspect_ratio:'4:5',image_alt:'一張原創山水畫'}),'string');});

test('deduplicate across Sydney day despite different UTC instant', async()=>{
  const { checkScheduled } = await import('./buffer-bridge.mjs');
  const mock=async()=>new Response(JSON.stringify({data:{posts:{edges:[{node:{id:'existing',channelId:'fb001',dueAt:'2026-11-02T23:00:00.000Z',sentAt:null,status:'scheduled'}}],pageInfo:{hasNextPage:false}}}}));
  const existing=await checkScheduled('fake-but-not-real','org','fb001','2026-11-02T21:45:00.000Z',mock);
  assert.equal(existing?.id,'existing');
});
test('stop rather than create if scheduled post query is incomplete', async()=>{
  const { checkScheduled }=await import('./buffer-bridge.mjs');
  const mock=async()=>new Response(JSON.stringify({data:{posts:{edges:[],pageInfo:{hasNextPage:true}}}}));
  await assert.rejects(()=>checkScheduled('fake','org','fb001','2026-11-02T21:45:00.000Z',mock),/More than 100/);
});


test('query requests real channel type and safety fields', async()=>{
  const {readAccountChannels,validateTargetChannels}=await import('./buffer-bridge.mjs'); let query='';
  const mock=async(_url,request)=>{const q=JSON.parse(request.body).query; if (q.includes('organizations')) return new Response(JSON.stringify({data:{account:{organizations:[{id:'org',name:'Mock'}]}}})); query=q; return new Response(JSON.stringify({data:{channels:[{id:'fb001',service:'facebook',name:'昭梧 Zhaowu',type:'page',serviceId:'61595856501708',isQueuePaused:false,isDisconnected:false,isLocked:false}]}}));};
  const channels=await readAccountChannels('fake',mock); validateTargetChannels(draftPlan(base,post),channels);
  for (const field of ['type','serviceId','isQueuePaused','isDisconnected','isLocked']) assert.match(query,new RegExp(`\\b${field}\\b`));
});
test('missing channel safety status and wrong external page id are rejected',()=>{
  const plan=draftPlan(base,post); const ch={id:'fb001',service:'facebook',name:'昭梧 Zhaowu',type:'page',serviceId:'61595856501708',isQueuePaused:false,isDisconnected:false,isLocked:false};
  const missing={...ch}; delete missing.isLocked; assert.throws(()=>validateTargetChannels(plan,[missing]),/missing isLocked/);
  assert.throws(()=>validateTargetChannels(plan,[{...ch,serviceId:'wrong'}]),/service ID mismatch/);
});
test('null or incomplete pagination fails closed',async()=>{
  const {checkScheduled}=await import('./buffer-bridge.mjs');
  for (const posts of [null,{edges:[]},{edges:[],pageInfo:{}}]) {
    const mock=async()=>new Response(JSON.stringify({data:{posts}}));
    await assert.rejects(()=>checkScheduled('fake','org','fb001','2026-11-02T21:45:00.000Z',mock),/Incomplete/);
  }
});
test('missing timestamp or unexpected post fails closed',async()=>{
  const {checkScheduled}=await import('./buffer-bridge.mjs');
  const mock=async()=>new Response(JSON.stringify({data:{posts:{edges:[{node:{id:'p',channelId:'fb001',status:'sent',dueAt:null,sentAt:null}}],pageInfo:{hasNextPage:false}}}}));
  await assert.rejects(()=>checkScheduled('fake','org','fb001','2026-11-02T21:45:00.000Z',mock),/Missing post timestamp/);
});
test('sentAt detects publication on target day even when dueAt was earlier',async()=>{
  const {checkScheduled}=await import('./buffer-bridge.mjs');let query='';
  const mock=async(_u,req)=>{query=JSON.parse(req.body).query;return new Response(JSON.stringify({data:{posts:{edges:[{node:{id:'p',channelId:'fb001',status:'sent',dueAt:'2026-11-01T21:00:00.000Z',sentAt:'2026-11-02T22:00:00.000Z'}}],pageInfo:{hasNextPage:false}}}}));};
  assert.equal((await checkScheduled('fake','org','fb001','2026-11-02T21:45:00.000Z',mock)).id,'p'); assert.doesNotMatch(query,/startDate|endDate/);
});
test('check preflight uses read-only GraphQL queries only',async()=>{
  const {inspectPlan}=await import('./buffer-bridge.mjs');const queries=[];
  const mock=async(_url,req)=>{const q=JSON.parse(req.body).query;queries.push(q); const data=q.includes('organizations')?{account:{organizations:[{id:'org',name:'Mock'}]}}:q.includes('channels(input')?{channels:[{id:'fb001',service:'facebook',name:'昭梧 Zhaowu',type:'page',serviceId:'61595856501708',isQueuePaused:false,isDisconnected:false,isLocked:false}]}:{posts:{edges:[],pageInfo:{hasNextPage:false}}};return new Response(JSON.stringify({data}));};
  assert.deepEqual(await inspectPlan({plan:draftPlan(base,post),token:'fake',fetchImpl:mock}),[{service:'facebook',channel_id:'fb001',existing:null}]);assert.equal(queries.length,3);assert.ok(queries.every(q=>q.startsWith('query')));
});
test('Instagram queue stays blocked before a network request',async()=>{
  const {enqueuePlan}=await import('./buffer-bridge.mjs');let called=false;
  await assert.rejects(()=>enqueuePlan({plan:[{service:'instagram'}],token:'fake',fetchImpl:()=>{called=true}}),/Instagram enqueue blocked/);assert.equal(called,false);
});

test('CLI dry run rejects invalid enabled Instagram input',async()=>{
  const {mkdtempSync,writeFileSync,rmSync}=await import('node:fs');
  const {tmpdir}=await import('node:os'); const {join}=await import('node:path');
  const {spawnSync}=await import('node:child_process');
  const dir=mkdtempSync(join(tmpdir(),'zw-buffer-test-'));
  try {
    const config={timezone:'Australia/Sydney',publish_time:'08:45',targets:{instagram:{enabled:true,channel_id:'',expected_name:'stone1004'}}};
    writeFileSync(join(dir,'config.json'),JSON.stringify(config));writeFileSync(join(dir,'post.json'),JSON.stringify(post));
    const cli=spawnSync(process.execPath,['buffer-bridge.mjs','--dry-run',`--config=${join(dir,'config.json')}`,`--post=${join(dir,'post.json')}`],{encoding:'utf8',env:{PATH:process.env.PATH}});
    assert.notEqual(cli.status,0);assert.match(cli.stderr,/channel ID\/name required/);
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('CLI dry run accepts a complete enabled Facebook input without network',async()=>{
  const {mkdtempSync,writeFileSync,rmSync}=await import('node:fs');
  const {tmpdir}=await import('node:os');const {join}=await import('node:path');
  const {spawnSync}=await import('node:child_process');const dir=mkdtempSync(join(tmpdir(),'zw-buffer-test-'));
  try {
    writeFileSync(join(dir,'config.json'),JSON.stringify(base));writeFileSync(join(dir,'post.json'),JSON.stringify(post));
    const cli=spawnSync(process.execPath,['buffer-bridge.mjs','--dry-run',`--config=${join(dir,'config.json')}`,`--post=${join(dir,'post.json')}`],{encoding:'utf8',env:{PATH:process.env.PATH}});
    assert.equal(cli.status,0,cli.stderr);const result=JSON.parse(cli.stdout);assert.equal(result.liveWrites,false);assert.deepEqual(result.enabledTargets,['facebook']);
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('CLI --check reports existing Buffer post and exits nonzero without mutations',async()=>{
  const {mkdtempSync,writeFileSync,rmSync}=await import('node:fs');
  const {tmpdir}=await import('node:os'); const {join}=await import('node:path');
  const {spawnSync}=await import('node:child_process'); const dir=mkdtempSync(join(tmpdir(),'zw-buffer-test-'));
  try {
    writeFileSync(join(dir,'config.json'),JSON.stringify(base));writeFileSync(join(dir,'post.json'),JSON.stringify(post));
    writeFileSync(join(dir,'mock.mjs'),`globalThis.fetch=async (_url,request)=>{const q=JSON.parse(request.body).query;if(!q.startsWith('query'))throw Error('unexpected write');const data=q.includes('organizations')?{account:{organizations:[{id:'org',name:'mock'}]}}:q.includes('channels(input')?{channels:[{id:'fb001',service:'facebook',name:'昭梧 Zhaowu',type:'page',serviceId:'61595856501708',isQueuePaused:false,isDisconnected:false,isLocked:false}]}:{posts:{edges:[{node:{id:'duplicate',channelId:'fb001',status:'scheduled',dueAt:'2026-11-02T21:45:00.000Z',sentAt:null}}],pageInfo:{hasNextPage:false}}};return new Response(JSON.stringify({data}));};`);
    const cli=spawnSync(process.execPath,['--import',join(dir,'mock.mjs'),'buffer-bridge.mjs','--check',`--config=${join(dir,'config.json')}`,`--post=${join(dir,'post.json')}`],{encoding:'utf8',env:{PATH:process.env.PATH,BUFFER_API_KEY:'offline-test-only'}});
    assert.notEqual(cli.status,0);assert.equal(JSON.parse(cli.stdout).results[0].existing.id,'duplicate');assert.match(cli.stderr,/preflight blocked/);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
