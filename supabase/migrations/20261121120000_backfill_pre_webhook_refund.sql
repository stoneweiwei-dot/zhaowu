-- Backfill the 2026-11-20 19:37 AEDT refund, which predates charge.refunded
-- handling and the payment_intent_id column. Keep this repair limited to the
-- uniquely identified stale BaZi entitlement and only while it is still paid.
update public.report_purchase_entitlements
set status = 'refunded',
    updated_at = now()
where status = 'paid'
  and payment_intent_id is null
  and currency = 'aud'
  and amount_cents = 2490
  and product_id = 'system'
  and system_id = 'bazi'
  and created_at >= '2026-11-20 08:24:00+00'
  and created_at < '2026-11-20 08:25:00+00';
