# 昭梧更新報告｜ZW-WEB-2026.09.24-r191

## 本次改動

- 正式站維持唯一完整分析核心，吸收昭梧 Lite 的手機閱讀外殼：主閱讀寬度收至 560px，米紙、青玉、朱砂、金褐成為統一色彩基線。
- 首頁卡片降低圓角、陰影與裝飾密度；延伸內容維持折疊，主生辰／命盤／問題流程保持第一視覺層級。
- zhaowu-guide.ston1004.chatgpt.site 定位鎖定為昭梧 Lite：免費快速體驗／備援／導流，不建立第二套帳號、付費、Supabase 或命理核心。
- Supabase 組織已確認付費容量可用且 Project `ACTIVE_HEALTHY`；解除 r181 臨時寫入凍結，恢復站主背景／圖庫／登入素材與新命誥圖寫入。

## 為什麼改

Lite 版本的窄幅手機閱讀尺度與克制卡片層級更適合作為正式站外殼；此次只收斂呈現，不改變 r191 已合併的命理與報告規則。

## 影響範圍

- 正式站首頁、報告與折疊入口的視覺寬度、色彩與卡片密度。
- /updates 的當期英文摘要。
- 正式站／Lite 的產品邊界文件。

## 受保護範圍

- 不修改四柱、真太陽時、格局、旺衰、病藥、ODL／FC、歲運等計算與判斷核心。
- 不修改 r191「結構不是五行資產負債表」等已合併規則。
- 不修改 owner-only 登入、付款、Supabase schema、r190 首頁 fail-open。
- Storage 實體用量仍為 1,035,403,153 bytes；本次不再把它當作 Pro 下的寫入 blocker，但不代表已具備降回 Free 的安全餘量。既有 Storage API、MIME、大小、signed-upload ticket 與 owner-only 安全邊界全部保留。

## 驗證狀態

- 合併前：Deploy gate、Engine suite、iPhone Safari CI、TypeScript／Vite build、r191 convergence contract。
- 合併後：Vercel Production SHA 必須等於 current main；正式站核心路徑 smoke；Production runtime error scan。
- 真 iPhone Safari 人工觀感未實測時必須標記未人工驗證。

## 回滾

只回滾 r191 CSS／release metadata；不得回滾 r191 命理規則、r190 fail-open、owner-only auth 或已完成 Storage 安全清理。
