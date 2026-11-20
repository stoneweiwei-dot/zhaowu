import assert from 'node:assert/strict';
import test from 'node:test';

// Synthetic HTTP responses only: never create accounts, send mail or contact Production.
const saved={fetch:globalThis.fetch,window:globalThis.window,localStorage:globalThis.localStorage};
const storage=new Map();
const events=new EventTarget();
globalThis.window=Object.assign(events,{location:{protocol:'https:',hostname:'zhao-wu.com',origin:'https://zhao-wu.com'}});
globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const {loginVisitor,registerVisitor,requestVisitorPasswordReset,logoutVisitor,VisitorAuthError}=await import('../src/lib/auth/visitor.ts');
test.after(()=>{for(const [key,value] of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
const response=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});

test('wrong password response becomes the localized BAD_CREDENTIALS error code',async()=>{
 globalThis.fetch=async (_url,init)=>{assert.ok(init.signal instanceof AbortSignal);return response(400,{error_description:'Invalid login credentials'});};
 await assert.rejects(loginVisitor('synthetic@example.invalid','synthetic-password'),e=>e instanceof VisitorAuthError&&e.code==='BAD_CREDENTIALS');
});

test('registration retains known validation and existing-email errors',async()=>{
 for(const code of ['INVALID_EMAIL','INVALID_PASSWORD','EMAIL_EXISTS','RATE_LIMITED']) {
  globalThis.fetch=async(_url,init)=>{assert.ok(init.signal instanceof AbortSignal);return response(400,{error:code});};
  await assert.rejects(registerVisitor('synthetic@example.invalid','synthetic-password',''),e=>e instanceof VisitorAuthError&&e.code===code);
 }
});

test('recovery success resolves and retains the canonical member callback',async()=>{
 let requested;
 globalThis.fetch=async(url,init)=>{requested=new URL(url);assert.ok(init.signal instanceof AbortSignal);return response(200,{});};
 await requestVisitorPasswordReset('synthetic@example.invalid');
 assert.equal(requested.pathname,'/sb/auth/v1/recover');
 assert.equal(requested.searchParams.get('redirect_to'),'https://zhao-wu.com/member?mode=recovery');
});

test('network aborts surface as NETWORK for all three member actions',async()=>{
 globalThis.fetch=async()=>{throw new DOMException('synthetic timeout','AbortError');};
 for(const run of [()=>loginVisitor('synthetic@example.invalid','synthetic-password'),()=>registerVisitor('synthetic@example.invalid','synthetic-password',''),()=>requestVisitorPasswordReset('synthetic@example.invalid')]) {
  await assert.rejects(run(),e=>e instanceof VisitorAuthError&&e.code==='NETWORK');
 }
});

test('successful sign-in still saves the visitor session and dispatches its change event',async()=>{
 let count=0;const onChange=()=>count++;window.addEventListener('zhaowu-visitor-change',onChange);
 const session={access_token:'synthetic-access',refresh_token:'synthetic-refresh',expires_in:3600,token_type:'bearer',user:{id:'synthetic-id',email:'synthetic@example.invalid'}};
 globalThis.fetch=async()=>response(200,session);
 try {const result=await loginVisitor('synthetic@example.invalid','synthetic-password');assert.equal(result.user.id,'synthetic-id');assert.equal(count,1);assert.ok(storage.has('zhaowu.supabase.session.v1'));}finally{window.removeEventListener('zhaowu-visitor-change',onChange);storage.clear();}
});


test('visitor sign-out clears only its session and preserves the selected language',async()=>{
 storage.set('zhaowu.display-language','zh-Hans');
 storage.set('zhaowu.supabase.session.v1',JSON.stringify({access_token:'synthetic-access',refresh_token:'synthetic-refresh',user:{id:'synthetic-id'}}));
 globalThis.fetch=async()=>response(200,{});
 await logoutVisitor();
 assert.equal(storage.has('zhaowu.supabase.session.v1'),false);
 assert.equal(storage.get('zhaowu.display-language'),'zh-Hans');
 storage.clear();
});
