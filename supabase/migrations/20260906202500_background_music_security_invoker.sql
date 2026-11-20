-- The owner-only RPC already checks private.zhaowu_is_owner(), and the
-- background_music_assets table has owner-only authenticated RLS policies.
-- Run it with caller privileges so RLS remains authoritative and the RPC no
-- longer needs SECURITY DEFINER.

alter function public.activate_background_music(uuid)
  security invoker;
