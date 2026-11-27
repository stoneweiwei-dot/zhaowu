# Supabase RLS 與備份靜態稽核

依檔名順序核對 migration 中明寫的建表、RLS 與 policy。下表保留 policy 條件供複核；動態 SQL、正式庫漂移與實際角色授權仍須另驗。

|資料表|建表版本|RLS|明文 policy 與條件|匿名寫入與表權限判讀|
|---|---|---|---|---|
|public.background_assets|20260101000000|啟用|background_assets_owner_delete：AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner())<br>background_assets_owner_insert：AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (private.zhaowu_is_owner())<br>background_assets_owner_read：AS PERMISSIVE FOR SELECT TO "authenticated" USING ((private.zhaowu_is_owner() OR (enabled = true)))<br>background_assets_owner_update：AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner())<br>background_assets_public_read：AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((enabled = true))|未見向匿名角色無條件開放列寫入的明文 policy。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.background_music_assets|20260101000000|啟用|background_music_owner_delete：AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner())<br>background_music_owner_insert：AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (private.zhaowu_is_owner())<br>background_music_owner_read：AS PERMISSIVE FOR SELECT TO "authenticated" USING ((private.zhaowu_is_owner() OR (enabled = true)))<br>background_music_owner_update：AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner())<br>background_music_public_read：AS PERMISSIVE FOR SELECT TO "anon" USING ((enabled = true))|未見向匿名角色無條件開放列寫入的明文 policy。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.classic_passage_matches|20260101000000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.classic_passages|20260101000000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.classic_sources|20260101000000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.daily_usage|20260101000000|啟用|daily_usage_insert_own：AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)))<br>daily_usage_select_own：AS PERMISSIVE FOR SELECT TO "authenticated" USING ((user_id = ( SELECT auth.uid() AS uid)))<br>daily_usage_update_own：AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)))|未見向匿名角色無條件開放列寫入的明文 policy。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.gallery_analysis_runs|20260101000000|啟用|gallery_analysis_runs_owner_read：AS PERMISSIVE FOR SELECT TO "authenticated" USING (private.zhaowu_is_owner())|未見向匿名角色無條件開放列寫入的明文 policy。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.gallery_asset_knowledge|20260101000000|啟用|gallery_asset_knowledge_owner_read：AS PERMISSIVE FOR SELECT TO "authenticated" USING ((private.zhaowu_is_owner() OR ((analysis_status = 'approved'::text) AND (client_eligible = true))))<br>gallery_asset_knowledge_owner_update：AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner())<br>gallery_asset_knowledge_public_read：AS PERMISSIVE FOR SELECT TO "anon" USING (((analysis_status = 'approved'::text) AND (client_eligible = true)))|未見向匿名角色無條件開放列寫入的明文 policy。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.gallery_assets|20260101000000|啟用|gallery_assets_owner_delete：AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner())<br>gallery_assets_owner_insert：AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (private.zhaowu_is_owner())<br>gallery_assets_owner_read：AS PERMISSIVE FOR SELECT TO "authenticated" USING ((private.zhaowu_is_owner() OR (enabled = true)))<br>gallery_assets_owner_update：AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner())<br>gallery_assets_public_read：AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((enabled = true))|未見向匿名角色無條件開放列寫入的明文 policy。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.life_view_article_views|20260101000000|啟用|life_view_counts_read：AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true)|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.owner_email_aliases|20260101000000|啟用|owner_email_aliases_owner_read：AS PERMISSIVE FOR SELECT TO "authenticated" USING (private.zhaowu_is_owner())|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.owner_sessions|20260101000000|啟用|owner_sessions_owner_delete：AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner())<br>owner_sessions_owner_insert：AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (private.zhaowu_is_owner())<br>owner_sessions_owner_read：AS PERMISSIVE FOR SELECT TO "authenticated" USING (private.zhaowu_is_owner())<br>owner_sessions_owner_update：AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner())|未見向匿名角色無條件開放列寫入的明文 policy。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.profiles|20260101000000|啟用|profiles_select_self：AS PERMISSIVE FOR SELECT TO "authenticated" USING ((id = ( SELECT auth.uid() AS uid)))<br>profiles_update_self：AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((id = ( SELECT auth.uid() AS uid))) WITH CHECK ((id = ( SELECT auth.uid() AS uid)))|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.promo_codes|20260101000000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.promo_redemptions|20260101000000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.release_history|20260101000000|啟用|release_history_public_read：AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true)|未見向匿名角色無條件開放列寫入的明文 policy。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.report_requests|20260101000000|啟用|report_requests_delete_owner：AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner())<br>report_requests_insert_access：AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) OR private.zhaowu_is_owner()))<br>report_requests_select_access：AS PERMISSIVE FOR SELECT TO "authenticated" USING (((user_id = ( SELECT auth.uid() AS uid)) OR private.zhaowu_is_owner()))<br>report_requests_update_access：AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((user_id = ( SELECT auth.uid() AS uid)) OR private.zhaowu_is_owner())) WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) OR private.zhaowu_is_owner()))|未見向匿名角色無條件開放列寫入的明文 policy。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.site_settings|20260101000000|啟用|site_settings_owner_delete：AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner())<br>site_settings_owner_insert：AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (private.zhaowu_is_owner())<br>site_settings_owner_read：AS PERMISSIVE FOR SELECT TO "authenticated" USING ((private.zhaowu_is_owner() OR (public_read = true)))<br>site_settings_owner_update：AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner())<br>site_settings_public_read：AS PERMISSIVE FOR SELECT TO "anon" USING ((public_read = true))|未見向匿名角色無條件開放列寫入的明文 policy。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.site_visits|20260101000000|啟用|site_visits_insert_public：AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true)<br>site_visits_owner_read：AS PERMISSIVE FOR SELECT TO "authenticated" USING (private.zhaowu_is_owner())|無條件 INSERT。明文授予 TRUNCATE，超出逐列政策保護範圍。|
|public.gallery_ingest_queue|20260827195500|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.paid_visual_blueprints|20260911125000|啟用|paid_visual_blueprints_select_access：for select to authenticated using ( user_id = (select auth.uid()) or private.zhaowu_is_owner() )|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.report_purchase_entitlements|20261003170000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.social_threads_accounts|20261012232648|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.social_autopublish_settings|20261016120000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.social_post_queue|20261016120000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.social_queue_gateway|20261016120100|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.visitor_signup_attempts|20261016130000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.article_editor_overrides|20261017000000|啟用|Article published overlay read：for select to anon, authenticated using (true)|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.owner_devices|20261022000000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.social_meta_accounts|20261022185935|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.report_section_edits|20261024000000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.rate_limit_buckets|20261030120000|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.life_view_article_ids|20261030120100|啟用|未見明文 policy，RLS 預設拒絕一般角色|未見向匿名角色無條件開放列寫入的明文 policy。|
|public.visitor_charts|20261117090000|啟用|visitor_charts_owner_read：for select to authenticated using (private.zhaowu_is_owner())|未見向匿名角色無條件開放列寫入的明文 policy。|

