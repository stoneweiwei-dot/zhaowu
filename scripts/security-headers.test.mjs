import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const html = readFileSync("index.html", "utf8");
const global = vercel.headers.find((entry) => entry.source === "/(.*)");
const header = (key) => global.headers.find((h) => h.key === key)?.value ?? "";

function directive(csp, name) {
  return csp.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name} `)) ?? "";
}

test("global security headers are present on every response", () => {
  assert.ok(header("Content-Security-Policy"), "CSP missing");
  assert.equal(header("X-Frame-Options"), "SAMEORIGIN");
  assert.ok(header("Permissions-Policy"), "Permissions-Policy missing");
  assert.equal(header("X-Content-Type-Options"), "nosniff");
});

test("CSP keeps index.html bootstrap scripts (release live-update, theme, language) runnable", () => {
  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>/g)];
  assert.ok(inlineScripts.length > 0, "expected inline bootstrap scripts in index.html");
  // The first inline script embeds the per-build release id, so a static hash cannot cover it.
  assert.match(directive(header("Content-Security-Policy"), "script-src"), /'unsafe-inline'/);
});

test("CSP allows the origins the client really calls and the blob/wasm ffmpeg path", () => {
  const csp = header("Content-Security-Policy");
  for (const origin of ["https://plgpxusmemnmzckbwtiv.supabase.co", "https://api.open-meteo.com", "https://geocoding-api.open-meteo.com", "https://photon.komoot.io", "https://us.i.posthog.com"]) {
    assert.ok(directive(csp, "connect-src").includes(origin), `connect-src missing ${origin}`);
  }
  assert.match(directive(csp, "script-src"), /'wasm-unsafe-eval'/);
  assert.match(directive(csp, "script-src"), /blob:/);
  assert.match(directive(csp, "worker-src"), /blob:/);
});

test("CSP closes the generic injection channels", () => {
  const csp = header("Content-Security-Policy");
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'self'/);
  assert.match(csp, /form-action 'self'/);
  assert.match(csp, /frame-ancestors 'self'/);
});

test("Permissions-Policy keeps geolocation for the daily almanac widget", () => {
  const policy = header("Permissions-Policy");
  assert.match(policy, /geolocation=\(self\)/, "daily-almanac-widget uses navigator.geolocation");
  assert.match(policy, /camera=\(\)/);
  assert.match(policy, /microphone=\(\)/);
});

test("HSTS covers subdomains but is deliberately not preloaded (金曜 r1)", () => {
  const hsts = header("Strict-Transport-Security");
  assert.match(hsts, /max-age=63072000/);
  assert.match(hsts, /includeSubDomains/);
  assert.doesNotMatch(hsts, /preload/i, "preload is hard to revoke; needs a separate owner decision");
});

test("pages and static files do not advertise wildcard CORS; /api and /sb are excluded", () => {
  const entry = vercel.headers.find((e) => e.headers.some((h) => h.key === "Access-Control-Allow-Origin"));
  assert.ok(entry, "expected an explicit same-origin ACAO override for Vercel's static default '*'");
  assert.equal(entry.source, "/((?!api/|sb/).*)");
  const acao = entry.headers.find((h) => h.key === "Access-Control-Allow-Origin").value;
  assert.equal(acao, "https://zhao-wu.com");
  for (const e of vercel.headers) {
    for (const h of e.headers) {
      if (h.key.toLowerCase() === "access-control-allow-origin") assert.notEqual(h.value.trim(), "*", `wildcard ACAO on ${e.source}`);
    }
  }
});
