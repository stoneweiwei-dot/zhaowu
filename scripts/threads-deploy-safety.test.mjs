import assert from "node:assert/strict";
import test from "node:test";
import { readdir, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("Threads callbacks reuse existing owner-session API within Hobby function budget", async () => {
  const functions = (await readdir(new URL("../api/", import.meta.url))).filter((name) => name.endsWith(".js"));
  assert.ok(functions.length <= 12, "No 13th Vercel Hobby function: " + functions.join(", "));
  assert.ok(!functions.includes("threads-meta-callback.js"));
  const owner = await source("api/owner-session.js");
  assert.match(owner, /import \{ handleThreadsMetaCallback \} from "\.\.\/lib\/threads-meta-callback\.js"/);
  const route = owner.indexOf('if (["threads.deauthorize", "threads.data-deletion", "threads.deletion-status"].includes(threadsEvent))');
  const gate = owner.indexOf("if (!requestIsSameOrigin(req))");
  assert.ok(route >= 0 && gate > route, "Signed callback must be routed before same-origin owner-only POST gate");
});

test("client guidance never pretends that Threads OAuth uses the Facebook app", async () => {
  const threads = await source("lib/threads-oauth.js");
  const social = await source("src/routes/social.tsx");
  assert.match(threads, /value\(env, "THREADS_APP_ID"\)/);
  assert.match(threads, /value\(env, "THREADS_APP_SECRET"\)/);
  assert.doesNotMatch(threads, /const appId = value\(env, "META_APP_ID"\)/);
  assert.match(social, /startThreadsConnection/);
});

test("owner-only theme fallback cannot be called before origin and owner authorization", async () => {
  const ownerData = await source("api/owner-data.js");
  const origin = ownerData.indexOf("if (!requestIsSameOrigin(req))");
  const owner = ownerData.indexOf("const owner = await authenticateOwner(req);");
  const fallback = ownerData.indexOf('if (action === "site-skin.publish" && upstream.status === 404)');
  assert.ok(origin >= 0 && owner > origin && fallback > owner);
  assert.match(ownerData, /if \(!validSiteSkin\(skin\)\)/);
});
