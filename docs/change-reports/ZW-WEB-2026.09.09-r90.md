# 昭梧更新報告｜ZW-WEB-2026.09.09-r90

## 本次改動
- 共用生辰本機快取改為「登入帳號綁定」：只有目前已驗證登入的帳號可以讀寫自己的本機生辰快取；登出時立即移除本機生辰與帳號綁定標記，換帳號時若 owner 不一致也會清除舊資料。
- Auth Provider 在 OAuth／Email session 還原與 auth reload 時同步更新共用生辰的有效帳號，避免初始化尚未確認登入狀態時，首頁先讀出上一個帳號留在同一瀏覽器的出生資料。
- 圖片全屏預覽改為完全不透明 `#100e0c` 背景，補上全 viewport、isolation、overflow／overscroll 控制，避免底下報告、分享卡標題、音樂按鈕等內容穿透形成重影。
- 新增回歸測試，直接使用站主截圖中出現的「歲運作用鏈／大運層／流年層／流月層／排序依序核對原局」樣本，鎖定客戶結果與分享圖只保留白話結論，不得顯示內部推演鏈。
- 公開版本號更新至 r90。

## 為什麼改
- 站主在未登入狀態仍看到先前儲存在同一 iPhone Safari 的出生日期、時間與地點。這不是全網公開資料，但屬於同一瀏覽器／裝置上的真實隱私洩漏風險：下一位使用該裝置的人可能看到上一位帳號資料。
- 原圖片 viewer 使用 `rgba(..., 0.94)` 半透明底層，因此報告頁或分享卡本體會在預覽圖片後方若隱若現，形成重影。
- 截圖亦顯示客戶答案及分享圖曾帶出內部歲運作用鏈。現行 customer-copy 已有過濾器，本次補上以實際截圖內容為基準的回歸契約，防止之後再次外洩。

## 影響範圍
- `src/lib/shared-birth.ts`
- `src/lib/auth/provider.tsx`
- `src/image-viewer.css`
- `scripts/privacy-overlay-regression.test.mjs`
- `src/lib/site-stats.ts`
- `scripts/release-ledger.test.mjs`
- `docs/change-reports/ZW-WEB-2026.09.09-r90.md`
- 不修改 Supabase schema、資料表、RLS、環境變數、登入方式、命理引擎、付款或報告資料模型。

## 回滾
- 回滾本次 r90 提交即可恢復 r89 程式；不涉及資料庫 schema rollback。
- 回滾會重新引入同機登出後生辰快取可見與半透明圖片預覽問題，因此除非另有等價修復，不建議回退。

## 驗證要求
- `privacy-overlay-regression` 必須通過：未登入不能讀寫先前帳號生辰、本機 owner 必須匹配、viewer 必須不透明、截圖中的內部歲運鏈必須被 customer-copy 移除。
- release ledger 必須通過。
- Vercel Production build 必須成功。
- 最終 Production `githubCommitSha` 必須等於當時 `main` HEAD。
- 正式首頁必須回傳 200；iPhone Safari 實機仍需確認登出後首頁不再顯示舊生辰，且圖片預覽底下不再透出頁面文字。
