import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ownerLogin from "../api/owner-login.js";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("Netlify Request JSON accepts the documented owner password", async () => {
  const request = new Request("https://archive-stone-zhaowu-official.netlify.app/api/owner-login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://archive-stone-zhaowu-official.netlify.app",
      "x-forwarded-host": "archive-stone-zhaowu-official.netlify.app",
    },
    body: JSON.stringify({ secret: "19881004" }),
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

test("homepage keeps one primary flow and the current closed secondary accordions", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /useState<"today" \| "quiz" \| "notes" \| null>\(null\)/);
  assert.equal((home.match(/<HomeDisclosure /g) ?? []).length, 3);
  assert.match(home, /<AnalysisForm \/>/);
  assert.match(home, /<DailyAlmanacWidget embedded \/>/);
  assert.match(home, /openPanel === "today"/);
  assert.doesNotMatch(home, /openPanel === "gallery"/);
  assert.match(home, /openPanel === "notes"/);
});

test("login owns the only active animation sound control", async () => {
  const routeRoot = await source("src/routes/__root.tsx");
  const login = await source("src/routes/login.tsx");
  assert.doesNotMatch(routeRoot, /IntroGate/);
  assert.match(login, /LoginStageBackdrop/);
  assert.match(login, /stone-login-sound/);
  assert.match(login, /videoRef\.current\.muted = nextMuted/);
});

test("header mode control uses a labelled day-night segment instead of decorative icons", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.doesNotMatch(shell, /BrandIcon name=\{night \? "day" : "night"\}/);
  assert.match(shell, /zhaowu-header-mode-toggle/);
  assert.match(shell, /data-active=\{!night \? "true" : "false"\}/);
  assert.match(shell, /data-active=\{night \? "true" : "false"\}/);
});
