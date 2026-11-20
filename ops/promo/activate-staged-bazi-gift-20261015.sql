-- 昭梧｜站主單次八字完整報告贈閱碼啟用指令（2026-10-15）
-- TASK: Stage one owner-issued promo; OWNER: gpt
-- The actual customer-facing code is stored ONLY in the private Supabase promo_codes row,
-- not in GitHub, this SQL file, commit history, or PR comments.
--
-- IMPORTANT: GitHub merge alone DOES NOT run this SQL.
-- AFTER manual merge, run THIS file once using the SQL Editor of the existing
-- Supabase Production project: plgpxusmemnmzckbwtiv.
-- No Vercel deployment, frontend change, Stripe charge, or schema migration is needed.
--
-- Effect: activate only the already-staged, currently inactive, unused BaZi
-- system-level gift; one redemption total; expires 30 days after activation.
-- Re-execution is deliberately rejected and cannot reset or increase usage.

DO $activate_staged_bazi_promo$
DECLARE
  changed_rows integer := 0;
BEGIN
  UPDATE public.promo_codes
  SET active = true,
      expires_at = now() + interval '30 days',
      updated_at = now()
  WHERE id = '4a4fbe75-22c7-4c6a-bb51-3962314d73ab'::uuid
    AND active = false
    AND product_id = 'system'
    AND system_id = 'bazi'
    AND max_redemptions = 1
    AND redeemed_count = 0
    AND expires_at IS NULL
    AND note = 'owner-issued BaZi 1-use gift; awaiting manual GitHub PR merge + selected SQL activation; 2026-10-15';

  GET DIAGNOSTICS changed_rows = ROW_COUNT;
  IF changed_rows <> 1 THEN
    RAISE EXCEPTION
      'BaZi promo activation precondition failed: expected exactly one inactive, unused staged code (found %). No activation committed.',
      changed_rows;
  END IF;
END
$activate_staged_bazi_promo$;

-- Verification: should show active=true, redeemed_count=0, max_redemptions=1.
-- SELECT active, product_id, system_id, redeemed_count, max_redemptions, expires_at
-- FROM public.promo_codes
-- WHERE id = '4a4fbe75-22c7-4c6a-bb51-3962314d73ab';
--
-- Emergency STOP of new redemptions (run separately, only if needed):
-- UPDATE public.promo_codes SET active = false, updated_at = now()
-- WHERE id = '4a4fbe75-22c7-4c6a-bb51-3962314d73ab';
-- Note: stopping new redemptions does not revoke an existing valid redemption.
