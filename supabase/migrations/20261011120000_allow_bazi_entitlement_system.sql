-- BaZi is sold as its own USD 4.99 `system` product (plink_1UP3HWFAzopdCCaxkt9pGy9Z).
-- Without this the webhook upsert for system_id = 'bazi' is rejected by the CHECK
-- constraint, so a paid BaZi checkout would never produce an entitlement.
-- Additive only: existing rows and the amount/product constraints are untouched.
alter table public.report_purchase_entitlements
  drop constraint if exists report_purchase_entitlements_system_id_check;

alter table public.report_purchase_entitlements
  add constraint report_purchase_entitlements_system_id_check
  check (system_id is null or system_id in ('bazi', 'ziwei', 'qizheng', 'western', 'indian', 'palm', 'numerology'));
