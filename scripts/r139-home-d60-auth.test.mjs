import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("homepage keeps birth first and restores the question stage after birth save", async () => {
  const form = await source("src/components/analysis-form.tsx");
  const home = await source("src/routes/index.tsx");
  assert.match(form, /id="customer-record"/);
  assert.match(form, /id="question-stage"/);
  assert.match(form, /analysis-question/);
  assert.match(form, /你真正想問的是什麼/);
  assert.match(form, /analyzeLife\(/);
  assert.match(form, /const showQuestion = Boolean\(rememberedRecord && !detailsOpen\)/);
  assert.match(form, /id="bazi" className="zhaowu-bazi-hub/);
  assert.match(form, /BaziChart/);
  assert.match(form, /data-home-bazi-explanation/);
  assert.ok(form.indexOf('id="customer-record"') < form.indexOf('id="bazi"'));
  assert.ok(form.indexOf('id="bazi"') < form.indexOf('id="question-stage"'));
  assert.match(home, /href=\{birth \? "#bazi" : "#customer-record"\}/);
});

test("D60 belongs to Indian astrology and is gone from Past & Present", async () => {
  const past = await source("src/routes/yizhangjing.tsx");
  const indian = await source("src/routes/indian-astrology.tsx");
  const page = await source("src/components/specialist-system-page.tsx");
  const karma = await source("src/components/d60-karma-section.tsx");
  const gate = await source("src/components/d60-reliability-gate.tsx");
  assert.doesNotMatch(past, /D60KarmaSection/);
  assert.match(indian, /SpecialistSystemPage id="indian"/);
  assert.match(page, /D60ReliabilityGate/);
  assert.match(karma, /function calculateD60/);
  assert.match(karma, /lahiriAyanamsa/);
  assert.match(karma, /kicker: "D60 · 印度古法占星"/);
  assert.match(gate, /state === "unstable" \|\| state === "error"/);
  assert.match(gate, /data-d60-withheld/);
  assert.match(gate, /variant="standalone"/);
});

test("login animation remains full-bleed while the route is owner-only", async () => {
  const login = await source("src/routes/login.tsx");
  const css = await source("src/login-approved-r89.css");
  const provider = await source("src/lib/auth/provider.tsx");
  assert.match(login, /stone-login-stage-media/);
  assert.match(login, /owner-immortal-ascent-r123\.mp4/);
  assert.match(css, /\.stone-login-stage-media/);
  assert.match(css, /object-fit: cover/);
  assert.match(login, /data-owner-only-login="true"/);
  assert.match(login, /ownerSignIn/);
  assert.match(login, /站主登入/);
  assert.doesNotMatch(login, /signupTab|signUpWithPassword|signInWithPassword|startOAuth|OAuthProvider|stone-login-oauth/);
  assert.doesNotMatch(provider, /captureOAuthRedirect|restoreSession|getProfile|memberFrom/);
  assert.match(provider, /readOwnerSession/);
});

test("ordinary visitors are device-local guests rather than member sessions", async () => {
  const provider = await source("src/lib/auth/provider.tsx");
  const birth = await source("src/lib/shared-birth.ts");
  assert.match(provider, /setSharedBirthAccessUser\(null\)/);
  assert.match(provider, /mobile IPs rotate and may be shared/);
  assert.match(birth, /zhaowu\.birth-record\.v1/);
  assert.match(birth, /Device record wins regardless of the current login marker/);
});

test("device birth survives owner login and western house table wraps on iPhone", async () => {
  const birth = await source("src/lib/shared-birth.ts");
  const css = await source("src/specialist-system.css");
  const chart = await source("src/components/specialist-chart.tsx");
  assert.match(birth, /Never delete the device birth on login or logout/);
  assert.doesNotMatch(birth, /if \(storedOwner !== nextOwner\) \{[\s\S]*removeItem\(SHARED_BIRTH_STORAGE_KEY\)/);
  assert.match(css, /\[data-specialist-report="western"\] \[data-summary-table\] \.zw-chart-table th,\n\[data-specialist-report="western"\] \[data-summary-table\] \.zw-chart-table td \{[\s\S]*?white-space: normal/);
  assert.doesNotMatch(css, /\[data-specialist-report="western"\] \[data-summary-table\] \.zw-chart-table td \{\n  min-width: 0;\n  padding: 10px 4px;\n  white-space: nowrap;/);
  assert.match(chart, /data-label=\{headers\[j\]/);
});

test("iPhone music upload sniffs AAC/octet-stream and surfaces the real HTTP error", async () => {
  const transcode = await source("src/lib/owner-music-transcode.ts");
  const client = await source("src/lib/owner-music-client.ts");
  const api = await source("api/owner-music.js");
  assert.match(transcode, /audio\/aac/);
  assert.match(transcode, /sniffAudioContainer/);
  assert.match(transcode, /application\/octet-stream/);
  assert.match(client, /HTTP \$\{status\}/);
  assert.match(client, /body\.detail/);
  assert.match(api, /sniffAudioExt/);
  assert.match(api, /resolveAudioFile/);
  assert.match(api, /cdn\.jsdelivr\.net\/gh/);
  assert.match(api, /method === "GET" \|\| method === "HEAD"/);
});
