# 昭梧更新報告｜ZW-WEB-2026.09.08-r84

## 本次改動

- 將 Loading 目標退出由 3 秒調整為 2.4 秒，硬退出由 5 秒收緊為 2.8 秒；即使初始化或後端失敗，裝飾動畫也不能阻塞首頁、登入與帳戶入口達 3 秒。
- 背景音樂控制改為依 `zh-Hant / zh-Hans / en` 輸出可見狀態、`aria-label` 與 fallback 曲名，修正英文頁仍朗讀／顯示繁體中文的問題。
- 更新 `CURRENT-STATE.md`：X 登入與六道習氣測驗已落地，不再列為缺失；Loading 時序改記實際程式契約。

## 為什麼改

Production r83 的 `INTRO_GATE_HARD_EXIT_MS` 仍是 5000ms，違反 iPhone Safari 優先契約的 3 秒上限；同時 `BackgroundMusic` 把繁體中文直接寫死，造成英文與簡中頁面殘留繁中。狀態文件亦落後於已上線的 X 登入與六道測驗。

## 影響範圍

- 全站首次進入 Loading gate
- 全站浮動背景音樂控制
- 繁中／簡中／英文無障礙標籤與狀態文字
- `docs/CURRENT-STATE.md`
- Loading、背景音樂與 release ledger 回歸測試

## 保護範圍

本次沒有修改八字、紫微、七政、一掌經、D60 或其他命理計算；沒有修改登入 provider、Supabase schema／權限／資料、付款、報告內容、圖片供應商、Owner 權限或路由。

## 回滾

如需回滾，恢復 r83 的 `src/lib/intro-gate-policy.ts`、`src/components/intro-gate.tsx`、`src/components/background-music.tsx`、對應測試、`CURRENT-STATE.md` 與 `src/lib/site-stats.ts`。不需修改資料庫或使用者資料。

## 驗證狀態

- Source：Loading hard exit 契約為 2800ms；背景音樂三語文案由目前 locale 決定。
- Deploy Gate／Engine Suite／iPhone Safari／Production：以 r84 最終 commit 的 CI、Vercel Production 與正式站實際驗證結果為準。
- iPhone 實機：自動 WebKit 測試不能取代站主實機，若未由真機確認則保持「未實機驗證」。
