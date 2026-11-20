alter table public.report_purchase_entitlements
  add column if not exists payment_intent_id text;

create index if not exists report_purchase_entitlements_payment_intent_id_idx
  on public.report_purchase_entitlements (payment_intent_id)
  where payment_intent_id is not null;

comment on column public.report_purchase_entitlements.payment_intent_id is
  'Stripe PaymentIntent identifier used by the authenticated refund webhook to revoke the matching checkout entitlement.';
