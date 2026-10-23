-- These tables are reachable only through service-role Edge Functions.
-- RLS already denies browser roles, but explicit grants created with the
-- tables still allowed anon/authenticated to reach the RLS boundary.
-- Remove those unused privileges as defense in depth and preserve the
-- service-role-only contract used by owner devices and promo redemption.
revoke all privileges on table
  public.owner_devices,
  public.promo_codes,
  public.promo_redemptions
from anon, authenticated;

grant all privileges on table
  public.owner_devices,
  public.promo_codes,
  public.promo_redemptions
to service_role;
