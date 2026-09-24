# 昭梧更新報告｜ZW-WEB-2026.09.24-r191

## 本次改動

- 正式站維持唯一完整分析核心，吸收昭梧 Lite 的手機閱讀外殼：主閱讀寬度收至 560px，米紙、青玉、朱砂、金褐成為統一色彩基線。
- 首頁卡片降低圓角、陰影與裝飾密度；延伸內容維持折疊，主生辰／命盤／問題流程保持第一視覺層級。
- 英文與繁中沿用同一資訊架構，但不把中文排版硬套到英文。
- zhaowu-guide.ston1004.chatgpt.site 定位鎖定為昭梧 Lite：免費快速體驗／備援／導流，不建立第二套帳號、付費、Supabase 或命理核心。

## 為什麼改

Lite 版本證明較窄的手機閱讀尺度、安靜的紙色與更克制的卡片層級更接近昭梧需要的產品感。此次只把這些成熟的外殼規則帶回正式站，不重建第二個正式網站，也不改變既有命理與報告 truth。

## 影響範圍

- 正式站首頁、報告與折疊入口的視覺寬度、色彩與卡片密度。
- /updates 的當期英文更新摘要。
- 發布版本與正式站／Lite 的產品邊界文件。

## 受保護範圍

本版不修改：

- 四柱、真太陽時、子時換日、格局、旺衰、病藥、ODL／FC、歲運等計算與判斷核心。
- 第一屏直接回答、正式四柱、單一連續報告、身體注意事項、未知時辰降級與命誥圖獨立生成契約。
- owner-only 登入、付款、Supabase schema。
- r190 首頁 fail-open lazy mount。
- Storage 寫入凍結；目前實體 Storage 仍按清理後值 1,035,403,153 bytes 管理，未因本次 UI 收官而虛稱已增加安全餘量。

## 驗證狀態

合併前必須通過：

- Deploy gate
- Engine suite
- iPhone Safari CI
- TypeScript／Vite build
- r191 Lite-convergence contract

合併後必須確認：

- Vercel Production SHA = current main SHA。
- 正式站首頁、/login、/updates、出生資料與核心問答路徑 smoke。
- Production runtime error scan。
- 真 iPhone Safari 人工觀感若未實測，必須標記為未人工驗證，不能由 CI／桌面 viewport 代替。

## 回滾

若 r191 視覺收斂造成可讀性或手機操作回歸，只回滾 r191 CSS／release metadata；不得回滾 r190 fail-open、正式命理核心、owner-only auth 或已完成的 Storage 安全清理。
