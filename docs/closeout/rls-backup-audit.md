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

cbcdd766 的流程只匯出 schema。PR #1156 已改用 session pooler 5432 匯出資料，且零 COPY 即失敗；尚未合併，也未完成隔離還原演練。七日 artifact 到期前仍須完成冷儲存交接。詳見 backup-data-export-plan.md。

## 十一張表的權限修正與靜態存取清冊

上表描述修正前基線。20261127230000_revoke_truncate_anon_authenticated.sql 對十一張表各自撤回 anon 與 authenticated 的 TRUNCATE，可重複執行。site_visits 原有 INSERT 與 WITH CHECK (true) 仍在。此次只審查版本庫，未連線、套用或驗證正式庫有效權限。

全庫追蹤的程式、SQL 與工作流程逐表搜尋；下列括號為行號，包括測試替身、權限定義與文字引用。檢查 scripts、functions、e2e、supabase/functions 及 SQL 中的 TRUNCATE 用途，未見業務或測試執行對這十一張表清表的路徑。基線 GRANT、權限斷言及文字截斷不執行清表。

### background_assets

資產清單與逐列新增、更新、刪除。

- .github/zvec-knowledge/media.mjs（216）
- e2e/auspicious-emblems.iphone-safari.spec.ts（56）
- e2e/final-closeout.spec.ts（80）
- scripts/materialize-supabase-static-media.py（42、47）
- src/lib/background-assets.ts（84、105、145、175、191、201、220、241）
- supabase/functions/zhaowu-owner-data/index.ts（527、588、607、615、617、624、631、634）
- supabase/migrations/20260101000000_baseline.sql（15、282、284、623、625、1072、1559、1560、1578、1597、1598、1599、1600、1601、1602、1603、1604、1605、1606、1716、1717、1718、1719）
- supabase/migrations/20260827_gallery_support_legacy_bucket_import.sql（29、37）

### background_music_assets

曲庫查詢及站主逐列維護。

- .github/zvec-knowledge/media.mjs（222）
- src/lib/background-music-assets.ts（97、107、290、336）
- src/lib/background-music-upload.ts（129、153）
- supabase/migrations/20260101000000_baseline.sql（32、293、295、491、493、1073、1228、1232、1236、1579、1607、1608、1609、1610、1611、1612、1613、1614、1615、1616、1720、1721、1722、1723）
- supabase/migrations/20260906202500_background_music_security_invoker.sql（2）

### daily_usage

REST GET、PATCH、POST 更新用量。

- supabase/functions/answer-reasoner/index.ts（106、113、119、125）
- supabase/functions/answer-writer/index.ts（72、74、80、83、88）
- supabase/migrations/20260101000000_baseline.sql（101、337、339、711、713、722、724、733、735、1008、1010、1084、1085、1408、1414、1420、1426、1561、1562、1583、1617、1618、1619、1620、1621、1622、1730、1731、1732、1733）

### gallery_analysis_runs

分析執行紀錄的逐列讀寫。

- supabase/functions/gallery-vision-audit/index.ts（255、315）
- supabase/migrations/20260101000000_baseline.sql（110、348、350、535、537、744、746、1584、1623、1624、1734、1735、1736、1737）

### gallery_asset_knowledge

知識列查詢與寫入。

- .github/zvec-knowledge/media.mjs（212）
- scripts/decree-gallery-seed.test.mjs（9）
- scripts/gallery-vision-authority.test.mjs（28）
- supabase/functions/gallery-vision-audit/index.ts（259、266、276、307、312）
- supabase/functions/generate-decree-image/index.ts（159）
- supabase/functions/zhaowu-owner-data/index.ts（423）
- supabase/migrations/20260101000000_baseline.sql（124、359、361、755、757、766、768、1019、1021、1086、1087、1585、1625、1626、1627、1628、1629、1630、1738、1739、1740、1741）
- supabase/migrations/20260827104000_flatten_gallery_taxonomy.sql（20）
- supabase/migrations/20260827105500_demote_pixel_only_visual_knowledge.sql（3）

### gallery_assets

公開清單讀取與站主逐列維護。

