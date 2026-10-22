import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const layeredStyles = await readFile(new URL("../src/zhaowu-layered-styles.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const login = await readFile(new URL("../src/routes/login.tsx", import.meta.url), "utf8");
const provider = await readFile(new URL("../src/lib/auth/provider.tsx", import.meta.url), "utf8");
const client = await readFile(new URL("../src/lib/auth/client.ts", import.meta.url), "utf8");
const ownerApi = await readFile(new URL("../src/lib/auth/owner-api.ts", import.meta.url), "utf8");
const ownerLoginApi = await readFile(new URL("../api/owner-login.js", import.meta.url), "utf8");
const ownerLogoutApi = await readFile(new URL("../api/owner-logout.js", import.meta.url), "utf8");
const ownerSessionApi = await readFile(new URL("../api/owner-session.js", import.meta.url), "utf8");
const ownerServer = await readFile(new URL("../src/server/owner-auth.ts", import.meta.url), "utf8");
const sharedBirth = await readFile(new URL("../src/lib/shared-birth.ts", import.meta.url), "utf8");
const analysisForm = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
const paintedHome = await readFile(new URL("../src/components/painted-home.tsx", import.meta.url), "utf8");
const account = await readFile(new URL("../src/routes/account.tsx", import.meta.url), "utf8");

test("ordinary visitors use device-local access while the owner entry remains explicit", () => {
  assert.doesNotMatch(shell, /data-owner-login-entry="true"/);
  assert.doesNotMatch(shell, /to="\/login"/);
  assert.match(shell, /to="\/history"/);
  assert.match(shell, /無需註冊/);
  assert.match(paintedHome, /href="\/history"/);
  assert.doesNotMatch(paintedHome, /href="\/account"/);
  assert.doesNotMatch(account, /會員登入|會員登入／註冊|登入或註冊後|Sign in \/ Register/);
  assert.doesNotMatch(shell, /className="zhaowu-header-login"/);
  assert.doesNotMatch(shell, /BrandIcon name="login"/);
  assert.match(layeredStyles, /device-question-flow-r144\.css/);
  assert.match(main, /zhaowu-layered-styles\.css/);
  assert.doesNotMatch(provider, /captureOAuthRedirect|restoreSession|getProfile/);
  assert.doesNotMatch(provider, /memberFrom/);
  assert.match(provider, /mobile IPs rotate and may be shared/);
});

test("owner cookie remains the only active login path", async () => {
  assert.match(login, /ownerSignIn/);
  assert.match(login, /data-owner-only-login="true"/);
  assert.match(login, /vercel-owner-cookie/);
  assert.match(login, /login-secret/);
  assert.match(login, /站主密碼/);
  assert.doesNotMatch(login, /signInWithPassword|signUpWithPassword|signupTab|login-email/);
  assert.match(provider, /readOwnerSession/);
  assert.match(client, /ownerSignOut/);
  assert.match(ownerApi, /JSON\.stringify\(\{ email, secret \}\)/);
  assert.match(ownerApi, /\/api\/owner-login/);
  assert.match(ownerSessionApi, /requestHasOwnerSession/);
  assert.match(ownerLoginApi, /req\.body\?\.secret/);
  assert.match(ownerLoginApi, /requestIsSameOrigin/);
  assert.match(ownerLogoutApi, /requestIsSameOrigin/);
  assert.match(ownerLoginApi, /Set-Cookie/);
  // The TypeScript helper re-exports the single sealed-cookie boundary; the verifier comes from runtime env, never from source.
  const ownerCookieLib = await readFile(new URL("../lib/owner-session-cookie.js", import.meta.url), "utf8");
  assert.match(ownerServer, /from "\.\.\/\.\.\/lib\/owner-session-cookie\.js"/);
  assert.match(ownerCookieLib, /__Host-zhaowu_owner_session/);
  assert.match(ownerCookieLib, /ZHAOWU_OWNER_KEY_SHA256/);
  assert.match(ownerCookieLib, /HttpOnly/);
  assert.match(ownerCookieLib, /Secure/);
  assert.match(ownerCookieLib, /SameSite=Strict/);
  assert.match(ownerCookieLib, /timingSafeEqual/);
  assert.doesNotMatch(ownerCookieLib, /["'][a-f0-9]{64}["']/i);
  assert.doesNotMatch(ownerServer, /["'][a-f0-9]{64}["']/i);
});

test("device birth data is never wiped and does not pretend IP is identity", () => {
  assert.match(sharedBirth, /GUEST_BIRTH_OWNER_ID/);
  assert.match(sharedBirth, /localStorage\.setItem\(SHARED_BIRTH_STORAGE_KEY/);
  assert.match(sharedBirth, /Never delete the device birth on login or logout/);
  assert.match(sharedBirth, /Device record wins regardless of the current login marker/);
  assert.doesNotMatch(provider, /clientIp|x-forwarded-for|cf-connecting-ip/);
});

test("birth comes first, real chart comes second, question comes third, and analysis stays guest-capable", () => {
  assert.match(analysisForm, /writeSharedBirthRecord/);
  assert.match(analysisForm, /data-device-first-flow="true"/);
  assert.match(analysisForm, /id="question-stage"/);
  assert.match(analysisForm, /id="bazi"/);
  assert.match(analysisForm, /buildChart/);
  assert.match(analysisForm, /BaziChart/);
  assert.match(analysisForm, /zhaowu-question-sheet/);
  assert.match(analysisForm, /analysis-question/);
  assert.match(analysisForm, /const showQuestion = Boolean\(rememberedRecord && !detailsOpen\)/);
  assert.match(analysisForm, /analyzeLife\(/);
  assert.match(analysisForm, /if \(session\)/);
  assert.ok(analysisForm.indexOf('id="customer-record"') < analysisForm.indexOf('id="bazi"'));
  assert.ok(analysisForm.indexOf('id="bazi"') < analysisForm.indexOf('id="question-stage"'));
});
