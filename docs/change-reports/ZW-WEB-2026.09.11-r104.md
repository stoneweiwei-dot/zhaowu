# 昭梧更新報告｜ZW-WEB-2026.09.11-r104

## 本次改動
- 以目前 main 的 r103 Safari／語言穩定版為基底，重新落地「每日穿衣｜五行色彩」模組，避免直接合併已落後 5 個 main commit 的舊 PR。
- 首頁保留精簡入口，完整內容放到 `/daily-colors`。
- 五種狀態集中在 `src/lib/daily-colors.ts`，支援繁體、簡體、英文；今日參考只使用今日日干五行作輕量提示，使用者可自行改選。
- 修正命名與用字：金狀態統一為「鎏金」，土色統一為「赭」，簡體頁不再混入「參考」。
- 品牌句統一為「昭於未見，梧於有歸」／「昭于未见，梧于有归」。
- 修正登入會員在完整報告成功同步後，儲存按鈕仍可能停留在「保存到我的昭梧」的狀態；現在成功同步即顯示「更新已保存報告」，並保留穩定測試定位。
- 保留 main 已完成的 Hindi 顯示層、iPhone Safari 路由隔離、夜間可讀性與 r103 其他修正。
- 非 main Vercel Preview 維持略過，避免無必要消耗部署額度。

## 為什麼改
- 舊 PR #280 已落後 main 5 個 commit，直接合併會把 r101–r103 的語言與 Safari 收口重新帶回衝突。
- 站主要求每日穿衣模組真正進入網站，並要求既有品牌與宋式宣紙視覺延續，而不是停留在設計稿。
- r104 首輪 iPhone Safari 回歸發現會員完整報告成功同步後，durable-save 標記只依賴報告 ID 完全相等；測試／回傳 ID 正規化差異會使按鈕文案不更新，因此改為以成功同步狀態作為主要依據。

## 影響範圍
- 新增每日色彩資料、模組元件、獨立路由與 iPhone Safari 專項測試。
- 首頁將舊的內嵌 FiveElementWardrobe 換成共用 DailyColorsModule。
- 更新品牌文案、release ledger 與非 main 部署節流。
- `ResultView` 僅調整成功同步後的 durable-save UI 狀態與測試定位，不改變報告內容、付款邏輯或 Supabase schema。
- 不修改子平八字引擎、登入機制、付款、Supabase schema、正式 Service Worker 邏輯。

## 回滾
- 回滾 r104 commits 即可恢復 r103；本次無資料庫 migration。

## 驗證
- Production CI：Deploy gate、Engine suite、iPhone Safari 必須全綠才可合併。
- 修正 durable-save 後的 CI run #1411：Deploy gate、Engine suite、iPhone Safari 全部通過。
- 合併後再核對 main SHA、Production READY SHA、`/`、`/daily-colors` 與 runtime errors；SHA 不一致不宣稱已上線。
