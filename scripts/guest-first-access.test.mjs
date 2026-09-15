import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const guestCss = await readFile(new URL("../src/device-question-flow-r144.css", import.meta.url), "utf8");
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

test("ordinary visitors use device-local access and the public login CTA is inactive", () => {
  assert.match(shell, /className="zhaowu-header-login"/);
  assert.match(guestCss, /\.zhaowu-site-header \.zhaowu-header-login \{ display: none !important; \}/);
  assert.match(main, /device-question-flow-r144\.css/);
  assert.doesNotMatch(provider, /captureOAuthRedirect|restoreSession|getProfile/);
  assert.doesNotMatch(provider, /memberFrom/);
  assert.match(provider, /mobile IPs rotate and may be shared/);
});

test("owner cookie remains the only active login path", () => {
  assert.match(login, /ownerSignIn/);
  assert.match(login, /data-owner-only-login="true"/);
  assert.match(login, /vercel-owner-cookie/);
  assert.match(login, /login-secret/);
  assert.match(login, /站主密鑰/);
  assert.doesNotMatch(login, /signInWithPassword|signUpWithPassword|signupTab|login-email/);
  assert.match(provider, /readOwnerSession/);
  assert.match(client, /ownerSignOut/);
  assert.match(ownerApi, /JSON\.stringify\(\{ secret \}\)/);
  assert.match(ownerApi, /\/api\/owner-login/);
  assert.match(ownerSessionApi, /requestHasOwnerSession/);
  assert.match(ownerLoginApi, /req\.body\?\.secret/);
  assert.match(ownerLoginApi, /requestIsSameOrigin/);
  assert.match(ownerLogoutApi, /requestIsSameOrigin/);
  assert.match(ownerLoginApi, /Set-Cookie/);
  assert.match(ownerServer, /__Host-zhaowu_owner_session/);
  assert.match(ownerServer, /OWNER_KEY_SHA256/);
  assert.match(ownerServer, /HttpOnly/);
  assert.match(ownerServer, /Secure/);
  assert.match(ownerServer, /SameSite=Strict/);
  assert.match(ownerServer, /timingSafeEqual/);
});

test("device birth data is never wiped and does not pretend IP is identity", () => {
  assert.match(sharedBirth, /GUEST_BIRTH_OWNER_ID/);
  assert.match(sharedBirth, /localStorage\.setItem\(SHARED_BIRTH_STORAGE_KEY/);
  assert.match(sharedBirth, /Never delete the device birth on login or logout/);
  assert.match(sharedBirth, /Device record wins regardless of the current login marker/);
  assert.doesNotMatch(provider, /clientIp|x-forwarded-for|cf-connecting-ip/);
});

test("birth comes first, question appears after the record is saved, and analysis stays guest-capable", () => {
  assert.match(analysisForm, /writeSharedBirthRecord/);
  assert.match(analysisForm, /data-device-first-flow="true"/);
  assert.match(analysisForm, /id="question-stage"/);
  assert.match(analysisForm, /zhaowu-question-sheet/);
  assert.match(analysisForm, /analysis-question/);
  assert.match(analysisForm, /const showQuestion = Boolean\(rememberedRecord && !detailsOpen\)/);
  assert.match(analysisForm, /analyzeLife\(/);
  assert.match(analysisForm, /if \(session\)/);
  assert.ok(analysisForm.indexOf('id="customer-record"') < analysisForm.indexOf('id="question-stage"'));
});
