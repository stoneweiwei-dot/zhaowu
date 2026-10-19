begin;

-- 2026-10-19 fixed local report pricing.
-- Preserve every historical USD entitlement while allowing only the explicit
-- AUD/CNY amounts configured on the known live Stripe Payment Links.
alter table public.report_purchase_entitlements
  drop constraint if exists report_purchase_entitlements_currency_check,
  drop constraint if exists report_purchase_entitlements_amount_cents_check,
  drop constraint if exists report_purchase_product_amount_check;

alter table public.report_purchase_entitlements
  add constraint report_purchase_entitlements_currency_check
    check (currency in ('usd', 'aud', 'cny')),
  add constraint report_purchase_entitlements_amount_cents_check
    check (amount_cents in (
      199, 499, 990, 999, 1690, 1999, 2690,
      1490, 2490, 3990,
      6800, 10800, 16800
    )),
  add constraint report_purchase_product_amount_check
    check (
      (product_id = 'quick' and currency = 'usd' and amount_cents = 199)
      or (
        product_id = 'system'
        and (
          (currency = 'usd' and amount_cents in (499, 990, 1690, 1999))
          or (currency = 'aud' and amount_cents in (1490, 2490))
          or (currency = 'cny' and amount_cents in (6800, 10800))
        )
      )
      or (
        product_id = 'bundle'
        and (
          (currency = 'usd' and amount_cents in (999, 1999, 2690))
          or (currency = 'aud' and amount_cents = 3990)
          or (currency = 'cny' and amount_cents = 16800)
        )
      )
    );

comment on column public.report_purchase_entitlements.amount_cents is
  'Amount paid in the smallest unit of the recorded presentment currency.';

commit;
