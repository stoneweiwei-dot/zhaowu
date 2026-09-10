# 昭梧更新報告｜ZW-WEB-2026.09.10-r101

## 本次改動
- 修正 iPhone Safari 宣紙殼層回歸測試：通用公開頁面的背景檢查不再把需要登入狀態的 `/account` 當成穩定公開路由，改以 `/login` 驗證；`/account` 的未登入導向仍由既有獨立測試覆蓋。
- 修正會員完整報告保存回歸測試：不再要求背景雲端同步必須在 5 秒內先把按鈕改名為「更新已保存報告」，而是驗證「保存到我的昭梧／更新已保存報告」的實際可用保存操作，並點擊後確認保存成功與更新狀態。
- `vercel.json` 增加非 `main` branch 快速退出：feature／PR commit 直接由 `ignoreCommand` 略過完整 Preview build；`main` 仍保留既有 docs／e2e-only diff 節流邏輯。
- Vercel `ignoreCommand` 維持在 256 字元 schema 上限內。

## 為什麼改
- 最新 Production CI 的 33 個 iPhone Safari 測試中有 31 個通過、2 個失敗。兩個失敗分別來自未登入 `/account` 的正常重新導向，以及非同步報告同步完成時間被舊測試誤當成 5 秒硬條件；兩者都不是目前產品功能缺失。
- 過去 feature branch 每個 commit 都可能建立完整 Vercel Preview，造成不必要的部署額度消耗。本輪先在獨立 branch 驗證節流生效，再繼續其他修改。

## 影響範圍
- `e2e/auspicious-emblems.iphone-safari.spec.ts`。
- `e2e/authenticated-report-save.iphone-safari.spec.ts`。
- `vercel.json` 的 Git Preview build 節流。
- `src/lib/site-stats.ts` 與本次 release ledger。
- 不修改八字／命理引擎、登入／權限邏輯、報告內容生成、保存 API、付款、Supabase schema、客戶畫面或品牌視覺。

## 回滾
- 將 `vercel.json` 的 `ignoreCommand` 還原到 r100。
- 將兩個 iPhone Safari 測試還原到 r100 契約即可；本次沒有資料庫 migration，也沒有客戶資料變更。

## 驗證
- feature branch 第一個節流 commit 對應 Vercel deployment 必須為 `CANCELED`，證明非 `main` 不再完整 Preview build。
- PR / GitHub Engine suite、Deploy gate 與 iPhone Safari 必須全部通過。
- 合併 `main` 後，Vercel Production 必須為 `READY`，且 `githubCommitSha` 必須與新的 `main` 完全一致。
- 正式站 `/` 與 `/login` 必須可讀取；近時段 runtime errors 不得新增。
- iPhone 真機最終驗收仍屬獨立待辦，不以 WebKit CI 取代。
