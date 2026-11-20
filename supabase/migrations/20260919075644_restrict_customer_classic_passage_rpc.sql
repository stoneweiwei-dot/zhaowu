-- The browser application does not call this SECURITY DEFINER helper directly.
-- Keep it available to trusted backend code only so authenticated visitors cannot
-- bypass the report API's ownership and rate-limit checks.
revoke all on function public.get_customer_classic_passage(jsonb) from public, anon, authenticated;
grant execute on function public.get_customer_classic_passage(jsonb) to service_role;
