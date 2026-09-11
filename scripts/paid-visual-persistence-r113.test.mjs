import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260911125000_paid_visual_blueprints_r113.sql', 'utf8');
const edge = fs.readFileSync('supabase/functions/prepare-paid-visual/index.ts', 'utf8');

test('paid visual table is private-by-default and state constrained', () => {
  assert.match(migration, /create table if not exists public\.paid_visual_blueprints/i);
  assert.match(migration, /status in \('locked', 'ready', 'generating', 'completed', 'failed'\)/i);
  assert.match(migration, /unique \(report_id, visual_kind\)/i);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /for select[\s\S]*user_id = \(select auth\.uid\(\)\)/i);
  assert.doesNotMatch(migration, /paid_visual_blueprints[\s\S]*for (insert|update|delete)[\s\S]*to authenticated/i);
});

test('prepare endpoint verifies auth, ownership and paid state server-side', () => {
  assert.match(edge, /auth\.getUser\(token\)/);
  assert.match(edge, /report\.user_id !== actor\.id/);
  assert.match(edge, /ELIGIBLE_TIERS\.has\(tier\)/);
  assert.match(edge, /ELIGIBLE_PAYMENT_STATES\.has\(paymentState\)/);
  assert.match(edge, /PAID_VISUAL_LOCKED/);
  assert.match(edge, /REPORT_NOT_READY/);
  assert.match(edge, /validAuraBlueprint\(blueprint\)/);
});

test('prepare endpoint never calls an image provider or spends provider credits', () => {
  assert.match(edge, /providerUsed:\s*false/);
  assert.doesNotMatch(edge, /OPENAI_API_KEY|IMAGEN|REPLICATE|STABILITY|images\.generate|image_generation/i);
});
