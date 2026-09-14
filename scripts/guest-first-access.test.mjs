import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const guestCss = await readFile(new URL("../src/guest-first-r116.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const login = await readFile(new URL("../src/routes/login.tsx", import.meta.url), "utf8");
const provider = await readFile(new URL("../src/lib/auth/provider.tsx", import.meta.url), "utf8");
const client = await readFile(new URL("../src/lib/auth/client.ts", import.meta.url), "utf8");
const ownerApi = await readFile(new URL("../src/lib/auth/owner-api.ts", import.meta.url), "utf8");
const ownerLoginApi = await readFile(new URL("../api/owner-login.js", import.meta.url), "utf8");
const ownerLogoutApi = await readFile(new URL("../api/owner-logout.js", import.meta.url), "utf8");
const ownerSessionApi = await readFile(new URL("../api/owner-session.js", import.meta.url), "utf8");
const ownerServer = await readFile(new URL("../src/server/owner-auth.ts", import.meta.url), "utf8");
const account = await readFile(new URL("../src/routes/account.tsx", import.meta.url), "utf8");
const sharedBirth = await readFile(new URL("../src/lib/shared-birth.ts", import.meta.url), "utf8");
const analysisForm = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");

test("public shell exposes login and preserves owner controls", () => {
  assert.match(shell, /className="zhaowu-header-login"/);
  assert.doesNotMatch(guestCss, /\.zhaowu-site-header \.zhaowu-header-login[\s\S]*display:\s*none\s*!important/);
  assert.match(main, /import ['"]\.\/guest-first-r116\.css['"]/);
  assert.match(shell, /user\?\.isOwner/);
  assert.match(shell, /to="\/account"/);
  assert.match(shell, /signOut/);
  assert.match(shell, /t\("navLogin"\)/);
});

test("owner cookie stays independent while member email login is restored", () => {
  assert.match(login, /ownerSignIn/);
  assert.match(login, /vercel-owner-cookie/);
  assert.match(login, /login-secret/);
  assert.match(login, /站主密鑰/);
  assert.match(login, /signInWithPassword/);
  assert.match(login, /signUpWithPassword/);
  assert.match(login, /signupTab/);
  assert.match(login, /login-email/);
  assert.match(provider, /readOwnerSession/);
  assert.match(provider, /restoreSession/);
  assert.match(provider, /captureOAuthRedirect/);
  assert.match(provider, /isOwner: false/);
  assert.match(client, /ownerSignOut/);
  assert.match(client, /signOutRemote/);
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
  assert.match(ownerServer, /requestIsSameOrigin/);
  assert.match(account, /data-owner-independent-console/);
  assert.match(account, /Supabase Auth/);
});

test("device birth data is never wiped on login or logout", () => {
  assert.match(sharedBirth, /GUEST_BIRTH_OWNER_ID/);
  assert.match(sharedBirth, /localStorage\.setItem\(SHARED_BIRTH_STORAGE_KEY/);
  assert.doesNotMatch(sharedBirth, /removeItem\(SHARED_BIRTH_STORAGE_KEY\)[\s\S]{0,80}setItem\(SHARED_BIRTH_OWNER_KEY, nextOwner\)/);
  assert.match(sharedBirth, /Never delete the device birth on login or logout/);
  assert.match(sharedBirth, /Device record wins regardless of the current login marker/);
});

test("free birth save remains available without a session and persistence stays session-gated", () => {
  assert.match(analysisForm, /writeSharedBirthRecord/);
  assert.match(analysisForm, /if \(session\)/);
  assert.match(analysisForm, /updateBirthData/);
  assert.doesNotMatch(analysisForm, /analyzeLife\(/);
  assert.doesNotMatch(analysisForm, /zhaowu-question-sheet/);
  assert.doesNotMatch(analysisForm, /此刻，你最想了解/);
});
