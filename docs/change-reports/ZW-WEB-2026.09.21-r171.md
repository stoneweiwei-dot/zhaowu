# 昭梧更新報告｜ZW-WEB-2026.09.21-r171

## 為什麼改
原「五行穿衣」只有五組色彩狀態，容易被誤讀成喜用神／幸運色，而且手機端使用橫向滑卡。站主提供完整十四色 Color Magic 內容，要求收進首頁第一個「今日指引」小程序，而不是擴張正式命書。

## 本次改動
- 「每日穿衣｜五行色彩」改為「昭梧 · 今日色意」。
- 完整納入紅、橘、黃、綠、藍、水藍／藍綠、紫、粉紅、棕、黑、白、灰、金、銀十四色。
- 每色固定四層：核心象徵／適合現在／什麼時候少一點／今日提醒。
- 黃曆只按日干五行給一個輕量參考色：木綠、火紅、土棕、金金、水藍；明確標示不是喜用神或幸運色。
- 使用者可依真實狀態自由改選，個人色彩記憶優先。
- iPhone 選色由橫向卡片軌道改成雙欄直式，不需要左右拖動。
- 完整互動指南仍用既有 `/daily-colors`，不另建產品或 production。
- 新增 `docs/DAILY-COLOR-INTENT.md` 並同步 Instruction Registry。

## 影響範圍
首頁「今日指引」第二頁與 `/daily-colors`。

## 受保護範圍
不改八字 deterministic calculation truth、格局／病藥／ODL／FC／承載、正式命書、Auth、Payment、Supabase schema/data/env、站主後台或圖片流程。

## 回滾
回退本次 PR；無資料遷移。

## 驗證狀態
待 Deploy gate／Engine suite／iPhone Safari required checks 與正式 Vercel Production 驗證。CI 通過不等於 Production 已上線。
