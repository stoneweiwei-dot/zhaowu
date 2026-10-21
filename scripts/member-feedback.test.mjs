import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateMemberForm } from '../src/lib/auth/member-form.ts';
import { withVisitorAuthTimeout, isVisitorNetworkError, VISITOR_AUTH_TIMEOUT_MS } from '../src/lib/auth/request-timeout.ts';

const email='synthetic@example.invalid';
const password='synthetic-test-password';

test('empty and malformed email receives a form error in all email modes',()=>{
 for(const mode of ['login','signup','forgot']) {
  for(const invalid of ['', 'not-an-email','a@b','a b@example.com']) assert.equal(validateMemberForm(mode,invalid,password,password),'INVALID_EMAIL');
  assert.equal(validateMemberForm(mode,`  ${email}  `,password,password),null);
 }
});

test('password bounds apply to sign-in/signup/reset but never block recovery email',()=>{
 for(const mode of ['login','signup','reset']) {
  for(const invalid of ['', 'short', 'x'.repeat(73)]) assert.equal(validateMemberForm(mode,email,invalid,invalid),'INVALID_PASSWORD');
  for(const valid of ['x'.repeat(8),'x'.repeat(72)])assert.equal(validateMemberForm(mode,email,valid,valid),null);
 }
 assert.equal(validateMemberForm('forgot',email,'',''),null);
 assert.equal(validateMemberForm('reset','',password,'different'),'PASSWORD_MISMATCH');
 assert.equal(validateMemberForm('reset','',password,password),null);
});

test('auth deadline aborts stalled work, including response-body reads',async()=>{
 assert.equal(VISITOR_AUTH_TIMEOUT_MS,15000);
 let aborted=false;
 await assert.rejects(withVisitorAuthTimeout(signal=>new Promise((resolve,reject)=>{
  signal.addEventListener('abort',()=>{aborted=true;reject(new DOMException('aborted','AbortError'));},{once:true});
 }),10),{name:'AbortError'});
 assert.equal(aborted,true);
});

test('completed and rejected requests clear their timers without later aborting',async()=>{
 let successSignal;let failedSignal;
 assert.equal(await withVisitorAuthTimeout(async signal=>{successSignal=signal;return 'done';},5),'done');
 const backendError=new Error('invalid credentials');
 await assert.rejects(withVisitorAuthTimeout(async signal=>{failedSignal=signal;throw backendError;},5),error=>error===backendError);
 await new Promise(resolve=>setTimeout(resolve,15));
 assert.equal(successSignal.aborted,false);assert.equal(failedSignal.aborted,false);
});

test('network and abort failures map to visible network feedback',()=>{
 for(const error of [new TypeError('network'),new DOMException('abort','AbortError'),new DOMException('timeout','TimeoutError')])assert.equal(isVisitorNetworkError(error),true);
 assert.equal(isVisitorNetworkError(new Error('invalid credentials')),false);
});

test('member UI owns validation and keeps alerts visible for all modes',async()=>{
 const source=await readFile(new URL('../src/routes/member.tsx',import.meta.url),'utf8');
 assert.match(source,/<form noValidate aria-busy=\{busy\}/);
 assert.match(source,/validateMemberForm\(mode, cleanEmail, password, confirmPassword\)/);
 assert.ok(source.indexOf('id="member-form-error"')<source.indexOf('{pending &&'));
 assert.match(source,/role="alert" tabIndex=\{-1\}/);
 assert.match(source,/errorRef\.current\?\.focus\(\)/);
 assert.match(source,/If an account exists for that email/);
 assert.match(source,/setBusy\(false\)/);
});