## 還原判定

目前無法由此流程證明資料可還原。工作流程只手動執行一次預設 schema dump，未另匯出資料、角色或 Storage 物件內容。檔案非空且含 CREATE TABLE 只證明含 DDL。七日後 artifact 到期，冷儲存交接另須佐證。workflow 註解的專案與 AGENTS.md 所列專案亦不同。

請在隔離環境核對來源、角色、schema、資料與媒體備份，依相依順序還原，逐表比對筆數、外鍵、物件雜湊與權限，再記錄演練時間與結果。備份流程已由 PR #1156 修改中。此次未連線或執行還原。

基線的 site_visits 容許 anon 與 authenticated INSERT，WITH CHECK (true) 沒有列值限制；基線另授予 TRUNCATE，此操作不受 RLS 限制。需對照後續 GRANT／REVOKE 與預期匿名造訪計數行為複核。

共 35 份 migration，34 張明文建立的資料表均有啟用 RLS 的語句。依具名表的明文 GRANT／REVOKE 重播，有 11 張仍可見 anon 的 TRUNCATE 授權，見各表末欄。表授權與列政策必須分開核對。備援計畫 §2.3 已明列隔離還原要求，但計畫本身沒有執行證據；文件對來源專案的記載有差異，本次未判定線上專案。
