import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import login from '../api/owner-login.js';
import { OWNER_COOKIE, isValidOwnerSecret, ownerCookieValue, ownerSecretFromCookieValue, ownerSecretFromRequest } from '../lib/owner-session-cookie.js';
import { authorizeBridgeHeaders as dataAuth } from '../supabase/functions/zhaowu-owner-data/security.mjs';
import { authorizeBridgeHeaders as promoAuth } from '../supabase/functions/zhaowu-owner-promo/auth.mjs';
import { authorizeBridgeHeaders as articleAuth } from '../supabase/functions/zhaowu-owner-articles/auth.mjs';

const secret = 'synthetic-owner-secret-not-for-production';
const email = 'synthetic-owner@example.invalid';
const sha = value => createHash('sha256').update(value).digest('hex');
const env = {
  ZHAOWU_OWNER_KEY_SHA256: sha(secret),
  ZHAOWU_OWNER_ACCOUNT_SHA256: sha(email),
  ZHAOWU_OWNER_BRIDGE_SECRET: 'synthetic-bridge-key-0123456789abcdef',
};
const post = (account, password) => login(new Request('https://zhao-wu.com/api/owner-login', {
  method: 'POST', headers: { 'content-type':'application/json', origin:'https://zhao-wu.com', 'x-forwarded-host':'zhao-wu.com' },
  body: JSON.stringify({email:account,secret:password}),
}));

function configure(values) {
  const old = Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]]));
  for(const k of Object.keys(env)) {
    if(values[k] === undefined) delete process.env[k]; else process.env[k]=values[k];
  }
  return () => {for(const [k,v] of Object.entries(old)) {if(v===undefined)delete process.env[k];else process.env[k]=v;}};
}

test('synthetic owner login yields a sealed session; wrong pairs yield no cookie', async()=>{
 const restore=configure(env);
 try {
  const response=await post(email.toUpperCase(),secret);
  assert.equal(response.status,200);
  const cookie=response.headers.get('set-cookie');
  assert.ok(cookie.includes(`${OWNER_COOKIE}=v1.`));
  assert.ok(!cookie.includes(secret));
  assert.equal(ownerSecretFromRequest({headers:{cookie}}),secret);
  for(const [a,s] of [[email,'wrong'],['wrong@example.invalid',secret]]) {
   const bad=await post(a,s);assert.equal(bad.status,401);assert.equal(bad.headers.get('set-cookie'),null);
  }
 } finally {restore();}
});

test('missing verifiers or encryption key fail closed without leaking internal errors',async()=>{
 for(const key of Object.keys(env)) {
  const values={...env};delete values[key];const restore=configure(values);
  try {const r=await post(email,secret);assert.equal(r.status,key==='ZHAOWU_OWNER_BRIDGE_SECRET'?503:401);assert.equal(r.headers.get('set-cookie'),null);assert.equal('detail' in await r.json(),false);}finally{restore();}
 }
 assert.equal(isValidOwnerSecret(secret,{}),false);
 assert.equal(isValidOwnerSecret(secret,{ZHAOWU_OWNER_KEY_SHA256:'invalid'}),false);
});

test('rotation revokes prior sealed cookies and plaintext cookies never authorize',()=>{
 const value=ownerCookieValue(secret,{env});
 assert.equal(ownerSecretFromCookieValue(value,{env}),secret);
 assert.equal(ownerSecretFromCookieValue(value,{env:{...env,ZHAOWU_OWNER_KEY_SHA256:sha('new-synthetic-owner-secret')}}),'');
 for(const raw of [secret,encodeURIComponent(secret)])assert.equal(ownerSecretFromCookieValue(raw,{env}),'');
});

test('all three independent Edge auth helpers require a runtime verifier',()=>{
 const headers=new Headers({'x-zhaowu-server-bridge':'r162','x-zhaowu-bridge-secret':env.ZHAOWU_OWNER_BRIDGE_SECRET,'x-zhaowu-owner-secret':secret});
 for(const fn of [dataAuth,promoAuth,articleAuth]) {
  let restore=configure(env);
  try {assert.equal(fn(headers,env.ZHAOWU_OWNER_BRIDGE_SECRET).ok,true);const wrong=new Headers(headers);wrong.set('x-zhaowu-owner-secret','wrong');assert.equal(fn(wrong,env.ZHAOWU_OWNER_BRIDGE_SECRET).ok,false);}finally{restore();}
  restore=configure({});try{assert.equal(fn(headers,env.ZHAOWU_OWNER_BRIDGE_SECRET).ok,false);}finally{restore();}
 }
});

test('TypeScript server helper shares sealed-only session semantics',async()=>{
 const server=await import('../src/server/owner-auth.ts');const restore=configure(env);
 try {
  assert.equal(server.requestHasOwnerSession({headers:{cookie:`${OWNER_COOKIE}=${secret}`}}),false);
  const cookie=server.ownerCookie(secret);assert.ok(cookie.includes('=v1.'));assert.equal(server.requestHasOwnerSession({headers:{cookie}}),true);
 }finally{restore();}
});
