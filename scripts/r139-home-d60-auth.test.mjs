import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("homepage keeps birth fields and drops the self-Q&A sheet", async () => {
  const form = await source("src/components/analysis-form.tsx");
  const home = await source("src/routes/index.tsx");
  assert.match(form, /id="customer-record"/);
  assert.match(form, /保存生辰/);
  assert.doesNotMatch(form, /zhaowu-question-sheet/);
  assert.doesNotMatch(form, /此刻，你最想了解/);
  assert.doesNotMatch(form, /結論 \/ 依據 \/ 時機|结论 \/ 依据 \/ 时机/);
  assert.doesNotMatch(form, /這份工作是否值得繼續|这份工作是否值得继续/);
  assert.doesNotMatch(form, /analyzeLife\(/);
  assert.match(home, /href="#customer-record"/);
  assert.doesNotMatch(home, /href=\{current \? "#result" : "#analysisForm"\}/);
});

test("D60 belongs to Indian astrology and is gone from Past & Present", async () => {
  const past = await source("src/routes/yizhangjing.tsx");
  const indian = await source("src/routes/indian-astrology.tsx");
  const page = await source("src/components/specialist-system-page.tsx");
  const karma = await source("src/components/d60-karma-section.tsx");
  assert.doesNotMatch(past, /D60KarmaSection/);
  assert.match(indian, /SpecialistSystemPage id="indian"/);
  assert.match(page, /D60ReliabilityGate/);
  assert.match(karma, /function calculateD60/);
  assert.match(karma, /lahiriAyanamsa/);
  assert.match(karma, /kicker: "D60 · 印度古法占星"/);
});

test("login animation is full-bleed and member register has a real callback page", async () => {
  const login = await source("src/routes/login.tsx");
  const css = await source("src/login-approved-r89.css");
  const callback = await source("src/routes/auth.callback.tsx");
  const signup = await source("src/lib/auth/signup.ts");
  const provider = await source("src/lib/auth/provider.tsx");
  assert.match(login, /stone-login-stage-media/);
  assert.match(login, /owner-immortal-ascent-r123\.mp4/);
  assert.match(css, /\.stone-login-stage-media/);
  assert.match(css, /object-fit: cover/);
  assert.match(login, /signupTab/);
  assert.match(login, /signUpWithPassword/);
  assert.match(callback, /createFileRoute\("\/auth\/callback"\)/);
  assert.match(signup, /\/auth\/callback/);
  assert.match(provider, /captureOAuthRedirect/);
  assert.match(provider, /restoreSession/);
  assert.match(provider, /isOwner: false/);
});

test("device birth survives login and western house table wraps on iPhone", async () => {
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
});