- .github/zvec-knowledge/media.mjs（206）
- e2e/public-atlas.iphone-safari.spec.ts（20）
- e2e/tea-guardian.iphone-safari.spec.ts（19）
- src/components/curated-video-shelf.tsx（111）
- src/lib/gallery-assets.ts（81、89、99、150、158、187、196、203、213、222、229、245）
- src/lib/intro-visual-source.ts（5、72、76）
- src/lib/owner-bundled-report-art.ts（4）
- src/lib/public-atlas.ts（20）
- supabase/functions/gallery-ingest-finalize/index.ts（103、112、133）
- supabase/functions/gallery-vision-audit/index.ts（267）
- supabase/functions/generate-decree-image/index.ts（152、179）
- supabase/functions/zhaowu-owner-data/index.ts（412、641、711、727、729、739、746、750、752、759、766、770、772、779、782）
- supabase/migrations/20260101000000_baseline.sql（149、370、372、546、548、777、779、788、790、799、801、1021、1088、1089、1090、1586、1631、1632、1633、1634、1635、1636、1637、1638、1639、1640、1742、1743、1744、1745）
- supabase/migrations/20260827104000_flatten_gallery_taxonomy.sql（3、20）
- supabase/migrations/20260827105500_demote_pixel_only_visual_knowledge.sql（10）
- supabase/migrations/20260827_gallery_support_legacy_bucket_import.sql（1、4、32、40）
- supabase/migrations/20260828062000_backfill_gallery_semantic_proxy_tags.sql（2、5、20、31、42、53、64）

### owner_sessions

基線 SQL 與 RLS 定義。

- supabase/migrations/20260101000000_baseline.sql（177、403、405、557、559、810、812、1030、1032、1091、1092、1589、1649、1650、1651、1652、1653、1654、1655、1656、1753、1754、1755、1756）

### release_history

發布紀錄 REST 查詢及版本核對。

- scripts/release-ledger.release.mjs（61）
- src/lib/site-stats.ts（185）
- supabase/migrations/20260101000000_baseline.sql（217、447、449、590、592、1565、1566、1593、1661、1662、1765、1766、1767、1768）

### report_requests

報告讀取、儲存與逐列管理。

- e2e/authenticated-report-save.iphone-safari.spec.ts（48）
- scripts/owner-report-edits.test.mjs（18、104、136）
- scripts/report-persistence.test.mjs（67、72）
- src/lib/supabase-rest.ts（411、466、506、538、556、565）
- supabase/functions/generate-decree-image/index.ts（217、325、472、511、547）
- supabase/functions/prepare-paid-visual/index.ts（109）
- supabase/functions/view-decree-image/index.ts（55）
- supabase/functions/zhaowu-owner-data/index.ts（323、337、352、402、489、916）
- supabase/functions/zhaowu-owner-data/report-edits.mjs（84、112）
- supabase/functions/zhaowu-owner-data/reports.mjs（8）
- supabase/migrations/20260101000000_baseline.sql（225、458、460、601、603、898、900、909、911、920、922、931、933、942、944、953、955、964、966、988、1063、1065、1095、1096、1097、1098、1099、1567、1568、1569、1570、1594、1663、1664、1665、1666、1667、1668、1669、1670、1769、1770、1771、1772）
- supabase/migrations/20260911125000_paid_visual_blueprints_r113.sql（3）
- supabase/migrations/20261024000000_report_section_edits.sql（6）
- supabase/verify-rls-backup.sql（56）

### site_settings

設定讀取及逐鍵寫入。

- api/owner-data.js（181）
- e2e/authenticated-report-save.iphone-safari.spec.ts（47）
- lib/owner-site-skin-public.js（44）
- lib/threads-meta-callback.js（72、89）
- scripts/intro-loading.test.mjs（39）
- scripts/owner-theme-publish-fallback.test.mjs（34）
- scripts/shared-site-skin.test.mjs（147）
- scripts/site-views-footer.test.mjs（85）
- src/lib/bootstrap-readiness.ts（41）
- src/lib/site-stats.ts（184）
- supabase/functions/answer-reasoner/index.ts（87）
- supabase/functions/answer-writer/index.ts（7、54）
- supabase/functions/zhaowu-owner-data/index.ts（903）
- supabase/migrations/20260101000000_baseline.sql（263、469、471、1541、1571、1572、1595、1671、1672、1673、1674、1675、1676、1677、1678、1679、1680、1773、1774、1775、1776）

### site_visits

造訪統計寫入與彙總查詢。

- supabase/migrations/20260101000000_baseline.sql（269、480、482、612、614、1486、1538、1539、1573、1574、1596、1681、1682、1683、1684、1777、1778、1779、1780）
