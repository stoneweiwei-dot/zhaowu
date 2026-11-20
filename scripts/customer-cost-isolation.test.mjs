import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const read = (path) => readFileSync(join(ROOT, path), "utf8");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

test("browser bundle cannot contain private provider or service-role secrets", () => {
  const files = walk(join(ROOT, "src")).filter((path) => /\.[cm]?[jt]sx?$/.test(path));
  const forbidden = [
    /OPENAI_API_KEY/,
    /SUPABASE_SERVICE_ROLE_KEY/,
    /ANTHROPIC_API_KEY/,
    /GEMINI_API_KEY/,
    /GOOGLE_API_KEY/,
    /XAI_API_KEY/,
    /DEEPSEEK_API_KEY/,
    /api\.openai\.com/,
    /api\.anthropic\.com/,
    /generativelanguage\.googleapis\.com/,
    /api\.x\.ai/,
    /api\.deepseek\.com/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{12,}/,
  ];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const pattern of forbidden) {
      assert.doesNotMatch(source, pattern, `${relative(ROOT, file)} exposes or references owner-funded provider credentials`);
    }
  }
});

test("customer site guide is local-only", () => {
  const browserGuide = read("src/lib/site-guide.ts");
  assert.doesNotMatch(browserGuide, /SUPABASE_URL|functions\/v1\/site-guide|OPENAI_API_KEY|api\.openai\.com/);
  assert.match(browserGuide, /resolveLocalSiteGuide\(message, locale\) \?\? defaultSiteGuide\(locale\)/);

  const edgeGuide = read("supabase/functions/site-guide/index.ts");
  assert.doesNotMatch(edgeGuide, /OPENAI_API_KEY|api\.openai\.com|\/v1\/responses|gpt-/i);
  assert.match(edgeGuide, /provider-free/i);
});

test("owner-funded decree provider path is server-gated to verified owner", () => {
  const source = read("supabase/functions/generate-decree-image/index.ts");
  assert.match(source, /authClient\.auth\.getUser\(token\)/);
  assert.match(source, /select\("is_owner"\)/);
  assert.match(source, /const isOwner = actorProfile\?\.is_owner === true;/);
  assert.match(source, /const force = forceRequested && isOwner;/);
  assert.match(source, /const openaiKey = isOwner \? Deno\.env\.get\("OPENAI_API_KEY"\) : null;/);
  assert.doesNotMatch(source, /const force = payload\?\.force === true;/);
});

test("public Supabase browser key remains explicitly publishable, never service-role", () => {
  const source = read("src/lib/supabase-config.ts");
  assert.match(source, /DEFAULT_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/);
});
