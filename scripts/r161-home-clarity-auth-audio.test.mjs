import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ownerLogin from "../api/owner-login.js";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

const ownerTestSecret = process.env.ZHAOWU_OWNER_TEST_SECRET ?? "";

test("Netlify Request JSON accepts the owner password", { skip: !ownerTestSecret && "ZHAOWU_OWNER_TEST_SECRET not set" }, async () => {
  const request = new Request("https://archive-stone-zhaowu-official.netlify.app/api/owner-login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://archive-stone-zhaowu-official.netlify.app",
      "x-forwarded-host": "archive-stone-zhaowu-official.netlify.app",
    },
    body: JSON.stringify({ secret: ownerTestSecret }),
  });
  const response = await ownerLogin(request);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie") ?? "", /__Host-zhaowu_owner_session=/);
});

test("wrong owner password is still rejected", async () => {
  const request = new Request("https://archive-stone-zhaowu-official.netlify.app/api/owner-login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret: "00000000" }),
  });
  const response = await ownerLogin(request);
  assert.equal(response.status, 401);
});

test("homepage (ZW-FE-02) keeps one primary flow per dedicated view, each reachable from the four home portals", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /useState<Section \| null>\(null\)/);
  assert.doesNotMatch(home, /<HomeDisclosure /);
  assert.match(home, /<AnalysisForm \/>/);
  assert.match(home, /id="home-today-guide"/);
  assert.match(home, /<LazyDailyAlmanacWidget embedded \/>/);
  assert.match(home, /import\("@\/components\/daily-almanac-widget"\)/);
  assert.match(home, /activeSection === "today"/);
  assert.doesNotMatch(home, /activeSection === "gallery"/);
  assert.match(home, /activeSection === "notes"/);
});

test("login carries no animation sound control after the static Song login", async () => {
  const routeRoot = await source("src/routes/__root.tsx");
  const login = await source("src/routes/login.tsx");
  assert.doesNotMatch(routeRoot, /IntroGate/);
  assert.match(login, /data-login-stage-static="true"/);
  assert.doesNotMatch(login, /<video|LoginStageBackdrop|stone-login-sound/);
});

test("header mode control uses a labelled day-night segment instead of decorative icons", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.doesNotMatch(shell, /BrandIcon name=\{night \? "day" : "night"\}/);
  assert.match(shell, /zhaowu-header-mode-toggle/);
  assert.match(shell, /data-active=\{!night \? "true" : "false"\}/);
  assert.match(shell, /data-active=\{night \? "true" : "false"\}/);
});
