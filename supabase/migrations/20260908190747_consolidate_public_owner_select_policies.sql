alter policy background_assets_public_read on public.background_assets
  to anon
  using (enabled = true);
alter policy background_assets_owner_read on public.background_assets
  to authenticated
  using (private.zhaowu_is_owner() or enabled = true);

alter policy background_music_public_read on public.background_music_assets
  to anon
  using (enabled = true);
alter policy background_music_owner_read on public.background_music_assets
  to authenticated
  using (private.zhaowu_is_owner() or enabled = true);

alter policy gallery_asset_knowledge_public_read on public.gallery_asset_knowledge
  to anon
  using ((analysis_status = 'approved'::text) and (client_eligible = true));
alter policy gallery_asset_knowledge_owner_read on public.gallery_asset_knowledge
  to authenticated
  using (private.zhaowu_is_owner() or ((analysis_status = 'approved'::text) and (client_eligible = true)));

alter policy gallery_assets_public_read on public.gallery_assets
  to anon
  using (enabled = true);
alter policy gallery_assets_owner_read on public.gallery_assets
  to authenticated
  using (private.zhaowu_is_owner() or enabled = true);

alter policy site_settings_public_read on public.site_settings
  to anon
  using (public_read = true);
alter policy site_settings_owner_read on public.site_settings
  to authenticated
  using (private.zhaowu_is_owner() or public_read = true);
