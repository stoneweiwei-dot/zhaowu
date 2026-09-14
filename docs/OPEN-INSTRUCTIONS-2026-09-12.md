# 昭梧未完成指令對帳｜CURRENT 2026-09-14

本文件保留原檔名，只作唯一未完成指令對帳。凡與本文件衝突的舊聊天、舊 Issue、舊 PR、舊部署、舊 AppDeploy／Netlify 說明均不得重新激活。

## 正式來源

- GitHub：`stoneweiwei-dot/zhaowu` → `main`
- Runtime Production：Vercel `stone-zhaowu-official`
- 清理前最新正式 runtime SHA：`b71e9054f73f28ddcc6b7ad1937a3105c14c20f0`（r130）
- Supabase：`plgpxusmemnmzckbwtiv`
- docs-only commit 可使 `main` 前進但由 `vercel.json` ignore 規則跳過 runtime build；不得因此誤判 Production 未對齊。

## 唯一仍有效的待辦

| 來源 | 狀態 | 唯一剩餘範圍 |
|---|---|---|
| Linear `STO-5` | In Progress | 真 iPhone Safari、站主獨立 Cookie 登入／帳戶、完整公開語言報告、D60 Gate/test-vector、PWA 已安裝更新、圖片失敗仍交付文字 |
| Linear `STO-14` | Backlog | 使用者主動命誥圖、真實 image provider、Gallery fallback、保存與權限；未重啟前不得消耗 provider 額度 |
| Linear `STO-11` | Todo | 公開版本號＋「最新版本更新內容」頁 |

除此之外不得再建立同題平行待辦。

## 已完成／已收口

- Logo rollout：Linear `STO-12` 已 Done；不復活 PR #269。
- GitHub #59：已整合至 `STO-5`／`STO-14` 並關閉。
- 舊 paid visual PR #295：已歸檔關閉；未來如重啟必須從當時最新 main 新建分支。
- D60 舊 PR #304：不得合併；現行使用 current main 的 `D60ReliabilityGate`。
- Vercel 非 main Preview 節流：已存在；`owner-music` deployment disabled。
- 普通用戶登入／註冊：已退出 active path；唯一登入為站主密鑰＋`__Host-zhaowu_owner_session`，不依賴 Supabase Auth。
- 公共 Gallery／美工資產：已改同源靜態路徑；不得再把公開圖片流量搬回 Supabase。
- 背景音樂：r130 owner-music 路線；不得復活舊 Supabase 音訊 CDN。
- 舊 Supabase admin/temp one-shot functions：現行 retirement policy 為 JWT + HTTP 410 tombstone，不視為可執行待辦。
- AppDeploy／Netlify 作正式站：永久取消。
- 固定九頁／四卡／23 頁報告：永久被 focused `summary/body` 契約取代。
- 舊 23:00 子初直接換日：永久取消；仍以 23:00–23:59:59 當日、00:00 後次日的現行規則為準。

## 待命推理分支

`standby/reasoning-engine-v1` 已標記 `ARCHIVED / DO NOT MERGE`。其原始概念可留作研究來源，但分支嚴重落後 current main，任何 Transformation Gate、Rule Registry、Relation Arbitrator、Evidence Graph、Prediction Ledger 都只能依當時最新 R6.2.1+、Calculation Truth 與 current runtime 逐模組重新設計、測試與驗證，不得整支 merge／rebase／復活。

## Supabase 付費視覺基建

`paid_visual_blueprints` 與 `prepare-paid-visual` 可保留為 dormant infrastructure；未來只有在 `STO-14` 明確重啟且重新通過 server-side tier/payment gate 後才可接真實 provider。文字報告永遠不得依賴圖片生成成功。

## 永久完成標準

CI／Vercel READY 只作技術證據，不能代替真 iPhone、真站主登入、真報告重開與真實 provider 成功／失敗流程。任何新 Agent 必須先看 GitHub Issue #1、本文件、Linear `STO-5`／`STO-14`／`STO-11`，不得從歷史資料另起一條執行線。
