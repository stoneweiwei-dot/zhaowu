# 昭梧更新報告｜ZW-WEB-2026.09.11-r105

## 本次改動
- 將已驗證的「每日穿衣｜五行色彩」重新整合到目前最新 main，而不是直接合併已與 main 分岔的舊 PR。
- 首頁保留精簡入口，完整指南放到 `/daily-colors`；青雲、絳華、坤寧、鎏金、涵虛五種狀態集中維護。
- 今日提示僅使用今日日干五行作輕量參考，並允許使用者自行改選狀態；明確區分日常色彩象意與個人八字喜忌。
- 統一繁簡品牌句為「昭於未見，梧於有歸」／「昭于未见，梧于有归」。
- 保留目前 main 已完成的六語顯示、簡中首次預設、iPhone Safari 路由隔離、Guardian style pool、R6.2.1 指令治理與完整報告持久化修正。
- Vercel 非 main 分支繼續跳過部署，只有 main 允許進 Production，避免額度被預覽分支消耗。

## 為什麼改
- 原 PR #281 已通過 Engine、Deploy gate 與 iPhone Safari，但在等待期間 main 又前進，直接合併產生衝突。
- 本次改用最新 main 為基底，只帶入仍需要的每日色彩與品牌修正，避免覆蓋後來已完成的語言、OG、護法圖庫與指令治理修正。

## 影響範圍
- 新增 `src/lib/daily-colors.ts`、`src/components/daily-colors-module.tsx`、`src/routes/daily-colors.tsx`。
- 首頁以共用 DailyColorsModule 取代舊的內嵌色彩元件。
- 新增 daily-colors deploy contract 與 iPhone Safari 回歸測試。
- 更新品牌文案、release ledger 與 Vercel 非 main 節流設定。
- 不修改子平八字核心算法、付款、Supabase schema 或登入機制。

## 回滾
- 回滾 r105 單一整合 commit 即可恢復目前 r104 production；本次無資料庫 migration。

## 驗證
- 合併前要求 Deploy gate、Engine suite、iPhone Safari 全綠。
- 合併後核對 main SHA = Vercel Production READY SHA，並檢查 `/`、`/daily-colors` 與 production runtime errors。
