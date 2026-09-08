create index if not exists classic_passage_matches_passage_id_idx
  on public.classic_passage_matches (passage_id);

alter policy report_requests_insert_access on public.report_requests
  with check ((user_id = (select auth.uid())) or private.zhaowu_is_owner());

alter policy report_requests_select_access on public.report_requests
  using ((user_id = (select auth.uid())) or private.zhaowu_is_owner());

alter policy report_requests_update_access on public.report_requests
  using ((user_id = (select auth.uid())) or private.zhaowu_is_owner())
  with check ((user_id = (select auth.uid())) or private.zhaowu_is_owner());
