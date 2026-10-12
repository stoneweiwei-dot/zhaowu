begin;

alter table public.report_purchase_entitlements
  drop constraint report_purchase_entitlements_amount_cents_check,
  add constraint report_purchase_entitlements_amount_cents_check
    check (amount_cents in (199, 499, 990, 999, 1999));

alter table public.report_purchase_entitlements
  drop constraint report_purchase_product_amount_check,
  add constraint report_purchase_product_amount_check
    check (
      (product_id = 'quick' and amount_cents = 199)
      or (product_id = 'system' and amount_cents in (499, 990))
      or (product_id = 'bundle' and amount_cents in (999, 1999))
    );

commit;
