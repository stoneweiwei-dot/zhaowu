-- Keep the one-argument RPC and its privileges for older clients.
alter table public.site_visits
  add column referrer text,
  add column path text,
  add column device text check (device in ('desktop', 'mobile', 'tablet', 'unknown'));

create function public.zhaowu_record_visit(
  p_visitor_key text, p_referrer text, p_path text, p_device text
) returns void language plpgsql security invoker set search_path = public
as $$
begin
  if p_visitor_key is null or length(trim(p_visitor_key)) < 8 or length(p_visitor_key) > 128 then
    return;
  end if;
  insert into public.site_visits (visitor_key, referrer, path, device)
  values (
    p_visitor_key,
    case when length(p_referrer) <= 255 and p_referrer ~ '^https?://[A-Za-z0-9.-]+(:[0-9]+)?$' then p_referrer end,
    case when p_path ~ '^/([^/]|$)' then left(split_part(split_part(p_path, '?', 1), '#', 1), 512) end,
    case when p_device in ('desktop','mobile','tablet') then p_device else 'unknown' end
  )
  on conflict do nothing;
end;
$$;
revoke all on function public.zhaowu_record_visit(text,text,text,text) from public;
grant execute on function public.zhaowu_record_visit(text,text,text,text) to anon, authenticated, service_role;
