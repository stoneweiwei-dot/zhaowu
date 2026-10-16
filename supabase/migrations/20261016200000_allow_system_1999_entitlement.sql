begin;

-- 2026-10-16 owner repricing: BaZi and Zi Wei single-system readings are USD 19.99.
-- Additive only: the previous amounts (499, 990) stay valid for historical rows and open checkouts.
alter table public.report_purchase_entitlements
  drop constraint report_purchase_product_amount_check,
  add constraint report_purchase_product_amount_check
    check (
      (product_id = 'quick' and amount_cents = 199)
      or (product_id = 'system' and amount_cents in (499, 990, 1999))
      or (product_id = 'bundle' and amount_cents in (999, 1999))
    );

commit;
