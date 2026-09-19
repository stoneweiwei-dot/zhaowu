import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("background music no longer plays the generated placeholder or the 402 Supabase bucket", async () => {
  const music = await source("src/components/background-music.tsx");
  assert.match(music, /\/api\/owner-music/);
  assert.match(music, /loadOwnerMusic/);
  assert.doesNotMatch(music, /\/audio\/zhaowu-background\.m4a/);
  assert.doesNotMatch(music, /supabase\.co\/storage\/v1\/object\/public\/zhaowu-audio/);
});

test("owner login APIs are self-contained JavaScript and stay off the SPA rewrite", async () => {
  const login = await source("api/owner-login.js");
  const session = await source("api/owner-session.js");
  const logout = await source("api/owner-logout.js");
  const vercel = JSON.parse(await source("vercel.json"));
  assert.match(login, /OWNER_KEY_SHA256/);
  assert.match(login, /req\.body\?\.secret/);
  assert.match(session, /authenticated/);
  assert.match(logout, /Max-Age=0/);
  assert.doesNotMatch(login, /from ["']\.\.\/src\//);
  assert.equal(vercel.rewrites[0].source, "/api/gallery-ingest-finalize");
  assert.equal(vercel.rewrites.at(-1).source, "/((?!api/).*)");
});

test("latest homepage contract supersedes r129 and restores the real Four Pillars chart before questions", async () => {
  const form = await source("src/components/analysis-form.tsx");
  const chart = await source("src/components/bazi-chart.tsx");
  const css = await source("src/night-home-r129.css");
  const main = await source("src/main.tsx");
  assert.match(form, /buildChart/);
  assert.match(form, /<BaziChart chart=\{previewChart\}/);
  assert.match(form, /data-home-bazi-explanation/);
  assert.match(form, /expandDetails/);
  assert.ok(form.indexOf('id="customer-record"') < form.indexOf('id="bazi"'));
  assert.ok(form.indexOf('id="bazi"') < form.indexOf('id="question-stage"'));
  assert.doesNotMatch(form, /流通候選不在這裡冒充正式喜用神/);
  assert.doesNotMatch(chart, /chartTerm\(p\.gan, locale\)/);
  assert.match(chart, /chartTerm\(p\.shiShenGan, locale\)/);
  assert.match(css, /zhaowu-pillar-grid > section > p/);
  assert.match(css, /html\[data-zw-theme="night"\] \.zhaowu-home-layout \.zhaowu-home-portals-block/);
  assert.match(main, /night-home-r129\.css/);
  assert.ok(main.indexOf("night-readability-r127.css") < main.indexOf("night-home-r129.css"));
});

test("knowledge hub keeps 觀世錄 editorial content separate from 昭梧命理小知識", async () => {
  const knowledge = await source("src/routes/knowledge.tsx");
  const article = await source("src/routes/knowledge.shushu-boundary.tsx");
  const homeNotes = await source("src/components/life-view-home-section.tsx");
  const knowledgeNotes = await source("src/components/bazi-knowledge-notes-section.tsx");
  const home = await source("src/routes/index.tsx");

  assert.match(knowledge, /觀世錄與命理小知識，分開看/);
  assert.match(knowledge, /id="guanshilu-articles"/);
  assert.match(knowledge, /id="#?mingli-knowledge"|BaziKnowledgeNotesSection/);
  assert.match(knowledge, /LifeViewHomeSection archiveMode/);
  assert.match(knowledge, /昭梧 · 命理小知識/);
  assert.match(knowledge, /文章就是文章，教學就是教學/);
  assert.match(knowledgeNotes, /命理知識就是知識，不混進觀世錄文章/);
  assert.match(article, /返回昭梧 · 觀世錄/);
  assert.match(homeNotes, /to="\/knowledge"/);
  assert.match(home, /LifeViewHomeSection/);
});
